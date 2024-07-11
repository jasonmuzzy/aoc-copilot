# Advent of Code Copilot

Automatically run examples and inputs for [Advent of Code](https://adventofcode.com/) puzzles.

## Installation
`npm install aoc-cockpit`

## Preparation

### AoC Session Cookie

This copilot will connect to the [Advent of Code](https://adventofcode.com/) website to retrieve puzzles and inputs on your behalf.
In order to do this, you need to retrieve your session ID from the adventofcode.com cookie and store it in a `.env` file in the root of your project.

Steps for Chromium-based browsers like Chrome and Edge:
1. Browse to [Advent of Code](https://adventofcode.com/) and log in
2. Open Developer Tools (F12)
3. Click the "Application" tab
4. In the "Storage" section expand "Cookies"
5. Click on https://adventofcode.com
6. Copy the value from the session row
7. Open or create a `.env` file in the root of your project
8. Add a line `AOC_SESSION_COOKIE="session=your_session_value"`
9. Afterwards, your `.env` file should look like this:
<pre><code><span style="color:blue">AOC_SESSION_COOKIE=</span>"session=your_session_value"
</code></pre>

### Corporate Networks and Self-Signed Certificates (Optional)

If you are on a network that has a self-signed certificate then you will receive a `SELF_SIGNED_CERT_IN_CHAIN` error when attempting to connect to the AoC website.

Steps for Chromium-based browsers like Chrome and Edge:
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
11. Afterwards, your `.env` file should look like this:
<pre><code><span style="color:blue">AOC_SESSION_COOKIE=</span>"session=your_session_value"
<span style="color:blue">CERTIFICATE=</span>"-----BEGIN CERTIFICATE-----
<b>your_primary_certificate</b>
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
<b>your_intermediate_certificate</b>
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
<b>your_root_certificate</b>
-----END CERTIFICATE-----"
</code></pre>

See:  Node [options.ca](https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions)

## Usage

### TypeScript

Create a new file named `aocYYDD.ts` where YY is the two-digit year and DD is the two-digit day of the puzzle you are solving and paste the following code:
```
import { run } from 'aoc-copilot';

async function solve(inputs: string[], part: number, test: boolean): Promise<number | string> {
    let answer = 0;
    throw new Error('Not implemented'); // Forces output of input and expected answer to console
    /**
    * TODO:
    * 1. Remove throw
    * 2. Calculate answer
    */
    return answer;
}

run(__filename, solve);
```

## Features

- Automatically retrieves example inputs and answers
- Caches puzzles and inputs [as requested](https://www.reddit.com/r/adventofcode/comments/3v64sb/aoc_is_fragile_please_be_gentle/).
- Identifies itself [as requested](https://www.reddit.com/r/adventofcode/comments/z9dhtd/please_include_your_contact_info_in_the_useragent/).
- Runs your solution against the examples and compares the answers
- Runs your solution against the puzzle input if all examples pass
- Submits the answer and reports back whether it was correct or not
- Regression tests your solution against the input if an answer was previously accepted
- For both parts 1 and 2