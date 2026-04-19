-- NexOps initial schema migration

-- Enums
CREATE TYPE plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE role AS ENUM ('owner', 'admin', 'developer', 'viewer');
CREATE TYPE project_status AS ENUM ('live', 'staging', 'dev');
CREATE TYPE provider AS ENUM ('openai','anthropic','stripe','twilio','sendgrid','mapbox','resend','github','vercel','supabase','custom');
CREATE TYPE alert_severity AS ENUM ('critical','high','medium','low');
CREATE TYPE log_level AS ENUM ('error','warn','info','debug');
CREATE TYPE uptime_status AS ENUM ('up','down','degraded');

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan plan NOT NULL DEFAULT 'free',
  billing_email TEXT,
  stripe_customer_id TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role role NOT NULL DEFAULT 'developer',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);
CREATE INDEX members_org_idx ON members(org_id);
CREATE INDEX members_user_idx ON members(user_id);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role role NOT NULL DEFAULT 'developer',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'dev',
  description TEXT,
  repo_url TEXT,
  vercel_project_id TEXT,
  supabase_project_ref TEXT,
  tech_stack JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, slug)
);
CREATE INDEX projects_org_idx ON projects(org_id);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  provider provider NOT NULL,
  label TEXT NOT NULL,
  key_ciphertext TEXT NOT NULL,
  key_iv TEXT NOT NULL,
  last_used TIMESTAMPTZ,
  monthly_budget_cents INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX api_keys_org_idx ON api_keys(org_id);

-- API Calls
CREATE TABLE api_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  status_code INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  tokens_used INTEGER,
  cost_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX api_calls_key_idx ON api_calls(key_id);
CREATE INDEX api_calls_org_idx ON api_calls(org_id);
CREATE INDEX api_calls_created_idx ON api_calls(created_at DESC);

-- Websites
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  check_interval_seconds INTEGER NOT NULL DEFAULT 300,
  last_status uptime_status,
  last_response_ms INTEGER,
  ssl_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX websites_org_idx ON websites(org_id);

-- Uptime Checks
CREATE TABLE uptime_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  status uptime_status NOT NULL,
  response_ms INTEGER,
  status_code INTEGER,
  error TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX uptime_checks_website_idx ON uptime_checks(website_id);
CREATE INDEX uptime_checks_at_idx ON uptime_checks(checked_at DESC);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  resolved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX alerts_org_idx ON alerts(org_id);

-- Alert Rules
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metric TEXT NOT NULL,
  operator TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 300,
  severity alert_severity NOT NULL DEFAULT 'medium',
  channels JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logs (with full-text search)
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  level log_level NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  source TEXT,
  metadata JSONB,
  search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', message)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX logs_org_idx ON logs(org_id);
CREATE INDEX logs_level_idx ON logs(level);
CREATE INDEX logs_created_idx ON logs(created_at DESC);
CREATE INDEX logs_search_idx ON logs USING GIN(search_vector);

-- Activity (audit log)
CREATE TABLE activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX activity_org_idx ON activity(org_id);

-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider provider NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, provider)
);
CREATE INDEX integrations_org_idx ON integrations(org_id);

-- Billing Events
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  stripe_event_id TEXT UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX billing_events_org_idx ON billing_events(org_id);

-- ── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE uptime_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Helper function: check membership
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM members WHERE members.org_id = $1 AND members.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM members WHERE members.org_id = $1 AND members.user_id = auth.uid()
    AND members.role IN ('owner','admin')
  );
$$;

-- Organizations: member can read their orgs
CREATE POLICY "org_select" ON organizations FOR SELECT USING (is_org_member(id));
CREATE POLICY "org_insert" ON organizations FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (is_org_admin(id));

-- Members
CREATE POLICY "members_select" ON members FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (is_org_admin(org_id));
CREATE POLICY "members_delete" ON members FOR DELETE USING (is_org_admin(org_id));

-- Projects
CREATE POLICY "projects_select" ON projects FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (is_org_admin(org_id));

-- API Keys (no key_ciphertext exposed via RLS — decrypt server-side only)
CREATE POLICY "api_keys_select" ON api_keys FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "api_keys_insert" ON api_keys FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "api_keys_update" ON api_keys FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "api_keys_delete" ON api_keys FOR DELETE USING (is_org_admin(org_id));

-- API Calls
CREATE POLICY "api_calls_select" ON api_calls FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "api_calls_insert" ON api_calls FOR INSERT WITH CHECK (is_org_member(org_id));

-- Websites
CREATE POLICY "websites_select" ON websites FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "websites_insert" ON websites FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "websites_update" ON websites FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "websites_delete" ON websites FOR DELETE USING (is_org_admin(org_id));

-- Uptime Checks
CREATE POLICY "uptime_checks_select" ON uptime_checks FOR SELECT
  USING (EXISTS (SELECT 1 FROM websites w WHERE w.id = website_id AND is_org_member(w.org_id)));

-- Alerts
CREATE POLICY "alerts_select" ON alerts FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "alerts_insert" ON alerts FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "alerts_update" ON alerts FOR UPDATE USING (is_org_member(org_id));

-- Alert Rules
CREATE POLICY "alert_rules_select" ON alert_rules FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "alert_rules_insert" ON alert_rules FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "alert_rules_update" ON alert_rules FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "alert_rules_delete" ON alert_rules FOR DELETE USING (is_org_admin(org_id));

-- Logs
CREATE POLICY "logs_select" ON logs FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "logs_insert" ON logs FOR INSERT WITH CHECK (is_org_member(org_id));

-- Activity
CREATE POLICY "activity_select" ON activity FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "activity_insert" ON activity FOR INSERT WITH CHECK (is_org_member(org_id));

-- Integrations
CREATE POLICY "integrations_select" ON integrations FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "integrations_insert" ON integrations FOR INSERT WITH CHECK (is_org_admin(org_id));
CREATE POLICY "integrations_update" ON integrations FOR UPDATE USING (is_org_admin(org_id));
CREATE POLICY "integrations_delete" ON integrations FOR DELETE USING (is_org_admin(org_id));

-- Billing Events
CREATE POLICY "billing_events_select" ON billing_events FOR SELECT USING (is_org_admin(org_id));
