/**
 * logger middleware  [mount GLOBALLY in app.js]
 *
 * Logs the request method, path, status code, and request ID when the
 * response finishes.
 */

module.exports = function logger(req, res, next) {
  res.on('finish', () => {
    const shortId = req.id ? `[${req.id.substring(0, 8)}] ` : '';
    console.log(`${shortId}${req.method} ${req.path} ${res.statusCode}`);
  });

  next();
};
