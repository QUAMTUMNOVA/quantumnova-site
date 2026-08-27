using UnityEngine;

namespace DyingStar.Client.Ark
{
    public sealed class PrototypeStarfield : MonoBehaviour
    {
        [SerializeField] private int starCount = 1200;
        [SerializeField] private float innerRadius = 35f;
        [SerializeField] private float outerRadius = 110f;

        private void Awake()
        {
            var system = gameObject.AddComponent<ParticleSystem>();
            var main = system.main;
            main.loop = false;
            main.playOnAwake = false;
            main.simulationSpace = ParticleSystemSimulationSpace.World;
            main.maxParticles = starCount;
            main.startLifetime = float.MaxValue;
            main.startSpeed = 0f;
            main.startSize = new ParticleSystem.MinMaxCurve(0.04f, 0.16f);
            main.startColor = new ParticleSystem.MinMaxGradient(
                new Color(0.72f, 0.88f, 1f, 0.95f),
                new Color(1f, 0.91f, 0.76f, 1f));

            var emission = system.emission;
            emission.enabled = false;

            var renderer = system.GetComponent<ParticleSystemRenderer>();
            renderer.renderMode = ParticleSystemRenderMode.Billboard;

            var particles = new ParticleSystem.Particle[starCount];
            for (var i = 0; i < particles.Length; i++)
            {
                var direction = Random.onUnitSphere;
                var radius = Mathf.Lerp(innerRadius, outerRadius, Mathf.Pow(Random.value, 0.5f));
                particles[i].position = direction * radius;
                particles[i].startLifetime = float.MaxValue;
                particles[i].remainingLifetime = float.MaxValue;
                particles[i].startSize = Random.Range(0.04f, 0.16f);
                particles[i].startColor = Color.Lerp(
                    new Color(0.62f, 0.82f, 1f, 0.95f),
                    new Color(1f, 0.93f, 0.79f, 1f),
                    Random.value);
            }

            system.SetParticles(particles, particles.Length);
        }
    }
}
