# Commands

AoC Copilot (AoCC) supports a few custom commands:
- [stats-print](#stats-print)
- [stats-sync](#stats-sync)
- [leaderboard-to-csv](#leaderboard-to-csv)
- [index](#index)
- [refresh](#refresh)
- [cache](#cache)

Help is available from the command line by running:

```shell
npx aoc-copilot --help
```

and on specific commands by running:

```shell
npx aoc-copilot <command> --help
```

## Competing

<a id="stats-print"></a>
### stats-print

Displays how long it took you to complete each puzzle part once you started it.  AoCC keeps track of when you first retrieved a puzzle for a day, and then when you finished parts 1 and 2.  This is great if you want to compete in your own timezone since the clock starts when you download the puzzle, not when it is first released.  In order for these stats to be most meaningful you need to download each puzzle using AoCC the first time in order to start the clock accurately.  Since the stats are easily manipulated -- intentionally or not -- they are best used for competing with yourself and tracking your own times.

Usage:

```shell
npx aoc-copilot stats-print <year>
```

For example:

```shell
npx aoc-copilot stats-print 2024
```

will print the local stats for 2024 puzzles in h:mm:ss for both parts by day:

```shell
Day   --Part 1-   --Part 2-
 25    00:20:17   233:01:41
 24    00:39:59   136:22:51
 23    00:09:29    00:28:43
 22    00:10:58    01:39:33
...
```

<a id="stats-sync"></a>
### stats-sync

Synchronizes your local stats for a year with completion times from a leaderboard.  Useful for when you submitted an answer directly on the AoC website instead of through AoCC in order to capture the missing finish time.

Usage:

```shell
npx aoc-copilot stats-sync <year> [--leaderboard-id <number>] [--member-id <number>] [--refresh]
```

- --leaderboard-id: ID of the leaderboard you wish to sync with.  If excluded then it will attempt to find and use the value from the LEADERBOARD_ID variable in your `.env` file.
- --member-id: ID of the member on the leaderboard you'd like to sync local stats with.  If excluded then it will use the same value as leaderboard ID, which works well when you're synchronizing to your own, private leaderboard since your private leaderboard ID is the same as your member ID.  If you're syncing with someone else's leaderboard then you need to specify your own member ID.
- --refresh: Refresh first, if possible.  Refreshing leaderboards is throttled to once every 15 minutes (across all leaderboards).  Defaults to true.

For example:

```shell
npx aoc-copilot stats-sync 2024 --leaderboard-id 1234567 --member-id 9876543 --refresh
```

will first refresh (if possible) and then syncronize local stats for 2024 with leaderboard ID 1234567 for member ID 9876543:

```shell
Synchronizing 2024 local stats using leaderboard ID 1234567 and member ID 9876543... Done
```

<a id="leaderboard-to-csv"></a>
### leaderboard-to-csv

Transforms the leaderboard JSON into a tabular CSV format for consumption in tools like Excel.  The "Completed" column is in [Unix time](https://en.wikipedia.org/wiki/Unix_time), so to convert it to an EST timestamp you can use the following Excel formula (where A1 is the cell where the Completed value is at):  `=(A1-18000)/86400+DATE(1970,1,1)`.

Usage:

```shell
npx aoc-copilot leaderboard-to-csv <year> [--leaderboard-id] [--filename] [--refresh]
```

- --leaderboard-id: ID of the leaderboard you wish to sync with.  If excluded then it will attempt to find and use the value from the LEADERBOARD_ID variable in your `.env` file.
- --filename (optional) - path to output file.  Defaults to `leaderboard_<ID>_<year>.csv`.
- --refresh: Refresh first, if possible.  Refreshing leaderboards is throttled to once every 15 minutes (across all leaderboards).  Defaults to true.

For example:

```shell
npx aoc-copilot leaderboard-to-csv 2024 --leaderboard-id 1234567 --filename my-leaderboard.csv --refresh
```

will first refresh (if possible) the 2024 leaderboard ID 1234567 and output it to file my-leaderboard.csv in the current directory:

```shell
Converting 2024 leaderboard ID 1234567 to CSV and writing to file my-leaderboard.csv... Done
```


## Development

Commands in this group are useful during development - both of puzzle solutions as well as further enhancement of AoCC.

<a id="index"></a>
### index

Display the index numbers and corresponding values for a selector which is particularly useful in creating an [example database (EGDB)](./egdb.md) entry.

Usage:

```shell
npx aoc-copilot index <year> <day> [selector]
```

For example:

```shell
npx aoc-copilot index 2020 2
```

will search the 2020 day 2 puzzle for the default selector `code` and display a list of indexes and values like:

```shell
Puzzle 2020 day 2 indexes matching selector 'code':
000:  <<< Matches Default Search Strategy for Inputs
1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc

001:  1-3 a
002:  a
003:  1
004:  3
005:  2  <<< Matches Default Search Strategy for Part 1 Answer
...
```

Values without line breaks are shown immediately to the right of the index (e.g. indexes 1, 2 and 3), and multi-line ones are shown starting on a new line after the index (e.g. index 0).

Values that match the Default Search Strategy are indicated with a comment to the right, following "<<<", which can be helpful in constructing an [EGDB](./egdb.md) entry.

You can use compound selectors, too:

```shell
npx aoc-copilot index 2020 2 "code, em"
```

```shell
Puzzle 2020 day 2 indexes matching selector 'code, em':
000:  passwords
001:  the corporate policy when that password was set
002:  
1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc

003:  1-3 a
004:  a
005:  1
...
```

<a id="refresh"></a>
### refresh

Force the re-download of the puzzle page, and optionally the inputs.  Useful if your local cache has gotten out of sync with your actual progress, for example if you manually enter an answer on the website and AoCC is unaware of it.

Usage:

```shell
npx aoc-copilot refresh <file> <year> [day] [--leaderboard-id <number>]
```

Where <file> is puzzle, input or leaderboard.

For example, to re-download the puzzle for 2020 day 2:

```shell
npx aoc-copilot refresh puzzle 2020 2
```

Or to re-download the input file:

```shell
npx aoc-copilot refresh input 2020 2
```

Or to re-download the 2020 leaderboard file with ID 1234567:
```shell
npx aoc-copilot refresh leaderboard 2020 --leaderboard-id 1234567
```

## Troubleshooting

<a id="cache"></a>
### cache

Prints the location where puzzles, inputs and attempted answers are cached.  For example:

```shell
npx aoc-copilot cache
```

will print

```shell
Cache location: C:\Users\<user>\AppData\Local\AoC-Copilot
```

on Windows, or the equivalent path on Linux or Mac.