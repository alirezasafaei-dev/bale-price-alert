from collections.abc import Sequence
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from novax_price_alert.domain.alert_rule import AlertRule


class AlertCRUDService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_alerts(self, user_id: str) -> Sequence[AlertRule]:
        stmt = select(AlertRule).where(AlertRule.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, alert: AlertRule) -> AlertRule:
        self.session.add(alert)
        await self.session.commit()
        await self.session.refresh(alert)
        return alert

    async def get_for_user(self, alert_id: str, user_id: str) -> AlertRule | None:
        stmt = select(AlertRule).where(AlertRule.id == alert_id, AlertRule.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(
        self,
        alert_id: str,
        user_id: str,
        *,
        target_price: Decimal | None = None,
        cooldown_minutes: int | None = None,
        is_active: bool | None = None,
    ) -> AlertRule | None:
        alert = await self.get_for_user(alert_id, user_id)

        if alert is None:
            return None

        if target_price is not None:
            alert.target_price = target_price
        if cooldown_minutes is not None:
            alert.cooldown_minutes = cooldown_minutes
        if is_active is not None:
            alert.is_active = is_active
        await self.session.commit()
        await self.session.refresh(alert)
        return alert

    async def deactivate(self, alert_id: str, user_id: str) -> AlertRule | None:
        return await self.update(alert_id, user_id, is_active=False)
