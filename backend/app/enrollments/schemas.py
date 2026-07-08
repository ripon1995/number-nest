import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class EnrollmentCreate(BaseModel):
    student_id: uuid.UUID
    course_id: uuid.UUID
    start_from: date


class EnrollmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    course_id: uuid.UUID
    start_from: date
    created_at: datetime
