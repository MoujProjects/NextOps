-- NexOps Demo Seed Data
-- Run after migrations: psql $DATABASE_URL < supabase/seed.sql

-- Demo organization
INSERT INTO organizations (id, name, slug, plan, created_by)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Demo Corp',
  'demo-corp',
  'pro',
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (slug) DO NOTHING;

-- Demo projects
INSERT INTO projects (id, org_id, name, slug, status, description, tech_stack)
VALUES
  ('proj-0001-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'NexOps Landing', 'nexops-landing', 'live', 'Marketing and landing page', '["Next.js","Tailwind","Vercel"]'),
  ('proj-0002-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'NexOps API', 'nexops-api', 'staging', 'Core backend API service', '["Node.js","Drizzle","Supabase"]'),
  ('proj-0003-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mobile App', 'mobile-app', 'dev', 'React Native companion app', '["React Native","Expo"]')
ON CONFLICT DO NOTHING;

-- Demo websites
INSERT INTO websites (id, org_id, url, check_interval_seconds, last_status, last_response_ms)
VALUES
  ('web-00001-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://example.com', 300, 'up', 142),
  ('web-00002-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://api.example.com', 60, 'up', 89)
ON CONFLICT DO NOTHING;

-- Sample logs
INSERT INTO logs (org_id, level, message, source, metadata)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'info', 'Application started successfully', 'app', '{}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'error', 'Failed to connect to external API: timeout', 'api-client', '{"provider": "openai"}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'warn', 'Memory usage above 80% threshold', 'system', '{"usage": 82}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'info', 'Stripe webhook received: payment.succeeded', 'webhooks', '{"amount": 4900}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'debug', 'Cache miss for user profile', 'cache', '{"key": "user:123"}');

-- Sample alerts
INSERT INTO alerts (org_id, type, severity, title, description, metadata)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'api_error_rate', 'critical', 'High error rate detected', 'OpenAI API error rate exceeded 10% in the last 5 minutes', '{"provider": "openai", "rate": 0.12}'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ssl_expiry', 'medium', 'SSL certificate expiring soon', 'Certificate for api.example.com expires in 23 days', '{"url": "api.example.com", "days": 23}');
