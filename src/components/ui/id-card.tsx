import Image from "next/image";
import { Check, Mail, MapPin, RotateCcw } from "lucide-react";
import { Barcode } from "@/components/ui/barcode";
import { BrandIcon } from "@/components/ui/brand-icon";
import { idCard, profile } from "@/data/portfolio";

/*
 * Both faces are frosted glass (.glass-card in globals.css), designed at
 * 300×420 px; <Lanyard> scales them to fit and adds the glass thickness.
 */

function Slot({ dark = false }: { dark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        dark
          ? "absolute left-1/2 top-3.5 h-2.5 w-14 -translate-x-1/2 rounded-full bg-black/45 shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]"
          : "absolute left-1/2 top-3.5 h-2.5 w-14 -translate-x-1/2 rounded-full bg-ink/15 shadow-[inset_0_1px_3px_rgba(14,27,61,0.5)]"
      }
    />
  );
}

/** Coloured light caught inside the glass. Sits under the content (-z-10). */
function Tint({ dark = false }: { dark?: boolean }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[22px]">
      <span className={`absolute -right-14 -top-14 size-44 rounded-full blur-3xl ${dark ? "bg-electric/45" : "bg-accent/40"}`} />
      <span className={`absolute -bottom-16 -left-12 size-52 rounded-full blur-3xl ${dark ? "bg-accent/20" : "bg-electric/25"}`} />
    </span>
  );
}

/** Glossy band that slides across as the card swings (driven by --sheen). */
function Sheen() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
      <span className="absolute inset-y-0 -left-1/2 w-[200%] translate-x-[var(--sheen,0%)] bg-[linear-gradient(110deg,transparent_36%,rgba(255,255,255,0.55)_46%,rgba(255,255,255,0.12)_52%,transparent_60%)]" />
    </span>
  );
}

function Avatar() {
  return (
    <div className="relative h-[100px] w-[82px] shrink-0 overflow-hidden rounded-xl bg-ink shadow-[0_8px_18px_-10px_rgba(14,27,61,0.6)] ring-2 ring-white/80">
      {profile.photo ? (
        <Image src={profile.photo} alt={profile.name} fill sizes="82px" className="object-cover" />
      ) : (
        <>
          <span className="absolute inset-0 bg-dot-grid [--dot-color:rgba(255,205,60,0.55)] [--dot-gap:7px]" />
          <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
          <span className="absolute inset-0 grid place-items-center font-display text-[34px] font-extrabold tracking-tight text-white">
            {profile.initials}
          </span>
        </>
      )}
    </div>
  );
}

export function IdCardFront() {
  return (
    <div className="glass-card isolate h-full w-full text-ink">
      <Tint />
      <Slot />
      <span className="absolute -right-3 -top-3 rotate-[5deg] rounded-md bg-accent px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-ink shadow-[0_6px_14px_-6px_rgba(14,27,61,0.6)] ring-1 ring-white/60">
        {idCard.tag}
      </span>

      <header className="flex items-center gap-3 px-5 pt-10">
        <span className="grid size-9 place-items-center rounded-lg bg-ink font-display text-[12px] font-extrabold text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
          {profile.initials}
        </span>
        <div className="leading-tight">
          <p className="text-[12.5px] font-extrabold tracking-wide">{profile.name.toUpperCase()}</p>
          <p className="text-[9.5px] font-semibold tracking-[0.18em] text-electric">{idCard.subtitle}</p>
        </div>
      </header>

      <div className="mx-4 mt-4 flex gap-3 rounded-2xl bg-white/50 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_24px_-18px_rgba(14,27,61,0.5)] ring-1 ring-white/80">
        <Avatar />
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-[9px] font-bold tracking-[0.2em] text-electric">POSITION</p>
          <p className="mt-1 font-display text-[19px] font-extrabold leading-[1.05]">{idCard.position}</p>
          <p className="mt-1 text-[11px] text-muted">{idCard.focus}</p>
          <span className="mt-2 inline-block rounded-md bg-white/75 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest ring-1 ring-ink/10">
            {idCard.idNumber}
          </span>
        </div>
      </div>

      <ul className="mx-5 mt-4 space-y-2 border-t border-dashed border-ink/20 pt-4">
        {idCard.highlights.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[11.5px] font-medium text-ink-soft">
            <span className="grid size-4 shrink-0 place-items-center rounded-full bg-ink text-white">
              <Check className="size-2.5" strokeWidth={3.5} />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <footer className="absolute inset-x-5 bottom-4 flex items-end justify-between border-t border-dashed border-ink/20 pt-3">
        <div>
          <Barcode value={idCard.idNumber} className="h-7 w-[112px] text-ink" />
          <p className="mt-1 text-[8px] font-bold tracking-[0.14em] text-muted">{profile.site.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold tracking-[0.22em] text-electric">PERIOD</p>
          <p className="text-[12.5px] font-extrabold">{idCard.period}</p>
        </div>
      </footer>
      <Sheen />
    </div>
  );
}

export function IdCardBack() {
  const rows = [
    { icon: <Mail className="size-3.5 text-accent" />, text: profile.email },
    { icon: <BrandIcon name="github" className="size-3.5 text-accent" />, text: profile.site },
    { icon: <MapPin className="size-3.5 text-accent" />, text: profile.location },
  ];

  return (
    <div className="glass-card glass-card--dark isolate h-full w-full overflow-hidden text-sky">
      <Tint dark />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-dot-grid [--dot-color:rgba(223,231,255,0.12)] [--dot-gap:14px]" />
      <Slot dark />
      <div className="relative flex h-full flex-col px-6 pb-5 pt-12">
        <p className="font-mono text-[10px] tracking-[0.25em] text-accent">{"// CONTACT"}</p>
        <p className="mt-3 font-display text-[34px] font-extrabold leading-[0.95] text-white">
          Get in
          <br />
          touch
        </p>
        <ul className="mt-6 space-y-3">
          {rows.map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-[12px]">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">{icon}</span>
              <span className="truncate">{text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10.5px] font-semibold text-white ring-1 ring-white/15">
          <span className="size-2 animate-pulse-dot rounded-full bg-green-500" />
          {profile.availability}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-white/15 pt-3 text-[9px] font-bold tracking-[0.2em] text-sky/60">
          <span>CLICK TO FLIP</span>
          <RotateCcw className="size-3.5" />
        </div>
      </div>
      <Sheen />
    </div>
  );
}
