import { requireUserWithOrg } from "@/lib/supabase/server";
import { getOrgMembers, getOrgInvitations } from "@/lib/db/queries";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Crown, Shield, Code, Eye, MoreHorizontal, Users } from "lucide-react";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="w-3 h-3 text-[var(--accent-warn)]" />,
  admin: <Shield className="w-3 h-3 text-[var(--accent-blue)]" />,
  developer: <Code className="w-3 h-3 text-[var(--accent-violet)]" />,
  viewer: <Eye className="w-3 h-3 text-[var(--text-muted)]" />,
};

const PERMISSIONS: Record<string, string[]> = {
  owner: ["Full access", "Billing", "Delete org", "Manage team"],
  admin: ["All projects", "API keys", "Integrations", "Invite members"],
  developer: ["View/edit projects", "View API keys", "Add websites"],
  viewer: ["View only", "No write access"],
};

export default async function TeamPage() {
  const { user, org } = await requireUserWithOrg();
  const [membersData, invitationsData] = await Promise.all([
    getOrgMembers(org.id),
    getOrgInvitations(org.id),
  ]);

  const pendingInvites = invitationsData.filter((i) => !i.acceptedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Team</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{membersData.length} members{pendingInvites.length > 0 ? ` · ${pendingInvites.length} pending` : ""}</p>
        </div>
        <Button><UserPlus className="w-4 h-4" />Invite member</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GlassPanel className="overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Members</h3>
            </div>
            {membersData.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {membersData.map((member) => {
                  const isCurrentUser = member.userId === user.id;
                  return (
                    <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-blue)]/30 to-[var(--accent-violet)]/30 border border-[var(--border)] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)]">
                          {isCurrentUser ? (user.email?.[0]?.toUpperCase() ?? "U") : member.userId.slice(0, 1).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{isCurrentUser ? "You" : `Member`}</p>
                        <p className="text-xs text-[var(--text-muted)]">{isCurrentUser ? user.email : member.userId.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {ROLE_ICONS[member.role]}
                        <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                      </div>
                      {member.role !== "owner" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-muted)]">No team members yet.</p>
              </div>
            )}
          </GlassPanel>
        </div>

        <GlassPanel className="p-5">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] mb-4">Permission Matrix</h3>
          <div className="space-y-4">
            {Object.entries(PERMISSIONS).map(([role, perms]) => (
              <div key={role}>
                <div className="flex items-center gap-1.5 mb-2">
                  {ROLE_ICONS[role]}
                  <span className="text-xs font-medium text-[var(--text-secondary)] capitalize">{role}</span>
                </div>
                <div className="space-y-1">
                  {perms.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
