import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";

const INTEGRATIONS = [
  { id: "vercel", name: "Vercel", desc: "Deploy status, domains, and logs", connected: true, lastSync: "2m ago" },
  { id: "supabase", name: "Supabase", desc: "DB size, MAU, bandwidth, and queries", connected: true, lastSync: "5m ago" },
  { id: "github", name: "GitHub", desc: "Issues, PRs, and commit history", connected: true, lastSync: "15m ago" },
  { id: "stripe", name: "Stripe", desc: "MRR, subscriptions, and invoices", connected: false, lastSync: null },
  { id: "openai", name: "OpenAI", desc: "Usage, billing, and rate limits", connected: false, lastSync: null },
  { id: "anthropic", name: "Anthropic", desc: "Claude API usage and costs", connected: false, lastSync: null },
  { id: "slack", name: "Slack", desc: "Alert notifications to channels", connected: false, lastSync: null },
  { id: "discord", name: "Discord", desc: "Alert webhooks to Discord servers", connected: false, lastSync: null },
];

export default async function IntegrationsPage() {
  await requireUser();
  const connected = INTEGRATIONS.filter((i) => i.connected).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Integrations</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{connected} of {INTEGRATIONS.length} connected</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration) => (
          <GlassPanel key={integration.id} className="p-5 hover:border-[var(--border-strong)] transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--surface-active)] border border-[var(--border)] flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--text-primary)]">{integration.name[0]}</span>
              </div>
              {integration.connected ? (
                <CheckCircle className="w-4 h-4 text-[var(--accent-mint)]" />
              ) : (
                <XCircle className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </div>
            <h3 className="font-medium text-sm text-[var(--text-primary)]">{integration.name}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-4">{integration.desc}</p>
            <div className="flex items-center justify-between">
              {integration.connected ? (
                <>
                  <span className="text-xs text-[var(--text-muted)]">Synced {integration.lastSync}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Disconnect</Button>
                  </div>
                </>
              ) : (
                <Button size="sm" variant="outline" className="text-xs h-7 w-full">
                  Connect
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
