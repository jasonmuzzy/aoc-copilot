import { run } from './runner';
// import * as utils from './utils';

async function solve(inputs: string[], part: number, test: boolean, additionalInfo?: { [key: string]: string }): Promise<number | string> {
    let answer: number | string = 0;
    throw new Error('Not implemented'); // <-- Replace with your solution (raising an exception forces printing the example input and answer to the console)
    return answer;
}

run(__filename, solve, {
    testsOnly: false,
    skipTests: false,
    // onlyPart: 1,
}); //, {
//     "reason": "No tests",
//     "part1length": 0,
//     "inputs": {
//         "selector": "code",
//         "indexes": []
//     },
//     "answers": {
//         "selector": "code",
//         "indexesOrLiterals": []
//     // },
//     // "additionalInfos": {
//     //     "key": "steps",
//     //     "selector": "code, em",
//     //     "indexes": [],
//     //     "transforms": [{
//     //         "functions": [
//     //             { "fx": "match", "pattern": "\\d+", "flags": "g" },
//     //             { "fx": "join", "separator": "" }
//     //         ],
//     //         "appliesTo": []
//     //     }]
//     }
// }); //, [{
//     part: 1,
//     inputs: ['Test case input'],
//     answer: 'Expected answer'
// }]);