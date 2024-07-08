import egdb from './egdb.json';

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
        if (largerEgs.eq(i).parent().prev("p").text().endsWith("larger example:")) {
            largerEg = largerEgs.eq(i);
            break;
        }
    }
    if (largerEg) return largerEg;
    const eg = $("p:contains('example') + pre code");
    if (eg.length > 0) return eg.first();
    else return $("article pre code").first();
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
                inputs: inputs.eq(index).text().split("\n"),
                answer: answers.eq(db.answers.indexes[i]).text()
            });
        });
    } else {
        const inputs = getExampleInputs($).text().split('\n');
        const answer1 = $("article:first p code em").length == 0 // <code><em> tags swapped
            ? $("article:first p em code").last().text()
            : $("article:first p code em").last().text();
        examples.push({ part: 1, inputs, answer: answer1 });
        if (!part1only) {
            const answer2 = $("article:last p code em").length == 0
                ? $("article:last p em code").last().text()
                : $("article:last p code em").last().text();
            examples.push({ part: 2, inputs, answer: answer2 });
        }
    }
    for (const test of addTests) examples.push(test);
    for (const eg of examples) while (eg.inputs.at(-1) === "") eg.inputs.pop();
    return examples;
}

export {
    Db,
    Example,
    getExamples
}