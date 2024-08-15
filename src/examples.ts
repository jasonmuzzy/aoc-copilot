import { readFile } from "node:fs/promises";
import { join, normalize } from 'node:path';

type Egdb = {
    reason: string,
    part1length: number,
    inputs: {
        selector: string,
        indexes: number[] | number[][],
    },
    answers: {
        selector: string,
        indexesOrLiterals: (number | string)[],
    },
    additionalInfos?: {
        key: string,
        selector: string,
        indexes: number[],
    }
}

type Example = {
    part: number,
    inputs: string[],
    answer: string,
    additionalInfo?: { [key: string]: string }
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

async function getExamples(year: number, day: number, part1only: boolean, $: cheerio.Root, addDb?: Egdb, addTests: Example[] = []) {
    const examples: Example[] = [];
    try {
        const egdbFilename = normalize(join(__dirname, '..', 'egdb', year.toString(), `${day}.json`));
        const egdb: Egdb = addDb || JSON.parse(await readFile(egdbFilename, { encoding: 'utf-8' })); // User-supplied DB takes precedence
        if (egdb.inputs.indexes.length !== egdb.answers.indexesOrLiterals.length) {
            throw new Error(`Inconsistency detected in egdb: lengths of inputs.indexes and answers.indexes differs for year ${year} day ${day}`);
        }
        if (egdb.additionalInfos && egdb.inputs.indexes.length !== egdb.additionalInfos.indexes.length) {
            throw new Error(`Inconsistency detected in egdb: lengths of inputs.indexes and additionalInfos.indexes differs for year ${year} day ${day}`);
        }
        const inputs = $(egdb.inputs.selector);
        const answers = egdb.answers.selector === egdb.inputs.selector
            ? inputs
            : $(egdb.answers.selector);
        const additionalInfos = egdb.additionalInfos
            ? egdb.additionalInfos.selector === egdb.inputs.selector
                ? inputs
                : egdb.additionalInfos.selector === egdb.answers.selector
                    ? answers
                    : $(egdb.additionalInfos.selector)
            : undefined;
        egdb.inputs.indexes.filter((v, i) => !part1only || i < egdb.part1length).forEach((inputIndex, i) => {
            examples.push({
                part: i < egdb.part1length ? 1 : 2,
                inputs: typeof inputIndex === 'number'
                    ? inputs.eq(inputIndex).text().split('\n')
                    : inputIndex.reduce((pv, cv) => (pv.push(...inputs.eq(cv).text().split('\n')), pv), [] as string[]),
                answer: (() => {
                    const answer = typeof egdb.answers.indexesOrLiterals[i] === 'string'
                        ? egdb.answers.indexesOrLiterals[i] as string
                        : answers.eq(egdb.answers.indexesOrLiterals[i] as number).text();
                    if (answer.includes('\n')) {
                        const answers = answer.split('\n');
                        while (answers.at(-1) == '') answers.pop();
                        return answers.join('\n');
                    } else return answer;
                })(),
                ...(egdb.additionalInfos) && { additionalInfo: { [egdb.additionalInfos.key]: additionalInfos!.eq(egdb.additionalInfos.indexes[i]).text() } }
            });
        });
    } catch {
        const answer = (part: number) => {
            const elements = $(`article:${part === 1 ? 'first' : 'last'} p:has(em,code)`).find("em,code").find("em,code");
            return elements.length < 2
                ? elements.text()
                : elements.eq([...elements].map((e, i) => ({ e, score: (/^\d+$/.test(elements.eq(i).text()) ? 1 : 0) + (e.prev === null ? 1 : 0), i })).sort((a, b) => a.score === b.score ? b.i - a.i : b.score - a.score)[0].i).text();
        }
        const inputs = getExampleInputs($).text().split('\n');
        examples.push({ part: 1, inputs, answer: answer(1) }); // No additionalInfo for generically determined examples
        if (day != 25 && !part1only) {
            examples.push({ part: 2, inputs, answer: answer(2) });
        }
    }
    for (const test of addTests) examples.push(test);
    for (const eg of examples) while (eg.inputs.at(-1) === '') eg.inputs.pop();
    return examples;
}

export {
    Egdb,
    Example,
    getExamples
}