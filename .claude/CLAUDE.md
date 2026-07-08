# number-nest

A basic course/student management system for tracking course enrollment, manual payments, and attendance.

## Status

`frontend/` is scaffolded (Vite + React + TypeScript) with teacher auth wired up end-to-end: `LoginPage`/`RegisterPage`/`DashboardPage`, a Zustand `authStore` holding the teacher session, and a `ProtectedRoute` gating authenticated routes. `Header` renders the app logo top-left (plus the logged-in teacher's name and a logout button) on every page. Once logged in, a `NavMenu` appears below the header linking to Dashboard, Students, Courses, Enrollments, Payments, and Attendance; the latter five are placeholder pages pending their backend endpoints. The layout is full-width and forced to a single light theme (no dark-mode media query). `backend/` is scaffolded with a module per feature (`app/courses/`, `app/students/`, `app/enrollments/`, `app/payments/`, `app/attendance/`) — most are still `# TODO` stubs. `app/teacher/` is implemented: the `Teacher` model plus register/login/me auth endpoints (JWT bearer tokens, bcrypt password hashing). Shared infra (`Settings`, DB engine/session, the `get_current_teacher` auth dependency) lives in `app/core/`. Alembic migrations run against a Supabase Postgres project over the transaction pooler. This file documents the intended stack and feature scope so implementation stays consistent as it's built out.

## Stack

- **Backend**: Python 3.14, FastAPI, SQLAlchemy (async) + `asyncpg`, Alembic for migrations, JWT (`pyjwt`) + `bcrypt` for teacher auth
- **Frontend**: Node 24, React (Vite), TypeScript, Zustand for state management
- **Database**: PostgreSQL via Supabase, connected through the transaction pooler (port 6543) — requires `statement_cache_size=0` in `connect_args` (both in `app/core/database.py` and `migrations/env.py`) since pgbouncer transaction mode doesn't support asyncpg's server-side prepared statements
- **Payments**: manual/offline tracking only — no payment gateway integration

## Repo layout

```
backend/
  app/
    core/           shared infra: config.py (Settings), database.py (async engine/session), dependencies.py (get_current_teacher)
    teacher/        implemented: models, schemas, security (hashing/JWT), router (/auth/register, /auth/login, /auth/me)
    courses/        stub
    students/       stub
    enrollments/    stub
    payments/       stub
    attendance/     stub
  migrations/       Alembic (async env.py)
frontend/   React app (Vite + TypeScript)
  src/assets/       static assets, incl. logo.svg
  src/components/   shared components: Header, NavMenu, ProtectedRoute
  src/store/        Zustand stores, incl. authStore (teacher session state)
  src/pages/        route pages: Login, Register, Dashboard (implemented); Students, Courses, Enrollments, Payments, Attendance (placeholders)
  src/lib/          api.ts — fetch helpers for the backend
docs/       project docs
```

## Backend commands

Run from `backend/`, with the venv activated (`source .number-nest-venv/bin/activate`):

- Install deps: `pip install -r requirements.txt`
- Run dev server: `uvicorn app.main:app --reload`
- Apply migrations: `alembic upgrade head`
- Create a migration: `alembic revision -m "..."` (this project hand-writes `upgrade`/`downgrade` bodies rather than relying on `--autogenerate`)

## Features

1. **Course** — create/manage courses (name, schedule, fee, etc.)
2. **Students** — create/manage student records
3. **Enrollment** — add or remove a student from a course (add/delete only, no edit-in-place semantics implied)
4. **Payment tracking** — manually record payments against a student's course enrollment; no gateway, no automated billing
5. **Attendance** — record attendance per student per course session
6. **Teacher** — the single teacher is the sole system user/operator; adds/manages students and courses

## Domain notes

- Single teacher only — not multi-tenant, no teacher-course assignment relation. The teacher is the only actor who logs in; students have no login/portal.
- A student can be enrolled in multiple courses; a course can have multiple students (many-to-many via the enrollment relation).
- Payments and attendance both hang off the student-course enrollment, not the student or course alone.
- Per-feature details live in `.claude/rules/features/`.
- Keep this file updated as the schema and API surface solidify — add test/lint commands here once they exist, and frontend run/build commands once the frontend has real functionality.