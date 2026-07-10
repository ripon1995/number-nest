import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.courses.repository import CourseRepository
from app.exams.models import Exam
from app.exams.repository import ExamRepository
from app.exams.schemas import ExamCreate


class ExamService:
    """Business logic for scheduling/listing exams. Add/delete only - no
    edit-in-place; see .claude/rules/features/exam.md.
    """

    def __init__(
        self,
        repository: ExamRepository,
        course_repository: CourseRepository,
    ) -> None:
        self.repository = repository
        self.course_repository = course_repository

    async def create(self, payload: ExamCreate) -> Exam:
        if await self.course_repository.get_by_id(payload.course_id) is None:
            raise NotFoundException(f"Course {payload.course_id} not found")

        return await self.repository.create(
            course_id=payload.course_id,
            exam_datetime=payload.exam_datetime,
            description=payload.description,
            exam_mark=payload.exam_mark,
        )

    async def list_all(self, *, course_id: uuid.UUID | None = None) -> list[Exam]:
        return await self.repository.list_all(course_id=course_id)

    async def get_detail(self, exam_id: uuid.UUID) -> Exam:
        exam = await self.repository.get_by_id(exam_id)
        if exam is None:
            raise NotFoundException(f"Exam {exam_id} not found")
        return exam

    async def delete_exam(self, exam_id: uuid.UUID) -> None:
        exam = await self.repository.get_by_id(exam_id)
        if exam is None:
            raise NotFoundException(f"Exam {exam_id} not found")
        await self.repository.delete(exam)


def get_exam_service(db: AsyncSession = Depends(get_db)) -> ExamService:
    return ExamService(ExamRepository(db), CourseRepository(db))
