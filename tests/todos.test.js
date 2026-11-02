const request = require("supertest");
const { createApp } = require("../src/app");
const { createTodoStore } = require("../src/todos.store");

const TITLE_ERROR = { error: "title must be a string of 1-100 characters" };
const ID_ERROR = { error: "id must be a positive integer" };
const NOT_FOUND_ERROR = { error: "Todo not found" };

let app;

async function createTodo(title = "Buy milk") {
  const res = await request(app).post("/todos").send({ title });
  return res.body;
}

async function listTodos() {
  const res = await request(app).get("/todos");
  return res.body;
}

beforeEach(() => {
  app = createApp();
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("POST /todos", () => {
  it("creates a todo", async () => {
    const res = await request(app).post("/todos").send({ title: "Buy milk" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(Number),
      title: "Buy milk",
      done: false,
    });
  });

  it.each([1, 100])("accepts a %d-character title", async (length) => {
    const title = "a".repeat(length);
    const res = await request(app).post("/todos").send({ title });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(title);
  });

  it.each([
    ["missing", {}],
    ["empty", { title: "" }],
    ["over 100 characters", { title: "a".repeat(101) }],
    ["a number", { title: 123 }],
    ["null", { title: null }],
    ["an array", { title: ["Buy milk"] }],
    ["an object", { title: { text: "Buy milk" } }],
  ])("returns the 400 error body when title is %s", async (_name, body) => {
    const res = await request(app).post("/todos").send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual(TITLE_ERROR);
    expect(await listTodos()).toEqual([]);
  });

  it("returns 400 without a body", async () => {
    const res = await request(app).post("/todos");
    expect(res.status).toBe(400);
    expect(res.body).toEqual(TITLE_ERROR);
  });

  it("returns the 400 error body for a JSON array body", async () => {
    const res = await request(app).post("/todos").send(["Buy milk"]);
    expect(res.status).toBe(400);
    expect(res.body).toEqual(TITLE_ERROR);
  });

  it("returns only an error key for malformed JSON", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Content-Type", "application/json")
      .send("{bad");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: expect.any(String) });
  });
});

describe("GET /todos", () => {
  it("lists todos as JSON", async () => {
    const todo = await createTodo();
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual([todo]);
  });
});

describe("PATCH /todos/:id", () => {
  it("marks a todo done when the body has no changes", async () => {
    const todo = await createTodo();
    const res = await request(app).patch(`/todos/${todo.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...todo, done: true });
    expect(await listTodos()).toEqual([{ ...todo, done: true }]);
  });

  it("leaves a todo done when patched again", async () => {
    const todo = await createTodo();
    await request(app).patch(`/todos/${todo.id}`);
    const res = await request(app).patch(`/todos/${todo.id}`);
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it("renames a todo without changing done", async () => {
    const todo = await createTodo();
    const res = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ title: "Buy oat milk" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...todo, title: "Buy oat milk" });
    expect(await listTodos()).toEqual([res.body]);
  });

  it("sets done from the body", async () => {
    const todo = await createTodo();
    await request(app).patch(`/todos/${todo.id}`);
    const res = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ done: false });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(todo);
  });

  it("updates title and done together", async () => {
    const todo = await createTodo();
    const res = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ title: "New", done: true });
    expect(res.body).toEqual({ ...todo, title: "New", done: true });
  });

  it("returns 400 for a title over 100 characters", async () => {
    const todo = await createTodo();
    const res = await request(app)
      .patch(`/todos/${todo.id}`)
      .send({ title: "a".repeat(101) });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(TITLE_ERROR);
    expect(await listTodos()).toEqual([todo]);
  });

  it.each(["yes", 1, null])("returns 400 when done is %s", async (done) => {
    const todo = await createTodo();
    const res = await request(app).patch(`/todos/${todo.id}`).send({ done });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "done must be a boolean" });
    expect(await listTodos()).toEqual([todo]);
  });

  it.each([[{ Done: false }], [{ titel: "x" }]])(
    "returns 400 for unknown fields in %j",
    async (body) => {
      const todo = await createTodo();
      const res = await request(app).patch(`/todos/${todo.id}`).send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "body must include title or done" });
      expect(await listTodos()).toEqual([todo]);
    },
  );

  it("returns the 404 error body for an unknown id", async () => {
    const res = await request(app).patch("/todos/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(NOT_FOUND_ERROR);
  });

  it.each(["abc", "0", "-1", "1.5", "0x10", "1e0", "01", "%201"])(
    "returns the 400 error body for id %s",
    async (id) => {
      const res = await request(app).patch(`/todos/${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual(ID_ERROR);
    },
  );

  it("changes only the targeted todo", async () => {
    const first = await createTodo("First");
    const second = await createTodo("Second");
    await request(app).patch(`/todos/${second.id}`);
    expect(await listTodos()).toEqual([first, { ...second, done: true }]);
  });
});

describe("DELETE /todos/:id", () => {
  it("deletes a todo", async () => {
    const todo = await createTodo();
    const res = await request(app).delete(`/todos/${todo.id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(await listTodos()).toEqual([]);
  });

  it("leaves todos in place for an unknown id", async () => {
    const todo = await createTodo();
    const res = await request(app).delete("/todos/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(NOT_FOUND_ERROR);
    expect(await listTodos()).toEqual([todo]);
  });

  it.each(["abc", "0", "-1", "1.5", "0x10", "1e0", "01", "%201"])(
    "returns the 400 error body for id %s",
    async (id) => {
      const res = await request(app).delete(`/todos/${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual(ID_ERROR);
    },
  );

  it("returns 404 when deleting or patching a deleted todo", async () => {
    const todo = await createTodo();
    await request(app).delete(`/todos/${todo.id}`);
    const deleted = await request(app).delete(`/todos/${todo.id}`);
    const patched = await request(app).patch(`/todos/${todo.id}`);
    expect(deleted.status).toBe(404);
    expect(patched.status).toBe(404);
    expect(patched.body).toEqual(NOT_FOUND_ERROR);
  });

  it("does not reuse a deleted id", async () => {
    const todo = await createTodo();
    await request(app).delete(`/todos/${todo.id}`);
    const next = await createTodo();
    expect(next.id).not.toBe(todo.id);
  });
});

describe("todo store", () => {
  it("does not expose its internal state", () => {
    const store = createTodoStore();
    const created = store.create("Buy milk");
    const expected = { ...created };

    created.title = "changed";
    store.update(created.id, {}).title = "changed";
    store.list()[0].title = "changed";
    store.list().pop();

    expect(store.list()).toEqual([expected]);
  });
});

describe("unknown routes", () => {
  it("returns 404 JSON", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
});
