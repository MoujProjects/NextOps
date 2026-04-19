import { requireUserWithOrg } from "@/lib/supabase/server";
import { getOrgAlerts, getOrgApiKeys, getOrgProjects, getOrgWebsites, getApiCallsStats, getOrgActivity } from "@/lib/db/queries";
import { StatCard } from "@/components/glass/stat-card";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatusDot } from "@/components/glass/status-dot";
import { Activity, Key, Globe, DollarSign, AlertTriangle, Zap } from "lucide-react";
import { formatCents, formatNumber, formatMs, relativeTime } from "@/lib/utils";
import { RealtimeDashboard } from "./realtime-dashboard";

export default async function DashboardPage() {
  const { user, org } = await requireUserWithOrg();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [stats, apiKeysData, websitesData, alertsData, activityData] = await Promise.all([
    getApiCallsStats(org.id, today),
    getOrgApiKeys(org.id),
    getOrgWebsites(org.id),
    getOrgAlerts(org.id),
    getOrgActivity(org.id, 10),
  ]);

  const activeAlerts = alertsData.filter((a) => !a.resolvedAt);
  const totalCalls = Number(stats?.total ?? 0);
  const avgLatency = Number(stats?.avgLatency ?? 0);
  const totalCost = Number(stats?.totalCost ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Overview</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}. Here&apos;s your command center.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="API Calls Today" value={formatNumber(totalCalls)} icon={<Activity className="w-5 h-5" />} accent="blue" />
        <StatCard title="Avg Latency" value={avgLatency ? formatMs(avgLatency) : "—"} subtitle="p50 across all keys" icon={<Zap className="w-5 h-5" />} accent="mint" />
        <StatCard title="Cost This Month" value={formatCents(totalCost)} icon={<DollarSign className="w-5 h-5" />} accent="violet" />
        <StatCard title="Active Alerts" value={String(activeAlerts.length)} subtitle={activeAlerts.length > 0 ? `${activeAlerts.filter(a => a.severity === "critical").length} critical` : "All clear"} icon={<AlertTriangle className="w-5 h-5" />} accent={activeAlerts.length > 0 ? "danger" : "mint"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RealtimeDashboard />
        </div>

        <div className="space-y-4">
          <GlassPanel className="p-5">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--accent-mint)]" />
              Websites
            </h3>
            {websitesData.length > 0 ? (
              <div className="space-y-3">
                {websitesData.slice(0, 5).map((site) => {
                  const status = site.lastStatus === "up" ? "online" : site.lastStatus === "degraded" ? "degraded" : site.lastStatus === "down" ? "offline" : "offline";
                  return (
                    <div key={site.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusDot status={status} />
                        <span className="text-sm text-[var(--text-secondary)] truncate">{site.url.replace(/^https?:\/\//, "")}</span>
                      </div>
                      {site.lastResponseMs && (
                        <span className="font-mono-data text-xs text-[var(--text-muted)] flex-shrink-0">{site.lastResponseMs}ms</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No websites monitored yet</p>
            )}
          </GlassPanel>

          <GlassPanel className="p-5">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-[var(--accent-blue)]" />
              API Keys
            </h3>
            {apiKeysData.length > 0 ? (
              <div className="space-y-2">
                {apiKeysData.slice(0, 5).map((key) => (
                  <div key={key.id} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)] truncate">{key.label}</span>
                    <span className="font-mono-data text-xs text-[var(--accent-blue)]">{key.provider}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No API keys added yet</p>
            )}
          </GlassPanel>
        </div>
      </div>

      {/* Recent activity */}
      <GlassPanel className="p-5">
        <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4">Recent Activity</h3>
        {activityData.length > 0 ? (
          <div className="space-y-3">
            {activityData.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]/60 flex-shrink-0" />
                <span className="text-[var(--text-secondary)]">
                  <span className="text-[var(--text-primary)]">{item.action.replace(/\./g, " ").replace(/_/g, " ")}</span>
                  {item.resource ? ` — ${item.resource}` : ""}
                </span>
                <span className="ml-auto text-xs text-[var(--text-muted)] flex-shrink-0">{relativeTime(item.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No activity yet. Start by adding a project or API key.</p>
        )}
      </GlassPanel>
    </div>
  );
}
