import { notFound } from "next/navigation";
import { requireUserWithOrg } from "@/lib/supabase/server";
import {
  getProjectById,
  getProjectApiKeys,
  getProjectApiCallsStats,
  getProjectRecentApiCalls,
  getProjectWebsites,
  getProjectLogs,
  getProjectActivity,
} from "@/lib/db/queries";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatCard } from "@/components/glass/stat-card";
import { StatusDot } from "@/components/glass/status-dot";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Zap, DollarSign, AlertCircle, Key, Globe,
  ScrollText, GitBranch, ExternalLink, ArrowLeft, Clock,
} from "lucide-react";
import { formatCents, formatMs, formatNumber, relativeTime } from "@/lib/utils";
import Link from "next/link";

const statusBadge: Record<string, "success" | "warning" | "secondary"> = {
  live: "success", staging: "warning", dev: "secondary",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { org } = await requireUserWithOrg();
  const project = await getProjectById(id, org.id);
  if (!project) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [todayStats, monthStats, projectKeys, recentCalls, projectWebsites, projectLogs, projectActivity] = await Promise.all([
    getProjectApiCallsStats(id, org.id, today),
    getProjectApiCallsStats(id, org.id, monthStart),
    getProjectApiKeys(id, org.id),
    getProjectRecentApiCalls(id, org.id, 20),
    getProjectWebsites(id, org.id),
    getProjectLogs(id, org.id, 20),
    getProjectActivity(id, org.id, 10),
  ]);

  const techStack = (project.techStack as string[]) ?? [];
  const errorRate = todayStats.total > 0 ? ((todayStats.errorCount / todayStats.total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-4">
          <ArrowLeft className="w-3 h-3" />
          Back to projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">{project.name}</h1>
              <Badge variant={statusBadge[project.status] ?? "secondary"}>{project.status}</Badge>
            </div>
            {project.description && (
              <p className="text-sm text-[var(--text-secondary)] mt-1">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors">
                  <GitBranch className="w-3.5 h-3.5" />
                  Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {techStack.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {techStack.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-xs bg-[var(--surface-active)] text-[var(--text-muted)] border border-[var(--border)]">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="API Calls Today" value={formatNumber(todayStats.total)} icon={<Activity className="w-5 h-5" />} accent="blue" />
        <StatCard title="Avg Latency" value={todayStats.avgLatency ? formatMs(todayStats.avgLatency) : "—"} icon={<Zap className="w-5 h-5" />} accent="mint" />
        <StatCard title="Error Rate" value={`${errorRate}%`} icon={<AlertCircle className="w-5 h-5" />} accent={Number(errorRate) > 5 ? "danger" : "mint"} />
        <StatCard title="Cost This Month" value={formatCents(monthStats.totalCost)} icon={<DollarSign className="w-5 h-5" />} accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent API Calls */}
        <div className="lg:col-span-2">
          <GlassPanel className="overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-blue)]" />
                Recent API Calls
              </h3>
              <span className="text-xs text-[var(--text-muted)]">{todayStats.total} today</span>
            </div>
            {recentCalls.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors text-sm">
                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${call.statusCode >= 400 ? "bg-[var(--accent-danger)]/10 text-[var(--accent-danger)]" : "bg-[var(--accent-mint)]/10 text-[var(--accent-mint)]"}`}>
                      {call.statusCode}
                    </span>
                    <span className="font-mono text-xs text-[var(--text-secondary)] flex-1 truncate">{call.method} {call.endpoint}</span>
                    <span className="font-mono text-xs text-[var(--text-muted)] flex-shrink-0">{call.latencyMs}ms</span>
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{relativeTime(call.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <Activity className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-muted)]">No API calls recorded yet</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Assign API keys to this project to start tracking</p>
              </div>
            )}
          </GlassPanel>
        </div>

        {/* Sidebar: Keys + Websites */}
        <div className="space-y-4">
          {/* API Keys */}
          <GlassPanel className="p-5">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-[var(--accent-violet)]" />
              API Keys
              <span className="ml-auto text-xs text-[var(--text-muted)]">{projectKeys.length} active</span>
            </h3>
            {projectKeys.length > 0 ? (
              <div className="space-y-2">
                {projectKeys.map((key) => (
                  <div key={key.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{key.label}</p>
                      <p className="text-xs text-[var(--text-muted)]">{key.provider}</p>
                    </div>
                    {key.lastUsed && (
                      <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{relativeTime(key.lastUsed)}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">No keys assigned to this project</p>
            )}
          </GlassPanel>

          {/* Websites */}
          <GlassPanel className="p-5">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--accent-mint)]" />
              Websites
              <span className="ml-auto text-xs text-[var(--text-muted)]">{projectWebsites.length} monitored</span>
            </h3>
            {projectWebsites.length > 0 ? (
              <div className="space-y-2">
                {projectWebsites.map((site) => {
                  const status = site.lastStatus === "up" ? "online" : site.lastStatus === "degraded" ? "degraded" : "offline";
                  return (
                    <div key={site.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <StatusDot status={status} />
                      <span className="text-xs text-[var(--text-secondary)] truncate flex-1">{site.url}</span>
                      {site.lastResponseMs && (
                        <span className="text-xs text-[var(--text-muted)]">{site.lastResponseMs}ms</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">No websites linked to this project</p>
            )}
          </GlassPanel>
        </div>
      </div>

      {/* Logs + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Logs */}
        <GlassPanel className="overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[var(--accent-warn)]" />
              Recent Logs
            </h3>
          </div>
          {projectLogs.length > 0 ? (
            <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
              {projectLogs.map((log) => {
                const levelColor = log.level === "error" ? "text-[var(--accent-danger)]"
                  : log.level === "warn" ? "text-[var(--accent-warn)]"
                  : "text-[var(--text-muted)]";
                return (
                  <div key={log.id} className="px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-xs uppercase font-medium ${levelColor}`}>{log.level}</span>
                      <span className="text-xs text-[var(--text-muted)]">{relativeTime(log.createdAt)}</span>
                      {log.source && <span className="text-xs text-[var(--text-muted)]">· {log.source}</span>}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{log.message}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-[var(--text-muted)]">No logs for this project</p>
            </div>
          )}
        </GlassPanel>

        {/* Activity */}
        <GlassPanel className="overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-blue)]" />
              Activity
            </h3>
          </div>
          {projectActivity.length > 0 ? (
            <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
              {projectActivity.map((act) => (
                <div key={act.id} className="px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">{act.action}</span>
                    <span className="text-xs text-[var(--text-muted)]">{relativeTime(act.createdAt)}</span>
                  </div>
                  {act.resource && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{act.resource}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-[var(--text-muted)]">No activity recorded</p>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
