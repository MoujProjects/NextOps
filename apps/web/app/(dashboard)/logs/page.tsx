"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Filter } from "lucide-react";

type LogLevel = "error" | "warn" | "info" | "debug";

const LEVEL_STYLES: Record<LogLevel, string> = {
  error: "destructive",
  warn: "warning",
  info: "default",
  debug: "secondary",
};

const DEMO_LOGS = [
  { id: "1", level: "error" as LogLevel, message: "Failed to process payment: Card declined (code 402)", source: "nexops-api", time: "2s ago", meta: { userId: "usr_123", amount: 4900 } },
  { id: "2", level: "warn" as LogLevel, message: "Rate limit approaching: 95% of monthly quota used for OpenAI key", source: "nexops-api", time: "1m ago", meta: {} },
  { id: "3", level: "info" as LogLevel, message: "User authenticated successfully via GitHub OAuth", source: "auth", time: "3m ago", meta: { userId: "usr_456" } },
  { id: "4", level: "debug" as LogLevel, message: "Cache miss for key: user:profile:usr_789 — fetching from DB", source: "cache", time: "5m ago", meta: {} },
  { id: "5", level: "info" as LogLevel, message: "Webhook received from Stripe: payment_intent.succeeded", source: "webhooks", time: "8m ago", meta: { event: "pi_xxx" } },
  { id: "6", level: "error" as LogLevel, message: "Database connection timeout after 5000ms — retrying", source: "db", time: "12m ago", meta: {} },
  { id: "7", level: "info" as LogLevel, message: "Uptime check completed: 4/4 websites healthy", source: "cron", time: "15m ago", meta: {} },
  { id: "8", level: "warn" as LogLevel, message: "SSL certificate for docs.example.com expires in 23 days", source: "monitor", time: "1h ago", meta: { url: "docs.example.com" } },
];

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  const filtered = DEMO_LOGS.filter((log) => {
    const matchesLevel = filter === "all" || log.level === filter;
    const matchesSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) || log.source.includes(search);
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Logs Explorer</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Full-text search across all sources. Live tail via WebSocket.</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-3.5 h-3.5" /> Tail live
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <Input className="pl-9" placeholder="Search logs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["all", "error", "warn", "info", "debug"] as const).map((level) => (
            <button key={level} onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === level ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-[var(--accent-blue)]/30" : "bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-strong)]"}`}>
              {level}
            </button>
          ))}
        </div>
      </div>

      <GlassPanel className="overflow-hidden p-0 font-mono-data">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">{filtered.length} entries</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--surface-hover)] transition-colors group">
              <Badge variant={LEVEL_STYLES[log.level] as never} className="flex-shrink-0 mt-0.5 uppercase text-[10px]">
                {log.level}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)]">{log.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-muted)]">{log.source}</span>
                  {Object.keys(log.meta).length > 0 && (
                    <span className="text-xs text-[var(--accent-blue)]/70 cursor-pointer hover:text-[var(--accent-blue)] transition-colors hidden group-hover:block">
                      {JSON.stringify(log.meta)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{log.time}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">No logs match your filter</div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
