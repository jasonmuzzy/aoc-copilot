import * as mut from '../src/utils';

/**
 * Run with `npm run test` or `npx jest utils.test.ts`
 */

describe('Unit tests', () => {
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

    describe('primeFactors()', () => {
        test('of 12', () => expect(mut.primeFactors(12)).toEqual([2,2,3]));
        test('of 1113', () => expect(mut.primeFactors(1113)).toEqual([3,7,53]));
        test('of 10939706', () => expect(mut.primeFactors(10939706)).toEqual([2,19,287887]));
    });

    describe('printableGrid()', () => {
        console.log(mut.printableGrid(['-1,-1','0,0','1,1'],'#','.'));
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
        test('left middle right', () => expect(mut.splitOn('left middle right', ' middle ')).toEqual({ lhs: "left", rhs: "right" }));
        test('not found', () => expect(mut.splitOn('not found', ' middle ')).toEqual({ lhs: "not found", rhs: "" }));
    });

    describe('xyArray()', () => {
        test('2 x 3', () => expect(mut.xyArray(['ab', 'cd', 'ef'])).toEqual([[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]]));
    });
});