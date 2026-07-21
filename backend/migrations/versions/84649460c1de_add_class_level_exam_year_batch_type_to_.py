"""add class_level exam_year batch_type to courses

Revision ID: 84649460c1de
Revises: 2b1af0f9efe0
Create Date: 2026-07-21 13:20:18.685121

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '84649460c1de'
down_revision: Union[str, Sequence[str], None] = '2b1af0f9efe0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "courses",
        sa.Column("class_level", sa.String(), nullable=False, server_default="hsc"),
    )
    op.alter_column("courses", "class_level", server_default=None)

    op.add_column(
        "courses",
        sa.Column("exam_year", sa.Integer(), nullable=False, server_default="2026"),
    )
    op.alter_column("courses", "exam_year", server_default=None)

    op.add_column(
        "courses",
        sa.Column("batch_type", sa.String(), nullable=False, server_default="regular"),
    )
    op.alter_column("courses", "batch_type", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("courses", "batch_type")
    op.drop_column("courses", "exam_year")
    op.drop_column("courses", "class_level")
