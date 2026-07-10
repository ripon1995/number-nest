import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoticeCreate(BaseModel):
    course_id: uuid.UUID
    event_name: str = Field(min_length=1)
    event_place: str = Field(min_length=1)
    event_datetime: datetime


class NoticeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    event_name: str
    event_place: str
    event_datetime: datetime
    created_at: datetime
