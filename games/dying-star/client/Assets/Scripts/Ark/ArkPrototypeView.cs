using DyingStar.Client.Core;
using DyingStar.Client.Networking;
using UnityEngine;

namespace DyingStar.Client.Ark
{
    public sealed class ArkPrototypeView : MonoBehaviour
    {
        [SerializeField] private GameSession session;
        [SerializeField] private Transform nexus;
        [SerializeField] private Transform reactor;
        [SerializeField] private Transform foundry;
        [SerializeField] private Light arkLight;

        private void Start()
        {
            if (session == null) session = FindFirstObjectByType<GameSession>();
            if (session == null) return;
            session.ArkUpdated += ApplyArk;
            if (session.CurrentArk != null) ApplyArk(session.CurrentArk);
        }

        private void OnDestroy()
        {
            if (session != null) session.ArkUpdated -= ApplyArk;
        }

        public void UpgradeNexus() => session?.UpgradeBuilding("NexusCore");
        public void UpgradeReactor() => session?.UpgradeBuilding("FusionReactor");
        public void UpgradeFoundry() => session?.UpgradeBuilding("AlloyFoundry");

        private void ApplyArk(ArkSnapshot ark)
        {
            ApplyBuilding(nexus, FindBuilding(ark, "NexusCore"));
            ApplyBuilding(reactor, FindBuilding(ark, "FusionReactor"));
            ApplyBuilding(foundry, FindBuilding(ark, "AlloyFoundry"));

            var reactorState = FindBuilding(ark, "FusionReactor");
            if (arkLight != null)
            {
                var online = reactorState != null && reactorState.level > 0;
                arkLight.intensity = online ? 3.5f : 0.45f;
                arkLight.color = online
                    ? new Color(0.45f, 0.95f, 1f)
                    : new Color(0.22f, 0.3f, 0.38f);
            }
        }

        private static BuildingSnapshot FindBuilding(ArkSnapshot ark, string type)
        {
            if (ark?.buildings == null) return null;
            foreach (var building in ark.buildings)
                if (building.type == type) return building;
            return null;
        }

        private static void ApplyBuilding(Transform target, BuildingSnapshot building)
        {
            if (target == null || building == null) return;
            var operational = building.level > 0;
            target.gameObject.SetActive(operational || building.type == "NexusCore");
            var scale = building.type == "NexusCore"
                ? 1f + building.level * 0.035f
                : 0.78f + building.level * 0.055f;
            target.localScale = Vector3.one * scale;
        }
    }
}
