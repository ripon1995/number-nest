import uuid
from datetime import date

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ConflictException, NotFoundException
from app.expenses.models import Expense, ExpenseCategory
from app.expenses.repository import ExpenseRepository
from app.expenses.schemas import ExpenseCreate, ExpenseUpdate


class ExpenseService:
    """Business logic for recording/listing institutional costs. Add/edit/delete -

    category is fixed after creation; see .claude/rules/features/expense-tracking.md.
    """

    def __init__(self, repository: ExpenseRepository) -> None:
        self.repository = repository

    async def _check_conflict(
        self,
        category: ExpenseCategory,
        month: date | None,
        staff_name: str | None,
        *,
        exclude_id: uuid.UUID | None = None,
    ) -> None:
        if category == ExpenseCategory.HOUSE_RENT:
            if await self.repository.get_house_rent_for_month(month, exclude_id=exclude_id) is not None:
                raise ConflictException(
                    "A house rent expense has already been recorded for this month"
                )
        elif category == ExpenseCategory.SALARY:
            if (
                await self.repository.get_salary_for_staff_month(
                    staff_name, month, exclude_id=exclude_id
                )
                is not None
            ):
                raise ConflictException(
                    "A salary expense has already been recorded for this staff member "
                    "for this month"
                )

    async def create(self, payload: ExpenseCreate) -> Expense:
        await self._check_conflict(payload.category, payload.month, payload.staff_name)

        return await self.repository.create(
            category=payload.category,
            amount=payload.amount,
            payment_date=payload.payment_date,
            paid_to=payload.paid_to,
            paid_by=payload.paid_by,
            month=payload.month,
            staff_name=payload.staff_name,
            direction=payload.direction,
            description=payload.description,
        )

    async def list_all(self, *, category: ExpenseCategory | None = None) -> list[Expense]:
        return await self.repository.list_all(category=category)

    async def get_by_id(self, expense_id: uuid.UUID) -> Expense:
        expense = await self.repository.get_by_id(expense_id)
        if expense is None:
            raise NotFoundException(f"Expense {expense_id} not found")
        return expense

    async def update(self, expense_id: uuid.UUID, payload: ExpenseUpdate) -> Expense:
        expense = await self.get_by_id(expense_id)
        if payload.category.value != expense.category:
            raise ConflictException("An expense's category cannot be changed after creation")

        await self._check_conflict(
            payload.category, payload.month, payload.staff_name, exclude_id=expense_id
        )

        return await self.repository.update(
            expense,
            amount=payload.amount,
            payment_date=payload.payment_date,
            paid_to=payload.paid_to,
            paid_by=payload.paid_by,
            month=payload.month,
            staff_name=payload.staff_name,
            direction=payload.direction,
            description=payload.description,
        )

    async def delete_expense(self, expense_id: uuid.UUID) -> None:
        expense = await self.get_by_id(expense_id)
        await self.repository.delete(expense)


def get_expense_service(db: AsyncSession = Depends(get_db)) -> ExpenseService:
    return ExpenseService(ExpenseRepository(db))
