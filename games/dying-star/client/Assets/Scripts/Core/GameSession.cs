using System;
using DyingStar.Client.Networking;
using UnityEngine;

namespace DyingStar.Client.Core
{
    public sealed class GameSession : MonoBehaviour
    {
        private const string GuestTokenKey = "dyingstar.guestToken";

        [SerializeField] private DyingStarApiClient apiClient;

        private bool refreshInFlight;
        private float nextUpgradeRefreshAt;

        public ArkSnapshot CurrentArk { get; private set; }
        public bool Ready { get; private set; }
        public string GuestToken { get; private set; }

        public event Action<ArkSnapshot> ArkUpdated;
        public event Action<string> SessionError;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            if (apiClient == null) apiClient = GetComponent<DyingStarApiClient>();
        }

        private void Start()
        {
            GuestToken = PlayerPrefs.GetString(GuestTokenKey, string.Empty);
            if (string.IsNullOrWhiteSpace(GuestToken))
            {
                StartCoroutine(apiClient.CreateGuestSession(HandleGuestCreated, HandleError));
                return;
            }

            StartCoroutine(apiClient.GetArk(GuestToken, HandleArk, _ =>
            {
                PlayerPrefs.DeleteKey(GuestTokenKey);
                GuestToken = string.Empty;
                StartCoroutine(apiClient.CreateGuestSession(HandleGuestCreated, HandleError));
            }));
        }

        private void Update()
        {
            if (!Ready || refreshInFlight || Time.unscaledTime < nextUpgradeRefreshAt) return;
            if (!HasActiveUpgrade(CurrentArk)) return;

            nextUpgradeRefreshAt = Time.unscaledTime + 1f;
            RefreshArk();
        }

        public void RefreshArk()
        {
            if (refreshInFlight || string.IsNullOrWhiteSpace(GuestToken)) return;
            refreshInFlight = true;
            StartCoroutine(apiClient.GetArk(GuestToken, HandleArk, HandleError));
        }

        public void UpgradeBuilding(string buildingType)
        {
            if (!Ready || string.IsNullOrWhiteSpace(GuestToken)) return;
            var actionId = Guid.NewGuid().ToString("N");
            StartCoroutine(apiClient.UpgradeBuilding(
                GuestToken,
                buildingType,
                actionId,
                response => HandleArk(response.ark),
                HandleError));
        }

        public void CollectProduction()
        {
            if (!Ready || string.IsNullOrWhiteSpace(GuestToken)) return;
            var actionId = Guid.NewGuid().ToString("N");
            StartCoroutine(apiClient.CollectProduction(
                GuestToken,
                actionId,
                response => HandleArk(response.ark),
                HandleError));
        }

        private void HandleGuestCreated(GuestSessionResponse response)
        {
            GuestToken = response.guestToken;
            PlayerPrefs.SetString(GuestTokenKey, GuestToken);
            PlayerPrefs.Save();
            HandleArk(response.ark);
        }

        private void HandleArk(ArkSnapshot ark)
        {
            refreshInFlight = false;
            CurrentArk = ark;
            Ready = true;
            ArkUpdated?.Invoke(ark);
        }

        private void HandleError(string message)
        {
            refreshInFlight = false;
            Debug.LogError($"Dying Star API error: {message}");
            SessionError?.Invoke(message);
        }

        private static bool HasActiveUpgrade(ArkSnapshot ark)
        {
            if (ark?.buildings == null) return false;
            foreach (var building in ark.buildings)
                if (!string.IsNullOrWhiteSpace(building.upgradeCompletesAtUtc)) return true;
            return false;
        }
    }
}
