import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.expenses.models import Expense, ExpenseCategory
from app.expenses.schemas import ExpenseCreate, ExpenseRead
from app.expenses.service import ExpenseService, get_expense_service

router = APIRouter(
    prefix="/expenses", tags=["expenses"], dependencies=[Depends(get_current_teacher)]
)


@router.post("", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
async def create_expense(
        payload: ExpenseCreate,
        service: ExpenseService = Depends(get_expense_service)
) -> Expense:
    return await service.create(payload)


@router.get("", response_model=list[ExpenseRead])
async def list_expenses(
        category: ExpenseCategory | None = None,
        service: ExpenseService = Depends(get_expense_service)
) -> list[Expense]:
    return await service.list_all(category=category)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
        expense_id: uuid.UUID,
        service: ExpenseService = Depends(get_expense_service)
) -> None:
    await service.delete_expense(expense_id)
