import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ConflictException, NotFoundException
from app.enrollments.repository import EnrollmentRepository
from app.payments.models import Payment
from app.payments.repository import PaymentRepository
from app.payments.schemas import PaymentCreate


class PaymentService:
    """Business logic for recording/listing manual payments. Add/delete only -
    no edit-in-place; see .claude/rules/features/payment-tracking.md.
    """

    def __init__(
        self,
        repository: PaymentRepository,
        enrollment_repository: EnrollmentRepository,
    ) -> None:
        self.repository = repository
        self.enrollment_repository = enrollment_repository

    async def record(self, payload: PaymentCreate) -> Payment:
        if await self.enrollment_repository.get_by_id(payload.enrollment_id) is None:
            raise NotFoundException(f"Enrollment {payload.enrollment_id} not found")
        if (
            await self.repository.get_by_enrollment_and_month(
                payload.enrollment_id, payload.month
            )
            is not None
        ):
            raise ConflictException(
                "A payment has already been recorded for this enrollment for this month"
            )

        return await self.repository.create(
            enrollment_id=payload.enrollment_id,
            month=payload.month,
            payment_date=payload.payment_date,
            amount=payload.amount,
        )

    async def list_all(self, *, enrollment_id: uuid.UUID | None = None) -> list[Payment]:
        return await self.repository.list_all(enrollment_id=enrollment_id)

    async def delete_payment(self, payment_id: uuid.UUID) -> None:
        payment = await self.repository.get_by_id(payment_id)
        if payment is None:
            raise NotFoundException(f"Payment {payment_id} not found")
        await self.repository.delete(payment)


def get_payment_service(db: AsyncSession = Depends(get_db)) -> PaymentService:
    return PaymentService(PaymentRepository(db), EnrollmentRepository(db))
