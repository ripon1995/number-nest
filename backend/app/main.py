from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.attendance.router import router as attendance_router
from app.core.config import settings
from app.core.exception_handler import register_exception_handlers
from app.core.logging import RequestLoggerMiddleware, setup_logging
from app.courses.router import router as courses_router
from app.enrollments.router import router as enrollments_router
from app.exams.router import router as exams_router
from app.marks.router import router as marks_router
from app.notices.router import router as notices_router
from app.payments.router import router as payments_router
from app.public.router import router as public_router
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

# ── Middleware ──────────────────────────────────────────────────────────────
# Dev-only: allow the Vite dev server to call the API. Single-teacher system,
# no cookies/credentials involved — auth is a Bearer token, so no allow_credentials needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# request logger middleware
app.add_middleware(RequestLoggerMiddleware, env_name=settings.environment)

api_router = APIRouter()
api_router.include_router(teacher_router)
api_router.include_router(courses_router)
api_router.include_router(students_router)
api_router.include_router(enrollments_router)
api_router.include_router(payments_router)
api_router.include_router(attendance_router)
api_router.include_router(exams_router)
api_router.include_router(notices_router)
api_router.include_router(marks_router)
api_router.include_router(public_router)

app.include_router(api_router, prefix="/api")


@app.get("/", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}
