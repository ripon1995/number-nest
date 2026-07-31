import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.expenses.models import AssetDirection, ExpenseCategory


class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    amount: Decimal = Field(ge=0)
    expense_date: date
    month: date | None = None
    staff_name: str | None = None
    direction: AssetDirection | None = None
    description: str | None = None

    @model_validator(mode="after")
    def validate_category_fields(self) -> Self:
        if self.category == ExpenseCategory.CONTRACT_FARE:
            if self.month is None:
                raise ValueError("month is required for a contract fare expense")
            if self.staff_name is not None or self.direction is not None:
                raise ValueError("staff_name/direction do not apply to a contract fare expense")
        elif self.category == ExpenseCategory.SALARY:
            if self.month is None or not self.staff_name:
                raise ValueError("month and staff_name are required for a salary expense")
            if self.direction is not None:
                raise ValueError("direction does not apply to a salary expense")
        elif self.category == ExpenseCategory.ASSET:
            if self.direction is None or not self.description:
                raise ValueError("direction and description are required for an asset expense")
            if self.month is not None or self.staff_name is not None:
                raise ValueError("month/staff_name do not apply to an asset expense")
        else:  # UTILITY, OTHER
            if not self.description:
                raise ValueError("description is required for this expense category")
            if self.month is not None or self.staff_name is not None or self.direction is not None:
                raise ValueError("month/staff_name/direction do not apply to this expense category")
        return self


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: ExpenseCategory
    amount: Decimal
    expense_date: date
    month: date | None
    staff_name: str | None
    direction: AssetDirection | None
    description: str | None
    created_at: datetime
