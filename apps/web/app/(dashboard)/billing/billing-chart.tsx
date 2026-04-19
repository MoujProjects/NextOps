"use client";

import { GlassPanel } from "@/components/glass/glass-panel";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DATA = [
  { month: "Oct", mrr: 2400, costs: 18 },
  { month: "Nov", mrr: 2900, costs: 22 },
  { month: "Dec", mrr: 3200, costs: 28 },
  { month: "Jan", mrr: 3600, costs: 31 },
  { month: "Feb", mrr: 4100, costs: 39 },
  { month: "Mar", mrr: 4820, costs: 48 },
];

export function BillingChart() {
  return (
    <GlassPanel className="p-5">
      <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4">MRR vs API Costs — 6 months</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={DATA} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: "rgba(7,11,20,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }} />
          <Line type="monotone" dataKey="mrr" stroke="#00f5c4" strokeWidth={2} dot={false} name="MRR ($)" />
          <Line type="monotone" dataKey="costs" stroke="#ff4d6d" strokeWidth={1.5} dot={false} name="Costs ($)" />
        </LineChart>
      </ResponsiveContainer>
    </GlassPanel>
  );
}
