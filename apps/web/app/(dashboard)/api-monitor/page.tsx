import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatCard } from "@/components/glass/stat-card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, AlertCircle, TrendingUp } from "lucide-react";
import { ApiCallsChart } from "./api-calls-chart";

const DEMO_CALLS = [
  { id: "1", provider: "openai", endpoint: "/v1/chat/completions", method: "POST", status: 200, latency: 1240, cost: 0.042, time: "2s ago" },
  { id: "2", provider: "anthropic", endpoint: "/v1/messages", method: "POST", status: 200, latency: 890, cost: 0.018, time: "5s ago" },
  { id: "3", provider: "openai", endpoint: "/v1/embeddings", method: "POST", status: 200, latency: 320, cost: 0.001, time: "12s ago" },
  { id: "4", provider: "stripe", endpoint: "/v1/payment_intents", method: "POST", status: 200, latency: 430, cost: 0, time: "1m ago" },
  { id: "5", provider: "openai", endpoint: "/v1/chat/completions", method: "POST", status: 429, latency: 120, cost: 0, time: "2m ago" },
  { id: "6", provider: "resend", endpoint: "/emails", method: "POST", status: 200, latency: 210, cost: 0.001, time: "3m ago" },
];

export default async function ApiMonitorPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">API Monitor</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Real-time tracking across all integrated providers</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Requests/min" value="84" icon={Activity} accent="blue" trend={{ value: 12 }} />
        <StatCard title="p95 Latency" value="1.24s" icon={Zap} accent="mint" trend={{ value: -5 }} />
        <StatCard title="Error Rate" value="0.8%" icon={AlertCircle} accent="danger" trend={{ value: 0.2 }} />
        <StatCard title="Cost Today" value="$4.20" icon={TrendingUp} accent="violet" />
      </div>

      <ApiCallsChart />

      {/* Recent calls */}
      <GlassPanel className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Recent API Calls</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {DEMO_CALLS.map((call) => (
            <div key={call.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors text-sm">
              <span className={`font-mono-data text-xs px-1.5 py-0.5 rounded ${call.status >= 400 ? "bg-[var(--accent-danger)]/10 text-[var(--accent-danger)]" : "bg-[var(--accent-mint)]/10 text-[var(--accent-mint)]"}`}>
                {call.status}
              </span>
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">{call.provider}</span>
              <span className="font-mono-data text-xs text-[var(--text-secondary)] flex-1 truncate">{call.method} {call.endpoint}</span>
              <span className="font-mono-data text-xs text-[var(--text-muted)] flex-shrink-0">{call.latency}ms</span>
              {call.cost > 0 && (
                <span className="font-mono-data text-xs text-[var(--accent-mint)] flex-shrink-0">${call.cost.toFixed(4)}</span>
              )}
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{call.time}</span>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
