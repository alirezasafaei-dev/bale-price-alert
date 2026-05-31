"""iran market twa schema

Revision ID: a20260531
Revises: 6525325933c2
Create Date: 2026-05-31 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a20260531"
down_revision: Union[str, Sequence[str], None] = "6525325933c2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("telegram_user_id", sa.String(length=64), nullable=True))
    op.add_column("users", sa.Column("first_name", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("last_name", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("language_code", sa.String(length=16), nullable=True))
    op.create_index(op.f("ix_users_telegram_user_id"), "users", ["telegram_user_id"], unique=True)

    op.add_column("assets", sa.Column("display_name", sa.String(length=100), nullable=True))
    op.add_column(
        "assets",
        sa.Column("category", sa.String(length=32), nullable=False, server_default="currency"),
    )
    op.add_column(
        "assets",
        sa.Column("unit", sa.String(length=16), nullable=False, server_default="IRT"),
    )
    op.add_column(
        "assets",
        sa.Column("priority", sa.Integer(), nullable=False, server_default="100"),
    )
    op.add_column(
        "assets",
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    op.add_column("latest_prices", sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("latest_prices", sa.Column("stale_after", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "latest_prices",
        sa.Column("is_stale", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("latest_prices", sa.Column("raw_data", sa.JSON(), nullable=True))

    op.add_column("alert_events", sa.Column("telegram_message_id", sa.String(length=100), nullable=True))
    if op.get_bind().dialect.name == "sqlite":
        op.create_index(
            "uq_alert_event_rule_triggered_at",
            "alert_events",
            ["alert_rule_id", "triggered_at"],
            unique=True,
        )
    else:
        op.create_unique_constraint(
            "uq_alert_event_rule_triggered_at",
            "alert_events",
            ["alert_rule_id", "triggered_at"],
        )
    op.create_index(
        "ix_alert_events_status_created",
        "alert_events",
        ["status", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_alert_rules_match",
        "alert_rules",
        ["asset_id", "is_active", "condition_type", "target_price"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_alert_rules_match", table_name="alert_rules")
    op.drop_index("ix_alert_events_status_created", table_name="alert_events")
    if op.get_bind().dialect.name == "sqlite":
        op.drop_index("uq_alert_event_rule_triggered_at", table_name="alert_events")
    else:
        op.drop_constraint("uq_alert_event_rule_triggered_at", "alert_events", type_="unique")
    op.drop_column("alert_events", "telegram_message_id")

    op.drop_column("latest_prices", "raw_data")
    op.drop_column("latest_prices", "is_stale")
    op.drop_column("latest_prices", "stale_after")
    op.drop_column("latest_prices", "fetched_at")

    op.drop_column("assets", "enabled")
    op.drop_column("assets", "priority")
    op.drop_column("assets", "unit")
    op.drop_column("assets", "category")
    op.drop_column("assets", "display_name")

    op.drop_index(op.f("ix_users_telegram_user_id"), table_name="users")
    op.drop_column("users", "language_code")
    op.drop_column("users", "last_name")
    op.drop_column("users", "first_name")
    op.drop_column("users", "telegram_user_id")
