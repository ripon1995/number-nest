"""add enrollment fee and fee paid columns

Revision ID: ae4dc9b9e1a1
Revises: b191cf97145f
Create Date: 2026-07-09 04:36:04.073982

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ae4dc9b9e1a1'
down_revision: Union[str, Sequence[str], None] = 'b191cf97145f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "courses",
        sa.Column("enrollment_fee", sa.Numeric(10, 2), nullable=False, server_default="0"),
    )
    op.alter_column("courses", "enrollment_fee", server_default=None)
    op.create_check_constraint(
        "ck_courses_enrollment_fee_non_negative", "courses", "enrollment_fee >= 0"
    )

    op.add_column(
        "enrollments",
        sa.Column(
            "enrollment_fee_paid", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )
    op.alter_column("enrollments", "enrollment_fee_paid", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("enrollments", "enrollment_fee_paid")
    op.drop_constraint("ck_courses_enrollment_fee_non_negative", "courses", type_="check")
    op.drop_column("courses", "enrollment_fee")
