import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MarkEntry(BaseModel):
    student_id: uuid.UUID
    mark: int = Field(ge=0)


class MarkBulkCreate(BaseModel):
    exam_id: uuid.UUID
    entries: list[MarkEntry] = Field(min_length=1)


class MarkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    enrollment_id: uuid.UUID
    student_id: uuid.UUID
    exam_id: uuid.UUID
    mark: int
    created_at: datetime
