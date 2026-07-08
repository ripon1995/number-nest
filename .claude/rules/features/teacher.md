# Teacher

The single teacher is the sole user/operator of the system.

## Rules

- Single teacher only — this is not a multi-tenant or multi-teacher system. Don't model a teacher-course assignment relation or a teachers list/table beyond what's needed for the one account.
- The teacher is the only actor who logs in and uses the system. They add/manage [[students]] and [[course]] records.
- Students do not log in — no student-facing auth, portal, or account. Students are just data managed by the teacher.
- No many-to-many teacher-course relation — a course simply belongs to the one teacher.
- Auth is a short-lived JWT access token plus an opaque, DB-backed refresh token (`RefreshToken` model, only the SHA-256 hash is stored). `/auth/refresh` rotates the refresh token on every use (old one revoked, new one issued); `/auth/logout` revokes it. `get_current_teacher` only ever validates the access token — it has no knowledge of refresh tokens.