import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Mark(Base):
    """A student's obtained mark for one exam.

    See .claude/rules/features/mark.md. Hangs off enrollment_id (not student_id
    directly, matching payments/attendance), one record per (enrollment, exam).
    """

    __tablename__ = "marks"
    __table_args__ = (
        UniqueConstraint("enrollment_id", "exam_id", name="uq_marks_enrollment_exam"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("enrollments.id", ondelete="CASCADE"), index=True
    )
    exam_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("exams.id", ondelete="CASCADE"), index=True
    )
    mark: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
