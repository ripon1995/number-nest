"""add marks table

Revision ID: 61a58066bf4c
Revises: 91def83cccb7
Create Date: 2026-07-10 17:02:04.317319

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '61a58066bf4c'
down_revision: Union[str, Sequence[str], None] = '91def83cccb7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "marks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("enrollment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("exam_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mark", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["enrollment_id"], ["enrollments.id"], name="fk_marks_enrollment_id_enrollments", ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["exam_id"], ["exams.id"], name="fk_marks_exam_id_exams", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("enrollment_id", "exam_id", name="uq_marks_enrollment_exam"),
    )
    op.create_index(op.f("ix_marks_enrollment_id"), "marks", ["enrollment_id"], unique=False)
    op.create_index(op.f("ix_marks_exam_id"), "marks", ["exam_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_marks_exam_id"), table_name="marks")
    op.drop_index(op.f("ix_marks_enrollment_id"), table_name="marks")
    op.drop_table("marks")
