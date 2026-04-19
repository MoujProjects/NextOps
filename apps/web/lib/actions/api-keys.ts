"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { apiKeys, members, activity } from "@/lib/db/schema";
import { createApiKeySchema } from "@nexops/shared";
import { and, eq } from "drizzle-orm";
import { encryptApiKey } from "@/lib/crypto/vault";
import { logger } from "@/lib/utils/logger";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

async function getActiveOrgId(userId: string): Promise<string | null> {
  const [m] = await db.select({ orgId: members.orgId }).from(members).where(eq(members.userId, userId)).limit(1);
  return m?.orgId ?? null;
}

export async function addApiKey(raw: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return { success: false, error: "No organization found" };

    const parsed = createApiKeySchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const { provider, label, key, projectId, monthlyBudgetCents } = parsed.data;
    const { ciphertext, iv } = await encryptApiKey(key, orgId);

    const [record] = await db.insert(apiKeys).values({
      orgId,
      provider,
      label,
      keyCiphertext: ciphertext,
      keyIv: iv,
      projectId: projectId ?? null,
      monthlyBudgetCents: monthlyBudgetCents ?? null,
    }).returning({ id: apiKeys.id });

    await db.insert(activity).values({
      orgId, userId: user.id, action: "api_key.added",
      resource: "api_key", resourceId: record.id,
      metadata: { provider, label },
    });

    revalidatePath("/api-keys");
    return { success: true, data: { id: record.id } };
  } catch (err) {
    logger.error("addApiKey failed", err);
    return { success: false, error: "Failed to add API key" };
  }
}

export async function rotateApiKey(id: string, newKey: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return { success: false, error: "No organization found" };

    const { ciphertext, iv } = await encryptApiKey(newKey, orgId);
    await db.update(apiKeys)
      .set({ keyCiphertext: ciphertext, keyIv: iv })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.orgId, orgId)));

    await db.insert(activity).values({
      orgId, userId: user.id, action: "api_key.rotated",
      resource: "api_key", resourceId: id,
    });

    revalidatePath("/api-keys");
    return { success: true };
  } catch (err) {
    logger.error("rotateApiKey failed", err);
    return { success: false, error: "Failed to rotate key" };
  }
}

export async function deleteApiKey(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return { success: false, error: "No organization found" };

    await db.update(apiKeys)
      .set({ isActive: false })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.orgId, orgId)));

    await db.insert(activity).values({
      orgId, userId: user.id, action: "api_key.deleted",
      resource: "api_key", resourceId: id,
    });

    revalidatePath("/api-keys");
    return { success: true };
  } catch (err) {
    logger.error("deleteApiKey failed", err);
    return { success: false, error: "Failed to delete key" };
  }
}
