import * as queue from './heap';

/**
 * Dijkstra's algorithm
 * 
 * Finds the lengths (summed weights) from a starting vertex to an ending
 * vertex or all vertices.
 * @param graph - Directed graph of parent to child edges with weights
 * @param start - The vertex to start the search from
 * @param end - [Optional] End the search when the distance to this vertex is found
 * @returns
 */
function dijkstra(graph: Map<string, Map<string, number>>, start: string, end?: string) {
    const distances: Map<string, number> = new Map();
    const unvisiteds: [number, string, string | undefined][] = [[0, start, undefined]];
    const prevs: Map<string, string | undefined> = new Map();
    const path: string[] = [];
    let distance: number | undefined, neighbor: string | undefined, prev: string | undefined;
    while (unvisiteds.length > 0) {
        ([distance, neighbor, prev] = queue.pop(unvisiteds)!);
        if (distances.has(neighbor)) continue;
        distances.set(neighbor, distance);
        if (end != undefined) {
            prevs.set(neighbor, prev);
            if (neighbor === end) {
                while (neighbor != undefined) {
                    path.push(neighbor);
                    neighbor = prevs.get(neighbor);
                }
                break;
            }
        }
        for (let [nextNeighbor, nextDistance] of graph.get(neighbor)!) {
            if (!distances.has(nextNeighbor)) queue.push(unvisiteds, [distance + nextDistance, nextNeighbor, neighbor]);
        }
        distance = undefined; // in case no path start > end
    }
    for (let key of graph.keys()) if (!distances.has(key)) distances.set(key, Infinity);
    return { distance, distances, path };
}

/**
 * Floyd-Warshall algorithm
 * 
 * Finds the lengths (summed weights) between all pairs of vertices.  Suitable
 * for relatively small numbers of vertices (V) since there are V**2 pairs,
 * requiring V**3 loops to calculate.
 * @param graph 
 * @returns 
 */
function floydWarshall(graph: Map<string, Map<string, number>>) {
    const arr = [...graph];
    const nodes = arr.map(a => a[0]);
    const distances = new Map(arr.reduce((p, c) => {
        p.push([c[0] + '|' + c[0], 0]);
        [...c[1]].forEach(([n, d]) => p.push([c[0] + '|' + n, d]));
        return p;
    }, [] as [string, number][]));
    for (let k of nodes) {
        for (let i of nodes) {
            for (let j of nodes) {
                distances.set(i + '|' + j, Math.min(
                    distances.get(i + '|' + j) ?? Infinity,
                    (distances.get(i + '|' + k) ?? Infinity)
                    + (distances.get(k + '|' + j) ?? Infinity)
                ));
            }
        }
    }
    return distances;
}

export {
    dijkstra,
    floydWarshall
}