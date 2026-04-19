"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderKanban, KeyRound, Activity, Globe,
  ScrollText, Bell, CreditCard, Users, Plug, Settings,
  ChevronRight, Zap,
} from "lucide-react";

const nav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "API Monitor", href: "/api-monitor", icon: Activity },
  { label: "API Keys", href: "/api-keys", icon: KeyRound },
  { label: "Websites", href: "/websites", icon: Globe },
  { label: "Logs", href: "/logs", icon: ScrollText },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Team", href: "/team", icon: Users },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-[var(--border)] glass fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-base text-[var(--text-primary)]">NexOps</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                active
                  ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border border-[var(--accent-blue)]/20"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[var(--border)]">
        <div className="px-3 py-2 rounded-lg bg-[var(--surface-active)]">
          <p className="text-xs text-[var(--text-muted)]">Free plan</p>
          <div className="mt-1.5 h-1 rounded-full bg-[var(--border)]">
            <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-violet)]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
