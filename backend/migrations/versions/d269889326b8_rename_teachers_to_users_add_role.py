"""rename teachers to users add role

Revision ID: d269889326b8
Revises: e68207ebe0d0
Create Date: 2026-08-09 16:24:48.396926

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd269889326b8'
down_revision: Union[str, Sequence[str], None] = 'e68207ebe0d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema.

    Teacher becomes a generic User with a role (admin/student) - see
    .claude/rules/features/role-based-access.md. The one existing teacher row
    is backfilled to role='admin' via the column's server_default, then the
    default is dropped so every future row must declare a role explicitly.
    """
    op.rename_table("teachers", "users")
    op.execute("ALTER INDEX ix_teachers_email RENAME TO ix_users_email")

    op.alter_column("refresh_tokens", "teacher_id", new_column_name="user_id")
    op.execute(
        "ALTER TABLE refresh_tokens "
        "RENAME CONSTRAINT refresh_tokens_teacher_id_fkey TO refresh_tokens_user_id_fkey"
    )
    op.execute("ALTER INDEX ix_refresh_tokens_teacher_id RENAME TO ix_refresh_tokens_user_id")

    op.add_column("users", sa.Column("role", sa.String(), nullable=False, server_default="admin"))
    op.alter_column("users", "role", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "role")

    op.execute("ALTER INDEX ix_refresh_tokens_user_id RENAME TO ix_refresh_tokens_teacher_id")
    op.execute(
        "ALTER TABLE refresh_tokens "
        "RENAME CONSTRAINT refresh_tokens_user_id_fkey TO refresh_tokens_teacher_id_fkey"
    )
    op.alter_column("refresh_tokens", "user_id", new_column_name="teacher_id")

    op.execute("ALTER INDEX ix_users_email RENAME TO ix_teachers_email")
    op.rename_table("users", "teachers")
