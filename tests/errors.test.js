const request = require("supertest");
const { createApp } = require("../src/app");

describe("error handling", () => {
  it("returns 400 JSON for malformed JSON", async () => {
    const res = await request(createApp())
      .post("/todos")
      .set("Content-Type", "application/json")
      .send('{"title":');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  it("returns 404 JSON for an unknown route", async () => {
    const res = await request(createApp()).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });

  it("hides the message of an unexpected error", async () => {
    const logged = jest.spyOn(console, "error").mockImplementation(() => {});
    const service = {
      list() {
        throw new Error("database password leaked");
      },
    };

    const res = await request(createApp(service)).get("/todos");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error" });
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });
});
