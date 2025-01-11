#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';

import * as cheerio from 'cheerio';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { CACHE_DIR } from './cache';
import { defaultSearchStrategy } from './examples';
import { getInput, getLeaderboard, getPuzzle, validateYearDay } from './site'
import { print, sync } from './stats';

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
                describe: 'jQuery-style selector (defaults to "code")',
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
        const dss = defaultSearchStrategy($);
        const selections = $(argv.selector);
        for (let i = 0; i < selections.length; i++) {
            const text = selections.eq(i).html()?.includes('<br>') ? selections.eq(i).html()!.replaceAll('<br>', '\n') : selections.eq(i).text();
            const article = selections.eq(i).closest('article');
            const part = article.length === 0 ? 0 : article.find('h2').attr('id') === 'part2' ? 2 : 1;
            let matches = '';
            if (part === 1 && text === dss.inputs) matches = 'Inputs';
            else if (part === 1 && text === dss.answer1) matches = 'Part 1 Answer';
            else if (part === 2 && text === dss.answer2) matches = 'Part 2 Answer';
            if (matches.length > 0) matches = `\x1b[36m<<< Matches Default Search Strategy for ${matches}\x1b[0m`;
            console.info(`\x1b[36m${i.toString().padStart(3, '0') + ': '}\x1b[0m ${text.includes('\n') ? matches + '\n' + text : text + '  ' + matches}`);
        }
    })
    .command(['refresh <file> <year> [day]', 'download'], 'Refresh (re-download) a cached file.  NOTE:  Leaderboard refresh is throttled to once every 15 minutes.', (yargs) => {
        return yargs
            .positional('file', {
                choices: ['puzzle', 'input', 'leaderboard'],
                describe: 'File to refresh',
                type: 'string'
            })
            .positional('year', {
                describe: 'Year to refresh',
                type: 'number'
            })
            .positional('day', {
                describe: 'Day to refresh',
                type: 'number'
            })
            .option('leaderboard-id', {
                alias: 'l',
                describe: 'Leaderboard ID (defaults to LEADERBOARD_ID from .env file if not supplied)',
                type: 'string'
            });
    }, async (argv) => {
        if (argv.verbose) console.info(argv);
        let leaderboardId = '';
        if (argv.file === 'puzzle') {
            process.stdout.write(`Refresh puzzle ${argv.year} day ${argv.day}... `);
            getPuzzle(argv.year!, argv.day!, true).then(() => console.info('Done'));
        } else if (argv.file === 'input') {
            process.stdout.write(`Refresh input ${argv.year} day ${argv.day}... `);
            getInput(argv.year!, argv.day!, true).then(() => console.info('Done'));
        } else if (argv.file === 'leaderboard') {
            try {
                await validateYearDay(argv.year, argv.file === 'leaderboard' ? 1 : argv.day);
                if (argv['leaderboard-id']) leaderboardId = argv['leaderboard-id'];
                if (!leaderboardId) leaderboardId = process.env.LEADERBOARD_ID ?? '';
                if (!leaderboardId) throw new Error(`Specify --leaderboard-id or populate LEADERBOARD_ID in .env file`);
            } catch (err) {
                console.error((err as Error).message);
                return;
            }
            process.stdout.write(`Refresh leaderboard ${argv.year} ID ${leaderboardId}... `);
            getLeaderboard(argv.year!, leaderboardId, true).then(() => console.info('Done'));
        }
    })
    .command(['stats-print <year>'], 'Print statistics', (yargs) => {
        return yargs
            .positional('year', {
                describe: 'Year',
                type: 'number'
            });
    }, async (argv) => {
        if (argv.verbose) console.info(argv);
        try {
            await validateYearDay(argv.year, 1);
        } catch (err) {
            console.error((err as Error).message);
            return;
        }
        print(argv.year!);
    })
    .command(['stats-sync <year> [leaderboard-id] [member-id]'], 'Sync local statistics with leaderboard', (yargs) => {
        return yargs
            .positional('year', {
                describe: 'Year',
                type: 'number'
            })
            .option('leaderboard-id', {
                alias: 'l',
                describe: 'Leaderboard ID (defaults to LEADERBOARD_ID from .env file if not supplied)',
                type: 'string'
            })
            .option('member-id', {
                alias: 'm',
                describe: 'Member ID (optional; defaults to Leaderboard ID)',
                type: 'string'
            })
            .option('refresh', {
                alias: 'r',
                describe: 'Refresh the leaderboard first (if possible, throttled to once every 15 minutes)',
                type: 'boolean',
                default: true
            });
    }, async (argv) => {
        if (argv.verbose) console.info(argv);
        let leaderboardId = '';
        try {
            await validateYearDay(argv.year, 1);
            if (argv['leaderboard-id']) leaderboardId = argv['leaderboard-id'];
            if (!leaderboardId) leaderboardId = process.env.LEADERBOARD_ID ?? '';
            if (!leaderboardId) throw new Error(`Specify --leaderboard-id or populate LEADERBOARD_ID in .env file`);
        } catch (err) {
            console.error((err as Error).message);
            return;
        }
        process.stdout.write(`Synchronizing ${argv.year} local stats using leaderboard ID ${leaderboardId}${argv["member-id"] ? ` and member ID ${argv["member-id"]}` : ''}... `);
        sync(argv.year!, leaderboardId, argv['member-id'], argv['refresh']).then(() => console.info('Done'));
    })
    .command(['leaderboard-to-csv <year> [leaderboard-id] [filename] [refresh]'], 'Transform leaderboard to CSV', (yargs) => {
        return yargs
            .positional('year', {
                describe: 'Year',
                type: 'number'
            })
            .option('leaderboard-id', {
                alias: 'l',
                describe: 'Leaderboard ID (defaults to LEADERBOARD_ID from .env file if not supplied)',
                type: 'string'
            })
            .option('filename', {
                alias: 'f',
                describe: 'Filename',
                type: 'string'
            })
            .option('refresh', {
                alias: 'r',
                describe: 'Refresh the leaderboard first (if possible, throttled to once every 15 minutes)',
                type: 'boolean',
                default: true
            });
    }, async (argv) => {
        if (argv.verbose) console.info(argv);
        let leaderboardId = '';
        try {
            await validateYearDay(argv.year, 1);
            if (argv['leaderboard-id']) leaderboardId = argv['leaderboard-id'];
            if (!leaderboardId) leaderboardId = process.env.LEADERBOARD_ID ?? '';
            if (!leaderboardId) throw new Error(`Specify --leaderboard-id or populate LEADERBOARD_ID in .env file`);
        } catch (err) {
            console.error((err as Error).message);
            return;
        }
        const filename = argv.filename ?? `leaderboard_${leaderboardId}_${argv.year}.csv`;
        process.stdout.write(`Converting ${argv.year} leaderboard ID ${leaderboardId} to CSV and writing to file ${filename}... `);
        const leaderboard = await getLeaderboard(argv.year!, leaderboardId, argv.refresh);
        // Transform the leaderboard JSON into a sorted, tabular format, assigning places (rank)
        const times = Object.values(leaderboard.members).map(member =>
            Object.entries(member.completion_day_level).map(([day, stars]) => [
                member.id.toString(),
                member.name.includes(',') ? `"${member.name}"` : member.name,
                day,
                stars["1"].get_star_ts.toString(),
                stars["2"]?.get_star_ts.toString()
            ])
        ).flat();
        let place = 0;
        // Part 1
        const csv = times.map(time => [...time.slice(0, 3), '1', time[3]] as string[])
            // plus Part 2
            .concat(times.filter(time => time[4] !== undefined).map(time => [...time.slice(0, 3), '2', time[4]] as string[]))
            // sorted by day, part, time completed then name
            .sort((a, b) => parseInt(a[2]) < parseInt(b[2]) ? -1 : parseInt(a[2]) > parseInt(b[2]) ? 1 : a[3] < b[3] ? -1 : a[3] > b[3] ? 1 : a[4] < b[4] ? -1 : a[4] > b[4] ? 1 : a[1] < b[1] ? -1 : 1)
            // enriched with calculated place (rank)
            .map((v, i, a) => [...v, i === 0 || v[2] !== a[i - 1][2] || v[3] !== a[i - 1][3] ? (place = 1, place) : ++place])
            .map(row => row.join(',')).join('\n');
        // With headings
        writeFile(filename, ['ID', 'Name', 'Day', 'Part', 'Completed', 'Place'].join(',') + '\n' + csv, { encoding: 'utf-8' }).then(() => console.info('Done'));
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
        ['$0 index 2023 10 "code, em"', 'index puzzle year 2023 day 10 for selector "code, em"'],
        ['$0 refresh puzzle 2022 5', 'refresh puzzle year 2022 day 5'],
        ['$0 refresh input 2021 4', 'refresh input for year 2021 day 4'],
        ['$0 refresh stats 2023 10', 'refresh stats for year 2023 day 10'],
        ['$0 stats-print 2024', 'print stats for 2024'],
        ['$0 stats-sync 2024 --leaderboard-id 1234567 --member-id 9876543', 'sync local stats with 2024 leaderboard 1234567 member 9876543'],
        ['$0 stats-sync 2024', 'sync local stats with 2024 leaderboard specified in .env file'],
        ['$0 leaderboard-to-csv 2024 --leaderboard-id 1234567 --filename leaderboard.csv', 'save leaderboard 2024 ID 1234567 as CSV-formatted file leaderboard.csv']
    ])
    .parse()