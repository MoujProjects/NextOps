import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { members, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Server component — ignore
          }
        },
      },
    }
  );
}

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function requireUser(): Promise<NonNullable<Awaited<ReturnType<typeof getUser>>>> {
  const user = await getUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user!;
}

/**
 * Get the user's active organization.  
 * If none exists, auto-create one from signup metadata.
 */
export async function getUserOrg(userId: string) {
  const [membership] = await db
    .select({ orgId: members.orgId, role: members.role })
    .from(members)
    .where(eq(members.userId, userId))
    .limit(1);

  if (membership) {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, membership.orgId))
      .limit(1);
    return org ?? null;
  }
  return null;
}

/**
 * Ensure the user has an org. If not, create one.
 */
export async function ensureUserOrg(userId: string, fallbackName?: string) {
  const existing = await getUserOrg(userId);
  if (existing) return existing;

  const orgName = fallbackName || "My Organization";
  const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-org";

  const [org] = await db.insert(organizations).values({
    name: orgName,
    slug: `${slug}-${Date.now().toString(36)}`,
    createdBy: userId,
  }).returning();

  await db.insert(members).values({
    orgId: org.id,
    userId,
    role: "owner",
  });

  return org;
}

/**
 * Require user + org. Creates org if needed. Used by dashboard pages.
 */
export async function requireUserWithOrg() {
  const user = await requireUser();
  const org = await ensureUserOrg(user.id, user.user_metadata?.org_name);
  return { user, org };
}
