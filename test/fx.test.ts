import * as mut from '../src/fx';

/**
 * Run with `npm run test` or `npx jest fx.test.ts`
 */
describe('Unit tests', () => {
    test('add', () => {
        expect(mut.interpolate(undefined, [{ 'add': [1, 2] }])).toEqual(3);
        expect(mut.interpolate(undefined, [{ 'add': ['1', '2'] }])).toEqual('12');
    });
    test('at', () => {
        expect(mut.interpolate(['13', '42', '99'], [{ 'at': [1] }])).toEqual('42');
    });
    test('concat', () => {
        expect(mut.interpolate('10 players; last marble is worth 1618', [{ 'concat': [' points'] }])).toEqual('10 players; last marble is worth 1618 points');
    });
    test('join', () => {
        expect(mut.interpolate(['1,2,3,', '4,5,6,', '7,8,9', ''], [{ 'join': [''] }])).toEqual('1,2,3,4,5,6,7,8,9');
    });
    test('length', () => {
        expect(mut.interpolate(['13', '42', '99'], [{ 'length': [] }])).toEqual(3);
    });
    test('match', () => {
        expect(mut.interpolate('10 + 20 = 30', [{ 'match': ['\\d+$', 'g'] }])).toEqual(['30']);
    });
    test('multiply', () => {
        expect(mut.interpolate(undefined, [{ 'multiply': [6, 7] }])).toEqual(42);
    });
    test('parseInt', () => {
        expect(mut.interpolate('42', [{ 'parseInt': [] }])).toEqual(42);
    });
    test('replaceAll', () => {
        expect(mut.interpolate('a\nb\nc\n\n1\n2\n3\n', [{ 'replaceAll': ['\n', ''] }])).toEqual('abc123');
    });
    test('slice', () => {
        expect(mut.interpolate(['13', '42', '99'], [{ 'slice': [1, 2] }])).toEqual(['42']);
    });
    test('split', () => {
        expect(mut.interpolate('a\nb\nc\n\n1\n2\n3\n', [{ 'split': ['\n\n'] }])).toEqual(['a\nb\nc', '1\n2\n3\n']);
    });
    test('substring', () => {
        expect(mut.interpolate('start middle end', [{ 'substring': [6, 12] }])).toEqual('middle');
    });
    test('toString', () => {
        expect(mut.interpolate(42, [{ 'toString': [] }])).toEqual('42');
    });
    test('toUpperCase', () => {
        expect(mut.interpolate("o", [{ 'toUpperCase': [] }])).toEqual('O');
    });
});

describe('Integration tests', () => {
    test('join concat', () => {
        expect(mut.interpolate(['10', '1618'], [{ 'join': [' players; last marble is worth '] }, { 'concat': [' points'] }])).toEqual('10 players; last marble is worth 1618 points');
    });
    test('join match', () => {
        expect(mut.interpolate(['1,2,3,', '4,5,6,', '7,8,9', ''], [{ 'join': [''] }, { 'match': ['.+', 'g'] }])).toEqual(['1,2,3,4,5,6,7,8,9']);
    });
    test('map substring', () => {
        expect(mut.interpolate(['-a-', '-b-', '-c-'], [{ 'map': [[{ 'substring': [1, 2] }]] }])).toEqual(['a', 'b', 'c']);
    });
    test('match at', () => {
        expect(mut.interpolate('10 + 20 = 30', [{ 'match': ['\\d+$', 'g'] }, { 'at': [0] }])).toEqual('30');
    });
    test('multiply at', () => {
        expect(mut.interpolate(['10', '22'], [{ 'multiply': [[{ 'at': [0] }], [{ 'at': [1] }]] }, { 'toString': [] }])).toEqual('220');
    });
    test('split length toString', () => {
        expect(mut.interpolate('row 1\nrow2\nrow3', [{ 'split': ['\n'] }, { 'length': [] }, { 'toString': [] }])).toEqual('3');
    });
    test('map (parseInt) reduce (sum) toString', () => {
        expect(mut.interpolate(['1', '2'], [
            {
                'map': [
                    [{ 'parseInt': [] }]
                ]
            },
            {
                'reduce': [
                    [{ 'add': [] }]
                ]
            },
            { 'toString': [] }
        ])).toEqual('3');
    });
    test('split slice map (parseInt) reduce (multiply) toString', () => {
        expect(mut.interpolate('a\nb\n13\n42\n99\nc\nd\n', [
            { 'split': ['\n'] },
            { 'slice': [2, 5] },
            {
                'map': [
                    [{ 'parseInt': [] }]
                ]
            },
            {
                'reduce': [
                    [{ 'multiply': [] }]
                ]
            },
            { 'toString': [] }
        ])).toEqual('54054');
    });
    test('substring toUpperCase', () => {
        expect(mut.interpolate('The letter o', [{ 'substring': [11] }, { 'toUpperCase': [] }])).toEqual('O');
    });
});
