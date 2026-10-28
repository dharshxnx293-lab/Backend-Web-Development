require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

if (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET.length < 32) {
  throw new Error('COOKIE_SECRET must contain at least 32 characters');
}

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use((error, req, res, next) => {
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } });
  }
  // Do not log or expose raw database, bcrypt, cookie-signing, or session errors.
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on port ${port}`));
