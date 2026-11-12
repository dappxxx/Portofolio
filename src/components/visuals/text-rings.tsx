"use client";

// Text Rings — concentric rings of type that form a tunnel behind the hero
// card. Every ring carries the same number of glyphs and its type size grows
// with its radius, so the stack reads as one perspective tunnel. Rings drift
// slowly outward (new ones appear in the middle), rotate in alternating
// directions, and their glyphs blink out and back in, sometimes as a
// scrambled character. Near the pointer, glyphs melt into dots that get wired
// into a loose mesh; a click sends a ripple through the field.
//
// Performance: glyphs are rasterised once into a sprite sheet and stamped
// with drawImage (far cheaper than fillText), and the field redraws at 30 fps.

import { useEffect, useRef } from "react";
import { clamp, smoothstep, TAU } from "@/lib/math";

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>{}#+*";
/** Pointer influence radius and mesh radius, in px. */
const POINTER_RADIUS = 150;
const MESH_RADIUS = 210;
const MESH_LINK = 70;
const RIPPLE_SPEED = 620;
const RIPPLE_LIFE = 1.6;
/** Glyph sprites are rasterised at this size and scaled per ring. */
const SPRITE_PX = 72;
/** The field moves slowly, so 30 fps is plenty. */
const FRAME_MS = 1000 / 30;

interface Ripple {
  x: number;
  y: number;
  start: number;
}

interface GlyphAtlas {
  canvas: HTMLCanvasElement;
  /** Cell size in atlas pixels. */
  cell: number;
  /** Atlas pixels per CSS pixel. */
  scale: number;
  /** Top-left corner of each glyph's cell. */
  cells: Map<string, [number, number]>;
}

/**
 * Rasterise each glyph once, in one colour, into a square-ish sprite sheet
 * (square keeps it well under GPU texture limits on phones).
 */
function buildAtlas(glyphs: Iterable<string>, fontFamily: string, color: string, scale: number): GlyphAtlas {
  const unique = [...new Set(glyphs)];
  const px = SPRITE_PX * scale;
  const cell = Math.ceil(px * 1.3);
  const columns = Math.max(1, Math.ceil(Math.sqrt(unique.length)));
  const canvas = document.createElement("canvas");
  canvas.width = cell * columns;
  canvas.height = cell * Math.max(1, Math.ceil(unique.length / columns));
  const cells = new Map<string, [number, number]>();
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = `600 ${px}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    unique.forEach((glyph, i) => {
      const sx = (i % columns) * cell;
      const sy = Math.floor(i / columns) * cell;
      cells.set(glyph, [sx, sy]);
      ctx.fillText(glyph, sx + cell / 2, sy + cell / 2);
    });
  }
  return { canvas, cell, scale, cells };
}

/** Cheap deterministic 0–1 noise. */
function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export interface TextRingsProps {
  /** Text wrapped around the rings (repeated as needed). */
  text: string;
  /** A concrete font-family string (canvas can't read CSS variables). */
  fontFamily: string;
  color?: string;
  /** Colour for a few highlighted glyphs. */
  accent?: string;
  /** Tunnel centre as a share of the canvas size, for wide and narrow screens. */
  center?: { x: number; y: number };
  mobileCenter?: { x: number; y: number };
  className?: string;
}

export function TextRings({
  text,
  fontFamily,
  color = "#0e1b3d",
  accent = "#3d6bff",
  center = { x: 0.74, y: 0.45 },
  mobileCenter = { x: 0.5, y: 0.7 },
  className,
}: TextRingsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { x: wideX, y: wideY } = center;
  const { x: narrowX, y: narrowY } = mobileCenter;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glyphs = Array.from(text.toUpperCase());
    const charset = [...glyphs, ...SCRAMBLE].filter((glyph) => glyph !== " ");
    const atlasScale = Math.min(window.devicePixelRatio || 1, 1.5);
    let inkAtlas = buildAtlas(charset, fontFamily, color, atlasScale);
    let accentAtlas = buildAtlas(charset, fontFamily, accent, atlasScale);

    let w = 1;
    let h = 1;
    let dpr = 1;
    let wide = true;
    let perRing = 64;
    let raf = 0;
    let lastDraw = 0;
    let time = 0;
    let flow = 0;
    let visible = false;
    let alive = true;
    let pointerX = -1e4;
    let pointerY = -1e4;
    let targetX = -1e4;
    let targetY = -1e4;
    const ripples: Ripple[] = [];
    const dots: number[] = [];
    const mesh: number[] = [];

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      w = Math.max(1, box.width);
      h = Math.max(1, box.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      wide = w >= 1024;
      perRing = wide ? 64 : 48;
    };

    /** Keep the area behind the headline calm. */
    const mask = (x: number, y: number) =>
      wide ? 0.28 + 0.72 * smoothstep(w * 0.3, w * 0.62, x) : 0.3 + 0.7 * smoothstep(h * 0.32, h * 0.56, y);

    const draw = (now: number) => {
      const dt = lastDraw ? Math.min((now - lastDraw) / 1000, 0.1) : 0;
      lastDraw = now;
      if (!reduced) {
        time += dt;
        flow += dt * 0.07;
      }
      // Ease toward the pointer; snap when it enters or leaves the canvas.
      if (targetX < -1e3 || pointerX < -1e3) {
        pointerX = targetX;
        pointerY = targetY;
      } else {
        pointerX += (targetX - pointerX) * 0.25;
        pointerY += (targetY - pointerY) * 0.25;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = w * (wide ? wideX : narrowX);
      const cy = h * (wide ? wideY : narrowY);
      // Type size is a fixed share of the radius and each ring sits about 1.3
      // lines further out than the last, so the rings pack like wrapped text.
      const step = TAU / perRing;
      const sizeRatio = step * 1.45;
      const growth = 1 + sizeRatio * 1.3;
      const r0 = Math.min(w, h) * 0.045;
      const rMax = Math.hypot(w, h) * (wide ? 0.62 : 0.55);
      const rings = Math.ceil(Math.log(rMax / r0) / Math.log(growth));
      // The tunnel axis leans toward a slowly wandering vanishing point.
      const leanX = -0.05 * w + Math.sin(time * 0.21) * 0.025 * w;
      const leanY = -0.045 * h + Math.cos(time * 0.17) * 0.02 * h;

      // Soft light at the far end of the tunnel.
      const glow = ctx.createRadialGradient(cx + leanX, cy + leanY, 0, cx + leanX, cy + leanY, Math.min(w, h) * 0.5);
      glow.addColorStop(0, "rgba(255,255,255,0.85)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      dots.length = 0;
      mesh.length = 0;
      for (let i = ripples.length - 1; i >= 0; i--) {
        if ((now - ripples[i].start) / 1000 > RIPPLE_LIFE) ripples.splice(i, 1);
      }

      for (let k = 0; k < rings; k++) {
        // Rings flow outward; when one leaves the screen it re-enters at the centre
        // as a "new" ring (new id → new text offset, speed and direction).
        const position = (((k + flow) % rings) + rings) % rings;
        const id = k + Math.floor((k + flow) / rings) * rings;
        const radius = r0 * Math.pow(growth, position);
        const depth = position / rings;
        const fade = smoothstep(0, 2, position) * smoothstep(rings, rings - 3, position);
        const ringAlpha = fade * (0.04 + 0.17 * Math.sin(Math.PI * clamp(depth * 1.08)));
        const size = radius * sizeRatio;
        if (ringAlpha < 0.004 || size < 4) continue;

        const ox = cx + leanX * (1 - depth);
        const oy = cy + leanY * (1 - depth);
        const direction = id % 2 === 0 ? 1 : -1;
        const spin = direction * time * (0.035 + 0.05 * hash(id + 0.5)) + hash(id) * TAU;
        const offset = Math.floor(hash(id + 0.25) * glyphs.length);
        const half = (inkAtlas.cell / inkAtlas.scale) * (size / SPRITE_PX) * 0.5;

        for (let j = 0; j < perRing; j++) {
          const theta = spin + j * step;
          let x = ox + Math.cos(theta) * radius;
          let y = oy + Math.sin(theta) * radius;
          if (x < -size || x > w + size || y < -size || y > h + size) continue;

          // Each glyph runs its own blink schedule.
          const seed = id * 131 + j;
          const slot = Math.floor(time * (0.5 + hash(seed) * 1.5) + hash(seed + 7) * 10);
          const roll = hash(seed * 3.1 + slot * 17.7);
          if (roll < 0.1) continue;
          let glyph = glyphs[(offset + j) % glyphs.length];
          if (glyph === " ") continue;
          if (roll < 0.15) glyph = SCRAMBLE[Math.floor(hash(seed + slot) * SCRAMBLE.length)];

          // Pointer and click ripples push glyphs aside and melt them into dots.
          let melt = 0;
          const dx = x - pointerX;
          const dy = y - pointerY;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < POINTER_RADIUS) {
            const f = 1 - distance / POINTER_RADIUS;
            melt = f;
            x += (dx / distance) * f * f * 28;
            y += (dy / distance) * f * f * 28;
          }
          for (const ripple of ripples) {
            const age = (now - ripple.start) / 1000;
            const rx = x - ripple.x;
            const ry = y - ripple.y;
            const rd = Math.hypot(rx, ry) || 1;
            const band = 1 - Math.min(1, Math.abs(rd - age * RIPPLE_SPEED) / 60);
            if (band > 0) {
              const strength = band * (1 - age / RIPPLE_LIFE);
              melt = Math.max(melt, strength);
              x += (rx / rd) * strength * 22;
              y += (ry / rd) * strength * 22;
            }
          }

          if (melt > 0.32) {
            dots.push(x, y, Math.max(1, size * 0.12 * (0.6 + melt)));
            if (distance < MESH_RADIUS) mesh.push(x, y);
            continue;
          }

          const atlas = hash(seed + 0.9) < 0.04 ? accentAtlas : inkAtlas;
          const cell = atlas.cells.get(glyph);
          if (!cell) continue;
          const angle = theta + Math.PI / 2;
          const cos = Math.cos(angle) * dpr;
          const sin = Math.sin(angle) * dpr;
          ctx.globalAlpha = ringAlpha * mask(x, y);
          ctx.setTransform(cos, sin, -sin, cos, x * dpr, y * dpr);
          ctx.drawImage(atlas.canvas, cell[0], cell[1], atlas.cell, atlas.cell, -half, -half, half * 2, half * 2);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Melted glyphs and the mesh that wires them together.
      if (mesh.length > 2) {
        ctx.globalAlpha = 0.16;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let a = 0; a < mesh.length; a += 2) {
          for (let b = a + 2; b < mesh.length; b += 2) {
            const dx = mesh[a] - mesh[b];
            const dy = mesh[a + 1] - mesh[b + 1];
            if (dx * dx + dy * dy < MESH_LINK * MESH_LINK) {
              ctx.moveTo(mesh[a], mesh[a + 1]);
              ctx.lineTo(mesh[b], mesh[b + 1]);
            }
          }
        }
        ctx.stroke();
      }
      if (dots.length) {
        ctx.globalAlpha = 0.42;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < dots.length; i += 3) {
          ctx.moveTo(dots[i] + dots[i + 2], dots[i + 1]);
          ctx.arc(dots[i], dots[i + 1], dots[i + 2], 0, TAU);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = visible && !reduced ? requestAnimationFrame(tick) : 0;
      // The small tolerance keeps 60 Hz screens at 30 fps instead of 20.
      if (reduced || now - lastDraw >= FRAME_MS - 2) draw(now);
    };
    const start = () => {
      if (raf) return;
      lastDraw = 0;
      raf = requestAnimationFrame(tick);
    };

    const local = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      return x >= 0 && y >= 0 && x <= box.width && y <= box.height ? { x, y } : null;
    };
    const onMove = (e: PointerEvent) => {
      const point = local(e);
      targetX = point ? point.x : -1e4;
      targetY = point ? point.y : -1e4;
    };
    const onDown = (e: PointerEvent) => {
      const point = local(e);
      if (!point || reduced) return;
      ripples.push({ ...point, start: performance.now() });
      if (ripples.length > 3) ripples.shift();
    };

    resize();
    // Re-rasterise the sprites once the real typeface is available.
    document.fonts.load(`600 ${SPRITE_PX}px ${fontFamily}`).then(() => {
      if (!alive) return;
      inkAtlas = buildAtlas(charset, fontFamily, color, atlasScale);
      accentAtlas = buildAtlas(charset, fontFamily, accent, atlasScale);
      if (reduced) draw(performance.now());
    });
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    resizeObserver.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) start();
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [text, fontFamily, color, accent, wideX, wideY, narrowX, narrowY]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
