import { requireUserWithOrg } from "@/lib/supabase/server";
import { getOrgBillingEvents, getApiCallsStats } from "@/lib/db/queries";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatCard } from "@/components/glass/stat-card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, CreditCard } from "lucide-react";
import { formatCents, relativeTime } from "@/lib/utils";
import { BillingChart } from "./billing-chart";

export default async function BillingPage() {
  const { org } = await requireUserWithOrg();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [billingEvents, stats] = await Promise.all([
    getOrgBillingEvents(org.id, 20),
    getApiCallsStats(org.id, monthStart),
  ]);

  const totalApiCost = Number(stats?.totalCost ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Billing</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Costs and billing events in one place</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="API Costs" value={formatCents(totalApiCost)} icon={TrendingDown} accent="violet" subtitle="This month" />
        <StatCard title="Plan" value={org.plan?.charAt(0).toUpperCase() + org.plan?.slice(1)} icon={CreditCard} accent="blue" />
        <StatCard title="Events" value={String(billingEvents.length)} icon={DollarSign} accent="mint" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BillingChart />

        <GlassPanel className="p-5">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4">API Cost This Month</h3>
          <p className="font-mono-data text-3xl font-bold text-[var(--accent-mint)]">{formatCents(totalApiCost)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Aggregated from all proxy calls</p>
        </GlassPanel>
      </div>

      <GlassPanel className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Billing Events</h3>
        </div>
        {billingEvents.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {billingEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-primary)]">{ev.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-[var(--text-muted)]">{relativeTime(ev.createdAt)}</p>
                </div>
                {ev.amountCents != null && (
                  <span className="font-mono-data text-sm text-[var(--text-primary)]">{formatCents(ev.amountCents)}</span>
                )}
                <Badge variant="outline">{ev.currency?.toUpperCase() ?? "USD"}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">No billing events yet.</div>
        )}
      </GlassPanel>
    </div>
  );
}
