import { run } from './runner';
// import * as utils from './utils';

async function solve(
    inputs: string[], // inputs for example or actual puzzle
    part: number,     // part 1 or 2
    test: boolean,    // true (example) or false (actual input)
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | string> {
    let answer: number | string = 0;
    throw new Error('Not implemented'); // <-- Replace with your solution (raising an exception forces printing the example input and answer to the console)
    return answer;
}

run(__filename, solve, {
    testsOnly: false, // Only run the examples (true) or run both examples and inputs (false) (default)
    skipTests: false, // Skip the examples (true) or run the examples (false) (default)
    // onlyPart: 1, // Run only part 1 or 2
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
//     //     "functions": [
//     //             { "split": ["\n"] },
//     //             { "at": [-2] },
//     //             { "match": ["(?<=Result: ).*", ""] },
//     //             { "at": [0] }
//     //         ], "appliesTo": [0, 1, 2, 3]
//     //     }]
//     }
// }); //, [{
//     part: 1,
//     inputs: ['Test case input'],
//     answer: 'Expected answer'
// }]);