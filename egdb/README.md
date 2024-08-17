# Example Database

## Finding Examples

AoC Copilot (AoCC) is pretty good at finding examples on puzzle pages by looking for common patterns.  For example, the default search strategy worked for 19 out of 25 days in 2023.  Reasons the default search may fail include:
<a id="reasons"></a>
- Multiple examples
- Irregular format
- Implied answer
- No example

In cases like these AoCC needs additional instructions to help it identify examples, and this is where the **Example Database** (egdb) comes into play.

## Format

Let's start with an example taken from [day 1, 2023](2023/1.json):
```json
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
This entry tells AoCC to take the contents of the 0th `code` element and use it as input for part 1, and the 16th one as input for part 2.  Similarly, the answers for parts 1 and 2 are found at indexes 5 and 24, respectively.

Now let's break this down field-by-field:
- `reason` is free text that can be used to document why the entry is necessary.  **Suggestion**: use one of the [reasons](#reasons) listed above.
- `part1length` indicates how many values listed in `inputs.indexes`, `answers.indexesOrLiterals` and `additionalInfos.indexes` relate to part 1, with the rest belonging to part 2.
- `inputs.selector` is the selector used to search the puzzle for example inputs.  **Suggestion**: keep it simple; default to `code` and only get fancy if that doesn't cut it.  You can use the subset of jQuery [selectors](https://cheerio.js.org/docs/intro#selecting-elements) that are implemented by [Cheerio](https://cheerio.js.org/).
- `inputs.indexes` is an array of indexes that point to the location(s) in the puzzle where example inputs can be found.  The elements of the array are usually indexes, but can also be a nested array of indexes to support those edge cases where multiple values need to be combined into one set of inputs (e.g. [day 25, 2020](2020/25.json)).
- `answers.selector` is the selector used to search the puzzle for example answers and works the same as `inputs.selector` above and must have the same number of entries as it.
- `answers.indexesOrLiterals` is an array of indexes that point to the location of the example answers, or literal values of the answers themselves.  **Important** always prefer indexes over literal values!  Never use literal values when the value can be obtained by an index somewhere, _anywhere_, within the puzzle -- even if it's just a coincidence like in [day 2, 2020](2020/2.json) where the answer is implied by counting -- but is not explicitly stated -- and the count value just happens to be available at index 12 even though it's not related.  **Super Important** only use literal values when the answer is implied but not explicitly given!  Like in [part 2 of day 19, 2022](2022/19.json) where it gives the two values to multiply together, but doesn't actually do it and so the answer is trivial to obtain, but is only implied.  Or in **spoiler alert** [part 2 of day 4, 2020](2020/4.json) where it says "here are some invalid passports" and since they're all invalid the implied answer is "0", and in the second example it says "here are some valid passports" and since they're all valid the implied answer "4" can be trivially obtained by counting the number of passports.  **Super, duper imporant** in all other cases <ins>exclude the example</ins>!

### More Scenario Examples
- [day 2, 2020](2020/2.json): Answer implied and coincidentally available in an unrelated place
- [day 4, 2020](2020/4.json): Answers implied and not available at any alternate locations
- [day 5, 2020](2020/5.json): No part 2 example
- [day 5, 2020](2020/5.json): `em` selector works for one answer, and `code` selector works for others, but no common selector works for all answers
- [day 6, 2020](2020/6.json): Multiple examples
- [day 16, 2020](2020/16.json): Irregular format
- [day 25, 2020](2020/25.json): Input split across 2 separate index locations

## Finding Indexes

AoCC includes a command `index` that is useful for finding indexes that match the values you need.  See the [documentation](../docs/commands.md#index) for more information and examples.

<a id="additional-info"></a>
## Additional Info

In most cases `part` and `test` can be used to determine additional values needed in calculating the solution.  However in some cases it can't be determined and additional information is needed.  In those cases `additionalInfo` will have a property with the necessary value.  For example, in part 1 of [day 21, 2023](2023/21.json) the example is based on the elf taking 6 steps, while the actual input needs to be calculated for the elf taking 64 steps.  So far, so good.  Then, in part 2 **spoiler alert** the actual input needs to be calculated using over 20,000,000 steps!  That's a lot, but if that were the last difference then the combination of `part` and `test` would still be sufficient to determine how many steps to calculate for.  But, there are 7 additional examples given for part 2 -- and good thing! -- each one with a different number of steps.  In this case, `additionalInfo` will have property `numberOfSteps` to tell you how many steps to use in your calculation.

Example:

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

`additionalInfos` is an optional structure that can be used to supply information in addition to the puzzle inputs to the solver.  Properties:
- `key` defines the property name that will be used in the `additionalInfo` object.
- `selector` is the selector used to search the puzzle for additional info and works the same as `inputs.selector` above and must have the same number of entries as it.
- `indexes` is an array of indexes specifying the location of additional info within the puzzle for each example.

Using the example above, the following object would be passed to the `additionalInfo` parameter of the solver function for the first example:

```typescript
additionalInfo = { "numberOfSteps": 6 }
```