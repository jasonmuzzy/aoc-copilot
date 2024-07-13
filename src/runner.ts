import cheerio from 'cheerio';
import path from 'path';

import aidb from './aidb.json';
import { Db, Example, getExamples } from './examples';
import { getInput, getPuzzle, submitAnswer } from "./site";

type Solver = (
    inputs: string[],
    part: number,
    test: boolean,
    additionalInfo?: { [key:string]: string }
) => Promise<number | string>;

function getYearDay(filename: string) {
    const basename = path.basename(filename);
    if (!/^\d+$/.test(basename.substring(3, 7))) {
        throw new Error("File must be named like 'xxxYYDD*' for automatic year and day detection, e.g. 'aoc2301.js'.");
    }
    return {
        year: parseInt(`20${basename.substring(3, 5)}`),
        day: parseInt(basename.substring(5, 7))
    }
}

function preChecksPass() {
    if (!process.env.AOC_SESSION_COOKIE) {
        console.error(`
Pre-checks failed:  Missing session cookie

A session cookie is required in order to log in to the adventofcode.com site.
In Chromium-based browsers like Chrome and Edge you can obtain your cookie by
visiting the site, logging in, opening developer tools, and clicking on
Application then expanding Cookies under the Storage section, locating the
adventofcode.com cookie, and copying the session value.

Then, add the following line to a .env file in the root of the project:
AOC_SESSION_COOKIE="session=<your session cookie value>"
`);
        return false;
    }
    return true;
}

function allPass(year: number, day: number, part: number, test: boolean, examples: Example[], solver: Solver) {
    return Promise.all(examples.map(eg => passes(eg.inputs, year, day, eg.part, test, solver, eg.answer, eg.additionalInfo)))
        .then(results => {
            if (results.length > 0) return results.every(result => result == true)
            else {
                console.log(`Sorry, no examples found for ${year} day ${day} part ${part}`);
                return true
            }
        });
}

async function passes(inputs: string[], year: number, day: number, part: number, test: boolean, solver: Solver, expected: string, additionalInfo?: { [key:string]: string }) {
    let answer: number | string = 0;
    const start = performance.now();
    try {
        answer = await solver(inputs, part, test, additionalInfo);
    } catch (error) {
        console.log("Example input:");
        for (const input of inputs) console.log(input);
        console.log(`Expected answer: ${expected}`);
        throw error;
    }
    const end = performance.now();
    const elapsed = (end - start) / 1000;
    if (answer == expected) {
        console.log(`That's the right answer! ${answer} (${year} day ${day} part ${part}) (${test ? "example" : "regression"}) (${elapsed.toFixed(3)}s)`);
        return true;
    } else {
        console.log(`That's not the right answer. Expected: ${expected} actual: ${answer} (${year} day ${day} part ${part}) (${test ? "example" : "regression"}) (${elapsed.toFixed(3)}s)`);
        return false;
    }
}

/**
 * Automatic runs the provided `solver` against examples and/or inputs
 * @param yearDay accepts either a string in the format 'xxxYYDD*' where YY is the 2-digit year and DD is the 2-digit day, or an object with year and day properties; intended to be used with the `__filename` parameter for files names like 'aoc2301.ts'
 * @param solver callback solver function
 * @param testsOnly if true, only runs the examples, not the inputs
 * @param addDb (optional) additional entries for the examples database, e.g. to add support for as-yet unsupported years or days
 * @param addTests (optional) additional test cases
 * @returns 
 */
async function run(yearDay: string | { year: number, day: number }, solver: Solver, testsOnly = false, addDb: Db = [], addTests: Example[] = []) {
    if (!preChecksPass()) return;
    const { year, day } = typeof yearDay === 'string' ? getYearDay(yearDay) : yearDay;
    Promise.all([getPuzzle(year, day), getInput(year, day)]).then(async ([puzzle, inputs]) => {
        const $ = cheerio.load(puzzle);
        const acceptedAnswers = $("p:contains('Your puzzle answer') > code");
        const additionalInfos = aidb
            .filter(ai => ai.year === year && ai.day === day)
            .reduce<{ [key:string]: string }[]>((pv, cv) => pv = [
                { [cv.key]: $(cv.selector).eq(cv.indexPart1).text() },
                { [cv.key]: $(cv.selector).eq(cv.indexPart2).text() }
            ], []);
        const examples = getExamples(year, day, acceptedAnswers.length == 0, $, addDb, addTests);
        if (testsOnly) {
            await allPass(year, day, 1, true, examples.filter(e => e.part === 1), solver);
            if (acceptedAnswers.length > 0) await allPass(year, day, 2, true, examples.filter(e => e.part === 2), solver);
        } else if (acceptedAnswers.length == 0) {
            if (await allPass(year, day, 1, true, examples.filter(e => e.part == 1), solver)) {
                const answer = await solver(inputs, 1, false, additionalInfos[0] || {});
                try {
                    await submitAnswer(year, day, 1, answer);
                    console.log(`That's the right answer! ${answer} (${year} day ${day} part 1) (new submission)`);
                } catch (error) {
                    console.error(error);
                }
            }
        } else {
            if (await passes(inputs, year, day, 1, false, solver, acceptedAnswers.first().text(), additionalInfos[0])) {
                if (acceptedAnswers.length == 1) {
                    if (await allPass(year, day, 2, true, examples.filter(e => e.part == 2), solver)) {
                        const answer = await solver(inputs, 2, false, additionalInfos[1] || {});
                        try {
                            await submitAnswer(year, day, 2, answer);
                            console.log(`That's the right answer! ${answer} (${year} day ${day} part 2) (new submission)`);
                        } catch (error) {
                            console.error(error);
                        }
                    }
                } else if (!passes(inputs, year, day, 2, false, solver, acceptedAnswers.last().text(), additionalInfos[1])) {
                    allPass(year, day, 2, true, examples.filter(e => e.part == 2), solver);
                }
            } else allPass(year, day, 1, true, examples.filter(e => e.part == 1), solver);
        }
    });
}

export {
    run
}