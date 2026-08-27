# Project Dying Star

Internal QUANTUMNOVA Games prototype for a mobile persistent 4X strategy MMO.

This folder is a temporary bootstrap home for M0/M1 while the connected GitHub integration does not expose repository-creation capability. It is intentionally isolated from the production website application and can be moved into dedicated client/server repositories without changing namespaces or game architecture.

## Current milestone

M0 + M1 foundation:

- Unity client scaffold
- ASP.NET Core authoritative backend scaffold
- Anonymous guest identity contract
- Ark snapshot model
- Building upgrade request/response contract
- Authoritative completion timestamps
- Nexus Core, Fusion Reactor and Alloy Foundry prototype definitions

## Architecture rule

The Unity client requests actions. The server validates and owns progression, resources and timers.

No production website code should import anything from this directory.
