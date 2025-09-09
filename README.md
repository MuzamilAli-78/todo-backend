# Node.js + Express + Mongoose — CRUD REST API with Auth (JWT + Refresh)

A production-ready starter that ships:
- User registration & login with hashed passwords (`bcryptjs`)
- JWT Access tokens + Refresh tokens (HTTP-only cookie, rotation on refresh)
- Logout that invalidates refresh tokens
- Protected CRUD for a sample resource (`Todo`)
- Error handling, CORS, Helmet, Morgan, environment config
- Organized controllers, routes, middleware and utilities

## Quick Start

```bash
# 1) Unzip and install deps
npm install

# 2) Create .env
cp .env.example .env
# Edit .env with your values

# 3) Run MongoDB locally (or use Atlas) and start the API
npm run dev
# or
npm start
```

- API base: `http://localhost:${PORT}/api`
- Auth endpoints:
  - `POST /api/auth/register` — body: `{ "email": "...", "password": "...", "name": "..." }`
  - `POST /api/auth/login` — body: `{ "email": "...", "password": "..." }`
  - `POST /api/auth/refresh` — (uses httpOnly refresh cookie)
  - `POST /api/auth/logout` — clears refresh cookie and invalidates token

- Todo endpoints (require `Authorization: Bearer <accessToken>`):
  - `POST /api/todos` — body: `{ "title": "Buy milk", "completed": false }`
  - `GET /api/todos`
  - `GET /api/todos/:id`
  - `PUT /api/todos/:id`
  - `DELETE /api/todos/:id`

## Notes

- Access token is short-lived (default 15m). Refresh token is stored as an HTTP-only cookie.
- On refresh, the refresh token is rotated (new one issued and old invalidated) for better security.
- In production, set `COOKIE_SECURE=true` so cookies are marked `Secure`.
- Change secrets in `.env` to strong random strings.

## Project Structure

```
src/
  config/db.js
  controllers/
    auth.controller.js
    todo.controller.js
  middleware/
    auth.js
    errorHandler.js
  models/
    User.js
    Todo.js
  routes/
    auth.routes.js
    todo.routes.js
  utils/
    generateTokens.js
  server.js
```

Enjoy! 🎉
