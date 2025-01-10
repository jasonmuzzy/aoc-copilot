import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

type Options = {
    forceSubmit?: boolean
    onlyPart?: 1 | 2,
    skipTests?: boolean,
    testsOnly?: boolean,
}

function argsToOptions(args: string[]) {

    const argv = yargs(hideBin(args))
        .option('force-submit', {
            alias: 'f',
            type: 'boolean'
        })
        .option('part', {
            alias: 'p',
            type: 'number'
        })
        .option('skip-tests', {
            alias: 's',
            type: 'boolean'
        })
        .option('tests-only', {
            alias: 't',
            type: 'boolean'
        })
        .argv;

    const options: Options = {};
    for (let [arg, val] of Object.entries(argv)) {
        if (arg === 'force-submit') options.forceSubmit = val;
        else if (arg === 'part') options.onlyPart = val;
        else if (arg === 'skip-tests') options.skipTests = val;
        else if (arg === 'tests-only') options.testsOnly = val;
    };
    return options;

}

export {
    argsToOptions,
    Options
}