import { basename } from 'node:path';

import * as cheerio from 'cheerio';

import { Egdb, Example, getExamples } from './examples';
import { Options } from './options';
import { cookieSteps, getInput, getPuzzle, hms, Incorrect, submitAnswer } from './site';

class NotImplemented extends Error {
    name: string;
    constructor(message: string) {
        super(message);
        this.name = 'NotImplemented';
    }
}

type Solver = (
    inputs: string[],
    part: number,
    test: boolean,
    additionalInfo?: { [key: string]: string }
) => Promise<number | bigint | string>;

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

async function allPass(year: number, day: number, part: number, test: boolean, examples: Example[], solver: Solver) {
    let allPassed = true, passed = false;
    if (examples.length === 0) console.log(`Sorry, no examples found for ${year} day ${day} part ${part}`);
    for (let example of examples) {
        try {
            passed = await passes(example.inputs, year, day, example.part, test, solver, example.answer, example.additionalInfo);
        } catch (err) {
            passed = false;
        }
        if (!passed) allPassed = false;
    }
    return allPassed;;
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
        if (error?.name === 'NotImplemented') {
            console.log("\nExample input:");
            for (const input of inputs) console.log(input);
            if (additionalInfo !== undefined) {
                console.log(`\nAdditional info:\n${Object.entries(additionalInfo).map(([k, v]) => `${k}: ${v}`).join('\n')}`)
            }
            console.log(`\nExpected answer: ${expected}`);
            return false;
        } else {
            console.error(error);
            throw error;
        }
    });
}

async function runInput(year: number, day: number, part: number, solver: Solver, examples: Example[], inputs: string[], skipTests: boolean, forceSubmit: boolean) {
    if (skipTests || await allPass(year, day, part, true, examples.filter(e => e.part == part), solver)) {
        const start = performance.now();
        const answer = await solver(inputs, part, false);
        const end = performance.now();
        const elapsed = (end - start) / 1000;
        try {
            const { cancelled, response, dayStats } = await submitAnswer(year, day, part, answer, forceSubmit);
            if (cancelled) console.log(`Submission cancelled (${elapsed.toFixed(3)}s)`);
            else {
                console.log(`That's the right answer! ${answer} (${year} day ${day} part ${part}) (new submission) (${elapsed.toFixed(3)}s)`);
                const timeToFinish = part === 1
                    ? Date.parse(dayStats!.part1Finished) - Date.parse(dayStats!.part1Started)
                    : Date.parse(dayStats!.part2Finished) - Date.parse(dayStats!.part1Finished);
                console.log(`It took you ${hms(timeToFinish)} to finish (started ${new Date(part === 1 ? dayStats!.part1Started : dayStats!.part1Finished)})`);
                if (day === 25) {
                    const $ = cheerio.load(response!);
                    if (parseInt($('span[class="star-count"]').text() || '0*') < 49) {
                        console.log(`You don't seem to have enough stars to complete day 25 (https://adventofcode.com/${year}/day/25) so go check your advent calendar (https://adventofcode.com/${year}) for unfinished days!`);
                    } else {
                        console.log(`You have 49 stars, now go get that last one (https://adventofcode.com/${year}/day/25)!`);
                    }
                }
            }
        } catch (error) {
            if ((error as Incorrect)?.name === 'Incorrect') {
                console.log(`Incorrect: ${(error as Incorrect).message} (${elapsed.toFixed(3)}s)`);
            } else {
                console.error(error, `(${elapsed.toFixed(3)}s)`);
            }
        }
    }
}

/**
 * Automatic runs the provided `solver` against examples and/or inputs
 * @param yearDay accepts either a string in the format 'xxxYYDD*' where YY is the 2-digit year and DD is the 2-digit day, or an object with year and day properties; intended to be used with the `__filename` parameter for files names like 'aoc2301.ts'
 * @param solver callback solver function
 * @param options (optional) run tests or inputs only, or only part 1 or 2
 * @param addDb (optional) ad-hoc entry for the example database to override the supplied entry or add support for an as-yet unsupported day
 * @param addTests (optional) additional test cases
 * @returns
 */
async function run(yearDay: string | { year: number, day: number }, solver: Solver, options: boolean | Options = false, addDb?: Egdb, addTests: Example[] = []) {
    if (!preChecksPass()) return;
    if (typeof options === 'object' && options.testsOnly && options.skipTests) throw new Error('Cannot specify both testsOnly and skipTests');
    const runOptions = {
        testsOnly: typeof options === 'boolean' ? options : (options.testsOnly ?? false),
        skipTests: typeof options === 'boolean' ? false : !!options.skipTests,
        runPart1: typeof options === 'boolean' ? true : (options.onlyPart ?? 1) === 1,
        runPart2: typeof options === 'boolean' ? true : (options.onlyPart ?? 2) === 2,
        forceSubmit: typeof options === 'boolean' ? false : !!options.forceSubmit,
    }
    const { year, day } = typeof yearDay === 'string' ? getYearDay(yearDay) : yearDay;
    let puzzle = await getPuzzle(year, day);
    const inputs = await getInput(year, day);
    let $ = cheerio.load(puzzle);
    const acceptedAnswers = $("p:contains('Your puzzle answer') > code");
    const examples = await getExamples(year, day, acceptedAnswers.length == 0, $, addDb, addTests);
    if (runOptions.testsOnly) {
        if (runOptions.runPart1) await allPass(year, day, 1, true, examples.filter(e => e.part === 1), solver);
        if (runOptions.runPart2 && acceptedAnswers.length > 0 && day != 25) await allPass(year, day, 2, true, examples.filter(e => e.part === 2), solver);
    } else if (acceptedAnswers.length == 0) {
        if (runOptions.runPart1) await runInput(year, day, 1, solver, examples, inputs, runOptions.skipTests, runOptions.forceSubmit);
    } else {
        if (!runOptions.runPart1 || await passes(inputs, year, day, 1, false, solver, acceptedAnswers.first().text())) {
            if (day === 25) {
                let stars = parseInt($('span[class="star-count"]').text() || '0*');
                if (stars === 49) {
                    puzzle = await getPuzzle(year, day, true);
                    $ = cheerio.load(puzzle);
                    stars = parseInt($('span[class="star-count"]').text() || '0*');
                }
                if (stars < 49) {
                    console.log(`You don't seem to have enough stars to complete day 25 (https://adventofcode.com/${year}/day/25) so go check your advent calendar (https://adventofcode.com/${year}) for unfinished days!`);
                } else if (stars === 49) {
                    console.log(`You have 49 stars, now go get that last one (https://adventofcode.com/${year}/day/25)!`);
                } else if (stars === 50) {
                    console.log(`Congratulations on completing Advent of Code ${year}!  You can go admire your advent calendar (https://adventofcode.com/${year})!`);
                }
            } else if (runOptions.runPart2) {
                if (acceptedAnswers.length == 1) {
                    await runInput(year, day, 2, solver, examples, inputs, runOptions.skipTests, runOptions.forceSubmit);
                } else if (!(await passes(inputs, year, day, 2, false, solver, acceptedAnswers.last().text()))) {
                    await allPass(year, day, 2, true, examples.filter(e => e.part == 2), solver);
                }
            }
        } else if (runOptions.runPart1) await allPass(year, day, 1, true, examples.filter(e => e.part == 1), solver);
    };
}

export {
    NotImplemented,
    run
}
