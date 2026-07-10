import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.enrollments.repository import EnrollmentRepository
from app.exams.repository import ExamRepository
from app.marks.repository import MarkRepository
from app.marks.schemas import MarkBulkCreate, MarkRead


class MarkService:
    """Business logic for recording/listing exam marks.

    See .claude/rules/features/mark.md. Marks are submitted a full exam's mark
    sheet at a time; re-submitting for an exam that already has records upserts
    them rather than conflicting, since revisiting an exam to correct a mark is
    the expected flow (mirrors AttendanceService.record_bulk).
    """

    def __init__(
        self,
        repository: MarkRepository,
        enrollment_repository: EnrollmentRepository,
        exam_repository: ExamRepository,
    ) -> None:
        self.repository = repository
        self.enrollment_repository = enrollment_repository
        self.exam_repository = exam_repository

    async def record_bulk(self, payload: MarkBulkCreate) -> list[MarkRead]:
        exam = await self.exam_repository.get_by_id(payload.exam_id)
        if exam is None:
            raise NotFoundException(f"Exam {payload.exam_id} not found")

        results: list[MarkRead] = []
        for entry in payload.entries:
            enrollment = await self.enrollment_repository.get_by_student_and_course(
                entry.student_id, exam.course_id
            )
            if enrollment is None:
                raise NotFoundException(
                    f"Student {entry.student_id} is not enrolled in this course"
                )

            existing = await self.repository.get_by_enrollment_and_exam(
                enrollment.id, payload.exam_id
            )
            if existing is not None:
                mark_row = await self.repository.update_mark(existing, entry.mark)
            else:
                mark_row = await self.repository.create(
                    enrollment_id=enrollment.id, exam_id=payload.exam_id, mark=entry.mark
                )

            results.append(
                MarkRead(
                    id=mark_row.id,
                    enrollment_id=mark_row.enrollment_id,
                    student_id=entry.student_id,
                    exam_id=mark_row.exam_id,
                    mark=mark_row.mark,
                    created_at=mark_row.created_at,
                )
            )
        return results

    async def list_for_exam(self, exam_id: uuid.UUID) -> list[MarkRead]:
        if await self.exam_repository.get_by_id(exam_id) is None:
            raise NotFoundException(f"Exam {exam_id} not found")

        rows = await self.repository.list_for_exam(exam_id)
        return [
            MarkRead(
                id=mark_row.id,
                enrollment_id=mark_row.enrollment_id,
                student_id=student_id,
                exam_id=mark_row.exam_id,
                mark=mark_row.mark,
                created_at=mark_row.created_at,
            )
            for mark_row, student_id in rows
        ]

    async def delete_mark(self, mark_id: uuid.UUID) -> None:
        mark_row = await self.repository.get_by_id(mark_id)
        if mark_row is None:
            raise NotFoundException(f"Mark {mark_id} not found")
        await self.repository.delete(mark_row)


def get_mark_service(db: AsyncSession = Depends(get_db)) -> MarkService:
    return MarkService(MarkRepository(db), EnrollmentRepository(db), ExamRepository(db))
