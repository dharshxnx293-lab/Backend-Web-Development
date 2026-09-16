/**
 * timing middleware  [mount GLOBALLY in app.js]
 *
 * Logs how long the request took when the response finishes.
 */

module.exports = function timing(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const shortId = req.id ? `[${req.id.substring(0, 8)}] ` : '';
    console.log(`${shortId}${req.method} ${req.path} took ${elapsed}ms`);
  });

  next();
};
