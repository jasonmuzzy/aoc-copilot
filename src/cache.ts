import { readdirSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';

// https://stackoverflow.com/a/26227660
const CACHE_DIR = join(
    process.env.CACHE_DIR ||
    process.env.LOCALAPPDATA || (process.platform == 'darwin' // APPDATA for roaming
        ? process.env.HOME + '/Library/Preferences'
        : process.env.HOME + "/.config"),
    'AoC-Copilot');

function cachedDays(subdir: 'examples' | 'puzzles') {
    return readdirSync(CACHE_DIR)
        .filter(dir => /^(?:\d{4})$/.test(dir) &&
            parseInt(dir) >= 2015 &&
            parseInt(dir) <= new Date().getFullYear() - (new Date().getMonth() < 12 ? 1 : 0))
        .map(Number)
        .sort((a, b) => a - b)
        .map(year => {
            const dir = join(CACHE_DIR, year.toString(), subdir);
            const days = readdirSync(dir, { withFileTypes: true })
                .filter(e => e.isFile() && (subdir === 'puzzles' ? /^\d+\.html$/ : /^\d+\.json$/).test(e.name))
                .map(e => ({
                    day: parseInt(parse(e.name).name),
                    path: join(dir, e.name)
                }))
                .sort((a, b) => a.day - b.day);
            return { year, days };
        });
}

async function read(filePath: string) {
    const pathname = join(CACHE_DIR, filePath);
    await mkdir(dirname(pathname), { recursive: true });
    return readFile(pathname, { encoding: 'utf-8' });
}

function remove(filePath: string) {
    const pathname = join(CACHE_DIR, filePath);
    return rm(pathname, { force: true });
}

async function write(filePath: string, data: string) {
    const pathname = join(CACHE_DIR, filePath);
    await mkdir(dirname(pathname), { recursive: true });
    return writeFile(pathname, data);
}

export {
    CACHE_DIR,
    cachedDays,
    read,
    remove,
    write
}