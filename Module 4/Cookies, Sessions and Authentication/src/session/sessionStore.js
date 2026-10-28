const crypto = require('node:crypto');

const sessions = new Map();
const ttl = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);

function create(sessionId, userId) {
  const id = sessionId || crypto.randomUUID();
  const expiresAt = Date.now() + (Number.isFinite(ttl) && ttl > 0 ? ttl : 60 * 60 * 1000);
  sessions.set(id, { userId, expiresAt });
  return { id, userId, expiresAt };
}

function get(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return { userId: session.userId, expiresAt: session.expiresAt };
}

function destroy(sessionId) {
  if (typeof sessionId === 'string' && sessionId) sessions.delete(sessionId);
}

module.exports = { create, get, destroy };
