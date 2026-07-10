import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExamCreate(BaseModel):
    course_id: uuid.UUID
    exam_datetime: datetime
    description: str | None = None
    exam_mark: int = Field(gt=0)


class ExamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    exam_datetime: datetime
    description: str | None
    exam_mark: int
    created_at: datetime
