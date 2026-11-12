# Portofolio — Dafan Rusyda Hakim

Website portofolio dengan animasi scroll sinematik: kartu ID gantung yang bisa ditarik (fisika Verlet), nama dari titik-titik halftone yang menghindari kursor, efek **perspective tunnel** (zoom menembus jendela lalu terbang di lorong), carousel project 3D yang berputar saat scroll, dan footer halftone raksasa.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis (smooth scroll). Tidak butuh database/Supabase — kontak memakai `mailto:` dan tombol salin email.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Build produksi: `npm run build` lalu `npm start`.

## Mengubah isi website

Semua teks, project, skill, sertifikat, penghargaan, dan pengalaman ada di **satu file**: [`src/data/portfolio.ts`](src/data/portfolio.ts). Konten website berbahasa Inggris; komentar panduan di file itu tetap berbahasa Indonesia.

> Data diisi dari CV terbaru & CV lama, sertifikat, dan repo publik github.com/dappxxx. Level skill (1–5) masih perkiraan — sesuaikan sendiri.

- **Foto profil** → `public/images/profile.jpg` (dari CV lama). Ganti file-nya, atau isi `profile.photo = null` untuk avatar inisial.
- **Screenshot project** → `public/projects/*.jpg` (diambil dari website live). Tanpa `image`, kartu memakai mockup otomatis (`layout`: `dashboard`, `mobile`, `landing`).
- **Sertifikat** → file PDF + pratinjau JPG di `public/certificates/`, lalu daftarkan di `certificates`.
- **Nama besar di hero** → `profile.headline` (satu item = satu baris). Kata raksasa di footer → `profile.wordmark`.

## Struktur

```
src/
  app/                 layout, halaman, CSS global (token warna & font)
  data/portfolio.ts    SEMUA konten website
  lib/                 gsap, font, matematika, simulasi fisika lanyard
  components/
    sections/          hero, portal (tunnel), projects, skills, achievements, experience, contact, footer
    ui/                halftone-text, halftone-wordmark-footer (21st.dev), lanyard, id-card, dll.
    visuals/           kanvas tunnel, cincin teks di belakang kartu hero, mockup & kartu project
    layout/            navbar, progress bar
    providers/         smooth scroll (Lenis ↔ GSAP ScrollTrigger)
```

## Deploy

Paling mudah ke [Vercel](https://vercel.com/new): import repo ini, tanpa konfigurasi tambahan.
