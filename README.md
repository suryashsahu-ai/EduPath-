# EduPath – Phase 1

EduPath is a college discovery and career guidance platform for students. **Phase 1** delivers the
foundation only: the React frontend shell (header, hero, footer), login and registration, and a
FastAPI + MongoDB authentication backend with a protected dashboard placeholder.

> Not in this phase: college search/listings/comparison, recommendations, academic profiles,
> placement features, courses, payments, chatbot, admin tools. See [Postponed to Phase 2](#postponed-to-phase-2).

---

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, Vite, JavaScript, Tailwind CSS v4, React Router, Lucide React |
| Backend  | Python 3.11+, FastAPI, Pydantic v2, PyMongo, Argon2 (argon2-cffi), PyJWT |
| Database | MongoDB |

## Project structure

```
edupath/
├── frontend/
│   ├── src/
│   │   ├── components/        Header, Hero, Footer, Layout, Logo, AuthCard,
│   │   │   │                  ProtectedRoute, GuestRoute, navigation.js
│   │   │   └── ui/            Button, TextField, PasswordField, PasswordStrength, Alert
│   │   ├── pages/             Home, Login, Register, Dashboard, ComingSoon, NotFound
│   │   ├── services/          api.js (central client), auth.js
│   │   ├── context/           AuthContext.jsx
│   │   ├── utils/             validation.js
│   │   ├── __tests__/         Vitest + Testing Library tests
│   │   ├── App.jsx  main.jsx  index.css  (colour tokens live in index.css)
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py            App, CORS, origin check, error handlers, /api/health
│   │   ├── config.py          Settings from environment variables
│   │   ├── database.py        MongoDB client, index creation
│   │   ├── models/            User document shape
│   │   ├── schemas/           Pydantic request/response models
│   │   ├── routes/            auth.py (HTTP layer only)
│   │   ├── services/          auth_service.py (business logic)
│   │   └── core/              security.py, cookies.py, deps.py, exceptions.py
│   ├── tests/                 pytest suite
│   ├── .env.example
│   ├── requirements.txt  requirements-dev.txt
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- A MongoDB database (local, Docker, or MongoDB Atlas – see below)

### 1. MongoDB

Pick one:

- **Docker (quickest):** `docker run -d --name edupath-mongo -p 27017:27017 mongo:7`
  → `MONGODB_URI=mongodb://localhost:27017`
- **Local install:** install MongoDB Community Edition and start the `mongod` service.
  → `MONGODB_URI=mongodb://localhost:27017`
- **MongoDB Atlas (free tier):** create a cluster, add a database user, allow your IP under
  *Network Access*, then copy the connection string.
  → `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`

The `users` collection and its unique email index are created automatically on first start.

### 2. Backend

```bash
cd backend
python -m venv .venv

# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

pip install -r requirements.txt

cp .env.example .env            # Windows: copy .env.example .env
```

Edit `backend/.env`:

1. Set `MONGODB_URI` (and `MONGODB_DB_NAME` if you want).
2. Generate a JWT secret and paste it as `JWT_SECRET_KEY`:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   ```
   The app refuses to start while this is still the placeholder value.

Run it:

```bash
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs (disabled when `ENVIRONMENT=production`)
- Health check: http://localhost:8000/api/health → `{"status":"ok","database":"ok"}`

If MongoDB is unreachable the API still starts, logs a clear error, `database` reports
`"unavailable"`, and auth endpoints return `503` until MongoDB is back.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env            # Windows: copy .env.example .env
npm run dev
```

Open **http://localhost:5173**.

> **Use `localhost` everywhere – not `127.0.0.1`.** The login cookie is `SameSite=Lax`; if the page is on
> `127.0.0.1` and the API on `localhost`, the browser treats them as different sites and won't send it.

### Running the tests

```bash
# Backend (no MongoDB required – uses an in-memory stand-in)
cd backend
pip install -r requirements-dev.txt
pytest

# Frontend
cd frontend
npm test
```

### Production build

```bash
cd frontend && npm run build        # output in frontend/dist
```

---

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | – | Create an account. `201` on success, `409` duplicate email, `422` invalid input |
| POST | `/api/auth/login` | – | Verify credentials, set the auth cookie. `200`, or `401` `Invalid email or password.` |
| GET  | `/api/auth/me` | cookie | Current user's safe profile (+ CSRF token). `401` if missing/invalid/expired |
| POST | `/api/auth/logout` | cookie + CSRF | Clears the auth cookie |
| GET  | `/api/health` | – | Service and database status |

Request bodies use `full_name`, `email`, `password`. Responses never contain the password or its hash.

## Security design

- **Passwords:** hashed with Argon2id; plaintext is never stored or returned. Hashes are upgraded
  automatically at login if the parameters change. Unknown-email logins still run a hash
  verification so response time doesn't reveal which emails exist; the error message is identical for
  "wrong password" and "no such user".
- **JWT:** HS256, signed with `JWT_SECRET_KEY` (from the environment), pinned algorithm, required
  `exp`/`iat`/`sub`/`jti` claims, configurable expiry (`ACCESS_TOKEN_EXPIRE_MINUTES`, default 60).
- **Token storage:** the JWT lives in an **HttpOnly cookie** – JavaScript can't read it, and nothing
  sensitive is put in `localStorage`/`sessionStorage`. In production set `COOKIE_SECURE=true`.
- **CSRF:** state-changing authenticated requests must send an `X-CSRF-Token` header. The token is an
  HMAC bound to the session, returned in the JSON body of `/login` and `/me` (which other sites can't
  read) and held in memory by the frontend. The backend also rejects POST/PUT/PATCH/DELETE requests
  whose `Origin` header isn't in `FRONTEND_ORIGINS`. CORS is credentialed and limited to those origins.
- **Authorization:** the backend identifies the user only from the verified token, never from request
  input, and re-checks the user exists on every protected request. The frontend `ProtectedRoute` is a
  convenience; the API enforces access independently.
- **Errors:** validation errors are returned per field without echoing submitted values (so passwords
  never bounce back); unexpected errors return a generic message and are logged server-side.

### Known limitations (deliberate for Phase 1)

- Logout clears the cookie but JWTs are stateless, so a copied token stays valid until it expires.
  Token revocation/refresh tokens are a later-phase item.
- No rate limiting or account lockout on login/register yet – add one before a public launch.
- No email verification or password reset (not requested for this phase).
- Deploying frontend and API on different *sites* (not just subdomains of one domain) would require
  `COOKIE_SAMESITE=none` with HTTPS (`COOKIE_SECURE=true`).

## Colour system

All colours are tokens in `frontend/src/index.css`:

| Token (Tailwind class) | Value | Used for |
|---|---|---|
| `--ep-surface` (`bg-surface`) | `#E8EDDF` | Page background, header |
| `--ep-ink` (`text-ink`, `bg-ink`) | `#1D2D44` | All interface text; dark button background |
| `--ep-on-primary` (`text-on-primary`) | `#F1FAEE` | Button text, footer text |
| `--ep-footer` (`bg-footer`) | `#080C12` | Footer background |
| `--ep-error`, `--ep-success` | `#9B1C1C`, `#1E6B3C` | Validation/alert feedback only |

Borders, hover states and panels are derived from these with opacity (`border-ink/20`, `bg-ink/5`), so
no other palette colours exist. No gradients are used. Change a value in `:root` and everything updates.
Computed contrast: body text 11.7:1, button text 13.0:1, footer text 18.3:1, form-control borders 3.7:1.

---

## What was tested

Results from this build session – nothing below is claimed beyond what was actually run.

| Check | How | Result |
|---|---|---|
| Backend unit/integration tests (22) | `pytest`, against an in-memory MongoDB stand-in (`mongomock`) | ✅ 22 passed |
| Register, duplicate email (incl. case), weak/invalid input, no password echo | pytest + live curl | ✅ |
| Login success / wrong password / unknown email (identical error) | pytest + live curl | ✅ |
| `/me` with valid cookie; without cookie; garbage, wrong-secret, `alg=none`, expired token, deleted user | pytest | ✅ |
| Logout (CSRF required; session ends) | pytest + live curl | ✅ |
| CORS preflight, untrusted-origin rejection | pytest + live curl | ✅ |
| Backend starts under uvicorn and serves requests over real HTTP | live run | ✅ (with the stand-in database) |
| App refuses placeholder JWT secret | ran with `.env.example` copied | ✅ |
| MongoDB unreachable → clear log, `/api/health` shows `unavailable`, auth returns `503` with no internals | ran without MongoDB | ✅ |
| Frontend tests (25): header & mobile menu, validation, password strength, show/hide, register/login flows, server errors, loading/double-submit guard, protected route redirect, session restore, logout | `npm test` (Vitest + jsdom, API layer mocked) | ✅ 25 passed |
| Production build | `npm run build` | ✅ |
| Dev server starts, serves app and SPA routes | `npm run dev` + curl | ✅ |
| Palette audit: no stray hex values, gradients or off-palette Tailwind colours in components | grep | ✅ |

**Not tested – please do these yourself:**

- **A real MongoDB server.** None was available here. The code uses standard PyMongo calls and the
  `mongomock` tests exercise the logic, but the real connection path (including Atlas) has not been
  run. Verify with `GET /api/health` → `"database":"ok"`, then register a user.
- **A real browser.** No browser was available, so visual layout, responsiveness at phone/tablet/desktop
  widths, hover/focus appearance, and the browser console were **not** inspected. Logic such as the mobile
  menu is covered by tests, but how it *looks* is not. Please check the pages at a few widths.
- Cross-browser behaviour, and cookie behaviour over HTTPS in production.

## Phase 1 summary

Delivered: responsive header with mobile menu, hero section, footer, centralised colour tokens, login and
registration pages with validation / password-strength / show-hide / loading states, FastAPI auth
(register, login, me, logout), Argon2 hashing, JWT in an HttpOnly cookie with CSRF protection, MongoDB
integration, protected dashboard placeholder with logout, placeholder pages for the other nav links,
environment examples, tests, and this README.

## Postponed to Phase 2

College search and listings · college comparison · recommendations · student academic profiles ·
placement information · free/paid course catalogue and purchases · payments · online/offline learning ·
enrolment · career recommendations · AI chatbot · admin and college dashboards · job portal ·
certificates · analytics · password reset, email verification, social login, OTP · rate limiting and
token refresh/revocation.
