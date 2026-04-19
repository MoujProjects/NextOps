"use client";

import { useEffect, useRef, useState } from "react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function generatePoint(i: number) {
  return {
    time: `${String(i).padStart(2, "0")}:00`,
    calls: Math.floor(300 + Math.random() * 800),
    errors: Math.floor(Math.random() * 30),
    latency: Math.floor(80 + Math.random() * 120),
  };
}

const INITIAL_DATA = Array.from({ length: 24 }, (_, i) => generatePoint(i));

export function RealtimeDashboard() {
  const [data, setData] = useState(INITIAL_DATA);
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1), generatePoint(new Date().getHours())];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [live]);

  return (
    <GlassPanel className="p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">API Calls — 24h</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${live ? "bg-[var(--accent-mint)] pulse-green" : "bg-[var(--text-muted)]"}`} />
          <button
            onClick={() => setLive((v) => !v)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {live ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f8dff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4f8dff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="errorsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} interval={5} />
          <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "rgba(7,11,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            itemStyle={{ color: "rgba(255,255,255,0.9)" }}
          />
          <Area type="monotone" dataKey="calls" stroke="#4f8dff" strokeWidth={2} fill="url(#callsGrad)" name="Calls" />
          <Area type="monotone" dataKey="errors" stroke="#ff4d6d" strokeWidth={1.5} fill="url(#errorsGrad)" name="Errors" />
        </AreaChart>
      </ResponsiveContainer>
    </GlassPanel>
  );
}
