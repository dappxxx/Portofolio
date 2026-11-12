"use client";

// Achievements — counters, an awards list, and certificates that stack on top
// of each other like a deck as you scroll (each earlier card tilts back and
// sinks as the next one lands on it).

import Image from "next/image";
import { ArrowUpRight, Award, BadgeCheck, Trophy } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { awards, certificates, profile, stats, type Certificate } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";
import { pad2 } from "@/lib/utils";

/** Drawn stand-in for certificates that don't have a preview image yet. */
function CertificateArt({ certificate, index }: { certificate: Certificate; index: number }) {
  const { accent } = certificate;
  return (
    <div
      className="relative flex h-full min-h-[230px] flex-col rounded-2xl border-[3px] border-double p-5 md:min-h-[300px] md:p-7"
      style={{ borderColor: `${accent}66` }}
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-2xl bg-dot-grid opacity-40" />
      <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        <span>Certificate</span>
        <span>No. {pad2(index + 1)}</span>
      </div>
      <p className="relative mt-5 font-display text-xl font-extrabold leading-tight tracking-tight text-ink md:text-[1.7rem]">
        {certificate.title}
      </p>
      <p className="relative mt-4 text-xs text-muted">Awarded to</p>
      <p className="relative font-hand text-3xl leading-tight text-ink md:text-4xl">{profile.name}</p>
      <div className="relative mt-auto flex items-end justify-between gap-4 pt-6">
        <div className="text-[11px] leading-tight">
          <p className="font-bold text-ink">{certificate.issuer}</p>
          <p className="text-muted">{certificate.date}</p>
        </div>
        <span
          className="grid size-14 shrink-0 place-items-center rounded-full text-white md:size-16"
          style={{ background: accent, boxShadow: `0 0 0 5px ${accent}33, 0 12px 24px -10px ${accent}` }}
        >
          <Award className="size-6 md:size-7" />
        </span>
      </div>
    </div>
  );
}

function Detail({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{children}</dd>
    </div>
  );
}

function CertificateCard({ certificate, index }: { certificate: Certificate; index: number }) {
  const { accent } = certificate;
  return (
    <article className="grid overflow-hidden rounded-[30px] bg-white shadow-[0_40px_90px_-40px_rgba(14,27,61,0.55)] ring-1 ring-ink/10 md:grid-cols-[1.25fr_1fr]">
      {/* The certificate itself */}
      <div className="relative grid place-items-center bg-paper p-4 md:p-6">
        <span aria-hidden="true" className="absolute inset-0 bg-dot-grid opacity-70" />
        {certificate.image ? (
          <div className="relative aspect-[1.414] w-full overflow-hidden rounded-xl bg-white shadow-[0_20px_40px_-24px_rgba(14,27,61,0.55)] ring-1 ring-ink/10">
            <Image
              src={certificate.image}
              alt={`${certificate.title} certificate awarded to ${profile.name}`}
              fill
              sizes="(max-width: 768px) 92vw, 700px"
              className="object-contain"
            />
          </div>
        ) : (
          <div className="relative w-full">
            <CertificateArt certificate={certificate} index={index} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col p-6 md:p-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
          <BadgeCheck className="size-4" /> Certificate {pad2(index + 1)}
        </p>
        <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
          {certificate.title}
        </h3>
        {certificate.subtitle && <p className="mt-2 text-sm leading-snug text-muted">{certificate.subtitle}</p>}
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <Detail label="Issuer" wide>
            {certificate.issuer}
          </Detail>
          <Detail label="Issued">{certificate.date}</Detail>
          {certificate.score && <Detail label="Score">{certificate.score}</Detail>}
          {certificate.credentialId && (
            <Detail label="Credential ID" wide>
              <span className="break-all font-mono text-xs">{certificate.credentialId}</span>
            </Detail>
          )}
        </dl>
        <ul className="mt-5 flex flex-wrap gap-2">
          {certificate.skills.map((skill) => (
            <li key={skill} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-soft ring-1 ring-ink/10">
              {skill}
            </li>
          ))}
        </ul>
        {certificate.url && (
          <a
            href={certificate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 md:mt-auto"
          >
            View certificate
            <ArrowUpRight className="size-4" />
          </a>
        )}
      </div>
    </article>
  );
}

export function Achievements() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stack = stackRef.current;
      if (!stack) return;
      const slots = gsap.utils.toArray<HTMLElement>("[data-cert-slot]", stack);
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        slots.slice(0, -1).forEach((slot, i) => {
          const card = slot.firstElementChild as HTMLElement | null;
          if (!card) return;
          const depth = slots.length - 1 - i;
          // Explicit start values: tweening a filter from "none" would start at brightness(0).
          gsap.fromTo(
            card,
            { scale: 1, rotateX: 0, filter: "brightness(1)" },
            {
              scale: 1 - depth * 0.045,
              rotateX: 10,
              filter: "brightness(0.92)",
              transformOrigin: "50% 0%",
              ease: "none",
              scrollTrigger: {
                trigger: slots[i + 1],
                start: "top bottom",
                endTrigger: stack,
                end: "bottom bottom",
                scrub: true,
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
    <section id="achievements" ref={sectionRef} className="relative bg-paper pb-24 pt-10 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeading
          index="04"
          kicker="Achievements & Certificates"
          title={
            <>
              A few milestones
              <br />
              so far.
            </>
          }
          description="Awards from a design expo and an internship program, plus certificates from courses I've completed. Use the button on each certificate to see the original."
        />

        <ul className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-4 md:gap-4">
          {stats.map((stat, i) => (
            <li key={stat.label}>
              <Reveal delay={i * 80} className="h-full rounded-[26px] bg-white p-5 ring-1 ring-ink/10 md:p-7">
                <p className="font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
                  <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-20 md:mt-28">
          <Reveal>
            <h3 className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
              <Trophy className="size-6 text-accent-deep" /> Awards
            </h3>
          </Reveal>
          <ul className="mt-6 border-b border-ink/10">
            {awards.map((award, i) => (
              <li key={award.title} className="group border-t border-ink/10 transition-colors hover:bg-white/60">
                <Reveal
                  delay={i * 80}
                  className="grid grid-cols-[3.5rem_1fr] items-center gap-x-4 gap-y-2 py-6 md:grid-cols-[6rem_1fr_auto] md:px-4 md:py-7"
                >
                  <span className="font-mono text-sm text-muted">{award.year}</span>
                  <div className="transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                    <p className="font-display text-xl font-bold tracking-tight text-ink md:text-3xl">{award.title}</p>
                    <p className="mt-1 text-sm text-muted">{award.event}</p>
                  </div>
                  <span className="col-start-2 w-fit rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-ink md:col-start-auto">
                    {award.rank}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 md:mt-28">
          <Reveal>
            <h3 className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
              <BadgeCheck className="size-6 text-electric" /> Certificates
            </h3>
          </Reveal>
          {/* --stack-step: how far each stacked card peeks out below the previous one. */}
          <div ref={stackRef} className="mt-8 [--stack-step:10px] md:[--stack-step:20px]">
            {certificates.map((certificate, i) => (
              <div
                key={certificate.title}
                data-cert-slot
                className="sticky pb-[5vh] [perspective:1400px] last:pb-0"
                style={{ top: `calc(12vh + ${i} * var(--stack-step))` }}
              >
                <CertificateCard certificate={certificate} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
