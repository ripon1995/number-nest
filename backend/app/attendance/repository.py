import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.attendance.models import Attendance
from app.enrollments.models import Enrollment


class AttendanceRepository:
    """Data access for the Attendance model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, attendance_id: uuid.UUID) -> Attendance | None:
        return await self.db.get(Attendance, attendance_id)

    async def get_by_enrollment_and_date(
        self, enrollment_id: uuid.UUID, session_date: date
    ) -> Attendance | None:
        return await self.db.scalar(
            select(Attendance).where(
                Attendance.enrollment_id == enrollment_id,
                Attendance.session_date == session_date,
            )
        )

    async def list_for_course(
        self, course_id: uuid.UUID, session_date: date | None = None
    ) -> list[tuple[Attendance, uuid.UUID]]:
        query = (
            select(Attendance, Enrollment.student_id)
            .join(Enrollment, Enrollment.id == Attendance.enrollment_id)
            .where(Enrollment.course_id == course_id)
            .order_by(Attendance.session_date.desc())
        )
        if session_date is not None:
            query = query.where(Attendance.session_date == session_date)
        result = await self.db.execute(query)
        return [(row[0], row[1]) for row in result.all()]

    async def create(
        self, *, enrollment_id: uuid.UUID, session_date: date, present: bool
    ) -> Attendance:
        attendance = Attendance(
            enrollment_id=enrollment_id, session_date=session_date, present=present
        )
        self.db.add(attendance)
        await self.db.commit()
        await self.db.refresh(attendance)
        return attendance

    async def update_present(self, attendance: Attendance, present: bool) -> Attendance:
        attendance.present = present
        await self.db.commit()
        await self.db.refresh(attendance)
        return attendance

    async def delete(self, attendance: Attendance) -> None:
        await self.db.delete(attendance)
        await self.db.commit()
