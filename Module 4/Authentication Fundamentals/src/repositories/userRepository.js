const prisma = require('../db/prisma');

// Prisma stays behind this module so the authentication service does not depend
// on Prisma query details.
async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser({ name, email, passwordHash }) {
  return prisma.user.create({
    data: { name, email, passwordHash },
  });
}

function isUniqueEmailError(error) {
  return error && error.code === 'P2002';
}

module.exports = { findByEmail, createUser, isUniqueEmailError };
