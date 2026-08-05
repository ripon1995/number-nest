import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.expenses.models import AssetDirection, Expense, ExpenseCategory, PaymentMethod


class ExpenseRepository:
    """Data access for the Expense model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, expense_id: uuid.UUID) -> Expense | None:
        return await self.db.get(Expense, expense_id)

    async def get_house_rent_for_month(
        self, month: date, *, exclude_id: uuid.UUID | None = None
    ) -> Expense | None:
        query = select(Expense).where(
            Expense.category == ExpenseCategory.HOUSE_RENT.value,
            Expense.month == month,
        )
        if exclude_id is not None:
            query = query.where(Expense.id != exclude_id)
        return await self.db.scalar(query)

    async def get_salary_for_staff_month(
        self, staff_name: str, month: date, *, exclude_id: uuid.UUID | None = None
    ) -> Expense | None:
        query = select(Expense).where(
            Expense.category == ExpenseCategory.SALARY.value,
            Expense.staff_name == staff_name,
            Expense.month == month,
        )
        if exclude_id is not None:
            query = query.where(Expense.id != exclude_id)
        return await self.db.scalar(query)

    async def list_all(self, *, category: ExpenseCategory | None = None) -> list[Expense]:
        query = select(Expense).order_by(Expense.payment_date.desc())
        if category is not None:
            query = query.where(Expense.category == category.value)
        result = await self.db.scalars(query)
        return list(result.all())

    async def create(
        self,
        *,
        category: ExpenseCategory,
        amount: Decimal,
        payment_date: date,
        paid_to: str,
        paid_by: PaymentMethod,
        month: date | None,
        staff_name: str | None,
        direction: AssetDirection | None,
        description: str | None,
    ) -> Expense:
        expense = Expense(
            category=category.value,
            amount=amount,
            payment_date=payment_date,
            paid_to=paid_to,
            paid_by=paid_by.value,
            month=month,
            staff_name=staff_name,
            direction=direction.value if direction is not None else None,
            description=description,
        )
        self.db.add(expense)
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def update(
        self,
        expense: Expense,
        *,
        amount: Decimal,
        payment_date: date,
        paid_to: str,
        paid_by: PaymentMethod,
        month: date | None,
        staff_name: str | None,
        direction: AssetDirection | None,
        description: str | None,
    ) -> Expense:
        expense.amount = amount
        expense.payment_date = payment_date
        expense.paid_to = paid_to
        expense.paid_by = paid_by.value
        expense.month = month
        expense.staff_name = staff_name
        expense.direction = direction.value if direction is not None else None
        expense.description = description
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def delete(self, expense: Expense) -> None:
        await self.db.delete(expense)
        await self.db.commit()
