require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use((error, req, res, next) => {
  // Body-parser reports malformed JSON as a SyntaxError with this type.
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'Request body must be valid JSON' },
    });
  }

  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  if (statusCode >= 500) {
    // Do not log raw errors that might accidentally contain credential data.
    console.error('Unexpected authentication API error');
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }

  return res.status(statusCode).json({
    error: {
      code: error.code || 'REQUEST_ERROR',
      message: error.message || 'Request could not be processed',
    },
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on ${port}`));
