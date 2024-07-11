import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

// https://stackoverflow.com/a/26227660
const HOME_DIR =
    process.env.LOCALAPPDATA // LOCALAPPDATA for local, APPDATA for roaming
    || (process.platform == 'darwin'
        ? process.env.HOME + '/Library/Preferences'
        : process.env.HOME + "/.config")
const SUB_DIR = 'AoC-Copilot';

function read(filePath: string) {
    const pathname = join(HOME_DIR, SUB_DIR, filePath);
    return mkdir(dirname(pathname), { recursive: true }).then(() => {
        return readFile(pathname, { encoding: 'utf-8' });
    });
}

function write(filePath: string, data: string) {
    const pathname = join(HOME_DIR, SUB_DIR, filePath);
    return mkdir(dirname(pathname), { recursive: true }).then(() => {
        return writeFile(pathname, data);
    });
}

export {
    read,
    write
}