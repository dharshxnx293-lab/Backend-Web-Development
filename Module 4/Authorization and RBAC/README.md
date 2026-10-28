# Authorization & RBAC

This assignment adds authorization on top of the provided JWT authentication.

## Implementation

- `src/middleware/requireRole.js` implements `requireRole(...allowedRoles)`.
- The admin-only `DELETE /users/:id` route uses `requireRole('admin')`.
- `POST /posts/:id/hide` allows moderators and admins only.
- `PATCH /posts/:id` and `DELETE /posts/:id` allow the post owner or a moderator/admin.
- Missing posts return `404 NOT_FOUND` before the ownership check.
- Missing/invalid tokens return `401 UNAUTHENTICATED`; authenticated users without permission receive `403 FORBIDDEN`.
- Roles are read only from the verified `req.user`, never from request body/query/header data.

## Why test case #2 returns 403

Member B is authenticated, but post 1 belongs to member A. In `src/routes/posts.js`, `loadOwnedOrPrivileged()` checks that the post exists, then compares `post.authorId` with `req.user.id`. Since member B is neither the owner nor a moderator/admin, the helper returns `403 FORBIDDEN`. This closes the Broken Object Level Authorization (IDOR) vulnerability.

## Run locally

From this directory:

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `npm test`.
4. Start the API with `npm start`.

The test suite should report `Results: 12 passed, 0 failed` when all checks pass. The login endpoint is a learning-only token helper, not production authentication. The sample secret must never be used in production.
