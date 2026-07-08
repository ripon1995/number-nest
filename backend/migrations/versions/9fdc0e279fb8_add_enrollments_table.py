"""add enrollments table

Revision ID: 9fdc0e279fb8
Revises: 176fb9a51e5f
Create Date: 2026-07-09 03:29:33.204586

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '9fdc0e279fb8'
down_revision: Union[str, Sequence[str], None] = '176fb9a51e5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "enrollments",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("start_from", sa.Date(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["student_id"], ["students.id"], name="fk_enrollments_student_id_students", ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["course_id"], ["courses.id"], name="fk_enrollments_course_id_courses", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", "course_id", name="uq_enrollments_student_course"),
    )
    op.create_index(
        op.f("ix_enrollments_student_id"), "enrollments", ["student_id"], unique=False
    )
    op.create_index(
        op.f("ix_enrollments_course_id"), "enrollments", ["course_id"], unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_enrollments_course_id"), table_name="enrollments")
    op.drop_index(op.f("ix_enrollments_student_id"), table_name="enrollments")
    op.drop_table("enrollments")
