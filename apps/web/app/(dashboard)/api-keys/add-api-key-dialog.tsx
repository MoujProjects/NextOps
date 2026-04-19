"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addApiKey } from "@/lib/actions/api-keys";
import { Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PROVIDERS } from "@nexops/shared";

export function AddApiKeyDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [provider, setProvider] = useState("openai");
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [budget, setBudget] = useState("");
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  function reset() { setLabel(""); setKey(""); setBudget(""); setShowKey(false); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addApiKey({
        provider, label, key,
        monthlyBudgetCents: budget ? Math.round(parseFloat(budget) * 100) : undefined,
      });
      if (result.success) {
        toast({ title: "Key added securely", description: "Encrypted with AES-256-GCM." });
        setOpen(false); reset();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4" />Add key</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add API key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="key-label">Label *</Label>
            <Input id="key-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. OpenAI Production" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="key-value">API Key *</Label>
            <div className="relative">
              <Input
                id="key-value"
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-…"
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Encrypted with AES-256-GCM before storage. Never logged.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="key-budget">Monthly budget (USD, optional)</Label>
            <Input id="key-budget" type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 100" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !label || !key}>
              {isPending ? "Encrypting…" : "Add key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
