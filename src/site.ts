import { encode } from 'node:querystring'
import { createInterface } from 'node:readline/promises';

import { load } from 'cheerio';

import { read, write } from './cache';
import { cookieSteps, errExpiredSessionCookie, request } from './httpsPromisfied';
import * as stats from './stats';

class Incorrect extends Error {
    name: string;
    constructor(message: string) {
        super(message);
        this.name = 'Incorrect';
    }
}

function isNumChar(ne: any) {
    return String(ne).split('').every(c => '0123456789'.includes(c));
}

async function validateYearDay(year: any, day: any) {
    const drop = new Date(`${day} Dec ${year} 00:00:00 EST`);
    if (!isNumChar(year) ||
        !isNumChar(day) ||
        year < 2015 ||
        day < 1 ||
        day > 25
    ) {
        throw new Error(`Invalid year/day ("${year}"/"${day}")`);
    } else if (drop.valueOf() > Date.now()) {
        console.log(`\nNeed to wait until puzzle drops on ${drop}`);
        await countdown(drop);
    }
}

async function getInput(year: number, day: number, forceRefresh = false) {
    await validateYearDay(year, day);
    let inputs: string[] = [];
    try {
        if (forceRefresh) throw new Error('Force refresh');
        const input = await read(`${year}/inputs/${day}`);
        inputs = input.split('\n');
        while (inputs.at(-1) === '') inputs.pop();
    } catch (err) {
        const { body: input } = await request('GET', `/${year}/day/${day}/input`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE);
        if (input === 'Puzzle inputs differ by user.  Please log in to get your puzzle input.\n') throw new Error(errExpiredSessionCookie);
        inputs = input.split('\n');
        while (inputs.at(-1) === '') inputs.pop();
        await write(`${year}/inputs/${day}`, inputs.join('\n'));
    }
    return inputs;
}

interface Leaderboard {
    members: {
        [key: string]: {
            id: number,
            name: string,
            stars: number,
            local_score: number,
            global_score: number,
            last_star_ts: number,
            completion_day_level: {
                [key: string]: {
                    [key: string]: {
                        star_index: number,
                        get_star_ts: number
                    }
                }
            }
        }
    }
}

async function getLeaderboard(year: number, id: string, refreshIfPossible = false) {
    await validateYearDay(year, 1);
    let isPossible = false;
    if (refreshIfPossible) {
        try {
            const elapsed = Date.now() - parseInt(await read(`lastLeaderboardRequest.json`));
            if (elapsed >= 900000) isPossible = true;
        } catch (err) {
            isPossible = true;
        }
    }
    let json = '';
    try {
        if (refreshIfPossible && isPossible) throw new Error('Force refresh');
        json = await read(`${year}/${id}.json`);
    } catch (err) {
        const { body: json } = await request('GET', `${year}/leaderboard/private/view/${id}.json`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE);
        await write(`${year}/${id}.json`, json);
        await write(`lastLeaderboardRequest.json`, Date.now().toString());
    }
    return JSON.parse(json) as Leaderboard;
}

async function getPuzzle(year: number, day: number, forceRefresh = false) {
    await validateYearDay(year, day);
    let puzzle = '';
    try {
        if (forceRefresh) throw new Error('Force refresh');
        puzzle = await read(`${year}/puzzles/${day}.html`);
    } catch (err) {
        ({ body: puzzle } = await request('GET', `/${year}/day/${day}`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE));
        const $ = load(puzzle);
        const login = $(`a[href="/${year}/auth/login"]`);
        if (login.length > 0) throw new Error(errExpiredSessionCookie);
        await write(`${year}/puzzles/${day}.html`, puzzle);
        await stats.startPart1(year, day);
    }
    // Get stylesheet for preview
    const [sitev] = (puzzle.match(/(?<=style.css\?)\d+/g) ?? ['']);
    const cachev = await (async () => {
        try {
            return await read('/static/version');
        } catch {
            return '';
        }
    })();
    if (cachev != sitev) { // Get CSS if it doesn't exist or is an older version
        const { body: css } = await request('GET', `/static/style.css?${sitev}`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE);
        await write(`static/style.css`, css);
        await write(`static/version`, sitev);
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

function hms(ms: number) {
    let hrs = Math.floor(ms / 1000 / 60 / 60);
    ms -= hrs * 60 * 60 * 1000;
    let mins = Math.floor(ms / 1000 / 60);
    ms -= mins * 60 * 1000;
    let secs = Math.floor(ms / 1000);
    return `${hrs.toFixed(0).padStart(2, '0')}:${mins.toFixed(0).padStart(2, '0')}:${secs.toFixed(0).padStart(2, '0')}`
}

async function countdown(until: Date): Promise<void> {
    let remaining = until.getTime() - Date.now();
    if (remaining > 0) {
        console.log();
        while (remaining > 0) {
            process.stdout.write(`\rWaiting \x1b[101m${hms(remaining)}\x1b[0m... `);
            await sleep(remaining > 1000 ? 1000 : remaining);
            remaining = until.getTime() - Date.now();
        }
        console.log('\rWaiting \x1b[102m00:00:00\x1b[0m... Done');
    }
}

async function submitAnswer(year: number, day: number, part: number, answer: number | bigint | string, yes = false): Promise<{ cancelled: boolean, response?: string, dayStats?: stats.Stats }> {
    await validateYearDay(year, day);

    // Get answers file
    const filename = `${year}/answers/${day}.json`;
    let answers: { part: number, answer: string | bigint, correct: boolean, timestamp: string, problem?: string, wait?: string }[];
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
    if (duplicate) {
        await stats.avoidedAttempt(year, day, part);
        throw new Incorrect(`Already submitted ${duplicate.problem ?? 'incorrect'} answer ${duplicate.answer} for ${year} day ${day} part ${part} on ${duplicate.timestamp}`);
    }
    if (typeof answer === 'number' || typeof answer === 'bigint') {
        const tooLows = partAnswers.filter(a => a.problem === 'too low').sort((a, b) => { const d = BigInt(b.answer) - BigInt(a.answer); return d < 0n ? -1 : d === 0n ? 0 : 1 });
        if (tooLows.length > 0 && answer < BigInt(tooLows[0].answer)) {
            await stats.avoidedAttempt(year, day, part);
            throw new Incorrect(`${answer} is too low because it's less than ${tooLows[0].answer} which was too low for ${year} day ${day} part ${part} on ${tooLows[0].timestamp}`);
        }
        const tooHighs = partAnswers.filter(a => a.problem === 'too high').sort((a, b) => {const d = BigInt(a.answer) - BigInt(b.answer); return d < 0n ? -1 : d === 0n ? 0 : 1 });
        if (tooHighs.length > 0 && answer > BigInt(tooHighs[0].answer)) {
            await stats.avoidedAttempt(year, day, part);
            throw new Incorrect(`${answer} is too high because it's greater than ${tooHighs[0].answer} which was too high for ${year} day ${day} part ${part} on ${tooHighs[0].timestamp}`);
        }
    }

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
        if (userInput.toLowerCase() != 'y') return { cancelled: true };
    }

    // Wait after last incorrect submission
    type LastSubmission = { year: number, day: number, part: number, answer: string, correct: boolean, timestamp: string, wait: string };
    let lastSubmission: LastSubmission;
    try {
        lastSubmission = JSON.parse(await read('lastSubmission.json'));
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
    } catch (error) {
        lastSubmission = { year, day, part, answer: '', correct: false, timestamp: '', wait: '' };
    }

    // Submit the answer
    const answerStr = typeof answer === 'string' ? answer : answer.toString(10);
    const path = `/${year}/day/${day}/answer`;
    const formData = encode({
        level: part,
        answer: answerStr
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
        const dayStats = await stats.finish(year, day, part);
        return { cancelled: false, response, dayStats };
    } else if ($(`p:contains('${alreadySolved}')`).length > 0) {
        // Solving wrong level - happens due to a sync issue e.g. when the player submits an answer through the website directly unbeknownst to AoCC
        await getPuzzle(year, day, true)
        await stats.solvedElsewhere(year, day, part);
        throw new Error($(`p:contains('${alreadySolved}')`).text());
    }
    const { problem, wait } = /That's not the right answer(\.|; your answer is (?<problem>.*?)\.).*lease wait (?<wait>(one|\d+) minutes?)/g.exec($('article p').text())?.groups as { problem?: string, wait: string };
    await write('lastSubmission.json', JSON.stringify({ year, day, part, answer: answer.toString(), correct: false, timestamp, problem, wait } as LastSubmission));
    answers.push({ part, answer: answer.toString(), correct: false, timestamp, problem, wait });
    await write(filename, JSON.stringify(answers));
    await stats.incorrectAttempt(year, day, part);
    throw new Incorrect($('article p').text());

};

export {
    cookieSteps,
    getInput,
    getLeaderboard,
    getPuzzle,
    hms,
    Incorrect,
    isNumChar,
    Leaderboard,
    sleep,
    submitAnswer,
    validateYearDay
}
