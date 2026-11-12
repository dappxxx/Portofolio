import type { CSSProperties, ReactNode } from "react";
import type { Project } from "@/data/portfolio";

/*
 * Generated "screenshots" for projects without a live site (or until one is
 * added to /public/projects). Pure CSS, tinted with each project's accent.
 */

interface MockupProps {
  accent: string;
  title: string;
}

const INK = "#0e1b3d";

const Bar = ({ className = "", style }: { className?: string; style?: CSSProperties }) => (
  <span className={`block rounded-full ${className}`} style={style} />
);

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`h-full w-full overflow-hidden ${className}`}>{children}</div>;
}

/** Web dashboard with stats, a trend chart and an AI recommendation card. */
function Dashboard({ accent, title }: MockupProps) {
  const points = [30, 48, 41, 62, 55, 78, 70, 92];
  const line = points.map((y, i) => `${(i / (points.length - 1)) * 100},${100 - y}`).join(" ");
  return (
    <Frame className="grid grid-cols-[22%_1fr] bg-[#f3f5fa]">
      <aside className="space-y-2 p-3" style={{ background: INK }}>
        <div className="mb-4 flex items-center gap-1.5">
          <span className="size-3 rounded" style={{ background: accent }} />
          <span className="truncate text-[8px] font-bold text-white">{title}</span>
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1"
            style={i === 0 ? { background: `${accent}33` } : undefined}
          >
            <span className="size-2 rounded-sm bg-white/40" />
            <Bar className="h-1 flex-1 bg-white/25" />
          </div>
        ))}
      </aside>
      <main className="space-y-2.5 p-3">
        <div className="flex items-center justify-between">
          <Bar className="h-2 w-1/3" style={{ background: `${INK}b3` }} />
          <span className="size-4 rounded-full" style={{ background: `${INK}33` }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["12", "86%", "9"].map((value, i) => (
            <div key={value} className="rounded-lg bg-white p-2 shadow-sm">
              <Bar className="h-1 w-1/2" style={{ background: `${INK}33` }} />
              <p className="mt-1.5 text-[11px] font-extrabold" style={{ color: INK }}>
                {value}
              </p>
              <Bar className="mt-1 h-1 w-2/3" style={{ background: i === 0 ? accent : `${INK}22` }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1.6fr_1fr] gap-2">
          <div className="rounded-lg bg-white p-2 shadow-sm">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-16 w-full">
              <polygon points={`0,100 ${line} 100,100`} fill={accent} opacity="0.18" />
              <polyline points={line} fill="none" stroke={accent} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="rounded-lg p-2 text-white shadow-sm" style={{ background: INK }}>
            <p className="text-[7px] font-bold" style={{ color: accent }}>
              ✦ AI suggestion
            </p>
            <Bar className="mt-1.5 h-1 w-full bg-white/40" />
            <Bar className="mt-1 h-1 w-4/5 bg-white/40" />
            <Bar className="mt-1 h-1 w-3/5 bg-white/40" />
            <span className="mt-2 inline-block rounded-full px-1.5 py-0.5 text-[6.5px] font-bold" style={{ background: accent, color: INK }}>
              Apply
            </span>
          </div>
        </div>
        <div className="space-y-1.5 rounded-lg bg-white p-2 shadow-sm">
          {["Done", "In progress", "Review"].map((status, i) => (
            <div key={status} className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ background: `${INK}26` }} />
              <Bar className="h-1 flex-1" style={{ background: `${INK}26` }} />
              <span
                className="rounded-full px-1.5 py-0.5 text-[6.5px] font-bold"
                style={{ background: i === 0 ? `${accent}55` : `${INK}14`, color: INK }}
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </main>
    </Frame>
  );
}

/** Phone app: camera scanner on a nutrition label, analysis results and an AI chat bubble. */
function Mobile({ accent, title }: MockupProps) {
  const results = [
    { label: "Sugar", level: "High", color: "#ef4444" },
    { label: "Sodium", level: "Medium", color: "#f59e0b" },
    { label: "Fiber", level: "Good", color: "#22c55e" },
  ];
  return (
    <Frame className="grid grid-cols-[0.82fr_1.18fr] items-center gap-3 bg-[#ecfdf5] p-3">
      <div className="mx-auto flex h-full max-h-[96%] w-full max-w-[150px] flex-col rounded-[22px] p-2 shadow-lg" style={{ background: INK }}>
        <div className="flex items-center justify-between px-1 text-[7px] font-bold text-white">
          <span>{title}</span>
          <span className="size-1.5 rounded-full" style={{ background: accent }} />
        </div>
        <div className="relative mt-2 flex-1 overflow-hidden rounded-2xl bg-[#1f2b4d]">
          {/* Nutrition label under the camera */}
          <div className="absolute inset-x-4 inset-y-5 rounded-md bg-white p-1.5">
            <p className="text-[6px] font-extrabold" style={{ color: INK }}>
              Nutrition Facts
            </p>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="mt-1 flex items-center gap-1">
                <Bar className="h-[3px] flex-1 bg-[#0e1b3d33]" />
                <Bar className="h-[3px] w-3 bg-[#0e1b3d55]" />
              </div>
            ))}
          </div>
          {["left-2 top-2 border-l-2 border-t-2", "right-2 top-2 border-r-2 border-t-2", "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"].map(
            (corner) => (
              <span key={corner} className={`absolute size-4 rounded-sm ${corner}`} style={{ borderColor: accent }} />
            ),
          )}
          <span className="absolute inset-x-3 top-[45%] h-0.5 shadow-[0_0_10px_2px]" style={{ background: accent, color: accent }} />
        </div>
        <span className="mt-2 rounded-full py-1 text-center text-[7px] font-bold" style={{ background: accent, color: INK }}>
          Scan Label
        </span>
      </div>

      <div className="space-y-2">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="text-[9px] font-extrabold" style={{ color: INK }}>
            Analysis
          </p>
          <div className="mt-2 space-y-1.5">
            {results.map((row) => (
              <div key={row.label} className="flex items-center gap-2 rounded-lg bg-[#f6f8fb] px-2 py-1.5">
                <span className="size-2 rounded-full" style={{ background: row.color }} />
                <span className="flex-1 text-[8px] font-semibold" style={{ color: INK }}>
                  {row.label}
                </span>
                <span className="rounded-full px-1.5 py-0.5 text-[6.5px] font-bold text-white" style={{ background: row.color }}>
                  {row.level}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-1.5">
          <span className="grid size-5 shrink-0 place-items-center rounded-full text-[8px] font-bold" style={{ background: accent, color: INK }}>
            ✦
          </span>
          <p className="rounded-2xl rounded-bl-sm bg-white px-2.5 py-1.5 text-[7.5px] leading-snug shadow-sm" style={{ color: INK }}>
            This one is high in sugar. Try a low-sugar option!
          </p>
        </div>
      </div>
    </Frame>
  );
}

/** Generic marketing page, used for website projects without a screenshot. */
function Landing({ accent, title }: MockupProps) {
  return (
    <Frame className="relative p-4 text-white">
      <div className="absolute inset-0" style={{ background: INK }} />
      <span className="absolute -right-10 -top-10 size-40 rounded-full blur-2xl" style={{ background: `${accent}55` }} />
      <div className="relative flex items-center justify-between">
        <span className="text-[10px] font-extrabold">{title}</span>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <Bar key={i} className="h-1 w-6 bg-white/30" />
          ))}
          <span className="rounded-full px-2 py-0.5 text-[7px] font-bold" style={{ background: accent, color: INK }}>
            Start
          </span>
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-[1.2fr_1fr] items-center gap-3">
        <div>
          <p className="text-[20px] font-extrabold leading-[1.02] tracking-tight">{title}</p>
          <Bar className="mt-2 h-1 w-4/5 bg-white/25" />
          <Bar className="mt-1 h-1 w-3/5 bg-white/25" />
          <div className="mt-3 flex gap-1.5">
            <span className="h-4 w-14 rounded-full" style={{ background: accent }} />
            <span className="h-4 w-12 rounded-full border border-white/30" />
          </div>
        </div>
        <div className="aspect-square rounded-2xl" style={{ background: `linear-gradient(140deg, ${accent}, #3d6bff)` }} />
      </div>
    </Frame>
  );
}

export function ProjectMockup({ project }: { project: Project }) {
  const props = { accent: project.accent, title: project.title };
  switch (project.layout) {
    case "dashboard":
      return <Dashboard {...props} />;
    case "mobile":
      return <Mobile {...props} />;
    case "landing":
      return <Landing {...props} />;
  }
}
