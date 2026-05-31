from abc import ABC, abstractmethod
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class PricePoint(BaseModel):
    symbol: str
    price: Decimal
    observed_at: datetime
    fetched_at: datetime | None = None
    provider_slug: str | None = None
    unit: str = "IRT"
    source_quality: str = "primary"
    raw_data: dict[str, Any] | None = None


class BasePriceProvider(ABC):
    @property
    @abstractmethod
    def slug(self) -> str:
        """Unique identifier for the provider (e.g., 'binance', 'mock')."""
        pass

    @abstractmethod
    async def get_price(self, symbol: str) -> PricePoint:
        """Fetch current price for a given symbol."""
        pass

    async def get_prices(self, symbols: list[str]) -> dict[str, PricePoint]:
        prices: dict[str, PricePoint] = {}
        for symbol in symbols:
            price = await self.get_price(symbol)
            prices[symbol] = price
        return prices


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
