# number-nest

A basic course/student management system for tracking course enrollment, manual payments, and attendance.

## Status

`frontend/` is scaffolded (Vite + React + TypeScript) with teacher auth wired up end-to-end: `LoginPage`/`RegisterPage`/`DashboardPage`, a Zustand `authStore` holding the teacher session, and a `ProtectedRoute` gating authenticated routes. `Header` renders the app logo top-left (plus the logged-in teacher's name and a logout button) on every page. Once logged in, a `NavMenu` appears below the header linking to Dashboard, Students, Courses, Enrollments, Payments, and Attendance. `CoursesPage` is implemented end-to-end against `app/courses/`: a Zustand `courseStore` (`fetchCourses`/`createCourse`/`updateCourse`/`deleteCourse`) backs a list table (`CourseTable`, with edit/delete icon actions), and a create/edit form (`CourseFormDialog`) that renders inside a generic `Modal` component (`src/components/Modal.tsx`) reusable by future features. Course list rows are clickable and navigate to `CourseDetailPage` (route `/courses/:id`) — a full page (not a modal) showing a read-only course card plus a table of the course's enrolled students, fetched via `GET /courses/{id}` (which now returns the enrolled student list alongside the course fields). Students, Enrollments, Payments, and Attendance pages remain placeholders — only the course detail page consumes the new `app/students/`/`app/enrollments/` backend endpoints so far. The layout is full-width and forced to a single light theme (no dark-mode media query). `backend/` is scaffolded with a module per feature. `app/teacher/` is implemented: the `Teacher` and `RefreshToken` models plus register/login/refresh/logout/me auth endpoints (JWT bearer access tokens + opaque, hashed, DB-backed refresh tokens with rotation-on-use and revocation, bcrypt password hashing), split into router (HTTP)/service (business logic)/repository (data access) layers — see [Backend architecture](#backend-architecture). `app/courses/` is implemented: full CRUD (create/list/get/update/delete) on the `Course` model, gated behind `get_current_teacher` on every route; `GET /courses/{id}` returns `CourseDetailRead` (course fields plus `students: StudentRead[]`, sourced via `EnrollmentRepository.list_students_for_course`). `app/students/` is implemented: full CRUD on the `Student` model. `app/enrollments/` is implemented: add/list/delete only (no edit-in-place) on the `Enrollment` join model, with a DB-level unique constraint on `(student_id, course_id)` plus a service-layer `ConflictException` guard against double-enrollment. `app/payments/` and `app/attendance/` are still `# TODO` stubs. Shared infra (`Settings`, DB engine/session, the `get_current_teacher` auth dependency and `BearerAuth` bearer-scheme wrapper, the `AppException` family + handler) lives in `app/core/`. All models use UUID (not integer) primary keys. Alembic migrations run against a Supabase Postgres project over the transaction pooler. This file documents the intended stack and feature scope so implementation stays consistent as it's built out.

## Stack

- **Backend**: Python 3.14, FastAPI, SQLAlchemy (async) + `asyncpg`, Alembic for migrations, JWT (`pyjwt`) + `bcrypt` for teacher auth
- **Frontend**: Node 24, React (Vite), TypeScript, Zustand for state management
- **Database**: PostgreSQL via Supabase, connected through the transaction pooler (port 6543) — requires `statement_cache_size=0` in `connect_args` (both in `app/core/database.py` and `migrations/env.py`) since pgbouncer transaction mode doesn't support asyncpg's server-side prepared statements
- **Primary keys**: every table uses a UUID primary key (`Mapped[uuid.UUID]`, Python-side `default=uuid.uuid4`, DB-side `server_default=gen_random_uuid()` — requires the `pgcrypto` extension, created via migration), not an integer/serial id
- **Payments**: manual/offline tracking only — no payment gateway integration

## Repo layout

```
backend/
  app/
    core/           shared infra: config.py (Settings), database.py (async engine/session),
                     dependencies.py (get_current_teacher, BearerAuth), exceptions.py (AppException family + handler),
                     logging.py (request logging middleware)
    teacher/        implemented: models (Teacher, RefreshToken), schemas, security (hashing/JWT/refresh-token generation),
                     repository (TeacherRepository, RefreshTokenRepository — data access), service (TeacherService — business logic),
                     router (/auth/register, /auth/login, /auth/refresh, /auth/logout, /auth/me — thin, delegates to service)
    courses/        implemented: models (Course), schemas (CourseRead / CourseDetailRead with nested students), repository
                     (CourseRepository), service (CourseService — unique course_name enforced; get_detail joins in
                     enrolled students via EnrollmentRepository), router (/courses CRUD — all routes require
                     get_current_teacher; GET /courses/{id} returns CourseDetailRead)
    students/       implemented: models (Student: name, college, contact, email, whatsapp_number), schemas, repository
                     (StudentRepository), service (StudentService), router (/students CRUD)
    enrollments/    implemented: models (Enrollment: student_id, course_id, start_from date, unique(student_id, course_id)),
                     schemas, repository (EnrollmentRepository, incl. list_students_for_course used by courses/service),
                     service (EnrollmentService — enroll/unenroll, ConflictException on duplicate enrollment), router
                     (POST/GET /enrollments, DELETE /enrollments/{id} — add/delete only, no edit-in-place)
    payments/       stub (models/schemas/router/repository/service all # TODO)
    attendance/     stub (models/schemas/router/repository/service all # TODO)
  migrations/       Alembic (async env.py)
frontend/   React app (Vite + TypeScript)
  src/assets/       static assets, incl. logo.svg
  src/components/   shared components: Header, NavMenu, ProtectedRoute, Modal (generic backdrop+dialog, Escape-to-close),
                     ErrorDialog (renders ApiError via Modal-like backdrop)
  src/store/        Zustand stores: authStore (teacher session), courseStore (course list + create/update/delete)
  src/pages/        route pages: Login, Register, Dashboard, Courses (implemented); Students, Enrollments, Payments,
                     Attendance (placeholders)
  src/pages/courses/  CoursesPage's building blocks: CourseTable (list, rows navigate to /courses/:id),
                       CourseFormDialog (create/edit, renders in a Modal), CourseDetailPage (full page, route
                       /courses/:id — course detail card + enrolled students table, fetched via api.getCourse),
                       CourseIcons (inline SVGs), courseDisplay.ts (label/formatting helpers), courses.css
                       (styles shared by all of the above)
  src/types/        auth.ts, course.ts (incl. CourseDetail), student.ts — request/response shapes matching the
                     backend Pydantic schemas
  src/lib/          api.ts — fetch helpers for the backend
docs/       project docs
```

## Backend architecture

Each feature module follows a layered structure — routers stay thin, business logic and data access are separated so each module is testable independently:

- **`router.py`** — HTTP layer only. Parses the request via Pydantic schemas, calls the service through a FastAPI `Depends`, returns the result. No query logic or business rules.
- **`service.py`** — business logic (e.g. "registration is closed once a teacher exists", password verification, token issuance). Takes a repository instance, raises `app.core.exceptions.AppException` subclasses on domain errors. Exposes a `get_<name>_service` FastAPI dependency that wires up the repository from `get_db`.
- **`repository.py`** — data access only. Wraps the `AsyncSession` and exposes query/mutation methods (`get_by_id`, `get_by_email`, `create`, ...). No business rules here.
- **`models.py` / `schemas.py`** — SQLAlchemy models and Pydantic request/response schemas, unchanged from before.

`app/teacher/` is the reference implementation of this pattern (`repository.py`, `service.py`, `router.py`). Cross-cutting dependencies that need a service (e.g. `get_current_teacher` in `app/core/dependencies.py`) depend on the module's `get_<name>_service`, not on the repository or `AsyncSession` directly.

Domain errors are raised as `AppException` subclasses (`app/core/exceptions.py`) — e.g. `ConflictException`, `AuthenticationException`, `NotFoundException` — never `HTTPException` directly. Each carries `error_code`, `error_status`, `detail` (specific, request-level message), and `message` (generic class-level default); a single handler registered in `app/main.py` serializes all four into the JSON error body. Because FastAPI's own `HTTPBearer` raises a bare `HTTPException` on a missing/malformed `Authorization` header (which would otherwise bypass that handler and return a bare `{"detail": ...}` body), `app/core/dependencies.py` wraps it in a `BearerAuth` subclass that catches and re-raises as `AuthenticationException` — use `BearerAuth`, not `HTTPBearer` directly, anywhere bearer auth is wired up.

## Backend commands

Run from `backend/`, with the venv activated (`source .number-nest-venv/bin/activate`):

- Install deps: `pip install -r requirements.txt`
- Run dev server: `uvicorn app.main:app --reload`
- Apply migrations: `alembic upgrade head`
- Create a migration: `alembic revision -m "..."` (this project hand-writes `upgrade`/`downgrade` bodies rather than relying on `--autogenerate`)

## Frontend commands

Run from `frontend/`:

- Install deps: `npm install`
- Run dev server: `npm run dev`
- Type-check + production build: `npm run build` (runs `tsc -b && vite build`)
- Lint: `npm run lint` (oxlint)

## Features

1. **Course** — create/manage courses (name, fee, subject, days, capacity, motto); course detail includes the list of enrolled students
2. **Students** — create/manage student records (name, college, contact, email, whatsapp_number)
3. **Enrollment** — add or remove a student from a course, with a `start_from` date (add/delete only, no edit-in-place semantics implied)
4. **Payment tracking** — manually record payments against a student's course enrollment; no gateway, no automated billing
5. **Attendance** — record attendance per student per course session
6. **Teacher** — the single teacher is the sole system user/operator; adds/manages students and courses

## Domain notes

- Single teacher only — not multi-tenant, no teacher-course assignment relation. The teacher is the only actor who logs in; students have no login/portal.
- A student can be enrolled in multiple courses; a course can have multiple students (many-to-many via the enrollment relation).
- Payments and attendance both hang off the student-course enrollment, not the student or course alone.
- Per-feature details live in `.claude/rules/features/`.
- Keep this file updated as the schema and API surface solidify — add test/lint commands here once they exist, and frontend run/build commands once the frontend has real functionality.