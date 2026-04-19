import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your profile, organization, and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="org">Organization</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <GlassPanel className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly className="opacity-60" />
              <p className="text-xs text-[var(--text-muted)]">Email cannot be changed after signup</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" placeholder="Your name" defaultValue={user?.user_metadata?.name ?? ""} />
            </div>
            <Button>Save changes</Button>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="org">
          <GlassPanel className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organization name</Label>
              <Input id="org-name" placeholder="Acme Inc." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-slug">Slug</Label>
              <Input id="org-slug" placeholder="acme" />
              <p className="text-xs text-[var(--text-muted)]">Used in public status page URLs</p>
            </div>
            <Button>Save organization</Button>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="security">
          <GlassPanel className="p-6 space-y-6">
            <div>
              <h3 className="font-medium text-sm text-[var(--text-primary)] mb-3">Change password</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Current password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label>New password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button variant="outline">Update password</Button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium text-sm text-[var(--text-primary)] mb-1">Two-factor authentication</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3">Add an extra layer of security with TOTP</p>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="danger">
          <GlassPanel className="p-6 border-[var(--accent-danger)]/20 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--accent-danger)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm text-[var(--text-primary)]">Danger Zone</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">These actions are irreversible. Please be certain.</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-primary)]">Delete organization</p>
                <p className="text-xs text-[var(--text-secondary)]">Permanently delete the org and all its data</p>
              </div>
              <Button variant="destructive" size="sm">Delete org</Button>
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
