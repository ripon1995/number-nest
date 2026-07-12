import uuid
from datetime import time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.courses.models import CourseDay, CourseSubject
from app.students.schemas import StudentRead


class CourseBase(BaseModel):
    course_name: str = Field(min_length=1)
    course_fee: Decimal = Field(ge=0)
    enrollment_fee: Decimal = Field(ge=0)
    subject: CourseSubject
    course_days: list[CourseDay] = Field(min_length=1)
    class_time: time
    capacity: int = Field(gt=0)
    course_motto: str | None = None
    note: str | None = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(CourseBase):
    pass


class CourseRead(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID


class CourseDetailRead(CourseRead):
    students: list[StudentRead]
