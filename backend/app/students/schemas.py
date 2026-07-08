import uuid

from pydantic import BaseModel, ConfigDict, Field


class StudentBase(BaseModel):
    name: str = Field(min_length=1)
    college: str | None = None
    contact: str = Field(min_length=1)
    email: str | None = None
    whatsapp_number: str = Field(min_length=1)


class StudentCreate(StudentBase):
    pass


class StudentUpdate(StudentBase):
    pass


class StudentRead(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
