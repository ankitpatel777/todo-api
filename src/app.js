const express = require("express");
const createTodosRouter = require("./todos.router");
const { createTodoStore } = require("./todos.store");
const { notFoundHandler, errorHandler } = require("./errors");

function createApp(service = createTodoStore()) {
  const app = express();

  app.use(express.json());
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use("/todos", createTodosRouter(service));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
