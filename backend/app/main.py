from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.attendance.router import router as attendance_router
from app.core.config import settings
from app.core.exception_handler import register_exception_handlers
from app.core.logging import log_requests, setup_logging
from app.courses.router import router as courses_router
from app.enrollments.router import router as enrollments_router
from app.payments.router import router as payments_router
from app.students.router import router as students_router
from app.teacher.router import router as teacher_router

setup_logging()

app = FastAPI(
    title="Number Nest",
    description="Number Nest APIs for management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# ── Exception handlers ──────────────────────────────────────────────────────
register_exception_handlers(app)

# Dev-only: allow the Vite dev server to call the API. Single-teacher system,
# no cookies/credentials involved — auth is a Bearer token, so no allow_credentials needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(log_requests)

app.include_router(teacher_router)
app.include_router(courses_router)
app.include_router(students_router)
app.include_router(enrollments_router)
app.include_router(payments_router)
app.include_router(attendance_router)


@app.get("/", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}
