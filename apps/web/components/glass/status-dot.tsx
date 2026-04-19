import { cn } from "@/lib/utils";

type Status = "online" | "offline" | "degraded" | "pending";

const statusConfig: Record<Status, { color: string; pulse: string; label: string }> = {
  online: { color: "bg-[var(--accent-mint)]", pulse: "pulse-green", label: "Online" },
  offline: { color: "bg-[var(--accent-danger)]", pulse: "pulse-red", label: "Offline" },
  degraded: { color: "bg-[var(--accent-warn)]", pulse: "pulse-yellow", label: "Degraded" },
  pending: { color: "bg-[var(--text-muted)]", pulse: "", label: "Checking" },
};

interface StatusDotProps {
  status: Status;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusDot({ status, showLabel = false, size = "md", className }: StatusDotProps) {
  const config = statusConfig[status];
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2.5 h-2.5";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("rounded-full flex-shrink-0", dotSize, config.color, config.pulse)} />
      {showLabel && <span className="text-xs text-[var(--text-secondary)]">{config.label}</span>}
    </span>
  );
}
