function adjacents(x: number, y: number, endx: number, endy: number, diagonals = false, startx = 0, starty = 0) {
    const result: [number, number][] = [];
    for (let y1 = Math.max(starty, y - 1); y1 <= Math.min(endy - 1, y + 1); y1++) {
        for (let x1 = Math.max(startx, x - 1); x1 <= Math.min(endx - 1, x + 1); x1++) {
            if ((x1 !== x || y1 !== y) && (diagonals || x1 === x || y1 === y)) {
                result.push([x1, y1]);
            }
        }
    }
    return result;
}

function combos(characters: string, length: number): string[] {
    const results: string[] = [];
    const totalCombinations = Math.pow(characters.length, length);
    for (let i = 0; i < totalCombinations; i++) { // Outer loop e.g. 0 to 26 for 3 ** 3
        let combination = '';
        let temp = i;
        for (let j = 0; j < length; j++) { // Inner loop e.g. 0 to 2 for length 3
            combination += characters[temp % characters.length];
            temp = Math.floor(temp / characters.length); // Magic e.g.: 21 -> 7 -> 2 (which mod to 0, 1, 2) 
        }
        results.push(combination);
    }
    return results;
}

class DefaultMap<K, V> extends Map<K, V> {
    default: V;
    constructor(entries: [K, V][], defaultValue: V) {
        super(entries);
        this.default = defaultValue;
    }
    get(key: K) {
        return this.has(key) ? super.get(key)! : this.default;
    }
}

function factorize(n: number) {
    const factors: number[] = [];
    if (n <= 1) return factors;
    while (n % 2 === 0) { // Even optimization
        factors.push(2);
        n /= 2;
    }
    for (let i = 3; i <= Math.sqrt(n); i += 2) { // Odd optimization
        while (n % i === 0) {
            factors.push(i);
            n /= i;
        }
    }
    if (n > 1) factors.push(n); // Prime optimization
    return factors;
}

function _gcd(a: number, b: number): number {
    return b > 0 ? _gcd(b, a % b) : a;
}

function gcd(numbers: number[]): number {
    let a = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        a = _gcd(a, numbers[i]);
    }
    return a;
}

function _lcm(a: number, b: number): number {
    return a * b / _gcd(a, b);
}

function lcm(numbers: number[]): number {
    let a = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        a = _lcm(a, numbers[i]);
    }
    return a;
}

// Takes x,y coordinates and turns it into a printable string representing the overall grid
function printableGrid(coords: Iterable<string | { x: number, y: number }>, occupied = '#', empty = ' ') {
    let lhs = '', rhs = '', x = 0, y = 0, minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    const yxs: [number, number][] = [];
    for (let coord of coords) {
        if (typeof coord === 'string') {
            ({ lhs, rhs } = splitOn(coord, ','));
            x = parseInt(lhs);
            y = parseInt(rhs);
        } else ({ x, y } = coord);
        yxs.push([y, x]);
        minx = Math.min(minx, x);
        maxx = Math.max(maxx, x);
        miny = Math.min(miny, y);
        maxy = Math.max(maxy, y);
    };
    const grid = Array(maxy - miny + 1).fill(empty.repeat(maxx - minx + 1)).map(row => row.split(''));
    for ([y, x] of yxs) grid[y - miny][x - minx] = occupied;
    return grid.map(row => row.join('')).join('\n');
}


// Adapted from https://gist.github.com/kpman/9981f19fea2670b9d60057ce9debdfff
function product(...args: any[]): any[][] {
    return args.reduce((pv, cv) => {
        let temp: any[] = [];
        pv.forEach((a0: any) => {
            cv.forEach((a1: any) => {
                temp.push(a0.concat(a1));
            });
        });
        return temp;
    }, [[]]);
}

// https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range/37980601#comment79356810_37980601
function range(n: number): number[] {
    return [...Array(n).keys()];
}

// Reduce a fraction
function reduce(numerator: number, denominator: number) {
    const divisor = _gcd(numerator, denominator);
    return { numerator: numerator / divisor, denominator: denominator / divisor };
}

// Splits a string into two instead of into an array
function splitOn(str: string, delimiter: string) {
    const [lhs, ...rhs] = str.split(delimiter);
    return { lhs, rhs: rhs.join(delimiter) };
}

// Returns an array of [x, y] coordinates for a 2d array
function xyArray(a: any[]): number[][] {
    return a.length == 0
        ? []
        : product(range(a[0].length), range(a.length));
}

export {
    adjacents,
    combos,
    DefaultMap,
    factorize,
    gcd,
    lcm,
    printableGrid,
    product,
    range,
    reduce,
    splitOn,
    xyArray
}