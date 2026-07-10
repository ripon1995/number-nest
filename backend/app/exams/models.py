import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Exam(Base):
    """An exam scheduled for a course. See .claude/rules/features/exam.md.

    Add/delete only, no edit-in-place - matching every other feature besides courses.
    """

    __tablename__ = "exams"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    exam_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=False))
    description: Mapped[str | None] = mapped_column(String, default=None)
    exam_mark: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
