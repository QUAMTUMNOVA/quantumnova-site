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
    EconomySnapshot Economy,
    IReadOnlyList<BuildingSnapshot> Buildings);

public sealed record EconomySnapshot(
    long AlloyStored,
    long Helium3Stored,
    double AlloyPerHour,
    double Helium3PerHour,
    long AlloyStorageCapacity,
    long Helium3StorageCapacity,
    DateTime LastSettledAtUtc);

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

public sealed record CollectProductionRequest(string ActionId);

public sealed record CollectProductionResponse(
    ArkSnapshot Ark,
    long AlloyCollected,
    long Helium3Collected);

public sealed record ErrorResponse(string Code, string Message);
