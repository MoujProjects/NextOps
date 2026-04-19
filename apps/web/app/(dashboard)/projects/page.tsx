import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch, ExternalLink, FolderKanban } from "lucide-react";
import { StatusDot } from "@/components/glass/status-dot";
import { CreateProjectDialog } from "./create-project-dialog";

const DEMO_PROJECTS = [
  {
    id: "1", name: "NexOps Landing", slug: "nexops-landing", status: "live" as const,
    description: "Marketing site for NexOps platform",
    techStack: ["Next.js", "Tailwind", "Vercel"],
    repoUrl: "https://github.com/example/nexops-landing",
  },
  {
    id: "2", name: "NexOps API", slug: "nexops-api", status: "staging" as const,
    description: "Core API service handling all backend operations",
    techStack: ["Node.js", "Drizzle", "Supabase"],
    repoUrl: "https://github.com/example/nexops-api",
  },
  {
    id: "3", name: "Mobile App", slug: "mobile-app", status: "dev" as const,
    description: "React Native companion app",
    techStack: ["React Native", "Expo", "TypeScript"],
    repoUrl: null,
  },
];

const statusMap: Record<string, "online" | "degraded" | "offline"> = {
  live: "online", staging: "degraded", dev: "offline",
};

const badgeMap: Record<string, "success" | "warning" | "secondary"> = {
  live: "success", staging: "warning", dev: "secondary",
};

export default async function ProjectsPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Projects</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{DEMO_PROJECTS.length} projects across all environments</p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_PROJECTS.map((project) => (
          <GlassPanel key={project.id} className="p-5 hover:border-[var(--border-strong)] transition-all duration-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-violet)]/20 border border-[var(--border)] flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 text-[var(--accent-blue)]" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-[var(--text-primary)]">{project.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{project.slug}</p>
                </div>
              </div>
              <Badge variant={badgeMap[project.status]}>{project.status}</Badge>
            </div>

            {project.description && (
              <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">{project.description}</p>
            )}

            <div className="flex flex-wrap gap-1 mb-4">
              {project.techStack.map((tech) => (
                <span key={tech} className="px-1.5 py-0.5 rounded text-xs bg-[var(--surface-active)] text-[var(--text-muted)] border border-[var(--border)]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <StatusDot status={statusMap[project.status]} showLabel />
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <GitBranch className="w-3 h-3" />
                  Repo
                </a>
              )}
            </div>
          </GlassPanel>
        ))}

        {/* Empty add card */}
        <CreateProjectDialog asCard />
      </div>
    </div>
  );
}
