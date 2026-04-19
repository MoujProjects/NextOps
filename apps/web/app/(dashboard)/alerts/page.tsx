import { requireUserWithOrg } from "@/lib/supabase/server";
import { getOrgAlerts } from "@/lib/db/queries";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Bell, Plus } from "lucide-react";
import { relativeTime } from "@/lib/utils";

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "default" | "secondary"> = {
  critical: "destructive", high: "destructive", medium: "warning", low: "default",
};

export default async function AlertsPage() {
  const { org } = await requireUserWithOrg();
  const alertsData = await getOrgAlerts(org.id);

  const active = alertsData.filter((a) => !a.resolvedAt);
  const resolved = alertsData.filter((a) => a.resolvedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Alerts</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{active.length} active · {resolved.length} resolved</p>
        </div>
        <Button><Plus className="w-4 h-4" />New rule</Button>
      </div>

      {active.length === 0 && resolved.length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <Bell className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No alerts yet. Set up alert rules to get started.</p>
        </GlassPanel>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Active ({active.length})</h2>
              <div className="space-y-3">
                {active.map((alert) => (
                  <GlassPanel key={alert.id} className="p-5 border-l-2" style={{ borderLeftColor: alert.severity === "critical" || alert.severity === "high" ? "var(--accent-danger)" : "var(--accent-warn)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.severity === "critical" || alert.severity === "high" ? "text-[var(--accent-danger)]" : "text-[var(--accent-warn)]"}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-[var(--text-primary)]">{alert.title}</h3>
                            <Badge variant={SEVERITY_VARIANT[alert.severity] ?? "default"}>{alert.severity}</Badge>
                          </div>
                          {alert.description && <p className="text-xs text-[var(--text-secondary)]">{alert.description}</p>}
                          <p className="text-xs text-[var(--text-muted)] mt-1">{relativeTime(alert.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Recently resolved</h2>
              <div className="space-y-2">
                {resolved.map((alert) => (
                  <GlassPanel key={alert.id} className="p-4 opacity-60">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-[var(--accent-mint)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-secondary)]">{alert.title}</p>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">resolved {relativeTime(alert.resolvedAt!)}</span>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
