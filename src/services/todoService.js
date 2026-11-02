const { HttpError } = require("../errors");

const MAX_TITLE_LENGTH = 100;

function validateTitle(title) {
  if (
    typeof title !== "string" ||
    title.length < 1 ||
    title.length > MAX_TITLE_LENGTH
  ) {
    throw new HttpError(
      400,
      `title must be a string of 1-${MAX_TITLE_LENGTH} characters`,
    );
  }
}

function validateDone(done) {
  if (typeof done !== "boolean") {
    throw new HttpError(400, "done must be a boolean");
  }
}

// A malformed id can never match a todo, so it is reported as unknown.
function parseId(rawId) {
  const id = /^[1-9]\d*$/.test(rawId) ? Number(rawId) : NaN;
  if (!Number.isSafeInteger(id)) {
    throw new HttpError(404, "Todo not found");
  }
  return id;
}

function createTodoService(store) {
  return {
    list() {
      return store.list();
    },

    get(rawId) {
      const todo = store.get(parseId(rawId));
      if (!todo) throw new HttpError(404, "Todo not found");
      return todo;
    },

    create({ title, done = false }) {
      validateTitle(title);
      validateDone(done);
      return store.create({ title, done });
    },

    update(rawId, { title, done }) {
      const id = parseId(rawId);
      if (!store.get(id)) throw new HttpError(404, "Todo not found");
      if (title === undefined && done === undefined) {
        throw new HttpError(400, "title or done is required");
      }

      const changes = {};
      if (title !== undefined) {
        validateTitle(title);
        changes.title = title;
      }
      if (done !== undefined) {
        validateDone(done);
        changes.done = done;
      }
      return store.update(id, changes);
    },

    remove(rawId) {
      if (!store.remove(parseId(rawId))) {
        throw new HttpError(404, "Todo not found");
      }
    },
  };
}

module.exports = { createTodoService };
