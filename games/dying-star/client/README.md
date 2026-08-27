# Dying Star Unity client

Unity mobile client scaffold for the Project Dying Star vertical slice.

## Baseline

Unity 6 project structure with:

- guest session persistence
- authoritative Ark state sync
- server-backed building upgrade requests
- prototype Ark view
- lightweight starfield
- one-click M1 scene generator

## Create the first scene

1. Open the `client` folder as a Unity project.
2. Let Unity restore packages.
3. Use `Dying Star > Create M1 Ark Prototype Scene`.
4. The tool creates `Assets/Scenes/M1_ArkPrototype.unity` and adds it to Build Settings.
5. Start the authoritative backend first, then enter Play Mode.

The generated scene contains temporary geometry only. Its purpose is to validate the first product loop: guest session -> authoritative Ark -> restore Reactor -> server timer -> close/reopen -> completed state -> visual power activation.

## Mobile networking

For an Android device, `localhost` points at the device itself. Set `DyingStarApiClient.baseUrl` to a reachable development server on the same network or use an HTTPS development environment before device testing.
