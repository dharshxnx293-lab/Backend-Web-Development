# Authentication Fundamentals Starter

## Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm start
```

The SQLite datasource keeps local setup self-contained. Do not commit `.env` or `prisma/dev.db`.

## Endpoints

- `POST /auth/register`
- `POST /auth/login`

Registration stores only an asynchronous bcrypt hash. Login compares the supplied password against that hash and returns the same generic `401` response for an unknown email or an incorrect password.
