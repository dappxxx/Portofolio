import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  kicker,
  title,
  description,
  tone = "light",
  className,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={className}>
      <Reveal>
        <p
          className={cn(
            "flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em]",
            dark ? "text-sky/60" : "text-muted",
          )}
        >
          <span className={dark ? "text-accent" : "text-electric"}>{index}</span>
          <span aria-hidden="true" className="h-px w-10 bg-current opacity-40" />
          {kicker}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h2
          className={cn(
            "mt-5 font-display text-[clamp(2.6rem,6.4vw,5.75rem)] font-extrabold leading-[0.92] tracking-[-0.035em]",
            dark ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={160}>
          <p className={cn("mt-6 max-w-xl text-base leading-relaxed md:text-lg", dark ? "text-sky/70" : "text-muted")}>
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
