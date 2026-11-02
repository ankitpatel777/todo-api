# Requirements

## Overview

`todo-api` is a Node.js REST API for managing todos, built with Express 5.

## Technical requirements

- Use CommonJS (`require`), not ES modules.
- Application code lives in `src/`, tests in `tests/`.
- Every endpoint has a Jest and Supertest test.
- Tests run with `npm test`.
- Errors are returned as JSON: `{ "error": "message" }`.

## Functional requirements

To be defined.

Todo API requirements
A todo has: id (number), title (string, 1-100 chars), done (boolean)
POST without a title returns 400
Unknown id returns 404
API style: REST, JSON only, port 3000
