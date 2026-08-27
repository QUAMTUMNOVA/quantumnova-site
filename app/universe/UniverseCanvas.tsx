"use client";

import { useEffect, useRef } from "react";

type UniverseCanvasProps = {
  onSceneChange: (scene: number) => void;
};

const sceneColours = [
  ["#72ffe0", "#6b57ff"],
  ["#8b6cff", "#c6a7ff"],
  ["#ff718c", "#9d4cff"],
  ["#35e7ff", "#3567ff"],
  ["#ffc86b", "#ff6a45"],
  ["#a8ff5b", "#42d67b"],
] as const;

const galaxyCoordinates = [
  [0, 0, 0],
  [7.2, 2.4, 2.8],
  [4.8, -1.2, -7.2],
  [-3.3, 2.4, -8.3],
  [-8.2, -1.3, -2.2],
  [-5.2, 3.1, 6.4],
] as const;

const cameraCoordinates = [
  [0, 0.1, 15.5],
  [11.7, 4.5, 8.5],
  [10.2, -1.8, -8.7],
  [-2.2, 5.4, -15.2],
  [-14.2, -2.1, -4.5],
  [-10.8, 5.7, 10.8],
] as const;

const pointVertexShader = `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uReducedMotion;
  varying float vStrength;

  void main() {
    vec3 transformed = position;
    float wave = sin(position.y * 1.7 + uTime * 0.38 + aSeed * 7.0) * 0.09;
    float breath = sin(uTime * 0.22 + aSeed * 6.283) * 0.045;
    transformed += normalize(position) * (wave + breath) * (1.0 - uReducedMotion);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    float perspective = 58.0 / max(1.0, -mvPosition.z);
    gl_PointSize = (0.82 + aSeed * 1.65) * perspective * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
    vStrength = 0.34 + aSeed * 0.66;
  }
`;

const pointFragmentShader = `
  uniform vec3 uColourA;
  uniform vec3 uColourB;
  varying float vStrength;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(centered);
    float alpha = smoothstep(0.5, 0.02, distanceToCenter);
    vec3 colour = mix(uColourA, uColourB, vStrength);
    gl_FragColor = vec4(colour, alpha * (0.22 + vStrength * 0.58));
  }
`;

function createSphereData(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / Math.max(1, count - 1)) * 2;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * index;
    const spread = Math.pow(Math.random(), 0.42);
    const shell = radius * (0.46 + spread * 1.68);
    positions[index * 3] = Math.cos(theta) * radial * shell;
    positions[index * 3 + 1] = y * shell;
    positions[index * 3 + 2] = Math.sin(theta) * radial * shell;
    seeds[index] = Math.random();
  }

  return { positions, seeds };
}

function createStarData(count: number) {
  const positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 18 + Math.pow(Math.random(), 0.55) * 55;
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    const warmth = Math.random();
    colours[index * 3] = 0.52 + warmth * 0.46;
    colours[index * 3 + 1] = 0.72 + warmth * 0.24;
    colours[index * 3 + 2] = 0.92 + Math.random() * 0.08;
  }

  return { positions, colours };
}

export default function UniverseCanvas({ onSceneChange }: UniverseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneCallback = useRef(onSceneChange);

  useEffect(() => {
    sceneCallback.current = onSceneChange;
  }, [onSceneChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const compact = window.matchMedia("(max-width: 760px)").matches;
    if (compact) {
      document.documentElement.classList.add("universe-mobile-lite");
      return () => {
        document.documentElement.classList.remove("universe-mobile-lite");
      };
    }

    let disposed = false;
    let teardown = () => {};

    const startUniverse = async () => {
      const THREE = await import("three");
      if (disposed) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2("#020509", compact ? 0.018 : 0.011);

      const camera = new THREE.PerspectiveCamera(
        compact ? 56 : 46,
        window.innerWidth / window.innerHeight,
        0.1,
        120,
      );
      const cameraAnchors = cameraCoordinates.map(
        ([x, y, z]) => new THREE.Vector3(x, y, z),
      );
      const cameraPath = new THREE.CatmullRomCurve3(cameraAnchors, false, "catmullrom", 0.38);
      const galaxyTargets = galaxyCoordinates.map(
        ([x, y, z]) => new THREE.Vector3(x, y, z),
      );
      camera.position.copy(cameraAnchors[0]);

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: !compact,
          precision: compact ? "mediump" : "highp",
          powerPreference: "high-performance",
        });
      } catch {
        document.documentElement.classList.add("universe-no-webgl");
        return;
      }

      const maxPixelRatio = compact ? 0.85 : 1.35;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;

      const palettes = sceneColours.map(
        ([first, second]) => [new THREE.Color(first), new THREE.Color(second)] as const,
      );

      const universeGroup = new THREE.Group();
      scene.add(universeGroup);

      const sphereData = createSphereData(compact ? 1200 : 5600, compact ? 4.1 : 4.85);
      const sphereGeometry = new THREE.BufferGeometry();
      sphereGeometry.setAttribute("position", new THREE.BufferAttribute(sphereData.positions, 3));
      sphereGeometry.setAttribute("aSeed", new THREE.BufferAttribute(sphereData.seeds, 1));
      const sphereUniforms = {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, maxPixelRatio) },
        uReducedMotion: { value: reducedMotion ? 1 : 0 },
        uColourA: { value: palettes[0][0].clone() },
        uColourB: { value: palettes[0][1].clone() },
      };
      const sphereMaterial = new THREE.ShaderMaterial({
        uniforms: sphereUniforms,
        vertexShader: pointVertexShader,
        fragmentShader: pointFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const particleSphere = new THREE.Points(sphereGeometry, sphereMaterial);
      universeGroup.add(particleSphere);

      const starData = createStarData(compact ? 900 : 4300);
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starData.positions, 3));
      starGeometry.setAttribute("color", new THREE.BufferAttribute(starData.colours, 3));
      const starMaterial = new THREE.PointsMaterial({
        size: compact ? 0.03 : 0.044,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      const orbitalMaterial = new THREE.LineBasicMaterial({
        color: "#78ffe2",
        transparent: true,
        opacity: 0.15,
      });
      const orbitalLines: import("three").Line[] = [];
      const orbitalLineCount = compact ? 4 : 6;
      for (let index = 0; index < orbitalLineCount; index += 1) {
        const curve = new THREE.EllipseCurve(
          0,
          0,
          5.5 + index * 0.82,
          3.6 + index * 0.48,
          0,
          Math.PI * 2,
        );
        const points = curve.getPoints(compact ? 56 : 96).map((point) => new THREE.Vector3(point.x, point.y, 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, orbitalMaterial.clone());
        line.rotation.x = 0.86 + index * 0.08;
        line.rotation.y = index * 0.43;
        universeGroup.add(line);
        orbitalLines.push(line);
      }

      const galaxyGroups: Array<{
        group: import("three").Group;
        materials: import("three").Material[];
      }> = [];
      galaxyTargets.forEach((coordinate, sceneIndex) => {
        if (sceneIndex === 0) return;
        const group = new THREE.Group();
        group.position.copy(coordinate);
        const materials: import("three").Material[] = [];
        const palette = palettes[sceneIndex];

        const portalMaterial = new THREE.MeshBasicMaterial({
          color: palette[0],
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const portal = new THREE.Mesh(
          new THREE.TorusGeometry(0.82, 0.018, 6, compact ? 40 : 72),
          portalMaterial,
        );
        portal.rotation.x = Math.PI / 2;
        group.add(portal);
        materials.push(portalMaterial);

        const nodeMaterial = new THREE.MeshPhysicalMaterial({
          color: "#07101a",
          emissive: palette[1],
          emissiveIntensity: 0.85,
          roughness: 0.2,
          metalness: 0.45,
          transparent: true,
          opacity: 0.65,
        });
        const node = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.3 + sceneIndex * 0.025, 1),
          nodeMaterial,
        );
        group.add(node);
        materials.push(nodeMaterial);

        const galaxyRingCount = compact ? 2 : 3;
        for (let ringIndex = 0; ringIndex < galaxyRingCount; ringIndex += 1) {
          const ringMaterial = new THREE.MeshBasicMaterial({
            color: ringIndex % 2 ? palette[1] : palette[0],
            transparent: true,
            opacity: 0.14,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.25 + ringIndex * 0.5, 0.008, 5, compact ? 40 : 64),
            ringMaterial,
          );
          ring.rotation.x = 0.7 + ringIndex * 0.42;
          ring.rotation.y = sceneIndex * 0.27 + ringIndex * 0.31;
          group.add(ring);
          materials.push(ringMaterial);
        }

        scene.add(group);
        galaxyGroups.push({ group, materials });
      });

      const pointer = new THREE.Vector2();
      const pointerTarget = new THREE.Vector2();
      const smoothCameraPosition = new THREE.Vector3().copy(cameraAnchors[0]);
      const smoothLookTarget = new THREE.Vector3();
      const desiredCamera = new THREE.Vector3();
      const desiredTarget = new THREE.Vector3();
      const clock = new THREE.Clock();
      let targetJourney = 0;
      let smoothJourney = 0;
      let activeScene = 0;
      let frame = 0;
      let journeyFrame = 0;
      let resizeFrame = 0;
      let lastRenderedAt = 0;
      let renderWidth = window.innerWidth;
      let renderHeight = window.innerHeight;
      let pageVisible = true;

      const calculateJourney = () => {
        const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-universe-scene]"));
        if (!chapters.length) return;
        const focusLine = window.scrollY + window.innerHeight * 0.5;
        const centers = chapters.map((chapter) => chapter.offsetTop + chapter.offsetHeight * 0.5);
        let journey = 0;

        if (focusLine <= centers[0]) {
          journey = 0;
        } else if (focusLine >= centers[centers.length - 1]) {
          journey = centers.length - 1;
        } else {
          for (let index = 0; index < centers.length - 1; index += 1) {
            if (focusLine >= centers[index] && focusLine <= centers[index + 1]) {
              const local = (focusLine - centers[index]) / Math.max(1, centers[index + 1] - centers[index]);
              const eased = local * local * (3 - 2 * local);
              journey = index + eased;
              break;
            }
          }
        }

        targetJourney = THREE.MathUtils.clamp(journey, 0, galaxyTargets.length - 1);
        const nextActive = Math.round(targetJourney);
        if (nextActive !== activeScene) {
          activeScene = nextActive;
          sceneCallback.current(nextActive);
        }
        document.documentElement.style.setProperty(
          "--universe-progress",
          `${targetJourney / Math.max(1, galaxyTargets.length - 1)}`,
        );
      };

      const handlePointer = (event: PointerEvent) => {
        if (event.pointerType === "touch" || reducedMotion) return;
        pointerTarget.set(
          event.clientX / window.innerWidth - 0.5,
          -(event.clientY / window.innerHeight - 0.5),
        );
      };

      const handleResize = () => {
        const nextWidth = window.innerWidth;
        const nextHeight = window.innerHeight;
        camera.aspect = nextWidth / nextHeight;
        camera.fov = nextWidth <= 760 ? 56 : 46;
        camera.updateProjectionMatrix();
        const pixelRatio = Math.min(
          window.devicePixelRatio,
          nextWidth <= 760 ? 0.85 : 1.35,
        );

        // Mobile browser chrome changes the viewport height while scrolling.
        // Reallocating the WebGL buffer for each of those height-only changes
        // stalls the background, so compact screens resize it only when the
        // width changes, such as during an orientation change.
        const needsBufferResize = !compact || nextWidth !== renderWidth;
        if (needsBufferResize) {
          renderer.setPixelRatio(pixelRatio);
          sphereUniforms.uPixelRatio.value = pixelRatio;
          renderer.setSize(nextWidth, nextHeight, false);
          renderWidth = nextWidth;
          renderHeight = nextHeight;
        } else if (nextHeight !== renderHeight) {
          renderHeight = nextHeight;
        }
        calculateJourney();
      };

      const scheduleResize = () => {
        if (resizeFrame) return;
        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = 0;
          handleResize();
        });
      };

      const handleVisibility = () => {
        pageVisible = !document.hidden;
        if (pageVisible && !frame) frame = window.requestAnimationFrame(render);
      };

      const render = (timestamp = 0) => {
        frame = 0;
        if (!pageVisible || disposed) return;

        // A stable 30 fps mobile render is visibly smoother than an attempted
        // 60 fps loop that repeatedly misses frames under fast touch scrolling.
        if (compact && lastRenderedAt && timestamp - lastRenderedAt < 1000 / 30) {
          frame = window.requestAnimationFrame(render);
          return;
        }

        const deltaSeconds = lastRenderedAt
          ? Math.min(0.12, Math.max(0.001, (timestamp - lastRenderedAt) / 1000))
          : 1 / 60;
        lastRenderedAt = timestamp;
        const elapsed = clock.getElapsedTime();
        const damping = reducedMotion
          ? 0.16
          : compact
            ? 1 - Math.exp(-8.5 * deltaSeconds)
            : 0.045;
        smoothJourney = THREE.MathUtils.lerp(smoothJourney, targetJourney, damping);
        const pathProgress = smoothJourney / Math.max(1, galaxyTargets.length - 1);
        cameraPath.getPoint(THREE.MathUtils.clamp(pathProgress, 0, 1), desiredCamera);

        const lowerScene = Math.min(galaxyTargets.length - 1, Math.floor(smoothJourney));
        const upperScene = Math.min(galaxyTargets.length - 1, lowerScene + 1);
        const sceneMix = smoothJourney - lowerScene;
        desiredTarget
          .copy(galaxyTargets[lowerScene])
          .lerp(galaxyTargets[upperScene], sceneMix);

        pointer.lerp(pointerTarget, reducedMotion ? 0.1 : 0.035);
        desiredCamera.x += pointer.x * (compact ? 0.35 : 0.72);
        desiredCamera.y += pointer.y * (compact ? 0.2 : 0.46);
        const cameraDamping = reducedMotion
          ? 0.18
          : compact
            ? 1 - Math.exp(-10 * deltaSeconds)
            : 0.07;
        const targetDamping = reducedMotion
          ? 0.2
          : compact
            ? 1 - Math.exp(-11 * deltaSeconds)
            : 0.075;
        smoothCameraPosition.lerp(desiredCamera, cameraDamping);
        smoothLookTarget.lerp(desiredTarget, targetDamping);
        camera.position.copy(smoothCameraPosition);
        camera.lookAt(smoothLookTarget);
        if (!reducedMotion) camera.rotateZ(Math.sin(pathProgress * Math.PI * 3) * 0.012);

        sphereUniforms.uTime.value = elapsed;
        sphereUniforms.uColourA.value
          .copy(palettes[lowerScene][0])
          .lerp(palettes[upperScene][0], sceneMix);
        sphereUniforms.uColourB.value
          .copy(palettes[lowerScene][1])
          .lerp(palettes[upperScene][1], sceneMix);
        universeGroup.rotation.y = reducedMotion ? 0.1 : elapsed * 0.012;
        universeGroup.rotation.x = Math.sin(elapsed * 0.08) * 0.025;
        particleSphere.rotation.y = reducedMotion ? 0 : elapsed * 0.018;
        stars.rotation.y = reducedMotion ? 0 : elapsed * 0.0018;

        orbitalLines.forEach((line, index) => {
          line.rotation.z = (reducedMotion ? 0 : elapsed * (0.003 + index * 0.0005)) + index * 0.24;
        });

        galaxyGroups.forEach(({ group, materials }, arrayIndex) => {
          const sceneIndex = arrayIndex + 1;
          const focus = Math.max(0, 1 - Math.abs(smoothJourney - sceneIndex) / 1.35);
          const scale = 0.8 + focus * 0.52;
          group.scale.setScalar(scale);
          group.rotation.y = reducedMotion ? sceneIndex * 0.2 : elapsed * (0.045 + sceneIndex * 0.006);
          group.rotation.z = reducedMotion ? 0 : Math.sin(elapsed * 0.18 + sceneIndex) * 0.08;
          materials.forEach((material) => {
            if ("opacity" in material) {
              const base = material instanceof THREE.MeshPhysicalMaterial ? 0.36 : 0.08;
              material.opacity = base + focus * (material instanceof THREE.MeshPhysicalMaterial ? 0.42 : 0.24);
            }
          });
        });

        renderer.render(scene, camera);
        if (!reducedMotion || Math.abs(smoothJourney - targetJourney) > 0.001) {
          frame = window.requestAnimationFrame(render);
        }
      };

      const scheduleJourney = () => {
        if (journeyFrame) return;
        journeyFrame = window.requestAnimationFrame(() => {
          journeyFrame = 0;
          calculateJourney();
          if (!frame) frame = window.requestAnimationFrame(render);
        });
      };

      calculateJourney();
      window.addEventListener("scroll", scheduleJourney, { passive: true });
      window.addEventListener("pointermove", handlePointer, { passive: true });
      window.addEventListener("resize", scheduleResize);
      document.addEventListener("visibilitychange", handleVisibility);
      frame = window.requestAnimationFrame(render);

      teardown = () => {
        if (frame) window.cancelAnimationFrame(frame);
        if (journeyFrame) window.cancelAnimationFrame(journeyFrame);
        if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
        window.removeEventListener("scroll", scheduleJourney);
        window.removeEventListener("pointermove", handlePointer);
        window.removeEventListener("resize", scheduleResize);
        document.removeEventListener("visibilitychange", handleVisibility);
        sphereGeometry.dispose();
        sphereMaterial.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
        orbitalLines.forEach((line) => {
          line.geometry.dispose();
          if (line.material instanceof THREE.Material) line.material.dispose();
        });
        galaxyGroups.forEach(({ group }) => {
          group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
              else object.material.dispose();
            }
          });
        });
        renderer.dispose();
      };
    };

    const startFrame = window.requestAnimationFrame(() => {
      void startUniverse();
    });
    return () => {
      disposed = true;
      window.cancelAnimationFrame(startFrame);
      teardown();
    };
  }, []);

  return <canvas ref={canvasRef} className="universe-canvas" aria-hidden="true" />;
}