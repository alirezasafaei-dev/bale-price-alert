# Telegram Relay Worker

Use this Cloudflare Worker when the app/worker VPS cannot reliably reach Telegram.

Required Worker secrets:

- `TELEGRAM_BOT_TOKEN`
- `RELAY_SECRET`

Backend env:

- `TELEGRAM_RELAY_URL=https://<worker-domain>`
- `TELEGRAM_RELAY_SECRET=<same relay secret>`

Endpoints:

- `GET /health`
- `POST /send`
