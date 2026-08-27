namespace DyingStar.Server.Domain;

public enum BuildingType
{
    NexusCore,
    FusionReactor,
    AlloyFoundry,
}

public enum ResourceType
{
    Alloy,
    Helium3,
    Data,
    Nova,
}

public sealed class PlayerEntity
{
    public Guid Id { get; set; }
    public required string GuestTokenHash { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime LastSeenAtUtc { get; set; }
    public ArkEntity Ark { get; set; } = null!;
    public List<ActionReceiptEntity> ActionReceipts { get; set; } = [];
}

public sealed class ArkEntity
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public PlayerEntity Player { get; set; } = null!;
    public int NexusLevel { get; set; } = 1;
    public long Alloy { get; set; } = 2_000;
    public long Helium3 { get; set; } = 500;
    public long Data { get; set; } = 100;
    public long Nova { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public List<BuildingEntity> Buildings { get; set; } = [];
    public List<ResourceLedgerEntity> ResourceLedger { get; set; } = [];
}

public sealed class BuildingEntity
{
    public Guid Id { get; set; }
    public Guid ArkId { get; set; }
    public ArkEntity Ark { get; set; } = null!;
    public BuildingType Type { get; set; }
    public int Level { get; set; }
    public DateTime? UpgradeStartedAtUtc { get; set; }
    public DateTime? UpgradeCompletesAtUtc { get; set; }
}

public sealed class ResourceLedgerEntity
{
    public long Id { get; set; }
    public Guid ArkId { get; set; }
    public ArkEntity Ark { get; set; } = null!;
    public ResourceType ResourceType { get; set; }
    public long Delta { get; set; }
    public required string Reason { get; set; }
    public required string ActionId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public sealed class ActionReceiptEntity
{
    public long Id { get; set; }
    public Guid PlayerId { get; set; }
    public PlayerEntity Player { get; set; } = null!;
    public required string ActionId { get; set; }
    public required string ActionType { get; set; }
    public required string ResponseJson { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
