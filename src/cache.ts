import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// https://stackoverflow.com/a/26227660
const CACHE_DIR = join(
    process.env.LOCALAPPDATA || (process.platform == 'darwin' // APPDATA for roaming
        ? process.env.HOME + '/Library/Preferences'
        : process.env.HOME + "/.config"),
    'AoC-Copilot');

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
    read,
    remove,
    write
}