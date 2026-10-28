const bcrypt = require('bcryptjs');
const users = require('../repositories/userRepository');

const COST_FACTOR = Number(process.env.BCRYPT_COST || 12);
// A valid bcrypt hash is used for missing accounts so login failures do
// comparable bcrypt work without disclosing whether an email exists.
const DUMMY_PASSWORD_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

function httpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function invalidInput() {
  return httpError(400, 'INVALID_INPUT', 'Required fields must be non-empty strings');
}

function invalidCredentials() {
  return httpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function requireNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validEmail(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

async function register(input = {}) {
  const { name, email, password } =
    input && typeof input === 'object' ? input : {};

  if (
    !requireNonEmptyString(name) ||
    !requireNonEmptyString(email) ||
    !requireNonEmptyString(password)
  ) {
    throw invalidInput();
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedName = name.trim();
  if (!validEmail(normalizedEmail)) throw invalidInput();

  if (await users.findByEmail(normalizedEmail)) {
    throw httpError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, COST_FACTOR);

  try {
    const user = await users.createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
    });
    return safeUser(user);
  } catch (error) {
    // The database unique constraint is the final protection against two
    // concurrent registrations for the same normalized email.
    if (users.isUniqueEmailError(error)) {
      throw httpError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }
    throw error;
  }
}

async function login(input = {}) {
  const { email, password } =
    input && typeof input === 'object' ? input : {};

  if (!requireNonEmptyString(email) || !requireNonEmptyString(password)) {
    throw invalidInput();
  }

  const normalizedEmail = normalizeEmail(email);
  if (!validEmail(normalizedEmail)) throw invalidInput();

  const user = await users.findByEmail(normalizedEmail);
  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    throw invalidCredentials();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw invalidCredentials();

  return safeUser(user);
}

module.exports = { register, login };
