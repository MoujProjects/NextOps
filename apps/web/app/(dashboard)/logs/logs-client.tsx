"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

type LogLevel = "error" | "warn" | "info" | "debug";

const LEVEL_STYLES: Record<LogLevel, string> = {
  error: "destructive",
  warn: "warning",
  info: "default",
  debug: "secondary",
};

interface LogEntry {
  id: string;
  level: string;
  message: string;
  source: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function LogsClient({ logs }: { logs: LogEntry[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  const filtered = logs.filter((log) => {
    const matchesLevel = filter === "all" || log.level === filter;
    const matchesSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) || log.source.includes(search);
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Logs Explorer</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Search and filter logs from all sources.</p>
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
              <Badge variant={LEVEL_STYLES[log.level as LogLevel] as never} className="flex-shrink-0 mt-0.5 uppercase text-[10px]">
                {log.level}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)]">{log.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-muted)]">{log.source}</span>
                  {Object.keys(log.metadata).length > 0 && (
                    <span className="text-xs text-[var(--accent-blue)]/70 cursor-pointer hover:text-[var(--accent-blue)] transition-colors hidden group-hover:block">
                      {JSON.stringify(log.metadata)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{relativeTime(log.createdAt)}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">
              {logs.length === 0 ? "No logs yet. Logs will appear here as they are ingested." : "No logs match your filter"}
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
