# Advent of Code Copilot

Advent of Code Copilot (AoCC) helps you iterate through cycles of code and test faster by automatically extracting examples from [Advent of Code](https://adventofcode.com/) puzzles and running your solutions against them.  After all examples pass, it runs your unique input and submits the answer.

## Table of Contents
- [Years Supported](#years-supported)
- [Installation](#installation)
- [Preparation](#preparation)
    - [Session Cookie](#session-cookie)
    - [Corporate Networks and Self-Signed Certificates (Optional)](#corporate-networks-and-self-signed-certificates)
- [Getting Started](#getting-started)
    - [TypeScript](#typescript)
    - [Solver](#solver)
    - [Runner](#runner)
- [Process Flow](#process-flow)
- [Commands](#commands)
- [Features](#features)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

<a id="years-supported"></a>
## Years Supported

Currently, years 2018 - 2024 are fully tested and supported for all features.

*Year 2015 is in process, with days 1 - 14 supported.*
*Year 2017 is in process, with days 1 - 18 supported.*

**Q**.  What about 2025 and beyond?  Can I use it as soon as a new puzzle drops?<br>
**A**.  Probably, for most days.  Advent of Code generally follows a consistent structure from year-to-year, so most features of AoCC should work with future years.  The availability of *examples* is the only thing that is likely to vary.  AoCC uses a default search strategy (DSS) for extracting examples from most puzzles.  In 2024, the DSS automatically extracted examples for 14 out of 25 days.  In 2023, it automatically extracted them for 18 out of 25 days.  The rest required [example database](docs/egdb.md) entries to extract.  2022 was very similar with the DSS working for 20 days.  Assuming AoC follows the same structure in future years, AoCC should be able to automatically extract examples for most days.

**Q**.  What do I do if AoCC doesn't properly extract examples for a day?  Am I stuck?<br>
**A**.  No, you're not stuck.  You have two options when configuring the [runner](docs/runner.md):
1) Skip the examples and only run against actual inputs by setting `skipTests` to true
2) Provide the `addDb` parameter to the runner so it knows where to find the examples.  If you go this route then please consider [contributing](#contributing) it to the [example database](docs/egdb.md) so others can benefit as well!

**Q**.  What about 2015 - 2017?<br>
**A**.  Based on how differently 2018 and 2019 were structured compared to more recent years, I expect very few (if any) examples to be automatically available for 2017 or earlier.  You can still use all the other features of AoCC, but plan to use one of the techniques above to skip the examples or provide their locations.

<a id="installation"></a>
## Installation
```shell
npm install aoc-copilot
```

<a id="preparation"></a>
## Preparation

<a id="session-cookie"></a>
### Session Cookie

AoCC connects to the Advent of Code website to retrieve puzzles and inputs on your behalf.  In order for this to work, you need to retrieve your session ID from the adventofcode.com cookie and store it in a `.env` file in the root of your project.  If you're syncing with a repo like GitHub them make sure to add `.env` to your `.gitignore` file to prevent leaking your session ID.

Steps for Chromium-based browsers like Chrome and Edge:
1. Browse to [Advent of Code](https://adventofcode.com/) and log in
2. Open Developer Tools (F12)
3. Click the "Application" tab
4. In the "Storage" section expand "Cookies"
5. Click on https<nolink>://adventofcode.com
6. Copy the value from the session row
7. Open or create a `.env` file in the root of your project
8. Add a line `AOC_SESSION_COOKIE=` and paste your session value after the equals sign

For example:
```
AOC_SESSION_COOKIE=**your_session_value**
```

<a id="corporate-networks-and-self-signed-certificates"></a>
### Corporate Networks and Self-Signed Certificates (Optional)

If you're on a network that has a self-signed certificate then you will receive a `SELF_SIGNED_CERT_IN_CHAIN` error when attempting to connect to the Advent of Code website.  As above, make sure to add `.env` to your `.gitignore` file to prevent leaking sensitive information.

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

For example:
```
AOC_SESSION_COOKIE=**your_session_value**
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

<a id="getting-started"></a>
## Getting Started

<a id="typescript"></a>
### TypeScript

Create a new file named `aocYYDD.ts` where YY is the two-digit year and DD is the two-digit day of the puzzle you are solving and paste the following code:
```TypeScript
import { NotImplemented, run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;
    throw new NotImplemented('Not implemented'); // <-- Replace with your solution
    return answer;
}

run(__filename, solve);
```

Run it.

The console will show the example and expected answer.

Replace the `throw new NotImplemented` line of code with your solution and set `answer` to the result.  Run it again.

First AoCC will run your solver against the example.  If the example passes then AoCC will run it against the actual input and offer to submit the answer for you.  If not it will stop and let you know.

<a id="solver"></a>
### Solver

The `solve` function, or "solver", is where you write code to solve the puzzle.  See the inline comments in the [TypeScript](#typescript) above for explanations of most of the parameters.

<a id="solver-additional-info"></a>
`additionalInfo` is an optional parameter that is only used with some puzzles that contain multiple examples.  For example, part 2 of [day 21, 2023](https://adventofcode.com/2023/day/21) provides seven examples, and each one must be calculated for a different number of steps the elf takes, so in this case `additionalInfo` contains a `steps` attribute with the necessary value.

<a id="runner"></a>
### Runner

The `run` function, or "runner", takes your solver and automates running it.  It's highly configurable -- including by command line arguments -- but only the simplest example is shown above.  See the [docs](docs/runner.md) for more info.

<a id="commands"></a>
## Commands
AoCC supports a few different commands that can be useful during development and for troubleshooting.  See the [documentation](docs/commands.md).

<a id="features"></a>
## Features

- Automatically retrieves example inputs and answers
- Runs your solution against the examples and checks for a matching answer
- Runs your solution against the actual input after all examples pass
- Submits the answer and reports back whether it was correct or not
- Compares answer to previously know too high/too low answers and rejects them if they're still too high/too low
- Regression tests your solution against the input if an answer was previously accepted

<a id="contributing"></a>
## Contributing

Contributions to the [example database](docs/egdb.md) are welcome and needed!

<a id="acknowledgements"></a>
## Acknowledgements

Thank you to [Eric Wastl](http://was.tl/), the creator of [Advent of Code](https://adventofcode.com)!

AoCC attempts to honor Eric's wishes in the following ways:

- Caches puzzles and inputs in order to [be gentle](https://www.reddit.com/r/adventofcode/comments/3v64sb/aoc_is_fragile_please_be_gentle/), storing them in the user's home directory so that [puzzles and inputs won't be stored in a public repository](https://adventofcode.com/about#faq_copying).
- Remembers previous incorrect answers so it doesn't submit duplicates, and waits the required amount of time to submit new answers.
- Identifies itself with the [User-Agent header](https://www.reddit.com/r/adventofcode/comments/z9dhtd/please_include_your_contact_info_in_the_useragent/) so that the Advent of Code site has a way to identify traffic generated by this project.

<a id="license"></a>
## License
[MIT](LICENSE)
