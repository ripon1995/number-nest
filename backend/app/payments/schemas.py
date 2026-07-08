import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    enrollment_id: uuid.UUID
    month: date
    payment_date: date
    amount: Decimal = Field(ge=0)


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    enrollment_id: uuid.UUID
    month: date
    payment_date: date
    amount: Decimal
    created_at: datetime
