/**
 * Express Middleware Architecture — Build the Pipeline
 */

const express = require('express');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const requestId = require('./middleware/requestId');
const logger = require('./middleware/logger');
const timing = require('./middleware/timing');

const app = express();

app.use(express.json());

// Global middleware runs before both routers, in this deliberate order.
app.use(requestId);
app.use(logger);
app.use(timing);

app.use('/posts', postsRouter);
app.use('/users', usersRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

module.exports = app;
