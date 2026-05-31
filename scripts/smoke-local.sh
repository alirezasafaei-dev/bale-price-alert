#!/usr/bin/env bash
set -euo pipefail

HOST="${SMOKE_HOST:-127.0.0.1}"
PORT="${SMOKE_PORT:-8765}"
BASE_URL="http://${HOST}:${PORT}"
UV_CACHE_DIR="${UV_CACHE_DIR:-/tmp/uv-cache}"
export UV_CACHE_DIR

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

uv run alembic upgrade head
uv run python -m novax_price_alert.scripts.seed_mvp
uv run python - <<'PY'
import asyncio
from novax_price_alert.workers.jobs.price_fetch_job import run_price_fetch_job

asyncio.run(run_price_fetch_job())
PY

uv run uvicorn novax_price_alert.api.main:app --host "${HOST}" --port "${PORT}" >/tmp/novax-price-alert-smoke.log 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 50); do
  if curl -fsS "${BASE_URL}/ready" >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

curl -fsS "${BASE_URL}/health" >/dev/null
LATEST_JSON="$(curl -fsS "${BASE_URL}/api/v1/prices/latest")"

LATEST_JSON="${LATEST_JSON}" python - <<'PY'
import json
import os

payload = json.loads(os.environ["LATEST_JSON"])
items = payload.get("items", [])
if len(items) < 4:
    raise SystemExit(f"expected at least 4 latest prices, got {len(items)}")
missing_provider = [item for item in items if not item.get("provider")]
if missing_provider:
    raise SystemExit("latest price item missing provider slug")
print(json.dumps({"status": "ok", "latest_price_count": len(items)}, ensure_ascii=False))
PY
