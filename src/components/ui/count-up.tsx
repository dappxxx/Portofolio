"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Counts from 0 to `value` the first time it scrolls into view. */
export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => `${n.toFixed(decimals)}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const counter = { value: 0 };
      // The server renders the final number (no-JS friendly); start from 0 once hydrated.
      el.textContent = format(0);
      gsap.to(counter, {
        value,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = format(counter.value);
        },
      });
    },
    { dependencies: [value, decimals, suffix] },
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
