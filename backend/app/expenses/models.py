import enum
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ExpenseCategory(str, enum.Enum):
    CONTRACT_FARE = "contract_fare"
    ASSET = "asset"
    SALARY = "salary"
    UTILITY = "utility"
    OTHER = "other"


class AssetDirection(str, enum.Enum):
    PURCHASE = "purchase"
    SELL = "sell"


class Expense(Base):
    """An institutional cost record. See .claude/rules/features/expense-tracking.md.

    Add/delete only. `month`/`staff_name`/`direction` are only meaningful for
    specific categories (enforced by ExpenseCreate's validator, not here) -
    `month` is unique within `contract_fare` and `(staff_name, month)` is
    unique within `salary`, each via a partial unique index rather than a
    plain column constraint, since the same columns serve every category.
    """

    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    expense_date: Mapped[date] = mapped_column(Date)
    month: Mapped[date | None] = mapped_column(Date, default=None)
    staff_name: Mapped[str | None] = mapped_column(String, default=None)
    direction: Mapped[str | None] = mapped_column(String, default=None)
    description: Mapped[str | None] = mapped_column(String, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
