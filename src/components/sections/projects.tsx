"use client";

// Projects — the website projects sit on a 3D carousel ring. While the stage is
// pinned, scrolling turns the ring one card at a time (each card rests at the
// front for a beat before the next one swings in), and the details panel
// swaps to match. At the end, the Skills section slides up over the stage.

import { useLenis } from "lenis/react";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { BrandIcon } from "@/components/ui/brand-icon";
import { ProjectCard } from "@/components/visuals/project-card";
import { projects, type Project } from "@/data/portfolio";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { clamp, smoothstep, wrapDegrees } from "@/lib/math";
import { cn, pad2 } from "@/lib/utils";

const COUNT = projects.length;
const ANGLE = 360 / COUNT;
/** CSS perspective of the stage, in px. */
const PERSPECTIVE = 1800;
/** Scroll distance per project, in viewport heights. */
const STEP_VH = 70;
/** Extra scroll so the first and last cards get to rest too. */
const DWELL_VH = 35;
const CAROUSEL_VH = Math.max(1, COUNT - 1) * STEP_VH + DWELL_VH;
/** The Skills section slides over the pinned stage across this distance (it has -mt-[100vh]). */
const COVER_VH = 100;

const linkProps = (href: string) =>
  href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

/** Ring radius that leaves a little air between neighbouring cards. */
const ringRadius = (cardW: number) => cardW / 2 / Math.tan(Math.PI / COUNT) + cardW * 0.1;

/** On-screen half-width of the front card plus its two angled neighbours. */
function ringHalfWidth(cardW: number) {
  const radius = ringRadius(cardW);
  const angle = (ANGLE * Math.PI) / 180;
  const depth = radius * Math.cos(angle) - radius;
  const scale = PERSPECTIVE / (PERSPECTIVE - depth);
  return Math.max(cardW / 2, (radius * Math.sin(angle) + (cardW / 2) * Math.cos(angle)) * scale);
}

function ProjectDetails({ project, index }: { project: Project; index: number }) {
  return (
    <div className="relative z-10">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-sky/50">
        <span className="text-accent">02</span> — Selected Projects
      </p>
      <p className="mt-4 flex items-baseline gap-2 font-mono text-sm text-sky/40 md:mt-6">
        <span key={index} className="animate-swap-in font-display text-5xl font-extrabold text-white md:text-6xl">
          {pad2(index + 1)}
        </span>
        / {pad2(COUNT)}
      </p>
      <div key={project.slug} className="animate-swap-in">
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] md:mt-5" style={{ color: project.accent }}>
          {project.category} · {project.year}
        </p>
        <h3 className="mt-2 font-display text-[clamp(2rem,4.2vw,3.8rem)] font-extrabold leading-[0.95] tracking-tight text-white">
          {project.title}
        </h3>
        <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-sky/70 md:mt-4 md:line-clamp-none md:text-base">
          {project.summary}
        </p>
        <p className="mt-3 hidden text-xs text-sky/50 md:block">
          Role: <span className="font-semibold text-sky/80">{project.role}</span>
        </p>
        <ul className="mt-4 hidden flex-wrap gap-2 sm:flex md:mt-5">
          {project.stack.map((tech) => (
            <li key={tech} className="rounded-full border border-sky/15 bg-white/5 px-3 py-1 text-xs font-medium text-sky/80">
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3 md:mt-6">
          {project.links.live && (
            <a
              href={project.links.live}
              {...linkProps(project.links.live)}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-ink transition hover:-translate-y-0.5"
            >
              Live Site
              <ArrowUpRight className="size-4" />
            </a>
          )}
          {project.links.repo && (
            <a
              href={project.links.repo}
              {...linkProps(project.links.repo)}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/10"
            >
              <BrandIcon name="github" className="size-4" />
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const slotsRef = useRef<HTMLDivElement[]>([]);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const lenis = useLenis();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const scene = sceneRef.current;
      const stage = stageRef.current;
      const ring = ringRef.current;
      const bar = barRef.current;
      if (!section || !scene || !stage || !ring || !bar) return;

      const carouselPx = () => (CAROUSEL_VH / 100) * window.innerHeight;
      let radius = 0;

      const layout = () => {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        let cardW = Math.min(width < 768 ? width * 0.8 : width * 0.66, 620, height * 1.1);
        // On wider layouts keep the neighbours inside the stage (they may bleed on phones).
        if (width >= 768) cardW *= Math.min(1, (width * 0.54) / ringHalfWidth(cardW));
        radius = ringRadius(cardW);
        stage.style.setProperty("--card-w", `${cardW}px`);
        stage.style.setProperty("--card-h", `${cardW * 0.66}px`);
        stage.style.setProperty("--radius", `${radius}px`);
      };

      const render = (progress: number) => {
        // Hold on each card, then turn — smoothstep plateaus give every project a beat.
        const raw = progress * (COUNT - 1);
        const base = clamp(Math.floor(raw), 0, Math.max(0, COUNT - 2));
        const t = COUNT > 1 ? base + smoothstep(0.2, 0.8, raw - base) : 0;
        const turn = -t * ANGLE;
        ring.style.transform = `translateZ(${-radius}px) rotateX(-4deg) rotateY(${turn}deg)`;
        slotsRef.current.forEach((slot, i) => {
          const facing = Math.cos((wrapDegrees(i * ANGLE + turn) * Math.PI) / 180);
          slot.style.setProperty("--focus", clamp(facing).toFixed(3));
        });
        bar.style.transform = `scaleX(${COUNT > 1 ? t / (COUNT - 1) : 1})`;

        const index = Math.round(t);
        if (index !== activeRef.current) {
          activeRef.current = index;
          setActive(index);
        }
      };

      layout();
      const carousel = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${carouselPx()}`,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => {
          layout();
          render(self.progress);
        },
      });
      render(carousel.progress);

      // As Skills slides over, the stage sinks back into the dark.
      gsap.fromTo(
        scene,
        { scale: 1, opacity: 1 },
        {
          scale: 0.86,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: () => `top+=${carouselPx()} top`,
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  const jumpTo = (index: number) => {
    const section = sectionRef.current;
    if (!section || COUNT < 2) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const offset = (index / (COUNT - 1)) * (CAROUSEL_VH / 100) * window.innerHeight;
    lenis?.scrollTo(top + offset, { duration: 1.2 });
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-label="Projects"
      className="relative bg-night text-sky"
      style={{ height: `${CAROUSEL_VH + COVER_VH + 100}vh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div ref={sceneRef} className="relative h-full w-full origin-center">
          <span aria-hidden="true" className="absolute inset-0 bg-dot-grid [--dot-color:rgba(223,231,255,0.08)]" />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_50%,rgba(61,107,255,0.28),transparent_60%)]"
          />

          <div className="relative mx-auto grid h-full max-w-[1400px] grid-rows-[auto_minmax(0,1fr)] gap-2 px-5 pb-20 pt-24 md:px-10 lg:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)] lg:grid-rows-1 lg:items-center lg:gap-8 lg:pb-16">
            <ProjectDetails project={projects[active]} index={active} />

            <div ref={stageRef} className="relative h-full min-h-[260px]" style={{ perspective: `${PERSPECTIVE}px` }}>
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-[calc(50%+var(--card-h,300px)/2+28px)] h-10 w-3/5 -translate-x-1/2 rounded-[50%] bg-black/50 blur-2xl"
              />
              <div ref={ringRef} className="absolute left-1/2 top-1/2 transform-3d">
                {projects.map((project, i) => (
                  <div
                    key={project.slug}
                    ref={(el) => {
                      if (el) slotsRef.current[i] = el;
                    }}
                    className="absolute left-0 top-0 h-[var(--card-h)] w-[var(--card-w)] backface-hidden"
                    style={{
                      transform: `translate(-50%, -50%) rotateY(${i * ANGLE}deg) translateZ(var(--radius))`,
                    }}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <nav aria-label="Project list" className="absolute inset-x-0 bottom-0 z-10">
            <div className="mx-auto max-w-[1400px] px-5 pb-6 md:px-10">
              <div className="relative h-px w-full bg-white/10">
                <span
                  ref={barRef}
                  className="absolute inset-0 origin-left bg-accent"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
              <ol
                className="mt-4 hidden gap-4 md:grid"
                style={{ gridTemplateColumns: `repeat(${COUNT}, minmax(0, 1fr))` }}
              >
                {projects.map((project, i) => (
                  <li key={project.slug}>
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-current={i === active ? "true" : undefined}
                      className={cn(
                        "w-full truncate text-left text-xs transition-colors",
                        i === active ? "text-white" : "text-sky/40 hover:text-sky/75",
                      )}
                    >
                      <span className={cn("font-mono", i === active && "text-accent")}>{pad2(i + 1)}</span>
                      <span className="ml-2 font-semibold">{project.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}
