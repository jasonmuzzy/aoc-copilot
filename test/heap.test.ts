import * as mut from '../src/heap';

/**
 * Run with `npm run test` or `npx jest heap.test.ts`
 */

describe('Unit tests', () => {
    let heap: [number, any][];

    beforeEach(() => {
        heap = [
            [0, 'A'],
            [3, 'E'],
            [1, 'B'],
            [3, 'F'],
            [Infinity, 'Z'],
            [2, 'C'],
            [3, 'D'],
        ]
    })

    test('heapify()', () => expect(mut.heapify([
        [3, 'E'],
        [Infinity, 'Z'],
        [2, 'C'],
        [3, 'F'],
        [0, 'A'],
        [1, 'B'],
        [3, 'D'],
    ])).toEqual(heap));

    describe('pop()', () => {
        test('returns', () => expect(mut.pop(heap)).toEqual([0, 'A']));
        test('heap', () => {
            mut.pop(heap);
            expect(heap).toEqual([
                [1, 'B'],
                [3, 'E'],
                [2, 'C'],
                [3, 'F'],
                [Infinity, 'Z'],
                [3, 'D'],
            ]);
        });
    });

    test('push()', () => expect(mut.push(heap, [2, 'C'])).toEqual([
        [0, 'A'],
        [2, 'C'],
        [1, 'B'],
        [3, 'E'],
        [Infinity, 'Z'],
        [2, 'C'],
        [3, 'D'],
        [3, 'F'],
    ]));

});