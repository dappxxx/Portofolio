"use client";

// Tunnel Canvas — an endless blueprint tunnel drawn in 2D with a perspective
// projection: rounded-rect ribs, rails and dotted walls converge on a warm
// light at the far end, with bits of code floating past on the walls. It
// drifts forward on its own; the parent pushes it further via `state.travel`
// (driven by scroll), and fast travel adds warp streaks.

import { useEffect, useRef, type RefObject } from "react";
import { clamp, smoothstep, TAU } from "@/lib/math";

export interface TunnelState {
  /** World units travelled (the parent maps scroll progress onto this). */
  travel: number;
  /** 0–1 strength of the light at the end of the tunnel. */
  glow: number;
}

const BACKGROUND = "#0a1433";
/** World units between ribs. The tunnel cross-section is 2 units wide. */
const SPACING = 0.8;
const RIBS = 16;
const NEAR = 0.14;
const FAR = SPACING * RIBS;
const IDLE_SPEED = 0.2;
/** Height of floating labels in world units. */
const LABEL_SIZE = 0.035;
const LABELS = [
  "<Portfolio />",
  "npm run dev",
  "git push origin main",
  "useEffect(() => {})",
  "SELECT * FROM projects",
  "deploy ✓ 1.42s",
  "200 OK",
  "async / await",
  "display: grid;",
  "const idea = build()",
  "{ ...props }",
  "next build",
  "<section>",
  "README.md",
  "ScrollTrigger.create()",
  "border-radius: 24px",
];

interface Label {
  text: string;
  wall: number;
  u: number;
  z: number;
  accent: boolean;
}

export function TunnelCanvas({
  state,
  fontFamily,
  className,
}: {
  state: RefObject<TunnelState>;
  fontFamily: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const labels: Label[] = LABELS.map((text, i) => ({
      text,
      wall: i % 4,
      u: ((i * 0.618034) % 1) * 1.5 - 0.75,
      z: (i / LABELS.length) * FAR,
      accent: i % 3 === 0,
    }));
    const streaks = Array.from({ length: 56 }, (_, i) => ({ angle: i * 2.399963, phase: (i * 0.381966) % 1 }));

    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let idle = 0;
    let travel = state.current.travel;
    let lastPos = 0;
    let camX = 0;
    let camY = 0;
    let targetCamX = 0;
    let targetCamY = 0;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    /** Fade in from the far end, fade out right before passing the camera. */
    const depthAlpha = (z: number) => smoothstep(FAR, FAR * 0.42, z) * smoothstep(NEAR * 0.7, NEAR + 0.5, z);

    const draw = (now: number) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      const { travel: targetTravel, glow } = state.current;
      if (!reduced) idle += dt * IDLE_SPEED;
      travel += (targetTravel - travel) * Math.min(1, dt * 8);
      const pos = idle + travel;
      const speed = dt > 0 ? (pos - lastPos) / dt : 0;
      lastPos = pos;
      camX += (targetCamX - camX) * 0.05;
      camY += (targetCamY - camY) * 0.05;

      const w = width;
      const h = height;
      const focal = w / 2;
      const halfH = h / w;
      const sx = (x: number, z: number) => w / 2 + ((x - camX) * focal) / z;
      const sy = (y: number, z: number) => h / 2 + ((y - camY) * focal) / z;
      const dot = (x: number, y: number, r: number) => {
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, TAU);
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, w, h);

      // Light at the end of the tunnel.
      const vx = sx(0, FAR);
      const vy = sy(0, FAR);
      const light = ctx.createRadialGradient(vx, vy, 0, vx, vy, Math.max(w, h) * 0.6);
      light.addColorStop(0, `rgba(255,205,60,${0.1 + glow * 0.26})`);
      light.addColorStop(0.22, `rgba(61,107,255,${0.08 + glow * 0.14})`);
      light.addColorStop(1, "rgba(10,20,51,0)");
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, w, h);

      // Rails running down the four walls.
      const railStart = NEAR + 0.06;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(140,165,255,${0.06 + glow * 0.05})`;
      ctx.beginPath();
      for (let j = 0; j <= 8; j++) {
        const u = -1 + j / 4;
        for (const y of [-halfH, halfH]) {
          ctx.moveTo(sx(u, railStart), sy(y, railStart));
          ctx.lineTo(sx(u, FAR), sy(y, FAR));
        }
      }
      for (let j = 1; j < 6; j++) {
        const v = (-1 + j / 3) * halfH;
        for (const x of [-1, 1]) {
          ctx.moveTo(sx(x, railStart), sy(v, railStart));
          ctx.lineTo(sx(x, FAR), sy(v, FAR));
        }
      }
      ctx.stroke();

      // Ribs.
      const ribOffset = ((pos % SPACING) + SPACING) % SPACING;
      for (let k = 0; k <= RIBS; k++) {
        const z = NEAR + k * SPACING - ribOffset;
        const alpha = depthAlpha(z);
        if (z <= NEAR * 0.5 || alpha < 0.01) continue;
        const x0 = sx(-1, z);
        const y0 = sy(-halfH, z);
        const x1 = sx(1, z);
        const y1 = sy(halfH, z);
        ctx.strokeStyle = `rgba(160,185,255,${alpha * (0.3 + glow * 0.4)})`;
        ctx.lineWidth = Math.min(3, 0.6 + 0.9 / z);
        ctx.beginPath();
        ctx.roundRect(x0, y0, x1 - x0, y1 - y0, Math.min((x1 - x0) / 2, (0.14 * focal) / z));
        ctx.stroke();
      }

      // Dotted blueprint grid on the walls.
      const half = SPACING / 2;
      const dotOffset = ((pos % half) + half) % half;
      for (let k = 0; k <= RIBS * 2; k++) {
        const z = NEAR + half / 2 + k * half - dotOffset;
        const alpha = depthAlpha(z);
        if (z <= NEAR || alpha < 0.02) continue;
        const r = Math.max(0.6, (1.6 * (w / 1200)) / z);
        ctx.fillStyle = `rgba(223,231,255,${alpha * 0.5})`;
        ctx.beginPath();
        for (let j = 0; j <= 8; j++) {
          const u = -1 + j / 4;
          dot(sx(u, z), sy(-halfH, z), r);
          dot(sx(u, z), sy(halfH, z), r);
        }
        for (let j = 1; j < 6; j++) {
          const v = (-1 + j / 3) * halfH;
          dot(sx(-1, z), sy(v, z), r);
          dot(sx(1, z), sy(v, z), r);
        }
        ctx.fill();
      }

      // Code fragments floating along the walls.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const label of labels) {
        const z = ((((label.z - pos) % FAR) + FAR) % FAR) + NEAR;
        const alpha = depthAlpha(z);
        const size = Math.min(80, (LABEL_SIZE * focal) / z);
        if (alpha < 0.04 || size < 5) continue;
        const x = label.wall === 0 ? -0.86 : label.wall === 1 ? 0.86 : label.u;
        const y = label.wall === 2 ? -halfH * 0.86 : label.wall === 3 ? halfH * 0.86 : label.u * halfH;
        ctx.font = `600 ${size.toFixed(1)}px ${fontFamily}`;
        ctx.fillStyle = label.accent ? `rgba(255,205,60,${alpha * 0.85})` : `rgba(223,231,255,${alpha * 0.6})`;
        ctx.fillText(label.text, sx(x, z), sy(y, z));
      }

      // Warp streaks while travelling fast.
      const warp = clamp((Math.abs(speed) - 1.2) / 6);
      if (warp > 0.01) {
        const reach = Math.hypot(w, h) * 0.6;
        ctx.strokeStyle = `rgba(223,231,255,${warp * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const streak of streaks) {
          const t = (streak.phase + pos * 0.35) % 1;
          const r0 = reach * t * t;
          const length = (20 + 140 * warp) * (0.2 + t);
          const cos = Math.cos(streak.angle);
          const sin = Math.sin(streak.angle);
          ctx.moveTo(vx + cos * r0, vy + sin * r0);
          ctx.lineTo(vx + cos * (r0 + length), vy + sin * (r0 + length));
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointer = (e: PointerEvent) => {
      targetCamX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      targetCamY = (e.clientY / window.innerHeight - 0.5) * 0.2;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? start() : stop()));
    io.observe(canvas);
    if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      stop();
      resizeObserver.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [state, fontFamily]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
