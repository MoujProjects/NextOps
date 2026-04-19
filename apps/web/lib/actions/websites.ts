"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { websites, members, activity } from "@/lib/db/schema";
import { addWebsiteSchema } from "@nexops/shared";
import { and, eq } from "drizzle-orm";
import { logger } from "@/lib/utils/logger";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

async function getActiveOrgId(userId: string): Promise<string | null> {
  const [m] = await db.select({ orgId: members.orgId }).from(members).where(eq(members.userId, userId)).limit(1);
  return m?.orgId ?? null;
}

export async function addWebsite(raw: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return { success: false, error: "No organization found" };

    const parsed = addWebsiteSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const { url, checkIntervalSeconds } = parsed.data;

    const [record] = await db.insert(websites).values({
      orgId,
      url,
      checkIntervalSeconds: checkIntervalSeconds ?? 300,
    }).returning({ id: websites.id });

    await db.insert(activity).values({
      orgId, userId: user.id, action: "website.added",
      resource: "website", resourceId: record.id,
      metadata: { url },
    });

    revalidatePath("/websites");
    return { success: true, data: { id: record.id } };
  } catch (err) {
    logger.error("addWebsite failed", err);
    return { success: false, error: "Failed to add website" };
  }
}

export async function removeWebsite(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return { success: false, error: "No organization found" };

    await db.delete(websites).where(and(eq(websites.id, id), eq(websites.orgId, orgId)));

    await db.insert(activity).values({
      orgId, userId: user.id, action: "website.removed",
      resource: "website", resourceId: id,
    });

    revalidatePath("/websites");
    return { success: true };
  } catch (err) {
    logger.error("removeWebsite failed", err);
    return { success: false, error: "Failed to remove website" };
  }
}
