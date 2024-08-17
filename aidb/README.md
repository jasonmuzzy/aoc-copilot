# Additional Info Database

## Need

In most cases the `part` and `test` parameters passed into the solver function are sufficient to determine additional values needed in calculating the solution.  For example, part 1 of [day 9, 2020](https://adventofcode.com/2020/day/9) only considers the previous 5 numbers for the example but the previous 25 numbers for the actual inputs, so the `test` parameter can be used to determine how many previous numbers to look at.  [Day 1, 2020](https://adventofcode.com/2020/day/1) instructs you to look for 2 numbers in part 1, but **spoiler alert** 3 numbers in part 2, so the `part` parameter can be used to differentiate.  However, sometimes multiple examples are provided, and in addition to the inputs for each one an additional piece of information is needed.  For example in part 2 of [day 21, 2023](https://adventofcode.com/2023/day/21) **spoiler alert** seven different answers are given for seven different numbers of steps. So there are seven examples, each using the same example input but having a different number of steps.  In this example, the `additionalInfo` parameter  of the solver function will receive the following value for the first example:

```typescript
additionalInfo = { "numberOfSteps": 6 }
```

### Examples vs. Inputs

Additional info is actually only necessary when there are multiple examples, and where each example requires ancillary information that varies by example in addition to the inputs.  That is why there is an optional `additionalInfos` object available on [example database](../egdb/README.md#additional-info) entries.  Strictly speaking, there is no need for `additionalInfo` on actual puzzle inputs.  However, in order to be consistent between examples and actual inputs, it's important to create an entry in the additional info database when `additionalInfos` is populated in the example database.  For example, day 21, 2023 includes `additionalInfos` in its [example database](../egdb/2023/21.json) entry so it also contains an entry in the [additional info database](2023/21.json).

## Folder Structure

The `aidb` folder contains a subfolder for each year, and within each year a JSON file is created for each day that needs one.  For example, [aidb/2023/21.json](2023/21.json).

```
aidb
|-- 2023
    |-- 21.json
```

## Format

Here is an example of an aidb entry:

```json
{
    "key": "numberOfSteps",
    "selector": "code",
    "indexPart1": 0,
    "indexPart2": 21
}
```
Note this structure is different than the `additionalInfos` object in the [example database](../egdb/README.md#additional-info).

Properties:
- `key` defines the property name that will be used in the `additionalInfo` object.
- `selector` is the selector used to search the puzzle for additional info and works the same as `inputs.selector` above and must have the same number of entries as it.
- `indexPart1` is the index where the additional info is located for part 1 of the puzzle
- `indexPart2` is the index where the additional info is located for part 2 of the puzzle

Using the example above, the following object would be passed to the `additionalInfo` parameter of the solver function for the first example:

```typescript
additionalInfo = { "numberOfSteps": 6 }
```