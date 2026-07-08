import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ConflictException, NotFoundException
from app.courses.repository import CourseRepository
from app.enrollments.models import Enrollment
from app.enrollments.repository import EnrollmentRepository
from app.enrollments.schemas import EnrollmentCreate
from app.students.repository import StudentRepository


class EnrollmentService:
    """Business logic for enrolling/unenrolling students. Add/delete only -
    no edit-in-place; see .claude/rules/features/enrollment.md.
    """

    def __init__(
        self,
        repository: EnrollmentRepository,
        student_repository: StudentRepository,
        course_repository: CourseRepository,
    ) -> None:
        self.repository = repository
        self.student_repository = student_repository
        self.course_repository = course_repository

    async def enroll(self, payload: EnrollmentCreate) -> Enrollment:
        if await self.student_repository.get_by_id(payload.student_id) is None:
            raise NotFoundException(f"Student {payload.student_id} not found")
        if await self.course_repository.get_by_id(payload.course_id) is None:
            raise NotFoundException(f"Course {payload.course_id} not found")
        if (
            await self.repository.get_by_student_and_course(
                payload.student_id, payload.course_id
            )
            is not None
        ):
            raise ConflictException("This student is already enrolled in this course")

        return await self.repository.create(
            student_id=payload.student_id,
            course_id=payload.course_id,
            start_from=payload.start_from,
            enrollment_fee_paid=payload.enrollment_fee_paid,
        )

    async def set_fee_paid(self, enrollment_id: uuid.UUID, enrollment_fee_paid: bool) -> Enrollment:
        enrollment = await self.repository.get_by_id(enrollment_id)
        if enrollment is None:
            raise NotFoundException(f"Enrollment {enrollment_id} not found")
        return await self.repository.update_fee_paid(
            enrollment, enrollment_fee_paid=enrollment_fee_paid
        )

    async def list_all(
        self, *, student_id: uuid.UUID | None = None, course_id: uuid.UUID | None = None
    ) -> list[Enrollment]:
        return await self.repository.list_all(student_id=student_id, course_id=course_id)

    async def unenroll(self, enrollment_id: uuid.UUID) -> None:
        enrollment = await self.repository.get_by_id(enrollment_id)
        if enrollment is None:
            raise NotFoundException(f"Enrollment {enrollment_id} not found")
        await self.repository.delete(enrollment)


def get_enrollment_service(db: AsyncSession = Depends(get_db)) -> EnrollmentService:
    return EnrollmentService(
        EnrollmentRepository(db), StudentRepository(db), CourseRepository(db)
    )
