# Todo API

## API

- `GET /health` returns `{ "status": "ok" }`.
- `GET /todos` lists todos.
- `POST /todos` creates a todo from `{ "title": "..." }`.
- `PATCH /todos/:id` updates `title` and/or `done`; with neither, it marks the todo done.
- `DELETE /todos/:id` deletes a todo.
