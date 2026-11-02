const request = require("supertest");
const app = require("../src/app");

describe("POST /todos", () => {
  it("creates a todo", async () => {
    const res = await request(app).post("/todos").send({ title: "Buy milk" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, title: "Buy milk", done: false });
  });

  it("returns 400 without a title", async () => {
    const res = await request(app).post("/todos").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it("returns 400 without a body", async () => {
    const res = await request(app).post("/todos");
    expect(res.status).toBe(400);
  });

  it("returns 400 for a title over 100 characters", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "a".repeat(101) });
    expect(res.status).toBe(400);
  });

  it("returns 400 JSON for malformed JSON", async () => {
    const res = await request(app)
      .post("/todos")
      .set("Content-Type", "application/json")
      .send("{bad");
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });

  // Every case here is rejected, so the store still holds only the first todo.
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
    expect(res.body).toEqual({
      error: "title must be a string of 1-100 characters",
    });
  });

  it("returns the 400 error body for a JSON array body", async () => {
    const res = await request(app).post("/todos").send(["Buy milk"]);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "title must be a string of 1-100 characters",
    });
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
  it("lists todos", async () => {
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: "Buy milk", done: false }]);
  });

  it("responds with JSON", async () => {
    const res = await request(app).get("/todos");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});

describe("PATCH /todos/:id", () => {
  it("marks a todo done", async () => {
    const res = await request(app).patch("/todos/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: "Buy milk", done: true });
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).patch("/todos/999");
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it("returns 400 for an invalid id", async () => {
    const res = await request(app).patch("/todos/abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it("persists the done state", async () => {
    const res = await request(app).get("/todos");
    expect(res.body).toEqual([{ id: 1, title: "Buy milk", done: true }]);
  });

  it("leaves a todo done when patched again", async () => {
    const res = await request(app).patch("/todos/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: "Buy milk", done: true });
  });

  it("returns the 404 error body for an unknown id", async () => {
    const res = await request(app).patch("/todos/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Todo not found" });
  });

  it.each(["abc", "0", "-1", "1.5"])(
    "returns the 400 error body for id %s",
    async (id) => {
      const res = await request(app).patch(`/todos/${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "id must be a positive integer" });
    },
  );
});

describe("DELETE /todos/:id", () => {
  // Rejected requests run first, while todo 1 still exists.
  it.each(["abc", "0", "-1", "1.5"])(
    "returns the 400 error body for id %s",
    async (id) => {
      const res = await request(app).delete(`/todos/${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "id must be a positive integer" });
    },
  );

  it("leaves todos in place for an unknown id", async () => {
    const res = await request(app).delete("/todos/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Todo not found" });
    const list = await request(app).get("/todos");
    expect(list.body).toHaveLength(1);
  });

  it("deletes a todo", async () => {
    const res = await request(app).delete("/todos/1");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    const list = await request(app).get("/todos");
    expect(list.body).toEqual([]);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).delete("/todos/1");
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it("returns 400 for an invalid id", async () => {
    const res = await request(app).delete("/todos/abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });
});

// These run after DELETE: the store is empty and the next id is 2.
describe("todo lifecycle", () => {
  it("returns 404 when patching a deleted todo", async () => {
    const res = await request(app).patch("/todos/1");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Todo not found" });
  });

  it("accepts a 1-character title and does not reuse a deleted id", async () => {
    const res = await request(app).post("/todos").send({ title: "a" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 2, title: "a", done: false });
  });

  it("accepts a 100-character title", async () => {
    const title = "a".repeat(100);
    const res = await request(app).post("/todos").send({ title });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 3, title, done: false });
  });

  it("changes only the targeted todo", async () => {
    await request(app).patch("/todos/3");
    await request(app).delete("/todos/2");
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 3, title: "a".repeat(100), done: true }]);
  });
});

describe("unknown routes", () => {
  it("returns 404 JSON", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
});
