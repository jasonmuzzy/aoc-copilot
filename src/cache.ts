import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

// https://stackoverflow.com/a/26227660
const HOME_DIR =
    process.env.LOCALAPPDATA // LOCALAPPDATA for local, APPDATA for roaming
    || (process.platform == 'darwin'
        ? process.env.HOME + '/Library/Preferences'
        : process.env.HOME + "/.config")
const SUB_DIR = 'AoC-Copilot';

async function read(filePath: string) {
    const pathname = join(HOME_DIR, SUB_DIR, filePath);
    await mkdir(dirname(pathname), { recursive: true });
    return readFile(pathname, { encoding: 'utf-8' });
}

async function write(filePath: string, data: string) {
    const pathname = join(HOME_DIR, SUB_DIR, filePath);
    await mkdir(dirname(pathname), { recursive: true });
    return writeFile(pathname, data);
}

export {
    read,
    write
}