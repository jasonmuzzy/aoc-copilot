#!/usr/bin/env node
import * as cheerio from 'cheerio';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { CACHE_DIR } from './cache';
import { getInput, getPuzzle, validateYearDay } from './site'

yargs(hideBin(process.argv))
    .command(['index <year> <day> [selector]', 'search'], 'list the indexes and values of a selector within a puzzle; useful for searching for examples', (yargs) => {
        return yargs
            .positional('year', {
                describe: 'Puzzle year to index',
                type: 'number'
            })
            .positional('day', {
                describe: 'Puzzle day to index',
                type: 'number'
            })
            .positional('selector', {
                describe: 'jQuery-style selector',
                type: 'string',
                default: 'code'
            });
    }, async (argv) => {
        if (argv.verbose) console.info(argv);
        try {
            await validateYearDay(argv.year, argv.day);
        } catch (err) {
            console.error((err as Error).message);
            return;
        }
        console.info(`Puzzle ${argv.year} day ${argv.day} indexes matching selector '${argv.selector}':`);
        const puzzle = await getPuzzle(argv.year!, argv.day!);
        const $ = cheerio.load(puzzle);
        const selections = $(argv.selector);
        for (let i = 0; i < selections.length; i++) {
            const text = selections.eq(i).html()?.includes('<br>') ? selections.eq(i).html()!.replaceAll('<br>', '\n') : selections.eq(i).text();
            console.info(`\x1b[36m${i.toString().padStart(3, '0') + ': '}\x1b[0m ${text.includes('\n') ? '\n' + text : text}`);
        }
    })
    .command(['refresh <year> <day>', 'download'], 'Force refresh of a cached file', (yargs) => {
        return yargs
            .positional('year', {
                describe: 'Year to refresh',
                type: 'number'
            })
            .positional('day', {
                describe: 'Day to refresh',
                type: 'number'
            })
            .option('puzzle', {
                alias: 'p',
                describe: 'refresh puzzle',
                type: 'boolean',
                default: true
            })
            .option('input', {
                alias: 'i',
                describe: 'refresh input',
                type: 'boolean',
                default: false
            });
    }, (argv) => {
        if (argv.verbose) console.info(argv);
        try {
            validateYearDay(argv.year, argv.day);
        } catch (err) {
            console.error((err as Error).message);
            return;
        }
        if (argv.puzzle) {
            process.stdout.write(`Refresh puzzle ${argv.year} day ${argv.day}... `);
            getPuzzle(argv.year!, argv.day!, true).then(() => console.info('Done'));
        }
        if (argv.input) {
            process.stdout.write(`Refresh input ${argv.year} day ${argv.day}... `);
            getInput(argv.year!, argv.day!, true).then(() => console.info('Done'));
        }
    })
    .command('cache', 'Print cache location', () => { }, () => {
        console.info(`Cache location: ${CACHE_DIR}`);
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .example([
        ['$0 index 2020 13', 'index puzzle year 2020 day 13 for default selector \'code\''],
        ['$0 index 2023 10 em', 'index puzzle year 2023 day 10 for selector \'em\''],
        ['$0 refresh 2022 5', 'refresh puzzle year 2022 day 5'],
        ['$0 refresh 2021 4 -i', 'refresh puzzle and input for year 2021 day 4'],
        ['$0 refresh 2023 10 --no-puzzle -i', 'refresh input only for year 2023 day 10']
    ])
    .parse()