import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.payments.models import Payment


class PaymentRepository:
    """Data access for the Payment model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, payment_id: uuid.UUID) -> Payment | None:
        return await self.db.get(Payment, payment_id)

    async def get_by_enrollment_and_month(
        self, enrollment_id: uuid.UUID, month: date
    ) -> Payment | None:
        return await self.db.scalar(
            select(Payment).where(
                Payment.enrollment_id == enrollment_id, Payment.month == month
            )
        )

    async def list_all(self, *, enrollment_id: uuid.UUID | None = None) -> list[Payment]:
        query = select(Payment).order_by(Payment.month.desc())
        if enrollment_id is not None:
            query = query.where(Payment.enrollment_id == enrollment_id)
        result = await self.db.scalars(query)
        return list(result.all())

    async def create(
        self,
        *,
        enrollment_id: uuid.UUID,
        month: date,
        payment_date: date,
        amount: Decimal,
    ) -> Payment:
        payment = Payment(
            enrollment_id=enrollment_id, month=month, payment_date=payment_date, amount=amount
        )
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return payment

    async def delete(self, payment: Payment) -> None:
        await self.db.delete(payment)
        await self.db.commit()
