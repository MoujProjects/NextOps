"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { projects, members, organizations, activity } from "@/lib/db/schema";
import { createProjectSchema } from "@nexops/shared";
import { and, eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

async function getActiveOrgId(userId: string): Promise<string | null> {
  const [membership] = await db
    .select({ orgId: members.orgId })
    .from(members)
    .where(eq(members.userId, userId))
    .limit(1);
  return membership?.orgId ?? null;
}

export async function createProject(raw: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return { success: false, error: "No organization found" };

    const parsed = createProjectSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const data = parsed.data;
    const slug = data.slug || slugify(data.name);

    const [project] = await db.insert(projects).values({
      orgId,
      name: data.name,
      slug,
      status: data.status,
      description: data.description,
      repoUrl: data.repoUrl || null,
      vercelProjectId: data.vercelProjectId,
      supabaseProjectRef: data.supabaseProjectRef,
      techStack: data.techStack,
    }).returning({ id: projects.id });

    await db.insert(activity).values({
      orgId,
      userId: user.id,
      action: "project.created",
      resource: "project",
      resourceId: project.id,
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${project.id}`);
    return { success: true, data: { id: project.id } };
  } catch (err) {
    logger.error("createProject failed", err);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProject(id: string, raw: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return { success: false, error: "No organization found" };

    const parsed = createProjectSchema.partial().safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    await db.update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.orgId, orgId)));

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    return { success: true };
  } catch (err) {
    logger.error("updateProject failed", err);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return { success: false, error: "No organization found" };

    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.orgId, orgId)));

    await db.insert(activity).values({
      orgId,
      userId: user.id,
      action: "project.deleted",
      resource: "project",
      resourceId: id,
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (err) {
    logger.error("deleteProject failed", err);
    return { success: false, error: "Failed to delete project" };
  }
}
