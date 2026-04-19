"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/glass/glass-panel";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { org_name: orgName },
        emailRedirectTo: `${location.origin}/callback`,
      },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <GlassPanel className="p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-mint)]/15 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">Check your email</h2>
        <p className="text-[var(--text-secondary)] text-sm">We sent a confirmation link to <strong>{email}</strong></p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="p-8">
      <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-6">Create account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="org">Organization name</Label>
          <Input id="org" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Inc." required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} autoComplete="new-password" />
        </div>
        {error && <p className="text-sm text-[var(--accent-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        Have an account?{" "}
        <Link href="/login" className="text-[var(--accent-blue)] hover:underline">Sign in</Link>
      </p>
    </GlassPanel>
  );
}
