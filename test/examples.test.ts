import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import { getExamples } from '../src/examples';
import { getPuzzle } from '../src/site';

/**
 * Run with `npm run test`
 */

describe('getExamples()', () => {
    describe('2021', () => {
        const year = 2021;
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

    describe('2022', () => {
        const year = 2022;
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

    describe('2023', () => {
        const year = 2023;
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
})