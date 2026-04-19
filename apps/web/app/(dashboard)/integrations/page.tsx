import { requireUserWithOrg } from "@/lib/supabase/server";
import { getOrgIntegrations } from "@/lib/db/queries";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";

const AVAILABLE_INTEGRATIONS = [
  { id: "vercel", name: "Vercel", desc: "Deploy status, domains, and logs" },
  { id: "supabase", name: "Supabase", desc: "DB size, MAU, bandwidth, and queries" },
  { id: "github", name: "GitHub", desc: "Issues, PRs, and commit history" },
  { id: "stripe", name: "Stripe", desc: "MRR, subscriptions, and invoices" },
  { id: "openai", name: "OpenAI", desc: "Usage, billing, and rate limits" },
  { id: "anthropic", name: "Anthropic", desc: "Claude API usage and costs" },
  { id: "slack", name: "Slack", desc: "Alert notifications to channels" },
  { id: "discord", name: "Discord", desc: "Alert webhooks to Discord servers" },
];

export default async function IntegrationsPage() {
  const { org } = await requireUserWithOrg();
  const connectedIntegrations = await getOrgIntegrations(org.id);

  const connectedProviders = new Set(connectedIntegrations.map((i) => i.provider));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Integrations</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{connectedProviders.size} of {AVAILABLE_INTEGRATIONS.length} connected</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AVAILABLE_INTEGRATIONS.map((integration) => {
          const isConnected = connectedProviders.has(integration.id as never);
          return (
            <GlassPanel key={integration.id} className="p-5 hover:border-[var(--border-strong)] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-active)] border border-[var(--border)] flex items-center justify-center">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{integration.name[0]}</span>
                </div>
                {isConnected ? (
                  <CheckCircle className="w-4 h-4 text-[var(--accent-mint)]" />
                ) : (
                  <XCircle className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </div>
              <h3 className="font-medium text-sm text-[var(--text-primary)]">{integration.name}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-4">{integration.desc}</p>
              <div className="flex items-center justify-between">
                {isConnected ? (
                  <>
                    <span className="text-xs text-[var(--accent-mint)]">Connected</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Disconnect</Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs h-7 w-full">
                    Connect
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
