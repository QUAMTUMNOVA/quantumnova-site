using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using DyingStar.Server.Contracts;
using DyingStar.Server.Data;
using DyingStar.Server.Domain;
using Microsoft.EntityFrameworkCore;

namespace DyingStar.Server.Services;

public sealed class GameService(GameDbContext db, TimeProvider timeProvider)
{
    public async Task<GuestSessionResponse> CreateGuestSessionAsync(CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var playerId = Guid.NewGuid();
        var arkId = Guid.NewGuid();
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();

        var ark = new ArkEntity
        {
            Id = arkId,
            PlayerId = playerId,
            NexusLevel = 1,
            Alloy = 2_000,
            Helium3 = 500,
            Data = 100,
            Nova = 0,
            UpdatedAtUtc = now,
            Buildings =
            [
                new BuildingEntity { Id = Guid.NewGuid(), ArkId = arkId, Type = BuildingType.NexusCore, Level = 1 },
                new BuildingEntity { Id = Guid.NewGuid(), ArkId = arkId, Type = BuildingType.FusionReactor, Level = 0 },
                new BuildingEntity { Id = Guid.NewGuid(), ArkId = arkId, Type = BuildingType.AlloyFoundry, Level = 0 },
            ],
        };

        var player = new PlayerEntity
        {
            Id = playerId,
            GuestTokenHash = HashToken(rawToken),
            CreatedAtUtc = now,
            LastSeenAtUtc = now,
            Ark = ark,
        };

        db.Players.Add(player);
        db.ResourceLedger.Add(new ResourceLedgerEntity
        {
            ArkId = arkId,
            ResourceType = ResourceType.Alloy,
            Delta = ark.Alloy,
            Reason = "guest_bootstrap",
            ActionId = $"bootstrap:{playerId}:alloy",
            CreatedAtUtc = now,
        });
        await db.SaveChangesAsync(cancellationToken);

        return new GuestSessionResponse(player.Id.ToString(), rawToken, ToSnapshot(ark, now));
    }

    public async Task<ArkSnapshot?> GetArkAsync(string? rawToken, CancellationToken cancellationToken)
    {
        var player = await LoadPlayerAsync(rawToken, cancellationToken);
        if (player is null) return null;

        var now = timeProvider.GetUtcNow().UtcDateTime;
        ResolveCompletedUpgrades(player.Ark, now);
        player.LastSeenAtUtc = now;
        player.Ark.UpdatedAtUtc = now;
        await db.SaveChangesAsync(cancellationToken);
        return ToSnapshot(player.Ark, now);
    }

    public async Task<(UpgradeBuildingResponse? Response, ErrorResponse? Error)> UpgradeBuildingAsync(
        string? rawToken,
        BuildingType buildingType,
        UpgradeBuildingRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ActionId) || request.ActionId.Length > 128)
            return (null, new ErrorResponse("INVALID_ACTION_ID", "A unique actionId is required."));

        var player = await LoadPlayerAsync(rawToken, cancellationToken);
        if (player is null)
            return (null, new ErrorResponse("UNAUTHENTICATED", "Guest token is invalid or missing."));

        var now = timeProvider.GetUtcNow().UtcDateTime;
        ResolveCompletedUpgrades(player.Ark, now);

        var duplicateLedgerEntry = await db.ResourceLedger.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ArkId == player.Ark.Id && x.ActionId == request.ActionId, cancellationToken);
        if (duplicateLedgerEntry is not null)
            return (null, new ErrorResponse("ACTION_ALREADY_PROCESSED", "This actionId has already been processed."));

        var activeUpgrade = player.Ark.Buildings.FirstOrDefault(x => x.UpgradeCompletesAtUtc > now);
        if (activeUpgrade is not null)
            return (null, new ErrorResponse("BUILD_QUEUE_BUSY", $"{activeUpgrade.Type} is already upgrading."));

        var building = player.Ark.Buildings.FirstOrDefault(x => x.Type == buildingType);
        if (building is null)
            return (null, new ErrorResponse("BUILDING_NOT_FOUND", "The requested building does not exist on this Ark."));

        var targetLevel = building.Level + 1;
        var validation = ValidateUpgrade(player.Ark, buildingType, targetLevel);
        if (validation is not null) return (null, validation);

        var alloyCost = GetAlloyCost(buildingType, targetLevel);
        if (player.Ark.Alloy < alloyCost)
            return (null, new ErrorResponse("INSUFFICIENT_ALLOY", $"Upgrade requires {alloyCost:N0} Alloy."));

        var duration = GetUpgradeDuration(buildingType, targetLevel);
        player.Ark.Alloy -= alloyCost;
        player.Ark.UpdatedAtUtc = now;
        player.LastSeenAtUtc = now;
        building.UpgradeStartedAtUtc = now;
        building.UpgradeCompletesAtUtc = now.Add(duration);

        db.ResourceLedger.Add(new ResourceLedgerEntity
        {
            ArkId = player.Ark.Id,
            ResourceType = ResourceType.Alloy,
            Delta = -alloyCost,
            Reason = $"upgrade:{buildingType}:{targetLevel}",
            ActionId = request.ActionId,
            CreatedAtUtc = now,
        });

        await db.SaveChangesAsync(cancellationToken);

        return (
            new UpgradeBuildingResponse(
                ToSnapshot(player.Ark, now),
                buildingType,
                targetLevel,
                building.UpgradeCompletesAtUtc.Value,
                alloyCost),
            null);
    }

    private async Task<PlayerEntity?> LoadPlayerAsync(string? rawToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken)) return null;
        var tokenHash = HashToken(rawToken);
        return await db.Players
            .Include(x => x.Ark)
            .ThenInclude(x => x.Buildings)
            .FirstOrDefaultAsync(x => x.GuestTokenHash == tokenHash, cancellationToken);
    }

    private static void ResolveCompletedUpgrades(ArkEntity ark, DateTime now)
    {
        foreach (var building in ark.Buildings)
        {
            if (building.UpgradeCompletesAtUtc is null || building.UpgradeCompletesAtUtc > now) continue;
            building.Level += 1;
            building.UpgradeStartedAtUtc = null;
            building.UpgradeCompletesAtUtc = null;
            if (building.Type == BuildingType.NexusCore) ark.NexusLevel = building.Level;
        }
    }

    private static ErrorResponse? ValidateUpgrade(ArkEntity ark, BuildingType buildingType, int targetLevel)
    {
        var reactorLevel = ark.Buildings.First(x => x.Type == BuildingType.FusionReactor).Level;
        var foundryLevel = ark.Buildings.First(x => x.Type == BuildingType.AlloyFoundry).Level;

        if (targetLevel > 10)
            return new ErrorResponse("VERTICAL_SLICE_CAP", "The current prototype is capped at building level 10.");

        return buildingType switch
        {
            BuildingType.NexusCore when reactorLevel < Math.Max(1, targetLevel - 1)
                => new ErrorResponse("REACTOR_REQUIRED", $"Fusion Reactor level {Math.Max(1, targetLevel - 1)} is required."),
            BuildingType.NexusCore when targetLevel >= 3 && foundryLevel < targetLevel - 2
                => new ErrorResponse("FOUNDRY_REQUIRED", $"Alloy Foundry level {targetLevel - 2} is required."),
            BuildingType.FusionReactor when targetLevel > ark.NexusLevel
                => new ErrorResponse("NEXUS_REQUIRED", $"Nexus Core level {targetLevel} is required."),
            BuildingType.AlloyFoundry when reactorLevel < 1
                => new ErrorResponse("REACTOR_REQUIRED", "Restore the Fusion Reactor before the Alloy Foundry."),
            BuildingType.AlloyFoundry when targetLevel > ark.NexusLevel
                => new ErrorResponse("NEXUS_REQUIRED", $"Nexus Core level {targetLevel} is required."),
            _ => null,
        };
    }

    private static long GetAlloyCost(BuildingType type, int targetLevel)
    {
        var baseCost = type switch
        {
            BuildingType.NexusCore => 420,
            BuildingType.FusionReactor => 180,
            BuildingType.AlloyFoundry => 240,
            _ => 250,
        };

        return (long)Math.Round(baseCost * Math.Pow(1.5, targetLevel - 1));
    }

    private static TimeSpan GetUpgradeDuration(BuildingType type, int targetLevel)
    {
        var baseSeconds = type switch
        {
            BuildingType.NexusCore => 12,
            BuildingType.FusionReactor => 6,
            BuildingType.AlloyFoundry => 8,
            _ => 10,
        };

        return TimeSpan.FromSeconds(baseSeconds * Math.Pow(1.35, targetLevel - 1));
    }

    private static ArkSnapshot ToSnapshot(ArkEntity ark, DateTime now) =>
        new(
            ark.Id.ToString(),
            ark.NexusLevel,
            ark.Alloy,
            ark.Helium3,
            ark.Data,
            ark.Nova,
            now,
            ark.Buildings
                .OrderBy(x => x.Type)
                .Select(x => new BuildingSnapshot(x.Type, x.Level, x.UpgradeStartedAtUtc, x.UpgradeCompletesAtUtc))
                .ToArray());

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
}
