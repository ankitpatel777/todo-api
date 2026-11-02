function createTodoStore() {
  const todos = new Map();
  let nextId = 1;

  return {
    list() {
      return [...todos.values()];
    },

    get(id) {
      return todos.get(id);
    },

    create({ title, done }) {
      const todo = { id: nextId++, title, done };
      todos.set(todo.id, todo);
      return todo;
    },

    update(id, changes) {
      const todo = todos.get(id);
      if (!todo) return undefined;
      const updated = { ...todo, ...changes };
      todos.set(id, updated);
      return updated;
    },

    remove(id) {
      return todos.delete(id);
    },
  };
}

module.exports = { createTodoStore };
