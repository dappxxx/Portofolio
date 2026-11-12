import { ArrowDown, ArrowUpRight } from "lucide-react";
import { HalftoneText } from "@/components/ui/halftone-text";
import { IdCardBack, IdCardFront } from "@/components/ui/id-card";
import { Lanyard } from "@/components/ui/lanyard";
import { TextRings } from "@/components/visuals/text-rings";
import { idCard, profile } from "@/data/portfolio";
import { fontDisplay, fontMono } from "@/lib/fonts";

const RING_TEXT = [
  profile.name,
  profile.role,
  "React",
  "Next.js",
  "Kotlin",
  "Supabase",
  idCard.subtitle,
  idCard.tag,
].join("  ·  ");

// The last word of the role and the yellow dot wrap together, so the dot
// never ends up alone on a new line on phones.
const roleBreak = profile.role.lastIndexOf(" ") + 1;
const roleHead = profile.role.slice(0, roleBreak);
const roleTail = profile.role.slice(roleBreak);

export function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-paper">
      <TextRings
        text={`${RING_TEXT}  ·  `}
        fontFamily={fontMono.style.fontFamily}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative mx-auto grid min-h-svh max-w-[1440px] grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="relative z-10 flex flex-col justify-center px-5 pb-4 pt-28 md:px-10 lg:pb-20 lg:pt-28">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 py-1.5 pl-2.5 pr-4 text-xs font-semibold text-ink shadow-sm ring-1 ring-ink/10 backdrop-blur">
            <span className="size-2 animate-pulse-dot rounded-full bg-green-500" />
            {profile.availability}
          </p>

          <h1 className="sr-only">
            {profile.name} — {profile.role}
          </h1>
          <HalftoneText
            lines={profile.headline}
            fontFamily={fontDisplay.style.fontFamily}
            className="-ml-2 mt-5 max-w-[780px] md:-ml-3"
          />
          <p aria-hidden="true" className="ml-1 font-hand text-lg leading-none text-muted md:text-xl">
            ↑ try hovering over my name
          </p>

          <p className="mt-6 font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
            {roleHead}
            <span className="whitespace-nowrap">
              {roleTail}
              <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-accent align-middle" aria-hidden="true" />
            </span>
          </p>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">{profile.intro}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5"
            >
              View Projects
              <ArrowDown className="size-4 transition group-hover:translate-y-0.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink ring-1 ring-ink/15 transition hover:-translate-y-0.5 hover:ring-ink/30"
            >
              Contact Me
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>

        <div className="relative h-[500px] sm:h-[580px] lg:h-auto">
          <Lanyard
            front={<IdCardFront />}
            back={<IdCardBack />}
            strapText={`${profile.name.toUpperCase()}   ✦   ${idCard.position.toUpperCase()}`}
            anchorX={0.5}
          />
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-5 px-4 text-center font-hand text-xl text-ink-soft md:text-2xl lg:bottom-10"
          >
            the card is draggable,{" "}
            <span className="underline decoration-accent decoration-wavy decoration-2 underline-offset-4">
              give it a try
            </span>{" "}
            ☝
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-muted lg:flex"
      >
        SCROLL
        <span className="h-10 w-px bg-ink/15">
          <span className="block h-full w-full animate-scroll-cue bg-ink" />
        </span>
      </div>
    </section>
  );
}
