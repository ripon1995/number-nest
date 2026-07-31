"""add expenses table

Revision ID: ae26a04ca04b
Revises: 84649460c1de
Create Date: 2026-07-31 16:45:40.787792

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'ae26a04ca04b'
down_revision: Union[str, Sequence[str], None] = '84649460c1de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "expenses",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("month", sa.Date(), nullable=True),
        sa.Column("staff_name", sa.String(), nullable=True),
        sa.Column("direction", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # Partial unique indexes: `month` unique only among contract_fare rows,
    # `(staff_name, month)` unique only among salary rows - a plain composite
    # unique constraint can't express "unique within one category" since
    # every other category leaves these columns unrelated to each other.
    op.create_index(
        "uq_expenses_contract_fare_month",
        "expenses",
        ["month"],
        unique=True,
        postgresql_where=sa.text("category = 'contract_fare'"),
    )
    op.create_index(
        "uq_expenses_salary_staff_month",
        "expenses",
        ["staff_name", "month"],
        unique=True,
        postgresql_where=sa.text("category = 'salary'"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("uq_expenses_salary_staff_month", table_name="expenses")
    op.drop_index("uq_expenses_contract_fare_month", table_name="expenses")
    op.drop_table("expenses")
