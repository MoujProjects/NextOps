import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Bell, Plus } from "lucide-react";

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "default" | "secondary"> = {
  critical: "destructive", high: "destructive", medium: "warning", low: "default",
};

const DEMO_ALERTS = [
  { id: "1", severity: "critical", title: "High error rate on OpenAI API", description: "Error rate exceeded 10% for the last 5 minutes", type: "api_error_rate", resolvedAt: null, time: "2m ago" },
  { id: "2", severity: "medium", title: "Degraded response time on docs.example.com", description: "Average response time > 800ms for 10 minutes", type: "uptime", resolvedAt: null, time: "15m ago" },
  { id: "3", severity: "high", title: "SSL certificate expiring soon", description: "api.example.com SSL expires in 23 days", type: "ssl", resolvedAt: null, time: "1h ago" },
  { id: "4", severity: "low", title: "Monthly budget 80% used — OpenAI", description: "$80 of $100 budget consumed this month", type: "budget", resolvedAt: "30m ago", time: "3h ago" },
];

export default async function AlertsPage() {
  await requireUser();
  const active = DEMO_ALERTS.filter((a) => !a.resolvedAt);
  const resolved = DEMO_ALERTS.filter((a) => a.resolvedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Alerts</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{active.length} active · {resolved.length} resolved</p>
        </div>
        <Button><Plus className="w-4 h-4" />New rule</Button>
      </div>

      <div>
        <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Active ({active.length})</h2>
        <div className="space-y-3">
          {active.map((alert) => (
            <GlassPanel key={alert.id} className="p-5 border-l-2" style={{ borderLeftColor: alert.severity === "critical" ? "var(--accent-danger)" : alert.severity === "high" ? "var(--accent-danger)" : "var(--accent-warn)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.severity === "critical" || alert.severity === "high" ? "text-[var(--accent-danger)]" : "text-[var(--accent-warn)]"}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-[var(--text-primary)]">{alert.title}</h3>
                      <Badge variant={SEVERITY_VARIANT[alert.severity]}>{alert.severity}</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{alert.description}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{alert.time}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0">Resolve</Button>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>

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
                  <span className="text-xs text-[var(--text-muted)]">resolved {alert.resolvedAt}</span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
