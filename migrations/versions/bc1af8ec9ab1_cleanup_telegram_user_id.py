"""normalize users user id field

Revision ID: bc1af8ec9ab1
Revises: a20260531
Create Date: 2026-05-31 12:00:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "bc1af8ec9ab1"
down_revision: Union[str, Sequence[str], None] = "a20260531"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    users_column_names = {str(column["name"]) for column in inspector.get_columns("users")}
    users_index_names = {str(index["name"]) for index in inspector.get_indexes("users")}

    with op.batch_alter_table("users") as batch_op:
        if "telegram_user_id" not in users_column_names:
            batch_op.add_column(
                sa.Column(
                    "telegram_user_id",
                    sa.String(length=64),
                    nullable=True,
                )
            )
            batch_op.create_index(
                op.f("ix_users_telegram_user_id"),
                ["telegram_user_id"],
                unique=True,
            )

        if "bale_user_id" in users_column_names and "telegram_user_id" in users_column_names:
            bind.execute(
                sa.text(
                    """
                    UPDATE users
                    SET telegram_user_id = bale_user_id
                    WHERE telegram_user_id IS NULL
                    """
                )
            )

        if "bale_user_id" in users_column_names:
            if "ix_users_bale_user_id" in users_index_names:
                batch_op.drop_index("ix_users_bale_user_id")
            batch_op.drop_column("bale_user_id")

        if (
            "telegram_user_id" in users_column_names
            and "ix_users_telegram_user_id" not in users_index_names
        ):
            batch_op.create_index(
                op.f("ix_users_telegram_user_id"),
                ["telegram_user_id"],
                unique=True,
            )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    users_column_names = {str(column["name"]) for column in inspector.get_columns("users")}
    users_index_names = {str(index["name"]) for index in inspector.get_indexes("users")}

    with op.batch_alter_table("users") as batch_op:
        if "bale_user_id" not in users_column_names:
            batch_op.add_column(
                sa.Column(
                    "bale_user_id",
                    sa.String(length=64),
                    nullable=True,
                )
            )
            batch_op.create_index(
                op.f("ix_users_bale_user_id"),
                ["bale_user_id"],
                unique=True,
            )

        if "telegram_user_id" in users_column_names and "bale_user_id" in users_column_names:
            bind.execute(
                sa.text(
                    """
                    UPDATE users
                    SET bale_user_id = telegram_user_id
                    WHERE bale_user_id IS NULL
                    """
                )
            )

        if "telegram_user_id" in users_column_names:
            if "ix_users_telegram_user_id" in users_index_names:
                batch_op.drop_index(op.f("ix_users_telegram_user_id"))
            batch_op.drop_column("telegram_user_id")
