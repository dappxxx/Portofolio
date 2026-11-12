"use client";

// Contact — the last stop. Rings drift past like the tunnel from earlier, and
// the whole block flies in from depth as the section arrives. The email can be
// opened in a mail app or copied with one click.

import { Check, Copy, Mail, Send } from "lucide-react";
import { useRef, useState } from "react";
import { BrandIcon } from "@/components/ui/brand-icon";
import { profile, socials } from "@/data/portfolio";
import { gsap, useGSAP } from "@/lib/gsap";

const RINGS = 8;
const RING_SECONDS = 9;

function TunnelRings() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="absolute inset-0 bg-dot-grid [--dot-color:rgba(223,231,255,0.07)]" />
      <span className="absolute left-1/2 top-1/2 size-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/25 blur-[110px]" />
      {Array.from({ length: RINGS }, (_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 h-[88%] w-[92%] animate-tunnel-ring rounded-[56px] border border-sky/15"
          style={{ animationDelay: `${(-i * RING_SECONDS) / RINGS}s` }}
        />
      ))}
    </div>
  );
}

/** Clipboard API first; falls back to a hidden textarea where the API is blocked (e.g. plain http). */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
}

function EmailCard() {
  const [copied, setCopied] = useState(false);
  const subject = encodeURIComponent(`Hi ${profile.shortName}, let's work together!`);

  const copy = async () => {
    if (await copyText(profile.email)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 rounded-[28px] bg-white/[0.06] p-3 ring-1 ring-white/15 backdrop-blur-sm sm:flex-row sm:items-center">
      <a
        href={`mailto:${profile.email}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[20px] px-3 py-2.5 text-left transition-colors hover:bg-white/5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-ink">
          <Mail className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs text-sky/60">My email</span>
          <span className="block truncate font-display text-lg font-bold text-white md:text-2xl">{profile.email}</span>
        </span>
      </a>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[18px] bg-white/10 px-5 py-3.5 text-sm font-bold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
        >
          {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <a
          href={`mailto:${profile.email}?subject=${subject}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[18px] bg-accent px-5 py-3.5 text-sm font-bold text-ink transition hover:-translate-y-0.5"
        >
          <Send className="size-4" />
          Send
        </a>
      </div>
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </div>
  );
}

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          contentRef.current,
          { z: -900, rotateX: 14, opacity: 0 },
          {
            z: 0,
            rotateX: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 15%", scrub: 0.6 },
          },
        );
      });
      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden rounded-t-[2.5rem] bg-night text-sky md:rounded-t-[4rem]"
    >
      <TunnelRings />
      <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-28 [perspective:1100px] md:px-10 md:pb-32 md:pt-36">
        <div ref={contentRef} className="flex flex-col items-center text-center">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-sky/60">
            <span className="text-accent">06</span>
            <span aria-hidden="true" className="h-px w-10 bg-current opacity-40" />
            Contact
          </p>
          <h2 className="mt-6 font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold leading-[0.88] tracking-[-0.045em] text-white">
            Got an idea?
            <br />
            <span className="text-accent">Let&apos;s build it together.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-sky/70 md:text-lg">
            I&apos;m open to internships, freelance projects, and collaborations, especially in web, Android, and AI.
            Send me an email and I&apos;ll get back to you.
          </p>
          <EmailCard />
          <ul className="mt-10 flex flex-wrap justify-center gap-3">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <BrandIcon name={social.icon} className="size-4" />
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
