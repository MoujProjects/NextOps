import { z } from "zod";
import { PROVIDERS, ROLES, PROJECT_STATUSES, ALERT_SEVERITIES, LOG_LEVELS } from "./constants";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  status: z.enum(PROJECT_STATUSES).default("dev"),
  description: z.string().max(500).optional(),
  repoUrl: z.string().url().optional().or(z.literal("")),
  vercelProjectId: z.string().optional(),
  supabaseProjectRef: z.string().optional(),
  techStack: z.array(z.string()).default([]),
});

export const createApiKeySchema = z.object({
  provider: z.enum(PROVIDERS),
  label: z.string().min(1).max(100),
  key: z.string().min(1),
  projectId: z.string().uuid().optional(),
  monthlyBudgetCents: z.number().int().positive().optional(),
});

export const addWebsiteSchema = z.object({
  url: z.string().url(),
  projectId: z.string().uuid().optional(),
  checkIntervalSeconds: z.number().int().min(60).default(300),
});

export const createAlertRuleSchema = z.object({
  name: z.string().min(1),
  metric: z.string(),
  operator: z.enum(["gt", "lt", "gte", "lte", "eq"]),
  threshold: z.number(),
  durationSeconds: z.number().int().positive(),
  severity: z.enum(ALERT_SEVERITIES),
  channels: z.array(z.enum(["email", "slack", "discord", "inapp"])),
  projectId: z.string().uuid().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(ROLES),
});

export const trackEventSchema = z.object({
  provider: z.enum(PROVIDERS),
  endpoint: z.string(),
  method: z.string(),
  statusCode: z.number().int(),
  latencyMs: z.number().int(),
  tokensUsed: z.number().int().optional(),
  costCents: z.number().int().optional(),
  projectId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ingestLogSchema = z.object({
  level: z.enum(LOG_LEVELS),
  message: z.string(),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  projectId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
});
