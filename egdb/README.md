# Example Database

## Finding Examples

AoC Copilot is pretty good at finding examples on puzzle pages by looking for common patterns.  For example, the default search strategy worked for 19 out of 25 days in 2023.  Reasons the default search may fail include:
<a id="reasons"></a>
- Multiple examples
- Irregular format
- Implied answer
- No example

In cases like these the Copilot needs additional instructions to help it identify examples, and this is where the **Example Database** (egdb) comes into play.

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
This entry tells the Copilot to take the contents of the 0th `code` element and use it as input for part 1, and the 16th one as input for part 2.  Similarly, the answers for parts 1 and 2 are found at indexes 5 and 24, respectively.

Now let's break this down field-by-field:
- `reason` is free text that can be used to document why the entry is necessary.  **Suggestion**: use one of the [reasons](#reasons) listed above.
- `part1length` indicates how many values listed in `inputs.indexes`, `answers.indexesOrLiterals` and `additionalInfos.indexes` relate to part 1, with the rest belonging to part 2.
- `inputs.selector` is the selector used to search the puzzle for example inputs.  **Suggestion**: keep it simple; default to `code` and only get fancy if that doesn't cut it.  You can use the subset of jQuery [selectors](https://cheerio.js.org/docs/intro#selecting-elements) that are implemented by [Cheerio](https://cheerio.js.org/).
- `inputs.indexes` is an array of indexes that point to the location(s) in the puzzle where example inputs can be found.  The elements of the array are usually indexes, but can also be a nested array of indexes to support those edge cases where multiple values need to be combined into one set of inputs (e.g. [day 25, 2020](2020/25.json)).
- `answers.selector` is the selector used to search the puzzle for example answers and works the same as `inputs.selector` above.
- `answers.indexesOrLiterals` is an array of indexes that point to the location of the example answers, or literal values of the answers themselves.  **Important** always prefer indexes over literal values!  Never list literal values if the value is available somewhere, _anywhere_, within the puzzle -- even if it's just a coincidence like in [day 2, 2020](2020/2.json) where the answer is implied by counting -- but is not explicitly stated -- and the count value just happens to be available at index 12 even though it's not related.  **Super Important** only use literal values when the answer is implied but not explicitly given!  Like in [part 2 of day 19, 2022](2022/19.json) where it gives the two values to multiply together, but doesn't actually do it and so the answer is trivial to obtain, but is only implied.  Or in **spoiler alert** [part 2 of day 4, 2020](2020/4.json) where it mentions the first list contains "none" and so the literal value "0" is implied, and in the second example where it mentions "all" and the answer "4" is implied by counting "all" of the lines.  **Super, duper imporant** in all other cases <ins>exclude the example</ins>!