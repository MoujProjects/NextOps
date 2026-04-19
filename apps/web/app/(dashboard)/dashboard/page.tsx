import { requireUser } from "@/lib/supabase/server";
import { getOrgAlerts, getOrgApiKeys, getOrgProjects, getOrgWebsites, getApiCallsStats, getRecentApiCalls, getOrgActivity } from "@/lib/db/queries";
import { StatCard } from "@/components/glass/stat-card";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatusDot } from "@/components/glass/status-dot";
import { Badge } from "@/components/ui/badge";
import { Activity, Key, Globe, DollarSign, AlertTriangle, Zap } from "lucide-react";
import { formatCents, relativeTime } from "@/lib/utils";
import { RealtimeDashboard } from "./realtime-dashboard";

async function getOrg(userId: string) {
  // In a real app, look up user's active org from DB
  // For demo, return null and components handle empty state
  return null;
}

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Overview</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}. Here&apos;s your command center.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="API Calls Today" value="12,483" subtitle="+8% vs yesterday" icon={Activity} accent="blue" trend={{ value: 8 }} />
        <StatCard title="Avg Latency" value="142ms" subtitle="p50 across all keys" icon={Zap} accent="mint" trend={{ value: -3 }} />
        <StatCard title="Cost This Month" value="$48.20" subtitle="OpenAI + Anthropic" icon={DollarSign} accent="violet" />
        <StatCard title="Active Alerts" value="2" subtitle="1 critical, 1 medium" icon={AlertTriangle} accent="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Realtime client section */}
        <div className="lg:col-span-2">
          <RealtimeDashboard />
        </div>

        {/* Quick status */}
        <div className="space-y-4">
          <GlassPanel className="p-5">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--accent-mint)]" />
              Websites
            </h3>
            <div className="space-y-3">
              {[
                { url: "app.example.com", status: "online" as const, ms: 142 },
                { url: "api.example.com", status: "online" as const, ms: 89 },
                { url: "docs.example.com", status: "degraded" as const, ms: 980 },
              ].map((site) => (
                <div key={site.url} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot status={site.status} />
                    <span className="text-sm text-[var(--text-secondary)] truncate">{site.url}</span>
                  </div>
                  <span className="font-mono-data text-xs text-[var(--text-muted)] flex-shrink-0">{site.ms}ms</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-[var(--accent-blue)]" />
              API Keys
            </h3>
            <div className="space-y-2">
              {[
                { label: "OpenAI GPT-4", provider: "openai", cost: "$32.10" },
                { label: "Anthropic Claude", provider: "anthropic", cost: "$12.40" },
                { label: "Stripe", provider: "stripe", cost: "$0.00" },
              ].map((key) => (
                <div key={key.label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)] truncate">{key.label}</span>
                  <span className="font-mono-data text-xs text-[var(--accent-mint)]">{key.cost}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Recent activity */}
      <GlassPanel className="p-5">
        <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: "API key rotated", resource: "OpenAI Production", user: "you", time: "2m ago" },
            { action: "Project created", resource: "nexops-landing", user: "you", time: "1h ago" },
            { action: "Alert resolved", resource: "High latency on api.example.com", user: "system", time: "3h ago" },
            { action: "Team member invited", resource: "alice@example.com", user: "you", time: "1d ago" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]/60 flex-shrink-0" />
              <span className="text-[var(--text-secondary)]"><span className="text-[var(--text-primary)]">{item.action}</span> — {item.resource}</span>
              <span className="ml-auto text-xs text-[var(--text-muted)] flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
