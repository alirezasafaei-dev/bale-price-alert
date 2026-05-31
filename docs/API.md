# API

## Overview

All public business endpoints are versioned under:

```text
/api/v1

This document covers the intended MVP API.

---

## Health

### GET /health

#### Purpose
Basic liveness check.

#### Request
http
GET /health

#### Response Example
json
{
  "status": "ok"
}

#### Notes
Should not require database or Redis dependency checks.

---

## Readiness

### GET /ready

#### Purpose
Dependency readiness check.

#### Request
http
GET /ready

#### Response Example
json
{
  "status": "ready",
  "database": "ok",
  "redis": "ok"
}

#### Failure Example
json
{
  "status": "not_ready",
  "database": "ok",
  "redis": "error"
}

#### Notes
Should reflect actual dependency availability.

---

## Prices

### GET /api/v1/prices/latest

#### Purpose
Return latest known prices.

#### Query Params
- `asset_code` (optional)

#### Request Example
http
GET /api/v1/prices/latest

#### Request Example with Filter
http
GET /api/v1/prices/latest?asset_code=USDT

#### Response Example
json
{
  "items": [
    {
      "asset_code": "USDT",
      "asset_name": "Tether",
      "price_value": "652000",
      "currency_code": "IRT",
      "provider": "mock",
      "fetched_at": "2026-05-18T10:00:00Z"
    },
    {
      "asset_code": "BTC",
      "asset_name": "Bitcoin",
      "price_value": "4200000000",
      "currency_code": "IRT",
      "provider": "mock",
      "fetched_at": "2026-05-18T10:00:00Z"
    }
  ]
}

#### Notes
- returns latest known values, not guaranteed real-time market prices
- if `asset_code` is provided, return only the matching asset when available

---

## Users

### GET /api/v1/users/{bale_user_id}

#### Purpose
Fetch a user by Bale user id for debug/admin MVP usage.

#### Request Example
http
GET /api/v1/users/123456789

#### Response Example
json
{
  "id": 12,
  "bale_user_id": "123456789",
  "username": "ali_dev",
  "first_name": "Ali",
  "last_name": "Safaei",
  "is_active": true,
  "created_at": "2026-05-18T10:00:00Z",
  "updated_at": "2026-05-18T10:00:00Z"
}

#### Error Cases
- `404` if user not found

---

## Alerts

### POST /api/v1/alerts

#### Purpose
Create a new alert rule.

#### Request Example
json
{
  "bale_user_id": "123456789",
  "asset_code": "USDT",
  "condition_type": "above",
  "target_price": "700000",
  "cooldown_minutes": 60
}

#### Response Example
json
{
  "id": 21,
  "user_id": 12,
  "asset_code": "USDT",
  "condition_type": "above",
  "target_price": "700000",
  "is_active": true,
  "cooldown_minutes": 60,
  "last_triggered_at": null,
  "created_at": "2026-05-18T10:00:00Z",
  "updated_at": "2026-05-18T10:00:00Z"
}

#### Error Cases
- `400` invalid request
- `404` unknown user or asset
- `422` schema validation failure

---

### GET /api/v1/alerts?bale_user_id=...

#### Purpose
List alerts for a user.

#### Request Example
http
GET /api/v1/alerts?bale_user_id=123456789

#### Response Example
json
{
  "items": [
    {
      "id": 21,
      "asset_code": "USDT",
      "condition_type": "above",
      "target_price": "700000",
      "is_active": true,
      "cooldown_minutes": 60,
      "last_triggered_at": null
    }
  ]
}

#### Notes
`bale_user_id` is required in MVP.

---

### PATCH /api/v1/alerts/{alert_id}

#### Purpose
Update an alert rule.

#### Request Example
json
{
  "target_price": "710000",
  "is_active": true,
  "cooldown_minutes": 120
}

#### Response Example
json
{
  "id": 21,
  "asset_code": "USDT",
  "condition_type": "above",
  "target_price": "710000",
  "is_active": true,
  "cooldown_minutes": 120,
  "last_triggered_at": null,
  "updated_at": "2026-05-18T10:30:00Z"
}

---

### DELETE /api/v1/alerts/{alert_id}

#### Purpose
Delete or deactivate an alert rule.

#### Request Example
http
DELETE /api/v1/alerts/21

#### Response Example
json
{
  "success": true
}

#### Notes
Implementation may choose hard delete or soft delete.  
For MVP, deactivation is often operationally safer.

---

## Bale Bot Webhook

### POST /api/v1/bot/webhook

#### Purpose
Receive Bale webhook updates and process supported commands.

#### Supported Commands
- `/start`
- `/help`
- `/prices`
- `/alert`

#### Request Example
json
{
  "message": {
    "text": "/start",
    "from": {
      "id": "123456789",
      "username": "ali_dev",
      "first_name": "Ali",
      "last_name": "Safaei"
    },
    "chat": {
      "id": "123456789"
    }
  }
}

#### Response Example
json
{
  "success": true,
  "handled": true,
  "command": "/start"
}

#### Notes
- webhook handler must be defensive
- malformed payloads should not crash the app
- safe response behavior is preferred over exception bubbling

#### Failure Example
json
{
  "success": true,
  "handled": false
}

This may be used for malformed or unsupported payloads when the system chooses safe no-op handling.
```
---

## Future API Candidates

Not part of MVP unless later approved:

- provider management endpoints
- price history endpoints
- notification history endpoints
- admin/system metrics endpoints
- alert analytics endpoints