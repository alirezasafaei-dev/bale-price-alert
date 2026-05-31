from __future__ import annotations

import hashlib
import hmac
import json
from dataclasses import dataclass
from time import time
from urllib.parse import parse_qsl


class TelegramAuthError(ValueError):
    pass


@dataclass(frozen=True)
class TelegramUserData:
    telegram_user_id: str
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    language_code: str | None = None
    auth_date: int | None = None


def verify_telegram_init_data(
    init_data: str,
    *,
    bot_token: str,
    max_age_seconds: int,
    now: int | None = None,
) -> TelegramUserData:
    if not bot_token:
        raise TelegramAuthError("telegram bot token is not configured")

    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise TelegramAuthError("telegram initData hash is missing")

    data_check_string = "\n".join(f"{key}={parsed[key]}" for key in sorted(parsed))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    expected_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise TelegramAuthError("telegram initData hash is invalid")

    auth_date_raw = parsed.get("auth_date")
    if not auth_date_raw:
        raise TelegramAuthError("telegram initData auth_date is missing")

    auth_date = int(auth_date_raw)
    current_time = int(time()) if now is None else now
    if current_time - auth_date > max_age_seconds:
        raise TelegramAuthError("telegram initData is expired")

    user_raw = parsed.get("user")
    if not user_raw:
        raise TelegramAuthError("telegram initData user is missing")

    user = json.loads(user_raw)
    telegram_user_id = str(user.get("id") or "")
    if not telegram_user_id:
        raise TelegramAuthError("telegram user id is missing")

    return TelegramUserData(
        telegram_user_id=telegram_user_id,
        username=user.get("username"),
        first_name=user.get("first_name"),
        last_name=user.get("last_name"),
        language_code=user.get("language_code"),
        auth_date=auth_date,
    )
