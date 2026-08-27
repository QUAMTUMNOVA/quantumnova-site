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

function createStars(count: number, innerRadius = 15, outerRadius = 57) {
  const positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = innerRadius + Math.pow(Math.random(), 0.55) * (outerRadius - innerRadius);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const warmth = Math.random();
    const intensity = 0.96 + Math.random() * 0.16;
    colours[index * 3] = Math.min(1, (0.68 + warmth * 0.32) * intensity);
    colours[index * 3 + 1] = Math.min(1, (0.8 + warmth * 0.2) * intensity);
    colours[index * 3 + 2] = Math.min(1, (0.96 + Math.random() * 0.04) * intensity);
  }

  return { positions, colours };
}

function createGalaxyCloud(count: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const arm = index % 4;
    const radius = 0.34 + Math.pow(Math.random(), 0.6) * 7.6;
    const angle = radius * 1.5 + arm * (Math.PI / 2) + (Math.random() - 0.5) * 0.66;
    const thickness = (Math.random() - 0.5) * (0.22 + radius * 0.1);

    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = thickness;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
    seeds[index] = Math.random();
  }

  return { positions, seeds };
}

const starVertexShader = `
  uniform float uSize;
  uniform float uPixelRatio;
  varying vec3 vColour;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depthScale = clamp(34.0 / max(14.0, -mvPosition.z), 0.82, 1.2);
    gl_PointSize = max(1.15, uSize * uPixelRatio * depthScale);
    gl_Position = projectionMatrix * mvPosition;
    vColour = color;
  }
`;

const starFragmentShader = `
  uniform float uOpacity;
  uniform float uCoreStrength;
  varying vec3 vColour;

  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    if (d > 0.5) discard;
    float halo = smoothstep(0.5, 0.08, d);
    float core = smoothstep(0.18, 0.0, d);
    float alpha = min(1.0, halo * 0.78 + core * 0.48) * uOpacity;
    vec3 colour = vColour * (1.0 + core * uCoreStrength);
    gl_FragColor = vec4(colour, alpha);
  }
`;

const galaxyVertexShader = `
  attribute float aSeed;
  uniform float uPixelRatio;
  uniform float uTime;
  varying float vSeed;

  void main() {
    vec3 transformed = position;
    transformed.y += sin(uTime * 0.28 + aSeed * 6.283) * 0.028;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_PointSize = (1.25 + aSeed * 2.15) * (46.0 / max(2.0, -mvPosition.z)) * uPixelRatio;
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
    float halo = smoothstep(0.5, 0.035, d);
    float core = smoothstep(0.19, 0.0, d);
    float alpha = halo * (0.3 + vSeed * 0.58) + core * 0.28;
    vec3 colour = mix(uColourA, uColourB, vSeed);
    colour *= 1.08 + core * 0.32;
    gl_FragColor = vec4(colour, alpha);
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
    let lastScrollAt = 0;
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
      const hardwareThreads = navigator.hardwareConcurrency || 4;
      const highTier = hardwareThreads >= 8;
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2("#010204", 0.0125);

      const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 90);
      camera.position.set(0, 1.2, 14.5);

      const pixelRatioCap = highTier ? 0.84 : 0.76;
      const pixelRatio = Math.min(window.devicePixelRatio, pixelRatioCap);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.22;

      const colourPairs = palettes.map(
        ([a, b]) => [new THREE.Color(a), new THREE.Color(b)] as const,
      );

      const starData = createStars(highTier ? 1550 : 1250);
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starData.positions, 3));
      starGeometry.setAttribute("color", new THREE.BufferAttribute(starData.colours, 3));
      const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uSize: { value: highTier ? 2.15 : 2.0 },
          uPixelRatio: { value: pixelRatio },
          uOpacity: { value: 0.94 },
          uCoreStrength: { value: 0.58 },
        },
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      const brightStarData = createStars(highTier ? 260 : 190, 11, 43);
      const brightStarGeometry = new THREE.BufferGeometry();
      brightStarGeometry.setAttribute("position", new THREE.BufferAttribute(brightStarData.positions, 3));
      brightStarGeometry.setAttribute("color", new THREE.BufferAttribute(brightStarData.colours, 3));
      const brightStarMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uSize: { value: highTier ? 4.4 : 4.0 },
          uPixelRatio: { value: pixelRatio },
          uOpacity: { value: 0.92 },
          uCoreStrength: { value: 1.05 },
        },
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      });
      const brightStars = new THREE.Points(brightStarGeometry, brightStarMaterial);
      scene.add(brightStars);

      const cloudData = createGalaxyCloud(highTier ? 1120 : 900);
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

      const galaxyCoreMaterial = cloudMaterial.clone();
      galaxyCoreMaterial.uniforms = {
        uPixelRatio: { value: pixelRatio },
        uTime: { value: 0 },
        uColourA: { value: colourPairs[0][0].clone() },
        uColourB: { value: colourPairs[0][1].clone() },
      };
      const galaxyCore = new THREE.Points(cloudGeometry, galaxyCoreMaterial);
      galaxyCore.scale.setScalar(0.44);
      galaxyCore.rotation.x = 1.04;
      galaxyCore.rotation.z = 0.56;
      scene.add(galaxyCore);

      const ringGroup = new THREE.Group();
      for (let index = 0; index < 4; index += 1) {
        const curve = new THREE.EllipseCurve(0, 0, 5.4 + index * 0.95, 2.6 + index * 0.44, 0, Math.PI * 2);
        const points = curve.getPoints(44).map((point) => new THREE.Vector3(point.x, point.y, 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: index % 2 ? "#7862ff" : "#88ffe4",
          transparent: true,
          opacity: index === 0 ? 0.16 : 0.105,
        });
        const line = new THREE.Line(geometry, material);
        line.rotation.x = 0.68 + index * 0.29;
        line.rotation.y = index * 0.37;
        ringGroup.add(line);
      }
      scene.add(ringGroup);

      const updateJourney = () => {
        lastScrollAt = performance.now();
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
        const activelyScrolling = timestamp - lastScrollAt < 150;
        const targetFps = activelyScrolling ? 24 : 30;
        if (lastFrame && timestamp - lastFrame < 1000 / targetFps) {
          frame = requestAnimationFrame(render);
          return;
        }

        const dt = lastFrame ? Math.min(0.08, (timestamp - lastFrame) / 1000) : 1 / targetFps;
        lastFrame = timestamp;
        const damping = reducedMotion ? 1 : 1 - Math.exp(-9 * dt);
        smoothJourney = THREE.MathUtils.lerp(smoothJourney, targetJourney, damping);

        const lower = Math.min(colourPairs.length - 1, Math.floor(smoothJourney));
        const upper = Math.min(colourPairs.length - 1, lower + 1);
        const mix = smoothJourney - lower;
        cloudUniforms.uColourA.value.copy(colourPairs[lower][0]).lerp(colourPairs[upper][0], mix);
        cloudUniforms.uColourB.value.copy(colourPairs[lower][1]).lerp(colourPairs[upper][1], mix);
        galaxyCoreMaterial.uniforms.uColourA.value.copy(colourPairs[lower][0]).lerp(colourPairs[upper][0], mix);
        galaxyCoreMaterial.uniforms.uColourB.value.copy(colourPairs[lower][1]).lerp(colourPairs[upper][1], mix);

        const time = timestamp / 1000;
        cloudUniforms.uTime.value = time;
        galaxyCoreMaterial.uniforms.uTime.value = time * 1.08;
        const travel = smoothJourney / Math.max(1, colourPairs.length - 1);
        camera.position.x = Math.sin(travel * Math.PI * 2.1) * 1.75;
        camera.position.y = 0.82 + Math.cos(travel * Math.PI * 1.5) * 0.78;
        camera.position.z = 14.25 - Math.sin(travel * Math.PI) * 1.35;
        camera.lookAt(Math.sin(travel * Math.PI * 1.7) * 0.92, 0, 0);

        if (!reducedMotion) {
          stars.rotation.y = time * 0.0019 + travel * 0.16;
          stars.rotation.x = Math.sin(time * 0.035) * 0.028;
          brightStars.rotation.y = -time * 0.0012 + travel * 0.1;
          brightStars.rotation.z = Math.sin(time * 0.05) * 0.012;
          galaxy.rotation.y = time * 0.014 + travel * 0.6;
          galaxyCore.rotation.y = -time * 0.02 + travel * 0.42;
          ringGroup.rotation.z = time * 0.003 + travel * 0.25;
        }

        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };

      const handleResize = () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        const nextRatio = Math.min(window.devicePixelRatio, pixelRatioCap);
        renderer.setPixelRatio(nextRatio);
        starMaterial.uniforms.uPixelRatio.value = nextRatio;
        brightStarMaterial.uniforms.uPixelRatio.value = nextRatio;
        cloudUniforms.uPixelRatio.value = nextRatio;
        galaxyCoreMaterial.uniforms.uPixelRatio.value = nextRatio;
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
        brightStarGeometry.dispose();
        brightStarMaterial.dispose();
        cloudGeometry.dispose();
        cloudMaterial.dispose();
        galaxyCoreMaterial.dispose();
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