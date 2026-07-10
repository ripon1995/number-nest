import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enrollments.models import Enrollment
from app.marks.models import Mark


class MarkRepository:
    """Data access for the Mark model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, mark_id: uuid.UUID) -> Mark | None:
        return await self.db.get(Mark, mark_id)

    async def get_by_enrollment_and_exam(
        self, enrollment_id: uuid.UUID, exam_id: uuid.UUID
    ) -> Mark | None:
        return await self.db.scalar(
            select(Mark).where(
                Mark.enrollment_id == enrollment_id, Mark.exam_id == exam_id
            )
        )

    async def list_for_exam(self, exam_id: uuid.UUID) -> list[tuple[Mark, uuid.UUID]]:
        query = (
            select(Mark, Enrollment.student_id)
            .join(Enrollment, Enrollment.id == Mark.enrollment_id)
            .where(Mark.exam_id == exam_id)
            .order_by(Mark.created_at)
        )
        result = await self.db.execute(query)
        return [(row[0], row[1]) for row in result.all()]

    async def create(
        self, *, enrollment_id: uuid.UUID, exam_id: uuid.UUID, mark: int
    ) -> Mark:
        mark_row = Mark(enrollment_id=enrollment_id, exam_id=exam_id, mark=mark)
        self.db.add(mark_row)
        await self.db.commit()
        await self.db.refresh(mark_row)
        return mark_row

    async def update_mark(self, mark_row: Mark, mark: int) -> Mark:
        mark_row.mark = mark
        await self.db.commit()
        await self.db.refresh(mark_row)
        return mark_row

    async def delete(self, mark_row: Mark) -> None:
        await self.db.delete(mark_row)
        await self.db.commit()
