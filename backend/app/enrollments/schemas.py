import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class EnrollmentCreate(BaseModel):
    student_id: uuid.UUID
    course_id: uuid.UUID
    start_from: date
    enrollment_fee_paid: bool = False


class EnrollmentFeeUpdate(BaseModel):
    enrollment_fee_paid: bool


class EnrollmentDiscontinueUpdate(BaseModel):
    discontinued_at: date | None


class EnrollmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    course_id: uuid.UUID
    start_from: date
    enrollment_fee_paid: bool
    discontinued_at: date | None
    created_at: datetime
