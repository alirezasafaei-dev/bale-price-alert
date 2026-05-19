from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bale_price_alert.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PriceSnapshot(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "price_snapshots"

    asset_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("assets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    provider_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("providers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(18, 8),
        nullable=False,
    )

    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    raw_data: Mapped[dict[str, str] | None] = mapped_column(JSON, nullable=True)

    asset = relationship("Asset")
    provider = relationship("Provider")
