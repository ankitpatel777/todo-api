const { HttpError } = require("../errors");

function notFound() {
  throw new HttpError(404, "Not found");
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) {
    console.error(err);
    return res.status(status).json({ error: "Internal server error" });
  }
  res.status(status).json({ error: err.message });
}

module.exports = { notFound, errorHandler };
