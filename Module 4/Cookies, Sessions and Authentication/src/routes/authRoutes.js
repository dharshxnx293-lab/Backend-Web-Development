const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const users = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');
const { cookieOptions, cookieClearOptions } = require('../config/cookieOptions');

const router = express.Router();

function invalidCredentials(res) {
  return res.status(401).json({
    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
  });
}

router.post('/login', async (req, res, next) => {
  try {
    const emailInput = req.body && req.body.email;
    const password = req.body && req.body.password;
    if (typeof emailInput !== 'string' || !emailInput.trim() ||
        typeof password !== 'string' || !password) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Email and password are required' },
      });
    }

    const email = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'A valid email and password are required' },
      });
    }

    const user = await users.findByEmail(email);
    // Do a bcrypt comparison even when the email does not exist, reducing timing differences.
    const dummyHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    const passwordMatches = await bcrypt.compare(password, user ? user.passwordHash : dummyHash);
    if (!user || !passwordMatches) return invalidCredentials(res);

    const sessionId = crypto.randomUUID();
    sessionStore.create(sessionId, user.id);
    res.cookie('sid', sessionId, cookieOptions());

    return res.status(200).json({
      data: { user: { id: user.id, name: user.name, email: user.email } },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({ data: { user: req.user } });
});

router.post('/logout', (req, res) => {
  const sid = req.signedCookies && req.signedCookies.sid;
  if (typeof sid === 'string' && sid) sessionStore.destroy(sid);
  res.clearCookie('sid', cookieClearOptions());
  return res.status(204).send();
});

module.exports = router;
