# Roadmap

## Phase 0 — Repository Analysis and Foundation Reuse

### Goals
- inspect `rubika-bot-saas`
- identify reusable infrastructure patterns
- separate generic foundation from old domain logic
- define new project boundaries

### Deliverables
- reuse inventory
- proposed repository structure
- documented migration strategy
- confirmed MVP scope for `novax-price-alert`

### Out of Scope
- advanced product features
- non-essential integrations
- performance tuning beyond baseline

### Exit Criteria
- reuse candidates are clearly categorized as:
  - reusable as-is
  - reusable with adaptation
  - rebuild from scratch
- new project architecture is documented

---

## Phase 1 — Bootstrap and Infrastructure

### Goals
- initialize FastAPI project
- configure settings, logging, error handling
- setup PostgreSQL, SQLAlchemy, Alembic
- setup Redis + RQ worker bootstrap
- provide Docker-based local/dev runtime

### Deliverables
- application bootstrap
- health and readiness endpoints
- base database session management
- first migration
- worker startup path
- `.env.example`, Dockerfile, docker-compose, Makefile

### Out of Scope
- advanced auth
- production monitoring stack
- full observability dashboards

### Exit Criteria
- app boots
- DB connects
- Redis connects
- migrations run
- health endpoints pass

---

## Phase 2 — Prices and Providers

### Goals
- define asset/provider/price models
- implement provider abstraction
- support mock provider
- persist snapshots and latest prices

### Deliverables
- `Asset`, `Provider`, `PriceSnapshot`, `LatestPrice`
- provider registry
- mock provider integration
- latest prices endpoint
- seed data for core assets

### Out of Scope
- many real providers
- arbitrage logic
- historical charting endpoints

### Exit Criteria
- price fetch job runs
- latest prices persist correctly
- latest prices endpoint returns usable data

---

## Phase 3 — Alerts and Evaluation

### Goals
- implement alert rules
- implement above/below conditions
- enforce cooldowns
- generate alert events

### Deliverables
- `AlertRule`, `AlertEvent`
- alert CRUD API
- evaluation job
- status tracking for alert outcomes

### Out of Scope
- advanced rule expressions
- compound conditions
- portfolio alerts

### Exit Criteria
- alerts can be created
- matching prices trigger events
- cooldown is enforced

---

## Phase 4 — Bale Bot Integration

### Goals
- implement Bale webhook endpoint
- parse incoming command payloads
- support simple command flow
- send outgoing notification messages

### Deliverables
- Bale parser/client/formatter
- `/start`, `/help`, `/prices`, `/alert`
- mock Bale sending
- `NotificationDelivery`

### Out of Scope
- deep conversational UX
- inline workflows
- user-authenticated web dashboard

### Exit Criteria
- webhook handles supported commands safely
- outgoing notification pipeline works in mock mode
- triggered alerts create message deliveries

---

## Phase 5 — Hardening and Operations

### Goals
- improve operational safety
- improve logs and failure handling
- finalize tests and deploy docs

### Deliverables
- smoke test coverage for MVP
- operational docs
- deployment checklist
- recovery basics
- safe failure handling in workers/webhooks

### Out of Scope
- enterprise SRE tooling
- full distributed tracing

### Exit Criteria
- test suite passes
- docs are complete
- deployment path is repeatable

---

## Phase 6 — Future Expansion

### Goals
- prepare for next-level product growth

### Potential Deliverables
- real provider integrations
- scheduler service
- user-facing alert editing flow via bot
- admin dashboard
- rate limiting
- alert grouping
- localization improvements
- richer reporting
- retention policies for price snapshots

### Out of Scope
- breaking architecture changes without need

### Exit Criteria
- future scope is prioritized by actual usage and operations feedback
```