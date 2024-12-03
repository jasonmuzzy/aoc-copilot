import * as mut from '../src/utils';

/**
 * Run with `npm run test` or `npx jest utils.test.ts`
 */

describe('Unit tests', () => {
    describe('adjacents', () => {
        describe('orthogonal', () => {
            test('top left corner', () => expect(mut.adjacents(0, 0, 10, 10)).toEqual([[1, 0], [0, 1]]));
            test('top edge', () => expect(mut.adjacents(5, 0, 10, 10)).toEqual([[4, 0], [6, 0], [5, 1]]));
            test('middle', () => expect(mut.adjacents(5, 5, 10, 10)).toEqual([[5, 4], [4, 5], [6, 5], [5, 6]]));
        });
        describe('orthogonal + diagonal', () => {
            test('bottom right corner', () => expect(mut.adjacents(9, 9, 10, 10, true)).toEqual([[8, 8], [9, 8], [8, 9]]));
            test('left edge', () => expect(mut.adjacents(0, 5, 10, 10, true)).toEqual([[0, 4], [1, 4], [1, 5], [0, 6], [1, 6]]));
            test('middle', () => expect(mut.adjacents(5, 5, 10, 10, true)).toEqual([[4, 4], [5, 4], [6, 4], [4, 5], [6, 5], [4, 6], [5, 6], [6, 6]]));
        });
    });

    describe('DefaultMap', () => {
        const map = new mut.DefaultMap<string, number>([['a', 1]], 0);
        test('get() map.has(key)', () => expect(map.get('a')).toBe(1));
        test('get() !map.has(key)', () => expect(map.get('x')).toBe(0));
    });

    describe('gcd()', () => {
        test('of 2 numbers', () => expect(mut.gcd([4, 6])).toBe(2));
        test('of 3 numbers', () => expect(mut.gcd([6, 9, 12])).toBe(3));
        test('of 4 numbers', () => expect(mut.gcd([8, 12, 16, 20])).toBe(4));
    });

    describe('lcm()', () => {
        test('of 2 numbers', () => expect(mut.lcm([4, 6])).toBe(12));
        test('of 3 numbers', () => expect(mut.lcm([6, 9, 12])).toBe(36));
        test('of 4 numbers', () => expect(mut.lcm([8, 12, 16, 20])).toBe(240));
    });

    describe('printableGrid()', () => {
        test("from array of strings", () => expect(mut.printableGrid(['-1,-1','0,0','1,1'])).toEqual('#  \n # \n  #'));
        test("from set of strings", () => expect(mut.printableGrid(new Set(['-1,-1','0,0','1,1']))).toEqual('#  \n # \n  #'));
        test("from array of objects", () => expect(mut.printableGrid([{x: -1, y: -1},{x: 0, y: 0},{x: 1, y: 1}])).toEqual('#  \n # \n  #'));
        test("from set of objects", () => expect(mut.printableGrid(new Set([{x: -1, y: -1},{x: 0, y: 0},{x: 1, y: 1}]))).toEqual('#  \n # \n  #'));
    });

    describe('product()', () => {
        test('[0,1],[0,1]', () => expect(mut.product([0,1],[0,1])).toEqual([[0,0],[0,1],[1,0],[1,1]]));
        test('[0,1],[0,1,2]', () => expect(mut.product([0,1],[0,1,2])).toEqual([[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]]));
    });

    describe('range()', () => {
        test('5', () => expect(mut.range(5)).toEqual([0, 1, 2, 3, 4]));
    });

    describe('reduce()', () => {
        test('10 / 15 => 2 / 3', () => expect(mut.reduce(10, 15)).toEqual({ numerator: 2, denominator: 3 }));
    });

    describe('splitOn()', () => {
        test('5,10', () => expect(mut.splitOn('5,10', ',')).toEqual({ lhs: "5", rhs: "10" }));
        test('5,10,15', () => expect(mut.splitOn('5,10,15', ',')).toEqual({ lhs: "5", rhs: "10,15" }));
        test('left middle right', () => expect(mut.splitOn('left middle right', ' middle ')).toEqual({ lhs: "left", rhs: "right" }));
        test('not found', () => expect(mut.splitOn('not found', ' middle ')).toEqual({ lhs: "not found", rhs: "" }));
    });

    describe('xyArray()', () => {
        test('2 x 3', () => expect(mut.xyArray(['ab', 'cd', 'ef'])).toEqual([[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]]));
    });
});