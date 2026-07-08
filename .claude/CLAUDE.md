# number-nest

A basic course/student management system for tracking course enrollment, manual payments, and attendance.

## Status

Greenfield project. `backend/` and `frontend/` currently only contain a Python venv and a `.node-version` file — no application code exists yet. This file documents the intended stack and feature scope so implementation stays consistent as it's built out.

## Stack

- **Backend**: Python 3.14, FastAPI
- **Frontend**: Node 24, React (Vite)
- **Database**: PostgreSQL via Supabase
- **Payments**: manual/offline tracking only — no payment gateway integration

## Repo layout

```
backend/    FastAPI app
frontend/   React app
docs/       project docs
```

## Features

1. **Course** — create/manage courses (name, schedule, fee, etc.)
2. **Students** — create/manage student records
3. **Enrollment** — add or remove a student from a course (add/delete only, no edit-in-place semantics implied)
4. **Payment tracking** — manually record payments against a student's course enrollment; no gateway, no automated billing
5. **Attendance** — record attendance per student per course session
6. **Teacher** — create/manage teacher records; assign teachers to courses

## Domain notes

- A student can be enrolled in multiple courses; a course can have multiple students (many-to-many via the enrollment relation).
- A teacher can be assigned to multiple courses; a course can have multiple teachers (many-to-many, analogous to enrollment).
- Payments and attendance both hang off the student-course enrollment, not the student or course alone.
- Per-feature details live in `.claude/rules/features/`.
- Keep this file updated as the schema and API surface solidify — add real run/build/test/lint commands here once the backend and frontend are scaffolded.