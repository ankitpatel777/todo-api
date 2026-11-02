# Todo API

## API

- `GET /health` returns `{ "status": "ok" }`.
- `GET /todos` lists todos.
- `POST /todos` creates a todo from `{ "title": "..." }`.
- `PATCH /todos/:id` updates `title` and/or `done` from a JSON object. An empty body or `{}` marks the todo done; any other body with neither field returns 400.
- `DELETE /todos/:id` deletes a todo.
