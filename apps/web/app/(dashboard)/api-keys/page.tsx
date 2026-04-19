import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Key, Plus, RotateCcw, Trash2, Eye, EyeOff } from "lucide-react";
import { AddApiKeyDialog } from "./add-api-key-dialog";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  anthropic: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  stripe: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  github: "bg-[var(--text-muted)]/10 text-[var(--text-secondary)] border-[var(--border)]",
  resend: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  default: "bg-[var(--surface-active)] text-[var(--text-secondary)] border-[var(--border)]",
};

const DEMO_KEYS = [
  { id: "1", provider: "openai", label: "OpenAI Production", lastUsed: "2m ago", costMonth: "$32.10", calls: 8420, isActive: true },
  { id: "2", provider: "anthropic", label: "Claude Opus", lastUsed: "15m ago", costMonth: "$12.40", calls: 1230, isActive: true },
  { id: "3", provider: "stripe", label: "Stripe Live", lastUsed: "1h ago", costMonth: "$0.00", calls: 340, isActive: true },
  { id: "4", provider: "resend", label: "Transactional Email", lastUsed: "3h ago", costMonth: "$2.80", calls: 560, isActive: true },
  { id: "5", provider: "github", label: "GitHub Actions", lastUsed: "1d ago", costMonth: "$0.00", calls: 45, isActive: false },
];

export default async function ApiKeysPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">API Key Vault</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">All keys encrypted with AES-256-GCM. Never exposed in logs.</p>
        </div>
        <AddApiKeyDialog />
      </div>

      {/* Security notice */}
      <div className="glass-card p-4 flex items-start gap-3 border-[var(--accent-mint)]/20">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-mint)]/10 flex items-center justify-center flex-shrink-0">
          <Key className="w-4 h-4 text-[var(--accent-mint)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">End-to-end encrypted vault</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Keys are encrypted with AES-256-GCM before storage. The plaintext key is never stored or logged. Decryption happens only at proxy time on the server.</p>
        </div>
      </div>

      {/* Keys table */}
      <GlassPanel className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">{DEMO_KEYS.filter(k => k.isActive).length} active keys</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {DEMO_KEYS.map((key) => {
            const colorClass = PROVIDER_COLORS[key.provider] ?? PROVIDER_COLORS.default;
            return (
              <div key={key.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors ${!key.isActive ? "opacity-50" : ""}`}>
                <div className={`px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}>
                  {key.provider}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{key.label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    sk-•••••••••••••••••••• · {key.calls.toLocaleString()} calls · last used {key.lastUsed}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono-data text-sm text-[var(--accent-mint)]">{key.costMonth}</p>
                  <p className="text-xs text-[var(--text-muted)]">this month</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {key.isActive ? (
                    <Badge variant="success" className="text-xs">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Rotate key">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--accent-danger)] hover:text-[var(--accent-danger)]" aria-label="Delete key">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
