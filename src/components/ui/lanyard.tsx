"use client";

// Lanyard — a glass ID card hanging from a printed fabric strap. Drag it
// around, throw it, let it swing; tap/click (or Enter) flips it to the back.
// The motion comes from a small Verlet simulation (src/lib/lanyard-physics.ts);
// this component wires pointer input to it and paints the result: the strap
// as layered SVG strokes (gradient, stitched edges, text along the curve) and
// the card as a 3D-transformed element with real HTML on both faces.

import * as React from "react";
import { LanyardSim, type Point } from "@/lib/lanyard-physics";
import { clamp, lerp } from "@/lib/math";
import { cn } from "@/lib/utils";

/** Design size of the card faces; the card is scaled to fit the container. */
export const CARD_WIDTH = 300;
export const CARD_HEIGHT = 420;

/** Glass thickness in px. Slabs between the faces show it when the card twists. */
const THICKNESS = 6;
const EDGE_DEPTHS = [-THICKNESS / 3, 0, THICKNESS / 3];

const STEP = 1 / 120;
const SEGMENTS = 14;
const DRAG_THRESHOLD = 6;
const CLICK_MS = 320;
/** Strap width at scale 1, in px. */
const STRAP = 22;
const STRAP_PATH_ID = "lanyard-strap-center";
const STRAP_FILL_ID = "lanyard-strap-fill";

interface DragState {
  id: number;
  x: number;
  y: number;
  time: number;
  moved: boolean;
}

/** Smooth path through the rope particles (quadratic midpoints). */
function strapPath(points: readonly Point[]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const next = points[i + 1];
    d += `Q${f(p.x)} ${f(p.y)} ${f((p.x + next.x) / 2)} ${f((p.y + next.y) / 2)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${f(last.x)} ${f(last.y)}`;
}

function Clip() {
  return (
    <div className="flex flex-col items-center">
      <div className="size-5 rounded-full border-[3.5px] border-[#b7c0cd] shadow-[inset_0_1px_1px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,0.85)]" />
      <div className="-mt-1 grid h-[30px] w-[54px] place-items-center rounded-[9px] bg-[linear-gradient(180deg,#fdfeff,#cfd6e1_45%,#97a2b4)] shadow-[0_8px_14px_-6px_rgba(14,27,61,0.6),inset_0_1px_0_#fff,inset_0_-2px_3px_rgba(14,27,61,0.18)] ring-1 ring-black/10">
        <div className="h-3 w-[34px] rounded-[5px] bg-[linear-gradient(180deg,#7f8a9d,#e3e8ef)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]" />
      </div>
    </div>
  );
}

export interface LanyardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  /** Printed along the strap, repeated to fill it. */
  strapText?: string;
  /** Horizontal anchor position as a share of the container width. */
  anchorX?: number;
  /** Largest card scale (1 = 300×420 px). */
  maxScale?: number;
  label?: string;
  className?: string;
}

export function Lanyard({
  front,
  back,
  strapText = "",
  anchorX = 0.5,
  maxScale = 1,
  label = "ID card. Drag to swing it, click or press Enter to flip it.",
  className,
}: LanyardProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const flipperRef = React.useRef<HTMLDivElement>(null);
  const fillRef = React.useRef<SVGLinearGradientElement>(null);
  const shadowRef = React.useRef<SVGPathElement>(null);
  const baseRef = React.useRef<SVGPathElement>(null);
  const stitchRef = React.useRef<SVGPathElement>(null);
  const centerRef = React.useRef<SVGPathElement>(null);
  const textRef = React.useRef<SVGTextElement>(null);
  const pinRef = React.useRef<SVGGElement>(null);
  const simRef = React.useRef<LanyardSim | null>(null);
  const flipRef = React.useRef({ target: 0, angle: 0, velocity: 0 });
  const dragRef = React.useRef<DragState | null>(null);

  const printed = strapText ? Array.from({ length: 6 }, () => strapText).join("   ✦   ") : "";

  React.useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    const flipper = flipperRef.current;
    const fill = fillRef.current;
    const text = textRef.current;
    const pin = pinRef.current;
    const paths = [shadowRef.current, baseRef.current, stitchRef.current, centerRef.current];
    if (!root || !card || !flipper || !fill || !text || !pin || paths.some((p) => !p)) return;
    const [shadow, base, stitch, center] = paths as SVGPathElement[];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scale = 1;
    let size = "";
    let raf = 0;
    let last = 0;
    let acc = 0;
    let time = 0;
    let twist = 0;
    let prevCx = 0;
    let prevScroll = window.scrollY;
    let entered = false;

    const build = () => {
      const { width, height } = root.getBoundingClientRect();
      const nextSize = `${Math.round(width)}x${Math.round(height)}`;
      if (width < 40 || height < 40 || nextSize === size) return;
      size = nextSize;

      const wide = window.matchMedia("(min-width: 1024px)").matches;
      scale = clamp((height * (wide ? 0.5 : 0.62)) / CARD_HEIGHT, 0.5, maxScale);
      // Desktop: the strap drops in from above the page. Mobile: a visible pin.
      const anchor = { x: width * anchorX, y: wide ? -90 : 12 };
      const cardTop = wide ? clamp(height * 0.2, 130, 230) : Math.max(64, height * 0.13);
      const sim = new LanyardSim({
        anchor,
        ropeLength: cardTop - anchor.y,
        segments: SEGMENTS,
        card: { width: CARD_WIDTH * scale, height: CARD_HEIGHT * scale },
      });
      if (!entered && !reduced) sim.swing(wide ? 0.85 : 0.55);
      entered = true;
      simRef.current = sim;
      prevCx = sim.pose().cx;

      // Layered strap: base, a dashed stroke that only shows at the edges
      // (the stitching), then a narrower centre band carrying the print.
      shadow.setAttribute("stroke-width", String(STRAP * scale));
      base.setAttribute("stroke-width", String(STRAP * scale));
      stitch.setAttribute("stroke-width", String((STRAP - 4) * scale));
      stitch.setAttribute("stroke-dasharray", `${3.2 * scale} ${3.6 * scale}`);
      center.setAttribute("stroke-width", String((STRAP - 7.5) * scale));
      text.setAttribute("font-size", String(7.2 * scale));
      text.setAttribute("letter-spacing", String(1.4 * scale));
      pin.setAttribute("transform", `translate(${anchor.x} ${anchor.y})`);
      pin.style.display = wide ? "none" : "";
      card.style.opacity = "1";
    };

    const render = () => {
      const sim = simRef.current;
      if (!sim) return;
      const pose = sim.pose();
      card.style.transform = `translate3d(${(pose.x - CARD_WIDTH / 2).toFixed(2)}px, ${pose.y.toFixed(2)}px, 0) rotate(${pose.angle.toFixed(4)}rad) scale(${scale})`;

      // Sideways speed twists the card in 3D; a damped spring drives the flip.
      const vx = pose.cx - prevCx;
      prevCx = pose.cx;
      twist = lerp(twist, clamp(vx * 2.4, -38, 38), 0.12);
      const flip = flipRef.current;
      flip.velocity = (flip.velocity + (flip.target - flip.angle) * 0.07) * 0.8;
      flip.angle += flip.velocity;
      flipper.style.transform = `rotateY(${(flip.angle + twist).toFixed(2)}deg)`;
      flipper.style.setProperty("--sheen", `${(twist * 2 - pose.angle * 140).toFixed(1)}%`);

      const rope = sim.rope;
      const d = strapPath(rope);
      shadow.setAttribute("d", d);
      base.setAttribute("d", d);
      stitch.setAttribute("d", d);
      center.setAttribute("d", d);
      // The fabric gradient runs from the anchor to the clip, wherever they are.
      const first = rope[0];
      const end = rope[rope.length - 1];
      fill.setAttribute("x1", first.x.toFixed(1));
      fill.setAttribute("y1", first.y.toFixed(1));
      fill.setAttribute("x2", end.x.toFixed(1));
      fill.setAttribute("y2", end.y.toFixed(1));
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const sim = simRef.current;
      if (!sim) return;
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : STEP;
      last = now;
      time += dt;
      acc += dt;

      if (!reduced && !sim.isGrabbed) {
        // Scrolling gives the card a little kick; a soft breeze keeps it alive.
        const scrollDelta = window.scrollY - prevScroll;
        if (Math.abs(scrollDelta) > 0.5) sim.nudge(clamp(scrollDelta * 0.03, -4, 4), 0);
      }
      prevScroll = window.scrollY;
      const wind =
        reduced || sim.isGrabbed ? 0 : (Math.sin(time * 0.75) * 0.65 + Math.sin(time * 1.9 + 1.3) * 0.35) * 85;

      while (acc >= STEP) {
        sim.step(STEP, wind);
        acc -= STEP;
      }
      render();
    };

    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    build();
    render();
    const resize = new ResizeObserver(build);
    resize.observe(root);
    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? start() : stop()));
    io.observe(root);

    return () => {
      stop();
      resize.disconnect();
      io.disconnect();
    };
  }, [anchorX, maxScale]);

  const toggleFlip = () => {
    const flip = flipRef.current;
    flip.target = flip.target === 0 ? 180 : 0;
  };

  const localPoint = (e: React.PointerEvent) => {
    const box = rootRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const sim = simRef.current;
    const point = localPoint(e);
    if (!sim || !point || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    sim.grab(point.x, point.y);
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, time: e.timeStamp, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const point = localPoint(e);
    if (!drag || drag.id !== e.pointerId || !point) return;
    simRef.current?.drag(point.x, point.y);
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > DRAG_THRESHOLD) drag.moved = true;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>, canFlip: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    simRef.current?.release();
    if (canFlip && !drag.moved && e.timeStamp - drag.time < CLICK_MS) toggleFlip();
    dragRef.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      simRef.current?.nudge(e.key === "ArrowLeft" ? -14 : 14, 0);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative h-full w-full", className)}>
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient ref={fillRef} id={STRAP_FILL_ID} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="300">
            <stop offset="0" stopColor="#0a1636" />
            <stop offset="0.55" stopColor="#1d3d99" />
            <stop offset="1" stopColor="#132a66" />
          </linearGradient>
          <radialGradient id="lanyard-pin" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#c3cad6" />
            <stop offset="1" stopColor="#8a94a6" />
          </radialGradient>
        </defs>
        <path ref={shadowRef} transform="translate(6 10)" fill="none" stroke="rgba(14,27,61,0.14)" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={baseRef} fill="none" stroke={`url(#${STRAP_FILL_ID})`} strokeLinecap="round" strokeLinejoin="round" />
        <path ref={stitchRef} fill="none" stroke="rgba(255,255,255,0.75)" strokeLinejoin="round" />
        <path
          ref={centerRef}
          id={STRAP_PATH_ID}
          fill="none"
          stroke={`url(#${STRAP_FILL_ID})`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          ref={textRef}
          fill="#ffcd3c"
          fontWeight={700}
          dominantBaseline="central"
          style={{ fontFamily: "var(--font-jetbrains), ui-monospace, monospace" }}
        >
          <textPath href={`#${STRAP_PATH_ID}`} startOffset="18">
            {printed}
          </textPath>
        </text>
        <g ref={pinRef} style={{ display: "none" }}>
          <circle r="12" fill="url(#lanyard-pin)" stroke="rgba(14,27,61,0.25)" />
          <circle r="4.5" fill="#0e1b3d" opacity="0.7" />
        </g>
      </svg>

      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, true)}
        onPointerCancel={(e) => endDrag(e, false)}
        onLostPointerCapture={(e) => endDrag(e, false)}
        onKeyDown={onKeyDown}
        className="absolute left-0 top-0 h-[420px] w-[300px] origin-[150px_0px] cursor-grab touch-none rounded-[22px] opacity-0 transition-opacity duration-700 select-none [perspective:1400px] active:cursor-grabbing"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[80%]">
          <Clip />
        </div>
        <div ref={flipperRef} className="relative h-full w-full transform-3d">
          {EDGE_DEPTHS.map((depth) => (
            <div key={depth} aria-hidden="true" className="glass-edge" style={{ transform: `translateZ(${depth}px)` }} />
          ))}
          <div className="absolute inset-0 backface-hidden" style={{ transform: `translateZ(${THICKNESS / 2}px)` }}>
            {front}
          </div>
          <div
            className="absolute inset-0 backface-hidden"
            style={{ transform: `rotateY(180deg) translateZ(${THICKNESS / 2}px)` }}
          >
            {back}
          </div>
        </div>
      </div>
    </div>
  );
}
