import * as mut from '../src/distance';

/**
 * Run with `npm run test` or `npx jest distance.test.ts`
 */

describe('Unit tests', () => {
    describe('Dijkstra', () => {
        let graph: Map<string, Map<string, number>>;

        beforeEach(() => {
            graph = new Map([
                ['a', new Map([['b', 4], ['c', 2]])],
                ['b', new Map([['c', 5], ['d', 10]])],
                ['c', new Map([['e', 3]])],
                ['d', new Map([['f', 11]])],
                ['e', new Map([['d', 4]])],
                ['f', new Map()],
            ]);
        });

        test('b > all', () => {
            expect(mut.dijkstra(graph, 'b')).toEqual({
                distance: undefined,
                distances: new Map([
                    ['b', 0],
                    ['c', 5],
                    ['e', 8],
                    ['d', 10],
                    ['f', 21],
                    ['a', Infinity],
                ]),
                path: []
            });
        });

        test('a > f', () => {
            expect(mut.dijkstra(graph, 'a', 'f')).toEqual({
                distance: 20,
                distances: new Map([
                    ['a', 0],
                    ['c', 2],
                    ['b', 4],
                    ['e', 5],
                    ['d', 9],
                    ['f', 20],
                ]),
                path: ['f', 'd', 'e', 'c', 'a']
            });
        });
    });

    test('Floyd-Warshall', () => {
        const graph = new Map([
            ['1', new Map([['3', -2]])],
            ['2', new Map([['1', 4], ['3', 3]])],
            ['3', new Map([['4', 2]])],
            ['4', new Map([['2', -1]])],
        ]);

        expect(mut.floydWarshall(graph)).toEqual(new Map([
            ['1|1', 0],
            ['1|2', -1],
            ['1|3', -2],
            ['1|4', 0],
            ['2|1', 4],
            ['2|2', 0],
            ['2|3', 2],
            ['2|4', 4],
            ['3|1', 5],
            ['3|2', 1],
            ['3|3', 0],
            ['3|4', 2],
            ['4|1', 3],
            ['4|2', -1],
            ['4|3', 1],
            ['4|4', 0],
        ]));
    });
});