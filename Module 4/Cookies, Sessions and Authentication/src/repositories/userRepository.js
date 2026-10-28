const prisma = require('../db/prisma');

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findPublicById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
  return user;
}

module.exports = { findByEmail, findPublicById };
