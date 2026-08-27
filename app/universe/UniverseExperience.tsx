"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { autobookpressCatalog, type AutoBookPressTitle } from "@/app/data/autobookpress";
import { pixionyxFallback, type PixiLook } from "@/app/data/pixionyx";
import UniverseCanvas from "./UniverseCanvas";
import SpatialCarousel, { wrapIndex } from "./SpatialCarousel";
import {
  artists,
  capabilities,
  playlists,
  studioOutcomeTargets,
  studioProcess,
  universeScenes,
} from "./content";

type RecordView = "playlists" | "artists";

function SceneEyebrow({
  number,
  children,
  accent,
}: {
  number: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <p className="universe-eyebrow" style={{ "--scene-accent": accent } as CSSProperties}>
      <span>{number}</span>
      {children}
    </p>
  );
}

function PortalLink({ href, children, quiet = false }: { href: string; children: React.ReactNode; quiet?: boolean }) {
  const external = href.startsWith("http");
  return (
    <a
      className={quiet ? "portal-link quiet" : "portal-link"}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      <span>{children}</span>
      <i aria-hidden="true">↗</i>
    </a>
  );
}

function SceneChrome({ sceneIndex }: { sceneIndex: number }) {
  const current = universeScenes[sceneIndex];
  return (
    <div className="scene-chrome" aria-hidden="true">
      <span>GALAXY / {current.shortLabel}</span>
      <span>{current.label.toUpperCase()}</span>
      <span>LIVE ORBIT</span>
    </div>
  );
}

export default function UniverseExperience() {
  const [activeScene, setActiveScene] = useState(0);
  const [looks, setLooks] = useState<PixiLook[]>(pixionyxFallback);
  const [books, setBooks] = useState<AutoBookPressTitle[]>(autobookpressCatalog);
  const [bookSyncActive, setBookSyncActive] = useState(false);
  const [capabilityIndex, setCapabilityIndex] = useState(0);
  const [lookIndex, setLookIndex] = useState(0);
  const [productSide, setProductSide] = useState<"front" | "back">("front");
  const [recordView, setRecordView] = useState<RecordView>("playlists");
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [artistIndex, setArtistIndex] = useState(0);
  const [bookIndex, setBookIndex] = useState(0);
  const [worldsMenuOpen, setWorldsMenuOpen] = useState(false);
  const prefetchedImages = useRef(new Set<string>());
  const lastProductInteraction = useRef(0);

  const handleSceneChange = useCallback((scene: number) => {
    setActiveScene(scene);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("universe-mode");
    const readyFrame = window.requestAnimationFrame(() => {
      document.documentElement.classList.add("universe-ready");
    });
    return () => {
      window.cancelAnimationFrame(readyFrame);
      document.documentElement.classList.remove("universe-mode", "universe-ready");
    };
  }, []);

  useEffect(() => {
    let sceneFrame = 0;
    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-universe-scene]"));
    const compactMotion = window.matchMedia("(max-width: 760px)").matches;

    const updateActiveScene = () => {
      window.cancelAnimationFrame(sceneFrame);
      sceneFrame = window.requestAnimationFrame(() => {
        if (!chapters.length) return;
        const viewportHeight = Math.max(window.innerHeight, 1);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const focusLine = window.scrollY + window.innerHeight * 0.5;
        let nearestScene = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        chapters.forEach((chapter, index) => {
          const center = chapter.offsetTop + chapter.offsetHeight * 0.5;
          const distance = Math.abs(center - focusLine);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestScene = index;
          }

          const chapterViewport = chapter.querySelector<HTMLElement>(".universe-chapter-viewport");
          if (!chapterViewport) return;

          const rect = chapter.getBoundingClientRect();
          let transitionPhase = 0;
          if (rect.top >= viewportHeight) {
            transitionPhase = 1;
          } else if (rect.top > 0) {
            transitionPhase = rect.top / viewportHeight;
          } else if (rect.bottom <= 0) {
            transitionPhase = -1;
          } else if (rect.bottom < viewportHeight) {
            transitionPhase = -(1 - rect.bottom / viewportHeight);
          }

          const scrollableDistance = Math.max(rect.height - viewportHeight, 1);
          const chapterProgress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
          const driftAngle = chapterProgress * Math.PI * 1.35 + index * 0.7;
          const phaseMagnitude = Math.abs(transitionPhase);
          const driftStrength = reduceMotion ? 0 : 1;
          const orbitX = reduceMotion
            ? 0
            : transitionPhase * 16 + Math.cos(driftAngle) * 1.05 * driftStrength;
          const orbitY = reduceMotion
            ? 0
            : phaseMagnitude * 3.4 + Math.sin(driftAngle) * 0.72 * driftStrength;
          const orbitZ = reduceMotion ? 0 : -phaseMagnitude * 290;
          const orbitRotateY = reduceMotion
            ? 0
            : transitionPhase * -17 + Math.sin(driftAngle) * 1.35 * driftStrength;
          const orbitRotateZ = reduceMotion
            ? 0
            : transitionPhase * 2.4 + Math.cos(driftAngle) * 0.32 * driftStrength;
          const orbitScale = reduceMotion ? 1 : 1 - phaseMagnitude * 0.1;
          const orbitOpacity = reduceMotion ? 1 : 1 - phaseMagnitude * 0.72;
          chapterViewport.style.setProperty("--chapter-orbit-x", `${orbitX.toFixed(3)}vw`);
          chapterViewport.style.setProperty("--chapter-orbit-y", `${orbitY.toFixed(3)}vh`);
          chapterViewport.style.setProperty("--chapter-orbit-z", `${orbitZ.toFixed(1)}px`);
          chapterViewport.style.setProperty("--chapter-orbit-ry", `${orbitRotateY.toFixed(3)}deg`);
          chapterViewport.style.setProperty("--chapter-orbit-rz", `${orbitRotateZ.toFixed(3)}deg`);
          chapterViewport.style.setProperty("--chapter-orbit-scale", orbitScale.toFixed(4));
          chapterViewport.style.setProperty("--chapter-orbit-opacity", orbitOpacity.toFixed(4));
          chapterViewport.style.zIndex = String(30 - Math.round(phaseMagnitude * 10));
        });
        setActiveScene(nearestScene);
      });
    };

    const updateCompactScene = () => {
      const focus = window.innerHeight * 0.5;
      let nearestScene = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height * 0.5 - focus);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestScene = index;
        }
      });
      setActiveScene(nearestScene);
    };

    const resolveHash = () => {
      const hash = window.location.hash.slice(1);
      if (!universeScenes.some((scene) => scene.id === hash)) return;
      window.requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    const initialHashTimer = window.setTimeout(resolveHash, 160);
    let compactObserver: IntersectionObserver | undefined;
    if (compactMotion) {
      compactObserver = new IntersectionObserver(updateCompactScene, {
        rootMargin: "-48% 0px -48% 0px",
        threshold: 0,
      });
      chapters.forEach((chapter) => compactObserver?.observe(chapter));
      updateCompactScene();
    } else {
      updateActiveScene();
      window.addEventListener("scroll", updateActiveScene, { passive: true });
      window.addEventListener("resize", updateActiveScene);
    }
    window.addEventListener("hashchange", resolveHash);
    return () => {
      window.clearTimeout(initialHashTimer);
      window.cancelAnimationFrame(sceneFrame);
      compactObserver?.disconnect();
      if (!compactMotion) {
        window.removeEventListener("scroll", updateActiveScene);
        window.removeEventListener("resize", updateActiveScene);
      }
      window.removeEventListener("hashchange", resolveHash);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/pixionyx?market=AU")
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
    return () => {
      cancelled = true;
    };
  }, []);

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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeScene !== 2 || !looks.length) return;
    for (let offset = -2; offset <= 2; offset += 1) {
      const look = looks[wrapIndex(lookIndex + offset, looks.length)];
      [look.frontImage, look.backImage].forEach((url) => {
        if (!url || prefetchedImages.current.has(url)) return;
        prefetchedImages.current.add(url);
        const image = new Image();
        image.decoding = "async";
        image.src = url;
      });
    }
  }, [activeScene, lookIndex, looks]);

  useEffect(() => {
    if (activeScene !== 2 || looks.length < 2) return;
    const desktop = window.matchMedia("(min-width: 761px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || reducedMotion) return;

    const interval = window.setInterval(() => {
      if (document.hidden || Date.now() - lastProductInteraction.current < 8000) return;
      setLookIndex((current) => wrapIndex(current + 1, looks.length));
      setProductSide("front");
    }, 2100);

    return () => window.clearInterval(interval);
  }, [activeScene, looks.length]);

  const activeLook = looks[lookIndex] ?? looks[0] ?? pixionyxFallback[0];
  const activePlaylist = playlists[playlistIndex];
  const activeArtist = artists[artistIndex];
  const activeBook = books[bookIndex] ?? books[0] ?? autobookpressCatalog[0];

  const travelTo = (sceneIndex: number) => {
    const scene = universeScenes[sceneIndex];
    document.getElementById(scene.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="universe-experience">
      <a className="universe-skip-link" href="#universe-content">Skip to content</a>
      <UniverseCanvas onSceneChange={handleSceneChange} />
      <div className="universe-fallback-field" aria-hidden="true">
        <span className="fallback-sphere" />
        <span className="fallback-ring ring-a" />
        <span className="fallback-ring ring-b" />
        <span className="fallback-ring ring-c" />
      </div>
      <div className="universe-nebula" aria-hidden="true" />
      <div className="universe-grid" aria-hidden="true" />
      <div className="universe-noise" aria-hidden="true" />
      <div className="journey-progress" aria-hidden="true"><span /></div>

      <a
        className={activeScene === 0 ? "universe-nova-home" : "universe-nova-home visible"}
        href="#home"
        aria-label="Return to the top of the QUANTUMNOVA universe"
        aria-hidden={activeScene === 0}
        tabIndex={activeScene === 0 ? -1 : 0}
        title="Return to top"
      >
        <span>Q</span>
        <small>RETURN TO TOP</small>
      </a>

      <header className="universe-header">
        <a className="universe-wordmark" href="#home" aria-label="QUANTUMNOVA home">
          <span className="universe-mark">Q</span>
          <span className="universe-wordmark-copy">
            <b>QUANTUMNOVA</b>
            <small>CREATIVE TECHNOLOGY COMPANY</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#studio">Studio</a>
          <div
            className={worldsMenuOpen ? "universe-worlds-menu open" : "universe-worlds-menu"}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setWorldsMenuOpen(true);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setWorldsMenuOpen(false);
            }}
            onFocus={() => setWorldsMenuOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setWorldsMenuOpen(false);
            }}
          >
            <button
              type="button"
              className="universe-worlds-trigger"
              aria-expanded={worldsMenuOpen}
              aria-controls="universe-worlds-dropdown"
              onClick={() => setWorldsMenuOpen((open) => !open)}
            >
              Our worlds <span aria-hidden="true">⌄</span>
            </button>
            <div id="universe-worlds-dropdown" className="universe-worlds-dropdown" aria-label="QUANTUMNOVA worlds">
              <a href="#records" onClick={() => setWorldsMenuOpen(false)}>
                <small>03 / MUSIC</small>
                <span>QUANTUMNOVA Records</span>
              </a>
              <a href="#pixionyx" onClick={() => setWorldsMenuOpen(false)}>
                <small>02 / APPAREL</small>
                <span>PixiOnyx</span>
              </a>
              <a href="#books" onClick={() => setWorldsMenuOpen(false)}>
                <small>04 / PUBLISHING</small>
                <span>AutoBookPress</span>
              </a>
            </div>
          </div>
          <a className="universe-header-cta" href="/start-project">Scope a project</a>
        </nav>
      </header>

      <aside className="universe-map" aria-label="Navigate the QUANTUMNOVA universe">
        <p>UNIVERSE MAP</p>
        <ol>
          {universeScenes.map((scene, sceneIndex) => (
            <li key={scene.id}>
              <a
                href={`#${scene.id}`}
                className={activeScene === sceneIndex ? "active" : ""}
                aria-current={activeScene === sceneIndex ? "step" : undefined}
              >
                <span style={{ "--map-tone": scene.tone } as CSSProperties} />
                <b>{scene.shortLabel}</b>
                <em>{scene.label}</em>
              </a>
            </li>
          ))}
        </ol>
      </aside>

      <div className="journey-controller" aria-label="Journey controls">
        <button
          type="button"
          onClick={() => travelTo(Math.max(0, activeScene - 1))}
          disabled={activeScene === 0}
          aria-label="Previous galaxy"
        >
          ↑
        </button>
        <span><b>{String(activeScene + 1).padStart(2, "0")}</b> / {String(universeScenes.length).padStart(2, "0")}</span>
        <button
          type="button"
          onClick={() => travelTo(Math.min(universeScenes.length - 1, activeScene + 1))}
          disabled={activeScene === universeScenes.length - 1}
          aria-label="Next galaxy"
        >
          ↓
        </button>
      </div>

      <main id="universe-content" className="universe-journey">
        <section id="home" className="universe-chapter origin-chapter" data-universe-scene="0">
          <div className="universe-chapter-viewport">
            <SceneChrome sceneIndex={0} />
            <div className="origin-layout">
              <div className="origin-copy">
                <SceneEyebrow number="ORIGIN / 00" accent="#88ffe4">Australian creative technology company</SceneEyebrow>
                <h1>
                  <span>We build</span>
                  <span>digital</span>
                  <span>universes.</span>
                </h1>
                <p>QUANTUMNOVA is an Australian creative technology studio designing immersive websites, 3D product worlds and motion systems, then proving that technology across our own music, fashion and publishing brands.</p>
                <div className="origin-actions">
                  <PortalLink href="/start-project">Enter the project portal</PortalLink>
                  <PortalLink href="#studio" quiet>Begin the journey</PortalLink>
                </div>
                <nav className="mobile-brand-portals" aria-label="Explore QUANTUMNOVA brands">
                  <a href="#pixionyx"><i aria-hidden="true" /><span>PixiOnyx</span></a>
                  <a href="#records"><i aria-hidden="true" /><span>Records</span></a>
                  <a href="#books"><i aria-hidden="true" /><span>AutoBookPress</span></a>
                </nav>
              </div>
              <div className="origin-orbit-labels" aria-label="QUANTUMNOVA worlds">
                <a
                  className="origin-orbit-core"
                  href="#home"
                  aria-label="Return to the top of the QUANTUMNOVA universe"
                  title="Return to the top"
                >
                  <i />
                  Q
                  <small>RETURN TO TOP</small>
                </a>
                <a className="origin-galaxy label-studio" href="#studio" aria-label="Travel to QUANTUMNOVA Studio">
                  <span className="origin-galaxy-system studio-system-mini" aria-hidden="true">
                    <i className="origin-galaxy-core" />
                    <i className="origin-galaxy-ring ring-one" />
                    <i className="origin-galaxy-ring ring-two" />
                    <i className="origin-galaxy-star star-one" />
                    <i className="origin-galaxy-star star-two" />
                    <i className="origin-galaxy-star star-three" />
                  </span>
                  <span className="origin-galaxy-copy"><small>01 / IMMERSIVE WEB</small><strong>QUANTUMNOVA Studio</strong></span>
                </a>
                <a className="origin-galaxy label-pixi" href="#pixionyx" aria-label="Travel to the PixiOnyx galaxy">
                  <span className="origin-galaxy-system pixi-system-mini" aria-hidden="true">
                    <i className="origin-galaxy-core" />
                    <i className="origin-galaxy-ring ring-one" />
                    <i className="origin-galaxy-ring ring-two" />
                    <i className="origin-galaxy-star star-one" />
                    <i className="origin-galaxy-star star-two" />
                    <i className="origin-galaxy-star star-three" />
                  </span>
                  <span className="origin-galaxy-copy"><small>02 / APPAREL</small><strong>PixiOnyx</strong></span>
                </a>
                <a className="origin-galaxy label-records" href="#records" aria-label="Travel to the QUANTUMNOVA Records galaxy">
                  <span className="origin-galaxy-system records-system-mini" aria-hidden="true">
                    <i className="origin-galaxy-core" />
                    <i className="origin-galaxy-ring ring-one" />
                    <i className="origin-galaxy-ring ring-two" />
                    <i className="origin-galaxy-star star-one" />
                    <i className="origin-galaxy-star star-two" />
                    <i className="origin-galaxy-star star-three" />
                  </span>
                  <span className="origin-galaxy-copy"><small>03 / MUSIC</small><strong>QUANTUMNOVA Records</strong></span>
                </a>
                <a className="origin-galaxy label-books" href="#books" aria-label="Travel to the AutoBookPress galaxy">
                  <span className="origin-galaxy-system books-system-mini" aria-hidden="true">
                    <i className="origin-galaxy-core" />
                    <i className="origin-galaxy-ring ring-one" />
                    <i className="origin-galaxy-ring ring-two" />
                    <i className="origin-galaxy-star star-one" />
                    <i className="origin-galaxy-star star-two" />
                    <i className="origin-galaxy-star star-three" />
                  </span>
                  <span className="origin-galaxy-copy"><small>04 / PUBLISHING</small><strong>AutoBookPress</strong></span>
                </a>
              </div>
            </div>
            <p className="scene-instruction"><span /> Scroll to travel. Move your pointer to influence the field.</p>
          </div>
        </section>

        <section id="studio" className="universe-chapter studio-chapter" data-universe-scene="1">
          <div className="universe-chapter-viewport">
            <SceneChrome sceneIndex={1} />
            <div className="galaxy-heading">
              <div>
                <SceneEyebrow number="GALAXY / 01" accent="#8df9ff">QUANTUMNOVA Studio</SceneEyebrow>
                <h2>Technology<br />people can enter.</h2>
              </div>
              <p>We design and develop custom interactive websites for Australian and international brands that need more than a template. Strategy, content architecture, WebGL, motion, ecommerce integration and production engineering become one memorable digital system.</p>
            </div>

            <div className="studio-system glass-observatory">
              <div className="studio-orbit" aria-label="Studio capabilities">
                <div className="studio-orbit-line line-one" aria-hidden="true" />
                <div className="studio-orbit-line line-two" aria-hidden="true" />
                <div className="studio-core" aria-hidden="true"><span>Q</span><small>YOUR WORLD</small></div>
                {capabilities.map((capability, index) => (
                  <button
                    key={capability.title}
                    type="button"
                    className={capabilityIndex === index ? `studio-node node-${index} active` : `studio-node node-${index}`}
                    onClick={() => setCapabilityIndex(index)}
                    aria-pressed={capabilityIndex === index}
                  >
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <span>{capability.title}</span>
                  </button>
                ))}
              </div>
              <div className="studio-readout" aria-live="polite">
                <div className="readout-topline"><span>SELECTED SYSTEM</span><span>{capabilities[capabilityIndex].signal}</span></div>
                <strong>{capabilities[capabilityIndex].title}</strong>
                <p>{capabilities[capabilityIndex].copy}</p>
                <PortalLink href="/start-project" quiet>Request a scoped quote</PortalLink>
              </div>
            </div>
            <div className="seo-signal-row" aria-label="Studio services">
              <span>Custom 3D website design</span>
              <span>Interactive WebGL development</span>
              <span>Immersive product experiences</span>
              <span>Next.js website development</span>
              <span>Ecommerce integrations</span>
              <span>Technical SEO and analytics</span>
            </div>
            <div className="studio-delivery glass-observatory">
              <section className="studio-process" aria-labelledby="studio-process-title">
                <p className="studio-delivery-label">CLIENT DELIVERY / PROCESS</p>
                <h3 id="studio-process-title">A clear path from brief to launch.</h3>
                <ol>
                  {studioProcess.map((step) => (
                    <li key={step.number}>
                      <small>{step.number}</small>
                      <strong>{step.title}</strong>
                      <p>{step.copy}</p>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="studio-outcomes" aria-labelledby="studio-outcomes-title">
                <p className="studio-delivery-label">DESIGN TARGETS / OUTCOMES</p>
                <h3 id="studio-outcomes-title">Results defined before the build.</h3>
                <p>Every engagement begins with outcome targets that can guide creative decisions and be measured after launch.</p>
                <ul>
                  {studioOutcomeTargets.map((outcome) => <li key={outcome}>{outcome}</li>)}
                </ul>
              </section>
            </div>
          </div>
        </section>

        <section id="pixionyx" className="universe-chapter pixionyx-chapter" data-universe-scene="2">
          <div className="universe-chapter-viewport">
            <SceneChrome sceneIndex={2} />
            <div className="galaxy-heading compact-heading">
              <div>
                <SceneEyebrow number="GALAXY / 02" accent="#ff768e">QUANTUMNOVA brand / PixiOnyx</SceneEyebrow>
                <h2>Statement apparel<br />in live orbit.</h2>
              </div>
              <div>
                <p>Independent apparel, artist merch and statement designs, connected to the live PixiOnyx catalogue and presented as a spatial product world.</p>
                <PortalLink href="https://www.pixionyx.com/collections/clothing" quiet>Shop PixiOnyx</PortalLink>
              </div>
            </div>

            <div className="product-galaxy">
              <div className="product-portal glass-observatory">
                <div className="product-portal-topline">
                  <span>LIVE PRODUCT / {String(lookIndex + 1).padStart(2, "0")}</span>
                  <span className="live-catalogue-signal"><i /> {looks.length} PRODUCTS SYNCED</span>
                </div>
                <a
                  key={`pair-${activeLook.url}`}
                  className={`product-pair showing-${productSide}`}
                  href={activeLook.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Shop ${activeLook.title} at PixiOnyx`}
                >
                  <figure className="product-face product-front">
                    <span>FRONT</span>
                    <img
                      src={activeLook.frontImage}
                      alt={`Front of ${activeLook.title}`}
                      loading={activeScene === 2 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={activeScene === 2 ? "high" : "auto"}
                    />
                  </figure>
                  <figure className="product-face product-back">
                    <span>BACK</span>
                    <img src={activeLook.backImage} alt={`Back of ${activeLook.title}`} loading="lazy" decoding="async" />
                  </figure>
                  <div className="product-gravity-ring" aria-hidden="true" />
                  <span className="product-open-cue">SHOP PRODUCT ↗</span>
                </a>
                <div className="product-side-controls" aria-label="Product side">
                  <button type="button" className={productSide === "front" ? "active" : ""} onClick={() => { lastProductInteraction.current = Date.now(); setProductSide("front"); }}>Front</button>
                  <button type="button" className={productSide === "back" ? "active" : ""} onClick={() => { lastProductInteraction.current = Date.now(); setProductSide("back"); }}>Back</button>
                </div>
                <div key={`readout-${activeLook.url}`} className="product-readout">
                  <div><small>{activeLook.format}</small><strong>{activeLook.shortTitle}</strong></div>
                  <div><span>{activeLook.price}</span><PortalLink href={activeLook.url} quiet>View product</PortalLink></div>
                </div>
              </div>

              <SpatialCarousel
                items={looks}
                index={lookIndex}
                onChange={(nextIndex) => {
                  lastProductInteraction.current = Date.now();
                  setLookIndex(nextIndex);
                  setProductSide("front");
                }}
                label="Garment position"
                className="product-carousel"
                visibleSlots={9}
                getKey={(look) => look.url}
                onActiveItemClick={(look) => {
                  lastProductInteraction.current = Date.now();
                  const productWindow = window.open(look.url, "_blank", "noopener,noreferrer");
                  if (productWindow) productWindow.opener = null;
                }}
                renderItem={(look, itemIndex, active, nearby) => (
                  <span className="product-orbit-card">
                    <span className="product-card-image">
                      <img
                        src={look.frontImage}
                        alt=""
                        loading={activeScene === 2 && nearby ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={activeScene === 2 && active ? "high" : "auto"}
                      />
                      <i>{String(itemIndex + 1).padStart(2, "0")}</i>
                    </span>
                    <b>{look.shortTitle}</b>
                    <small>{look.format}</small>
                  </span>
                )}
              />
            </div>
          </div>
        </section>

        <section id="records" className="universe-chapter records-chapter" data-universe-scene="3">
          <div className="universe-chapter-viewport">
            <SceneChrome sceneIndex={3} />
            <div className="galaxy-heading compact-heading">
              <div>
                <SceneEyebrow number="GALAXY / 03" accent="#58d9ff">QUANTUMNOVA Records</SceneEyebrow>
                <h2>Independent music<br />without a single lane.</h2>
              </div>
              <p>Every QUANTUMNOVA playlist and ten artists live inside one expandable listening galaxy. Select a signal, then play it without leaving the experience.</p>
            </div>

            <div className="records-console glass-observatory">
              <div className="records-console-topline">
                <div className="records-tabs" role="tablist" aria-label="Records view">
                  <button type="button" role="tab" aria-selected={recordView === "playlists"} className={recordView === "playlists" ? "active" : ""} onClick={() => setRecordView("playlists")}>Playlists</button>
                  <button type="button" role="tab" aria-selected={recordView === "artists"} className={recordView === "artists" ? "active" : ""} onClick={() => setRecordView("artists")}>Artists</button>
                </div>
                <span>{recordView === "playlists" ? `${playlists.length} CURATED SIGNALS` : `${artists.length} ARTIST CONSTELLATIONS`}</span>
              </div>

              {recordView === "playlists" ? (
                <div className="records-view playlist-view" role="tabpanel">
                  <SpatialCarousel
                    items={playlists}
                    index={playlistIndex}
                    onChange={setPlaylistIndex}
                    label="Playlist position"
                    className="playlist-carousel"
                    visibleSlots={7}
                    getKey={(playlist) => playlist.id}
                    renderItem={(playlist, itemIndex) => (
                      <span className="vinyl-planet">
                        <img src={playlist.cover} alt="" loading="lazy" />
                        <span className="vinyl-grooves" aria-hidden="true" />
                        <i>{String(itemIndex + 1).padStart(2, "0")}</i>
                      </span>
                    )}
                  />
                  <div className="spotify-capsule">
                    <div>
                      <small>{activePlaylist.eyebrow}</small>
                      <strong>{activePlaylist.title}</strong>
                      <p>{activePlaylist.detail}</p>
                    </div>
                    <iframe
                      key={activePlaylist.id}
                      src={`https://open.spotify.com/embed/playlist/${activePlaylist.id}?utm_source=generator&theme=0`}
                      title={`${activePlaylist.title} Spotify player`}
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    />
                  </div>
                </div>
              ) : (
                <div className="records-view artist-view" role="tabpanel">
                  <SpatialCarousel
                    items={artists}
                    index={artistIndex}
                    onChange={setArtistIndex}
                    label="Artist position"
                    className="artist-carousel"
                    visibleSlots={9}
                    getKey={(artist) => artist.name}
                    renderItem={(artist, itemIndex) => (
                      <span className="artist-moon">
                        <img src={artist.cover} alt="" loading="lazy" />
                        <i>{String(itemIndex + 1).padStart(2, "0")}</i>
                      </span>
                    )}
                  />
                  <div className="artist-capsule">
                    <img src={activeArtist.cover} alt={`${activeArtist.name}, ${activeArtist.release}`} />
                    <div>
                      <small>LATEST RELEASE / {String(artistIndex + 1).padStart(2, "0")}</small>
                      <strong>{activeArtist.name}</strong>
                      <p>{activeArtist.release}</p>
                      <PortalLink href={`https://open.spotify.com/album/${activeArtist.spotify}`} quiet>Listen on Spotify</PortalLink>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="books" className="universe-chapter books-chapter" data-universe-scene="4">
          <div className="universe-chapter-viewport">
            <SceneChrome sceneIndex={4} />
            <div className="galaxy-heading compact-heading">
              <div>
                <SceneEyebrow number="GALAXY / 04" accent="#ffc86b">QUANTUMNOVA brand / AutoBookPress</SceneEyebrow>
                <h2>A publishing world<br />with room to expand.</h2>
              </div>
              <p>A curated AutoBookPress catalogue spanning practical non-fiction and fiction, presented as a tactile orbital library with room for every future release.</p>
            </div>

            <div className="book-observatory glass-observatory">
              <div className="book-observatory-topline">
                <span>ORBITAL LIBRARY</span>
                <span>{bookSyncActive ? "CATALOGUE SYNC ACTIVE" : `${books.length} FEATURED TITLES`}</span>
              </div>
              <SpatialCarousel
                items={books}
                index={bookIndex}
                onChange={setBookIndex}
                label="Book position"
                className="book-carousel"
                visibleSlots={9}
                getKey={(book) => book.asin}
                renderItem={(book) => (
                  <span className="orbit-book" style={{ "--book-glow": book.accent } as CSSProperties}>
                    <span className="orbit-book-cover">
                      <img src={book.cover} alt={`${book.title} cover`} loading="lazy" />
                      <i aria-hidden="true" />
                    </span>
                    <span className="orbit-book-spine"><b>{book.title}</b></span>
                    <span className="orbit-book-pages" />
                  </span>
                )}
              />
              <div className="book-capsule" aria-live="polite">
                <div>
                  <small>{activeBook.category}</small>
                  <strong>{activeBook.title}</strong>
                  <p>{activeBook.subtitle}</p>
                </div>
                <PortalLink href={activeBook.url} quiet>View on Amazon</PortalLink>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="universe-chapter contact-chapter" data-universe-scene="5">
          <div className="universe-chapter-viewport">
            <SceneChrome sceneIndex={5} />
            <div className="contact-portal">
              <div className="contact-signal" aria-hidden="true">
                <span className="contact-core">Q</span>
                <i className="contact-ring ring-one" />
                <i className="contact-ring ring-two" />
                <i className="contact-ring ring-three" />
              </div>
              <div className="contact-copy glass-observatory">
                <SceneEyebrow number="PORTAL / 05" accent="#b08cff">Build with QUANTUMNOVA</SceneEyebrow>
                <h2>Your brand could be<br />its own destination.</h2>
                <p>From strategy and content architecture through 3D design, WebGL development, ecommerce integration, technical SEO and launch, we can shape the complete digital experience. Tell us what you are building and our project portal will gather the detail required for an accurate, considered quote.</p>
                <PortalLink href="/start-project">Scope your project</PortalLink>
                <div className="contact-capabilities">
                  <span>Immersive websites</span>
                  <span>3D product worlds</span>
                  <span>Ecommerce integrations</span>
                  <span>Motion and interaction systems</span>
                  <span>Technical SEO and analytics</span>
                  <span>Accessible responsive delivery</span>
                </div>
              </div>
            </div>
            <footer className="universe-footer">
              <span>© 2026 QUANTUMNOVA PTY LTD</span>
              <span>ABN 43686016526</span>
              <a href="mailto:admin@quantumnova.com.au">admin@quantumnova.com.au</a>
              <a href="#home">Return to origin ↑</a>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
