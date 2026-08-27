# Dying Star Unity client

Unity mobile client scaffold for the Project Dying Star vertical slice.

## Baseline

Unity 6 project structure with:

- guest session persistence
- authoritative Ark state sync
- server-backed building upgrade requests
- automatic authoritative refresh while construction is active
- passive Alloy and Helium-3 economy presentation
- locally extrapolated production HUD between server snapshots
- production collection through the authoritative backend
- prototype Ark view
- lightweight starfield
- one-click M2 scene generator

## Create the current prototype scene

1. Open the `client` folder as a Unity project.
2. Let Unity restore packages.
3. Use `Dying Star > Create M2 Ark Economy Prototype Scene`.
4. The tool creates `Assets/Scenes/M2_ArkEconomyPrototype.unity` and adds it to Build Settings.
5. Start the authoritative backend first, then enter Play Mode.

The generated scene contains temporary geometry only. Its purpose is to validate the first two product loops:

1. guest session -> authoritative Ark -> restore Reactor -> server timer -> completed state -> visual power activation
2. restored producer -> server-time passive production -> offline accrual -> finite storage -> collect -> audited resource balance

The HUD shows current Alloy, Helium-3 and Data balances, stored production, per-hour production and Ark power state. Stored production animates locally from the latest authoritative server snapshot, so the client does not need to poll the server every second merely to display increasing numbers.

## Mobile networking

For an Android device, `localhost` points at the device itself. Set `DyingStarApiClient.baseUrl` to a reachable development server on the same network or use an HTTPS development environment before device testing.
