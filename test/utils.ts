import fs from 'node:fs/promises';

import { Egdb } from '../src/examples';
import { isNumChar } from '../src/site';

// Prints all the colors in the terminal
function printColors() {
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 10; j++) {
            const n = 10 * i + j;
            if (n > 108) break;
            process.stdout.write(`\x1b[${n}m ${n.toString().padStart(3, ' ')}\x1b[0m`);
        }
        console.log();
    }
}
// printColors();

// Find arrays, literals and functions in egdb
async function findLiterals() {
    const years = (await fs.readdir('./egdb')).filter(year => isNumChar(year)).map(year => parseInt(year)).sort((a, b) => a - b);
    for (const year of years) {
        const days = (await fs.readdir(`./egdb/${year}`))
            .map(file => file.substring(0, file.indexOf('.')))
            .filter(file => isNumChar(file))
            .map(file => parseInt(file))
            .sort((a, b) => a - b);
        for (const day of days) {
            const egdb = JSON.parse(await fs.readFile(`./egdb/${year}/${day}.json`, { encoding: 'utf-8' })) as Egdb;
            egdb.inputs.indexes.forEach((v, i) => {
                if (typeof v === 'string') console.log(`inputs ${year} day ${day} index ${i}: "${v}"`);
                if (Array.isArray(v)) console.log(`inputs ${year} day ${day} index ${i}: "${JSON.stringify(v)}"`);
            });
            if (!!egdb.inputs.transforms) console.log(`inputs ${year} day ${day}: "${JSON.stringify(egdb.inputs.transforms)}"`);
            egdb.answers.indexesOrLiterals.forEach((v, i) => {
                if (typeof v === 'string') console.log(`answers ${year} day ${day} index ${i}: "${v}"`);
                if (Array.isArray(v)) console.log(`answers ${year} day ${day} index ${i}: "${JSON.stringify(v)}"`);
            });
            if (!!egdb.answers.transforms) console.log(`answers ${year} day ${day}: "${JSON.stringify(egdb.answers.transforms)}"`);
            egdb.additionalInfos?.indexes.forEach((v, i) => {
                if (typeof v === 'string') console.log(`additionalInfos ${year} day ${day} index ${i}: "${v}"`);
                if (Array.isArray(v)) console.log(`additionalInfos ${year} day ${day} index ${i}: "${JSON.stringify(v)}"`);
            });
            if (!!egdb.additionalInfos?.transforms) console.log(`additionalInfos ${year} day ${day}: "${JSON.stringify(egdb.additionalInfos.transforms)}"`);
        }
    };
}
// findLiterals().then(() => console.log('Done')).catch(error => console.error(error));