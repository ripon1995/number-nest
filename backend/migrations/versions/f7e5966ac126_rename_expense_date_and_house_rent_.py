"""rename expense date and house rent category, add paid_to paid_by

Revision ID: f7e5966ac126
Revises: ae26a04ca04b
Create Date: 2026-08-05 19:49:34.491226

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7e5966ac126'
down_revision: Union[str, Sequence[str], None] = 'ae26a04ca04b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("expenses", "expense_date", new_column_name="payment_date")
    op.add_column("expenses", sa.Column("paid_to", sa.String(), nullable=True))
    op.add_column("expenses", sa.Column("paid_by", sa.String(), nullable=True))

    op.execute("UPDATE expenses SET category = 'house_rent' WHERE category = 'contract_fare'")

    op.drop_index("uq_expenses_contract_fare_month", table_name="expenses")
    op.create_index(
        "uq_expenses_house_rent_month",
        "expenses",
        ["month"],
        unique=True,
        postgresql_where=sa.text("category = 'house_rent'"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("uq_expenses_house_rent_month", table_name="expenses")
    op.create_index(
        "uq_expenses_contract_fare_month",
        "expenses",
        ["month"],
        unique=True,
        postgresql_where=sa.text("category = 'contract_fare'"),
    )

    op.execute("UPDATE expenses SET category = 'contract_fare' WHERE category = 'house_rent'")

    op.drop_column("expenses", "paid_by")
    op.drop_column("expenses", "paid_to")
    op.alter_column("expenses", "payment_date", new_column_name="expense_date")
