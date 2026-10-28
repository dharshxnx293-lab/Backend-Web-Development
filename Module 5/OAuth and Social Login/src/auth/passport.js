'use strict';
// auth/passport.js — Google OAuth strategy

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile.id;
    const email = profile.emails[0].value;

    // 1. Returning OAuth user: Google's stable ID is the primary lookup key.
    const linkedUser = users.find((user) => user.googleId === googleId);
    if (linkedUser) {
      return done(null, linkedUser);
    }

    // 2. Existing local account: link only when Google confirms the email.
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      if (profile._json.email_verified !== true) {
        return done(null, false);
      }

      existingUser.googleId = googleId;
      return done(null, existingUser);
    }

    // 3. New account: always start with the lowest privilege.
    const newUser = {
      id: nextId(),
      googleId,
      email,
      name: profile.displayName,
      role: 'member',
    };
    users.push(newUser);
    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL: '/auth/google/callback',
    },
    verifyCallback,
  ),
);

module.exports = { passport, verifyCallback };
