const configuredTtl = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);
const maxAge = Number.isFinite(configuredTtl) && configuredTtl > 0
  ? configuredTtl
  : 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    signed: true,
    path: '/',
    maxAge,
  };
}

function cookieClearOptions() {
  const options = cookieOptions();
  // clearCookie must use the same scope/transport attributes as the issued cookie.
  delete options.maxAge;
  return options;
}

module.exports = { cookieOptions, cookieClearOptions };
