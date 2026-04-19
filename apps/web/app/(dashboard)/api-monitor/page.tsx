import { requireUserWithOrg } from "@/lib/supabase/server";
import { getApiCallsStats, getRecentApiCalls } from "@/lib/db/queries";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatCard } from "@/components/glass/stat-card";
import { Activity, Zap, AlertCircle, TrendingUp } from "lucide-react";
import { formatCents, formatMs, formatNumber, relativeTime } from "@/lib/utils";
import { ApiCallsChart } from "./api-calls-chart";

export default async function ApiMonitorPage() {
  const { org } = await requireUserWithOrg();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [stats, recentCalls] = await Promise.all([
    getApiCallsStats(org.id, today),
    getRecentApiCalls(org.id, 20),
  ]);

  const totalCalls = Number(stats?.total ?? 0);
  const avgLatency = Number(stats?.avgLatency ?? 0);
  const totalCost = Number(stats?.totalCost ?? 0);
  const errorCount = recentCalls.filter((c) => c.statusCode >= 400).length;
  const errorRate = recentCalls.length > 0 ? ((errorCount / recentCalls.length) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">API Monitor</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Real-time tracking across all integrated providers</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Calls Today" value={formatNumber(totalCalls)} icon={Activity} accent="blue" />
        <StatCard title="Avg Latency" value={avgLatency ? formatMs(avgLatency) : "—"} icon={Zap} accent="mint" />
        <StatCard title="Error Rate" value={`${errorRate}%`} icon={AlertCircle} accent="danger" />
        <StatCard title="Cost Today" value={formatCents(totalCost)} icon={TrendingUp} accent="violet" />
      </div>

      <ApiCallsChart />

      {/* Recent calls */}
      <GlassPanel className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Recent API Calls</h3>
        </div>
        {recentCalls.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {recentCalls.map((call) => (
              <div key={call.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors text-sm">
                <span className={`font-mono-data text-xs px-1.5 py-0.5 rounded ${call.statusCode >= 400 ? "bg-[var(--accent-danger)]/10 text-[var(--accent-danger)]" : "bg-[var(--accent-mint)]/10 text-[var(--accent-mint)]"}`}>
                  {call.statusCode}
                </span>
                <span className="font-mono-data text-xs text-[var(--text-secondary)] flex-1 truncate">{call.method} {call.endpoint}</span>
                <span className="font-mono-data text-xs text-[var(--text-muted)] flex-shrink-0">{call.latencyMs}ms</span>
                {call.costCents != null && call.costCents > 0 && (
                  <span className="font-mono-data text-xs text-[var(--accent-mint)] flex-shrink-0">{formatCents(call.costCents)}</span>
                )}
                <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{relativeTime(call.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">No API calls recorded yet. Send requests through the proxy to see them here.</div>
        )}
      </GlassPanel>
    </div>
  );
}
