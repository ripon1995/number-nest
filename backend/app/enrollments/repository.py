import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enrollments.models import Enrollment
from app.students.models import Student


class EnrollmentRepository:
    """Data access for the Enrollment model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, enrollment_id: uuid.UUID) -> Enrollment | None:
        return await self.db.get(Enrollment, enrollment_id)

    async def get_by_student_and_course(
        self, student_id: uuid.UUID, course_id: uuid.UUID
    ) -> Enrollment | None:
        return await self.db.scalar(
            select(Enrollment).where(
                Enrollment.student_id == student_id, Enrollment.course_id == course_id
            )
        )

    async def list_all(
        self, *, student_id: uuid.UUID | None = None, course_id: uuid.UUID | None = None
    ) -> list[Enrollment]:
        query = select(Enrollment).order_by(Enrollment.id)
        if student_id is not None:
            query = query.where(Enrollment.student_id == student_id)
        if course_id is not None:
            query = query.where(Enrollment.course_id == course_id)
        result = await self.db.scalars(query)
        return list(result.all())

    async def list_students_for_course(self, course_id: uuid.UUID) -> list[Student]:
        result = await self.db.scalars(
            select(Student)
            .join(Enrollment, Enrollment.student_id == Student.id)
            .where(Enrollment.course_id == course_id)
            .order_by(Student.id)
        )
        return list(result.all())

    async def create(
        self,
        *,
        student_id: uuid.UUID,
        course_id: uuid.UUID,
        start_from: date,
        enrollment_fee_paid: bool,
    ) -> Enrollment:
        enrollment = Enrollment(
            student_id=student_id,
            course_id=course_id,
            start_from=start_from,
            enrollment_fee_paid=enrollment_fee_paid,
        )
        self.db.add(enrollment)
        await self.db.commit()
        await self.db.refresh(enrollment)
        return enrollment

    async def update_fee_paid(self, enrollment: Enrollment, *, enrollment_fee_paid: bool) -> Enrollment:
        enrollment.enrollment_fee_paid = enrollment_fee_paid
        await self.db.commit()
        await self.db.refresh(enrollment)
        return enrollment

    async def delete(self, enrollment: Enrollment) -> None:
        await self.db.delete(enrollment)
        await self.db.commit()
