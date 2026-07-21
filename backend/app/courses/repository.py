import uuid
from datetime import time
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.courses.models import Course


class CourseRepository:
    """Data access for the Course model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, course_id: uuid.UUID) -> Course | None:
        return await self.db.get(Course, course_id)

    async def get_by_name(self, course_name: str) -> Course | None:
        return await self.db.scalar(select(Course).where(Course.course_name == course_name))

    async def list_all(self) -> list[Course]:
        result = await self.db.scalars(select(Course).order_by(Course.id))
        return list(result.all())

    async def create(
        self,
        *,
        course_name: str,
        class_level: str,
        subject: str,
        exam_year: int,
        class_time: time,
        batch_type: str,
        course_fee: Decimal,
        enrollment_fee: Decimal,
        course_days: list[str],
        capacity: int,
        course_motto: str | None,
        note: str | None,
    ) -> Course:
        course = Course(
            course_name=course_name,
            class_level=class_level,
            subject=subject,
            exam_year=exam_year,
            class_time=class_time,
            batch_type=batch_type,
            course_fee=course_fee,
            enrollment_fee=enrollment_fee,
            course_days=course_days,
            capacity=capacity,
            course_motto=course_motto,
            note=note,
        )
        self.db.add(course)
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def update(
        self,
        course: Course,
        *,
        course_name: str,
        class_level: str,
        subject: str,
        exam_year: int,
        class_time: time,
        batch_type: str,
        course_fee: Decimal,
        enrollment_fee: Decimal,
        course_days: list[str],
        capacity: int,
        course_motto: str | None,
        note: str | None,
    ) -> Course:
        course.course_name = course_name
        course.class_level = class_level
        course.subject = subject
        course.exam_year = exam_year
        course.class_time = class_time
        course.batch_type = batch_type
        course.course_fee = course_fee
        course.enrollment_fee = enrollment_fee
        course.course_days = course_days
        course.capacity = capacity
        course.course_motto = course_motto
        course.note = note
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def delete(self, course: Course) -> None:
        await self.db.delete(course)
        await self.db.commit()
