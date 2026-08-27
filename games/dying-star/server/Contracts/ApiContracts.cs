using DyingStar.Server.Domain;

namespace DyingStar.Server.Contracts;

public sealed record GuestSessionResponse(
    string PlayerId,
    string GuestToken,
    ArkSnapshot Ark);

public sealed record ArkSnapshot(
    string ArkId,
    int NexusLevel,
    long Alloy,
    long Helium3,
    long Data,
    long Nova,
    DateTime ServerTimeUtc,
    IReadOnlyList<BuildingSnapshot> Buildings);

public sealed record BuildingSnapshot(
    BuildingType Type,
    int Level,
    DateTime? UpgradeStartedAtUtc,
    DateTime? UpgradeCompletesAtUtc);

public sealed record UpgradeBuildingRequest(string ActionId);

public sealed record UpgradeBuildingResponse(
    ArkSnapshot Ark,
    BuildingType Building,
    int TargetLevel,
    DateTime UpgradeCompletesAtUtc,
    long AlloySpent);

public sealed record ErrorResponse(string Code, string Message);
