import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.payments.models import Payment
from app.payments.schemas import PaymentCreate, PaymentRead
from app.payments.service import PaymentService, get_payment_service

router = APIRouter(
    prefix="/payments", tags=["payments"], dependencies=[Depends(get_current_teacher)]
)


@router.post("", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
async def create_payment(
        payload: PaymentCreate,
        service: PaymentService = Depends(get_payment_service)
) -> Payment:
    return await service.record(payload)


@router.get("", response_model=list[PaymentRead])
async def list_payments(
        enrollment_id: uuid.UUID | None = None,
        service: PaymentService = Depends(get_payment_service)
) -> list[Payment]:
    return await service.list_all(enrollment_id=enrollment_id)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(
        payment_id: uuid.UUID,
        service: PaymentService = Depends(get_payment_service)
) -> None:
    await service.delete_payment(payment_id)
