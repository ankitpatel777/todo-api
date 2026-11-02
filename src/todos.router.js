const express = require('express');
const store = require('./todos.store');
const { HttpError } = require('./errors');

function createTodosRouter(service = store) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(service.list());
  });

  router.post('/', (req, res) => {
    const title = req.body?.title;
    if (typeof title !== 'string' || title.length < 1 || title.length > 100) {
      throw new HttpError(400, 'title must be a string of 1-100 characters');
    }
    res.status(201).json(service.create(title));
  });

  router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(400, 'id must be a positive integer');
    }
    const todo = service.markDone(id);
    if (!todo) {
      throw new HttpError(404, 'Todo not found');
    }
    res.json(todo);
  });

  router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(400, 'id must be a positive integer');
    }
    if (!service.remove(id)) {
      throw new HttpError(404, 'Todo not found');
    }
    res.status(204).end();
  });

  return router;
}

module.exports = createTodosRouter;
