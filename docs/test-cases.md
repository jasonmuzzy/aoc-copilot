# Test Cases

Use the optional `addTc` parameter to supply the [runner](./runner.md) with test cases for it to execute in addition to published examples.

## Parameters

- `part` (number): indicates whether the test case is for part 1 or part 2
- `inputs` (string[]): inputs for the test case
- `answer` (string): expected answer
- `additionalInfo` (object) (optional): Additional info to be supplied with the test case; see the `additionalInfo` parameter [documentation](../README.md#solver-additional-info).

## Examples

<a id="example-1"></a>
### Example 1

The following example provides an extra test case for part 1, supplying a string of comma separated integers as input, with an expected answer of "6":

```TypeScript
run(__filename, solve, false, undefined,
    // Additional test case
    [{
        part: 1,
        inputs: ["204,16,109,1,1001,100,1,100,1008,100,14,101,1006,101,0,99,1,0,0,0,1,0,1,0,0,1,1,0,1,0"],
        answer: "6"
    }]
);
```

For the curious, this test case was for [2019 day 11](https://adventofcode.com/2019/day/11).

<a id="example-2"></a>
### Example 2

This example provides multiple test cases based on a common input.  Since each test case is for a different number of steps `additionalInfo` provides an attribute called `numberOfSteps` with each test case.

Thanks to [danatron1](https://www.reddit.com/user/danatron1/) for sharing this [test case](https://www.reddit.com/r/adventofcode/comments/18o1071/2023_day_21_a_better_example_input_mild_part_2/)!

```TypeScript
const testInputs = [
    ".................",
    "..#..............",
    "...##........###.",
    ".............##..",
    "..#....#.#.......",
    ".......#.........",
    "......##.##......",
    "...##.#.....#....",
    "........S........",
    "....#....###.#...",
    "......#..#.#.....",
    ".....#.#..#......",
    ".#...............",
    ".#.....#.#....#..",
    "...#.........#.#.",
    "...........#..#..",
    "................."
];

run(__filename, solve, false, undefined,
    // Additional test cases
    [
        { part: 2, inputs: testInputs, answer: "52", additionalInfo: { "numberOfSteps": "7" } },
        { part: 2, inputs: testInputs, answer: "68", additionalInfo: { "numberOfSteps": "8" } },
        { part: 2, inputs: testInputs, answer: "576", additionalInfo: { "numberOfSteps": "25" } },
        { part: 2, inputs: testInputs, answer: "1576", additionalInfo: { "numberOfSteps": "42" } },
        { part: 2, inputs: testInputs, answer: "3068", additionalInfo: { "numberOfSteps": "59" } },
        { part: 2, inputs: testInputs, answer: "5052", additionalInfo: { "numberOfSteps": "76" } },
        { part: 2, inputs: testInputs, answer: "1185525742508", additionalInfo: { "numberOfSteps": "1180148" } },
    ]
);
```