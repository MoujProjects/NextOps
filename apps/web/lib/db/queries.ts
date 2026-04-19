import { db } from "./client";
import {
  organizations, members, projects, apiKeys, apiCalls,
  websites, uptimeChecks, alerts, logs, activity, integrations, billingEvents, invitations,
} from "./schema";
import { eq, and, desc, gte, count, sum, avg } from "drizzle-orm";

// ── Org ────────────────────────────────────────────────────────────────────
export async function getOrgBySlug(slug: string) {
  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  return org ?? null;
}

export async function getOrgById(id: string) {
  const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return org ?? null;
}

export async function getUserOrgs(userId: string) {
  return db
    .select({ org: organizations, role: members.role })
    .from(members)
    .innerJoin(organizations, eq(members.orgId, organizations.id))
    .where(eq(members.userId, userId));
}

// ── Projects ───────────────────────────────────────────────────────────────
export async function getOrgProjects(orgId: string) {
  return db.select().from(projects).where(eq(projects.orgId, orgId)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: string, orgId: string) {
  const [p] = await db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.orgId, orgId))).limit(1);
  return p ?? null;
}

// ── API Keys ───────────────────────────────────────────────────────────────
export async function getOrgApiKeys(orgId: string) {
  return db.select().from(apiKeys)
    .where(and(eq(apiKeys.orgId, orgId), eq(apiKeys.isActive, true)))
    .orderBy(desc(apiKeys.createdAt));
}

export async function getApiKeyById(id: string, orgId: string) {
  const [k] = await db.select().from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.orgId, orgId))).limit(1);
  return k ?? null;
}

// ── API Calls Stats ────────────────────────────────────────────────────────
export async function getApiCallsStats(orgId: string, since: Date) {
  const [stats] = await db
    .select({
      total: count(),
      totalCost: sum(apiCalls.costCents),
      avgLatency: avg(apiCalls.latencyMs),
    })
    .from(apiCalls)
    .where(and(eq(apiCalls.orgId, orgId), gte(apiCalls.createdAt, since)));
  return stats;
}

export async function getRecentApiCalls(orgId: string, limit = 50) {
  return db.select().from(apiCalls)
    .where(eq(apiCalls.orgId, orgId))
    .orderBy(desc(apiCalls.createdAt))
    .limit(limit);
}

// ── Websites ───────────────────────────────────────────────────────────────
export async function getOrgWebsites(orgId: string) {
  return db.select().from(websites).where(eq(websites.orgId, orgId)).orderBy(desc(websites.createdAt));
}

export async function getWebsiteUptimeHistory(websiteId: string, limit = 100) {
  return db.select().from(uptimeChecks)
    .where(eq(uptimeChecks.websiteId, websiteId))
    .orderBy(desc(uptimeChecks.checkedAt))
    .limit(limit);
}

// ── Alerts ─────────────────────────────────────────────────────────────────
export async function getOrgAlerts(orgId: string, resolved = false) {
  return db.select().from(alerts)
    .where(and(eq(alerts.orgId, orgId)))
    .orderBy(desc(alerts.createdAt))
    .limit(50);
}

// ── Logs ───────────────────────────────────────────────────────────────────
export async function getOrgLogs(orgId: string, limit = 100) {
  return db.select().from(logs)
    .where(eq(logs.orgId, orgId))
    .orderBy(desc(logs.createdAt))
    .limit(limit);
}

// ── Activity ───────────────────────────────────────────────────────────────
export async function getOrgActivity(orgId: string, limit = 50) {
  return db.select().from(activity)
    .where(eq(activity.orgId, orgId))
    .orderBy(desc(activity.createdAt))
    .limit(limit);
}

// ── Integrations ───────────────────────────────────────────────────────────
export async function getOrgIntegrations(orgId: string) {
  return db.select().from(integrations)
    .where(and(eq(integrations.orgId, orgId), eq(integrations.isActive, true)));
}

// ── Billing ────────────────────────────────────────────────────────────────
export async function getOrgBillingEvents(orgId: string, limit = 50) {
  return db.select().from(billingEvents)
    .where(eq(billingEvents.orgId, orgId))
    .orderBy(desc(billingEvents.createdAt))
    .limit(limit);
}

// ── Members ────────────────────────────────────────────────────────────────
export async function getOrgMembers(orgId: string) {
  return db.select().from(members).where(eq(members.orgId, orgId));
}

export async function getOrgInvitations(orgId: string) {
  return db.select().from(invitations).where(eq(invitations.orgId, orgId));
}
