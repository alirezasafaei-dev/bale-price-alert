from fastapi import APIRouter

from novax_price_alert.api.schemas.webhook import TelegramWebhookIn, TelegramWebhookOut
from novax_price_alert.application.services.webhook_service import WebhookService

router = APIRouter(prefix="/bot", tags=["webhook"])


@router.post("/webhook", response_model=TelegramWebhookOut)
async def telegram_webhook(payload: TelegramWebhookIn) -> TelegramWebhookOut:
    text = payload.message.text if payload.message else None
    user_id = (
        payload.message.from_user.id if payload.message and payload.message.from_user else "unknown"
    )

    service = WebhookService()
    handled, command = await service.handle(text, user_id)

    return TelegramWebhookOut(
        success=True,
        handled=handled,
        command=command,
    )
