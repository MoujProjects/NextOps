import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────────────────────
export const planEnum = pgEnum("plan", ["free", "pro", "enterprise"]);
export const roleEnum = pgEnum("role", ["owner", "admin", "developer", "viewer"]);
export const projectStatusEnum = pgEnum("project_status", ["live", "staging", "dev"]);
export const providerEnum = pgEnum("provider", [
  "openai", "anthropic", "stripe", "twilio", "sendgrid",
  "mapbox", "resend", "github", "vercel", "supabase", "custom",
]);
export const alertSeverityEnum = pgEnum("alert_severity", ["critical", "high", "medium", "low"]);
export const logLevelEnum = pgEnum("log_level", ["error", "warn", "info", "debug"]);
export const uptimeStatusEnum = pgEnum("uptime_status", ["up", "down", "degraded"]);

// ── Organizations ──────────────────────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: planEnum("plan").notNull().default("free"),
  billingEmail: text("billing_email"),
  stripeCustomerId: text("stripe_customer_id"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Members ────────────────────────────────────────────────────────────────
export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  role: roleEnum("role").notNull().default("developer"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("members_org_idx").on(t.orgId),
  userIdx: index("members_user_idx").on(t.userId),
}));

// ── Invitations ────────────────────────────────────────────────────────────
export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default("developer"),
  token: text("token").notNull().unique(),
  invitedBy: uuid("invited_by").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Projects ───────────────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  status: projectStatusEnum("status").notNull().default("dev"),
  description: text("description"),
  repoUrl: text("repo_url"),
  vercelProjectId: text("vercel_project_id"),
  supabaseProjectRef: text("supabase_project_ref"),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("projects_org_idx").on(t.orgId),
}));

// ── API Keys ───────────────────────────────────────────────────────────────
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  provider: providerEnum("provider").notNull(),
  label: text("label").notNull(),
  keyCiphertext: text("key_ciphertext").notNull(),
  keyIv: text("key_iv").notNull(),
  lastUsed: timestamp("last_used"),
  monthlyBudgetCents: integer("monthly_budget_cents"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("api_keys_org_idx").on(t.orgId),
}));

// ── API Calls ──────────────────────────────────────────────────────────────
export const apiCalls = pgTable("api_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  keyId: uuid("key_id").references(() => apiKeys.id, { onDelete: "set null" }),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull().default("POST"),
  statusCode: integer("status_code").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  tokensUsed: integer("tokens_used"),
  costCents: integer("cost_cents"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  keyIdx: index("api_calls_key_idx").on(t.keyId),
  orgIdx: index("api_calls_org_idx").on(t.orgId),
  createdIdx: index("api_calls_created_idx").on(t.createdAt),
}));

// ── Websites ───────────────────────────────────────────────────────────────
export const websites = pgTable("websites", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  checkIntervalSeconds: integer("check_interval_seconds").notNull().default(300),
  lastStatus: uptimeStatusEnum("last_status"),
  lastResponseMs: integer("last_response_ms"),
  sslExpiresAt: timestamp("ssl_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("websites_org_idx").on(t.orgId),
}));

// ── Uptime Checks ──────────────────────────────────────────────────────────
export const uptimeChecks = pgTable("uptime_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  websiteId: uuid("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  status: uptimeStatusEnum("status").notNull(),
  responseMs: integer("response_ms"),
  statusCode: integer("status_code"),
  error: text("error"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
}, (t) => ({
  websiteIdx: index("uptime_checks_website_idx").on(t.websiteId),
  atIdx: index("uptime_checks_at_idx").on(t.checkedAt),
}));

// ── Alerts ─────────────────────────────────────────────────────────────────
export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  severity: alertSeverityEnum("severity").notNull().default("medium"),
  title: text("title").notNull(),
  description: text("description"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("alerts_org_idx").on(t.orgId),
}));

// ── Alert Rules ────────────────────────────────────────────────────────────
export const alertRules = pgTable("alert_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  metric: text("metric").notNull(),
  operator: text("operator").notNull(),
  threshold: integer("threshold").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(300),
  severity: alertSeverityEnum("severity").notNull().default("medium"),
  channels: jsonb("channels").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Logs ───────────────────────────────────────────────────────────────────
export const logs = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  level: logLevelEnum("level").notNull().default("info"),
  message: text("message").notNull(),
  source: text("source"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("logs_org_idx").on(t.orgId),
  levelIdx: index("logs_level_idx").on(t.level),
  createdIdx: index("logs_created_idx").on(t.createdAt),
}));

// ── Activity ───────────────────────────────────────────────────────────────
export const activity = pgTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  action: text("action").notNull(),
  resource: text("resource"),
  resourceId: text("resource_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("activity_org_idx").on(t.orgId),
}));

// ── Integrations ───────────────────────────────────────────────────────────
export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  provider: providerEnum("provider").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("integrations_org_idx").on(t.orgId),
}));

// ── Billing Events ─────────────────────────────────────────────────────────
export const billingEvents = pgTable("billing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amountCents: integer("amount_cents"),
  currency: text("currency").default("usd"),
  stripeEventId: text("stripe_event_id").unique(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  orgIdx: index("billing_events_org_idx").on(t.orgId),
}));

// ── Relations ──────────────────────────────────────────────────────────────
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  projects: many(projects),
  apiKeys: many(apiKeys),
  websites: many(websites),
  alerts: many(alerts),
  logs: many(logs),
  integrations: many(integrations),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  org: one(organizations, { fields: [projects.orgId], references: [organizations.id] }),
  apiKeys: many(apiKeys),
  websites: many(websites),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  org: one(organizations, { fields: [apiKeys.orgId], references: [organizations.id] }),
  project: one(projects, { fields: [apiKeys.projectId], references: [projects.id] }),
  calls: many(apiCalls),
}));

export const websitesRelations = relations(websites, ({ one, many }) => ({
  org: one(organizations, { fields: [websites.orgId], references: [organizations.id] }),
  project: one(projects, { fields: [websites.projectId], references: [projects.id] }),
  checks: many(uptimeChecks),
}));
