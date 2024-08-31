import * as mut from '../src/transform';

/**
 * Run with `npm run test` or `npx jest transform.test.ts`
 */

describe('Unit tests', () => {
    describe('at()', () => {
        test('index 1', () => expect(mut.at(['a', 'b', 'c'], 1)).toBe('b'));
    });

    describe('join()', () => {
        test('list of comma-separated numbers', () => expect(mut.join(['1,2,', '3,4'], '')).toBe('1,2,3,4'));
    });

    describe('length()', () => {
        test('of string', () => expect(mut.length('abcde')).toBe(5));
        test('of array', () => expect(mut.length([1, 2, 3])).toBe(3));
    });

    describe('match()', () => {
        test('last number', () => expect(mut.match('first 123 middle 456 last 789', '\\d+$')).toEqual(['789']));
    });

    describe('product()', () => {
        test('of number array', () => expect(mut.product([1, 2, 3, 4])).toBe(24));
        test('of string array', () => expect(mut.product(['1', '2', '3', '4'])).toBe(24));
        test('of number', () => expect(mut.product(10)).toBe(10));
        test('of string', () => expect(mut.product('42')).toBe(42));
    });

    describe('replaceAll()', () => {
        test('newline with nothing', () => expect(mut.replaceAll('1,9,10,3,\n2,3,11,0,\n99,\n30,40,50', '\n', '')).toBe('1,9,10,3,2,3,11,0,99,30,40,50'));
    });

    describe('slice()', () => {
        test('middle 2 of 4', () => expect(mut.slice(['12', '34', '56', '78'], 1, 3)).toEqual(['34', '56']));
    });

    describe('split()', () => {
        test('at double newline', () => expect(mut.split(
            'a1\n' +
            'a2\n' +
            '\n' +
            'b1\n' +
            'b2\n' +
            '\n' +
            'c1\n' +
            'c2\n' +
            'c3\n' +
            'c4\n' +
            '\n' +
            'd1\n'
            , '\n\n'
        )).toEqual([
            'a1\na2',
            'b1\nb2',
            'c1\nc2\nc3\nc4',
            'd1\n'
        ]));
    });

    describe('sum()', () => {
        test('of number array', () => expect(mut.sum([1, 2, 3, 4])).toBe(10));
        test('of string array', () => expect(mut.sum(['1', '2', '3', '4'])).toBe(10));
        test('of number', () => expect(mut.sum(10)).toBe(10));
        test('of string', () => expect(mut.sum('42')).toBe(42));
    });
});

describe('String tests', () => {
    describe('split().length()', () => {
        test('length of array from split', () => expect(mut.length(mut.split(
            'a1\n' +
            'a2\n' +
            '\n' +
            'b1\n' +
            'b2\n' +
            '\n' +
            'c1\n' +
            'c2\n' +
            'c3\n' +
            'c4\n' +
            '\n' +
            'd1\n'
            , '\n\n'
        ))).toBe(4));
    });
});