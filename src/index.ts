/**
 * TODO:
 * - Add a script for searching tag indexes like npm aoc-copilot-search 2020 13 code
 * - Accomodate people who want separate files for parts 1 and 2
 * - Wait until midnight EST before downloading a new puzzle
 * - Add more tests
 *   - https://jestjs.io/docs/mock-functions
 *   - https://jestjs.io/docs/manual-mocks#mocking-node-modules
 * - Expand documentation
 * - Add LLM parsing of examples?
 * - (tried, too much work?) Make interoperable for ES Modules and CommonJS
 *   - https://nodejs.org/api/packages.html#dual-commonjses-module-packages
 *   - https://nodejs.org/api/packages.html#conditional-exports
 *   -  https://evertpot.com/universal-commonjs-esm-typescript-packages/
 *   - https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1
 *   - https://thesametech.com/how-to-build-typescript-project/
 */

export { run } from './runner';