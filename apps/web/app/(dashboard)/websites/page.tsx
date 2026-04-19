import { requireUserWithOrg } from "@/lib/supabase/server";
import { getOrgWebsites } from "@/lib/db/queries";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatusDot } from "@/components/glass/status-dot";
import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink, Globe } from "lucide-react";
import { AddWebsiteDialog } from "./add-website-dialog";

export default async function WebsitesPage() {
  const { org } = await requireUserWithOrg();
  const sitesData = await getOrgWebsites(org.id);

  const stats = {
    total: sitesData.length,
    up: sitesData.filter((s) => s.lastStatus === "up").length,
    degraded: sitesData.filter((s) => s.lastStatus === "degraded").length,
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

      {sitesData.length > 0 ? (
        <>
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
              <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Total Sites</p>
            </GlassPanel>
          </div>

          <div className="grid gap-4">
            {sitesData.map((site) => {
              const statusLabel = site.lastStatus === "up" ? "online" : site.lastStatus === "degraded" ? "degraded" : site.lastStatus === "down" ? "offline" : "offline";
              const sslDays = site.sslExpiresAt ? Math.max(0, Math.floor((new Date(site.sslExpiresAt).getTime() - Date.now()) / 86400000)) : null;

              return (
                <GlassPanel key={site.id} className="p-5 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center gap-4 flex-wrap">
                    <StatusDot status={statusLabel as "online" | "degraded" | "offline"} />
                    <div className="flex-1 min-w-0">
                      <a href={site.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors flex items-center gap-1">
                        {site.url}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    </div>
                    <div className="flex items-center gap-6 text-xs flex-wrap">
                      {site.lastResponseMs != null && (
                        <div className="text-center">
                          <p className="font-mono-data font-bold text-[var(--text-primary)]">{site.lastResponseMs}ms</p>
                          <p className="text-[var(--text-muted)]">Response</p>
                        </div>
                      )}
                      {sslDays !== null && (
                        <div className="text-center flex items-center gap-1">
                          <Shield className={`w-3 h-3 ${sslDays < 30 ? "text-[var(--accent-warn)]" : "text-[var(--accent-mint)]"}`} />
                          <div>
                            <p className={`font-mono-data font-bold ${sslDays < 30 ? "text-[var(--accent-warn)]" : "text-[var(--text-primary)]"}`}>{sslDays}d</p>
                            <p className="text-[var(--text-muted)]">SSL</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant={statusLabel === "online" ? "success" : statusLabel === "degraded" ? "warning" : "destructive"}>
                      {statusLabel}
                    </Badge>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </>
      ) : (
        <GlassPanel className="p-12 text-center">
          <Globe className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No websites monitored yet. Add one to start tracking uptime.</p>
        </GlassPanel>
      )}
    </div>
  );
}
