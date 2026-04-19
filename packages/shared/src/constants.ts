export const PROVIDERS = [
  "openai",
  "anthropic",
  "stripe",
  "twilio",
  "sendgrid",
  "mapbox",
  "resend",
  "github",
  "vercel",
  "supabase",
  "custom",
] as const;

export type Provider = (typeof PROVIDERS)[number];

export const ROLES = ["owner", "admin", "developer", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const PROJECT_STATUSES = ["live", "staging", "dev"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const ALERT_SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const LOG_LEVELS = ["error", "warn", "info", "debug"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];
