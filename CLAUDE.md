# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

This project is a freshly scaffolded Node.js API with no application code, tests, or commits yet. Only `package.json` and `package-lock.json` exist. There is no `.gitignore`, so `node_modules/` shows as untracked; add one before the first commit.

## Stack

- CommonJS modules (`"type": "commonjs"`), so use `require`/`module.exports`
- Express 5
- Jest and Supertest for tests (dev dependencies)
- Prettier for formatting (dev dependency, no config file, so its defaults apply)

`package.json` declares `index.js` as the entry point, but that file does not exist yet.

## Commands

```sh
npm install                       # install dependencies
npx jest                          # run all tests
npx jest path/to/file.test.js     # run a single test file
npx jest -t "test name"           # run tests matching a name
npx prettier --write .            # format
npx prettier --check .            # check formatting
```

`npm test` currently fails on purpose: the `test` script is still the npm placeholder. Change it to `jest` when adding the first test. No start script is defined.


See @docs/architecture.md for the design