/**
 * TODO:
 * - Add runner switch to bypass tests simply
 * - Add more tests
 *   - https://jestjs.io/docs/mock-functions
 *   - https://jestjs.io/docs/manual-mocks#mocking-node-modules
 * 
 * MAYBE:
 * - Accomodate people who want separate files for parts 1 and 2
 * - Add LLM parsing of examples?
 * 
 * DON'T:
 * - Make interoperable for ES Modules and CommonJS --> tried, too much work
 *   - https://nodejs.org/api/packages.html#dual-commonjses-module-packages
 *   - https://nodejs.org/api/packages.html#conditional-exports
 *   - https://evertpot.com/universal-commonjs-esm-typescript-packages/
 *   - https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1
 *   - https://thesametech.com/how-to-build-typescript-project/
 * 
 * DONE:
 * - Add a script for searching elements like npx aoc-copilot index 2020 13 em
 * - Expand documentation
 * - Wait until midnight EST before downloading a new puzzle
 * - Calculate how long it took from first download to completion of parts 1 and 2
 * - Add transforms to answers such as: replaceAll, match, etc.
 * - Fix where test results don't print until after all tests complete for a part e.g. 2019 day 5 part 2
*/

export { run } from './runner';