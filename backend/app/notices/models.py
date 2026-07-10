import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Notice(Base):
    """An event/notice announced for a course. See .claude/rules/features/notice.md.

    Add/delete only, no edit-in-place - matching every other feature besides courses.
    """

    __tablename__ = "notices"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    event_name: Mapped[str] = mapped_column(String)
    event_place: Mapped[str] = mapped_column(String)
    event_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=False))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
