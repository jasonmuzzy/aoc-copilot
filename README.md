# Advent of Code Copilot

AoC Copilot (AoCC) helps you iterate through cycles of code...test faster by automatically extracting the examples from [Advent of Code](https://adventofcode.com/) puzzles and running your solutions against them.  Then, when all examples pass, it runs your solution against your unique input and offers to submit the answer.

## Table of Contents
- [Years Supported](#years-supported)
- [Installation](#installation)
- [Preparation](#preparation)
    - [AoC Session Cookie](#aoc-session-cookie)
    - [Corporate Networks and Self-Signed Certificates (Optional)](#corporate-networks-and-self-signed-certificates)
- [Usage](#usage)
    - [TypeScript](#typescript)
    - [Description of `solve` parameters](#solve-parameters)
    - [Description of `run` parameters](#run-parameters)
- [Commands](#commands)
- [Features](#features)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

<a id="years-supported"></a>
## Years Supported

Currently, years 2020 - 2023 are fully supported out-of-the-box.

In addition, you can add support for as-yet unsupported years or days by leveraging the [optional `run` parameters](#run-parameters).

Years 2019 and earlier may offer partial support but are untested.  Please [contribute](#contributing) to expand support!

<a id="installation"></a>
## Installation
```shell
npm install aoc-cockpit
```

<a id="preparation"></a>
## Preparation

<a id="aoc-session-cookie"></a>
### AoC Session Cookie

This copilot will connect to the [Advent of Code](https://adventofcode.com/) website to retrieve puzzles and inputs on your behalf.
In order for this to work, you need to retrieve your session ID from the adventofcode.com cookie and store it in a `.env` file in the root of your project.

Steps for Chromium-based browsers like Chrome and Edge:
1. Browse to [Advent of Code](https://adventofcode.com/) and log in
2. Open Developer Tools (F12)
3. Click the "Application" tab
4. In the "Storage" section expand "Cookies"
5. Click on https<nolink>://adventofcode.com
6. Copy the value from the session row
7. Open or create a `.env` file in the root of your project
8. Add a line `AOC_SESSION_COOKIE="session="` and paste your session value after the equals sign

Example `.env` file:
```
AOC_SESSION_COOKIE="session=**your_session_value**"
```

<a id="corporate-networks-and-self-signed-certificates"></a>
### Corporate Networks and Self-Signed Certificates (Optional)

If you are on a network that has a self-signed certificate then you will receive a `SELF_SIGNED_CERT_IN_CHAIN` error when attempting to connect to the AoC website.

Steps to [override](https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions) the normal certificate authorities with your own certificate bundle:
1. Browse to [Advent of Code](https://adventofcode.com/) and log in
2. Open Developer Tools (F12)
3. Click on the Security tab (if you don't see it, click the "+" sign and add it)
4. Click "View certificate"
5. Click on the Details tab
6. Select the root certificate (the one at the top of the hierarchy) and click Export and save it somewhere locally
7. Repeat for the intermediate certificate (the second one in the hierarchy)
8. Repeat for the primary certificate (the third one in the hierarchy)
9. Open or create a `.env` file in the root of your project
10. Add a line `CERTIFICATE=""` and paste the contents of the certificates inside the double quotes in **reverse** hierarchy order (primary, intermediate, root)

Example `.env` file:
```
AOC_SESSION_COOKIE="session=**your_session_value**"
CERTIFICATE="-----BEGIN CERTIFICATE-----
**your_primary_certificate**
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
**your_intermediate_certificate**
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
**your_root_certificate**
-----END CERTIFICATE-----"
```

<a id="usage"></a>
## Usage

<a id="typescript"></a>
### TypeScript

Create a new file named `aocYYDD.ts` where YY is the two-digit year and DD is the two-digit day of the puzzle you are solving and paste the following code:
```ts
import { run } from 'aoc-copilot';

async function solve(inputs: string[], part: number, test: boolean, additionalInfo?: { [key:string]: string }): Promise<number | string> {
    let answer = 0;
    throw new Error('Not implemented'); // <-- Replace with your solution (raising an exception forces printing the example input and answer to the console)
    return answer;
}

run(__filename, solve);
```

<a id="solve-parameters"></a>
### Description of `solve` parameters

`solve` parameters:
- `inputs` (string[]): Contents of the example or actual inputs
- `part` (integer): Indicates whether the solver is being called for part 1 or part 2
- `test` (boolean): Indicates whether the solver is being run for an example or actual input
- `additionalInfo` (object): In most cases `part` and `test` can be used to determine additional values needed in calculating the solution, like "number of steps".  However in some cases it can't be determined and additional information is needed.  In those cases `additionalInfo` will have a property that contains the value.  For example, **Mild Spoiler Follows** in part 1 of day 23, 2023 the example is based on the elf taking 6 steps, while the actual input needs to be calculated for the elf taking 64 steps.  So far, so good.  Then, in part 2 the actual input needs to be calculated using over 20,000,000 steps!  That's a lot, but if that were the last difference then the combination of `part` and `test` would still be sufficient to determine how many steps to calculate for.  But, there are 7 additional examples given for part 2 -- and good thing! -- each one with a different number of steps.  In this case, `additionalInfo` will have property `numberOfSteps` to tell you how many steps to use in your calculation.
- Returns (promise<number | string>): Most puzzles have a numeric answer, but a few answers are strings. 

<a id="run-parameters"></a>
### Description of `run` parameters

`run` parameters:
- `yearDay` (string | { year: number, day: number }): Name your file xxxYYDD.xx (e.g. aoc2301.ts) where YY is the 2-digit year and DD is the day being solved, then pass __filename to this parameter.  Optionally, pass an object where you specify the year and day explicitly.
- `solver` (function): pass your solver function, for example `solve`.
- `testsOnly` (boolean): Set to `true` to force the Copilot to run only the examples, or set to `false` (default) to allow the Copilot to automatically run examples and/or actual inputs.
- `addDb` (object): If the Copilot doesn't find the examples on its own you can use this parameter to tell it how to find them, or use it to override the ones it found.  See the [example database documentation](egdb/README.md) for details on the structure.  Consider contributing your database entry for days that don't yet have them!
- `addTc` (array): **TODO:** document how to supply additional test cases e.g. <https://www.reddit.com/r/adventofcode/comments/18o1071/2023_day_21_a_better_example_input_mild_part_2/>

<a id="commands"></a>
## Commands
AoC Copilot supports a few different commands that can be useful during development and for troubleshooting.  See the [documentation](docs/commands.md).

<a id="features"></a>
## Features

- Automatically retrieves example inputs and answers
- Runs your solution against the examples and compares the answers
- Runs your solution against the puzzle input if all examples pass
- Submits the answer and reports back whether it was correct or not
- Regression tests your solution against the input if an answer was previously accepted
- For both parts 1 and 2

<a id="contributing"></a>
## Contributing

Contributions to the [example database](egdb/README.md) are needed for years 2020 and earlier.

<a id="acknowledgements"></a>
## Acknowledgements

Thank you to [Eric Wastl](http://was.tl/), the creator of [Advent of Code](https://adventofcode.com)!

AoC Copilot attempts to honor Eric's wishes in the following ways:

- Caches puzzles and inputs in order to [be gentle](https://www.reddit.com/r/adventofcode/comments/3v64sb/aoc_is_fragile_please_be_gentle/), storing them in the user's home directory so that [puzzles and inputs won't be stored in a public repository](https://adventofcode.com/2023/about#faq_copying).
- Remembers previous incorrect answers so it doesn't submit a duplicate, and waits the required amount of time to submit a new answer after submitting a wrong answer (1, 5, 10 or 15 minutes after 1, 3, 7 or 11 incorrect guesses in a row, respectively).  Also avoids submitting answers that are lower/higher than known too low/too high answers.
- Identifies itself with the [User-Agent header](https://www.reddit.com/r/adventofcode/comments/z9dhtd/please_include_your_contact_info_in_the_useragent/) so that the AoC site has a way to identify traffic generated by this project.

<a id="license"></a>
## License
[MIT](LICENSE)