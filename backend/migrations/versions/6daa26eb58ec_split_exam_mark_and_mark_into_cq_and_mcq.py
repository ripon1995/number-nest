"""split exam mark and mark into cq and mcq

Revision ID: 6daa26eb58ec
Revises: d269889326b8
Create Date: 2026-08-12 20:11:52.194566

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6daa26eb58ec'
down_revision: Union[str, Sequence[str], None] = 'd269889326b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # exams.exam_mark (the exam's total mark) becomes cq_mark (the pre-existing
    # total, preserved as-is) plus a new mcq_mark, backfilled to 0 then tightened
    # to NOT NULL with no default - same "backfill then tighten" pattern used
    # elsewhere in this project.
    op.alter_column("exams", "exam_mark", new_column_name="cq_mark")
    op.add_column(
        "exams", sa.Column("mcq_mark", sa.Integer(), nullable=False, server_default="0")
    )
    op.alter_column("exams", "mcq_mark", server_default=None)

    # marks.mark (a student's obtained mark) becomes cq plus a new mcq, same
    # backfill-then-tighten treatment.
    op.alter_column("marks", "mark", new_column_name="cq")
    op.add_column("marks", sa.Column("mcq", sa.Integer(), nullable=False, server_default="0"))
    op.alter_column("marks", "mcq", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("marks", "mcq")
    op.alter_column("marks", "cq", new_column_name="mark")

    op.drop_column("exams", "mcq_mark")
    op.alter_column("exams", "cq_mark", new_column_name="exam_mark")
