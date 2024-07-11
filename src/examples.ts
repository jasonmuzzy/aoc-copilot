import egdb from './egdb.json';

/**
 * TODO:
 * - 2022/19 multiply indexes 8*10 for part 2 answer
 * - 2022/24 no example input
 * - 2023/10 part 1 example 2 answer is shown, but not isolated (work-around: pick from other index that happens to have the same value)
 * - 2023/20 no part 2 example (show a message?)
 * - 2023/21 need extra info (number of steps) available at example indexes [15, 26, 28, 30, 32, 34, 36, 38] and input indexes [0, 21]
 */

type Db = typeof egdb;

type Example = {
    part: number,
    inputs: string[],
    answer: string
}

function getExampleInputs($: cheerio.Root) {
    const largerEgs = $("p:contains('larger example') + pre code");
    let largerEg: cheerio.Cheerio | undefined;
    for (let i = 0; i < largerEgs.length; ++i) {
        if (largerEgs.eq(i).parent().prev('p').text().endsWith('larger example:')) {
            largerEg = largerEgs.eq(i);
            break;
        }
    }
    if (largerEg) return largerEg;
    const eg = $("p:contains('example')").nextAll("pre").find('code'); //$("p:contains('example') + pre code");
    if (eg.length > 0) return eg.first();
    else return $('article pre code').first();
}

function getExamples(year: number, day: number, part1only: boolean, $: cheerio.Root, addDb: Db = [], addTests: Example[] = []) {
    const db = egdb.concat(addDb).find(e => e.year === year && e.day === day);
    const examples: Example[] = [];
    if (db) {
        if (db.inputs.indexes.length !== db.answers.indexes.length)
            throw new Error(`Inconsistency detected in egdb.json: lengths of inputs.indexes and answers.indexes differs for year ${year} day ${day}`);
        const inputs = $(db.inputs.selector);
        const answers = $(db.answers.selector);
        db.inputs.indexes.filter((v, i) => !part1only || i < db.part1length).forEach((index, i) => {
            examples.push({
                part: i < db.part1length ? 1 : 2,
                inputs: inputs.eq(index).text().split('\n'),
                answer: (() => {
                    const answer = answers.eq(db.answers.indexes[i]).text();
                    if (answer.includes('\n')) {
                        const answers = answer.split('\n');
                        while (answers.at(-1) == '') answers.pop();
                        if (year == 2021 && day == 13) while (answers.at(-1) == '.....') answers.pop();
                        return answers.join('\n');
                    } else return answer;
                })()
            });
        });
    } else {
        const inputs = getExampleInputs($).text().split('\n');
        const answer1 = $('article:first p code em').length == 0 // <code><em> tags swapped
            ? $('article:first p em code').last().text()
            : $('article:first p code em').last().text();
        examples.push({ part: 1, inputs, answer: answer1 });
        if (day != 25 && !part1only) {
            const answer2 = $('article:last p code em').length == 0
                ? $('article:last p em code').last().text()
                : $('article:last p code em').last().text();
            examples.push({ part: 2, inputs, answer: answer2 });
        }
    }
    for (const test of addTests) examples.push(test);
    for (const eg of examples) while (eg.inputs.at(-1) === '') eg.inputs.pop();
    return examples;
}

export {
    Db,
    Example,
    getExamples
}