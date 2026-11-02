const express = require('express');
const todosRouter = require('./todos.router');
const { notFoundHandler, errorHandler } = require('./errors');

const app = express();

app.use(express.json());
app.use('/todos', todosRouter);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
