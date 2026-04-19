"use client";

import { cn, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label?: string };
  accent?: "blue" | "violet" | "mint" | "danger" | "warn";
  className?: string;
}

const accentStyles = {
  blue: { icon: "text-[var(--accent-blue)]", bg: "bg-[var(--accent-blue)]/10", border: "border-[var(--accent-blue)]/20" },
  violet: { icon: "text-[var(--accent-violet)]", bg: "bg-[var(--accent-violet)]/10", border: "border-[var(--accent-violet)]/20" },
  mint: { icon: "text-[var(--accent-mint)]", bg: "bg-[var(--accent-mint)]/10", border: "border-[var(--accent-mint)]/20" },
  danger: { icon: "text-[var(--accent-danger)]", bg: "bg-[var(--accent-danger)]/10", border: "border-[var(--accent-danger)]/20" },
  warn: { icon: "text-[var(--accent-warn)]", bg: "bg-[var(--accent-warn)]/10", border: "border-[var(--accent-warn)]/20" },
};

export function StatCard({ title, value, subtitle, icon, trend, accent = "blue", className }: StatCardProps) {
  const styles = accentStyles[accent];
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("glass-card p-5 hover:border-[var(--border-strong)] transition-all duration-200", className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">{title}</p>
          <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)] tabular-nums">{displayValue}</p>
          {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.value >= 0 ? "text-[var(--accent-mint)]" : "text-[var(--accent-danger)]")}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-[var(--text-muted)]">{trend.label}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("flex-shrink-0 p-2.5 rounded-lg", styles.bg, styles.border, "border")}>
            <div className={cn("w-5 h-5", styles.icon)}>{icon}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
