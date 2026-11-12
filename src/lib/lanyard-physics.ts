/**
 * A tiny position-based (Verlet) simulation of a lanyard: a rope of particles
 * hanging from a fixed anchor, ending in a rigid card. The card is modelled as
 * a triangle of three heavier particles (top-centre, bottom-left,
 * bottom-right) held together by sticks, so swinging, spinning and throwing
 * all fall out of the same handful of constraints.
 *
 * Grabbing pins one material point of the card (stored as barycentric
 * weights of the triangle) to the pointer. Grab near a corner and the card
 * rotates around your finger, exactly like the real thing.
 */

export interface Point {
  x: number;
  y: number;
}

export interface LanyardConfig {
  anchor: Point;
  ropeLength: number;
  segments: number;
  card: { width: number; height: number };
  /** Gravity in px/s². */
  gravity?: number;
  /** Share of velocity kept each step (0–1). */
  damping?: number;
  /** Constraint solver passes per step. */
  iterations?: number;
}

export interface CardPose {
  /** Top-centre of the card, where the strap clips on. */
  x: number;
  y: number;
  /** Clockwise rotation in radians; 0 = hanging straight down. */
  angle: number;
  /** Centroid of the card. */
  cx: number;
  cy: number;
}

interface Particle extends Point {
  px: number;
  py: number;
  invMass: number;
}

interface Stick {
  a: number;
  b: number;
  length: number;
}

interface Grab {
  weights: [number, number, number];
  target: Point;
}

const ROPE_INV_MASS = 1;
const CARD_INV_MASS = 0.2;
/** Per-step speed cap (px) so wild throws stay stable. */
const MAX_SPEED = 48;

export class LanyardSim {
  private readonly particles: Particle[] = [];
  private readonly sticks: Stick[] = [];
  private readonly card: [number, number, number];
  private readonly ropeEnd: number;
  private readonly gravity: number;
  private readonly damping: number;
  private readonly iterations: number;
  private grabbed: Grab | null = null;

  constructor({
    anchor,
    ropeLength,
    segments,
    card,
    gravity = 2600,
    damping = 0.993,
    iterations = 12,
  }: LanyardConfig) {
    this.gravity = gravity;
    this.damping = damping;
    this.iterations = iterations;

    const segment = ropeLength / segments;
    for (let i = 0; i <= segments; i++) {
      this.add(anchor.x, anchor.y + i * segment, i === 0 ? 0 : ROPE_INV_MASS);
    }
    for (let i = 0; i < segments; i++) this.link(i, i + 1);

    // The last rope particle doubles as the card's top-centre.
    this.ropeEnd = segments;
    const top = this.particles[segments];
    top.invMass = CARD_INV_MASS;
    const left = this.add(top.x - card.width / 2, top.y + card.height, CARD_INV_MASS);
    const right = this.add(top.x + card.width / 2, top.y + card.height, CARD_INV_MASS);
    this.card = [segments, left, right];
    this.link(segments, left);
    this.link(segments, right);
    this.link(left, right);
  }

  /** Points from the anchor down to the card clip, for drawing the strap. */
  get rope(): readonly Point[] {
    return this.particles.slice(0, this.ropeEnd + 1);
  }

  get isGrabbed() {
    return this.grabbed !== null;
  }

  /** Rotate the whole lanyard around the anchor (at rest), e.g. for an entrance swing. */
  swing(radians: number) {
    const anchor = this.particles[0];
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    for (const p of this.particles) {
      if (p.invMass === 0) continue;
      const dx = p.x - anchor.x;
      const dy = p.y - anchor.y;
      p.x = p.px = anchor.x + dx * cos - dy * sin;
      p.y = p.py = anchor.y + dx * sin + dy * cos;
    }
  }

  /** Add velocity to the card (px per step). */
  nudge(dx: number, dy: number) {
    for (const index of this.card) {
      const p = this.particles[index];
      p.px -= dx;
      p.py -= dy;
    }
  }

  grab(x: number, y: number) {
    const [t, l, r] = this.card.map((i) => this.particles[i]);
    // Barycentric coordinates of the grab point in the card triangle.
    const v0x = l.x - t.x;
    const v0y = l.y - t.y;
    const v1x = r.x - t.x;
    const v1y = r.y - t.y;
    const v2x = x - t.x;
    const v2y = y - t.y;
    const d00 = v0x * v0x + v0y * v0y;
    const d01 = v0x * v1x + v0y * v1y;
    const d11 = v1x * v1x + v1y * v1y;
    const d20 = v2x * v0x + v2y * v0y;
    const d21 = v2x * v1x + v2y * v1y;
    const denom = d00 * d11 - d01 * d01 || 1e-6;
    const wl = (d11 * d20 - d01 * d21) / denom;
    const wr = (d00 * d21 - d01 * d20) / denom;
    this.grabbed = { weights: [1 - wl - wr, wl, wr], target: { x, y } };
  }

  drag(x: number, y: number) {
    if (!this.grabbed) return;
    this.grabbed.target.x = x;
    this.grabbed.target.y = y;
  }

  release() {
    this.grabbed = null;
  }

  step(dt: number, windX = 0) {
    const gx = windX * dt * dt;
    const gy = this.gravity * dt * dt;

    for (const p of this.particles) {
      if (p.invMass === 0) continue;
      let vx = (p.x - p.px) * this.damping;
      let vy = (p.y - p.py) * this.damping;
      const speed = Math.hypot(vx, vy);
      if (speed > MAX_SPEED) {
        vx *= MAX_SPEED / speed;
        vy *= MAX_SPEED / speed;
      }
      p.px = p.x;
      p.py = p.y;
      p.x += vx + gx;
      p.y += vy + gy;
    }

    for (let k = 0; k < this.iterations; k++) {
      if (this.grabbed) this.solveGrab(this.grabbed);
      for (const stick of this.sticks) this.solveStick(stick);
    }
  }

  pose(): CardPose {
    const [t, l, r] = this.card.map((i) => this.particles[i]);
    const midX = (l.x + r.x) / 2;
    const midY = (l.y + r.y) / 2;
    return {
      x: t.x,
      y: t.y,
      angle: Math.atan2(t.x - midX, midY - t.y),
      cx: (t.x + l.x + r.x) / 3,
      cy: (t.y + l.y + r.y) / 3,
    };
  }

  private add(x: number, y: number, invMass: number) {
    this.particles.push({ x, y, px: x, py: y, invMass });
    return this.particles.length - 1;
  }

  private link(a: number, b: number) {
    const pa = this.particles[a];
    const pb = this.particles[b];
    this.sticks.push({ a, b, length: Math.hypot(pb.x - pa.x, pb.y - pa.y) });
  }

  private solveStick({ a, b, length }: Stick) {
    const pa = this.particles[a];
    const pb = this.particles[b];
    const totalInvMass = pa.invMass + pb.invMass;
    if (totalInvMass === 0) return;
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const dist = Math.hypot(dx, dy) || 1e-6;
    const k = (dist - length) / (dist * totalInvMass);
    pa.x += dx * k * pa.invMass;
    pa.y += dy * k * pa.invMass;
    pb.x -= dx * k * pb.invMass;
    pb.y -= dy * k * pb.invMass;
  }

  /** Move the card so its grabbed material point lands on the pointer. */
  private solveGrab({ weights, target }: Grab) {
    let gx = 0;
    let gy = 0;
    let denom = 0;
    for (let i = 0; i < 3; i++) {
      const p = this.particles[this.card[i]];
      gx += p.x * weights[i];
      gy += p.y * weights[i];
      denom += weights[i] * weights[i] * p.invMass;
    }
    if (denom === 0) return;
    const cx = (gx - target.x) / denom;
    const cy = (gy - target.y) / denom;
    for (let i = 0; i < 3; i++) {
      const p = this.particles[this.card[i]];
      p.x -= cx * weights[i] * p.invMass;
      p.y -= cy * weights[i] * p.invMass;
    }
  }
}
