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
        public BuildingSnapshot[] buildings;
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
    public sealed class ErrorResponse
    {
        public string code;
        public string message;
    }
}
