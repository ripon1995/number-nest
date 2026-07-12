# number-nest

A basic course/student management system for tracking course enrollment, manual payments, and attendance.

## Status

`frontend/` is scaffolded (Vite + React + TypeScript) with teacher auth wired up end-to-end: `LoginPage`/`RegisterPage`/`DashboardPage`, a Zustand `authStore` holding the teacher session, and a `ProtectedRoute` gating authenticated routes. `Header` renders the app logo top-left (plus the logged-in teacher's name and a logout button) on every page. Once logged in, a `NavMenu` renders as a left sidebar (not a top bar) linking to Dashboard, Students, Courses, Enrollments, Payments, Attendance, Exams, and Notices, each link paired with an inline icon (`src/components/NavIcons.tsx`) sitting in a bordered 32px icon box (`.app-nav-icon`) that echoes the bordered icon-button style already used in every feature's list-table Action column; `App.tsx` wraps the sidebar and the routed page content in an `.app-body`/`.app-main` flex row so the two sit side by side. The whole app is responsive: below 768px the sidebar collapses into a horizontal, horizontally-scrollable top bar (`NavMenu.css`'s `@media (max-width: 768px)` block, which also switches `.app-body` to a column layout); the header wraps below 640px; every feature page's header row (`*-page-header`) wraps its action button under the title if space runs out; and `#content` (rendered by every page) is `box-sizing: border-box` with `min-width: 0` so its own padding can't push the page wider than the viewport (a real bug hit during this pass — the sidebar shrank available width enough to expose it). `DashboardPage` (route `/dashboard`) is an analytics view, not a form/list page: a course `<select>` (from `courseStore`) and a student `<select>` (populated from that course's enrolled students via `api.getCourse`, disabled until a course is picked, and reset whenever the course changes) scope everything below them. Selecting a course fetches that course's attendance (`api.getAttendance(courseId)`, no `session_date` — every session for the course), its exams (`api.getExams(courseId)`, the frontend `getExams` helper gained an optional `courseId` query param for this — the backend route already supported `course_id` filtering, unused until now), and then that course's marks per exam (`api.getMarks(examId)` fanned out over each exam with `Promise.all`, since marks have no course-level list endpoint) and renders a course-level section: an `AttendanceDonut` (present/absent share across every enrolled student's sessions) plus a `BarChart` of the average mark per exam. Picking a student on top of that adds a second, student-scoped section with the same two chart shapes — an `AttendanceDonut` of just that student's present/absent sessions, and a `BarChart` of just that student's obtained mark per exam — computed client-side by filtering the same attendance/marks payloads already fetched for the course, not a second round of requests. The two chart components (`src/components/charts/AttendanceDonut.tsx`, `BarChart.tsx`, sharing `chartMath.ts` for the niceCeil axis-rounding and conic-gradient donut math, and `charts.css`) are generic and reused across both the course-level and student-level sections. `CoursesPage` is implemented end-to-end against `app/courses/`: a Zustand `courseStore` (`fetchCourses`/`createCourse`/`updateCourse`/`deleteCourse`) backs a list table (`CourseTable`, with edit/delete icon actions), and a create/edit form (`CourseFormDialog`) that renders inside a generic `Modal` component (`src/components/Modal.tsx`) reusable by future features. Course list rows are clickable and navigate to `CourseDetailPage` (route `/courses/:id`) — a full page (not a modal) showing a read-only course card plus a table of the course's enrolled students, fetched via `GET /courses/{id}` (which now returns the enrolled student list alongside the course fields). `StudentsPage` is implemented end-to-end against `app/students/`, following the same list-table + `Modal` create/edit-form pattern as courses (`studentStore`, `StudentTable`, `StudentFormDialog`). `EnrollmentsPage` is implemented end-to-end against `app/enrollments/`: a Zustand `enrollmentStore` (`fetchEnrollments`/`createEnrollment`/`updateEnrollmentFeePaid`/`deleteEnrollment` — add/delete only for the enrollment itself, matching the backend's no-edit-in-place semantics, plus a narrow update path for the fee-paid flag described below) backs a list table (`EnrollmentTable`) that resolves each enrollment's `student_id`/`course_id` to a display name via lookup maps built client-side from `studentStore`/`courseStore` (the `EnrollmentRead` schema only returns ids, not nested student/course objects); `EnrollmentFormDialog` renders in a `Modal` with student/course `<select>`s populated from those same stores, a `start_from` date input, and an "Enrollment fee paid" checkbox (defaults unchecked). `EnrollmentTable` also renders `enrollment_fee_paid` as a live checkbox per row — toggling it calls `updateEnrollmentFeePaid`, which hits `PATCH /enrollments/{id}/fee-paid`, a deliberate one-field exception to the add/delete-only rule (see `.claude/rules/features/enrollment.md`) since delete/re-add would cascade-delete the enrollment's payment and attendance history just to flip a boolean. The enrollment modal is intentionally wider than the default (`Modal`'s `className` prop, added for this, plus an `.enrollment-modal` override in `enrollments.css`) since it doesn't fit `Modal`'s default 640px max-width as comfortably as the shorter course/student forms. `EnrollmentsPage` guards "Add enrollment" behind a check that at least one student and one course exist first, surfacing a client-side `ApiError` via `ErrorDialog` if not. `PaymentsPage` is implemented end-to-end against `app/payments/`, following the same list-table + `Modal` create-form pattern as enrollments: a Zustand `paymentStore` (`fetchPayments`/`createPayment`/`deletePayment` — add/delete only) backs a list table (`PaymentTable`) that resolves each payment's `enrollment_id` to student/course display names via a two-hop lookup (`enrollment_id` → enrollment → `student_id`/`course_id` → name, since `PaymentRead` only returns `enrollment_id`, not nested objects); `PaymentFormDialog` has a single enrollment `<select>` (labelled `"{student} — {course}"`) plus a `month` (`<input type="month">`, converted to the first-of-month date `YYYY-MM-01` on submit), `payment_date`, and `amount` input, rendered in a `Modal`, and `PaymentsPage` guards "Add payment" behind at least one enrollment existing, same pattern as enrollments' guard. `AttendancePage` looks different from every other feature page, by design (see `.claude/rules/features/attendance.md`): a course `<select>` (from `courseStore`) plus a `session_date` input (defaulted to today) drive an `AttendanceSheet` — a table of that course's enrolled students (fetched via `api.getCourse`, not `courseStore`, since only `CourseDetailRead` carries the student list) with a present/absent checkbox per row, prefilled from any existing attendance for that `(course, date)` via the Zustand `attendanceStore`'s `fetchAttendance`, and submitted as one `POST /attendance/bulk` call via `submitAttendance` — resubmitting for the same date upserts rather than erroring, so the date field doubles as a way to revisit and correct a prior session. The layout is full-width and forced to a single light theme (no dark-mode media query). `ExamsPage` and `NoticesPage` are implemented end-to-end against `app/exams/` and `app/notices/` respectively, each its own standalone nav link/route (`/exams`, `/notices`) rather than living on the Dashboard — an earlier pass toward folding event creation into the Dashboard was scrapped in favor of matching every other feature's list-page pattern. Both follow the same list-table + `Modal` create-form pattern as payments/enrollments: `examStore`/`noticeStore` (`fetch*`/`create*`/`delete*` — add/delete only) back `ExamTable`/`NoticeTable`, each resolving `course_id` to a course name via a lookup map built from `courseStore`; `ExamFormDialog` has a course `<select>`, a `datetime-local` input, an optional description textarea, and an `exam_mark` number input, while `NoticeFormDialog` has `event_name`/`event_place` text inputs, a `datetime-local` input, and a course `<select>` — both guard their "Add" action behind at least one course existing, same as payments/enrollments. `ExamTable` rows are clickable (same pattern as `CourseTable`) and navigate to `ExamDetailPage` (route `/exams/:id`) — a full page showing a read-only exam card plus a `MarkSheet`: a table of that exam's course's enrolled students (fetched via `api.getCourse`, same source `AttendanceSheet` uses) with a numeric mark input per row, prefilled from any existing marks for that exam via the Zustand `markStore`'s `fetchMarks`, and submitted as one `POST /marks/bulk` call via `submitMarks` — resubmitting for the same exam upserts each student's mark rather than erroring, mirroring `AttendancePage`'s upsert-on-resubmit pattern exactly. `LandingPage` (route `/`) is the one public, unauthenticated page in the app — not wrapped in `ProtectedRoute`, rendered without the `NavMenu` sidebar; `DashboardPage` moved off `/` to a new protected route, `/dashboard`, and `NavMenu`'s "Dashboard" link plus the post-login redirect now point there instead. `NavMenu` also gained a "Landing page" link (first item, `HomeIcon`) pointing at `/`, so a logged-in teacher can navigate back to the public landing page from the sidebar. `LandingPage` is backed by a `publicStore` (`fetchPublicCourses`/`fetchPublicNotices`, hitting `app/public/`'s unauthenticated routes) and renders two read-only sections: a single horizontally-scrolling row of upcoming notice cards (`NoticeCard`, `.notice-grid` is a non-wrapping flex row, not a grid — no click-through, no detail page) with each notice's `course_id` resolved to a name via the fetched public course list, same lookup-map pattern used everywhere else; and a "Routine" section (heading before the container, mirroring "Notices") with a centered, wide "Select your course" `<select>` that, once a course is picked, renders a `RoutineTable` below it — a real HTML `<table>` (Day | Time, one row per `course_days` entry sorted into Mon→Sun order, `class_time` repeated per row since it's one time for the whole course, tight column padding) plus the course's `note` (not `course_motto`) shown bold and red below the table as a standout callout. `backend/` is scaffolded with a module per feature. `app/teacher/` is implemented: the `Teacher` and `RefreshToken` models plus register/login/refresh/logout/me auth endpoints (JWT bearer access tokens + opaque, hashed, DB-backed refresh tokens with rotation-on-use and revocation, bcrypt password hashing), split into router (HTTP)/service (business logic)/repository (data access) layers — see [Backend architecture](#backend-architecture). `app/courses/` is implemented: full CRUD (create/list/get/update/delete) on the `Course` model (fields include both `course_fee`, the recurring fee, and `enrollment_fee`, the one-time fee charged at enrollment, plus `class_time` — a required time-of-day all of `course_days` share — and `note`, an optional freeform string shown on the landing page's routine table), gated behind `get_current_teacher` on every route; `GET /courses/{id}` returns `CourseDetailRead` (course fields plus `students: StudentRead[]`, sourced via `EnrollmentRepository.list_students_for_course`). `app/students/` is implemented: full CRUD on the `Student` model. `app/enrollments/` is implemented: add/list/delete only (no edit-in-place) on the `Enrollment` join model, with a DB-level unique constraint on `(student_id, course_id)` plus a service-layer `ConflictException` guard against double-enrollment; it also carries an `enrollment_fee_paid` boolean (settable at creation, default `False`) that can be updated afterwards via a dedicated `PATCH /enrollments/{id}/fee-paid` route — the one deliberate exception to enrollments' otherwise add/delete-only semantics, since delete/re-add would cascade-delete payment and attendance history just to flip that flag. `app/payments/` is implemented: add/list/delete only (no edit-in-place) on the `Payment` model, which hangs off `enrollment_id` (not `student_id`/`course_id` directly), with a DB-level unique constraint on `(enrollment_id, month)` plus a service-layer `ConflictException` guard against recording two payments for the same enrollment in the same month. `app/attendance/` is implemented: the `Attendance` model hangs off `enrollment_id` with a unique constraint on `(enrollment_id, session_date)`; `POST /attendance/bulk` records a whole course-session sheet at once — resolving each entry's `student_id` to its enrollment via `EnrollmentRepository.get_by_student_and_course`, then **upserting** the `(enrollment, session_date)` row (unlike every other feature's add/delete-only semantics) — and `GET /attendance` (required `course_id`, optional `session_date`) returns `AttendanceRead` enriched with a `student_id` field that isn't a column on `Attendance` itself but is joined in via `Enrollment`, so the frontend can match records back to students without a second fetch. `app/exams/` is implemented: add/list/delete only (no edit-in-place) on the `Exam` model (course_id, exam_datetime, description, exam_mark — the exam's total/full mark, not a per-student score), which hangs off `course_id` directly (not enrollment, unlike payments/attendance) since an exam belongs to the course as a whole. `app/notices/` is implemented: add/list/delete only (no edit-in-place) on the `Notice` model (course_id, event_name, event_place, event_datetime), same course_id-direct relationship as exams. `app/marks/` is implemented: the `Mark` model hangs off both `enrollment_id` and `exam_id` with a unique constraint on `(enrollment_id, exam_id)`; `POST /marks/bulk` records a whole exam's mark sheet at once — resolving each entry's `student_id` to its enrollment via `EnrollmentRepository.get_by_student_and_course` (using the exam's `course_id`), then **upserting** the `(enrollment, exam)` row, exactly like `app/attendance/`'s bulk upsert — and `GET /marks?exam_id=` returns `MarkRead` enriched with a `student_id` field joined in via `Enrollment`, same technique attendance uses. `GET /exams/{id}` (added alongside marks) returns a single `ExamRead`, backing `ExamDetailPage`'s fetch. `app/public/` is implemented: the one router in the app with **no** `get_current_teacher` dependency, backing `LandingPage`. Rather than a new model/schema layer, its `PublicService` wraps `CourseRepository` and `NoticeRepository` directly (the same repositories `app/courses/` and `app/notices/` already use) and reuses their `CourseRead`/`NoticeRead` response schemas unchanged — `GET /public/courses` returns every course unfiltered, `GET /public/notices` returns only upcoming ones (`event_datetime >= now`, ascending) via a new `NoticeRepository.list_upcoming` method. Shared infra (`Settings`, DB engine/session, the `get_current_teacher` auth dependency and `BearerAuth` bearer-scheme wrapper, the `AppException` family + handler) lives in `app/core/`. All models use UUID (not integer) primary keys. Alembic migrations run against a Supabase Postgres project over the transaction pooler. This file documents the intended stack and feature scope so implementation stays consistent as it's built out.

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
    enrollments/    implemented: models (Enrollment: student_id, course_id, start_from date, enrollment_fee_paid
                     boolean (default False), unique(student_id, course_id)), schemas (incl. EnrollmentFeeUpdate),
                     repository (EnrollmentRepository, incl. list_students_for_course used by courses/service,
                     update_fee_paid), service (EnrollmentService — enroll/unenroll, set_fee_paid,
                     ConflictException on duplicate enrollment), router (POST/GET /enrollments,
                     PATCH /enrollments/{id}/fee-paid, DELETE /enrollments/{id} — add/delete only aside from the
                     fee-paid PATCH carve-out, no general edit-in-place)
    payments/       implemented: models (Payment: enrollment_id, month, payment_date, amount, unique(enrollment_id, month)),
                     schemas, repository (PaymentRepository), service (PaymentService — record/list/delete,
                     ConflictException on duplicate enrollment+month), router (/payments — POST/GET/DELETE,
                     add/delete only, no edit-in-place)
    attendance/     implemented: models (Attendance: enrollment_id, session_date, present, unique(enrollment_id,
                     session_date)), schemas (AttendanceRead includes a student_id joined in via Enrollment, not
                     a model column), repository (AttendanceRepository, incl. list_for_course joining Enrollment),
                     service (AttendanceService — record_bulk upserts a whole course-session sheet at once via
                     EnrollmentRepository.get_by_student_and_course, list_for_course, delete_attendance), router
                     (POST /attendance/bulk, GET /attendance?course_id=&session_date=, DELETE /attendance/{id})
    exams/          implemented: models (Exam: course_id, exam_datetime, description, exam_mark), schemas,
                     repository (ExamRepository), service (ExamService — create/list/get_detail/delete,
                     NotFoundException if course_id doesn't exist), router (/exams — POST/GET/DELETE plus
                     GET /exams/{id} for ExamDetailPage, add/delete only, no edit-in-place)
    notices/        implemented: models (Notice: course_id, event_name, event_place, event_datetime), schemas,
                     repository (NoticeRepository), service (NoticeService — create/list/delete, NotFoundException
                     if course_id doesn't exist), router (/notices — POST/GET/DELETE, add/delete only, no edit-in-place)
    marks/          implemented: models (Mark: enrollment_id, exam_id, mark, unique(enrollment_id, exam_id)),
                     schemas (MarkRead includes a student_id joined in via Enrollment, not a model column),
                     repository (MarkRepository, incl. list_for_exam joining Enrollment), service
                     (MarkService — record_bulk upserts a whole exam's mark sheet at once via
                     EnrollmentRepository.get_by_student_and_course, list_for_exam, delete_mark), router
                     (POST /marks/bulk, GET /marks?exam_id=, DELETE /marks/{id})
    public/         implemented: no models/schemas of its own (reuses CourseRead/NoticeRead); service
                     (PublicService — wraps CourseRepository + NoticeRepository directly, not the courses/notices
                     services), router (/public/courses, /public/notices — the only routes with no
                     get_current_teacher dependency)
  migrations/       Alembic (async env.py)
frontend/   React app (Vite + TypeScript)
  src/assets/       static assets, incl. logo.svg
  src/components/   shared components: Header (responsive, wraps below 640px), NavMenu (left sidebar, collapses to a
                     horizontal scrollable top bar below 768px), NavIcons.tsx (inline SVG icon per nav link, each
                     rendered in a bordered .app-nav-icon box), ProtectedRoute, Modal (generic backdrop+dialog,
                     Escape-to-close, optional className prop for per-use width overrides), ErrorDialog (renders
                     ApiError via Modal-like backdrop)
  src/components/charts/  chart primitives used by DashboardPage: AttendanceDonut (2-slice present/absent donut,
                     CSS conic-gradient, status-good/status-critical colors), BarChart (single-series column chart,
                     fixed-pixel-spacer layout so bars/gridlines/axis stay aligned regardless of label length),
                     chartMath.ts (niceCeil axis rounding, buildDonutGradient), charts.css (shared by both)
  src/store/        Zustand stores: authStore (teacher session), courseStore (course list + create/update/delete),
                     studentStore (student list + create/update/delete), enrollmentStore (enrollment list +
                     create/delete — matching the backend's add/delete-only semantics — plus
                     updateEnrollmentFeePaid, the one narrow update path), paymentStore
                     (payment list + create/delete — no update), attendanceStore (records for the currently
                     selected course — fetchAttendance/submitAttendance, not a flat global list like the others),
                     examStore, noticeStore (both: list + create/delete — no update, same shape as paymentStore),
                     markStore (records for the currently selected exam — fetchMarks/submitMarks, same shape as
                     attendanceStore), publicStore (fetchPublicCourses/fetchPublicNotices — read-only, unauthenticated,
                     backs LandingPage only)
  src/pages/        route pages: Login, Register, Dashboard (route /dashboard), Landing (route /, public), Courses,
                     Students, Enrollments, Payments, Attendance, Exams, Notices (all implemented)
  src/pages/dashboard/  DashboardPage's building blocks: dashboardDisplay.ts (formatShortDate/formatDateTime),
                        dashboard.css. DashboardPage itself computes the course-/student-level attendance and
                        marks-per-exam chart data inline (countAttendance/buildAverageMarksData/
                        buildStudentMarksData) rather than in this folder, since that logic is one-page-only.
  src/pages/courses/  CoursesPage's building blocks: CourseTable (list, rows navigate to /courses/:id),
                       CourseFormDialog (create/edit, renders in a Modal), CourseDetailPage (full page, route
                       /courses/:id — course detail card + enrolled students table, fetched via api.getCourse),
                       CourseIcons (inline SVGs), courseDisplay.ts (label/formatting helpers), courses.css
                       (styles shared by all of the above)
  src/pages/students/  StudentsPage's building blocks: StudentTable (list), StudentFormDialog (create/edit, renders
                        in a Modal), StudentIcons (inline SVGs), students.css (styles shared by all of the above)
  src/pages/enrollments/  EnrollmentsPage's building blocks: EnrollmentTable (list, resolves student/course ids to
                          names via lookup maps passed in as props; renders enrollment_fee_paid as a live toggle
                          checkbox, not read-only), EnrollmentFormDialog (create only — no edit for
                          student/course/start_from, plus an "Enrollment fee paid" checkbox at creation time,
                          renders in a Modal widened via the enrollment-modal class), EnrollmentIcons (inline SVGs,
                          trash only — no edit icon), enrollments.css (styles shared by all of the above)
  src/pages/payments/  PaymentsPage's building blocks: PaymentTable (list, resolves enrollment_id to student/course
                       names via a two-hop lookup), PaymentFormDialog (create only — no edit, single enrollment
                       <select> + month/payment_date/amount inputs, renders in the default-width Modal),
                       PaymentIcons (inline SVGs, trash only), paymentDisplay.ts (formatMonth/formatAmount/
                       monthInputToApi helpers), payments.css (styles shared by all of the above)
  src/pages/attendance/  AttendancePage's building blocks: AttendanceSheet (table of a course's enrolled students
                         with a present/absent checkbox per row, local state prefilled from existing records for
                         the selected course+date), attendance.css (styles shared by the above)
  src/pages/exams/    ExamsPage's building blocks: ExamTable (list, resolves course_id to a name via a lookup map,
                      rows clickable and navigate to /exams/:id), ExamFormDialog (create only — no edit, course
                      <select> + datetime-local + description textarea + exam_mark number input, renders in the
                      default-width Modal), ExamDetailPage (full page, route /exams/:id — exam detail card +
                      MarkSheet, fetched via api.getExam then api.getCourse), MarkSheet (table of the exam's
                      course's enrolled students with a numeric mark input per row, local state prefilled from
                      existing marks for the selected exam), ExamIcons (inline SVGs, trash only), examDisplay.ts
                      (formatDateTime helper), exams.css (styles shared by all of the above)
  src/pages/notices/  NoticesPage's building blocks: NoticeTable (list, resolves course_id to a name via a lookup
                      map), NoticeFormDialog (create only — no edit, event_name/event_place text inputs +
                      datetime-local + course <select>, renders in the default-width Modal), NoticeIcons (inline
                      SVGs, trash only), noticeDisplay.ts (formatDateTime helper), notices.css (styles shared by the above)
  src/pages/landing/  LandingPage's building blocks: NoticeCard (display-only, no click-through), RoutineTable
                      (HTML table, Day | Time rows sorted Mon→Sun for the selected course's course_days +
                      class_time), landingDisplay.ts (day-sort/time-format helpers), landing.css (styles shared
                      by the above) — LandingPage itself owns the course <select> driving RoutineTable
  src/types/        auth.ts, course.ts (incl. CourseDetail; CourseCreate/CourseRead now carry class_time/note),
                     student.ts, enrollment.ts, payment.ts, attendance.ts, exam.ts, notice.ts, mark.ts —
                     request/response shapes matching the backend Pydantic schemas
  src/api/          client.ts (fetch wrapper + auth headers), index.ts (barrel re-export), plus one file per
                     feature (auth.ts, courses.ts, students.ts, enrollments.ts, payments.ts, attendance.ts,
                     exams.ts, notices.ts, marks.ts, public.ts) — fetch helpers for the backend; public.ts is the
                     only one that never attaches an auth header
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

1. **Course** — create/manage courses (name, recurring fee, one-time enrollment fee, subject, days, class time, capacity, motto, note); course detail includes the list of enrolled students
2. **Students** — create/manage student records (name, college, contact, email, whatsapp_number)
3. **Enrollment** — add or remove a student from a course, with a `start_from` date and an `enrollment_fee_paid` flag tracking whether that course's enrollment fee has been paid (add/delete only for the enrollment itself; the fee-paid flag is the one field updatable in place)
4. **Payment tracking** — manually record payments against a student's course enrollment; no gateway, no automated billing
5. **Attendance** — record attendance per student per course session
6. **Exam** — schedule exams for a course (course, date/time, description, exam mark); add/delete only; its detail page hosts per-student mark entry
7. **Notice** — post event notices tied to a course (event name, place, date/time, course); add/delete only, not tied to individual enrollments
8. **Mark** — record each enrolled student's obtained mark for an exam, bulk-submitted per exam sheet (upserts on resubmit, like attendance)
9. **Teacher** — the single teacher is the sole system user/operator; adds/manages students and courses
10. **Landing page** — the public, unauthenticated home page (route `/`): a card grid of upcoming notices, plus a "Watch your routine" course picker showing that course's day/time schedule as an HTML table; read-only, no login, no detail pages

## Domain notes

- Single teacher only — not multi-tenant, no teacher-course assignment relation. The teacher is the only actor who logs in; students have no login/portal.
- The landing page (`/`) is the one deliberate exception to "every route requires `get_current_teacher`" — it's read-only (courses and upcoming notices only) and exists so visitors can check a course's schedule without an account.
- A student can be enrolled in multiple courses; a course can have multiple students (many-to-many via the enrollment relation).
- Payments, attendance, and marks all hang off the student-course enrollment, not the student or course alone.
- Per-feature details live in `.claude/rules/features/`.
- Keep this file updated as the schema and API surface solidify — add test/lint commands here once they exist, and frontend run/build commands once the frontend has real functionality.