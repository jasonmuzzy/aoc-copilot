import { readFileSync } from 'node:fs';

import * as cheerio from 'cheerio';

import { cachedDays } from '../src/cache';
import { getExamples } from '../src/examples';
import { getPuzzle } from '../src/site';

/**
 * Run with `npm run test` or `npx jest examples.test.ts`
 */

describe.each(cachedDays('examples'))('Year: $year', ({ year, days }) => {
    return test.each(days)('Day: $day', async ({ day, path }) => {
        const expecteds = JSON.parse(readFileSync(path, { encoding: 'utf8' }));
        const puzzle = await getPuzzle(year, day);
        const $ = cheerio.load(puzzle);
        const actuals = await getExamples(year, day, false, $);
        expect(actuals).toEqual(expecteds);
    }, 5000);
}, 10000);
