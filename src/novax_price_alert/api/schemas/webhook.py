from pydantic import BaseModel


class TelegramWebhookUserOut(BaseModel):
    id: str
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None


class TelegramChatOut(BaseModel):
    id: str


class TelegramMessageOut(BaseModel):
    text: str | None = None
    from_user: TelegramWebhookUserOut | None = None
    chat: TelegramChatOut | None = None


class TelegramWebhookIn(BaseModel):
    message: TelegramMessageOut | None = None


class TelegramWebhookOut(BaseModel):
    success: bool = True
    handled: bool = False
    command: str | None = None
