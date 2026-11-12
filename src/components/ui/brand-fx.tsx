import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Skill chip with a brand-colour hover: water in the tool's colour rises to
 * about half the chip and keeps rolling (pure CSS, see .brand-fx in
 * globals.css). The content is rendered a second time inside the water in a
 * contrasting colour, so whatever sits under the water stays readable, even
 * on black brands like Next.js or Vercel.
 */

const INK = "#0e1b3d";

/** Bubbles inside the water: horizontal position, size (px) and delay (s). */
const BUBBLES = [
  { x: "16%", size: 4, delay: 0.25 },
  { x: "38%", size: 3, delay: 0.95 },
  { x: "61%", size: 5, delay: 0.55 },
  { x: "83%", size: 3, delay: 1.3 },
];

function luminance(hex: string) {
  const value = hex.replace("#", "");
  const channel = (i: number) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Text colour (ink or white) with the better contrast on the given brand colour. */
export function readableInk(hex: string) {
  const l = luminance(hex);
  const onWhite = 1.05 / (l + 0.05);
  const onInk = (l + 0.05) / (luminance(INK) + 0.05);
  return onInk > onWhite ? INK : "#ffffff";
}

function brandStyle(color: string) {
  return { "--brand": color, "--brand-ink": readableInk(color) } as CSSProperties;
}

export function BrandChip({
  color,
  className,
  contentClassName,
  children,
}: {
  color: string;
  /** Shape and surface of the chip (radius, background, ring). No padding here. */
  className?: string;
  /** Layout of the content (flex, gap, padding); shared by both copies. */
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <li className={cn("brand-fx", className)} style={brandStyle(color)}>
      <div className={contentClassName}>{children}</div>
      <div aria-hidden="true" className="brand-fx__water">
        <div className="brand-fx__wave brand-fx__wave--back" />
        <div className="brand-fx__wave">
          <div className="brand-fx__copy">
            <div className={contentClassName}>{children}</div>
            {BUBBLES.map((bubble) => (
              <i
                key={bubble.x}
                className="brand-fx__bubble"
                style={
                  {
                    "--x": bubble.x,
                    "--size": `${bubble.size}px`,
                    "--delay": `${bubble.delay}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
