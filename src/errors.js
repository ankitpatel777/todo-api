class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFoundHandler(req, res, next) {
  next(new HttpError(404, "Not found"));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  const message = status >= 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
}

module.exports = { HttpError, notFoundHandler, errorHandler };
