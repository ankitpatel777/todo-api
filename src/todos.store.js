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

function markDone(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.done = true;
  return todo;
}

function remove(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}

module.exports = { list, create, markDone, remove };
