import { readFile } from 'node:fs/promises';
import { basename, join, normalize } from 'node:path';

import * as cheerio from 'cheerio';

import { Egdb, Example, getExamples } from './examples';
import { cookieSteps, getInput, getPuzzle, submitAnswer } from './site';

type Aidb = {
    key: string,
    selector: string,
    indexPart1: number,
    indexPart2: number,
}

type Solver = (
    inputs: string[],
    part: number,
    test: boolean,
    additionalInfo?: { [key: string]: string }
) => Promise<number | string>;

function getYearDay(filename: string) {
    const bn = basename(filename);
    if (!/^\d+$/.test(bn.substring(3, 7))) {
        throw new Error("File must be named like 'xxxYYDD*' for automatic year and day detection, e.g. 'aoc2301.js'.");
    }
    return {
        year: parseInt(`20${bn.substring(3, 5)}`),
        day: parseInt(bn.substring(5, 7))
    }
}

function preChecksPass() {
    if (!process.env.AOC_SESSION_COOKIE) {
        console.error(`
Pre-checks failed:  Missing session cookie

A session cookie is required in order to log in to the adventofcode.com site.
` + cookieSteps);
        return false;
    }
    return true;
}

function allPass(year: number, day: number, part: number, test: boolean, examples: Example[], solver: Solver) {
    return Promise.all(examples.map(eg => passes(eg.inputs, year, day, eg.part, test, solver, eg.answer, eg.additionalInfo)))
        .then(results => results.length > 0
            ? results.every(result => result == true)
            : (console.log(`Sorry, no examples found for ${year} day ${day} part ${part}`), true)
        );
}

function passes(inputs: string[], year: number, day: number, part: number, test: boolean, solver: Solver, expected: string, additionalInfo?: { [key: string]: string }): Promise<boolean> {
    const start = performance.now();
    return solver(inputs, part, test, additionalInfo).then(answer => {
        const end = performance.now();
        const elapsed = (end - start) / 1000;
        if (answer == expected) {
            console.log(`That's the right answer! ${answer} (${year} day ${day} part ${part}) (${test ? "example" : "regression"}) (${elapsed.toFixed(3)}s)`);
            return true;
        } else {
            console.log(`That's not the right answer. Expected: ${expected} actual: ${answer} (${year} day ${day} part ${part}) (${test ? "example" : "regression"}) (${elapsed.toFixed(3)}s)`);
            return false;
        }
    }).catch(error => {
        console.log("Example input:");
        for (const input of inputs) console.log(input);
        console.log(`Expected answer: ${expected}`);
        throw error;
    });
}

async function runInput(year: number, day: number, part: number, solver: Solver, examples: Example[], inputs: string[], additionalInfos: { [key: string]: string }[]) {
    if (await allPass(year, day, part, true, examples.filter(e => e.part == part), solver)) {
        const start = performance.now();
        const answer = await solver(inputs, part, false, additionalInfos[part - 1] || {});
        const end = performance.now();
        const elapsed = (end - start) / 1000;
        try {
            const cancelled = await submitAnswer(year, day, part, answer);
            if (cancelled) console.log(`Submission cancelled (${elapsed.toFixed(3)}s)`);
            else console.log(`That's the right answer! ${answer} (${year} day ${day} part ${part}) (new submission) (${elapsed.toFixed(3)}s)`);
        } catch (error) {
            console.error(error, `(${elapsed.toFixed(3)}s)`);
        }
    }
}

/**
 * Automatic runs the provided `solver` against examples and/or inputs
 * @param yearDay accepts either a string in the format 'xxxYYDD*' where YY is the 2-digit year and DD is the 2-digit day, or an object with year and day properties; intended to be used with the `__filename` parameter for files names like 'aoc2301.ts'
 * @param solver callback solver function
 * @param testsOnly if true, only runs the examples, not the inputs
 * @param addDb (optional) ad-hoc entry for the example database to override the supplied entry or add support for an as-yet unsupported day
 * @param addTests (optional) additional test cases
 * @returns 
 */
async function run(yearDay: string | { year: number, day: number }, solver: Solver, testsOnly = false, addDb?: Egdb, addTests: Example[] = []) {
    if (!preChecksPass()) return;
    const { year, day } = typeof yearDay === 'string' ? getYearDay(yearDay) : yearDay;
    const puzzle = await getPuzzle(year, day);
    const inputs = await getInput(year, day);
    const $ = cheerio.load(puzzle);
    const acceptedAnswers = $("p:contains('Your puzzle answer') > code");
    const additionalInfos: { [key: string]: string }[] = [];
    try {
        const aidbFilename = normalize(join(__dirname, '..', 'aidb', year.toString(), `${day}.json`));
        const aidb = JSON.parse(await readFile(aidbFilename, { encoding: 'utf-8' })) as Aidb
        additionalInfos.push(
            { [aidb.key]: $(aidb.selector).eq(aidb.indexPart1).text() },
            { [aidb.key]: $(aidb.selector).eq(aidb.indexPart2).text() }
        );
    } catch { }
    const examples = await getExamples(year, day, acceptedAnswers.length == 0, $, addDb, addTests);
    if (testsOnly) {
        await allPass(year, day, 1, true, examples.filter(e => e.part === 1), solver);
        if (acceptedAnswers.length > 0) await allPass(year, day, 2, true, examples.filter(e => e.part === 2), solver);
    } else if (acceptedAnswers.length == 0) {
        try {
            await runInput(year, day, 1, solver, examples, inputs, additionalInfos);
        } catch { }
    } else {
        if (await passes(inputs, year, day, 1, false, solver, acceptedAnswers.first().text(), additionalInfos[0])) {
            if (acceptedAnswers.length == 1) {
                await runInput(year, day, 2, solver, examples, inputs, additionalInfos);
            } else if (!passes(inputs, year, day, 2, false, solver, acceptedAnswers.last().text(), additionalInfos[1])) {
                await allPass(year, day, 2, true, examples.filter(e => e.part == 2), solver);
            }
        } else await allPass(year, day, 1, true, examples.filter(e => e.part == 1), solver);
    };
}

export {
    run
}