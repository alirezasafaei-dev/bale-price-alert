"""Backward-compatible application entry point.

Historically the app was imported from ``novax_price_alert.main`` and external
commands may still reference this path. Keep it delegating to the real API app.
"""

from novax_price_alert.api.main import app as _api_app

app = _api_app
