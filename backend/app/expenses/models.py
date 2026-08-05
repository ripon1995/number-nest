import enum
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ExpenseCategory(str, enum.Enum):
    HOUSE_RENT = "house_rent"
    ASSET = "asset"
    SALARY = "salary"
    ELECTRICITY = "electricity"
    INTERNET = "internet"
    OTHER = "other"


class AssetDirection(str, enum.Enum):
    PURCHASE = "purchase"
    SELL = "sell"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    DBBL_CREDIT_CARD = "dbbl_credit_card"
    EBL_CREDIT_CARD = "ebl_credit_card"
    UCB_CREDIT_CARD = "ucb_credit_card"


class Expense(Base):
    """An institutional cost record. See .claude/rules/features/expense-tracking.md.

    Add/edit/delete - category is fixed after creation (delete/re-add to change
    it). `month`/`staff_name`/`direction` are only meaningful for specific
    categories (enforced by ExpenseCreate/ExpenseUpdate's validator, not here) -
    `month` is unique within `house_rent` and `(staff_name, month)` is unique
    within `salary`, each via a partial unique index rather than a plain column
    constraint, since the same columns serve every category. `paid_to`/`paid_by`
    apply to every category and are nullable at the DB (required-ness enforced
    by Pydantic, matching the category-specific fields' approach) so existing
    rows created before these columns existed don't need a backfill.
    """

    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    payment_date: Mapped[date] = mapped_column(Date)
    paid_to: Mapped[str | None] = mapped_column(String, default=None)
    paid_by: Mapped[str | None] = mapped_column(String, default=None)
    month: Mapped[date | None] = mapped_column(Date, default=None)
    staff_name: Mapped[str | None] = mapped_column(String, default=None)
    direction: Mapped[str | None] = mapped_column(String, default=None)
    description: Mapped[str | None] = mapped_column(String, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
