import * as mut from '../src/transform';

/**
 * Run with `npm run test` or `npx jest transform.test.ts`
 */

describe('Unit tests', () => {
    describe('length()', () => {
        test('of string', () => expect(mut.length('abcde')).toBe(5));
        test('of array', () => expect(mut.length([1, 2, 3])).toBe(3));
    });

    describe('product()', () => {
        test('of string array', () => expect(mut.product(['7', '5'])).toBe(35));
    });

    describe('replaceAll()', () => {
        test('newline with nothing', () => expect(mut.replaceAll('1,9,10,3,\n2,3,11,0,\n99,\n30,40,50', '\n', '')).toBe('1,9,10,3,2,3,11,0,99,30,40,50'));
    });

    describe('split()', () => {
        test('at double newline', () => expect(mut.split(
            'pid:087499704 hgt:74in ecl:grn iyr:2012 eyr:2030 byr:1980\n' +
            'hcl:#623a2f\n' +
            '\n' +
            'eyr:2029 ecl:blu cid:129 byr:1989\n' +
            'iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm\n' +
            '\n' +
            'hcl:#888785\n' +
            'hgt:164cm byr:2001 iyr:2015 cid:88\n' +
            'pid:545766238 ecl:hzl\n' +
            'eyr:2022\n' +
            '\n' +
            'iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:093154719\n'
            , '\n\n'
        )).toEqual([
            'pid:087499704 hgt:74in ecl:grn iyr:2012 eyr:2030 byr:1980\n' +
            'hcl:#623a2f',
            'eyr:2029 ecl:blu cid:129 byr:1989\n' +
            'iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm',
            'hcl:#888785\n' +
            'hgt:164cm byr:2001 iyr:2015 cid:88\n' +
            'pid:545766238 ecl:hzl\n' +
            'eyr:2022',
            'iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:093154719\n'
        ]));
    });

    describe('sum()', () => {
        test('of string array', () => expect(mut.sum(['7', '5'])).toBe(12));
    });
});

describe('String tests', () => {
    describe('split().length()', () => {
        test('length of array from split', () => expect(mut.length(mut.split(
            'pid:087499704 hgt:74in ecl:grn iyr:2012 eyr:2030 byr:1980\n' +
            'hcl:#623a2f\n' +
            '\n' +
            'eyr:2029 ecl:blu cid:129 byr:1989\n' +
            'iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm\n' +
            '\n' +
            'hcl:#888785\n' +
            'hgt:164cm byr:2001 iyr:2015 cid:88\n' +
            'pid:545766238 ecl:hzl\n' +
            'eyr:2022\n' +
            '\n' +
            'iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:093154719\n'
            , '\n\n'
        ))).toBe(4));
    });
});