const express = require('express');
const store = require('./todos.store');
const { HttpError } = require('./errors');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(store.list());
});

router.post('/', (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || title.length < 1 || title.length > 100) {
    throw new HttpError(400, 'title must be a string of 1-100 characters');
  }
  res.status(201).json(store.create(title));
});

module.exports = router;
