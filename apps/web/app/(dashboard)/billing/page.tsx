import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatCard } from "@/components/glass/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Download } from "lucide-react";
import { BillingChart } from "./billing-chart";

const DEMO_INVOICES = [
  { id: "1", date: "Apr 1, 2026", amount: "$299.00", status: "paid", period: "Mar 2026" },
  { id: "2", date: "Mar 1, 2026", amount: "$249.00", status: "paid", period: "Feb 2026" },
  { id: "3", date: "Feb 1, 2026", amount: "$249.00", status: "paid", period: "Jan 2026" },
];

export default async function BillingPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Billing</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">MRR, costs, and invoices in one place</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="MRR" value="$4,820" icon={DollarSign} accent="mint" trend={{ value: 8.3 }} />
        <StatCard title="API Costs" value="$48.20" icon={TrendingDown} accent="violet" subtitle="This month" />
        <StatCard title="Net Margin" value="99%" icon={TrendingUp} accent="blue" />
        <StatCard title="Active Subs" value="42" icon={CreditCard} accent="blue" trend={{ value: 3 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BillingChart />

        <GlassPanel className="p-5">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4">API Cost Breakdown</h3>
          <div className="space-y-3">
            {[
              { provider: "OpenAI", cost: "$32.10", pct: 67, color: "var(--accent-blue)" },
              { provider: "Anthropic", cost: "$12.40", pct: 26, color: "var(--accent-violet)" },
              { provider: "Resend", cost: "$2.80", pct: 6, color: "var(--accent-mint)" },
              { provider: "Other", cost: "$0.90", pct: 1, color: "var(--text-muted)" },
            ].map((item) => (
              <div key={item.provider}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)]">{item.provider}</span>
                  <span className="font-mono-data text-[var(--text-primary)]">{item.cost}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-active)]">
                  <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Invoices</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {DEMO_INVOICES.map((inv) => (
            <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
              <div className="flex-1">
                <p className="text-sm text-[var(--text-primary)]">{inv.period}</p>
                <p className="text-xs text-[var(--text-muted)]">{inv.date}</p>
              </div>
              <span className="font-mono-data text-sm text-[var(--text-primary)]">{inv.amount}</span>
              <Badge variant="success">{inv.status}</Badge>
              <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Download invoice">
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
