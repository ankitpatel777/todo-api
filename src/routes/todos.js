const express = require("express");

function createTodoRouter(service) {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json(service.list());
  });

  router.post("/", (req, res) => {
    // Express 5 leaves req.body undefined when no JSON body is sent.
    res.status(201).json(service.create(req.body ?? {}));
  });

  router.get("/:id", (req, res) => {
    res.json(service.get(req.params.id));
  });

  router.patch("/:id", (req, res) => {
    res.json(service.update(req.params.id, req.body ?? {}));
  });

  router.delete("/:id", (req, res) => {
    service.remove(req.params.id);
    res.status(204).end();
  });

  return router;
}

module.exports = { createTodoRouter };
