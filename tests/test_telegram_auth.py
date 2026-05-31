import hashlib
import hmac
import json
from urllib.parse import urlencode

import pytest

from novax_price_alert.core.telegram_auth import TelegramAuthError, verify_telegram_init_data


def _signed_init_data(bot_token: str, payload: dict[str, str]) -> str:
    data_check_string = "\n".join(f"{key}={payload[key]}" for key in sorted(payload))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    digest = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return urlencode({**payload, "hash": digest})


def test_verify_telegram_init_data_accepts_valid_payload() -> None:
    bot_token = "123:test"
    init_data = _signed_init_data(
        bot_token,
        {
            "auth_date": "1000",
            "query_id": "query",
            "user": json.dumps({"id": 42, "username": "asdev", "first_name": "Ali"}),
        },
    )

    user = verify_telegram_init_data(
        init_data,
        bot_token=bot_token,
        max_age_seconds=100,
        now=1050,
    )

    assert user.telegram_user_id == "42"
    assert user.username == "asdev"


def test_verify_telegram_init_data_rejects_tampering() -> None:
    bot_token = "123:test"
    init_data = _signed_init_data(
        bot_token,
        {"auth_date": "1000", "user": json.dumps({"id": 42})},
    ).replace("42", "43")

    with pytest.raises(TelegramAuthError):
        verify_telegram_init_data(
            init_data,
            bot_token=bot_token,
            max_age_seconds=100,
            now=1050,
        )
