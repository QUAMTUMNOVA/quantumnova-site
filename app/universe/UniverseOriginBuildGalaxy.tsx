"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function UniverseOriginBuildGalaxy() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.querySelector<HTMLElement>(".origin-orbit-labels"));
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
