import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatusDot } from "@/components/glass/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Clock, ExternalLink } from "lucide-react";
import { AddWebsiteDialog } from "./add-website-dialog";

const DEMO_SITES = [
  { id: "1", url: "https://app.example.com", status: "online" as const, uptime: "99.98%", avgMs: 142, sslDays: 89, checks: 2880 },
  { id: "2", url: "https://api.example.com", status: "online" as const, uptime: "99.95%", avgMs: 89, sslDays: 23, checks: 2880 },
  { id: "3", url: "https://docs.example.com", status: "degraded" as const, uptime: "97.20%", avgMs: 980, sslDays: 60, checks: 2880 },
  { id: "4", url: "https://status.example.com", status: "online" as const, uptime: "100%", avgMs: 65, sslDays: 120, checks: 2880 },
];

export default async function WebsitesPage() {
  await requireUser();

  const stats = {
    total: DEMO_SITES.length,
    up: DEMO_SITES.filter((s) => s.status === "online").length,
    degraded: DEMO_SITES.filter((s) => s.status === "degraded").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Website Monitor</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Uptime, SSL, and response time tracking</p>
        </div>
        <AddWebsiteDialog />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <GlassPanel className="p-4 text-center">
          <p className="font-mono-data text-2xl font-bold text-[var(--accent-mint)]">{stats.up}/{stats.total}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Sites Up</p>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <p className="font-mono-data text-2xl font-bold text-[var(--accent-warn)]">{stats.degraded}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Degraded</p>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">99.78%</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Avg Uptime 30d</p>
        </GlassPanel>
      </div>

      <div className="grid gap-4">
        {DEMO_SITES.map((site) => (
          <GlassPanel key={site.id} className="p-5 hover:border-[var(--border-strong)] transition-all">
            <div className="flex items-center gap-4 flex-wrap">
              <StatusDot status={site.status} />
              <div className="flex-1 min-w-0">
                <a href={site.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors flex items-center gap-1">
                  {site.url}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </div>
              <div className="flex items-center gap-6 text-xs flex-wrap">
                <div className="text-center">
                  <p className="font-mono-data font-bold text-[var(--accent-mint)]">{site.uptime}</p>
                  <p className="text-[var(--text-muted)]">Uptime 30d</p>
                </div>
                <div className="text-center">
                  <p className="font-mono-data font-bold text-[var(--text-primary)]">{site.avgMs}ms</p>
                  <p className="text-[var(--text-muted)]">Avg response</p>
                </div>
                <div className="text-center flex items-center gap-1">
                  <Shield className={`w-3 h-3 ${site.sslDays < 30 ? "text-[var(--accent-warn)]" : "text-[var(--accent-mint)]"}`} />
                  <div>
                    <p className={`font-mono-data font-bold ${site.sslDays < 30 ? "text-[var(--accent-warn)]" : "text-[var(--text-primary)]"}`}>{site.sslDays}d</p>
                    <p className="text-[var(--text-muted)]">SSL expiry</p>
                  </div>
                </div>
              </div>
              <Badge variant={site.status === "online" ? "success" : site.status === "degraded" ? "warning" : "destructive"}>
                {site.status}
              </Badge>
            </div>

            {/* Mini uptime bar */}
            <div className="mt-3 flex gap-px">
              {Array.from({ length: 90 }, (_, i) => {
                const rand = Math.random();
                const up = rand > (site.status === "degraded" ? 0.05 : 0.002);
                return (
                  <div key={i} className={`flex-1 h-1.5 rounded-sm ${up ? "bg-[var(--accent-mint)]/60" : "bg-[var(--accent-danger)]/60"}`} />
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Last 90 days</p>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
