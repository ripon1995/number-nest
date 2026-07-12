import enum
import uuid
from datetime import datetime, time
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String, Time, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CourseSubject(str, enum.Enum):
    MATH = "math"
    ICT = "ict"


class CourseDay(str, enum.Enum):
    MON = "mon"
    TUE = "tue"
    WED = "wed"
    THU = "thu"
    FRI = "fri"
    SAT = "sat"
    SUN = "sun"


class Course(Base):
    """A course the teacher runs. See .claude/rules/features/course.md."""

    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    course_name: Mapped[str] = mapped_column(unique=True, index=True)
    course_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    enrollment_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    subject: Mapped[str] = mapped_column(String)
    course_days: Mapped[list[str]] = mapped_column(ARRAY(String))
    class_time: Mapped[time] = mapped_column(Time)
    capacity: Mapped[int]
    course_motto: Mapped[str | None] = mapped_column(String, default=None)
    note: Mapped[str | None] = mapped_column(String, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
