import { read, write } from './cache';

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

export {
    Stats,
    startPart1,
    finish,
    avoidedAttempt,
    incorrectAttempt,
    solvedElsewhere
}