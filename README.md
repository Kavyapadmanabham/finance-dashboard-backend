# Finance Dashboard API

Production-style REST backend for a finance dashboard: **JWT authentication**, **role-based access control (RBAC)**, **financial records** with soft delete, **aggregated dashboard analytics**, and **consistent validation/error handling**.

Real data is stored in **MongoDB** (not mocked).

---

## 1. Project overview

The API supports:

- **Users** with roles `viewer`, `analyst`, `admin` and status `active` / `inactive`.
- **Financial records** (income/expense) with filtering, pagination, and search.
- **Dashboard endpoints** for totals, category breakdowns, recent activity, and **monthly ** trends.
- **Strict auth flow**: register → login → use `Authorization: Bearer <token>` on protected routes.

---

## 2. Tech stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`) |
| Validation | `express-validator` |

---

## 3. Features (mapped to requirements)

| Requirement | Implementation |
|-------------|------------------|
| User & role management | `User` model; admin routes to create/list/update users |
| Roles: Viewer, Analyst, Admin | Enforced in middleware; see permissions table below |
| User status | `active` / `inactive`; inactive users cannot use the API |
| Financial records | Full CRUD; soft delete via `isDeleted` |
| Filtering | `type`, `category`, `dateFrom`/`dateTo`, `search` |
| Dashboard analytics | Summary, category totals, recent, monthly |
| Access control | JWT + route-level role checks; **no `x-role` header** (removed to prevent bypass) |
| Validation | Body/query/param rules + centralized errors |
| Persistence | MongoDB via `MONGO_URI` |

---

## 4. Folder structure

```
.
├── server.js
├── package.json
├── .env.example
├── README.md
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── recordController.js
    │   └── dashboardController.js
    ├── middleware/
    │   ├── auth.js
    │   ├── roleAuth.js
    │   ├── validateRequest.js
    │   ├── errorHandler.js
    │   └── notFound.js
    ├── models/
    │   ├── User.js
    │   └── Record.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── recordRoutes.js
    │   └── dashboardRoutes.js
    ├── services/
    │   ├── authService.js
    │   ├── userService.js
    │   ├── recordService.js
    │   └── dashboardService.js
    └── utils/
        ├── ApiError.js
        ├── asyncHandler.js
        └── pagination.js
```

---

## 5. Setup (step by step)

1. **Install** [Node.js](https://nodejs.org/) 18+ and [MongoDB](https://www.mongodb.com/) (local or Atlas).
2. **Clone / open** this project and run:
   ```bash
   npm install
   ```
3. **Environment**: copy `.env.example` to `.env` and set values (see below).
4. **Start MongoDB** if running locally.
5. **Run the server**:
   ```bash
   npm run dev
   ```
   or `npm start` for a single run.
6. **Health check**: `GET http://localhost:3000/health`

---

## 6. Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/financeDB` |
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `JWT_SECRET` | Secret for signing JWTs (**required**) | long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `1h` |

The server **exits on startup** if `JWT_SECRET` is missing.

---

## 7. Authentication flow

1. **`POST /api/auth/register`** — body: `name`, `email`, `password` (min 6 chars). Creates a **viewer** user. Returns JWT + user (no password).
2. **`POST /api/auth/login`** — body: `email`, `password`. Returns JWT + user.
3. **Protected routes** — header:
   ```http
   Authorization: Bearer <token>
   ```


---

## 8. API endpoints

Base URL: `http://localhost:3000` (or your `PORT`).

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (viewer) |
| POST | `/api/auth/login` | Login |

### Users (admin only, JWT required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users` | Create user (requires `password`, optional `role`, `status`) |
| GET | `/api/users` | List users |
| PATCH | `/api/users/:id` | Update `role` and/or `status` |

### Records (JWT required)

| Method | Path | Who |
|--------|------|-----|
| GET | `/api/records` | **Analyst, Admin** (filters + pagination) |
| GET | `/api/records/:id` | **Analyst, Admin** |
| POST | `/api/records` | **Admin** |
| PATCH | `/api/records/:id` | **Admin** |
| DELETE | `/api/records/:id` | **Admin** (soft delete) |

**Query (GET list):** `type`, `category`, `dateFrom`, `dateTo`, `search`, `page`, `limit`

### Dashboard (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/summary` | Total income, total expense, net balance |
| GET | `/api/dashboard/category` | Totals by category and type |
| GET | `/api/dashboard/recent` | Recent non-deleted records |
| GET | `/api/dashboard/monthly` | Monthly buckets by type |


---

## 9. Role permissions (strict)

| Capability | Viewer | Analyst | Admin |
|------------|--------|---------|-------|
| Login / JWT | Yes | Yes | Yes |
| Dashboard GET (analytics) | Yes | Yes | Yes |
| Records GET (list/detail) | **No** | Yes | Yes |
| Records POST/PATCH/DELETE | No | No | Yes |
| User management | No | No | Yes |

**Viewer** = dashboard-only (aggregates + recent widget on dashboard).  
**Analyst** = dashboard + **raw record** read APIs.  
**Admin** = full record writes + user management.

Role is taken **only** from the authenticated user document (JWT identifies the user; role is not accepted from headers).

---

## 10. Error response shape

- **Validation (400):** `{ "success": false, "error": "Validation failed", "details": [...] }`
- **ApiError:** `{ "success": false, "error": "<message>", "details?": ... }`
- **401 / 403 / 404 / 500** as appropriate with `success: false`

---

## 11. Assumptions

- MongoDB is reachable at `MONGO_URI`.
- JWT role reflects the user document; changing role in DB applies on next request (token may still carry old `role` claim but **`auth` middleware loads role from DB**).
- Monthly aggregation uses MongoDB $month and $year operators to group financial data.

---

## 12. Limitations / optional next steps

- No refresh tokens or logout blacklist (access token only).
- No rate limiting (add `express-rate-limit` in production).
- No automated test suite in repo (add `supertest` + Jest if required).
- Password reset / email verification not implemented.

---

## License

MIT
