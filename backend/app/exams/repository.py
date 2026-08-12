import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exams.models import Exam


class ExamRepository:
    """Data access for the Exam model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, exam_id: uuid.UUID) -> Exam | None:
        return await self.db.get(Exam, exam_id)

    async def list_all(self, *, course_id: uuid.UUID | None = None) -> list[Exam]:
        query = select(Exam).order_by(Exam.exam_datetime.desc())
        if course_id is not None:
            query = query.where(Exam.course_id == course_id)
        result = await self.db.scalars(query)
        return list(result.all())

    async def create(
        self,
        *,
        course_id: uuid.UUID,
        exam_datetime: datetime,
        description: str | None,
        cq_mark: int,
        mcq_mark: int,
    ) -> Exam:
        exam = Exam(
            course_id=course_id,
            exam_datetime=exam_datetime,
            description=description,
            cq_mark=cq_mark,
            mcq_mark=mcq_mark,
        )
        self.db.add(exam)
        await self.db.commit()
        await self.db.refresh(exam)
        return exam

    async def update(
        self,
        exam: Exam,
        *,
        exam_datetime: datetime,
        description: str | None,
        cq_mark: int,
        mcq_mark: int,
    ) -> Exam:
        exam.exam_datetime = exam_datetime
        exam.description = description
        exam.cq_mark = cq_mark
        exam.mcq_mark = mcq_mark
        await self.db.commit()
        await self.db.refresh(exam)
        return exam

    async def delete(self, exam: Exam) -> None:
        await self.db.delete(exam)
        await self.db.commit()
