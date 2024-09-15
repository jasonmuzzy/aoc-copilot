type Fx = { [key: string]: (string | number | Fx[])[] }

function interpolate(data: string | number | (string | number)[] | undefined, fxs: Fx[]): string | number | (string | number)[] | undefined {
    for (let fx of fxs) {
        const [[id, args]] = Object.entries(fx);
        if (['map', 'reduce'].includes(id) && Array.isArray(data)) {
            if (id === 'map') {
                data = data.map(rowData => interpolate(rowData, args[0] as Fx[]) as string);
            } else {
                const [[aggId, aggArgs]] = Object.entries((args[0] as Fx[])[0]);
                data = data.reduce((p, c) => {
                    return ops[aggId].apply(undefined, [p, c]);
                });
            }

        } else {
            for (let arg of args) {
                if (Array.isArray(arg)) {
                    arg = interpolate(data, arg) as string | number;
                }
            }
            data = ops[id].apply(data, args);
        }

    }
    return data;
}

const ops: { [key: string]: Function } = {
    at(this: string[], index: number) { return this.at(index); },
    length(this: string[]) { return this.length; },
    match(this: string, pattern: string, flags?: string) { return this.match(new RegExp(pattern, flags)); },
    multiply(a: number, b: number) { return a * b; },
    parseInt(this: string) { return parseInt(this); },
    replaceAll(this: string, oldValue: string, newValue: string) { return this.replaceAll(oldValue, newValue); },
    slice(this: string[], start: number, end?: number) { return this.slice(start, end); },
    split(this: string, separator: string) { return this.split(separator); },
    substring(this: string, start: number, end?: number) { return this.substring(start, end); },
    toString(this: number) { return this.toString(); },
    toUpperCase(this: string) { return this.toUpperCase(); },
}

export {
    Fx,
    interpolate
}