import { requireUserWithOrg } from "@/lib/supabase/server";
import { getOrgApiKeys } from "@/lib/db/queries";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Key, RotateCcw, Trash2 } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import { AddApiKeyDialog } from "./add-api-key-dialog";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  anthropic: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  stripe: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  github: "bg-[var(--text-muted)]/10 text-[var(--text-secondary)] border-[var(--border)]",
  resend: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  default: "bg-[var(--surface-active)] text-[var(--text-secondary)] border-[var(--border)]",
};

export default async function ApiKeysPage() {
  const { org } = await requireUserWithOrg();
  const keysData = await getOrgApiKeys(org.id);

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
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">{keysData.length} active keys</h3>
        </div>
        {keysData.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {keysData.map((key) => {
              const colorClass = PROVIDER_COLORS[key.provider] ?? PROVIDER_COLORS.default;
              return (
                <div key={key.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
                  <div className={`px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}>
                    {key.provider}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{key.label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      sk-•••••••••••••••••••• {key.lastUsed ? `· last used ${relativeTime(key.lastUsed)}` : "· never used"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="success" className="text-xs">Active</Badge>
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
        ) : (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">
            No API keys yet. Click &quot;Add API Key&quot; to get started.
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
