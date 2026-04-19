"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface TopbarProps {
  title?: string;
  userEmail?: string;
}

export function Topbar({ title, userEmail }: TopbarProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 glass border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-20">
      {title && (
        <h1 className="font-display font-semibold text-base text-[var(--text-primary)]">{title}</h1>
      )}
      {!title && <div />}

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </Button>
        {userEmail && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-active)] border border-[var(--border)]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-[var(--text-secondary)] hidden sm:block max-w-32 truncate">{userEmail}</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
