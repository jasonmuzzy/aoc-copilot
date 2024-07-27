#!/usr/bin/env node
import * as cheerio from 'cheerio';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getInput, getPuzzle } from '../src/site'

yargs(hideBin(process.argv))
    .command(['index', 'search'], 'list the indexes and values of a selector within a puzzle; useful for searching for examples', (yargs) => {
        return yargs
            .positional('year', {
                describe: 'Puzzle year to index',
                type: 'number',
                default: 2020
            })
            .positional('day', {
                describe: 'Puzzle day to index',
                type: 'number',
                default: 1
            })
            .positional('selector', {
                describe: 'jQuery-style selector',
                type: 'string',
                default: 'code'
            })
    }, (argv) => {
        if (argv.verbose) console.info(`Index ${argv.year} day ${argv.day} selector '${argv.selector}':`)
        getPuzzle(argv.year, argv.day).then(puzzle => {
            const $ = cheerio.load(puzzle);
            const selections = $(argv.selector);
            for (let i = 0; i < selections.length; i++) {
                const text = selections.eq(i).text();
                console.log(`\x1b[36m${i.toString().padStart(3, '0') + ': '}\x1b[0m ${text.includes('\n') ? '\n' + text : text}`)
            }
        });
    })
    .command(['refresh', 'download'], 'Force refresh of a cached file', (yargs) => {
        return yargs
            .positional('year', {
                describe: 'Year to refresh',
                type: 'number',
                default: 2020
            })
            .positional('day', {
                describe: 'Day to refresh',
                type: 'number',
                default: 1
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
            })
    }, (argv) => {
        if (argv.puzzle) {
            if (argv.verbose) process.stdout.write(`Refresh puzzle ${argv.year} day ${argv.day}... `)
            getPuzzle(argv.year, argv.day, true).then(() => argv.verbose && console.log('Done'));
        }
        if (argv.input) {
            if (argv.verbose) process.stdout.write(`Refresh input ${argv.year} day ${argv.day}... `)
            getInput(argv.year, argv.day, true).then(() => argv.verbose && console.log('Done'));
        }
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