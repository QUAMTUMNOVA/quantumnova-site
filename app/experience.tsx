"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  autobookpressCatalog,
  type AutoBookPressTitle,
} from "@/app/data/autobookpress";
import { pixionyxFallback, type PixiLook } from "@/app/data/pixionyx";

const playlists = [
  {
    id: "77amCwJSWddkeG3VYB1S0Q",
    title: "Quantumnova Records MasterMix",
    eyebrow: "Official label catalogue",
    detail: "The complete QUANTUMNOVA Records listening portal",
    cover:
      "https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da8486f6a4711158880e56f40047",
  },
  {
    id: "3xHkUQgr5dyGHTAhTxU9fZ",
    title: "Funk/Soul",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Groove, warmth and movement",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e0203ff3966f03b4d929e30a54aab67616d00001e024db839d32ee987e5b49a1272ab67616d00001e02a14b08b9a6616e121df5e8b0ab67616d00001e02bb165e8b821025425e9dabef",
  },
  {
    id: "4kzGOC1AxOATwBW0v7KeN0",
    title: "Electronic",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Signals, circuits and after-hours energy",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e02128c4a8f4206647330e130b4ab67616d00001e021c8eb7bf34c1123a6de45470ab67616d00001e026e6b4e89ee5fb22a3c11c114ab67616d00001e02c1b47997d8cb0bfd1ec946a8",
  },
  {
    id: "3KhHEwNcG0sCeWHZaRSMHv",
    title: "Pop",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Hooks, colour and widescreen feeling",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e0205029be1f928f2ea9902f0a5ab67616d00001e022c70242c80b76e7017b2f40fab67616d00001e022d47d820f90edde0737b93f4ab67616d00001e024db839d32ee987e5b49a1272",
  },
  {
    id: "11p4UbOKhsGP8mAltS4UOb",
    title: "Rock/Metal",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Weight, texture and catharsis",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e0205029be1f928f2ea9902f0a5ab67616d00001e021a911e2b352e33756c5ac486ab67616d00001e0276992aff19f6bb74be776974ab67616d00001e02c1b47997d8cb0bfd1ec946a8",
  },
  {
    id: "73VBuSYjOf8tcEG4Bqv7Qq",
    title: "Rap/Hip-Hop",
    eyebrow: "Curated by QUANTUMNOVA",
    detail: "Voice, rhythm and forward pressure",
    cover:
      "https://mosaic.scdn.co/300/ab67616d00001e0260f68ed22ec416583eef5076ab67616d00001e02b68239b8cba1057ff92621dfab67616d00001e02d4eca2c8295d769b9cea859aab67616d00001e02fb8f48a20f9670f9d35690b6",
  },
];

const artists = [
  { name: "The Quiet Violence", release: "Destroy Them All", cover: "/artists/the-quiet-violence.png", spotify: "03LSnrm9vgn8a4Df091wGX" },
  { name: "Nico Lume", release: "Turn A Little To A Lot", cover: "/artists/nico-lume.png", spotify: "1N4pfpwDvKPeqE5LteHF1O" },
  { name: "Resoniq", release: "After Hours", cover: "/artists/resoniq.png", spotify: "3cW8GtnGzub3MKkkzeP9VY" },
  { name: "Trey Vorn", release: "Keep It Moving", cover: "/artists/trey-vorn.png", spotify: "7C1LRLFo4Dib5inSc18BL8" },
  { name: "Gravenyx", release: "Lit Forever", cover: "/artists/gravenyx.png", spotify: "7wZ99XilbmzGSgOiigd0Qy" },
  { name: "Sylvie Knox", release: "Auralicious", cover: "/artists/sylvie-knox.png", spotify: "433rbErBjfvbl2VODqNoP1" },
  { name: "Darius Creed", release: "Own The Sky", cover: "/artists/darius-creed.png", spotify: "4wpexPaBdC9vWfDXSnW3ca" },
  { name: "Sanguira", release: "Echoes Of Aether", cover: "/artists/sanguira.png", spotify: "72o1LWmCp60Irn8pygPCmD" },
  { name: "Soul Carnival", release: "Jingle Bells", cover: "/artists/soul-carnival.png", spotify: "5362XOY9NdvdcuXBxaZLKk" },
  { name: "Bury The Cure", release: "Nothing Left To Bury", cover: "/artists/bury-the-cure.png", spotify: "3RihVf3ccXdnSXFegOMGRq" },
];

const capabilities = [
  { title: "Immersive UI", copy: "A cinematic interface shaped around the brand, its audience and the action the experience needs to create." },
  { title: "3D Product Worlds", copy: "Interactive objects, product storytelling and spatial systems designed to make offers tangible before purchase." },
  { title: "Motion Systems", copy: "Purposeful movement, transitions and scroll choreography that turn the entire site into one coherent world." },
  { title: "Technical Delivery", copy: "Production engineering, accessibility, responsive behaviour, analytics, technical SEO and performance control." },
];

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

function circularDelta(index: number, active: number, length: number) {
  let delta = index - active;
  if (delta > length / 2) delta -= length;
  if (delta < -length / 2) delta += length;
  return delta;
}

function ringStyle(index: number, active: number, length: number, radius: number, depth: number) {
  const delta = circularDelta(index, active, length);
  const slotCount = Math.min(length, 10);
  const halfSlots = Math.floor(slotCount / 2);
  const hidden = Math.abs(delta) > halfSlots;
  const angle = Math.max(-halfSlots, Math.min(halfSlots, delta)) * ((Math.PI * 2) / slotCount);
  const visibility = (Math.cos(angle) + 1) / 2;
  return {
    "--ring-x": `${(Math.sin(angle) * radius).toFixed(2)}px`,
    "--ring-z": `${(Math.cos(angle) * depth).toFixed(2)}px`,
    "--ring-x-mobile": `${(Math.sin(angle) * radius * 0.64).toFixed(2)}px`,
    "--ring-z-mobile": `${(Math.cos(angle) * depth * 1.25).toFixed(2)}px`,
    "--ring-turn": `${(-Math.sin(angle) * 34).toFixed(2)}deg`,
    "--ring-scale": (0.62 + visibility * 0.38).toFixed(3),
    "--ring-distance": Math.abs(delta),
    opacity: hidden ? "0" : Math.max(0.08, Math.pow(visibility, 1.35)).toFixed(3),
    zIndex: Math.round(visibility * 100),
    pointerEvents: hidden || visibility < 0.13 ? "none" : "auto",
  } as CSSProperties;
}

function useDragWheel(onPrevious: () => void, onNext: () => void) {
  const gesture = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    travel: 0,
    dragged: false,
  });
  const blockClickUntil = useRef(0);

  const reset = () => {
    gesture.current.pointerId = -1;
    gesture.current.travel = 0;
    gesture.current.dragged = false;
  };

  return {
    bind: {
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        gesture.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          lastX: event.clientX,
          travel: 0,
          dragged: false,
        };
      },
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
        if (gesture.current.pointerId !== event.pointerId) return;
        const totalX = event.clientX - gesture.current.startX;
        const totalY = event.clientY - gesture.current.startY;
        const stepX = event.clientX - gesture.current.lastX;
        gesture.current.lastX = event.clientX;

        if (
          !gesture.current.dragged &&
          Math.abs(totalX) > 8 &&
          Math.abs(totalX) > Math.abs(totalY)
        ) {
          gesture.current.dragged = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (!gesture.current.dragged) return;

        event.preventDefault();
        gesture.current.travel += stepX;
        while (Math.abs(gesture.current.travel) >= 58) {
          if (gesture.current.travel < 0) onNext();
          else onPrevious();
          gesture.current.travel += gesture.current.travel < 0 ? 58 : -58;
        }
      },
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
        if (gesture.current.pointerId !== event.pointerId) return;
        if (gesture.current.dragged) blockClickUntil.current = performance.now() + 240;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        reset();
      },
      onPointerCancel: reset,
    },
    allowClick: () => performance.now() > blockClickUntil.current,
  };
}

function WheelScrubber({
  label,
  value,
  length,
  onChange,
}: {
  label: string;
  value: number;
  length: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="wheel-scrubber">
      <span>{label}</span>
      <input
        type="range"
        min="0"
        max={Math.max(0, length - 1)}
        value={value}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        aria-label={label}
      />
      <output>{String(value + 1).padStart(2, "0")} / {String(length).padStart(2, "0")}</output>
    </label>
  );
}

function useChapterTransitions() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chapters = Array.from(document.querySelectorAll<HTMLElement>(".chapter"));
    chapters.forEach((chapter) => {
      const bounds = chapter.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 0.86 && bounds.bottom > 0) {
        chapter.classList.add("chapter-visible");
      }
    });
    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("chapter-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );
    chapters.forEach((chapter) => observer.observe(chapter));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
}

const paletteHex = [
  ["#8fffe5", "#7557ff"],
  ["#52ffba", "#3c8cff"],
  ["#ff5268", "#ff41cb"],
  ["#35e7ff", "#7b61ff"],
  ["#ffc970", "#a66dff"],
];

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function randomSphere(random: () => number, radius = 2) {
  const theta = random() * Math.PI * 2;
  const u = random() * 2 - 1;
  const r = radius * Math.cbrt(0.42 + random() * 0.58);
  const s = Math.sqrt(1 - u * u);
  return [r * s * Math.cos(theta), r * u, r * s * Math.sin(theta)];
}

function fashionPoint(random: () => number) {
  const choice = random();
  if (choice < 0.13) {
    const [x, y, z] = randomSphere(random, 0.36);
    return [x, y + 1.83, z];
  }
  if (choice < 0.56) {
    const y = -0.18 + random() * 1.65;
    const waist = 0.29 + Math.abs(y - 0.48) * 0.18;
    const angle = random() * Math.PI * 2;
    return [Math.cos(angle) * waist, y, Math.sin(angle) * waist * 0.55];
  }
  if (choice < 0.82) {
    const side = random() > 0.5 ? 1 : -1;
    const y = -1.9 + random() * 1.75;
    const angle = random() * Math.PI * 2;
    return [side * (0.17 + (y + 1.9) * 0.06) + Math.cos(angle) * 0.09, y, Math.sin(angle) * 0.09];
  }
  const side = random() > 0.5 ? 1 : -1;
  const t = random();
  const angle = random() * Math.PI * 2;
  return [side * (0.46 + t * 0.56) + Math.cos(angle) * 0.07, 1.15 - t * 1.42, Math.sin(angle) * 0.07];
}

function recordPoint(random: () => number) {
  const theta = random() * Math.PI * 12;
  const band = 1.05 + Math.sin(theta * 2.2) * 0.28 + (random() - 0.5) * 0.24;
  return [Math.cos(theta) * band, (random() - 0.5) * 2.8 + Math.sin(theta * 0.5) * 0.25, Math.sin(theta) * band];
}

function boxPoint(random: () => number, index: number) {
  const columns = [-1.25, -0.62, 0, 0.66, 1.25];
  const x0 = columns[index % columns.length];
  const y0 = (index % 2 === 0 ? 0.32 : -0.3) + (random() - 0.5) * 0.12;
  const z0 = ((index % 3) - 1) * 0.38;
  const x = x0 + (random() - 0.5) * 0.48;
  const y = y0 + (random() - 0.5) * 2.35;
  const z = z0 + (random() - 0.5) * 0.22;
  const face = Math.floor(random() * 3);
  if (face === 0) return [x0 + (random() > 0.5 ? 0.24 : -0.24), y, z];
  if (face === 1) return [x, y0 + (random() > 0.5 ? 1.18 : -1.18), z];
  return [x, y, z0 + (random() > 0.5 ? 0.11 : -0.11)];
}

function networkPoint(random: () => number) {
  const theta = random() * Math.PI * 2;
  const phi = Math.acos(2 * random() - 1);
  const radius = 1.15 + Math.floor(random() * 4) * 0.48 + (random() - 0.5) * 0.08;
  return [radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)];
}

function buildParticleGeometry(THREE: typeof import("three"), count: number) {
  const random = seededRandom(91377);
  const hero = new Float32Array(count * 3);
  const network = new Float32Array(count * 3);
  const fashion = new Float32Array(count * 3);
  const records = new Float32Array(count * 3);
  const bookShape = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    hero.set(randomSphere(random, 2.05), offset);
    network.set(networkPoint(random), offset);
    fashion.set(fashionPoint(random), offset);
    records.set(recordPoint(random), offset);
    bookShape.set(boxPoint(random, i % autobookpressCatalog.length), offset);
    seeds[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(hero, 3));
  geometry.setAttribute("aNetwork", new THREE.BufferAttribute(network, 3));
  geometry.setAttribute("aFashion", new THREE.BufferAttribute(fashion, 3));
  geometry.setAttribute("aRecords", new THREE.BufferAttribute(records, 3));
  geometry.setAttribute("aBooks", new THREE.BufferAttribute(bookShape, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return geometry;
}

const vertexShader = `
  uniform float uTime;
  uniform float uSection;
  uniform vec2 uPointer;
  attribute vec3 aNetwork;
  attribute vec3 aFashion;
  attribute vec3 aRecords;
  attribute vec3 aBooks;
  attribute float aSeed;
  varying float vSeed;
  varying float vGlow;
  vec3 scenePosition(float scene) {
    if (scene < 1.0) return mix(position, aNetwork, smoothstep(0.0, 1.0, scene));
    if (scene < 2.0) return mix(aNetwork, aFashion, smoothstep(1.0, 2.0, scene));
    if (scene < 3.0) return mix(aFashion, aRecords, smoothstep(2.0, 3.0, scene));
    return mix(aRecords, aBooks, smoothstep(3.0, 4.0, scene));
  }
  void main() {
    vec3 p = scenePosition(clamp(uSection, 0.0, 4.0));
    float pulse = sin(uTime * 0.72 + aSeed * 18.0 + length(p) * 2.2) * 0.035;
    p += normalize(p + vec3(0.001)) * pulse;
    p.x += uPointer.x * (0.08 + aSeed * 0.06);
    p.y += uPointer.y * (0.05 + aSeed * 0.04);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (1.25 + aSeed * 2.35) * min(6.0, 9.5 / max(1.0, -mvPosition.z));
    vSeed = aSeed;
    vGlow = 1.0 - smoothstep(1.0, 6.5, -mvPosition.z);
  }
`;

const fragmentShader = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;
  varying float vGlow;
  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(point);
    float alpha = smoothstep(0.5, 0.04, distanceToCenter);
    vec3 color = mix(uColorA, uColorB, vSeed);
    color += vGlow * 0.18;
    gl_FragColor = vec4(color, alpha * (0.58 + vSeed * 0.38));
  }
`;

function ProductHolostage({
  activeLook,
  viewSide,
}: {
  activeLook: PixiLook;
  viewSide: "front" | "back";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeLookRef = useRef(activeLook);
  const viewSideRef = useRef(viewSide);
  useEffect(() => { activeLookRef.current = activeLook; }, [activeLook]);
  useEffect(() => { viewSideRef.current = viewSide; }, [viewSide]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let teardown = () => {};

    const startModel = async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      camera.position.set(0, 0.45, 8.7);
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: window.innerWidth > 760, powerPreference: "high-performance" });
      } catch {
        canvas.classList.add("model-unavailable");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth > 760 ? 1.45 : 1.1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      scene.add(new THREE.HemisphereLight("#f4eeff", "#160d22", 2.25));
      const keyLight = new THREE.DirectionalLight("#ff6c91", 4.8);
      keyLight.position.set(-3.4, 5.2, 4.6);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight("#79ffe5", 15, 12, 2);
      rimLight.position.set(3.2, 1.7, 3.2);
      scene.add(rimLight);
      const violetLight = new THREE.PointLight("#7760ff", 11, 10, 2);
      violetLight.position.set(-2.8, -0.6, 2.4);
      scene.add(violetLight);

      const model = new THREE.Group();
      model.position.y = -2.28;
      model.rotation.y = 0.12;
      model.scale.setScalar(2.86);
      scene.add(model);

      const garmentMount = new THREE.Group();
      model.add(garmentMount);
      const garmentShellMaterial = new THREE.MeshPhysicalMaterial({
        color: "#120c18",
        metalness: 0.32,
        roughness: 0.18,
        clearcoat: 0.72,
        clearcoatRoughness: 0.2,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
      });
      const garmentShell = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.42, 0.12, 4, 4, 1),
        garmentShellMaterial,
      );
      garmentShell.position.y = 1.02;
      garmentMount.add(garmentShell);

      const displayFrameGeometry = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(1.36, 1.48, 0.16),
      );
      const displayFrameMaterial = new THREE.LineBasicMaterial({
        color: "#ff718c",
        transparent: true,
        opacity: 0.52,
      });
      const displayFrame = new THREE.LineSegments(
        displayFrameGeometry,
        displayFrameMaterial,
      );
      displayFrame.position.y = 1.02;
      garmentMount.add(displayFrame);

      const garmentGeometry = new THREE.PlaneGeometry(1.1, 1.1, 34, 34);
      const positions = garmentGeometry.attributes.position;
      for (let i = 0; i < positions.count; i += 1) {
        const x = positions.getX(i) / 0.55;
        positions.setZ(i, 0.012 - x * x * 0.014);
      }
      garmentGeometry.computeVertexNormals();
      const blankTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
      blankTexture.needsUpdate = true;
      const garmentFragment = `
        uniform sampler2D uMap;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          vec4 texel = texture2D(uMap, vUv);
          float high = max(texel.r, max(texel.g, texel.b));
          float low = min(texel.r, min(texel.g, texel.b));
          float chroma = high - low;
          float paper = low - chroma * 0.70;
          float alpha = 1.0 - smoothstep(0.88, 0.992, paper);
          float edge = smoothstep(0.0, 0.035, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
          alpha *= edge * uOpacity;
          if (alpha < 0.018) discard;
          gl_FragColor = vec4(texel.rgb, alpha);
        }
      `;
      const garmentVertex = `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z += sin(uv.y * 3.14159) * sin(uTime * 1.4 + uv.x * 4.0) * 0.014;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `;
      const frontUniforms = { uMap: { value: blankTexture as import("three").Texture }, uOpacity: { value: 0 }, uTime: { value: 0 } };
      const backUniforms = { uMap: { value: blankTexture as import("three").Texture }, uOpacity: { value: 0 }, uTime: { value: 0 } };
      const frontMaterial = new THREE.ShaderMaterial({ uniforms: frontUniforms, vertexShader: garmentVertex, fragmentShader: garmentFragment, transparent: true, depthWrite: false, side: THREE.FrontSide, toneMapped: false });
      const backMaterial = new THREE.ShaderMaterial({ uniforms: backUniforms, vertexShader: garmentVertex, fragmentShader: garmentFragment, transparent: true, depthWrite: false, side: THREE.FrontSide, toneMapped: false });
      const frontGarment = new THREE.Mesh(garmentGeometry, frontMaterial);
      frontGarment.position.set(0, 1.02, 0.075);
      frontGarment.renderOrder = 5;
      garmentMount.add(frontGarment);
      const backGarment = new THREE.Mesh(garmentGeometry, backMaterial);
      backGarment.position.set(0, 1.02, -0.075);
      backGarment.rotation.y = Math.PI;
      backGarment.renderOrder = 5;
      garmentMount.add(backGarment);

      const baseRingMaterial = new THREE.MeshBasicMaterial({ color: "#ff668d", transparent: true, opacity: 0.7 });
      const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.018, 8, 150), baseRingMaterial);
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = -2.15;
      scene.add(baseRing);
      const scanRingMaterial = new THREE.MeshBasicMaterial({ color: "#75ffe4", transparent: true, opacity: 0.38 });
      const scanRing = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.006, 6, 150), scanRingMaterial);
      scanRing.rotation.x = Math.PI / 2;
      scanRing.position.y = -2.14;
      scene.add(scanRing);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin("anonymous");
      const textureCache = new Map<string, import("three").Texture>();
      let textureTicket = 0;
      let currentLookKey = "";
      let garmentOpacity = 0;
      const loadTexture = async (url: string) => {
        const cached = textureCache.get(url);
        if (cached) return cached;
        const texture = await textureLoader.loadAsync(url);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        textureCache.set(url, texture);
        return texture;
      };
      const loadLook = async (look: PixiLook) => {
        const ticket = ++textureTicket;
        try {
          const [front, back] = await Promise.all([loadTexture(look.frontImage), loadTexture(look.backImage || look.frontImage)]);
          if (disposed || ticket !== textureTicket) return;
          frontUniforms.uMap.value = front;
          backUniforms.uMap.value = back;
        } catch {
          // Keep the previous product visible if a remote image is unavailable.
        }
      };

      const pointer = new THREE.Vector2();
      let visible = true;
      let frame = 0;
      const clock = new THREE.Clock();
      const updatePointer = (event: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect();
        pointer.set(((event.clientX - bounds.left) / Math.max(1, bounds.width) - 0.5) * 2, -((event.clientY - bounds.top) / Math.max(1, bounds.height) - 0.5) * 2);
      };
      const resetPointer = () => pointer.set(0, 0);
      const resize = () => {
        const bounds = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
        const width = Math.max(1, bounds.width);
        const height = Math.max(1, bounds.height);
        camera.aspect = width / height;
        camera.position.z = width < 560 ? 9.4 : 8.55;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 560 ? 1.1 : 1.45));
        renderer.setSize(width, height, false);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas.parentElement ?? canvas);
      const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "180px" });
      visibilityObserver.observe(canvas);
      canvas.addEventListener("pointermove", updatePointer, { passive: true });
      canvas.addEventListener("pointerleave", resetPointer);
      resize();

      const render = () => {
        const elapsed = clock.getElapsedTime();
        const look = activeLookRef.current;
        const nextKey = `${look.frontImage}|${look.backImage}`;
        if (nextKey !== currentLookKey) {
          currentLookKey = nextKey;
          void loadLook(look);
        }
        garmentOpacity = THREE.MathUtils.lerp(garmentOpacity, frontUniforms.uMap.value === blankTexture ? 0 : 1, 0.065);
        frontUniforms.uOpacity.value = garmentOpacity;
        backUniforms.uOpacity.value = garmentOpacity;
        frontUniforms.uTime.value = elapsed;
        backUniforms.uTime.value = elapsed;
        const hoodie = /hoodie/i.test(look.format);
        const garmentScaleX = hoodie ? 1 : 0.95;
        const garmentScaleY = hoodie ? 1 : 0.95;
        garmentMount.scale.x = THREE.MathUtils.lerp(garmentMount.scale.x, garmentScaleX, 0.06);
        garmentMount.scale.y = THREE.MathUtils.lerp(garmentMount.scale.y, garmentScaleY, 0.06);
        garmentMount.position.y = THREE.MathUtils.lerp(garmentMount.position.y, hoodie ? 0 : -0.035, 0.06);
        model.position.y = -2.28 + (reducedMotion ? 0 : Math.sin(elapsed * 1.1) * 0.035);
        const sideTarget = viewSideRef.current === "back" ? Math.PI : 0.12;
        const idleTurn = reducedMotion ? 0 : Math.sin(elapsed * 0.46) * 0.035;
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, sideTarget + idleTurn + pointer.x * 0.055, reducedMotion ? 0.2 : 0.055);
        model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, pointer.y * 0.025, 0.035);
        displayFrameMaterial.opacity = 0.42 + Math.sin(elapsed * 1.35) * 0.1;
        baseRing.rotation.z = elapsed * 0.18;
        scanRing.rotation.z = -elapsed * 0.11;
        scanRing.scale.setScalar(1 + Math.sin(elapsed * 1.15) * 0.035);
        if (visible) {
          camera.lookAt(0, 0.36, 0);
          renderer.render(scene, camera);
        }
        frame = window.requestAnimationFrame(render);
      };
      frame = window.requestAnimationFrame(render);
      teardown = () => {
        window.cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        canvas.removeEventListener("pointermove", updatePointer);
        canvas.removeEventListener("pointerleave", resetPointer);
        scene.traverse((object) => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
        garmentShellMaterial.dispose();
        displayFrameGeometry.dispose();
        displayFrameMaterial.dispose();
        baseRingMaterial.dispose();
        scanRingMaterial.dispose();
        frontMaterial.dispose();
        backMaterial.dispose();
        blankTexture.dispose();
        textureCache.forEach((texture) => texture.dispose());
        renderer.dispose();
      };
    };
    void startModel();
    return () => { disposed = true; teardown(); };
  }, []);

  return <canvas ref={canvasRef} className="fashion-model-canvas" aria-label={`3D PixiOnyx product vault showing the ${viewSide} of the selected garment`} />;
}

export default function QnovaExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [looks, setLooks] = useState<PixiLook[]>(pixionyxFallback);
  const [books, setBooks] = useState<AutoBookPressTitle[]>(autobookpressCatalog);
  const [bookSyncActive, setBookSyncActive] = useState(false);
  const [lookIndex, setLookIndex] = useState(0);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [artistIndex, setArtistIndex] = useState(0);
  const [bookIndex, setBookIndex] = useState(0);
  const [capabilityIndex, setCapabilityIndex] = useState(0);
  const [modelSide, setModelSide] = useState<"front" | "back">("front");
  const prefetchedProductImages = useRef(new Set<string>());
  useChapterTransitions();
  const lookDrag = useDragWheel(() => setLookIndex((current) => wrapIndex(current - 1, looks.length)), () => setLookIndex((current) => wrapIndex(current + 1, looks.length)));
  const playlistDrag = useDragWheel(() => setPlaylistIndex((current) => wrapIndex(current - 1, playlists.length)), () => setPlaylistIndex((current) => wrapIndex(current + 1, playlists.length)));
  const artistDrag = useDragWheel(() => setArtistIndex((current) => wrapIndex(current - 1, artists.length)), () => setArtistIndex((current) => wrapIndex(current + 1, artists.length)));
  const bookDrag = useDragWheel(() => setBookIndex((current) => wrapIndex(current - 1, books.length)), () => setBookIndex((current) => wrapIndex(current + 1, books.length)));

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/pixionyx")
      .then((response) => {
        if (!response.ok) throw new Error("Catalogue unavailable");
        return response.json() as Promise<{ products?: PixiLook[] }>;
      })
      .then((payload) => {
        if (!cancelled && payload.products && payload.products.length >= 4) {
          setLooks(payload.products);
          setLookIndex(0);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!looks.length) return;
    for (let offset = -3; offset <= 3; offset += 1) {
      const look = looks[wrapIndex(lookIndex + offset, looks.length)];
      [look.frontImage, look.backImage || look.frontImage].forEach((url) => {
        if (prefetchedProductImages.current.has(url)) return;
        prefetchedProductImages.current.add(url);
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.decoding = "async";
        image.src = url;
      });
    }
  }, [lookIndex, looks]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/autobookpress")
      .then((response) => {
        if (!response.ok) throw new Error("Catalogue unavailable");
        return response.json() as Promise<{
          books?: AutoBookPressTitle[];
          autoSyncActive?: boolean;
        }>;
      })
      .then((payload) => {
        if (cancelled) return;
        if (payload.books?.length) {
          setBooks(payload.books);
          setBookIndex((current) => Math.min(current, payload.books!.length - 1));
        }
        setBookSyncActive(Boolean(payload.autoSyncActive));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let teardown = () => {};
    const startScene = async () => {
      const THREE = await import("three");
      if (disposed) return;
      const palettes = paletteHex.map(([first, second]) => [new THREE.Color(first), new THREE.Color(second)]);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 50);
      camera.position.set(0, 0, mobile ? 7.1 : 6.15);
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: "high-performance" });
      } catch {
        document.documentElement.classList.add("no-webgl");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.7));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const geometry = buildParticleGeometry(THREE, mobile ? 5600 : 14500);
      const uniforms = { uTime: { value: 0 }, uSection: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uColorA: { value: palettes[0][0].clone() }, uColorB: { value: palettes[0][1].clone() } };
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const points = new THREE.Points(geometry, material);
      points.rotation.x = -0.08;
      scene.add(points);
      const coreGeometry = new THREE.TorusKnotGeometry(0.72, 0.13, 176, 18, 2, 5);
      const coreMaterial = new THREE.MeshPhysicalMaterial({ color: palettes[0][0].clone(), emissive: palettes[0][1].clone(), emissiveIntensity: 0.35, metalness: 0.72, roughness: 0.2, transparent: true, opacity: 0.32, wireframe: true });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      scene.add(core);
      const ringGroup = new THREE.Group();
      for (let i = 0; i < 3; i += 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(2.3 + i * 0.46, 0.006, 6, 180), new THREE.MeshBasicMaterial({ color: i % 2 ? "#7058ff" : "#68ffe0", transparent: true, opacity: 0.12 - i * 0.02 }));
        ring.rotation.x = Math.PI / 2.5 + i * 0.17;
        ring.rotation.y = i * 0.46;
        ringGroup.add(ring);
      }
      scene.add(ringGroup);
      const pointerTarget = new THREE.Vector2();
      let targetSection = 0;
      let smoothSection = 0;
      let frame = 0;
      let lastActive = 0;
      const clock = new THREE.Clock();
      const updateScroll = () => {
        const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
        const focusLine = window.scrollY + window.innerHeight * 0.48;
        const centers = chapters.map((chapter) => chapter.offsetTop + chapter.offsetHeight * 0.5);
        if (!centers.length) return;
        let sceneValue = Number(chapters[0].dataset.scene ?? 0);
        for (let i = 0; i < centers.length - 1; i += 1) {
          if (focusLine >= centers[i] && focusLine <= centers[i + 1]) {
            const local = (focusLine - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
            sceneValue = THREE.MathUtils.lerp(Number(chapters[i].dataset.scene ?? i), Number(chapters[i + 1].dataset.scene ?? i + 1), local);
            break;
          }
          if (focusLine > centers[i + 1]) sceneValue = Number(chapters[i + 1].dataset.scene ?? i + 1);
        }
        targetSection = THREE.MathUtils.clamp(sceneValue, 0, 4);
        const nextActive = Math.round(targetSection);
        if (nextActive !== lastActive) {
          lastActive = nextActive;
          setActiveScene(nextActive);
        }
        const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        document.documentElement.style.setProperty("--page-progress", `${window.scrollY / total}`);
      };
      const updatePointer = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        pointerTarget.set(event.clientX / window.innerWidth - 0.5, -(event.clientY / window.innerHeight - 0.5));
      };
      const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.position.z = window.innerWidth <= 760 ? 7.1 : 6.15;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 760 ? 1.25 : 1.7));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        updateScroll();
      };
      const render = () => {
        const elapsed = clock.getElapsedTime();
        smoothSection = THREE.MathUtils.lerp(smoothSection, targetSection, reducedMotion ? 0.12 : 0.045);
        uniforms.uTime.value = elapsed;
        uniforms.uSection.value = smoothSection;
        uniforms.uPointer.value.lerp(pointerTarget, 0.035);
        const paletteFrom = Math.floor(smoothSection);
        const paletteTo = Math.min(4, paletteFrom + 1);
        const paletteMix = smoothSection - paletteFrom;
        uniforms.uColorA.value.copy(palettes[paletteFrom][0]).lerp(palettes[paletteTo][0], paletteMix);
        uniforms.uColorB.value.copy(palettes[paletteFrom][1]).lerp(palettes[paletteTo][1], paletteMix);
        coreMaterial.color.copy(uniforms.uColorA.value);
        coreMaterial.emissive.copy(uniforms.uColorB.value);
        points.rotation.y = elapsed * 0.035 + smoothSection * 0.24;
        core.rotation.x = elapsed * 0.17 + smoothSection * 0.22;
        core.rotation.y = elapsed * 0.24 - smoothSection * 0.2;
        core.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.055);
        coreMaterial.opacity = 0.13 + Math.abs(Math.sin(smoothSection * Math.PI)) * 0.18;
        ringGroup.rotation.z = elapsed * 0.018;
        ringGroup.rotation.y = -elapsed * 0.012;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointerTarget.x * 0.28, 0.025);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointerTarget.y * 0.18, 0.025);
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        if (!reducedMotion || smoothSection !== targetSection) frame = window.requestAnimationFrame(render);
      };
      updateScroll();
      window.addEventListener("scroll", updateScroll, { passive: true });
      window.addEventListener("pointermove", updatePointer, { passive: true });
      window.addEventListener("resize", resize);
      frame = window.requestAnimationFrame(render);
      teardown = () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", updateScroll);
        window.removeEventListener("pointermove", updatePointer);
        window.removeEventListener("resize", resize);
        geometry.dispose();
        material.dispose();
        coreGeometry.dispose();
        coreMaterial.dispose();
        ringGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) child.material.dispose();
          }
        });
        renderer.dispose();
      };
    };
    void startScene();
    return () => { disposed = true; teardown(); };
  }, []);

  const activeLook = looks[lookIndex] ?? looks[0] ?? pixionyxFallback[0];

  return (
    <div className="experience-shell">
      <canvas ref={canvasRef} className="webgl-stage" aria-hidden="true" />
      <div className="aurora" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="scroll-meter" aria-hidden="true"><span /></div>

      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="QUANTUMNOVA home"><span className="wordmark-mark">Q</span><span>QUANTUMNOVA</span></a>
        <nav aria-label="Main navigation">
          <a href="#studio">Studio</a>
          <a href="#style">Our brands</a>
          <a href="#sound">Records</a>
          <a href="/start-project" className="nav-cta">Scope a project</a>
        </nav>
      </header>

      <aside className="scene-index" aria-label="Experience progress">
        {[["Home", "home"], ["Studio", "studio"], ["PixiOnyx", "style"], ["Records", "sound"], ["AutoBookPress", "ideas"]].map(([label, id], index) => (
          <a key={label} href={`#${id}`} className={activeScene === index ? "active" : ""} aria-label={label}><span>{String(index + 1).padStart(2, "0")}</span></a>
        ))}
      </aside>

      <main>
        <section id="home" className="chapter hero-chapter" data-scene="0">
          <div className="chapter-copy hero-copy">
            <p className="kicker"><span /> Australian creative technology company</p>
            <h1><span>We build</span><span>digital</span><span>worlds.</span></h1>
            <p className="hero-intro">QUANTUMNOVA designs immersive websites, 3D product worlds and motion systems, then puts that technology to work across our own music, fashion and publishing brands.</p>
            <div className="hero-actions">
              <a className="primary-action" href="/start-project">Scope a project <span>↗</span></a>
              <a className="text-action" href="#style">Explore our digital worlds</a>
            </div>
          </div>
          <div className="scene-caption"><span>Real-time environment</span><span>Move to influence the field</span></div>
        </section>

        <section id="studio" className="chapter interactive-chapter" data-scene="1">
          <div className="interactive-grid">
            <div className="chapter-copy">
              <p className="kicker interactive-kicker"><span /> QUANTUMNOVA Studio</p>
              <h2>Technology people can enter.</h2>
              <p className="interactive-lead">We create custom websites for brands that need more than a template. Strategy, spatial design, WebGL, motion and production engineering become one memorable digital system.</p>
              <a className="primary-action" href="/start-project">Request a scoped quote <span>↗</span></a>
              <p className="contact-note">Sydney, Australia. Selected projects worldwide.</p>
            </div>
            <div className="project-reactor" aria-label="Studio capabilities">
              <div className="reactor-stage">
                <div className="reactor-ring ring-a" aria-hidden="true" />
                <div className="reactor-ring ring-b" aria-hidden="true" />
                <div className="reactor-core" aria-hidden="true"><span>Q</span><small>Your world</small></div>
                {capabilities.map((capability, index) => (
                  <button key={capability.title} type="button" className={capabilityIndex === index ? `reactor-node node-${index} active` : `reactor-node node-${index}`} onClick={() => setCapabilityIndex(index)} aria-pressed={capabilityIndex === index}>
                    <small>{String(index + 1).padStart(2, "0")}</small><span>{capability.title}</span>
                  </button>
                ))}
              </div>
              <div className="reactor-detail" aria-live="polite"><small>SELECTED SYSTEM / {String(capabilityIndex + 1).padStart(2, "0")}</small><h3>{capabilities[capabilityIndex].title}</h3><p>{capabilities[capabilityIndex].copy}</p></div>
            </div>
          </div>
          <div className="seo-statement"><p>Custom 3D website design</p><p>Interactive WebGL development</p><p>Immersive product experiences</p><p>Creative technology studio</p></div>
        </section>

        <section id="style" className="chapter brand-chapter style-chapter" data-scene="2">
          <div className="chapter-copy split-copy">
            <div><p className="kicker pixi-kicker"><span /> QUANTUMNOVA brand / PixiOnyx</p><h2>Wear something different.</h2></div>
            <div className="chapter-description"><p>Independent apparel, artist merch and statement designs from PixiOnyx, presented through a live product feed and a spatial digital product vault.</p><a className="text-action" href="https://www.pixionyx.com/collections/clothing" target="_blank" rel="noreferrer">Shop PixiOnyx ↗</a></div>
          </div>
          <div className="fashion-studio">
            <div className="model-bay">
              <ProductHolostage activeLook={activeLook} viewSide={modelSide} />
              <div className="model-scanlines" aria-hidden="true" />
              <div className="model-status"><span>3D PRODUCT VAULT / LIVE CATALOGUE</span><span>{String(lookIndex + 1).padStart(2, "0")} / {String(looks.length).padStart(2, "0")}</span></div>
              <div className="model-view-controls" aria-label="Garment view">
                <button type="button" className={modelSide === "front" ? "active" : ""} onClick={() => setModelSide("front")} aria-pressed={modelSide === "front"}>Front</button>
                <button type="button" className={modelSide === "back" ? "active" : ""} onClick={() => setModelSide("back")} aria-pressed={modelSide === "back"}>Back</button>
              </div>
              <div className="model-name" aria-live="polite"><small>{activeLook.format}</small><strong>{activeLook.shortTitle}</strong><span>{activeLook.price}</span></div>
            </div>
            <div className="look-ring" aria-label="PixiOnyx live product wheel" tabIndex={0} {...lookDrag.bind}
              onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") setLookIndex((current) => wrapIndex(current + 1, looks.length)); if (event.key === "ArrowLeft" || event.key === "ArrowUp") setLookIndex((current) => wrapIndex(current - 1, looks.length)); }}>
              <div className="look-ring-stage">
                <div className="look-ring-axis" aria-hidden="true" />
                {looks.map((look, index) => {
                  const distance = Math.abs(circularDelta(index, lookIndex, looks.length));
                  const nearby = distance <= 3;
                  return (
                    <button key={look.url} type="button" className={index === lookIndex ? "look-ring-card active" : "look-ring-card"} style={ringStyle(index, lookIndex, looks.length, 255, 195)} onClick={() => { if (lookDrag.allowClick()) setLookIndex(index); }} aria-label={`Show ${look.shortTitle}`} aria-pressed={index === lookIndex}>
                      <span className="look-card-rear"><img src={look.backImage} alt="" loading={nearby ? "eager" : "lazy"} decoding="async" fetchPriority={distance === 0 ? "high" : "auto"} /><small>BACK</small></span>
                      <span className="look-card-front"><img src={look.frontImage} alt="" loading={nearby ? "eager" : "lazy"} decoding="async" fetchPriority={distance === 0 ? "high" : "auto"} /><span><small>{String(index + 1).padStart(2, "0")}</small><b>{look.shortTitle}</b></span></span>
                    </button>
                  );
                })}
              </div>
              <WheelScrubber label="Garment position" value={lookIndex} length={looks.length} onChange={setLookIndex} />
              <div className="ring-controls"><span>Drag / swipe / select / arrow keys</span><a href={activeLook.url} target="_blank" rel="noreferrer" onPointerDown={(event) => event.stopPropagation()}>View selected product ↗</a></div>
              <div className="live-feed-note"><span className="live-dot" /> Live catalogue sync</div>
            </div>
          </div>
        </section>

        <section id="sound" className="chapter brand-chapter sound-chapter" data-scene="3">
          <div className="chapter-copy split-copy">
            <div><p className="kicker records-kicker"><span /> QUANTUMNOVA brand / Quantumnova Records</p><h2>Independent music without a single lane.</h2></div>
            <div className="chapter-description"><p>Every QUANTUMNOVA playlist and ten artists live inside one expandable spatial listening system. Drag the vinyl wheel, then play the selected station without leaving the experience.</p></div>
          </div>
          <div className="playlist-system">
            <div className="playlist-ring" aria-label="QUANTUMNOVA Spotify playlist wheel" tabIndex={0} {...playlistDrag.bind}
              onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") setPlaylistIndex((current) => wrapIndex(current + 1, playlists.length)); if (event.key === "ArrowLeft" || event.key === "ArrowUp") setPlaylistIndex((current) => wrapIndex(current - 1, playlists.length)); }}>
              <div className="playlist-ring-axis" aria-hidden="true" />
              {playlists.map((playlist, index) => (
                <button key={playlist.id} type="button" className={index === playlistIndex ? "playlist-disc active" : "playlist-disc"} style={ringStyle(index, playlistIndex, playlists.length, 235, 205)} onClick={() => { if (playlistDrag.allowClick()) setPlaylistIndex(index); }} aria-label={`Select ${playlist.title}`} aria-pressed={index === playlistIndex}>
                  <img src={playlist.cover} alt="" loading="lazy" /><span className="disc-grooves" aria-hidden="true" /><span className="disc-label">{String(index + 1).padStart(2, "0")}</span>
                </button>
              ))}
              <div className="playlist-ring-copy" aria-live="polite"><small>{playlists[playlistIndex].eyebrow}</small><strong>{playlists[playlistIndex].title}</strong><span>{playlists[playlistIndex].detail}</span></div>
              <WheelScrubber label="Playlist position" value={playlistIndex} length={playlists.length} onChange={setPlaylistIndex} />
              <p className="interaction-hint">Drag / swipe / select / arrow keys</p>
            </div>
            <div className="player-panel">
              <div className="panel-topline"><span>PLAYLIST / {String(playlistIndex + 1).padStart(3, "0")}</span><span>EMBEDDED FROM SPOTIFY</span></div>
              <iframe key={playlists[playlistIndex].id} src={`https://open.spotify.com/embed/playlist/${playlists[playlistIndex].id}?utm_source=generator&theme=0`} title={`${playlists[playlistIndex].title} Spotify player`} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
              <a href={`https://open.spotify.com/playlist/${playlists[playlistIndex].id}`} target="_blank" rel="noreferrer">Open selected playlist in Spotify ↗</a>
            </div>
          </div>
          <div className="artist-constellation">
            <div className="artist-constellation-heading"><span>THE LABEL / 10 ARTISTS</span><span>Latest release constellation</span></div>
            <div className="artist-orbit" tabIndex={0} aria-label="Quantumnova Records artist roster" {...artistDrag.bind}
              onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") setArtistIndex((current) => wrapIndex(current + 1, artists.length)); if (event.key === "ArrowLeft" || event.key === "ArrowUp") setArtistIndex((current) => wrapIndex(current - 1, artists.length)); }}>
              <div className="artist-orbit-line" aria-hidden="true" />
              {artists.map((artist, index) => (
                <button key={artist.name} type="button" className={index === artistIndex ? "artist-node active" : "artist-node"} style={ringStyle(index, artistIndex, artists.length, 360, 145)} onClick={() => { if (artistDrag.allowClick()) setArtistIndex(index); }} aria-label={`Show ${artist.name}`} aria-pressed={index === artistIndex}><img src={artist.cover} alt="" loading="lazy" /></button>
              ))}
              <div className="artist-orbit-detail" aria-live="polite"><small>{String(artistIndex + 1).padStart(2, "0")} / 10 · LATEST RELEASE</small><strong>{artists[artistIndex].name}</strong><span>{artists[artistIndex].release}</span><a href={`https://open.spotify.com/album/${artists[artistIndex].spotify}`} target="_blank" rel="noreferrer" onPointerDown={(event) => event.stopPropagation()}>Listen ↗</a></div>
            </div>
            <WheelScrubber label="Artist position" value={artistIndex} length={artists.length} onChange={setArtistIndex} />
            <p className="interaction-hint">Drag / swipe / select / arrow keys</p>
          </div>
        </section>

        <section id="ideas" className="chapter brand-chapter ideas-chapter" data-scene="4">
          <div className="chapter-copy split-copy">
            <div><p className="kicker book-kicker"><span /> QUANTUMNOVA brand / AutoBookPress</p><h2>Books and publishing from QUANTUMNOVA.</h2></div>
            <div className="chapter-description"><p>A curated AutoBookPress catalogue spanning practical non-fiction and fiction. It becomes a tactile digital library with room for every future release.</p></div>
          </div>
          <div className="book-ring-system" aria-label="AutoBookPress 3D book wheel" tabIndex={0} {...bookDrag.bind}
            onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") setBookIndex((current) => wrapIndex(current + 1, books.length)); if (event.key === "ArrowLeft" || event.key === "ArrowUp") setBookIndex((current) => wrapIndex(current - 1, books.length)); }}>
            <div className="book-ring-stage">
              <div className="book-ring-axis" aria-hidden="true" />
              {books.map((book, index) => (
                <button key={book.asin} type="button" className={index === bookIndex ? "book-object active" : "book-object"} style={{ ...ringStyle(index, bookIndex, books.length, 345, 220), "--book-colour": book.colour, "--book-accent": book.accent } as CSSProperties} onClick={() => { if (bookDrag.allowClick()) setBookIndex(index); }} aria-label={`Show ${book.title}`} aria-pressed={index === bookIndex}>
                  <span className="book-volume"><span className="book-face">{book.cover ? <img src={book.cover} alt={`${book.title} cover`} loading="lazy" /> : <span className="book-cover-fallback"><small>AUTOBOOKPRESS</small><strong>{book.title}</strong><i>{book.subtitle}</i><b>DIGITAL LEGACY</b></span>}<span className="book-glare" aria-hidden="true" /></span><span className="book-spine"><b>{book.title}</b></span><span className="book-pages" /></span>
                </button>
              ))}
            </div>
            <WheelScrubber label="Book position" value={bookIndex} length={books.length} onChange={setBookIndex} />
            <div className="book-ring-detail" aria-live="polite"><div><small>{books[bookIndex].category}</small><h3>{books[bookIndex].title}</h3><p>{books[bookIndex].subtitle}</p><a href={books[bookIndex].url} target="_blank" rel="noreferrer" onPointerDown={(event) => event.stopPropagation()}>View on Amazon ↗</a></div><span>{bookSyncActive ? "AUTO SYNC ACTIVE" : `${books.length} FEATURED TITLES`}</span></div>
            <p className="interaction-hint">Drag / swipe / select / arrow keys</p>
          </div>
        </section>
      </main>

      <footer className="site-footer"><span>© 2026 QUANTUMNOVA PTY LTD</span><span>ABN 43686016526</span><a href="/start-project">Start a project</a><a href="mailto:admin@quantumnova.com.au">admin@quantumnova.com.au</a></footer>
    </div>
  );
}
