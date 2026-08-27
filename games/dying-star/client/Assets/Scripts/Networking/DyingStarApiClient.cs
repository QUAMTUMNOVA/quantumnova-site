using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace DyingStar.Client.Networking
{
    public sealed class DyingStarApiClient : MonoBehaviour
    {
        [SerializeField] private string baseUrl = "http://localhost:5000";

        public IEnumerator CreateGuestSession(Action<GuestSessionResponse> onSuccess, Action<string> onError)
        {
            yield return SendJson("POST", "/api/v1/session/guest", "{}", null, json =>
            {
                var response = JsonUtility.FromJson<GuestSessionResponse>(json);
                onSuccess?.Invoke(response);
            }, onError);
        }

        public IEnumerator GetArk(string guestToken, Action<ArkSnapshot> onSuccess, Action<string> onError)
        {
            yield return SendJson("GET", "/api/v1/ark", null, guestToken, json =>
            {
                var response = JsonUtility.FromJson<ArkSnapshot>(json);
                onSuccess?.Invoke(response);
            }, onError);
        }

        public IEnumerator UpgradeBuilding(
            string guestToken,
            string buildingType,
            string actionId,
            Action<UpgradeBuildingResponse> onSuccess,
            Action<string> onError)
        {
            var payload = JsonUtility.ToJson(new UpgradeBuildingRequest { actionId = actionId });
            yield return SendJson(
                "POST",
                $"/api/v1/ark/buildings/{buildingType}/upgrade",
                payload,
                guestToken,
                json => onSuccess?.Invoke(JsonUtility.FromJson<UpgradeBuildingResponse>(json)),
                onError);
        }

        public IEnumerator CollectProduction(
            string guestToken,
            string actionId,
            Action<CollectProductionResponse> onSuccess,
            Action<string> onError)
        {
            var payload = JsonUtility.ToJson(new CollectProductionRequest { actionId = actionId });
            yield return SendJson(
                "POST",
                "/api/v1/ark/economy/collect",
                payload,
                guestToken,
                json => onSuccess?.Invoke(JsonUtility.FromJson<CollectProductionResponse>(json)),
                onError);
        }

        private IEnumerator SendJson(
            string method,
            string path,
            string body,
            string guestToken,
            Action<string> onSuccess,
            Action<string> onError)
        {
            using var request = new UnityWebRequest(baseUrl.TrimEnd('/') + path, method)
            {
                downloadHandler = new DownloadHandlerBuffer(),
            };

            if (!string.IsNullOrEmpty(body))
            {
                request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
                request.SetRequestHeader("Content-Type", "application/json");
            }

            if (!string.IsNullOrWhiteSpace(guestToken))
                request.SetRequestHeader("X-Player-Token", guestToken);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                onSuccess?.Invoke(request.downloadHandler.text);
                yield break;
            }

            var message = request.downloadHandler?.text;
            if (string.IsNullOrWhiteSpace(message)) message = request.error;
            onError?.Invoke(message);
        }
    }
}
