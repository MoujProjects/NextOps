import { requireUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { AmbientOrbs } from "@/components/glass/ambient-orbs";
import { Toaster } from "@/components/ui/toaster";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <AmbientOrbs />
      <Sidebar />
      <div className="md:pl-60 flex flex-col min-h-screen relative z-10">
        <Topbar userEmail={user?.email} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
      <Toaster />
    </div>
  );
}
