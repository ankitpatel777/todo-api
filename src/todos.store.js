const todos = [];
let nextId = 1;

function list() {
  return todos;
}

function create(title) {
  const todo = { id: nextId++, title, done: false };
  todos.push(todo);
  return todo;
}

module.exports = { list, create };
