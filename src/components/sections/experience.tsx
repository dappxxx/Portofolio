"use client";

// Experience — a timeline whose yellow line draws itself as you scroll; each
// stop lights up when the line reaches it. The heading column stays pinned.

import { Briefcase, GraduationCap, MapPin } from "lucide-react";
import { useRef } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { education, experiences } from "@/data/portfolio";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const LINE_AT = "top 62%";

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const list = listRef.current;
      const line = lineRef.current;
      if (!list || !line) return;

      gsap.fromTo(
        line,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: LINE_AT, end: "bottom 62%", scrub: true } },
      );

      gsap.utils.toArray<HTMLElement>("[data-stop]", list).forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: LINE_AT,
          onEnter: () => item.setAttribute("data-active", ""),
          onLeaveBack: () => item.removeAttribute("data-active"),
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="experience" ref={sectionRef} className="relative bg-paper pb-28 pt-10 md:pb-36">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            index="05"
            kicker="Experience"
            title={
              <>
                Where I&apos;ve
                <br />
                been learning.
              </>
            }
            description="I'm active in my campus developer community, I've led teams at two expos, and I interned as a mobile developer at Bank Mandiri."
          />
          <Reveal delay={240} className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white">{experiences.length} experiences</span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink-soft ring-1 ring-ink/10">
              Internship · Community · Team projects
            </span>
          </Reveal>

          <Reveal delay={320} className="mt-10">
            <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              <GraduationCap className="size-4 text-electric" />
              Education
            </h3>
            <ul className="mt-4 space-y-3">
              {education.map((item) => (
                <li key={item.school} className="rounded-2xl bg-white p-4 ring-1 ring-ink/10 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg font-bold leading-tight tracking-tight text-ink">{item.school}</p>
                    {item.note && (
                      <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-ink">
                        {item.note}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {item.program} · {item.period}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <ol ref={listRef} className="relative">
          <span aria-hidden="true" className="absolute bottom-4 left-[11px] top-4 w-px bg-ink/15" />
          <span
            ref={lineRef}
            aria-hidden="true"
            className="absolute bottom-4 left-[10px] top-4 w-[3px] origin-top rounded-full bg-accent-deep"
            style={{ transform: "scaleY(0)" }}
          />
          {experiences.map((exp) => (
            <li key={`${exp.company}-${exp.period}`} data-stop className="group relative pb-10 pl-11 last:pb-0 md:pl-16">
              <span
                aria-hidden="true"
                className="absolute left-0 top-7 grid size-6 place-items-center rounded-full bg-paper ring-2 ring-ink/15 transition-all duration-500 group-data-[active]:scale-110 group-data-[active]:bg-accent group-data-[active]:ring-accent-deep"
              >
                <span className="size-2 rounded-full bg-ink/30 transition-colors group-data-[active]:bg-ink" />
              </span>
              <Reveal>
                <article className="rounded-[28px] bg-white p-6 ring-1 ring-ink/10 transition-shadow duration-700 group-data-[active]:shadow-[0_30px_70px_-40px_rgba(14,27,61,0.5)] md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-electric">{exp.period}</span>
                    <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-soft ring-1 ring-ink/10">
                      {exp.type}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight md:text-3xl">{exp.role}</h3>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink-soft">
                      <Briefcase className="size-4" />
                      {exp.company}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {exp.location}
                    </span>
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">{exp.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {exp.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                        <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-deep" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {exp.stack.map((tech) => (
                      <li key={tech} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-soft">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
