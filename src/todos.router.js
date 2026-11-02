const express = require("express");
const { HttpError } = require("./errors");

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "id must be a positive integer");
  }
  return Number(value);
}

function createTodosRouter(service) {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json(service.list());
  });

  router.post("/", (req, res) => {
    const title = req.body?.title;
    if (typeof title !== "string" || title.length < 1 || title.length > 100) {
      throw new HttpError(400, "title must be a string of 1-100 characters");
    }
    res.status(201).json(service.create(title));
  });

  router.patch("/:id", (req, res) => {
    const id = parseId(req.params.id);
    const title = req.body?.title;
    if (
      title !== undefined &&
      (typeof title !== "string" || title.length < 1 || title.length > 100)
    ) {
      throw new HttpError(400, "title must be a string of 1-100 characters");
    }
    const done = req.body?.done;
    if (done !== undefined && typeof done !== "boolean") {
      throw new HttpError(400, "done must be a boolean");
    }
    if (
      title === undefined &&
      done === undefined &&
      Object.keys(req.body ?? {}).length > 0
    ) {
      throw new HttpError(400, "body must include title or done");
    }
    // With an empty body, PATCH keeps its original meaning: mark done.
    const changes =
      title === undefined && done === undefined
        ? { done: true }
        : {
            ...(title !== undefined && { title }),
            ...(done !== undefined && { done }),
          };
    const todo = service.update(id, changes);
    if (!todo) {
      throw new HttpError(404, "Todo not found");
    }
    res.json(todo);
  });

  router.delete("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (!service.remove(id)) {
      throw new HttpError(404, "Todo not found");
    }
    res.status(204).end();
  });

  return router;
}

module.exports = createTodosRouter;
