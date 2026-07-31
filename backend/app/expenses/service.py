import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ConflictException, NotFoundException
from app.expenses.models import Expense, ExpenseCategory
from app.expenses.repository import ExpenseRepository
from app.expenses.schemas import ExpenseCreate


class ExpenseService:
    """Business logic for recording/listing institutional costs. Add/delete only -
    no edit-in-place; see .claude/rules/features/expense-tracking.md.
    """

    def __init__(self, repository: ExpenseRepository) -> None:
        self.repository = repository

    async def create(self, payload: ExpenseCreate) -> Expense:
        if payload.category == ExpenseCategory.CONTRACT_FARE:
            if await self.repository.get_contract_fare_for_month(payload.month) is not None:
                raise ConflictException(
                    "A contract fare expense has already been recorded for this month"
                )
        elif payload.category == ExpenseCategory.SALARY:
            if (
                await self.repository.get_salary_for_staff_month(
                    payload.staff_name, payload.month
                )
                is not None
            ):
                raise ConflictException(
                    "A salary expense has already been recorded for this staff member "
                    "for this month"
                )

        return await self.repository.create(
            category=payload.category,
            amount=payload.amount,
            expense_date=payload.expense_date,
            month=payload.month,
            staff_name=payload.staff_name,
            direction=payload.direction,
            description=payload.description,
        )

    async def list_all(self, *, category: ExpenseCategory | None = None) -> list[Expense]:
        return await self.repository.list_all(category=category)

    async def delete_expense(self, expense_id: uuid.UUID) -> None:
        expense = await self.repository.get_by_id(expense_id)
        if expense is None:
            raise NotFoundException(f"Expense {expense_id} not found")
        await self.repository.delete(expense)


def get_expense_service(db: AsyncSession = Depends(get_db)) -> ExpenseService:
    return ExpenseService(ExpenseRepository(db))
