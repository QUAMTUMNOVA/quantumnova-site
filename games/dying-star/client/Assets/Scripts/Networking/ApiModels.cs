using System;

namespace DyingStar.Client.Networking
{
    [Serializable]
    public sealed class GuestSessionResponse
    {
        public string playerId;
        public string guestToken;
        public ArkSnapshot ark;
    }

    [Serializable]
    public sealed class ArkSnapshot
    {
        public string arkId;
        public int nexusLevel;
        public long alloy;
        public long helium3;
        public long data;
        public long nova;
        public string serverTimeUtc;
        public EconomySnapshot economy;
        public BuildingSnapshot[] buildings;
    }

    [Serializable]
    public sealed class EconomySnapshot
    {
        public long alloyStored;
        public long helium3Stored;
        public double alloyPerHour;
        public double helium3PerHour;
        public long alloyStorageCapacity;
        public long helium3StorageCapacity;
        public string lastSettledAtUtc;
    }

    [Serializable]
    public sealed class BuildingSnapshot
    {
        public string type;
        public int level;
        public string upgradeStartedAtUtc;
        public string upgradeCompletesAtUtc;
    }

    [Serializable]
    public sealed class UpgradeBuildingRequest
    {
        public string actionId;
    }

    [Serializable]
    public sealed class UpgradeBuildingResponse
    {
        public ArkSnapshot ark;
        public string building;
        public int targetLevel;
        public string upgradeCompletesAtUtc;
        public long alloySpent;
    }

    [Serializable]
    public sealed class CollectProductionRequest
    {
        public string actionId;
    }

    [Serializable]
    public sealed class CollectProductionResponse
    {
        public ArkSnapshot ark;
        public long alloyCollected;
        public long helium3Collected;
    }

    [Serializable]
    public sealed class ErrorResponse
    {
        public string code;
        public string message;
    }
}
