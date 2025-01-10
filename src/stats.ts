import { read, write } from './cache';
import { getLeaderboard, hms } from './site';

type Stats = {
    day: number,
    part1Started: string,
    part1Finished: string,
    part2Finished: string,
    part1AvoidedAttempts: number,
    part2AvoidedAttempts: number,
    part1IncorrectAttempts: number,
    part2IncorrectAttempts: number,
    part1SolvedElsewhere: boolean,
    part2SolvedElsewhere: boolean
}

function readStatsFile(year: number): Promise<Stats[]> {
    return read(`${year}/stats.json`)
        .then(file => JSON.parse(file) as Stats[])
        .catch(() => []);
}

function getDayStats(stats: Stats[], day: number) {
    return stats.find(stat => stat.day === day) || (stats.push({ day, part1Started: '', part1Finished: '', part2Finished: '', part1AvoidedAttempts: 0, part2AvoidedAttempts: 0, part1IncorrectAttempts: 0, part2IncorrectAttempts: 0, part1SolvedElsewhere: false, part2SolvedElsewhere: false }), stats.at(-1)!);
}

function updateStatsFile(year: number, stats: Stats[]) {
    return write(`${year}/stats.json`, JSON.stringify(stats));;
}

async function startPart1(year: number, day: number) {
    const stats = await readStatsFile(year);
    const dayStats = getDayStats(stats, day);
    if (dayStats.part1Started === '') dayStats.part1Started = new Date().toJSON();
    return updateStatsFile(year, stats);
}

async function finish(year: number, day: number, part: number) {
    const stats = await readStatsFile(year);
    const dayStats = getDayStats(stats, day);
    const timestamp = new Date().toJSON();
    if (part === 1 && dayStats.part1Finished === '') dayStats.part1Finished = timestamp;
    else if (part === 2 && dayStats.part2Finished === '') dayStats.part2Finished = timestamp;
    await updateStatsFile(year, stats);
    return dayStats;
}

async function avoidedAttempt(year: number, day: number, part: number) {
    const stats = await readStatsFile(year);
    const dayStats = getDayStats(stats, day);
    if (part === 1) dayStats.part1AvoidedAttempts++;
    else dayStats.part2AvoidedAttempts++;
    return updateStatsFile(year, stats);
}

async function incorrectAttempt(year: number, day: number, part: number) {
    const stats = await readStatsFile(year);
    const dayStats = getDayStats(stats, day);
    if (part === 1) dayStats.part1IncorrectAttempts++;
    else dayStats.part2IncorrectAttempts++;
    return updateStatsFile(year, stats);
}

async function solvedElsewhere(year: number, day: number, part: number) {
    const stats = await readStatsFile(year);
    const dayStats = getDayStats(stats, day);
    const timestamp = new Date().toJSON();
    if (part === 1) {
        dayStats.part1SolvedElsewhere = true;
        if (dayStats.part1Finished === '') dayStats.part1Finished = timestamp;
    } else {
        dayStats.part2SolvedElsewhere = true;
        if (dayStats.part2Finished === '') dayStats.part2Finished = timestamp;
    }
    return updateStatsFile(year, stats);
}

async function print(year: number) {
    const stats = await readStatsFile(year);
    const times = stats.map(stat => [
        stat.day.toString().padStart(3, ' '),
        stat.part1Finished === '' ? '' : hms(Date.parse(stat.part1Finished) - Date.parse(stat.part1Started)),
        stat.part2Finished === '' ? '' : hms(Date.parse(stat.part2Finished) - Date.parse(stat.part1Finished))
    ]) as [string, string, string][];

    // Print table
    const width1 = times.reduce((pv, cv) => Math.max(pv, cv[1].length), 6);
    const width2 = times.reduce((pv, cv) => Math.max(pv, cv[2].length), 6);
    const col1 = '-'.repeat(Math.ceil((width1 - 6) / 2)) + 'Part 1' + '-'.repeat(Math.floor((width1 - 6) / 2));
    const col2 = '-'.repeat(Math.ceil((width2 - 6) / 2)) + 'Part 2' + '-'.repeat(Math.floor((width2 - 6) / 2));
    console.log(`Day   ${col1}   ${col2}`);
    times.toReversed().forEach(time => console.log(`${time[0]}   ${time[1].padStart(width1, ' ')}   ${time[2].padStart(width2, ' ')}`));
}

/**
 * Sync local stats file to site leaderboard service
 * @param year Year
 * @param id Leaderboard ID
 * @param memberId (optional) Member ID; defaults to same as Leaderboard ID
 */
async function sync(year: number, id: string, memberId = id, syncIfPossible = false) {
    const stats = await readStatsFile(year);
    const leaderboard = await getLeaderboard(year, id, syncIfPossible);
    for (let [day, stars] of Object.entries(leaderboard.members[memberId].completion_day_level)) {
        const stat = getDayStats(stats, parseInt(day));
        for (let [part, star] of Object.entries(stars)) {
            if (part === '1') stat.part1Finished = new Date(star.get_star_ts * 1000).toJSON();
            else if (part === '2') stat.part2Finished = new Date(star.get_star_ts * 1000).toJSON();
        }
    }
    await updateStatsFile(year, stats);
}

export {
    avoidedAttempt,
    finish,
    incorrectAttempt,
    print,
    solvedElsewhere,
    startPart1,
    Stats,
    sync
}