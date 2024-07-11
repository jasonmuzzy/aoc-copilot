// Prints all the colors in the terminal
// for (let i = 0; i < 11; i++) {
//     for (let j = 0; j < 10; j++) {
//         const n = 10 * i + j;
//         if (n > 108) break;
//         process.stdout.write(`\x1b[${n}m ${n.toString().padStart(3, ' ')}\x1b[0m`);
//     }
//     console.log();
// }

// Rename files from one thing to another
// import fs from 'fs';
// import path from 'path';
// const dir = path.join(process.env.LOCALAPPDATA!, 'AoC-Copilot', '2023', 'inputs');
// fs.readdirSync(dir).forEach(file => {
//     fs.renameSync(path.join(dir, file), path.join(dir, parseInt(path.parse(file).name).toString()));
// });

// List out the indexes of the <code> blocks for a puzzle
import cheerio from 'cheerio';
import { getPuzzle } from "./site";
getPuzzle(2023, 21).then(puzzle => {
    const $ = cheerio.load(puzzle);
    const selections = $('code');
    for (let i = 0; i < selections.length; i++) {
        const text = selections.eq(i).text();
        console.log(`\x1b[36m${i.toString().padStart(3, '0') + ': '}\x1b[0m ${text.includes('\n') ? '\n' + text : text}`)
    }
});