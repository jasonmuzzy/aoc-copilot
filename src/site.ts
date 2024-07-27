import { IncomingHttpHeaders } from 'node:http';
import { encode } from 'node:querystring'
import { createInterface } from 'node:readline/promises';

import { load } from 'cheerio';

import { read, write } from './cache';
import { request } from './httpsPromisfied';

const cookieSteps = `
In Chromium-based browsers like Chrome and Edge you can obtain your cookie by
visiting the site, logging in, opening developer tools (F12), and clicking
Application then expanding Cookies under the Storage section, locating the
adventofcode.com cookie, and copying the session value.

Then, add the following line to a .env file in the root of your project:
AOC_SESSION_COOKIE="session=<your session cookie value>"

NOTE: Protect your session ID!  For example, add .env to your .gitignore file.
`;

const errExpiredSessionCookie = `
Expired Session Cookie

Your session cookie seems to have expired or is no longer valid.  Please
retrieve a new session ID and update your .env file.
` + cookieSteps;

function validateYearDay(year: number, day: number) {
    const now = new Date();
    const est = new Date(now.getTime() + (now.getTimezoneOffset() -300) * 60 * 1000);
    if (year < 2015 ||
        year > est.getFullYear() ||
        day < 1 ||
        day > 25 ||
        (year === est.getFullYear() && est.getMonth() < 12) ||
        (year === est.getFullYear() && est.getMonth() === 12 && est.getDate() < day)
    ) {
        throw new Error(`You don't seem to be solving a valid year/day ("${year}"/"${day}")`);
    }
}

async function getCalendar(year: number) {
    validateYearDay(year, 1);
    const calendar = await request('GET', `/${year}`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE);
    console.log(`Local time  ${new Date().toString()}`);
    console.log(`Server time ${new Date(calendar.headers.date || '').toString()}`);
    await write(`${year}/calendar.html`, calendar.body);
    await write(`${year}/headers.json`, JSON.stringify(calendar.headers, null, 4));
    return calendar;
}

async function getInput(year: number, day: number, forceRefresh = false) {
    validateYearDay(year, day);
    let inputs: string[] = [];
    try {
        if (forceRefresh) throw new Error('Force refresh');
        const input = await read(`${year}/inputs/${day}`);
        inputs = input.split('\n');
    } catch (err) {
        const { headers, body: input } = await request('GET', `/${year}/day/${day}/input`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE);
        if (input === 'Puzzle inputs differ by user.  Please log in to get your puzzle input.\n') throw new Error(errExpiredSessionCookie);
        inputs = input.split('\n');
        while (inputs.at(-1) === '') inputs.pop();
        await write(`${year}/inputs/${day}`, inputs.join('\n'));
    }
    return inputs;
}

async function getPuzzle(year: number, day: number, forceRefresh = false) {
    validateYearDay(year, day);
    let puzzle = '';
    try {
        if (forceRefresh) throw new Error('Force refresh');
        puzzle = await read(`${year}/puzzles/${day}.html`);
    } catch (err) {
        let headers: IncomingHttpHeaders;
        ({ headers, body: puzzle } = await request('GET', `/${year}/day/${day}`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE));
        await write(`${year}/puzzles/${day}.html`, puzzle);
    } finally {
        const $ = load(puzzle);
        const login = $(`a[href="/${year}/auth/login"]`);
        if (login.length > 0) throw new Error(errExpiredSessionCookie);
    }
    return puzzle;
}

function ms(wait: string) {
    // Observed wait times:
    // After 1st guess:  one minute
    // After 3rd guess:  5 minutes
    // After 7th guess:  10 minutes
    // After 11th guess: 15 minutes
    let unit = '';
    let time = 0;
    wait.split(' ').reverse().forEach((e, i) => {
        if (i % 2 === 0) unit = e;
        else {
            const n = e === 'one' ? 1 : parseInt(e);
            if (unit.includes('minute')) time += n * 60 * 1000;
            else if (unit.includes('hour')) time += n * 60 * 60 * 1000;
            else if (unit.includes('day')) time += n * 24 * 60 * 60 * 1000;
        }
    });
    return time;
}

function sleep(ms = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

async function countdown(until: Date): Promise<void> {
    let remaining = until.getTime() - Date.now();
    if (remaining > 0) {
        console.log();
        while (remaining > 0) {
            process.stdout.write(`\rWaiting \x1b[101m${(remaining / 1000).toFixed(0).padStart(3, ' ')}\x1b[0ms... `);
            await sleep(remaining > 1000 ? 1000 : remaining);
            remaining = until.getTime() - Date.now();
        }
        console.log('\rWaiting \x1b[102m  0\x1b[0ms... Done');
    }
}

async function submitAnswer(year: number, day: number, part: number, answer: number | string, yes = false): Promise<boolean> {
    validateYearDay(year, day);

    // Get answers file
    const filename = `${year}/answers/${day}.json`;
    let answers: { part: number, answer: string, correct: boolean, timestamp: string, wait?: string }[];
    try {
        answers = JSON.parse(await read(filename));
    } catch (err) {
        answers = [];
    }
    const partAnswers = answers.filter(a => a.part === part);

    // Check against previously submitted answers
    const correct = partAnswers.find(a => a.correct);
    if (correct) throw new Error(`Already submitted correct answer ${correct.answer} for ${year} day ${day} part ${part} on ${correct.timestamp}`);
    const duplicate = partAnswers.find(a => a.answer === answer.toString());
    if (duplicate) throw new Error(`Already submitted incorrect answer ${duplicate.answer} for ${year} day ${day} part ${part} on ${duplicate.timestamp}`);

    // Prompt user to confirm submission
    const prompt = `\nSubmit ${year} day ${day} part ${part} answer ${answer} (y/N)? `;
    if (yes) console.log(prompt, 'y');
    else {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const userInput = await rl.question(prompt);
        rl.close();
        if (userInput.toLowerCase() != 'y') return true; // Cancelled
    }

    // Wait after last incorrect submission
    type LastSubmission = { year: number, day: number, part: number, answer: string, correct: boolean, timestamp: string, wait: string };
    const lastSubmission = JSON.parse(await read('lastSubmission.json')) as LastSubmission;
    if (!lastSubmission.correct) {
        const lastTs = new Date(lastSubmission.timestamp);
        const until = new Date(lastTs.getTime() + ms(lastSubmission.wait));
        if (until.getTime() > Date.now()) {
            console.log(`\nRate limiting on the adventofcode.com site requires waiting a variable amount of time after submitting an incorrect ` +
                `answer.  You submitted incorrect answer "${lastSubmission.answer}" for ${lastSubmission.year} day ${lastSubmission.day} part ` +
                `${lastSubmission.part} on ${lastTs.toString()}, requiring you to wait ${lastSubmission.wait} until ${until.toString()} ` +
                `before submitting another answer for any puzzle.`);
            await countdown(until);
        }
    }

    // Submit the answer
    const path = `/${year}/day/${day}/answer`;
    const formData = encode({
        level: part,
        answer: answer
    });
    let { headers, body: response } = await request('POST', path, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE, formData);
    let timestamp = new Date().toJSON();
    await write(`${year}/lastPOSTResponse.html`, response);
    let $ = load(response);

    // Check if answer was given too soon
    const tooSoon = 'You gave an answer too recently';
    if ($(`p:contains('${tooSoon}')`).length > 0) {
        const msg = $(`p:contains('${tooSoon}')`).text();
        console.log(msg);
        // E.g. "You gave an answer too recently; you have to wait after submitting an answer before trying again.  You have 14m 59s left to wait. [Return to Day 7]"
        const match = msg.match(/\d+(?=d|h|m|s)/gm);
        if (match) {
            const [s, m = 0, h = 0, d = 0] = match.reverse().map(e => parseInt(e)); // Does it ever go beyond minutes?  Who knows!
            await countdown(new Date(Date.now() + (s + m * 60 + h * 60 * 60 + d * 24 * 60 * 60) * 1000));
            // Resubmit
            ({ headers, body: response } = await request('POST', path, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE, formData));
            timestamp = new Date().toJSON();
            $ = load(response);
        } else {
            throw new Error(msg);
        }
    }

    // Check for correct answer
    const alreadySolved = "You don't seem to be solving the right level";
    // Correct answer
    if ($('span.day-success').length > 0) {
        await write('lastSubmission.json', JSON.stringify({ year, day, part, answer: answer.toString(), correct: true, timestamp, wait: '' } as LastSubmission));
        answers.push({ part, answer: answer.toString(), correct: true, timestamp });
        await write(filename, JSON.stringify(answers));
        await getPuzzle(year, day, true);
        return false; // Not cancelled
    } else if ($(`p:contains('${alreadySolved}')`).length > 0) {
        // Solving wrong level - happens due to a sync issue e.g. when the player submits an answer through the website directly unbeknownst to this copilot
        await getPuzzle(year, day, true)
        throw new Error($(`p:contains('${alreadySolved}')`).text());
    }
    const wait = /Please wait (?<wait>.*) before trying again\./gi.exec($('article p').text())?.groups?.wait;
    await write('lastSubmission.json', JSON.stringify({ year, day, part, answer: answer.toString(), correct: false, timestamp, wait } as LastSubmission));
    answers.push({ part, answer: answer.toString(), correct: false, timestamp, wait });
    await write(filename, JSON.stringify(answers));
    throw new Error($('article p').text());

};

export {
    cookieSteps,
    getCalendar,
    getInput,
    getPuzzle,
    submitAnswer
}