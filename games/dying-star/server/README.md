# Dying Star authoritative server

ASP.NET Core vertical-slice backend for QUANTUMNOVA Games / Project Dying Star.

## Local start

From `games/dying-star`:

1. Start PostgreSQL and Redis with `docker compose up -d`.
2. From `server`, run `dotnet restore`.
3. Run `dotnet run`.
4. Confirm `GET http://localhost:5000/health` returns an OK response. If the ASP.NET development profile selects a different local port, set the Unity `DyingStarApiClient` base URL to match it.

If an M1 PostgreSQL development volume already exists, reset it once after pulling the M2 schema changes with `docker compose down -v`, then start the containers again. The prototype currently uses `EnsureCreated`; formal EF migrations will be introduced before shared or production environments exist.

## M0-M2 endpoints

- `POST /api/v1/session/guest`
- `GET /api/v1/ark` with `X-Player-Token`
- `POST /api/v1/ark/buildings/{buildingType}/upgrade` with `X-Player-Token`
- `POST /api/v1/ark/economy/collect` with `X-Player-Token`

## Current prototype rules

- One authoritative construction queue.
- The server owns resources, production, building state and construction completion.
- Upgrade completion is represented as an absolute UTC timestamp.
- Passive production is settled against server time, including while the mobile client is closed.
- Production is stored in an eight-hour collection buffer so offline progress has a cap.
- `FusionReactor` produces Helium-3 after restoration.
- `AlloyFoundry` produces Alloy after restoration.
- Building levels increase production rates and storage capacity.
- Collection transfers whole produced units into the account balance and writes auditable ledger entries.
- Duplicate mobile actions are replay-safe through per-player action receipts.
- `NexusCore`, `FusionReactor`, and `AlloyFoundry` are the first implemented building types.
- The vertical-slice cap is building level 10.
- API enums are serialised as names so Unity receives values such as `FusionReactor` rather than numeric enum ordinals.

### Prototype production curve

- Alloy Foundry Lv1: 90 Alloy/hour.
- Fusion Reactor Lv1: 45 Helium-3/hour.
- Each upgrade scales the relevant rate exponentially for early prototype testing.
- Storage holds eight hours of the current production rate.

These values are prototype balance data, not final economy targets.

Redis is connected as part of the target architecture but scheduled-event processing is deliberately deferred until the prototype has multiple event types. PostgreSQL is already the durable source of truth.
