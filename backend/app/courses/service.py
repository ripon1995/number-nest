import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ConflictException, NotFoundException
from app.courses.models import Course
from app.courses.naming import build_course_name
from app.courses.repository import CourseRepository
from app.courses.schemas import CourseCreate, CourseUpdate
from app.enrollments.repository import EnrollmentRepository
from app.students.models import Student


class CourseService:
    """Business logic for creating/managing courses."""

    def __init__(self, repository: CourseRepository, enrollment_repository: EnrollmentRepository) -> None:
        self.repository = repository
        self.enrollment_repository = enrollment_repository

    async def create(self, payload: CourseCreate) -> Course:
        course_name = build_course_name(
            payload.class_level, payload.subject, payload.exam_year, payload.class_time, payload.batch_type
        )
        if await self.repository.get_by_name(course_name) is not None:
            raise ConflictException(f"A course named '{course_name}' already exists")

        return await self.repository.create(
            course_name=course_name,
            class_level=payload.class_level.value,
            subject=payload.subject.value,
            exam_year=payload.exam_year,
            class_time=payload.class_time,
            batch_type=payload.batch_type.value,
            course_fee=payload.course_fee,
            enrollment_fee=payload.enrollment_fee,
            course_days=[day.value for day in payload.course_days],
            capacity=payload.capacity,
            course_motto=payload.course_motto,
            note=payload.note,
        )

    async def list_all(self) -> list[Course]:
        return await self.repository.list_all()

    async def get_by_id(self, course_id: uuid.UUID) -> Course:
        course = await self.repository.get_by_id(course_id)
        if course is None:
            raise NotFoundException(f"Course {course_id} not found")
        return course

    async def get_detail(self, course_id: uuid.UUID) -> tuple[Course, list[Student]]:
        course = await self.get_by_id(course_id)
        students = await self.enrollment_repository.list_students_for_course(course_id)
        return course, students

    async def update(self, course_id: uuid.UUID, payload: CourseUpdate) -> Course:
        course = await self.get_by_id(course_id)

        course_name = build_course_name(
            payload.class_level, payload.subject, payload.exam_year, payload.class_time, payload.batch_type
        )
        if course_name != course.course_name:
            existing = await self.repository.get_by_name(course_name)
            if existing is not None:
                raise ConflictException(f"A course named '{course_name}' already exists")

        return await self.repository.update(
            course,
            course_name=course_name,
            class_level=payload.class_level.value,
            subject=payload.subject.value,
            exam_year=payload.exam_year,
            class_time=payload.class_time,
            batch_type=payload.batch_type.value,
            course_fee=payload.course_fee,
            enrollment_fee=payload.enrollment_fee,
            course_days=[day.value for day in payload.course_days],
            capacity=payload.capacity,
            course_motto=payload.course_motto,
            note=payload.note,
        )

    async def delete(self, course_id: uuid.UUID) -> None:
        course = await self.get_by_id(course_id)
        await self.repository.delete(course)


def get_course_service(db: AsyncSession = Depends(get_db)) -> CourseService:
    return CourseService(CourseRepository(db), EnrollmentRepository(db))
