import uuid
from datetime import date

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.attendance.repository import AttendanceRepository
from app.attendance.schemas import AttendanceBulkCreate, AttendanceRead
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.courses.repository import CourseRepository
from app.enrollments.repository import EnrollmentRepository


class AttendanceService:
    """Business logic for recording/listing attendance per session.

    See .claude/rules/features/attendance.md. Attendance is submitted a full
    course-session sheet at a time; re-submitting for a date that already has
    records upserts them rather than conflicting, since revisiting a date to
    fix a mistake is the expected flow.
    """

    def __init__(
        self,
        repository: AttendanceRepository,
        enrollment_repository: EnrollmentRepository,
        course_repository: CourseRepository,
    ) -> None:
        self.repository = repository
        self.enrollment_repository = enrollment_repository
        self.course_repository = course_repository

    async def record_bulk(self, payload: AttendanceBulkCreate) -> list[AttendanceRead]:
        if await self.course_repository.get_by_id(payload.course_id) is None:
            raise NotFoundException(f"Course {payload.course_id} not found")

        results: list[AttendanceRead] = []
        for entry in payload.entries:
            enrollment = await self.enrollment_repository.get_by_student_and_course(
                entry.student_id, payload.course_id
            )
            if enrollment is None:
                raise NotFoundException(
                    f"Student {entry.student_id} is not enrolled in this course"
                )

            existing = await self.repository.get_by_enrollment_and_date(
                enrollment.id, payload.session_date
            )
            if existing is not None:
                attendance = await self.repository.update_present(existing, entry.present)
            else:
                attendance = await self.repository.create(
                    enrollment_id=enrollment.id,
                    session_date=payload.session_date,
                    present=entry.present,
                )

            results.append(
                AttendanceRead(
                    id=attendance.id,
                    enrollment_id=attendance.enrollment_id,
                    student_id=entry.student_id,
                    session_date=attendance.session_date,
                    present=attendance.present,
                    created_at=attendance.created_at,
                )
            )
        return results

    async def list_for_course(
        self, course_id: uuid.UUID, session_date: date | None = None
    ) -> list[AttendanceRead]:
        if await self.course_repository.get_by_id(course_id) is None:
            raise NotFoundException(f"Course {course_id} not found")

        rows = await self.repository.list_for_course(course_id, session_date)
        return [
            AttendanceRead(
                id=attendance.id,
                enrollment_id=attendance.enrollment_id,
                student_id=student_id,
                session_date=attendance.session_date,
                present=attendance.present,
                created_at=attendance.created_at,
            )
            for attendance, student_id in rows
        ]

    async def delete_attendance(self, attendance_id: uuid.UUID) -> None:
        attendance = await self.repository.get_by_id(attendance_id)
        if attendance is None:
            raise NotFoundException(f"Attendance record {attendance_id} not found")
        await self.repository.delete(attendance)


def get_attendance_service(db: AsyncSession = Depends(get_db)) -> AttendanceService:
    return AttendanceService(
        AttendanceRepository(db), EnrollmentRepository(db), CourseRepository(db)
    )
