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
    private const double ProductionStorageHours = 8d;

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
            AlloyProductionStored = 0,
            Helium3ProductionStored = 0,
            LastEconomySettledAtUtc = now,
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
        AddLedger(arkId, ResourceType.Alloy, ark.Alloy, "guest_bootstrap", $"bootstrap:{playerId}:alloy", now);
        AddLedger(arkId, ResourceType.Helium3, ark.Helium3, "guest_bootstrap", $"bootstrap:{playerId}:helium3", now);
        AddLedger(arkId, ResourceType.Data, ark.Data, "guest_bootstrap", $"bootstrap:{playerId}:data", now);
        await db.SaveChangesAsync(cancellationToken);

        return new GuestSessionResponse(player.Id.ToString(), rawToken, ToSnapshot(ark, now));
    }

    public async Task<ArkSnapshot?> GetArkAsync(string? rawToken, CancellationToken cancellationToken)
    {
        var player = await LoadPlayerAsync(rawToken, cancellationToken);
        if (player is null) return null;

        var now = timeProvider.GetUtcNow().UtcDateTime;
        SettleArkState(player.Ark, now);
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
        if (!IsValidActionId(request.ActionId))
            return (null, new ErrorResponse("INVALID_ACTION_ID", "A unique actionId is required."));

        var player = await LoadPlayerAsync(rawToken, cancellationToken);
        if (player is null)
            return (null, new ErrorResponse("UNAUTHENTICATED", "Guest token is invalid or missing."));

        var priorReceipt = await FindReceiptAsync(player.Id, request.ActionId, cancellationToken);
        if (priorReceipt is not null)
        {
            var priorResponse = JsonSerializer.Deserialize<UpgradeBuildingResponse>(priorReceipt.ResponseJson);
            return priorResponse is null
                ? (null, new ErrorResponse("RECEIPT_CORRUPT", "The prior action receipt could not be read."))
                : (priorResponse, null);
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;
        SettleArkState(player.Ark, now);

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

        AddLedger(
            player.Ark.Id,
            ResourceType.Alloy,
            -alloyCost,
            $"upgrade:{buildingType}:{targetLevel}",
            request.ActionId,
            now);

        var response = new UpgradeBuildingResponse(
            ToSnapshot(player.Ark, now),
            buildingType,
            targetLevel,
            building.UpgradeCompletesAtUtc.Value,
            alloyCost);

        AddReceipt(player.Id, request.ActionId, $"upgrade:{buildingType}", response, now);
        await db.SaveChangesAsync(cancellationToken);
        return (response, null);
    }

    public async Task<(CollectProductionResponse? Response, ErrorResponse? Error)> CollectProductionAsync(
        string? rawToken,
        CollectProductionRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsValidActionId(request.ActionId))
            return (null, new ErrorResponse("INVALID_ACTION_ID", "A unique actionId is required."));

        var player = await LoadPlayerAsync(rawToken, cancellationToken);
        if (player is null)
            return (null, new ErrorResponse("UNAUTHENTICATED", "Guest token is invalid or missing."));

        var priorReceipt = await FindReceiptAsync(player.Id, request.ActionId, cancellationToken);
        if (priorReceipt is not null)
        {
            var priorResponse = JsonSerializer.Deserialize<CollectProductionResponse>(priorReceipt.ResponseJson);
            return priorResponse is null
                ? (null, new ErrorResponse("RECEIPT_CORRUPT", "The prior action receipt could not be read."))
                : (priorResponse, null);
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;
        SettleArkState(player.Ark, now);

        var alloyCollected = Math.Max(0L, (long)Math.Floor(player.Ark.AlloyProductionStored));
        var heliumCollected = Math.Max(0L, (long)Math.Floor(player.Ark.Helium3ProductionStored));

        if (alloyCollected > 0)
        {
            player.Ark.Alloy += alloyCollected;
            player.Ark.AlloyProductionStored -= alloyCollected;
            AddLedger(
                player.Ark.Id,
                ResourceType.Alloy,
                alloyCollected,
                "passive_production_collection",
                $"{request.ActionId}:alloy",
                now);
        }

        if (heliumCollected > 0)
        {
            player.Ark.Helium3 += heliumCollected;
            player.Ark.Helium3ProductionStored -= heliumCollected;
            AddLedger(
                player.Ark.Id,
                ResourceType.Helium3,
                heliumCollected,
                "passive_production_collection",
                $"{request.ActionId}:helium3",
                now);
        }

        player.LastSeenAtUtc = now;
        player.Ark.UpdatedAtUtc = now;

        var response = new CollectProductionResponse(
            ToSnapshot(player.Ark, now),
            alloyCollected,
            heliumCollected);

        AddReceipt(player.Id, request.ActionId, "collect:production", response, now);
        await db.SaveChangesAsync(cancellationToken);
        return (response, null);
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

    private Task<ActionReceiptEntity?> FindReceiptAsync(
        Guid playerId,
        string actionId,
        CancellationToken cancellationToken) =>
        db.ActionReceipts.AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.PlayerId == playerId && x.ActionId == actionId,
                cancellationToken);

    private static void SettleArkState(ArkEntity ark, DateTime now)
    {
        var cursor = ark.LastEconomySettledAtUtc;
        if (cursor == default || cursor > now)
            cursor = ark.UpdatedAtUtc == default || ark.UpdatedAtUtc > now ? now : ark.UpdatedAtUtc;

        while (true)
        {
            var completed = ark.Buildings
                .Where(x => x.UpgradeCompletesAtUtc is not null && x.UpgradeCompletesAtUtc <= now)
                .OrderBy(x => x.UpgradeCompletesAtUtc)
                .FirstOrDefault();

            if (completed is null) break;

            var completionTime = completed.UpgradeCompletesAtUtc!.Value;
            if (completionTime > cursor)
            {
                AccrueProduction(ark, cursor, completionTime);
                cursor = completionTime;
            }

            completed.Level += 1;
            completed.UpgradeStartedAtUtc = null;
            completed.UpgradeCompletesAtUtc = null;
            if (completed.Type == BuildingType.NexusCore)
                ark.NexusLevel = completed.Level;
        }

        if (now > cursor)
            AccrueProduction(ark, cursor, now);

        ark.LastEconomySettledAtUtc = now;
    }

    private static void AccrueProduction(ArkEntity ark, DateTime fromUtc, DateTime toUtc)
    {
        var hours = Math.Max(0d, (toUtc - fromUtc).TotalHours);
        if (hours <= 0d) return;

        var foundryLevel = GetBuildingLevel(ark, BuildingType.AlloyFoundry);
        var reactorLevel = GetBuildingLevel(ark, BuildingType.FusionReactor);
        var alloyRate = GetAlloyProductionRate(foundryLevel);
        var heliumRate = GetHeliumProductionRate(reactorLevel);
        var alloyCapacity = GetProductionStorageCapacity(alloyRate);
        var heliumCapacity = GetProductionStorageCapacity(heliumRate);

        ark.AlloyProductionStored = Math.Min(
            alloyCapacity,
            ark.AlloyProductionStored + alloyRate * hours);
        ark.Helium3ProductionStored = Math.Min(
            heliumCapacity,
            ark.Helium3ProductionStored + heliumRate * hours);
    }

    private static ErrorResponse? ValidateUpgrade(ArkEntity ark, BuildingType buildingType, int targetLevel)
    {
        var reactorLevel = GetBuildingLevel(ark, BuildingType.FusionReactor);
        var foundryLevel = GetBuildingLevel(ark, BuildingType.AlloyFoundry);

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

    private static int GetBuildingLevel(ArkEntity ark, BuildingType type) =>
        ark.Buildings.FirstOrDefault(x => x.Type == type)?.Level ?? 0;

    private static double GetAlloyProductionRate(int level) =>
        level <= 0 ? 0d : 90d * Math.Pow(1.55d, level - 1);

    private static double GetHeliumProductionRate(int level) =>
        level <= 0 ? 0d : 45d * Math.Pow(1.5d, level - 1);

    private static long GetProductionStorageCapacity(double hourlyRate) =>
        hourlyRate <= 0d ? 0L : (long)Math.Ceiling(hourlyRate * ProductionStorageHours);

    private static ArkSnapshot ToSnapshot(ArkEntity ark, DateTime now)
    {
        var foundryLevel = GetBuildingLevel(ark, BuildingType.AlloyFoundry);
        var reactorLevel = GetBuildingLevel(ark, BuildingType.FusionReactor);
        var alloyRate = GetAlloyProductionRate(foundryLevel);
        var heliumRate = GetHeliumProductionRate(reactorLevel);

        return new ArkSnapshot(
            ark.Id.ToString(),
            ark.NexusLevel,
            ark.Alloy,
            ark.Helium3,
            ark.Data,
            ark.Nova,
            now,
            new EconomySnapshot(
                Math.Max(0L, (long)Math.Floor(ark.AlloyProductionStored)),
                Math.Max(0L, (long)Math.Floor(ark.Helium3ProductionStored)),
                alloyRate,
                heliumRate,
                GetProductionStorageCapacity(alloyRate),
                GetProductionStorageCapacity(heliumRate),
                ark.LastEconomySettledAtUtc),
            ark.Buildings
                .OrderBy(x => x.Type)
                .Select(x => new BuildingSnapshot(x.Type, x.Level, x.UpgradeStartedAtUtc, x.UpgradeCompletesAtUtc))
                .ToArray());
    }

    private void AddLedger(
        Guid arkId,
        ResourceType resourceType,
        long delta,
        string reason,
        string actionId,
        DateTime now) =>
        db.ResourceLedger.Add(new ResourceLedgerEntity
        {
            ArkId = arkId,
            ResourceType = resourceType,
            Delta = delta,
            Reason = reason,
            ActionId = actionId,
            CreatedAtUtc = now,
        });

    private void AddReceipt<TResponse>(
        Guid playerId,
        string actionId,
        string actionType,
        TResponse response,
        DateTime now) =>
        db.ActionReceipts.Add(new ActionReceiptEntity
        {
            PlayerId = playerId,
            ActionId = actionId,
            ActionType = actionType,
            ResponseJson = JsonSerializer.Serialize(response),
            CreatedAtUtc = now,
        });

    private static bool IsValidActionId(string? actionId) =>
        !string.IsNullOrWhiteSpace(actionId) && actionId.Length <= 128;

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
}
