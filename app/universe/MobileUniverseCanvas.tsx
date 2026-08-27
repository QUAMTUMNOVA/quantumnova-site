"use client";

import { useEffect, useRef } from "react";

const palettes = [
  ["#72ffe0", "#6b57ff"],
  ["#75f7ff", "#7567ff"],
  ["#ff718c", "#9d4cff"],
  ["#35e7ff", "#3567ff"],
  ["#ffc86b", "#ff6a45"],
  ["#ac87ff", "#6fffdc"],
] as const;

function createStars(count: number) {
  const positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 15 + Math.pow(Math.random(), 0.55) * 42;
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const warmth = Math.random();
    colours[index * 3] = 0.58 + warmth * 0.38;
    colours[index * 3 + 1] = 0.72 + warmth * 0.24;
    colours[index * 3 + 2] = 0.9 + Math.random() * 0.1;
  }

  return { positions, colours };
}

function createGalaxyCloud(count: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const arm = index % 3;
    const radius = 0.8 + Math.pow(Math.random(), 0.58) * 7.2;
    const angle = radius * 1.45 + arm * ((Math.PI * 2) / 3) + (Math.random() - 0.5) * 0.72;
    const thickness = (Math.random() - 0.5) * (0.3 + radius * 0.12);

    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = thickness;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
    seeds[index] = Math.random();
  }

  return { positions, seeds };
}

const galaxyVertexShader = `
  attribute float aSeed;
  uniform float uPixelRatio;
  uniform float uTime;
  varying float vSeed;

  void main() {
    vec3 transformed = position;
    transformed.y += sin(uTime * 0.28 + aSeed * 6.283) * 0.025;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_PointSize = (1.0 + aSeed * 1.7) * (42.0 / max(2.0, -mvPosition.z)) * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
    vSeed = aSeed;
  }
`;

const galaxyFragmentShader = `
  uniform vec3 uColourA;
  uniform vec3 uColourB;
  varying float vSeed;

  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    float alpha = smoothstep(0.5, 0.02, d);
    vec3 colour = mix(uColourA, uColourB, vSeed);
    gl_FragColor = vec4(colour, alpha * (0.2 + vSeed * 0.5));
  }
`;

export default function MobileUniverseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let frame = 0;
    let resizeFrame = 0;
    let lastFrame = 0;
    let targetJourney = 0;
    let smoothJourney = 0;
    let lastWidth = window.innerWidth;

    const start = async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          precision: "mediump",
          powerPreference: "high-performance",
        });
      } catch {
        canvas.classList.add("unavailable");
        return;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2("#010204", 0.014);

      const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 90);
      camera.position.set(0, 1.2, 14.5);

      const pixelRatio = Math.min(window.devicePixelRatio, 0.78);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const colourPairs = palettes.map(
        ([a, b]) => [new THREE.Color(a), new THREE.Color(b)] as const,
      );

      const starData = createStars(1050);
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starData.positions, 3));
      starGeometry.setAttribute("color", new THREE.BufferAttribute(starData.colours, 3));
      const starMaterial = new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      const cloudData = createGalaxyCloud(720);
      const cloudGeometry = new THREE.BufferGeometry();
      cloudGeometry.setAttribute("position", new THREE.BufferAttribute(cloudData.positions, 3));
      cloudGeometry.setAttribute("aSeed", new THREE.BufferAttribute(cloudData.seeds, 1));
      const cloudUniforms = {
        uPixelRatio: { value: pixelRatio },
        uTime: { value: 0 },
        uColourA: { value: colourPairs[0][0].clone() },
        uColourB: { value: colourPairs[0][1].clone() },
      };
      const cloudMaterial = new THREE.ShaderMaterial({
        uniforms: cloudUniforms,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const galaxy = new THREE.Points(cloudGeometry, cloudMaterial);
      galaxy.rotation.x = 0.92;
      galaxy.rotation.z = -0.18;
      scene.add(galaxy);

      const ringGroup = new THREE.Group();
      for (let index = 0; index < 3; index += 1) {
        const curve = new THREE.EllipseCurve(0, 0, 5.8 + index * 1.05, 2.8 + index * 0.48, 0, Math.PI * 2);
        const points = curve.getPoints(42).map((point) => new THREE.Vector3(point.x, point.y, 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: index === 1 ? "#7862ff" : "#88ffe4",
          transparent: true,
          opacity: 0.085,
        });
        const line = new THREE.Line(geometry, material);
        line.rotation.x = 0.7 + index * 0.36;
        line.rotation.y = index * 0.42;
        ringGroup.add(line);
      }
      scene.add(ringGroup);

      const updateJourney = () => {
        const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-universe-scene]"));
        if (!chapters.length) return;
        const focus = window.scrollY + window.innerHeight * 0.5;
        const centres = chapters.map((chapter) => chapter.offsetTop + chapter.offsetHeight * 0.5);

        if (focus <= centres[0]) {
          targetJourney = 0;
          return;
        }
        if (focus >= centres[centres.length - 1]) {
          targetJourney = centres.length - 1;
          return;
        }

        for (let index = 0; index < centres.length - 1; index += 1) {
          if (focus < centres[index] || focus > centres[index + 1]) continue;
          const local = (focus - centres[index]) / Math.max(1, centres[index + 1] - centres[index]);
          targetJourney = index + local * local * (3 - 2 * local);
          break;
        }
      };

      const render = (timestamp: number) => {
        if (disposed) return;
        if (lastFrame && timestamp - lastFrame < 1000 / 30) {
          frame = requestAnimationFrame(render);
          return;
        }

        const dt = lastFrame ? Math.min(0.08, (timestamp - lastFrame) / 1000) : 1 / 30;
        lastFrame = timestamp;
        const damping = reducedMotion ? 1 : 1 - Math.exp(-9 * dt);
        smoothJourney = THREE.MathUtils.lerp(smoothJourney, targetJourney, damping);

        const lower = Math.min(colourPairs.length - 1, Math.floor(smoothJourney));
        const upper = Math.min(colourPairs.length - 1, lower + 1);
        const mix = smoothJourney - lower;
        cloudUniforms.uColourA.value.copy(colourPairs[lower][0]).lerp(colourPairs[upper][0], mix);
        cloudUniforms.uColourB.value.copy(colourPairs[lower][1]).lerp(colourPairs[upper][1], mix);

        const time = timestamp / 1000;
        cloudUniforms.uTime.value = time;
        const travel = smoothJourney / Math.max(1, colourPairs.length - 1);
        camera.position.x = Math.sin(travel * Math.PI * 2.1) * 1.65;
        camera.position.y = 0.8 + Math.cos(travel * Math.PI * 1.5) * 0.72;
        camera.position.z = 14.4 - Math.sin(travel * Math.PI) * 1.2;
        camera.lookAt(Math.sin(travel * Math.PI * 1.7) * 0.8, 0, 0);

        if (!reducedMotion) {
          stars.rotation.y = time * 0.0017 + travel * 0.14;
          stars.rotation.x = Math.sin(time * 0.035) * 0.025;
          galaxy.rotation.y = time * 0.012 + travel * 0.55;
          ringGroup.rotation.z = time * 0.0025 + travel * 0.22;
        }

        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };

      const handleResize = () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        const nextRatio = Math.min(window.devicePixelRatio, 0.78);
        renderer.setPixelRatio(nextRatio);
        cloudUniforms.uPixelRatio.value = nextRatio;
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        updateJourney();
      };

      const scheduleResize = () => {
        if (resizeFrame) return;
        resizeFrame = requestAnimationFrame(() => {
          resizeFrame = 0;
          handleResize();
        });
      };

      updateJourney();
      window.addEventListener("scroll", updateJourney, { passive: true });
      window.addEventListener("resize", scheduleResize, { passive: true });
      frame = requestAnimationFrame(render);

      return () => {
        window.removeEventListener("scroll", updateJourney);
        window.removeEventListener("resize", scheduleResize);
        cancelAnimationFrame(frame);
        cancelAnimationFrame(resizeFrame);
        starGeometry.dispose();
        starMaterial.dispose();
        cloudGeometry.dispose();
        cloudMaterial.dispose();
        ringGroup.traverse((object) => {
          if (object instanceof THREE.Line) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) object.material.dispose();
          }
        });
        renderer.dispose();
      };
    };

    let cleanup: (() => void) | undefined;
    void start().then((teardown) => {
      cleanup = teardown;
    });

    return () => {
      disposed = true;
      cleanup?.();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="universe-mobile-webgl" aria-hidden="true" />;
}
