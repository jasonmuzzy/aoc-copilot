import { readFile } from "node:fs/promises";
import { join, normalize } from 'node:path';

import * as fx from './fx';

type Egdb = {
    reason: string,
    part1length: number,
    inputs: {
        selector: string,
        indexes: (number | number[])[],
        transforms?: {
            functions: fx.Fx[],
            appliesTo: number[]
        }[],
    },
    answers: {
        selector: string,
        indexesOrLiterals: (number | number[] | string)[],
        transforms?: {
            functions: fx.Fx[],
            appliesTo: number[]
        }[],
    },
    additionalInfos?: {
        key: string,
        selector: string,
        indexes: number[],
        transforms?: {
            functions: fx.Fx[],
            appliesTo: number[]
        }[],
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
    const eg = $("p:contains('xample'):contains(':')").nextAll("pre").find('code');
    if (eg.length > 0) return eg.first();
    else return $('article pre code').first();
}

async function getExamples(year: number, day: number, part1only: boolean, $: cheerio.Root, addDb?: Egdb, addTests: Example[] = []) {
    const examples: Example[] = [];
    let internalError = false;
    try {
        const egdbFilename = normalize(join(__dirname, '..', 'egdb', year.toString(), `${day}.json`));
        const egdb: Egdb = addDb || JSON.parse(await readFile(egdbFilename, { encoding: 'utf-8' })); // User-supplied DB takes precedence
        if (egdb.inputs.indexes.length !== egdb.answers.indexesOrLiterals.length) {
            internalError = true;
            throw new Error(`Inconsistency detected in egdb: lengths of inputs.indexes and answers.indexes differs for year ${year} day ${day}`);
        }
        if (egdb.additionalInfos && egdb.inputs.indexes.length !== egdb.additionalInfos.indexes.length) {
            internalError = true;
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
                inputs: (() => {
                    let result: string[] = [];
                    result = typeof inputIndex === 'number'
                        ? inputs.eq(inputIndex).html()?.includes('<br') ? inputs.eq(inputIndex).html()!.split('<br>') : inputs.eq(inputIndex).text().split('\n')
                        : inputIndex.reduce((pv, cv) => (pv.push(...inputs.eq(cv).text().split('\n')), pv), [] as string[]);
                    const transform = egdb.inputs.transforms?.find(tx => tx.appliesTo.includes(i));
                    if (!!transform) {
                        const output = fx.interpolate(result, transform.functions);
                        if (!(Array.isArray(output) && output.every(row => typeof row === 'string'))) {
                            internalError = true;
                            throw new Error('Transformation did not return a string[]');
                        }
                        result = output;
                    }
                    return result;
                })(),
                answer: (() => {
                    let result = '';
                    if (typeof egdb.answers.indexesOrLiterals[i] === 'string') {
                        result = egdb.answers.indexesOrLiterals[i];
                    } else {
                        let interim = typeof egdb.answers.indexesOrLiterals[i] === 'number'
                            ? answers.eq(egdb.answers.indexesOrLiterals[i]).text()
                            : egdb.answers.indexesOrLiterals[i].reduce((pv, cv) => { pv.push(answers.eq(cv).text()); return pv; }, [] as string[]);
                        const transform = egdb.answers.transforms?.find(tx => tx.appliesTo.includes(i));
                        if (!!transform) {
                            const output = fx.interpolate(interim, transform.functions);
                            if (typeof output !== 'string') {
                                internalError = true;
                                throw new Error('Transformation did not return a string');
                            }
                            result = output;
                        } else if (typeof interim === 'string') result = interim;
                        else {
                            internalError = true;
                            throw new Error(`No tranformations specified but answers.indexesOrLiterals is an array`);
                        }
                    }
                    if (result.includes('\n')) {
                        const answers = result.split('\n');
                        while (answers.at(-1) == '') answers.pop();
                        return answers.join('\n');
                    } else return result;
                })(),
                ...(egdb.additionalInfos) && {
                    additionalInfo: {
                        [egdb.additionalInfos.key]: (() => {
                            let result = additionalInfos!.eq(egdb.additionalInfos.indexes[i]).text();
                            const transform = egdb.additionalInfos.transforms?.find(tx => tx.appliesTo.includes(i));
                            if (!!transform) {
                                const output = fx.interpolate(result, transform.functions);
                                if (typeof output !== 'string') {
                                    internalError = true;
                                    throw new Error('Transformation did not return a string');
                                }
                                result = output;
                            }
                            return result;
                        })()
                    }
                }
            });
        });
    } catch (err) {
        // Look for "no-examples" file which is useful when the default search strategy works fine
        // for part 1 but there is no part 2 example.
        let noExamples: number[] = [];
        try {
            const egdbFilename = normalize(join(__dirname, '..', 'egdb', year.toString(), `no-examples.json`));
            noExamples = (JSON.parse(await readFile(egdbFilename, { encoding: 'utf-8' })) as { [key: string]: number[] })[day.toString()] ?? [];
        } catch { }
        if (internalError) throw err;
        const answer = (part: number) => {
            const elements = $(`article:${part === 1 ? 'first' : 'last'} p:has(em,code)`).find("em,code").find("em,code");
            return elements.length < 2
                ? elements.text()
                : elements.eq([...elements].map((e, i) => ({ e, score: (/^\d+$/.test(elements.eq(i).text()) ? 1 : 0) + (e.prev === null ? 1 : 0), i })).sort((a, b) => a.score === b.score ? b.i - a.i : b.score - a.score)[0].i).text();
        }
        const inputs = getExampleInputs($).html()?.includes('<br') ? getExampleInputs($).html()!.split('<br>') : getExampleInputs($).text().split('\n');
        if (noExamples.indexOf(1) === -1) examples.push({ part: 1, inputs, answer: answer(1) }); // No additionalInfo for generically determined examples
        if (day != 25 && !part1only) {
            if (noExamples.indexOf(2) === -1) examples.push({ part: 2, inputs, answer: answer(2) });
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