"use client";

// Portal — the "perspective tunnel" moment. A wall of blueprint paper with an
// airplane-style window; through the glass you can already see the tunnel.
// Scrolling pushes the camera through the window (everything on the wall
// scales around its centre, like a dolly-in), the glass becomes the whole
// screen, and you keep flying down the tunnel until the Projects title rushes
// out of the light.
//
// The wall is an SVG path rebuilt every frame (outer rect minus the window)
// so the window edge stays razor sharp at any zoom.

import { useRef } from "react";
import { about } from "@/data/portfolio";
import { TunnelCanvas, type TunnelState } from "@/components/visuals/tunnel-canvas";
import { fontMono } from "@/lib/fonts";
import { gsap, useGSAP } from "@/lib/gsap";
import { clamp, easeInOutSine, easeOutCubic, smoothstep } from "@/lib/math";

/** Scroll progress at which the window fills the screen. */
const ZOOM_END = 0.48;
/** Window frame thickness at zoom 1, in px. */
const BEZEL = 22;

interface Geometry {
  w: number;
  h: number;
  cx: number;
  cy: number;
  /** Half width / half height of the window at zoom 1. */
  hw: number;
  hh: number;
  /** Zoom at which the window covers the whole viewport. */
  zMax: number;
}

const n = (value: number) => value.toFixed(1);

function roundedRect(x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.min(radius, w / 2, h / 2);
  return (
    `M${n(x + r)} ${n(y)}H${n(x + w - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}` +
    `V${n(y + h - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w - r)} ${n(y + h)}` +
    `H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + h - r)}` +
    `V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`
  );
}

/** A vertical pill (stadium) centred on (cx, cy). */
function windowPath(cx: number, cy: number, hw: number, hh: number) {
  return roundedRect(cx - hw, cy - hh, hw * 2, hh * 2, Math.min(hw, hh));
}

/** Smallest zoom at which the scaled window contains every viewport corner. */
function coverZoom({ w, h, cx, cy, hw, hh }: Omit<Geometry, "zMax">) {
  const dx = Math.max(cx, w - cx);
  const dy = Math.max(cy, h - cy);
  const covers = (zoom: number) => {
    const a = hw * zoom;
    const b = hh * zoom;
    const r = Math.min(a, b);
    if (dx > a || dy > b) return false;
    const straight = b - r;
    return dy <= straight || Math.hypot(Math.max(0, dx - (a - r)), dy - straight) <= r;
  };
  let lo = 1;
  let hi = 200;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (covers(mid)) hi = mid;
    else lo = mid;
  }
  return hi * 1.04;
}

export function Portal() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const patternRef = useRef<SVGPatternElement>(null);
  const wallRef = useRef<SVGPathElement>(null);
  const dotsRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const shadeRef = useRef<SVGPathElement>(null);
  const blindRef = useRef<SVGPathElement>(null);
  const handleRef = useRef<SVGPathElement>(null);
  const glassRef = useRef<SVGPathElement>(null);
  const bezelRef = useRef<SVGPathElement>(null);
  const rimRef = useRef<SVGPathElement>(null);
  const wallContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tunnel = useRef<TunnelState>({ travel: 0, glow: 0.3 });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const svg = svgRef.current;
      const pattern = patternRef.current;
      const content = wallContentRef.current;
      const title = titleRef.current;
      const paths = [wallRef, dotsRef, clipRef, shadeRef, blindRef, handleRef, glassRef, bezelRef, rimRef].map(
        (ref) => ref.current,
      );
      if (!section || !stage || !svg || !pattern || !content || !title || paths.some((p) => !p)) return;
      const [wall, dots, clip, shade, blind, handle, glass, bezel, rim] = paths as SVGPathElement[];

      let geo: Geometry = { w: 1, h: 1, cx: 0, cy: 0, hw: 1, hh: 1, zMax: 1 };
      const progress = { value: 0 };

      const layout = () => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const mobile = w < 768;
        const base = {
          w,
          h,
          cx: w / 2,
          cy: h / 2,
          hw: mobile ? Math.min(w * 0.25, 130) : clamp(w * 0.115, 120, 175),
          hh: mobile ? Math.min(h * 0.22, 200) : clamp(h * 0.3, 180, 280),
        };
        geo = { ...base, zMax: coverZoom(base) };
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        stage.style.setProperty("--hw", `${base.hw}px`);
        stage.style.setProperty("--hh", `${base.hh}px`);
        content.style.transformOrigin = `${base.cx}px ${base.cy}px`;
      };

      const render = (p: number) => {
        const { w, h, cx, cy, zMax } = geo;
        const zoomT = clamp(p / ZOOM_END);
        // Exponential dolly: constant *rate* of scale change reads as constant speed.
        const zoom = Math.exp(Math.log(zMax) * easeInOutSine(zoomT));

        const covered = zoomT >= 1;
        svg.style.visibility = covered ? "hidden" : "visible";
        if (!covered) {
          const hw = geo.hw * zoom;
          const hh = geo.hh * zoom;
          const hole = windowPath(cx, cy, hw, hh);
          // Bleed past the edges so sub-pixel sizing never lets the tunnel peek through.
          const frame = `M-4 -4H${n(w + 4)}V${n(h + 4)}H-4Z`;
          wall.setAttribute("d", frame + hole);
          dots.setAttribute("d", frame + hole);
          pattern.setAttribute(
            "patternTransform",
            `translate(${n(cx)} ${n(cy)}) scale(${zoom.toFixed(4)}) translate(${n(-cx)} ${n(-cy)})`,
          );
          clip.setAttribute("d", hole);
          shade.setAttribute("d", hole);
          shade.setAttribute("stroke-width", n(26 * zoom));
          glass.setAttribute("d", hole);
          rim.setAttribute("d", hole);
          rim.setAttribute("stroke-width", (1.4 * zoom).toFixed(2));
          const t = BEZEL * zoom;
          bezel.setAttribute("d", windowPath(cx, cy, hw + t, hh + t) + hole);
          // The half-pulled window blind with its little handle.
          const blindH = hh * 2 * 0.15;
          blind.setAttribute("d", `M${n(cx - hw)} ${n(cy - hh)}H${n(cx + hw)}V${n(cy - hh + blindH)}H${n(cx - hw)}Z`);
          handle.setAttribute("d", roundedRect(cx - 16 * zoom, cy - hh + blindH - 9 * zoom, 32 * zoom, 6 * zoom, 3 * zoom));
        }

        // Everything printed on the wall rides the same dolly, then fades away.
        content.style.transform = `scale(${zoom.toFixed(4)})`;
        const wallFade = 1 - smoothstep(0.08, 0.3, p);
        content.style.opacity = wallFade.toFixed(3);
        content.style.visibility = wallFade <= 0.001 ? "hidden" : "visible";

        tunnel.current.travel = p * 12;
        tunnel.current.glow = 0.3 + 0.7 * smoothstep(0.05, 0.55, p);

        // The next chapter's title rushes out of the light.
        const tp = easeOutCubic(clamp((p - 0.5) / 0.3));
        title.style.opacity = tp.toFixed(3);
        title.style.transform = `scale(${(0.35 + 0.65 * tp).toFixed(4)})`;
        title.style.filter = tp < 0.999 ? `blur(${((1 - tp) * 14).toFixed(2)}px)` : "none";
      };

      layout();
      render(0);

      gsap.to(progress, {
        value: 1,
        ease: "none",
        onUpdate: () => render(progress.value),
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true },
      });

      const resize = new ResizeObserver(() => {
        layout();
        render(progress.value);
      });
      resize.observe(stage);
      return () => resize.disconnect();
    },
    { scope: sectionRef },
  );

  return (
    <section id="about" ref={sectionRef} aria-labelledby="about-title" className="relative h-[330vh] bg-night">
      {/* Paper underneath, so the wall reads right even before hydration draws it. */}
      <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden bg-paper">
        <TunnelCanvas state={tunnel} fontFamily={fontMono.style.fontFamily} className="absolute inset-0 h-full w-full" />

        <div
          ref={titleRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center opacity-0"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">02 — Projects</p>
            <p className="mt-5 font-display text-[clamp(3.4rem,11vw,10.5rem)] font-extrabold leading-[0.86] tracking-[-0.045em] text-white">
              Selected
              <br />
              Projects
            </p>
            <p className="mt-7 text-sm text-sky/70">Scroll slowly and the cards will turn ↓</p>
          </div>
        </div>

        <svg
          ref={svgRef}
          aria-hidden="true"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <pattern id="portal-dots" ref={patternRef} width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="11" cy="11" r="1.1" fill="rgba(14,27,61,0.16)" />
            </pattern>
            <linearGradient id="portal-bezel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#d3dbe8" />
            </linearGradient>
            <linearGradient id="portal-blind" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6f8fb" />
              <stop offset="1" stopColor="#dde3ec" />
            </linearGradient>
            <linearGradient id="portal-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0.12" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="portal-hole">
              <path ref={clipRef} />
            </clipPath>
          </defs>
          <path ref={wallRef} fill="#eef2f8" fillRule="evenodd" />
          <path ref={dotsRef} fill="url(#portal-dots)" fillRule="evenodd" />
          <g clipPath="url(#portal-hole)">
            <path ref={glassRef} fill="url(#portal-glass)" />
            <path ref={blindRef} fill="url(#portal-blind)" />
            <path ref={handleRef} fill="#b8c1cf" />
            <path ref={shadeRef} fill="none" stroke="rgba(10,20,51,0.28)" />
          </g>
          <path ref={bezelRef} fill="url(#portal-bezel)" fillRule="evenodd" stroke="rgba(14,27,61,0.1)" />
          <path ref={rimRef} fill="none" stroke="rgba(14,27,61,0.3)" />
        </svg>

        <div ref={wallContentRef} className="pointer-events-none absolute inset-0 text-ink">
          <p className="absolute left-5 top-24 font-mono text-xs uppercase tracking-[0.22em] text-muted md:left-10 md:top-28">
            <span className="text-electric">01</span> — {about.kicker}
          </p>
          <h2 id="about-title" className="sr-only">
            {about.title}
          </h2>
          <p
            aria-hidden="true"
            className="portal-left font-display text-[clamp(2.4rem,5.4vw,5.6rem)] font-extrabold leading-[0.92] tracking-[-0.04em]"
          >
            {about.left[0]}
            <br />
            {about.left[1]}
          </p>
          <p
            aria-hidden="true"
            className="portal-right font-display text-[clamp(2.4rem,5.4vw,5.6rem)] font-extrabold leading-[0.92] tracking-[-0.04em]"
          >
            {about.right[0]}
            <br />
            <span className="text-electric">{about.right[1]}</span>
          </p>
          <p className="absolute bottom-10 left-10 hidden max-w-[21rem] text-sm leading-relaxed text-muted md:block">
            {about.bio}
          </p>
          <dl className="absolute bottom-10 right-10 hidden gap-6 text-right md:flex">
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{fact.label}</dt>
                <dd className="mt-1 font-display text-lg font-bold text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className="portal-glass-label whitespace-nowrap rounded-full bg-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white ring-1 ring-white/25">
            Scroll to enter ↓
          </p>
        </div>
      </div>
    </section>
  );
}
