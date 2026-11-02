const express = require("express");
const createTodosRouter = require("./todos.router");
const { notFoundHandler, errorHandler } = require("./errors");

function createApp(service) {
  const app = express();

  app.use(express.json());
  app.use("/todos", createTodosRouter(service));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
