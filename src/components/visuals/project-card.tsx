import Image from "next/image";
import type { Project } from "@/data/portfolio";
import { ProjectMockup } from "@/components/visuals/project-mockup";

/** A project dressed as a browser window. Reads `--focus` (0–1) from its slot. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-[0_60px_120px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/15">
      <div className="flex h-8 items-center gap-1.5 border-b border-ink/10 bg-paper px-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto flex h-5 w-1/2 items-center justify-center truncate rounded-md bg-white px-2 font-mono text-[10px] text-muted ring-1 ring-ink/10">
          {project.url}
        </span>
      </div>
      <div className="relative h-[calc(100%-2rem)]">
        {project.image ? (
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            sizes="(max-width: 768px) 80vw, 560px"
            className="object-cover object-top"
          />
        ) : (
          <ProjectMockup project={project} />
        )}
      </div>
      {/* Cards turned away from the viewer sink into the dark. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-night"
        style={{ opacity: "calc((1 - var(--focus, 1)) * 0.8)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-accent"
        style={{ opacity: "calc(var(--focus, 0) * var(--focus, 0) * var(--focus, 0))" }}
      />
    </article>
  );
}
