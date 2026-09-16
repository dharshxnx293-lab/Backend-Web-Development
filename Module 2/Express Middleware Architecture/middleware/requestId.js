/**
 * requestId middleware  [mount GLOBALLY in app.js]
 *
 * Attaches a UUID to the request and response so the same request can be
 * traced through later middleware and handlers.
 */

const { randomUUID } = require('crypto');

module.exports = function requestId(req, res, next) {
  const id = randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};
