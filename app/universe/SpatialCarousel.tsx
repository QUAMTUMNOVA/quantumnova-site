"use client";

import {
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type SpatialCarouselProps<T> = {
  items: readonly T[];
  index: number;
  onChange: (index: number) => void;
  label: string;
  className?: string;
  visibleSlots?: number;
  renderItem: (item: T, itemIndex: number, active: boolean, nearby: boolean) => ReactNode;
  getKey: (item: T, itemIndex: number) => string;
  onActiveItemClick?: (item: T, itemIndex: number) => void;
};

export function wrapIndex(index: number, length: number) {
  if (!length) return 0;
  return (index + length) % length;
}

export function circularDelta(index: number, active: number, length: number) {
  let delta = index - active;
  if (delta > length / 2) delta -= length;
  if (delta < -length / 2) delta += length;
  return delta;
}

function itemStyle(
  itemIndex: number,
  activeIndex: number,
  length: number,
  visibleSlots: number,
) {
  const delta = circularDelta(itemIndex, activeIndex, length);
  const halfSlots = Math.floor(visibleSlots / 2);
  const hidden = Math.abs(delta) > halfSlots;
  const normalized = Math.max(-halfSlots, Math.min(halfSlots, delta)) / Math.max(1, halfSlots);
  const angle = normalized * 1.18;
  const visibility = Math.max(0, Math.cos(angle));

  return {
    "--orbit-slot": delta,
    "--orbit-x": `${(Math.sin(angle) * 34).toFixed(3)}vw`,
    "--orbit-z": `${(Math.cos(angle) * 260 - 260).toFixed(2)}px`,
    "--orbit-turn": `${(-Math.sin(angle) * 42).toFixed(2)}deg`,
    "--orbit-scale": (0.64 + visibility * 0.36).toFixed(3),
    opacity: hidden ? 0 : Math.max(0.07, Math.pow(visibility, 1.55)),
    zIndex: Math.round(visibility * 100),
    pointerEvents: hidden || visibility < 0.14 ? "none" : "auto",
  } as CSSProperties;
}

export default function SpatialCarousel<T>({
  items,
  index,
  onChange,
  label,
  className = "",
  visibleSlots = 9,
  renderItem,
  getKey,
  onActiveItemClick,
}: SpatialCarouselProps<T>) {
  const gesture = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    travel: 0,
    changed: false,
  });
  const blockClickUntil = useRef(0);

  const changeBy = (direction: number) => {
    onChange(wrapIndex(index + direction, items.length));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !items.length) return;
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      travel: 0,
      changed: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - current.lastX;
    const totalX = event.clientX - current.startX;
    const totalY = event.clientY - current.startY;
    current.lastX = event.clientX;
    current.travel += deltaX;

    if (Math.abs(totalX) < 8 || Math.abs(totalX) <= Math.abs(totalY)) return;
    current.changed = true;
    event.preventDefault();
    const threshold = window.innerWidth <= 700 ? 46 : 72;
    if (Math.abs(current.travel) >= threshold) {
      changeBy(current.travel < 0 ? 1 : -1);
      current.travel = 0;
    }
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (current.pointerId !== event.pointerId) return;
    if (current.changed) blockClickUntil.current = performance.now() + 220;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    current.pointerId = -1;
  };

  if (!items.length) return null;

  return (
    <div className={`spatial-carousel ${className}`}>
      <div
        className="spatial-carousel-stage"
        role="group"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            changeBy(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            changeBy(-1);
          }
        }}
      >
        <div className="spatial-orbit-line" aria-hidden="true" />
        {items.map((item, itemIndex) => {
          const delta = Math.abs(circularDelta(itemIndex, index, items.length));
          return (
            <button
              key={getKey(item, itemIndex)}
              type="button"
              className={itemIndex === index ? "spatial-orbit-item active" : "spatial-orbit-item"}
              style={itemStyle(itemIndex, index, items.length, visibleSlots)}
              onClick={() => {
                if (performance.now() < blockClickUntil.current) return;
                if (itemIndex === index && onActiveItemClick) {
                  onActiveItemClick(item, itemIndex);
                  return;
                }
                onChange(itemIndex);
              }}
              aria-label={`Select item ${itemIndex + 1} of ${items.length}`}
              aria-pressed={itemIndex === index}
            >
              {renderItem(item, itemIndex, itemIndex === index, delta <= 3)}
            </button>
          );
        })}
      </div>
      <div className="spatial-carousel-controls">
        <button type="button" onClick={() => changeBy(-1)} aria-label={`Previous ${label}`}>
          <span aria-hidden="true">←</span>
        </button>
        <label>
          <span>{label}</span>
          <input
            type="range"
            min="0"
            max={Math.max(0, items.length - 1)}
            value={index}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label={label}
          />
          <output>{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</output>
        </label>
        <button type="button" onClick={() => changeBy(1)} aria-label={`Next ${label}`}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="spatial-carousel-hint">Drag, swipe, select, use arrows, or use the slider</p>
    </div>
  );
}
