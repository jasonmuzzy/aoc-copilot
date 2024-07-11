import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import { getExamples } from '../src/examples';
import { getPuzzle } from '../src/site';

/**
 * Run with `npm run test`
 */

const year = 2022;

describe('getExamples()', () => {
    test.each(fs.readdirSync(`./examples/${year}`, { encoding: 'utf-8' }))('%s answer', file => {
        const expecteds = JSON.parse(fs.readFileSync(`./examples/${year}/${file}`, { encoding: 'utf-8' }));
        const day = parseInt(path.parse(file).name);
        return getPuzzle(year, day).then(async html => {
            const $ = cheerio.load(html);
            const actuals = getExamples(year, day, false, $);
            expect(actuals).toEqual(expecteds);
        });
    }, 5000);
});