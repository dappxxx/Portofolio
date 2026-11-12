"use client";

// Skills — slides up over the pinned Projects stage like a sheet of paper.
// The cards enter through a perspective tunnel: each one starts deep in the
// distance near the grid's vanishing point and flies out to its place as the
// section scrolls in. Hovering a skill fills it with the tool's brand colour.

import { Database, LayoutDashboard, Smartphone, Sparkles, Users, Wrench, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import { BrandChip } from "@/components/ui/brand-fx";
import { BrandIcon, brandColors } from "@/components/ui/brand-icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { learning, marqueeTech, skillGroups, softSkills, type Skill, type SkillGroup } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const GROUP_ICONS: Record<SkillGroup["id"], LucideIcon> = {
  frontend: LayoutDashboard,
  mobile: Smartphone,
  backend: Database,
  tools: Wrench,
};

/** Fallback for skills without a brand (e.g. methods like Agile). */
const DEFAULT_BRAND = "#3d6bff";

const skillColor = (skill: Skill) => skill.color ?? (skill.icon ? brandColors[skill.icon] : DEFAULT_BRAND);

/** Dots follow the text colour, so they switch along with the brand water. */
function LevelDots({ level }: { level: number }) {
  return (
    <span className="flex gap-1" role="img" aria-label={`Level ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <span key={step} className={cn("size-1.5 rounded-full bg-current", step > level && "opacity-20")} />
      ))}
    </span>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <BrandChip
      color={skillColor(skill)}
      className="rounded-2xl bg-paper/80 text-ink ring-1 ring-ink/5"
      contentClassName="flex items-center gap-3 px-3.5 py-3"
    >
      {skill.icon ? (
        <BrandIcon name={skill.icon} className="size-5 shrink-0" />
      ) : (
        <Sparkles aria-hidden="true" className="size-5 shrink-0" />
      )}
      <span className="flex-1 text-sm font-semibold">{skill.name}</span>
      <LevelDots level={skill.level} />
    </BrandChip>
  );
}

function GroupCard({ group }: { group: SkillGroup }) {
  const Icon = GROUP_ICONS[group.id];
  return (
    <article
      data-tunnel
      className={cn(
        "relative overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_24px_60px_-36px_rgba(14,27,61,0.45)] ring-1 ring-ink/10 md:p-8",
        group.wide ? "md:col-span-4" : "md:col-span-2",
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-electric">{group.code}</p>
          <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight md:text-3xl">{group.title}</h3>
          <p className="mt-1 text-sm text-muted">{group.caption}</p>
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-paper text-ink ring-1 ring-ink/10">
          <Icon className="size-5" />
        </span>
      </header>
      <ul className={cn("mt-6 grid gap-2.5", group.wide && "sm:grid-cols-2")}>
        {group.skills.map((skill) => (
          <SkillRow key={skill.name} skill={skill} />
        ))}
      </ul>
    </article>
  );
}

function LearningCard() {
  return (
    <article
      data-tunnel
      className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-[0_24px_60px_-36px_rgba(14,27,61,0.6)] md:col-span-3 md:p-8"
    >
      <span aria-hidden="true" className="absolute inset-0 bg-dot-grid [--dot-color:rgba(223,231,255,0.09)]" />
      <div className="relative">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          <Sparkles className="size-3.5" /> Currently learning
        </p>
        <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
          Still learning<span className="animate-pulse text-accent">_</span>
        </h3>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {learning.map((item) => (
            <li
              key={item.name}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15"
            >
              {item.icon ? (
                <BrandIcon name={item.icon} className="size-4 text-accent" />
              ) : (
                <Sparkles aria-hidden="true" className="size-4 text-accent" />
              )}
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function SoftSkillsCard() {
  return (
    <article
      data-tunnel
      className="relative overflow-hidden rounded-[28px] bg-accent p-6 text-ink shadow-[0_24px_60px_-36px_rgba(14,27,61,0.45)] md:col-span-3 md:p-8"
    >
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70">
        <Users className="size-3.5" /> Soft skills
      </p>
      <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight md:text-3xl">Easy to work with.</h3>
      <ul className="mt-6 flex flex-wrap gap-2.5">
        {softSkills.map((skill) => (
          <li key={skill} className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold ring-1 ring-ink/10">
            {skill}
          </li>
        ))}
      </ul>
    </article>
  );
}

function Marquee({ reverse = false }: { reverse?: boolean }) {
  const items = reverse ? [...marqueeTech].reverse() : marqueeTech;
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <ul
        className={cn(
          "flex w-max shrink-0 animate-marquee items-center gap-3 pr-3 group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {[...items, ...items].map((tech, i) => (
          <BrandChip
            key={`${tech.name}-${i}`}
            color={brandColors[tech.icon]}
            className="rounded-full bg-white text-ink ring-1 ring-ink/10"
            contentClassName="flex items-center gap-2.5 whitespace-nowrap px-5 py-3 text-sm font-semibold"
          >
            <BrandIcon name={tech.icon} className="size-4" />
            {tech.name}
          </BrandChip>
        ))}
      </ul>
    </div>
  );
}

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-tunnel]", grid);
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card, i) => {
          // Offset from the grid centre, measured from layout (ignores transforms).
          const toCentreX = () => (grid.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2)) * 0.85;
          const toCentreY = () => (grid.clientHeight / 2 - (card.offsetTop + card.offsetHeight / 2)) * 0.85;
          gsap.fromTo(
            card,
            { x: toCentreX, y: toCentreY, z: -1400, rotateX: 22, opacity: 0 },
            {
              x: 0,
              y: 0,
              z: 0,
              rotateX: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: grid,
                start: `top ${95 - i * 4}%`,
                end: `top ${35 - i * 4}%`,
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative z-10 -mt-[100vh] rounded-t-[2.5rem] bg-paper pb-24 pt-24 shadow-[0_-50px_100px_-30px_rgba(5,10,30,0.7)] md:rounded-t-[4rem] md:pb-32 md:pt-32"
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-t-[inherit] bg-dot-grid opacity-60" />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeading
          index="03"
          kicker="Skills & Tools"
          title={
            <>
              Tools I use
              <br />
              every day.
            </>
          }
          description="For the web I use React and Next.js, for Android I use Kotlin, and Supabase is almost always my backend. The dots on the right show how comfortable I am with each one."
        />

        <div ref={gridRef} className="relative mt-14 grid gap-4 [perspective:1100px] md:mt-20 md:grid-cols-6">
          {skillGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
          <LearningCard />
          <SoftSkillsCard />
        </div>
      </div>

      {/* Decorative: every skill is already listed in the cards above. */}
      <div aria-hidden="true" className="relative mt-16 space-y-3 md:mt-24">
        <Marquee />
        <Marquee reverse />
      </div>
    </section>
  );
}
