# Dying Star authoritative server

ASP.NET Core vertical-slice backend for QUANTUMNOVA Games / Project Dying Star.

## Local start

From `games/dying-star`:

1. Start PostgreSQL and Redis with `docker compose up -d`.
2. From `server`, run `dotnet restore`.
3. Run `dotnet run`.
4. Confirm `GET http://localhost:5000/health` returns an OK response. If the ASP.NET development profile selects a different local port, set the Unity `DyingStarApiClient` base URL to match it.

## M0/M1 endpoints

- `POST /api/v1/session/guest`
- `GET /api/v1/ark` with `X-Player-Token`
- `POST /api/v1/ark/buildings/{buildingType}/upgrade` with `X-Player-Token`

## Current prototype rules

- One authoritative construction queue.
- The server owns Alloy and building state.
- Upgrade completion is represented as an absolute UTC completion timestamp.
- Completed upgrades resolve against server time when the account is read or changed, so closing the mobile client cannot pause or accelerate construction.
- `NexusCore`, `FusionReactor`, and `AlloyFoundry` are the first implemented building types.
- The vertical-slice cap is building level 10.

Redis is connected as part of the target architecture but scheduled-event processing is deliberately deferred until the prototype has multiple event types. PostgreSQL is already the durable source of truth.
