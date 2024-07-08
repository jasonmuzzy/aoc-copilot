import cheerio from "cheerio";
import querystring from "querystring"
import * as readline from "readline/promises";

import { read, write } from './cache';
import { request } from './httpsPromisfied';

function getInput(year: number, day: number) {
    return read(`inputs/${year}/${day}`)
        .then(input => input.split('\n'))
        .catch(() => {
            return request('GET', `/${year}/day/${day}/input`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE)
                .then(input => {
                    const inputs = input.split('\n');
                    while (inputs.at(-1) === "") inputs.pop();
                    return write(`inputs/${year}/${day}`, inputs.join('\n'))
                        .then(() => inputs)
                });
        });
}

function getPuzzle(year: number, day: number, forceRefresh = false): Promise<string> {
    return (forceRefresh
        ? new Promise<string>((resolve, reject) => reject())
        : read(`puzzles/${year}/${day}.html`)
    ).catch(() => {
        return request('GET', `/${year}/day/${day}`, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE)
            .then(html => write(`puzzles/${year}/${day}.html`, html)
                .then(() => html));
    });
}

function submitAnswer(year: number, day: number, part: number, answer: number | string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return rl.question(`Submit ${year} day ${day} part ${part} answer ${answer} (y/N)? `)
        .then(userInput => {
            rl.close();
            if (userInput.toLowerCase() != "y") throw new Error("Submission cancelled");
            const path = `/${year}/day/${day}/answer`;
            const formData = querystring.encode({
                level: part,
                answer: answer
            });
            return request('POST', path, process.env.AOC_SESSION_COOKIE, process.env.CERTIFICATE, formData);
        }).then(html => {
            const $ = cheerio.load(html);
            const alreadySolved = 'You don\'t seem to be solving the right level';
            if ($('span.day-success').length > 0) {
                return getPuzzle(year, day, true);
            } else if ($(`p:contains('${alreadySolved}')`).length > 0) {
                return getPuzzle(year, day, true).then(() => { throw new Error($(`p:contains('${alreadySolved}')`).text()); });
            }
            throw new Error($("article p").text());
        });
};

export {
    getInput,
    getPuzzle,
    submitAnswer
}