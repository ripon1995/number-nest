import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Payment(Base):
    """A manual payment recorded against a student's course enrollment.

    See .claude/rules/features/payment-tracking.md. Manual/offline tracking only -
    no gateway. Add/delete only, one payment per (enrollment, month).
    """

    __tablename__ = "payments"
    __table_args__ = (
        UniqueConstraint("enrollment_id", "month", name="uq_payments_enrollment_month"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("enrollments.id", ondelete="CASCADE"), index=True
    )
    month: Mapped[date] = mapped_column(Date)
    payment_date: Mapped[date] = mapped_column(Date)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
