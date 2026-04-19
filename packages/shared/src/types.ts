import type { Provider, Role, ProjectStatus, AlertSeverity, LogLevel } from "./constants";

export type { Provider, Role, ProjectStatus, AlertSeverity, LogLevel };

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
}

export interface Member {
  id: string;
  orgId: string;
  userId: string;
  role: Role;
  joinedAt: Date;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  description?: string;
  repoUrl?: string;
  vercelProjectId?: string;
  supabaseProjectRef?: string;
  techStack: string[];
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  orgId: string;
  projectId?: string;
  provider: Provider;
  label: string;
  lastUsed?: Date;
  monthlyBudgetCents?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ApiCall {
  id: string;
  keyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  tokensUsed?: number;
  costCents?: number;
  createdAt: Date;
}

export interface Website {
  id: string;
  orgId: string;
  projectId?: string;
  url: string;
  checkIntervalSeconds: number;
  lastStatus?: "up" | "down" | "degraded";
  lastResponseMs?: number;
  sslExpiresAt?: Date;
}

export interface Alert {
  id: string;
  orgId: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  resolvedAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface LogEntry {
  id: string;
  orgId: string;
  projectId?: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  source?: string;
  createdAt: Date;
}

export interface NexopsTrackEvent {
  provider: Provider;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  tokensUsed?: number;
  costCents?: number;
  projectId?: string;
  metadata?: Record<string, unknown>;
}
