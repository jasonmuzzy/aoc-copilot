# Advent of Code Copilot

Copilot for solving [Advent of Code](https://adventofcode.com/) puzzles.

## Features

- Automatically retrieves example inputs and answers
- Caches puzzles and inputs [as requested](https://www.reddit.com/r/adventofcode/comments/3v64sb/aoc_is_fragile_please_be_gentle/).
- Identifies itself [as requested](https://www.reddit.com/r/adventofcode/comments/z9dhtd/please_include_your_contact_info_in_the_useragent/).
- Runs your solution against the examples and compares the answers
- Runs your solution against the puzzle input if all examples pass
- Submits the answer and reports back whether it was correct or not
- Regression tests your solution against the input if an answer was previously accepted
- For both parts 1 and 2

## Usage

- .env file with AOC_SESSION_COOKIE="session=<your session ID>"
- .env file with CERTIFICATE="<your certificate chain>"