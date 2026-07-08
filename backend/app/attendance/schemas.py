import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AttendanceEntry(BaseModel):
    student_id: uuid.UUID
    present: bool


class AttendanceBulkCreate(BaseModel):
    course_id: uuid.UUID
    session_date: date
    entries: list[AttendanceEntry] = Field(min_length=1)


class AttendanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    enrollment_id: uuid.UUID
    student_id: uuid.UUID
    session_date: date
    present: bool
    created_at: datetime
