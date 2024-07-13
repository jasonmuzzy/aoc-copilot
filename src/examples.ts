import egdb from './egdb.json';

type Db = typeof egdb;

type Example = {
    part: number,
    inputs: string[],
    answer: string,
    additionalInfo?: { [key:string]: string }
}

function getExampleInputs($: cheerio.Root) {
    const largerEgs = $("p:contains('larger example'),p:contains('complex example') + pre code");
    let largerEg: cheerio.Cheerio | undefined;
    for (let i = 0; i < largerEgs.length; ++i) {
        if (largerEgs.eq(i).parent().prev('p').text().endsWith('larger example:') ||
            largerEgs.eq(i).parent().prev('p').text().endsWith('complex example:')) {
            largerEg = largerEgs.eq(i);
            break;
        }
    }
    if (largerEg) return largerEg;
    const eg = $("p:contains('example')").nextAll("pre").find('code');
    if (eg.length > 0) return eg.first();
    else return $('article pre code').first();
}

function getExamples(year: number, day: number, part1only: boolean, $: cheerio.Root, addDb: Db = [], addTests: Example[] = []) {
    const db = addDb.concat(egdb).find(e => e.year === year && e.day === day); // User-supplied DB takes precedence
    const examples: Example[] = [];
    if (db) {
        if (db.inputs.indexes.length !== db.answers.indexesOrLiterals.length) {
            throw new Error(`Inconsistency detected in egdb.json: lengths of inputs.indexes and answers.indexes differs for year ${year} day ${day}`);
        }
        if (db.additionalInfos && db.inputs.indexes.length !== db.additionalInfos.indexes.length) {
            throw new Error(`Inconsistency detected in egdb.json: lengths of inputs.indexes and additionalInfos.indexes differs for year ${year} day ${day}`);
        }
        const inputs = $(db.inputs.selector);
        const answers = db.answers.selector === db.inputs.selector
            ? inputs
            : $(db.answers.selector);
        const additionalInfos = db.additionalInfos
            ? db.additionalInfos.selector === db.inputs.selector
                ? inputs
                : db.additionalInfos.selector === db.answers.selector
                    ? answers
                    : $(db.additionalInfos.selector)
            : undefined;
        db.inputs.indexes.filter((v, i) => !part1only || i < db.part1length).forEach((inputIndex, i) => {
            examples.push({
                part: i < db.part1length ? 1 : 2,
                inputs: inputs.eq(inputIndex).text().split('\n'),
                answer: (() => {
                    const answer = typeof db.answers.indexesOrLiterals[i] === 'string'
                        ? db.answers.indexesOrLiterals[i]
                        : answers.eq(db.answers.indexesOrLiterals[i]).text();
                    if (answer.includes('\n')) {
                        const answers = answer.split('\n');
                        while (answers.at(-1) == '') answers.pop();
                        return answers.join('\n');
                    } else return answer;
                })(),
                additionalInfo: db.additionalInfos ? { [db.additionalInfos.key]: additionalInfos!.eq(db.additionalInfos.indexes[i]).text() } : undefined
            });
        });
    } else {
        const inputs = getExampleInputs($).text().split('\n');
        const answer1 = $('article:first p code em').length == 0 // <code><em> tags swapped
            ? $('article:first p em code').last().text()
            : $('article:first p code em').last().text();
        examples.push({ part: 1, inputs, answer: answer1 }); // No additionalInfo for generically determined examples
        if (day != 25 && !part1only) {
            const answer2 = $('article:last p code em').length == 0
                ? $('article:last p em code').last().text()
                : $('article:last p code em').last().text();
            examples.push({ part: 2, inputs, answer: answer2 }); // No additionalInfo for generically determined examples
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