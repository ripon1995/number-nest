"""add exams and notices tables

Revision ID: 91def83cccb7
Revises: ae4dc9b9e1a1
Create Date: 2026-07-10 16:44:48.224949

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '91def83cccb7'
down_revision: Union[str, Sequence[str], None] = 'ae4dc9b9e1a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "exams",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("exam_datetime", sa.DateTime(timezone=False), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("exam_mark", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["course_id"], ["courses.id"], name="fk_exams_course_id_courses", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_exams_course_id"), "exams", ["course_id"], unique=False)

    op.create_table(
        "notices",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_name", sa.String(), nullable=False),
        sa.Column("event_place", sa.String(), nullable=False),
        sa.Column("event_datetime", sa.DateTime(timezone=False), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["course_id"], ["courses.id"], name="fk_notices_course_id_courses", ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notices_course_id"), "notices", ["course_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_notices_course_id"), table_name="notices")
    op.drop_table("notices")
    op.drop_index(op.f("ix_exams_course_id"), table_name="exams")
    op.drop_table("exams")
