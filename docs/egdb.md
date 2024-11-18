# Example Database

Advent of Code Copilot (AoCC) strives to honor the wishes of its creator, Eric Wastl, and one of his requests is to [not post parts of puzzles or inputs](https://adventofcode.com/about#faq_copying).  So rather than store the example inputs and answers statically, AoCC downloads and caches the puzzles and then extracts examples from the cache.

<a id="default-search-strategy"></a>
## Default Search Strategy

Most of the time, AoCC is able to use its default search strategy (DSS) to locate examples automatically.  It works under the following conditions:
1) There's exactly one input which is found in part 1, is applicable to both parts, is tagged in a specific way, and is positioned relative to keywords
2) There's one expected answer in part 1 and another in part 2 that are tagged and positioned in specific ways

When puzzles don't match those conditions then the DSS will fail in part or in full.  Common reasons:
<a id="reasons"></a>
- No examples
- Multiple examples
- Irregular format
- Implied answer

In these cases it's necessary to provide the runner with information specific to the puzzle about the location of examples, and this is where the example database (EGDB) comes in.  The EGDB can be used in two ways:
1) By saving it in a JSON file in this project's `egdb` folder
2) By including it as an input parameter when calling the runner

## Format

<a id="format-mandatory"></a>
### Mandatory Elements

The minimum elements for an EGDB entry are:

```TypeScript
type Egdb = {
    "reason": string,
    "part1length": number,
    "inputs": {
        "selector": string,
        "indexes": (number | number[])[]
    },
    "answers": {
        "selector": string,
        "indexesOrLiterals": (number | number[] | string)[]
    }
}
```

Explanation:
- `reason` (string): free text explaining why the entry is necessary such as one of the [reasons](#reasons) listed above
- `part1length` (number): count of the elements in `inputs.indexes` that relate to part 1, with the remainder belonging to part 2
- `inputs`
    - `selector` (string): selector used to return matching elements from the puzzle HTML.  You can use the subset of jQuery [selectors](https://cheerio.js.org/docs/intro#selecting-elements) that are implemented by [Cheerio](https://cheerio.js.org/).
    - `indexes` ((number | number[])[]): indexes pointing to the locations of inputs within the match results.  Each element corresponds to one example and can either be a number or number array, in which case the matches will be combined.
- `answers`
    - `selector` (string): works similarly to `inputs.selector` but for answers
    - `indexesOrLiterals` ((number | number[] | string)[]):  works similarly to - and must have the same length as - `inputs.indexes` but for answers.  **Important** elements may also be strings, in which case they will be treated as literals, but this should be avoided at all costs!  See [transformations](#transformations) below for options.

## Examples of EGDB Entries

EGDB entries can range from simple to complex.  We'll use actual examples to illustrate how they work.

<a id="no-examples"></a>
### No Examples

Some puzzles don't include any examples in which case the following EGDB entry can be applied:

```JSON
{
    "reason": "No examples",
    "part1length": 0,
    "inputs": {
        "selector": "code",
        "indexes": []
    },
    "answers": {
        "selector": "code",
        "indexesOrLiterals": []
    }
}
```

Since `inputs.indexes` is empty no examples are provided for either part.

**Note for contributors**:  you can also use the `no-examples.json` file to indicate that one or both parts don't have examples.  This is useful when the DSS works fine for one part, but there are no examples for the other.

<a id="multiple-examples"></a>
### Multiple Examples

Some puzzles helpfully provide multiple examples, but unfortunately this throws off the default search strategy.

```JSON
{
    "reason": "Multiple examples",
    "part1length": 1,
    "inputs": {
        "selector": "code",
        "indexes": [0, 16]
    },
    "answers": {
        "selector": "code",
        "indexesOrLiterals": [5, 24]
    }
}
```

This example, taken from [day 1, 2023](https://adventofcode.com/2023/day/1), is necessary because different example inputs are provided in parts 1 and 2.

Since `inputs.indexes` has two entries there are two examples being described, and since `part1length` = `1` the first one is for part 1 and the second is for part 2.

<a id="irregular-format"></a>
### Irregular Format

Some puzzles don't match the DSS conditions in some way, for example they might not tag the input as expected, or they might use keywords inconsistently.

```json
{
    "reason": "Irregular format",
    "part1length": 1,
    "inputs": {
        "selector": "code",
        "indexes": [7, 7]
    },
    "answers": {
        "selector": "code",
        "indexesOrLiterals": [19, 35]
    }
}
```

This example, taken from [day 23, 2020](https://adventofcode.com/2020/day/23), is necessary because the inputs aren't tagged as expected so this entry specifies the selectors and indexes that can be used to locate the examples.

<a id="additional-info"></a>
### Additional Info

Occassionally, when multiple examples are given, another piece of information is also provided that is specific to each example and must be used to calculate the answer.

```json
{
    "reason": "Multiple examples",
    "part1length": 1,
    "inputs": {
        "selector": "code",
        "indexes": [4, 4, 4, 4, 4, 4, 4, 4]
    },
    "answers": {
        "selector": "code",
        "indexesOrLiterals": [16, 27, 29, 31, 33, 35, 37, 39]
    },
    "additionalInfos": {
        "key": "numberOfSteps",
        "selector": "code",
        "indexes": [15, 26, 28, 30, 32, 34, 36, 38]
    }
}
```

For example, part 2 of [day 21, 2023](https://adventofcode.com/2023/day/21) provides many additional examples, and each one needs to be calculated for a different "number of steps" so an `additionalInfos` object is added to the EGDB entry that defines the attribute `numberOfSteps`, the selector `code` with which to find the values within the puzzle, and the `indexes` corresponding to each example.

For the first example in part 2, the `numberOfSteps` can be found at `code` index `26` and this value will be passed to your solver at runtime in the `additionalInfo.numberOfSteps` parameter.

When `additionalInfos` is present, `additionalInfo.indexes` must have the same length as `inputs.indexes`.

<a id="implied-answer"></a>
### Implied Answer

Sometimes puzzles provide an example, and they walk all the way through the solution but leave the final answer implied.  Example 2 from part 1 of [day 10, 2020](https://adventofcode.com/2020/day/10) goes through a long explanation of calculating a series of "jolt adapters" and then finally summarizes:

> there are *22* differences of 1 jolt and *10* differences of 3 jolts

and asks you

> *What is the number of 1-jolt differences multiplied by the number of 3-jolt differences?*

Obviously the answer is 22 * 10 = 220 but *that result is never calculated in the example* so there is nowhere to directly pull the value from!  Clearly it would be beneficial to include this example, so we need a way to work around the missing information.  Here's the EGDB entry that does it:

```json
{
    "reason": "Multiple examples; implied answers",
    "part1length": 2,
    "inputs": {
        "selector": "code",
        "indexes": [9, 51, 9, 51]
    },
    "answers": {
        "selector": "code",
        "indexesOrLiterals": [[49, 50], [52, 53], 59, 64],
        "transforms": [{
            "functions": [
                { "map": [
                    [{ "parseInt": [] }]
                ] },
                { "reduce": [
                    [{ "multiply": [] }]
                ] },
                { "toString": [] }
            ],
            "appliesTo": [0, 1]
        }]
    }
}
```

First, the selector `code` together with the nested array `[52, 53]` selects the values *22* and *10* from the puzzle text.  Normally, these would be passed as the array `['22', '10']` to the solver, but in this case they'll be passed to the functions declared in `transforms`.

`transforms` takes an array of objects, each of which declares a set of transformation functions and identifies which examples it applies to.  So, if different examples require different transformations, you can pass one object for each.  Here, the same transformation logic is applicable to the first two examples, so `appliesTo` = `[0, 1]`.  For the second example, the input array `['22', '10']` will go through the following steps:
1) The `map` function iterates over the array, applying a function to each element
2) `parseInt` converts each string to an integer, producing a new array of numbers: `[22, 10]`
3) `reduce` aggregates all values.  It starts by setting the aggregate value to the first element of the array, then iterates over the rest of the elements, passing the aggregate and current values to a function, and finally sets the aggregate to the result of the function and continues to the next element.
4) `multiply` multiplies the previous and current values and returns the product, `220`
5) `toString` converts `220` to the string `'220'` and returns it

See the [transformations](#transformations) section for information about which functions are available.

<a id="finding-indexes"></a>
## Finding Indexes

The AoCC CLI includes an `index` utility [command](./commands.md#index) for assisting with locating indexes.  For example, the following command:

```shell
npx aoc-copilot index 2023 1
```

Returns the following results for 2023 day 1 using the default selector `code`:

```shell
Puzzle 2023 day 1 indexes matching selector 'code':
000:       
1abc2      
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet 

001:  12   
002:  38   
003:  15   
004:  77   
005:  142
...
```

In this case, the example input is at index `0`, and the expected answer is at index `5`.

Inputs and answers are often found inside `<code>` and/or `<em>` tags, so good candidates for selectors are `code`, `em` or even `"code,em"`.  If none of those work then you can try examining the puzzle HTML to see if another selector would work, but chances are you'll need to use [transformations](#transformations) to extract elements from the page and transform them.

<a id="transformations"></a>
## Transformations

The following transformation functions are available for use with `inputs`, `answers` and `addtionalInfo`.  Each one expects a specific type as its `this` context, so you must chain functions such that the return type of one function matches the `this` type of the next.

For `inputs`, the first function will always receive a string array and the last function must always return a string array.  **Tip** if you need to convert a string to a string array, add `{ "match": [".+", "g"] }` as the last function of your transformation series.

For `answers` and `additionalInfo`, the first function will always receive a string and the last function must always return a string.

<a id="functions"></a>
| Function | `this` | Argument 1 | Argument 2 | Returns |
|----------|--------|------------|------------|---------|
| at | array | index | | array element at `index` (negatives allowed) |
| concat | string | ...strings | | concatenated string |
| join | array | separator | | array elements joined by `separator` |
| length | string \| array | | | length of a string or number of elements in an array |
| match | string | pattern | flags? | results of RegExp match |
| multiply | undefined | multiplicand | multiplier | `multiplicand` * `multiplier` |
| parseInt | string | | | parse integer from string |
| replaceAll | string | oldValue | newValue | string with all occurrences of `oldValue` replaced by `newValue` |
| slice | array | start | end? | array of elements from `start` until `end` (optional) |
| split | string | separator | | array of strings divided from the original by `separator` |
| substring | string | start | end? | part of the string from `start` until `end` (optional) |
| toString | number | | | string representing the number value |
| toUpperCase | string | | | string converted to upper case |

You can supply a function as the argument to another function, observing the `this` requirements.

Additionally, there are two functions that operate on the whole array and accept an array of functions as their only argument:

<a id="array-functions"></a>
| Function | `this` | Argument | Returns | Notes on Use |
|----------|--------|----------|---------|--------------|
| map | array | functions | array | each element will be used as the `this` context when calling functions |
| reduce | array | functions | aggregate | only functions that take undefined as their `this` context are valid; currently only `multiply` matches this requirement |

Many other functions could be added, but the goal is to support extracting examples from puzzles, not to build up the broadest library possible.

See the [function tests](../test/fx.test.ts) and [egdb folder](../egdb/) for examples of usage.

<a id="full-example"></a>
## Full Example

Here is one final example taken from [day 16, 2019](https://adventofcode.com/2019/day/16) that illustrates the use of multiple examples, additionalInfos and transformations, all in one:

```json
{
    "reason": "Multiple examples",
    "part1length": 4,
    "inputs": {
        "selector": "code",
        "indexes": [16, 18, 20, 22, 30, 32, 34]
    },
    "answers": {
        "selector": "code",
        "indexesOrLiterals": [17, 19, 21, 23, 31, 33, 35],
        "transforms": [{
            "functions": [
                { "match": ["\\d+(?=\\n$)", ""] },
                { "at": [0] }
            ],
            "appliesTo": [0]
        }]
    },
    "additionalInfos": {
        "key": "phases",
        "selector": "code, em",
        "indexes": [22, 29, 29, 29, 29, 29, 29],
        "transforms": [{
            "functions": [
                { "match": ["(?<=After )\\d+(?= phases: \\d+\\n$)", ""] },
                { "at": [0] }
            ],
            "appliesTo": [0]
        }]
    }
}
```