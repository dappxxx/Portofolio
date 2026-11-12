/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SEMUA ISI WEBSITE ADA DI FILE INI (konten dalam bahasa Inggris).
 *
 *  Sumber data: CV terbaru & CV lama, profil LinkedIn, sertifikat
 *  (public/certificates), dan repo publik github.com/dappxxx. Level skill (1–5)
 *  adalah perkiraan — silakan sesuaikan dengan penilaianmu sendiri.
 *
 *  - Foto profil   : public/images/profile.jpg (diambil dari CV lama)
 *  - Screenshot    : public/projects/*.jpg (diambil dari website live)
 *  - Sertifikat    : public/certificates/*.pdf + pratinjau *.jpg
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { BrandIconName } from "@/components/ui/brand-icon";

export const profile = {
  name: "Dafan Rusyda Hakim",
  shortName: "Dafan",
  initials: "DRH",
  /** Baris-baris nama besar di hero (dibuat dari titik-titik halftone). */
  headline: ["DAFAN", "RUSYDA HAKIM"],
  /** Kata raksasa di footer. Huruf kecil paling bagus. */
  wordmark: "dafan",
  role: "Full-Stack Web & Android Developer",
  /** Deskripsi singkat untuk mesin pencari & preview link. */
  tagline: "Informatics student at Universitas Islam Indonesia who builds web and Android apps, some of them with AI inside.",
  /** Paragraf perkenalan di halaman awal. */
  intro:
    "Informatics student at Universitas Islam Indonesia. I build web apps with React and Next.js and Android apps with Kotlin. Lately I've been adding AI to my projects, like reading nutrition labels from a photo of the package.",
  location: "Sleman, Yogyakarta",
  availability: "Open to internships & freelance",
  email: "dafanrusyda@gmail.com",
  /** Alamat yang tampil di kartu ID. */
  site: "github.com/dappxxx",
  /** Taruh foto di /public lalu isi path-nya. null = avatar inisial. */
  photo: "/images/profile.jpg" as string | null,
  copyrightYear: 2026,
};

export const idCard = {
  tag: "OPEN TO WORK",
  subtitle: "INFORMATICS · UII",
  position: "Web & Android Developer",
  focus: "BSc Informatics · UII",
  idNumber: "DRH-INF-2023",
  period: "2023 — NOW",
  highlights: ["GPA 3.66 · Informatics UII", "Mobile dev intern · Bank Mandiri", "Core Team GDSC UII"],
};

export const about = {
  kicker: "About Me",
  title: "Here's what I've been building lately.",
  left: ["Here's what", "I've been"],
  right: ["building", "lately."],
  bio: "I'm Dafan, an Informatics student at UII (class of 2023). Most of my time goes into building web and Android apps, and my favorite part is what people touch directly: the interface and how it flows. Scroll into the window to see my projects.",
  facts: [
    { label: "Campus", value: "Informatics UII" },
    { label: "GPA", value: "3.66 / 4.00" },
    { label: "Based in", value: "Yogyakarta" },
  ],
};

export const navLinks = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export const socials: { label: string; href: string; icon: BrandIconName }[] = [
  { label: "GitHub", href: "https://github.com/dappxxx", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dafanrusydahakim/", icon: "linkedin" },
];

/* ── Project ──────────────────────────────────────────────────────────────── */

/** Mockup otomatis untuk project yang belum punya screenshot. */
export type MockupLayout = "dashboard" | "mobile" | "landing";

export interface Project {
  slug: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  role: string;
  stack: string[];
  /** Alamat yang tampil di address bar kartu. */
  url: string;
  links: { live?: string; repo?: string };
  /** Screenshot di /public/projects. Kosongkan untuk mockup otomatis. */
  image?: string;
  accent: string;
  layout: MockupLayout;
}

export const projects: Project[] = [
  {
    slug: "nutriscan",
    title: "NutriScan",
    category: "Android App · AI",
    year: "2025",
    summary:
      "An Android app that tells you what's in a product: snap a photo of the nutrition label and it does the rest. It has an AI chat for questions, advice adjusted to the user's health conditions (like diabetes or allergies), a daily streak, and a scan history that saves automatically.",
    role: "Solo project · Android",
    stack: ["Kotlin", "Jetpack Compose", "Supabase", "Gemini API"],
    url: "github.com/dappxxx/NutriScanApp",
    links: { repo: "https://github.com/dappxxx/NutriScanApp" },
    image: "/projects/nutriscan.jpg",
    accent: "#34d399",
    layout: "mobile",
  },
  {
    slug: "ruang-belajar-desa",
    title: "Ruang Belajar Desa",
    category: "Learning Website · Community Service",
    year: "2026",
    summary:
      "A library of learning materials for the residents of Banjarharjo hamlet, built during my KKN community service program in 2026. Residents can search and filter materials on finance, law, the environment, psychology, and statistics written by 9 KKN members.",
    role: "Web Developer",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    url: "banjarharjo.vercel.app",
    links: { live: "https://banjarharjo.vercel.app", repo: "https://github.com/dappxxx/WebsiteBanjarharjo" },
    image: "/projects/banjarharjo.jpg",
    accent: "#f2c94c",
    layout: "landing",
  },
  {
    slug: "flowtica",
    title: "Flowtica",
    category: "Web App · AI",
    year: "2025",
    summary:
      "A project management site for freelancers. You log each project with its deadline, payment, and type of work, and the AI suggests which one to tackle first and explains why.",
    role: "Team project · Full-stack",
    stack: ["React", "Vite", "FastAPI", "Supabase", "Groq LLM"],
    url: "github.com/dappxxx/Flowtica",
    links: { repo: "https://github.com/dappxxx/Flowtica" },
    image: "/projects/flowtica.jpg",
    accent: "#a78bfa",
    layout: "dashboard",
  },
  {
    slug: "blc-ugm",
    title: "BLC UGM",
    category: "Organization Website",
    year: "2025",
    summary:
      "Website for the Business Law Community at the Faculty of Law, Universitas Gadjah Mada, with the organization's profile, a welcome note from its president director, its vision, research, and articles.",
    role: "Web Developer",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    url: "blcugm.vercel.app",
    links: { live: "https://blcugm.vercel.app", repo: "https://github.com/dappxxx/BLC" },
    image: "/projects/blc-ugm.jpg",
    accent: "#f87171",
    layout: "landing",
  },
  {
    slug: "neurorest",
    title: "NeuroRest",
    category: "Product Landing Page",
    year: "2025",
    summary:
      "Landing page for NeuroRest, a concept aromatherapy sleep mask with earphones that track your heart rate. The page walks through the features and how the product works, with plenty of visuals.",
    role: "Frontend Developer",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    url: "neurorest-website.vercel.app",
    links: { live: "https://neurorest-website.vercel.app", repo: "https://github.com/dappxxx/neurorest-website" },
    image: "/projects/neurorest.jpg",
    accent: "#60a5fa",
    layout: "landing",
  },
  {
    slug: "nutricare",
    title: "NutriCare SPKK",
    category: "Clinical Decision Support",
    year: "2025",
    summary:
      "A web-based clinical decision support system for staff at community health centers (puskesmas), with account sign-up and login handled by Supabase.",
    role: "Web Developer",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    url: "nutricare-zeta.vercel.app",
    links: { live: "https://nutricare-zeta.vercel.app", repo: "https://github.com/dappxxx/NutriCare-Website" },
    image: "/projects/nutricare.jpg",
    accent: "#38bdf8",
    layout: "dashboard",
  },
];

/* ── Skill ────────────────────────────────────────────────────────────────── */

export interface Skill {
  name: string;
  /** Logo brand. Kosongkan untuk ikon umum. */
  icon?: BrandIconName;
  /** Warna saat disorot. Default: warna resmi brand dari `icon`. */
  color?: string;
  /** 1–5 */
  level: number;
}

export interface SkillGroup {
  id: "frontend" | "mobile" | "backend" | "tools";
  code: string;
  title: string;
  caption: string;
  wide: boolean;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    code: "01 / Web",
    title: "Web Frontend",
    caption: "Websites and web apps that work on any screen.",
    wide: true,
    skills: [
      { name: "React", icon: "react", level: 4 },
      { name: "Next.js", icon: "nextjs", level: 4 },
      { name: "TypeScript", icon: "typescript", level: 3 },
      { name: "Tailwind CSS", icon: "tailwind", level: 4 },
      { name: "shadcn/ui", icon: "shadcn", level: 3 },
      { name: "Bootstrap", icon: "bootstrap", level: 3 },
      { name: "HTML & CSS", icon: "html", level: 4 },
      { name: "Vite", icon: "vite", level: 3 },
    ],
  },
  {
    id: "mobile",
    code: "02 / Mobile",
    title: "Mobile & Desktop",
    caption: "Native Android and JavaFX desktop apps.",
    wide: false,
    skills: [
      { name: "Kotlin", icon: "kotlin", level: 4 },
      { name: "Jetpack Compose", icon: "compose", level: 3 },
      { name: "Java & JavaFX", icon: "java", level: 3 },
      { name: "Android Studio", icon: "androidstudio", level: 4 },
      { name: "XML & Material Design", icon: "materialdesign", level: 3 },
    ],
  },
  {
    id: "backend",
    code: "03 / Data",
    title: "Backend & Data",
    caption: "Databases, user login, and APIs.",
    wide: false,
    skills: [
      { name: "Supabase", icon: "supabase", level: 4 },
      { name: "SQL", icon: "mysql", level: 4 },
      { name: "Laravel & PHP", icon: "laravel", level: 3 },
      { name: "FastAPI", icon: "fastapi", level: 3 },
      { name: "Firebase", icon: "firebase", level: 3 },
    ],
  },
  {
    id: "tools",
    code: "04 / Tools & AI",
    title: "Tools & AI",
    caption: "Everyday tools, deployment, and LLM integration.",
    wide: true,
    skills: [
      { name: "Git", icon: "git", level: 4 },
      { name: "GitHub", icon: "github", level: 4 },
      { name: "GitLab", icon: "gitlab", level: 3 },
      { name: "Postman", icon: "postman", level: 3 },
      { name: "Vercel", icon: "vercel", level: 4 },
      { name: "Gemini API", icon: "gemini", level: 3 },
      { name: "Groq LLM API", color: "#F55036", level: 3 },
      { name: "Agile Development", color: "#3d6bff", level: 3 },
    ],
  },
];

export const learning: { name: string; icon?: BrandIconName }[] = [
  { name: "LLM & AI integration", icon: "gemini" },
  { name: "iOS & Swift", icon: "swift" },
  { name: "Freelancing for global clients" },
];

export const softSkills = [
  "Communication",
  "Public speaking",
  "Leadership",
  "Teamwork",
  "Time management",
  "Problem solving",
  "Critical thinking",
];

export const marqueeTech: { name: string; icon: BrandIconName }[] = [
  { name: "React", icon: "react" },
  { name: "Next.js", icon: "nextjs" },
  { name: "TypeScript", icon: "typescript" },
  { name: "JavaScript", icon: "javascript" },
  { name: "Tailwind", icon: "tailwind" },
  { name: "shadcn/ui", icon: "shadcn" },
  { name: "Bootstrap", icon: "bootstrap" },
  { name: "Vite", icon: "vite" },
  { name: "Chart.js", icon: "chartjs" },
  { name: "Kotlin", icon: "kotlin" },
  { name: "Jetpack Compose", icon: "compose" },
  { name: "Java", icon: "java" },
  { name: "Android", icon: "android" },
  { name: "Laravel", icon: "laravel" },
  { name: "PHP", icon: "php" },
  { name: "FastAPI", icon: "fastapi" },
  { name: "Supabase", icon: "supabase" },
  { name: "Firebase", icon: "firebase" },
  { name: "MySQL", icon: "mysql" },
  { name: "Git", icon: "git" },
  { name: "GitLab", icon: "gitlab" },
  { name: "Postman", icon: "postman" },
  { name: "Vercel", icon: "vercel" },
  { name: "Gemini", icon: "gemini" },
];

/* ── Pencapaian & sertifikat ─────────────────────────────────────────────── */

export const awards = [
  {
    year: "2025",
    title: "Excellent Rating, Mobile Developer Internship",
    event: "Bank Mandiri × Rakamin Academy · average score 91.74",
    rank: "Excellent",
  },
  {
    year: "2023",
    title: "Favorite Team Award, 2nd Place",
    event: "Design Expo 2023 · Team Narla (team leader)",
    rank: "2nd Place",
  },
];

export interface Certificate {
  title: string;
  /** Judul lanjutan yang panjang (opsional). */
  subtitle?: string;
  issuer: string;
  date: string;
  credentialId?: string;
  score?: string;
  /** Pratinjau gambar sertifikat (public/certificates). */
  image?: string;
  /** Link file sertifikat atau halaman verifikasi. */
  url?: string;
  accent: string;
  skills: string[];
}

export const certificates: Certificate[] = [
  {
    title: "Mobile Apps Developer, Project-Based Internship",
    issuer: "Bank Mandiri × Rakamin Academy",
    date: "September 2025",
    credentialId: "349855IAPDGIM2982025",
    score: "91.74 · Excellent",
    image: "/certificates/mandiri-pbi-mobile-apps-developer.jpg",
    url: "/certificates/mandiri-pbi-mobile-apps-developer.pdf",
    accent: "#0f9fa8",
    skills: ["GitLab", "API", "iOS", "Android"],
  },
  {
    title: "Belajar Membuat Aplikasi Android untuk Pemula",
    subtitle: "Android development for beginners · competency certificate, valid until September 2028",
    issuer: "Dicoding Indonesia",
    date: "September 2025",
    credentialId: "MRZM64NRRPYQ",
    image: "/certificates/dicoding-android-pemula.jpg",
    url: "https://www.dicoding.com/certificates/MRZM64NRRPYQ",
    accent: "#3ddc84",
    skills: ["Android", "Android Studio", "Activity", "RecyclerView"],
  },
  {
    title: "Memulai Pemrograman dengan Kotlin",
    subtitle: "Getting started with Kotlin · competency certificate, valid until September 2028",
    issuer: "Dicoding Indonesia",
    date: "September 2025",
    credentialId: "JMZVVN3Q3ZN9",
    image: "/certificates/dicoding-kotlin.jpg",
    url: "https://www.dicoding.com/certificates/JMZVVN3Q3ZN9",
    accent: "#7f52ff",
    skills: ["Kotlin"],
  },
  {
    title: "Career Essentials in Software Development",
    subtitle: "Learning Path by Microsoft and LinkedIn, 8 hours 20 minutes",
    issuer: "Microsoft × LinkedIn Learning",
    date: "August 2025",
    credentialId: "06a7c2728569242ada11eb7b30b8dd0cbbcae4dd0f0b8db7404ca2d6fadbb876",
    image: "/certificates/microsoft-linkedin-software-development.jpg",
    url: "https://www.linkedin.com/learning/certificates/06a7c2728569242ada11eb7b30b8dd0cbbcae4dd0f0b8db7404ca2d6fadbb876",
    accent: "#0a66c2",
    skills: ["Programming", "Software Development"],
  },
  {
    title: "Belajar Dasar Pemrograman Web",
    subtitle: "Web programming fundamentals · 41 hours of study, valid until August 2028",
    issuer: "Dicoding Indonesia",
    date: "August 2025",
    credentialId: "MEPJ2EYNWP3V",
    image: "/certificates/dicoding-dasar-pemrograman-web.jpg",
    url: "https://www.dicoding.com/certificates/MEPJ2EYNWP3V",
    accent: "#2d3e50",
    skills: ["HTML", "CSS", "Flexbox", "Responsive Layout"],
  },
  {
    title: "Foundations of Freelancing",
    subtitle: "Unleashing Entrepreneurial Potential on Ever Evolving Digital Labour Market",
    issuer: "ENTEEF MOOCs · Path to Freelancing",
    date: "October 2026",
    score: "Average 96%",
    image: "/certificates/enteef-foundations-of-freelancing.jpg",
    url: "/certificates/enteef-foundations-of-freelancing.pdf",
    accent: "#3d6bff",
    skills: ["Freelancing", "Entrepreneurship", "Risk Management"],
  },
  {
    title: "Boosting Entrepreneurship at the Global Market",
    subtitle: "Practical Guide How to Start, Manage and Develop Career on the Leading Digital Labour Platforms",
    issuer: "ENTEEF MOOCs · Path to Freelancing",
    date: "October 2026",
    score: "Average 90%",
    image: "/certificates/enteef-boosting-entrepreneurship.jpg",
    url: "/certificates/enteef-boosting-entrepreneurship.pdf",
    accent: "#f4b400",
    skills: ["Digital Labour Platforms", "Personal Branding", "Client Communication"],
  },
  {
    title: "Favorite Team Award, 2nd Place",
    subtitle: "With Team Narla, as team leader",
    issuer: "Design Expo 2023",
    date: "2023",
    accent: "#f4b400",
    skills: ["Leadership", "Design", "Presentation"],
  },
];

/**
 * Angka di bagian Pencapaian. Sertifikat & penghargaan dihitung otomatis dari
 * daftar di atas; dua angka lainnya isian sementara, sesuaikan sendiri.
 */
export const stats = [
  { value: 15, decimals: 0, suffix: "+", label: "Projects completed" },
  { value: certificates.length, decimals: 0, suffix: "", label: "Certificates" },
  { value: awards.length, decimals: 0, suffix: "", label: "Awards" },
  { value: 3, decimals: 0, suffix: "+", label: "Years coding" },
];

/* ── Pengalaman & pendidikan ─────────────────────────────────────────────── */

export interface Experience {
  period: string;
  role: string;
  company: string;
  type: string;
  location: string;
  summary: string;
  points: string[];
  stack: string[];
}

export const experiences: Experience[] = [
  {
    period: "Aug – Sep 2025",
    role: "Mobile Application Developer",
    company: "PT Bank Mandiri (Persero) Tbk × Rakamin",
    type: "Virtual Internship",
    location: "Remote",
    summary: "A project-based virtual internship from Bank Mandiri and Rakamin, focused on Android app development.",
    points: [
      "Built new features and fixed UI components with Android Studio, Java, and Kotlin.",
      "Finished with an average score of 91.74 and an Excellent rating. The program also covered GitLab, API integration, and iOS.",
    ],
    stack: ["Android Studio", "Kotlin", "Java", "GitLab", "API"],
  },
  {
    period: "Nov 2024 – Oct 2025",
    role: "Core Team · Community Staff",
    company: "Google Developer Student Clubs UII",
    type: "Community",
    location: "Yogyakarta",
    summary: "Core team member who runs the developer community's activities on campus.",
    points: [
      "Helped prepare community events, from planning through the day itself.",
      "Hosted the onboarding sessions as MC to welcome new members.",
      "Kept events running smoothly and made sure participants felt at home.",
    ],
    stack: ["Events", "Public Speaking", "Teamwork"],
  },
  {
    period: "2024",
    role: "Team Lead · FinFuturist",
    company: "Application Expo Project",
    type: "Team Project",
    location: "Yogyakarta",
    summary: "Led the team that built FinFuturist, a web app for learning financial literacy.",
    points: [
      "The app drew a steady crowd at the expo and got positive feedback from the judges.",
      "Split the work, kept the schedule, and made sure everyone on the team pitched in ideas.",
    ],
    stack: ["Java", "Leadership"],
  },
  {
    period: "Mar 2024 – Jan 2025",
    role: "Member",
    company: "Programming Study Club UII",
    type: "Organization",
    location: "Yogyakarta",
    summary: "A programming study club on campus.",
    points: [
      "Joined study sessions and discussions on Java and JavaScript.",
      "Learned alongside other members through small projects and peer mentoring.",
    ],
    stack: ["Java", "JavaScript"],
  },
  {
    period: "2023",
    role: "Team Lead · Narla",
    company: "Design Expo Project",
    type: "Team Project",
    location: "Yogyakarta",
    summary: "Led Team Narla as we developed and presented our project at the Design Expo.",
    points: [
      "Our team won 2nd place in the Most Favorite category (Favorite Team Award).",
      "Organized tasks and timelines so the project was ready before expo day.",
    ],
    stack: ["Leadership", "Design", "Presentation"],
  },
];

export const education = [
  {
    school: "Universitas Islam Indonesia",
    program: "BSc Informatics",
    period: "Sep 2023 – Jan 2027 (expected)",
    note: "GPA 3.66",
  },
  {
    school: "MAN 1 Yogyakarta",
    program: "Science (MIPA)",
    period: "Jul 2020 – May 2023",
  },
];
