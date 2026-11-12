export const TAU = Math.PI * 2;

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

/** Hermite smoothstep. Works with edge0 > edge1 for a falling curve. */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/** Wrap an angle in degrees to (-180, 180]. */
export function wrapDegrees(angle: number) {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}
