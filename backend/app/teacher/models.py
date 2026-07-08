from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Teacher(Base):
    """The single teacher account. See .claude/rules/features/teacher.md.

    No teachers table beyond the one account, no teacher-course assignment relation.
    """

    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    name: Mapped[str]
    hashed_password: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
