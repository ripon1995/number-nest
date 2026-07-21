"""add discontinued_at to enrollments

Revision ID: 2b1af0f9efe0
Revises: 2b4f820645ea
Create Date: 2026-07-21 11:29:33.952796

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b1af0f9efe0'
down_revision: Union[str, Sequence[str], None] = '2b4f820645ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("enrollments", sa.Column("discontinued_at", sa.Date(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("enrollments", "discontinued_at")
