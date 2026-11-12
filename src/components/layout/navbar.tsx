"use client";

import { useLenis } from "lenis/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { navLinks, profile, socials } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["home", ...navLinks.map((link) => link.id)];

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  // Hide while reading downwards, come back as soon as the visitor scrolls up.
  const lenis = useLenis(({ scroll, direction }) => {
    setHidden(scroll > 240 && direction === 1);
  });

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setOpen(false);
    lenis?.start();
    lenis?.scrollTo(`#${id}`, { duration: 1.6 });
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-transform duration-700 ease-out-expo md:px-6",
          hidden && !open && "-translate-y-[140%]",
        )}
      >
        <nav aria-label="Main navigation" className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <a
            href="#home"
            onClick={(e) => goTo(e, "home")}
            className="flex items-center gap-2.5 rounded-full bg-white/75 py-1.5 pl-1.5 pr-4 shadow-sm ring-1 ring-ink/10 backdrop-blur-md"
          >
            <span className="grid size-8 place-items-center rounded-full bg-ink font-display text-[10.5px] font-extrabold tracking-tight text-accent">
              {profile.initials}
            </span>
            <span className="text-sm font-bold text-ink">
              {profile.shortName}
              <span className="text-electric">.</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 rounded-full bg-white/75 p-1.5 shadow-sm ring-1 ring-ink/10 backdrop-blur-md md:flex">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => goTo(e, link.id)}
                  aria-current={active === link.id ? "true" : undefined}
                  className={cn(
                    "block rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors lg:px-4",
                    active === link.id ? "bg-ink text-white" : "text-ink/65 hover:text-ink",
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={`mailto:${profile.email}`}
            className="hidden items-center gap-1.5 rounded-full bg-accent px-5 py-3 text-[13px] font-bold text-ink shadow-sm ring-1 ring-ink/10 transition hover:-translate-y-0.5 md:flex"
          >
            Get in touch
            <ArrowUpRight className="size-4" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-full bg-ink text-white shadow-sm md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </header>

      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-40 flex flex-col bg-ink px-6 pb-10 pt-28 text-white md:hidden">
          <span aria-hidden="true" className="absolute inset-0 bg-dot-grid [--dot-color:rgba(223,231,255,0.08)]" />
          <ul className="relative space-y-1">
            {navLinks.map((link, i) => (
              <li key={link.id} className="animate-menu-in" style={{ animationDelay: `${60 + i * 50}ms` }}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => goTo(e, link.id)}
                  className="flex items-baseline gap-4 py-2 font-display text-5xl font-extrabold tracking-tight"
                >
                  <span className="font-mono text-xs font-medium text-accent">0{i + 1}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="relative mt-auto space-y-3 text-sm text-sky/70">
            <a href={`mailto:${profile.email}`} className="block font-semibold text-accent">
              {profile.email}
            </a>
            <p className="flex gap-4">
              {socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="hover:text-white">
                  {social.label}
                </a>
              ))}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
