function createTodoStore() {
  const todos = [];
  let nextId = 1;

  return {
    list() {
      return todos.map((todo) => ({ ...todo }));
    },

    create(title) {
      const todo = { id: nextId++, title, done: false };
      todos.push(todo);
      return { ...todo };
    },

    update(id, changes) {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return undefined;
      Object.assign(todo, changes);
      return { ...todo };
    },

    remove(id) {
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) return false;
      todos.splice(index, 1);
      return true;
    },
  };
}

module.exports = { createTodoStore };
