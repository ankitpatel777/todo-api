---
name: add-endpoint
description: Add a new REST endpoint to the Todo API following project conventions. Use when asked to add or create an endpoint or route.
---

# Add endpoint

Endpoint to add: $ARGUMENTS

1. Add the data function in src/todos.store.js.
2. Add the route in src/todos.router.js. Validate input; return { "error": "..." } with 400 for bad input and 404 for an unknown id.
3. Add tests in tests/todos.test.js: one success case, one error case.
4. Run npm test and fix any failures.
5. Add the endpoint to the API list in README.md.
