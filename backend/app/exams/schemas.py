import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExamCreate(BaseModel):
    course_id: uuid.UUID
    exam_datetime: datetime
    description: str | None = None
    cq_mark: int = Field(gt=0)
    mcq_mark: int = Field(gt=0)


class ExamUpdate(BaseModel):
    """No `course_id` - an exam's course is fixed after creation (delete/re-add

    to change it), since marks are recorded against the exam's course roster and
    reassigning the course after marks exist would leave old marks pointing at
    students who no longer show up on the mark sheet.
    """

    exam_datetime: datetime
    description: str | None = None
    cq_mark: int = Field(gt=0)
    mcq_mark: int = Field(gt=0)


class ExamRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    exam_datetime: datetime
    description: str | None
    cq_mark: int
    mcq_mark: int
    created_at: datetime
