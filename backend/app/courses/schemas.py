import uuid
from datetime import time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.courses.models import CourseBatchType, CourseClass, CourseDay, CourseSubject
from app.students.schemas import StudentRead


class CourseBase(BaseModel):
    class_level: CourseClass
    subject: CourseSubject
    exam_year: int = Field(gt=0)
    class_time: time
    batch_type: CourseBatchType
    course_fee: Decimal = Field(ge=0)
    enrollment_fee: Decimal = Field(ge=0)
    course_days: list[CourseDay] = Field(min_length=1)
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
    course_name: str


class CourseDetailRead(CourseRead):
    students: list[StudentRead]
