import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.expenses.models import AssetDirection, Expense, ExpenseCategory


class ExpenseRepository:
    """Data access for the Expense model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, expense_id: uuid.UUID) -> Expense | None:
        return await self.db.get(Expense, expense_id)

    async def get_contract_fare_for_month(self, month: date) -> Expense | None:
        return await self.db.scalar(
            select(Expense).where(
                Expense.category == ExpenseCategory.CONTRACT_FARE.value,
                Expense.month == month,
            )
        )

    async def get_salary_for_staff_month(
        self, staff_name: str, month: date
    ) -> Expense | None:
        return await self.db.scalar(
            select(Expense).where(
                Expense.category == ExpenseCategory.SALARY.value,
                Expense.staff_name == staff_name,
                Expense.month == month,
            )
        )

    async def list_all(self, *, category: ExpenseCategory | None = None) -> list[Expense]:
        query = select(Expense).order_by(Expense.expense_date.desc())
        if category is not None:
            query = query.where(Expense.category == category.value)
        result = await self.db.scalars(query)
        return list(result.all())

    async def create(
        self,
        *,
        category: ExpenseCategory,
        amount: Decimal,
        expense_date: date,
        month: date | None,
        staff_name: str | None,
        direction: AssetDirection | None,
        description: str | None,
    ) -> Expense:
        expense = Expense(
            category=category.value,
            amount=amount,
            expense_date=expense_date,
            month=month,
            staff_name=staff_name,
            direction=direction.value if direction is not None else None,
            description=description,
        )
        self.db.add(expense)
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def delete(self, expense: Expense) -> None:
        await self.db.delete(expense)
        await self.db.commit()
