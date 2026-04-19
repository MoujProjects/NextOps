"use client";

import { GlassPanel } from "@/components/glass/glass-panel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DATA = Array.from({ length: 12 }, (_, i) => ({
  hour: `${String(i * 2).padStart(2, "0")}:00`,
  openai: Math.floor(200 + Math.random() * 600),
  anthropic: Math.floor(50 + Math.random() * 200),
  stripe: Math.floor(20 + Math.random() * 80),
  errors: Math.floor(Math.random() * 20),
}));

export function ApiCallsChart() {
  return (
    <GlassPanel className="p-5">
      <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4">Calls by Provider — 24h</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={DATA} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barSize={8}>
          <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "rgba(7,11,20,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }} />
          <Bar dataKey="openai" fill="#4f8dff" radius={[2, 2, 0, 0]} />
          <Bar dataKey="anthropic" fill="#9b5de5" radius={[2, 2, 0, 0]} />
          <Bar dataKey="stripe" fill="#00f5c4" radius={[2, 2, 0, 0]} />
          <Bar dataKey="errors" fill="#ff4d6d" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassPanel>
  );
}
