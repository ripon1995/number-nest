"""add courses table

Revision ID: e314c8ff9a87
Revises: ece597b6f2c9
Create Date: 2026-07-09 02:43:21.545320

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e314c8ff9a87'
down_revision: Union[str, Sequence[str], None] = 'ece597b6f2c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "courses",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("course_name", sa.String(), nullable=False),
        sa.Column("course_fee", sa.Numeric(10, 2), nullable=False),
        sa.Column("subject", sa.String(), nullable=False),
        sa.Column("course_days", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("course_motto", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("course_fee >= 0", name="ck_courses_course_fee_non_negative"),
        sa.CheckConstraint("capacity > 0", name="ck_courses_capacity_positive"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_courses_course_name"), "courses", ["course_name"], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_courses_course_name"), table_name="courses")
    op.drop_table("courses")
