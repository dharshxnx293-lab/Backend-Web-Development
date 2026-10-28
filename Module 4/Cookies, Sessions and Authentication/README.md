# Cookies, Sessions and Authentication

This Express + Prisma API demonstrates server-side session authentication. The browser receives only a signed, opaque `sid` cookie; the server-side store maps that identifier to a user ID and expiry. Passwords and password hashes are never put in cookies or API responses.

## Requirements

- Node.js 18 or newer
- npm

## Setup

From this assignment folder:

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Set `COOKIE_SECRET` in `.env` to a unique random secret of at least 32 characters. `COOKIE_SECURE=false` is for local plain-HTTP testing only. In production, use HTTPS and set `COOKIE_SECURE=true`.

The setup command generates Prisma Client, creates the local SQLite database, and seeds a demo user:
- Email: `sam@example.com`
- Password: `SessionDemo!48`

Do not use the demo credentials or example secret in production.

## Endpoints

- `POST /auth/login` — verifies email and password, creates a server-side session, sets a signed `sid` cookie, and returns safe user fields.
- `GET /auth/me` — verifies the signed cookie, resolves a live session and user, then returns safe identity fields.
- `POST /auth/logout` — destroys the server session and clears the cookie; repeated logout calls return `204`.

Cookie settings are centralized in `src/config/cookieOptions.js`: `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, configurable `secure`, and a deliberate `maxAge`. Cookie signing uses `COOKIE_SECRET`.

## Verify with curl

Login and save the cookie:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"sam@example.com","password":"SessionDemo!48"}' \
  http://localhost:3000/auth/login
```

Read the authenticated identity:

```bash
curl -i -b cookies.txt http://localhost:3000/auth/me
```

Try without a cookie (should return generic `401 AUTH_REQUIRED`):

```bash
curl -i http://localhost:3000/auth/me
```

Logout, clearing the cookie and revoking the server record:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
```

Replay the old cookie jar against `/auth/me`; it must return `401 AUTH_REQUIRED`. Invalid login attempts always return the same generic `401 INVALID_CREDENTIALS` response for unknown emails and wrong passwords.

## Design and production notes

Prisma access is isolated in repository functions. Session lifecycle is isolated in `src/session/sessionStore.js`. The included in-memory `Map` is for learning/local execution only: it is lost on restart and is not shared across server processes. Production should use a shared expiring store such as Redis, enforce HTTPS, rotate session IDs after privilege changes, add appropriate CSRF/origin controls for browser state-changing requests, and rate-limit login attempts.

The `.env` file and local database are ignored by Git. Never commit real secrets.
