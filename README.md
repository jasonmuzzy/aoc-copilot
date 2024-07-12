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
    - [Extended `run` Options](#extended-run-options)
- [Features](#features)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

<a id="years-supported"></a>
## Years Supported

Currently, years 2021 - 2023 are fully supported out-of-the-box.

In addition, you can add support for as-yet unsupported years or days by leveraging the [extended `run` Options](#extended-run-options).

Years 2020 and earlier may offer partial support but are untested.  Please [contribute](#contributing) to expand support!

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
```json
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
```json
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
    /**
     * TODO: Remove the exception below which forces printing the input and expected answer to the console
    */
    throw new Error('Not implemented');
    /**
     * TODO: Implement solution
    */
    return answer;
}

run(__filename, solve);
```

<a id="extended-run-options"></a>
### Extended `run` Options

**TODO:** document how to supply own egdb entries to add support for as-yet unsupported years/days.

**TODO:** document how to supply additional test cases e.g. <https://www.reddit.com/r/adventofcode/comments/18o1071/2023_day_21_a_better_example_input_mild_part_2/>

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

Contributions to the [example database](src/egdb.md) are needed for years 2020 and earlier.

<a id="acknowledgements"></a>
## Acknowledgements

Thank you to [Eric Wastl](http://was.tl/), the creator of [Advent of Code](https://adventofcode.com)!

AoC Copilot attempts to honor Eric's wishes in the following ways:

- Caches puzzles and inputs in order to [be gentle](https://www.reddit.com/r/adventofcode/comments/3v64sb/aoc_is_fragile_please_be_gentle/).
- Targets the user's home directory as the cache store so that [puzzles and inputs won't be stored in a public repository](https://adventofcode.com/2023/about#faq_copying).
- Identifies itself with the [User-Agent header](https://www.reddit.com/r/adventofcode/comments/z9dhtd/please_include_your_contact_info_in_the_useragent/) so that the AoC site has a way to identify traffic generated by this project.

<a id="license"></a>
## License
[MIT](LICENSE)