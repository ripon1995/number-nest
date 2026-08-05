"""split utility into electricity and internet categories

Revision ID: e68207ebe0d0
Revises: f7e5966ac126
Create Date: 2026-08-05 20:13:20.965476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e68207ebe0d0'
down_revision: Union[str, Sequence[str], None] = 'f7e5966ac126'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # The `utility` category is replaced by two more specific categories,
    # `electricity` and `internet`. Existing utility rows in this DB are all
    # "Electric bill" entries, so they map unambiguously to `electricity`.
    op.execute("UPDATE expenses SET category = 'electricity' WHERE category = 'utility'")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("UPDATE expenses SET category = 'utility' WHERE category IN ('electricity', 'internet')")
