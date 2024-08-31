function at(input: any[], index: number) {
    return input[index];
}

function join(input: any[], separator: string) {
    return input.join(separator);
}

function length(input: { length: number }) {
    return input.length;
}

function match(input: string, pattern: string, flags: string) {
    const matches = input.match(new RegExp(pattern, flags));
    return !!matches ? [...matches] : [input];
}

function product(input: number | string | number[] | string[]) {
    if (typeof input === 'string') input = parseInt(input);
    return typeof input === 'number'
        ? input
        : input.map(e => typeof e === 'string' ? parseInt(e) : e).reduce((agg, value) => agg * value);
}

function replaceAll(input: string, oldValue: string, newValue: string) {
    return input.replaceAll(oldValue, newValue);
}

function slice(input: any[], start: number, end: number) {
    return input.slice(start, end);
}

function split(input: string, separator: string) {
    return input.split(separator);
}

function sum(input: number | string | number[] | string[]) {
    if (typeof input === 'string') input = parseInt(input);
    return typeof input === 'number'
        ? input
        : input.map(e => typeof e === 'string' ? parseInt(e) : e).reduce((agg, value) => agg + value);
}

type Fn = (Fx | At | Join | Length | Match | Product | ReplaceAll | Slice | Split | Sum);
interface Fx { fx: string }
interface At extends Fx { fx: 'at', index: number }
interface Join extends Fx { fx: 'join', separator: string }
interface Length extends Fx { fx: 'length' }
interface Match extends Fx { fx: 'match', pattern: string, flags: string }
interface Product extends Fx { fx: 'product' }
interface ReplaceAll extends Fx { fx: 'replaceAll', oldValue: string, newValue: string }
interface Slice extends Fx { fx: 'slice', start: number, end: number }
interface Split extends Fx { fx: 'split', separator: string }
interface Sum extends Fx { fx: 'sum' }

const isAt = (fx: Fx): fx is At => fx.fx === 'at' && (fx as At).index !== undefined;
const isJoin = (fx: Fx): fx is Join => fx.fx === 'join' && (fx as Join).separator !== undefined;
const isLength = (fx: Fx): fx is Length => fx.fx === 'length';
const isMatch = (fx: Fx): fx is Match => fx.fx === 'match' && (fx as Match).pattern !== undefined && (fx as Match).flags !== undefined;
const isProduct = (fx: Fx): fx is Product => fx.fx === 'product';
const isReplaceAll = (fx: Fx): fx is ReplaceAll => fx.fx === 'replaceAll' && (fx as ReplaceAll).oldValue !== undefined && (fx as ReplaceAll).newValue !== undefined;
const isSlice = (fx: Fx): fx is Slice => fx.fx === 'slice' && (fx as Slice).start !== undefined && (fx as Slice).end !== undefined;
const isSplit = (fx: Fx): fx is Split => fx.fx === 'split' && (fx as Split).separator !== undefined;
const isSum = (fx: Fx): fx is Sum => fx.fx === 'sum';

function transform(functions: Fn[], input: unknown) {
    for (const fx of functions) {
        if (isAt(fx)) input = at(input as any[], fx.index);
        else if (isJoin(fx)) input = join(input as any[], fx.separator);
        else if (isLength(fx)) input = length(input as any[]);
        else if (isMatch(fx)) input = match(input as string, fx.pattern, fx.flags);
        else if (isProduct(fx)) input = product(input as number | string | number[] | string[]);
        else if (isReplaceAll(fx)) input = replaceAll(input as string, fx.oldValue, fx.newValue);
        else if (isSlice(fx)) input = slice(input as any[], fx.start, fx.end);
        else if (isSplit(fx)) input = split(input as string, fx.separator);
        else if (isSum(fx)) input = sum(input as number | string | number[] | string[]);
    }
    if (Array.isArray(input)) throw new Error('Transform returns array from last function but must return string or number');
    if (typeof input === 'number') input = input.toString();
    if (typeof input != 'string') throw new Error(`Transform returns ${typeof input} from last function but must return string or number`);
    return input;
}

type Transform = {
    functions: Fn[],
    appliesTo: number[]
};

export {
    at,
    join,
    length,
    match,
    product,
    replaceAll,
    slice,
    split,
    sum,
    transform,
    Transform
}