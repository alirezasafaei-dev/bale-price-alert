from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class AlertCondition(str, Enum):
    ABOVE = "above"
    BELOW = "below"


class AlertCreateIn(BaseModel):
    asset_code: str
    condition_type: AlertCondition
    target_price: Decimal = Field(gt=0)
    cooldown_minutes: int = Field(default=60, ge=0)


class AlertUpdateIn(BaseModel):
    target_price: Decimal | None = Field(default=None, gt=0)
    cooldown_minutes: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    asset_id: str
    condition_type: AlertCondition
    target_price: Decimal
    is_active: bool
    cooldown_minutes: int
    last_triggered_at: datetime | None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class AlertListOut(BaseModel):
    items: list[AlertOut]


class DeleteAlertOut(BaseModel):
    success: bool = True
