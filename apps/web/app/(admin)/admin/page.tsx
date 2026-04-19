import { requireUser } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/glass/glass-panel";
import { StatCard } from "@/components/glass/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building, Activity, Shield } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await requireUser();

  // Gate: only super-admins
  const isSuperAdmin = user?.user_metadata?.is_super_admin === true;
  if (!isSuperAdmin) redirect("/dashboard");

  const DEMO_ORGS = [
    { id: "1", name: "Acme Corp", plan: "pro", members: 5, projects: 3 },
    { id: "2", name: "Startup XYZ", plan: "free", members: 2, projects: 1 },
    { id: "3", name: "BigCo", plan: "enterprise", members: 12, projects: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-[var(--accent-violet)]" />
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Super Admin</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Platform-wide management</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orgs" value="42" icon={<Building className="w-5 h-5" />} accent="blue" />
        <StatCard title="Total Users" value="187" icon={<Users className="w-5 h-5" />} accent="violet" />
        <StatCard title="API Calls Today" value="1.2M" icon={<Activity className="w-5 h-5" />} accent="mint" />
        <StatCard title="Revenue MRR" value="$12,400" icon={<Activity className="w-5 h-5" />} accent="blue" />
      </div>

      <GlassPanel className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)]">Organizations</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {DEMO_ORGS.map((org) => (
            <div key={org.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{org.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{org.members} members Â· {org.projects} projects</p>
              </div>
              <Badge variant={org.plan === "enterprise" ? "violet" : org.plan === "pro" ? "default" : "secondary"}>
                {org.plan}
              </Badge>
              <Button size="sm" variant="outline" className="text-xs h-7">Impersonate</Button>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
