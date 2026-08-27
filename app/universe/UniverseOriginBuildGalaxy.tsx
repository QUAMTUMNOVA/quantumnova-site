"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function UniverseOriginBuildGalaxy() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.querySelector<HTMLElement>(".origin-orbit-labels"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const updateMobileReturnState = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!window.matchMedia("(max-width: 760px)").matches) {
          delete root.dataset.mobilePastOriginNav;
          return;
        }

        const orbit = document.querySelector<HTMLElement>(".origin-orbit-labels");
        if (!orbit) {
          root.dataset.mobilePastOriginNav = "false";
          return;
        }

        const orbitTop = window.scrollY + orbit.getBoundingClientRect().top;
        const revealThreshold = Math.max(0, orbitTop - window.innerHeight * 0.55);
        root.dataset.mobilePastOriginNav = window.scrollY >= revealThreshold ? "true" : "false";
      });
    };

    updateMobileReturnState();
    window.addEventListener("scroll", updateMobileReturnState, { passive: true });
    window.addEventListener("resize", updateMobileReturnState, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateMobileReturnState);
      window.removeEventListener("resize", updateMobileReturnState);
      delete root.dataset.mobilePastOriginNav;
    };
  }, []);

  if (!target) return null;

  return createPortal(
    <a className="origin-galaxy label-contact" href="#contact" aria-label="Travel to the Build With Us galaxy">
      <span className="origin-galaxy-system contact-system-mini" aria-hidden="true">
        <i className="origin-galaxy-core" />
        <i className="origin-galaxy-ring ring-one" />
        <i className="origin-galaxy-ring ring-two" />
        <i className="origin-galaxy-star star-one" />
        <i className="origin-galaxy-star star-two" />
        <i className="origin-galaxy-star star-three" />
      </span>
      <span className="origin-galaxy-copy">
        <small>05 / BUILD WITH US</small>
        <strong>Build with QUANTUMNOVA</strong>
      </span>
    </a>,
    target,
  );
}
