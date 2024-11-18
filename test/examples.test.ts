import { readdirSync, readFileSync } from 'fs';
import path from 'path';

import * as cheerio from 'cheerio';

import { getExamples } from '../src/examples';
import { getPuzzle } from '../src/site';

/**
 * Run with `npm run test` or `npx jest examples.test.ts`
 */

describe.each([2018, 2019, 2020, 2021, 2022, 2023])('%d', year => {
    return test.each(readdirSync(`./examples/${year}`, { encoding: 'utf-8' }).sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0])))('%s answer', async (file) => { //, done: jest.DoneCallback) => { // adding the done parameter causes Jest to just spin forever
        const expecteds = JSON.parse(readFileSync(`./examples/${year}/${file}`, { encoding: 'utf-8' }));
        const day = parseInt(path.parse(file).name);
        const puzzle = await getPuzzle(year, day);
        const $ = cheerio.load(puzzle);
        const actuals = await getExamples(year, day, false, $);
        expect(actuals).toEqual(expecteds);
    }, 5000);
}, 10000);
