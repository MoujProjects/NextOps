"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject } from "@/lib/actions/projects";
import { Plus, FolderKanban } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Props { asCard?: boolean }

export function CreateProjectDialog({ asCard }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"live" | "staging" | "dev">("dev");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createProject({ name, slug: slugify(name), status, description, repoUrl, techStack: [] });
      if (result.success) {
        toast({ title: "Project created", variant: "success" as never });
        setOpen(false);
        setName(""); setDescription(""); setRepoUrl("");
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  }

  const trigger = asCard ? (
    <button className="glass-card p-5 border-dashed hover:border-[var(--accent-blue)]/40 transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[180px] w-full text-center cursor-pointer">
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-[var(--border-strong)] flex items-center justify-center">
        <Plus className="w-5 h-5 text-[var(--text-muted)]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">New project</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Add a project to monitor</p>
      </div>
    </button>
  ) : (
    <Button><Plus className="w-4 h-4" />New project</Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">Name *</Label>
            <Input id="proj-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My SaaS App" required />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc">Description</Label>
            <Input id="proj-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this project do?" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-repo">GitHub URL</Label>
            <Input id="proj-repo" type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/org/repo" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !name}>
              {isPending ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
