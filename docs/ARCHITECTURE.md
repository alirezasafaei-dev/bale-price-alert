# Architecture

## Overview

`novax-price-alert` is designed as a **modular monolith**.  
This architecture is chosen for the MVP because it provides:

- fast delivery
- simple deployment
- low operational overhead
- clean internal structure
- future extensibility without early microservice complexity

The system runs as a single backend application with background workers.

Core runtime pieces:

- FastAPI application
- PostgreSQL database
- Redis queue
- RQ workers
- Bale integration adapter
- price provider adapter(s)

## Architectural Intent

The new project reuses the **architectural foundation direction** of `rubika-bot-saas` where it is product-agnostic.

That means reusing or aligning with these confirmed patterns from the old repository documentation:

- FastAPI-based modular backend
- `/api/v1` versioned routing
- environment-based configuration
- PostgreSQL + SQLAlchemy + Alembic
- Redis + RQ for background jobs
- centralized validation/error-handling intent
- structured logging intent
- self-hostable, local-first deployment model
- production-aware defaults for MVP

## Truth from the Old Repository

Based on the currently available evidence from `rubika-bot-saas` documentation, the following are explicitly stated:

### Confirmed from available repo material
- the old system is intended as a modular monolith
- FastAPI is the API framework
- SQLAlchemy 2 + Alembic are the persistence foundations
- PostgreSQL is the primary database
- Redis + RQ are intended for background jobs
- API versioning uses `/api/v1`
- environment-based configuration is a core design rule
- centralized operational concerns such as logging and error handling are intended principles
- the old project is self-hostable and local-first

### Not yet confirmed from code-level inspection
- how completely these patterns are implemented in code
- exact project maturity
- actual abstraction boundaries in services/repositories/workers
- quality and completeness of tests
- consistency between docs and code

This new architecture document therefore reuses **confirmed direction** and avoids claiming code-level reuse that has not been verified.

## High-Level Component Model

```text
Bale User
   |
   v
Bale Bot / Webhook
   |
   v
FastAPI API Layer
   |
   v
Application Services
   |
   +--> Repositories --> PostgreSQL
   |
   +--> Provider Integrations --> External / Mock Providers
   |
   +--> Redis Queue --> RQ Workers --> Bale Notifications

```
## Core Modules

### 1. API Layer
Responsibilities:

- expose HTTP endpoints
- validate requests
- map transport data to service calls
- return stable response schemas
- keep handlers thin

Modules:

- health
- readiness
- prices
- alerts
- users
- bot webhook

### 2. Services Layer
Responsibilities:

- enforce business rules
- coordinate repositories
- coordinate integrations
- evaluate alert logic
- orchestrate background workflows

Expected service modules:

- `user_service`
- `asset_service`
- `price_fetch_service`
- `price_normalization_service`
- `alert_service`
- `alert_evaluator_service`
- `notification_service`

### 3. Repositories Layer
Responsibilities:

- isolate database access logic
- provide query/update methods for domain entities
- keep persistence details out of API handlers

### 4. Integrations Layer
Responsibilities:

- Bale API adapter
- Bale payload parsing
- Bale message formatting
- provider abstraction and normalization

### 5. Worker Layer
Responsibilities:

- process asynchronous jobs
- keep slow or retry-prone work out of request path
- handle price fetch / evaluation / notification send

## Module Boundaries

### User Module
Owns:
- Bale user identity
- user lifecycle for bot interaction

### Asset/Price Module
Owns:
- supported assets
- provider-fed prices
- latest price state
- historical price snapshots

### Alert Module
Owns:
- alert rules
- condition matching
- cooldown enforcement
- alert event creation

### Notification Module
Owns:
- outgoing Bale notifications
- delivery status tracking

### Bot Integration Module
Owns:
- webhook parsing
- command handling
- Bale-specific formatting and transport

## Request Flow

Typical synchronous request flow:

text
HTTP Request
-> FastAPI route
-> request schema validation
-> service call
-> repository/integration access
-> response schema
-> HTTP response

## Webhook Flow

text
Bale webhook
-> /api/v1/bot/webhook
-> defensive payload parser
-> user extraction
-> command detection
-> command handler/service
-> optional DB update
-> optional Bale response send
-> safe HTTP response

Principles:

- never trust webhook payload shape
- fail safely
- avoid retry storms
- log malformed payloads with care
- do not leak internal errors

## Provider Fetch Flow

text
Scheduled trigger / manual trigger
-> fetch_prices job
-> provider registry
-> selected provider(s)
-> normalize output
-> persist PriceSnapshot
-> upsert LatestPrice

## Alert Evaluation Flow

text
evaluate_alerts job
-> load active alerts
-> load latest prices
-> compare condition_type with target_price
-> enforce cooldown
-> create AlertEvent
-> enqueue send_notifications
-> update last_triggered_at

## Notification Flow

text
send_notifications job
-> load AlertEvent + User
-> format Bale message
-> Bale client send
-> create NotificationDelivery record
-> update event/delivery status

## Persistence Model Overview

Main persistent entities:

- `User`
- `Asset`
- `Provider`
- `PriceSnapshot`
- `LatestPrice`
- `AlertRule`
- `AlertEvent`
- `NotificationDelivery`

Design goals:

- durable alert history
- clear current/latest price state
- traceable notification outcomes
- future multi-provider support

## Queue / Worker Model

RQ is chosen for MVP because:

- it matches the old project direction
- it is simple to operate
- it is enough for scheduled/background tasks
- it keeps the system deployable on a small VPS

Queue responsibilities:

- background price fetches
- alert evaluations
- outbound notification sending

## Design Principles

- self-hostable first
- operational simplicity over sophistication
- reuse proven backend patterns
- transport/business/integration separation
- thin API routes
- explicit persistence
- safe webhook behavior
- mockable external integrations
- production-aware defaults

## Non-Goals for MVP

- microservices
- multi-tenant enterprise control plane
- advanced portfolio analytics
- strategy engines
- high-frequency market ingestion
- highly dynamic workflow builders
- complex end-user conversational flows
- multi-channel notification routing beyond Bale