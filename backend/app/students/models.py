import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Student(Base):
    """A student record. See .claude/rules/features/students.md.

    Students have no login/portal - they are data managed by the teacher.
    """

    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str]
    college: Mapped[str | None] = mapped_column(String, default=None)
    contact: Mapped[str]
    email: Mapped[str | None] = mapped_column(String, default=None)
    whatsapp_number: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
