import * as mut from '../src/options';

/**
 * Run with `npm run test` or `npx jest options.test.ts`
 */

describe('options', () => {
    const argv = [
        'C:\\Program Files\\nodejs\\node.exe',
        'C:\\path\\to\\options.ts'
    ];

    test('only-part', () => {
        const actual = mut.argsToOptions(argv.concat(['--only-part', '1']));
        expect(actual).toEqual({ onlyPart: 1 });
    });

    test('skip-tests', () => {
        const actual = mut.argsToOptions(argv.concat(['--skip-tests']));
        expect(actual).toEqual({ skipTests: true });
    });

    test('tests-only', () => {
        const actual = mut.argsToOptions(argv.concat(['--tests-only']));
        expect(actual).toEqual({ testsOnly: true });
    });

    test('all options', () => {
        const actual = mut.argsToOptions(argv.concat(['--force-submit', '--only-part', '1', '--skip-tests', '--tests-only']));
        expect(actual).toEqual({ forceSubmit: true, onlyPart: 1, skipTests: true, testsOnly: true });
    });

    describe('force-submit (all boolean formats)', () => {
        test('-f', () => {
            const actual = mut.argsToOptions(argv.concat(['-f']));
            expect(actual).toEqual({ forceSubmit: true });
        });
        test('--force-submit', () => {
            const actual = mut.argsToOptions(argv.concat(['--force-submit']));
            expect(actual).toEqual({ forceSubmit: true });
        });
        test('--forceSubmit', () => {
            const actual = mut.argsToOptions(argv.concat(['--forceSubmit']));
            expect(actual).toEqual({ forceSubmit: true });
        });
        test('--force-submit true', () => {
            const actual = mut.argsToOptions(argv.concat(['--force-submit', 'true']));
            expect(actual).toEqual({ forceSubmit: true });
        });
        test('--force-submit false', () => {
            const actual = mut.argsToOptions(argv.concat(['--force-submit', 'false']));
            expect(actual).toEqual({ forceSubmit: false });
        });
        test('--no-force-submit', () => {
            const actual = mut.argsToOptions(argv.concat(['--no-force-submit']));
            expect(actual).toEqual({ forceSubmit: false });
        });
    });

});