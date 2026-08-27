#if UNITY_EDITOR
using DyingStar.Client.Ark;
using DyingStar.Client.Core;
using DyingStar.Client.Networking;
using UnityEditor;
using UnityEditor.Events;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace DyingStar.Client.EditorTools
{
    public static class CreatePrototypeScene
    {
        [MenuItem("Dying Star/Create M1 Ark Prototype Scene")]
        public static void Create()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var cameraObject = new GameObject("Main Camera");
            var camera = cameraObject.AddComponent<Camera>();
            cameraObject.tag = "MainCamera";
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.003f, 0.006f, 0.012f);
            camera.fieldOfView = 48f;
            cameraObject.transform.position = new Vector3(0f, 4.5f, -14f);
            cameraObject.transform.LookAt(Vector3.zero);

            var starfield = new GameObject("Starfield");
            starfield.AddComponent<PrototypeStarfield>();

            var sessionObject = new GameObject("Game Session");
            var api = sessionObject.AddComponent<DyingStarApiClient>();
            var session = sessionObject.AddComponent<GameSession>();
            SetSerializedObjectReference(session, "apiClient", api);

            var arkRoot = new GameObject("Ark Prototype");
            var nexus = CreateModule("Nexus Core", PrimitiveType.Cylinder, Vector3.zero, new Vector3(3.1f, 1.15f, 3.1f));
            nexus.SetParent(arkRoot.transform);

            var reactor = CreateModule("Fusion Reactor", PrimitiveType.Sphere, new Vector3(-4.2f, 0f, 0f), new Vector3(1.35f, 1.35f, 1.35f));
            reactor.SetParent(arkRoot.transform);
            reactor.gameObject.SetActive(false);

            var foundry = CreateModule("Alloy Foundry", PrimitiveType.Cube, new Vector3(4.2f, 0f, 0f), new Vector3(1.8f, 1f, 2.5f));
            foundry.SetParent(arkRoot.transform);
            foundry.gameObject.SetActive(false);

            CreateRing(arkRoot.transform, 4.8f, 0.09f);
            CreateRing(arkRoot.transform, 6.1f, 0.055f).rotation = Quaternion.Euler(68f, 0f, 18f);

            var lightObject = new GameObject("Ark Power Light");
            lightObject.transform.SetParent(arkRoot.transform);
            lightObject.transform.localPosition = new Vector3(0f, 3.5f, -2f);
            var light = lightObject.AddComponent<Light>();
            light.type = LightType.Point;
            light.range = 22f;
            light.intensity = 0.45f;
            light.color = new Color(0.22f, 0.3f, 0.38f);

            var keyLightObject = new GameObject("Starlight");
            var keyLight = keyLightObject.AddComponent<Light>();
            keyLight.type = LightType.Directional;
            keyLight.intensity = 1.35f;
            keyLight.color = new Color(0.72f, 0.82f, 1f);
            keyLightObject.transform.rotation = Quaternion.Euler(32f, -38f, 0f);

            var view = arkRoot.AddComponent<ArkPrototypeView>();
            SetSerializedObjectReference(view, "session", session);
            SetSerializedObjectReference(view, "nexus", nexus);
            SetSerializedObjectReference(view, "reactor", reactor);
            SetSerializedObjectReference(view, "foundry", foundry);
            SetSerializedObjectReference(view, "arkLight", light);

            CreatePrototypeHud(view);

            const string scenePath = "Assets/Scenes/M1_ArkPrototype.unity";
            System.IO.Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, scenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(scenePath, true) };
            AssetDatabase.SaveAssets();
            Selection.activeGameObject = arkRoot;
            Debug.Log("Dying Star M1 Ark prototype scene created and added to Build Settings.");
        }

        private static Transform CreateModule(string name, PrimitiveType primitive, Vector3 position, Vector3 scale)
        {
            var gameObject = GameObject.CreatePrimitive(primitive);
            gameObject.name = name;
            gameObject.transform.position = position;
            gameObject.transform.localScale = scale;
            return gameObject.transform;
        }

        private static Transform CreateRing(Transform parent, float radius, float thickness)
        {
            var ring = GameObject.CreatePrimitive(PrimitiveType.Cylinder).transform;
            ring.name = "Structural Ring";
            ring.SetParent(parent);
            ring.localPosition = Vector3.zero;
            ring.localScale = new Vector3(radius, thickness, radius);
            return ring;
        }

        private static void CreatePrototypeHud(ArkPrototypeView view)
        {
            var canvasObject = new GameObject("Prototype HUD");
            var canvas = canvasObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObject.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasObject.AddComponent<GraphicRaycaster>();

            var title = CreateText(canvasObject.transform, "PROJECT DYING STAR  |  M1 ARK", new Vector2(30f, -30f), 23, TextAnchor.UpperLeft);
            title.rectTransform.anchorMin = new Vector2(0f, 1f);
            title.rectTransform.anchorMax = new Vector2(0f, 1f);

            CreateButton(canvasObject.transform, "RESTORE / UPGRADE REACTOR", new Vector2(30f, 110f), view.UpgradeReactor);
            CreateButton(canvasObject.transform, "RESTORE / UPGRADE FOUNDRY", new Vector2(30f, 62f), view.UpgradeFoundry);
            CreateButton(canvasObject.transform, "UPGRADE NEXUS", new Vector2(30f, 14f), view.UpgradeNexus);
        }

        private static void CreateButton(Transform parent, string label, Vector2 position, UnityEngine.Events.UnityAction onClick)
        {
            var buttonObject = new GameObject(label);
            buttonObject.transform.SetParent(parent, false);
            var image = buttonObject.AddComponent<Image>();
            image.color = new Color(0.03f, 0.08f, 0.12f, 0.9f);
            var button = buttonObject.AddComponent<Button>();
            button.targetGraphic = image;
            UnityEventTools.AddPersistentListener(button.onClick, onClick);
            var rect = buttonObject.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0f, 0f);
            rect.anchorMax = new Vector2(0f, 0f);
            rect.pivot = new Vector2(0f, 0f);
            rect.anchoredPosition = position;
            rect.sizeDelta = new Vector2(310f, 40f);

            var text = CreateText(buttonObject.transform, label, Vector2.zero, 15, TextAnchor.MiddleCenter);
            text.rectTransform.anchorMin = Vector2.zero;
            text.rectTransform.anchorMax = Vector2.one;
            text.rectTransform.offsetMin = Vector2.zero;
            text.rectTransform.offsetMax = Vector2.zero;
        }

        private static Text CreateText(Transform parent, string value, Vector2 position, int size, TextAnchor anchor)
        {
            var textObject = new GameObject("Text");
            textObject.transform.SetParent(parent, false);
            var text = textObject.AddComponent<Text>();
            text.text = value;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = size;
            text.alignment = anchor;
            text.color = new Color(0.78f, 0.95f, 1f);
            text.rectTransform.anchoredPosition = position;
            text.rectTransform.sizeDelta = new Vector2(520f, 40f);
            return text;
        }

        private static void SetSerializedObjectReference(Object target, string propertyName, Object value)
        {
            var serializedObject = new SerializedObject(target);
            serializedObject.FindProperty(propertyName).objectReferenceValue = value;
            serializedObject.ApplyModifiedPropertiesWithoutUndo();
        }
    }
}
#endif
