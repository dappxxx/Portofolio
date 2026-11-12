"use client";

// Halftone Text — the hero sibling of <HalftoneWordmarkFooter>. It prints one
// or more lines of type as a field of dots on a transparent canvas, sized to
// fit the container's width (height follows the text). On load the dots fly
// in from a scattered cloud and assemble the name; afterwards they part around
// the pointer on springs and a click sends a shock ring through the word.
// The spring/coverage maths is shared with the footer component.

import * as React from "react";
import { hwfHex, hwfRadius, hwfStep, hwfWarmth } from "@/components/ui/halftone-wordmark-footer";
import { TAU } from "@/lib/math";
import { cn } from "@/lib/utils";

/** Floats per dot: x, y, vx, vy, homeX, homeY, radius. */
const STRIDE = 7;
/** Dots are batched into colour buckets so a frame costs a few fills, not thousands. */
const BUCKETS = 8;
/** How long a click shock ring lives, in ms. */
const RING_LIFE = 900;
/** How long to wait for the web font before drawing with the fallback. */
const FONT_TIMEOUT = 1800;

export interface HalftoneTextProps {
  /** Each entry is printed on its own line. */
  lines: string[];
  /** A concrete font-family string (canvas can't read CSS variables). */
  fontFamily: string;
  fontWeight?: number;
  /** Dot colour at rest. */
  ink?: string;
  /** Colour a dot warms toward when pushed off its place. */
  warm?: string;
  /** Max distance between dot centres in CSS px (shrinks for small type). */
  dotGap?: number;
  /** Pointer push radius in CSS px. */
  radius?: number;
  /** Line pitch as a multiple of the tallest line's ink box. */
  lineHeight?: number;
  align?: "left" | "center";
  /** Assemble from a scattered cloud on first paint. */
  intro?: boolean;
  className?: string;
}

export function HalftoneText({
  lines,
  fontFamily,
  fontWeight = 800,
  ink = "#0e1b3d",
  warm = "#ffb400",
  dotGap = 6,
  radius = 90,
  lineHeight = 1.08,
  align = "left",
  intro = true,
  className,
}: HalftoneTextProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const text = lines.join("\n");

  React.useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inkRgb = hwfHex(ink) ?? [14, 27, 61];
    const warmRgb = hwfHex(warm) ?? [255, 180, 0];
    const palette = Array.from({ length: BUCKETS }, (_, b) => {
      const k = b / (BUCKETS - 1);
      const mix = inkRgb.map((c, i) => Math.round(c + (warmRgb[i] - c) * k));
      return `rgb(${mix.join(",")})`;
    });

    let width = 0;
    let height = 0;
    let dpr = 1;
    let dots = new Float32Array(0);
    let count = 0;
    let buckets: Int32Array[] = [];
    const bucketLen = new Int32Array(BUCKETS);
    let pointerX = -1e5;
    let pointerY = -1e5;
    let ring = { x: 0, y: 0, t: -1 };
    let raf = 0;
    let visible = true;
    let awake = true;
    let alive = true;
    let ready = false;
    let scatter = intro && !reduced;

    const layout = () => {
      const w = Math.round(root.getBoundingClientRect().width);
      const measure = document.createElement("canvas").getContext("2d");
      if (w < 2 || !measure) return;

      // Measure every line at 100px, then scale so the widest ink fills the row.
      const rows = text.split("\n");
      measure.font = `${fontWeight} 100px ${fontFamily}`;
      const metrics = rows.map((row) => measure.measureText(row));
      const inkWidths = metrics.map((m) => m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
      const ascent = Math.max(...metrics.map((m) => m.actualBoundingBoxAscent));
      const descent = Math.max(...metrics.map((m) => m.actualBoundingBoxDescent));
      const pad = Math.max(10, Math.round(w * 0.014));
      const scale = (w - pad * 2) / Math.max(1, ...inkWidths);
      const fontSize = 100 * scale;
      const lineBox = (ascent + descent) * scale;
      const pitch = lineBox * lineHeight;
      const h = Math.ceil(pad * 2 + lineBox + pitch * (rows.length - 1));

      width = w;
      height = h;
      root.style.height = `${h}px`;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Rasterise the words once onto a 1x mask…
      const mask = document.createElement("canvas");
      mask.width = w;
      mask.height = h;
      const m = mask.getContext("2d", { willReadFrequently: true });
      if (!m) return;
      m.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      m.fillStyle = "#000";
      m.textBaseline = "alphabetic";
      rows.forEach((row, i) => {
        const rowWidth = inkWidths[i] * scale;
        const left = align === "center" ? (w - rowWidth) / 2 : pad;
        m.fillText(row, left + metrics[i].actualBoundingBoxLeft * scale, pad + ascent * scale + pitch * i);
      });
      const pixels = m.getImageData(0, 0, w, h).data;

      // …then turn cell coverage into dot sizes.
      const gap = Math.max(3.5, Math.min(dotGap, fontSize / 20));
      const cols = Math.ceil(w / gap);
      const gridRows = Math.ceil(h / gap);
      const next: number[] = [];
      for (let gy = 0; gy < gridRows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          let sum = 0;
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3));
              const y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3));
              sum += pixels[(y * w + x) * 4 + 3];
            }
          }
          const coverage = sum / (9 * 255);
          if (coverage < 0.06) continue;
          const hx = gx * gap + gap / 2;
          const hy = gy * gap + gap / 2;
          const x = scatter ? hx + (Math.random() - 0.5) * w * 0.9 : hx;
          const y = scatter ? hy + (Math.random() - 0.5) * h * 2.6 : hy;
          next.push(x, y, 0, 0, hx, hy, hwfRadius(coverage, gap));
        }
      }
      dots = new Float32Array(next);
      count = next.length / STRIDE;
      buckets = Array.from({ length: BUCKETS }, () => new Int32Array(count));
      scatter = false;
      awake = true;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const push = reduced ? 0 : radius;
      const ringAge = ring.t < 0 ? Infinity : now - ring.t;
      const ringRadius = ringAge * 0.9;
      let moving = false;
      bucketLen.fill(0);

      for (let i = 0; i < count; i++) {
        const j = i * STRIDE;
        let x = dots[j];
        let y = dots[j + 1];
        let vx = dots[j + 2];
        let vy = dots[j + 3];
        const hx = dots[j + 4];
        const hy = dots[j + 5];

        if (ringAge < RING_LIFE) {
          const dx = hx - ring.x;
          const dy = hy - ring.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const band = 1 - Math.min(1, Math.abs(d - ringRadius) / 26);
          if (band > 0) {
            const force = band * 3.2 * (1 - ringAge / RING_LIFE);
            vx += (dx / d) * force;
            vy += (dy / d) * force;
          }
        }

        [x, y, vx, vy] = hwfStep(x, y, vx, vy, hx, hy, pointerX, pointerY, push);
        if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) {
          moving = true;
        } else {
          x = hx;
          y = hy;
          vx = 0;
          vy = 0;
        }
        dots[j] = x;
        dots[j + 1] = y;
        dots[j + 2] = vx;
        dots[j + 3] = vy;

        const warmth = hwfWarmth(x, y, hx, hy, 28);
        const bucket = warmth < 0.02 ? 0 : Math.min(BUCKETS - 1, 1 + Math.floor(warmth * (BUCKETS - 1)));
        buckets[bucket][bucketLen[bucket]++] = i;
      }

      for (let b = 0; b < BUCKETS; b++) {
        const len = bucketLen[b];
        if (!len) continue;
        const list = buckets[b];
        ctx.fillStyle = palette[b];
        ctx.beginPath();
        for (let n = 0; n < len; n++) {
          const j = list[n] * STRIDE;
          const r = dots[j + 6];
          ctx.moveTo(dots[j] + r, dots[j + 1]);
          ctx.arc(dots[j], dots[j + 1], r, 0, TAU);
        }
        ctx.fill();
      }

      // Sleep once every dot is home and nothing is pushing.
      awake = moving || ringAge < RING_LIFE || pointerX > -1e4;
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || !ready) return;
      draw(now);
      if (awake) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      awake = true;
      if (!raf && visible && ready) raf = requestAnimationFrame(loop);
    };

    const local = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      return [e.clientX - box.left, e.clientY - box.top] as const;
    };
    const onMove = (e: PointerEvent) => {
      [pointerX, pointerY] = local(e);
      wake();
    };
    const onLeave = () => {
      pointerX = -1e5;
      pointerY = -1e5;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      const [x, y] = local(e);
      ring = { x, y, t: performance.now() };
      wake();
    };

    // Wait for the real face (or give up and use the fallback) before the intro.
    const start = () => {
      if (!alive || ready) return;
      ready = true;
      layout();
      wake();
    };
    const fontTimer = window.setTimeout(start, FONT_TIMEOUT);
    document.fonts.load(`${fontWeight} 100px ${fontFamily}`).then(start, start);

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    const resize = new ResizeObserver(() => {
      // We set our own height, so only a width change needs a new layout.
      if (ready && Math.round(root.getBoundingClientRect().width) !== width) {
        layout();
        wake();
      }
    });
    resize.observe(root);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) wake();
    });
    io.observe(root);

    return () => {
      alive = false;
      window.clearTimeout(fontTimer);
      cancelAnimationFrame(raf);
      resize.disconnect();
      io.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
    };
  }, [text, fontFamily, fontWeight, ink, warm, dotGap, radius, lineHeight, align, intro]);

  return (
    <div ref={rootRef} className={cn("relative aspect-[2.6/1] w-full touch-pan-y", className)}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  );
}
