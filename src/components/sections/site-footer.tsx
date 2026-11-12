import HalftoneWordmarkFooter, { type FooterColumn } from "@/components/ui/halftone-wordmark-footer";
import { navLinks, profile, socials } from "@/data/portfolio";
import { fontDisplay, fontMono } from "@/lib/fonts";

const columns: FooterColumn[] = [
  {
    title: "Navigate",
    links: navLinks.slice(1, 5).map((link) => ({ label: link.label, href: `#${link.id}` })),
  },
  {
    title: "Social",
    links: socials.map((social) => ({ label: social.label, href: social.href })),
  },
  {
    title: "Contact",
    links: [
      { label: profile.email, href: `mailto:${profile.email}` },
      { label: "Send a message", href: `mailto:${profile.email}` },
    ],
  },
];

export function SiteFooter() {
  return (
    <HalftoneWordmarkFooter
      wordmark={profile.wordmark}
      label={profile.name}
      meta={`© ${profile.copyrightYear} · ${profile.location}`}
      columns={columns}
      preset="cobalt"
      palette={{ background: "#0a1433" }}
      fontFamily={fontDisplay.style.fontFamily}
      monoFamily={fontMono.style.fontFamily}
      height="clamp(440px, 62vh, 640px)"
    />
  );
}
