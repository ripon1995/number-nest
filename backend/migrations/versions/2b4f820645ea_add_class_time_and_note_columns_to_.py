"""add class_time and note columns to courses

Revision ID: 2b4f820645ea
Revises: 61a58066bf4c
Create Date: 2026-07-12 22:02:53.395890

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b4f820645ea'
down_revision: Union[str, Sequence[str], None] = '61a58066bf4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "courses",
        sa.Column("class_time", sa.Time(), nullable=False, server_default="00:00:00"),
    )
    op.alter_column("courses", "class_time", server_default=None)

    op.add_column("courses", sa.Column("note", sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("courses", "note")
    op.drop_column("courses", "class_time")
