using System;
using DyingStar.Client.Core;
using DyingStar.Client.Networking;
using UnityEngine;
using UnityEngine.UI;

namespace DyingStar.Client.Ark
{
    public sealed class ArkEconomyHud : MonoBehaviour
    {
        [SerializeField] private GameSession session;
        [SerializeField] private Text alloyText;
        [SerializeField] private Text heliumText;
        [SerializeField] private Text dataText;
        [SerializeField] private Text productionText;
        [SerializeField] private Text powerText;
        [SerializeField] private Button collectButton;

        private ArkSnapshot ark;
        private double snapshotRealtime;
        private float nextVisualRefresh;

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

        private void Update()
        {
            if (ark == null || Time.unscaledTime < nextVisualRefresh) return;
            nextVisualRefresh = Time.unscaledTime + 0.25f;
            RefreshLabels();
        }

        public void CollectProduction() => session?.CollectProduction();

        private void ApplyArk(ArkSnapshot snapshot)
        {
            ark = snapshot;
            snapshotRealtime = Time.realtimeSinceStartupAsDouble;
            RefreshLabels();
        }

        private void RefreshLabels()
        {
            if (ark == null) return;

            var economy = ark.economy;
            var elapsedHours = Math.Max(0d, (Time.realtimeSinceStartupAsDouble - snapshotRealtime) / 3600d);
            var alloyStored = economy == null
                ? 0d
                : Math.Min(
                    economy.alloyStorageCapacity,
                    economy.alloyStored + economy.alloyPerHour * elapsedHours);
            var heliumStored = economy == null
                ? 0d
                : Math.Min(
                    economy.helium3StorageCapacity,
                    economy.helium3Stored + economy.helium3PerHour * elapsedHours);

            if (alloyText != null)
                alloyText.text = $"ALLOY      {ark.alloy:N0}   |   READY {Math.Floor(alloyStored):N0}/{economy?.alloyStorageCapacity ?? 0:N0}";
            if (heliumText != null)
                heliumText.text = $"HELIUM-3   {ark.helium3:N0}   |   READY {Math.Floor(heliumStored):N0}/{economy?.helium3StorageCapacity ?? 0:N0}";
            if (dataText != null)
                dataText.text = $"DATA       {ark.data:N0}";
            if (productionText != null)
                productionText.text = economy == null
                    ? "PRODUCTION OFFLINE"
                    : $"PRODUCTION   +{economy.alloyPerHour:N0} Alloy/h   +{economy.helium3PerHour:N0} He-3/h";

            var reactor = FindBuilding(ark, "FusionReactor");
            var powerOnline = reactor != null && reactor.level > 0;
            if (powerText != null)
            {
                powerText.text = powerOnline ? "ARK POWER: STABLE" : "ARK POWER: OFFLINE";
                powerText.color = powerOnline
                    ? new Color(0.45f, 0.95f, 1f)
                    : new Color(1f, 0.42f, 0.38f);
            }

            if (collectButton != null)
                collectButton.interactable = alloyStored >= 1d || heliumStored >= 1d;
        }

        private static BuildingSnapshot FindBuilding(ArkSnapshot snapshot, string type)
        {
            if (snapshot?.buildings == null) return null;
            foreach (var building in snapshot.buildings)
                if (building.type == type) return building;
            return null;
        }
    }
}
