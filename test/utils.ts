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

// Write out example files
// import * as cheerio from 'cheerio';
// import fs from 'fs';
// import { getExamples } from '../src/examples';
// import { getPuzzle } from '../src/site';
// for (let day = 5; day <= 10; ++day) {
//     getPuzzle(2020, day).then(puzzle => {
//         const $ = cheerio.load(puzzle);
//         getExamples(2020, day, false, $).then(examples =>
//             fs.writeFileSync(`./examples/2020/${day}.json`, JSON.stringify(examples), { encoding: "utf-8" })
//         );
//     });
// }

// Get examples
// import * as cheerio from 'cheerio';
// import { getExamples } from './examples';
// import { getPuzzle } from './site';
// getPuzzle(2020, 2).then(puzzle => {
//     const $ = cheerio.load(puzzle);
//     getExamples(2020, 2, false, $).then(example => console.log(example));
// });

// Test submission rate limiting
// import { submitAnswer } from "./site";
// async function test() {
//     for (let i = 26; i < 100; i++) {
//         try {
//             const res = await submitAnswer(2020, 7, 2, i.toString(), true); // after 3rd guess wait goes to 5 minutes, after 7th guess wait goes to 10 minutes, after 11th guess wait goes to 15 minutes
//             console.log(res);
//         } catch(err) {
//             console.error(err);
//         }
//     }
// }
// test().then(() => console.log('done')).catch(err => console.error(err));