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

function reduce(numerator: number, denominator: number) {
    const divisor = _gcd(numerator, denominator);
    return { numerator: numerator / divisor, denominator: denominator / divisor };
}

function splitOn(str: string, delimiter: string) {
    const i = str.indexOf(delimiter);
    return i === -1
        ? { lhs: str, rhs: '' }
        : { lhs: str.substring(0, i), rhs: str.substring(i + delimiter.length) };
}

function xyArray(a: any[]): number[][] {
    return a.length == 0
        ? []
        : product(range(a[0].length), range(a.length));
}

export {
    DefaultMap,
    gcd,
    lcm,
    printableGrid,
    product,
    range,
    reduce,
    splitOn,
    xyArray
}