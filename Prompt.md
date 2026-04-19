# NexOps — SaaS Ops Control Platform

Build a production-ready, deployable SaaS operations platform for a team of 2-5 developers to manage all their SaaS projects, APIs, websites, billing, and team from a single control center.

## 🎯 Vision

NexOps is the mission control for indie/small-team SaaS builders. Instead of jumping between Vercel dashboards, Supabase consoles, Stripe portals, OpenAI usage pages, and Linear boards — everything lives in one glassmorphic, real-time hub.

## 🧱 Tech Stack (non-negotiable)

- **Framework:** Next.js 15 (App Router, RSC, Server Actions, TypeScript strict)
- **UI:** Tailwind CSS v4 + shadcn/ui + Radix primitives + Framer Motion
- **Database:** Supabase (PostgreSQL + Row Level Security + Realtime + Storage)
- **Auth:** Supabase Auth (email + Google OAuth + GitHub OAuth)
- **ORM:** Drizzle ORM (type-safe, edge-compatible)
- **Deployment:** Vercel (optimized for edge runtime where possible)
- **Background jobs:** Vercel Cron + Inngest (for API polling & alerts)
- **Encryption:** `@noble/ciphers` AES-256-GCM for API key vault
- **Charts:** Recharts + custom SVG
- **State:** Zustand (client) + TanStack Query (server cache)
- **Validation:** Zod everywhere
- **Email:** Resend
- **Monorepo:** pnpm workspaces

## 📁 Folder Structure

```
nexops/
├── apps/
│   └── web/                      # Main Next.js app
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/
│       │   │   └── signup/
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx    # Sidebar + topbar shell
│       │   │   ├── page.tsx      # Overview dashboard
│       │   │   ├── projects/
│       │   │   ├── api-monitor/
│       │   │   ├── api-keys/     # Encrypted vault
│       │   │   ├── websites/     # Monitored sites
│       │   │   ├── logs/
│       │   │   ├── alerts/
│       │   │   ├── billing/
│       │   │   ├── team/
│       │   │   ├── integrations/
│       │   │   └── settings/
│       │   ├── api/
│       │   │   ├── proxy/[...path]/route.ts   # API proxy for tracking
│       │   │   ├── webhooks/
│       │   │   ├── cron/
│       │   │   └── ingest/route.ts            # SDK ingestion endpoint
│       │   └── (admin)/
│       │       └── admin/        # Super-admin only routes
│       ├── components/
│       │   ├── ui/               # shadcn components
│       │   ├── dashboard/
│       │   ├── charts/
│       │   └── glass/            # Reusable glassmorphism primitives
│       ├── lib/
│       │   ├── supabase/
│       │   ├── db/               # Drizzle schema + queries
│       │   ├── crypto/           # Key encryption
│       │   ├── providers/        # OpenAI, Anthropic, Stripe, etc. adapters
│       │   └── utils/
│       ├── hooks/
│       └── types/
├── packages/
│   ├── sdk/                      # @nexops/sdk — npm package for apps to send metrics
│   └── shared/                   # Shared types, schemas, constants
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.example
├── docker-compose.yml            # Local Postgres + Redis
├── README.md
└── DEPLOYMENT.md
```

## 🗄️ Database Schema (Drizzle + Supabase)

Design these tables with RLS policies:

1. **organizations** — workspace with plan, billing info, created_by
2. **members** — user ↔ org with role (`owner`, `admin`, `developer`, `viewer`)
3. **invitations** — pending invites with tokens
4. **projects** — name, slug, status (`live`/`staging`/`dev`), description, repo_url, vercel_project_id, supabase_project_ref, tech_stack JSONB
5. **api_keys** — encrypted `key_ciphertext`, `provider` (openai/anthropic/stripe/...), label, project_id, last_used, monthly_budget_cents, is_active
6. **api_calls** — key_id, endpoint, method, status_code, latency_ms, tokens_used, cost_cents, created_at (partitioned by day)
7. **websites** — url, project_id, uptime_check_interval_seconds, last_status, last_response_ms, ssl_expires_at
8. **uptime_checks** — website_id, status, response_ms, checked_at
9. **alerts** — type, severity, title, description, resolved_at, metadata JSONB
10. **alert_rules** — user-defined thresholds (e.g., "error rate > 5%")
11. **logs** — unified log stream from all sources with full-text search
12. **activity** — audit log for team actions
13. **integrations** — OAuth tokens for Vercel, Supabase, Stripe, GitHub, OpenAI
14. **billing_events** — MRR tracking, subscription changes

Every query MUST go through RLS. Never expose service-role key to client.

## 🔐 Security Requirements

- API keys stored with AES-256-GCM, encryption key in env var, never logged
- Per-user encryption at rest (derive key from org_id + master)
- 2FA support (TOTP)
- Audit log for every destructive action
- Rate limiting via Upstash Redis on all public endpoints
- CSP headers, HSTS, X-Frame-Options
- Input validation with Zod on every server action
- SQL injection impossible (Drizzle parameterizes)
- XSS: React by default + DOMPurify for user-generated markdown

## 🎨 Design System (Glassmorphism + Futuristic)

Match the dashboard mockup already designed:

- **Palette:** 
  - bg: `#070b14` (deep space)
  - surface: `rgba(255,255,255,0.04)` with `backdrop-filter: blur(20px)`
  - accents: `#4f8dff` (electric blue), `#9b5de5` (violet), `#00f5c4` (mint)
  - danger: `#ff4d6d`, warn: `#ffba08`
- **Fonts:** Syne (display) + Space Mono (data/numbers) + Inter (body)
- **Ambient orbs:** fixed blurred gradient circles for depth
- **Animations:** Framer Motion page transitions, staggered card reveals, live pulse on status dots
- **Sparklines:** real-time WebSocket-driven
- **Never use:** generic purple-to-pink gradients, default shadcn colors unchanged, Inter for display

## 🧩 Core Features (build all of these)

### 1. Overview Dashboard
Live stats (API calls, latency, errors, MRR) + API sparkline + active projects + team presence + recent alerts + billing snapshot. WebSocket for real-time updates via Supabase Realtime.

### 2. Projects Module
- CRUD with environments (dev/staging/prod)
- Link to Vercel project → pull deploy status, domain, last commit
- Link to Supabase project → show DB size, MAU, bandwidth
- Link to GitHub repo → show open issues, last PR
- Tech stack tags + kanban-style task board (simple)

### 3. API Monitor & Key Vault
- **Vault:** add/rotate/delete keys for any provider, encrypted
- **Two tracking modes:**
  - **Proxy mode:** `https://api.nexops.dev/proxy/openai/v1/chat/completions` → NexOps decrypts key, proxies call, logs everything
  - **SDK mode:** `@nexops/sdk` that apps install: `nexops.track(() => openai.chat.completions.create(...))`
- **Per-key dashboard:** requests/min, p50/p95/p99 latency, cost today/week/month, error breakdown by status code, top endpoints
- **Provider adapters:** OpenAI, Anthropic, Stripe, Twilio, SendGrid, Mapbox, Resend, GitHub — each knows how to parse usage/cost
- **Budget alerts:** "Alert me when OpenAI monthly cost > €100"

### 4. Websites Monitor
- Add URL → uptime check every 1/5/15 min via Vercel Cron
- SSL expiry tracking, Core Web Vitals (Lighthouse API)
- Status page generator (public, per-project)
- Incident timeline

### 5. Unified Logs Explorer
- Ingest from projects via SDK + direct HTTP endpoint
- Full-text search with Postgres `tsvector`
- Filter by project / level / time range
- Tail mode (live streaming via Supabase Realtime)

### 6. Alerts & Rules Engine
- Rule builder: "When `metric` `op` `threshold` for `duration` → notify `channels`"
- Channels: email, Slack webhook, Discord webhook, in-app
- Severity tiers with auto-escalation
- Mute windows & on-call rotation (simple version)

### 7. Billing Overview
- Stripe integration: pull MRR, churn, new subs, failed payments
- Cost aggregation across all API providers → true margin view
- Per-project P&L
- Invoice list & download

### 8. Team & Access Control
- Invite via email (Resend) with role selection
- Roles: Owner / Admin / Developer / Viewer with clear permission matrix
- Activity feed showing who did what
- Presence indicators (online/offline via Supabase Realtime)

### 9. Integrations Hub
- OAuth flows for: Vercel, Supabase, GitHub, Stripe, OpenAI, Anthropic, Slack, Discord
- Per-integration health check
- Token refresh automation

### 10. Admin Panel (Super-Admin)
- At `/admin`, gated by `is_super_admin` column
- User management, org management, global metrics, impersonation (audit-logged), feature flags

### 11. Settings
- Profile, org, billing plan, API tokens for NexOps itself, webhooks, danger zone

## 🚀 Deployment

- **Vercel** for the Next.js app (set env vars in `.env.example`)
- **Supabase** cloud project (provide `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, migrations in `supabase/migrations/`)
- **Upstash Redis** for rate limiting
- **Inngest** for background jobs (polling integrations, running uptime checks)
- **Resend** for emails

Ship with a `DEPLOYMENT.md` that walks through:
1. `pnpm install`
2. Copy `.env.example` → `.env.local`, fill in keys
3. `pnpm supabase:migrate` 
4. `pnpm dev` locally
5. Push to GitHub
6. Connect Vercel → auto-deploy
7. Run Supabase migrations in production
8. Configure Vercel Cron in `vercel.json`

## 📦 Deliverables

1. **Fully working codebase** in the current directory — `pnpm install && pnpm dev` must work out of the box after filling `.env.local`
2. **All 11 feature modules implemented** with real functionality (not mocks) wherever possible; use realistic seed data for demo
3. **Every page styled** matching the glassmorphism design system — no raw shadcn defaults
4. **`@nexops/sdk` package** buildable and publishable to npm, with README
5. **Seed script** that populates a demo workspace with 3 projects, 5 API keys, 2 websites, sample logs/alerts
6. **README.md** — architecture diagram (ASCII or Mermaid), setup, feature list
7. **DEPLOYMENT.md** — step-by-step Vercel + Supabase deploy
8. **One E2E test** with Playwright (login → create project → add API key → see it on dashboard)

## 🧠 Execution Strategy

Work in this order. After each phase, verify it builds before moving on:

1. Monorepo scaffold + Next.js + Tailwind + shadcn init + design tokens
2. Supabase setup + Drizzle schema + migrations + RLS policies
3. Auth flows (login/signup/OAuth) + protected layout
4. Dashboard shell (sidebar, topbar, glassmorphism primitives)
5. Projects CRUD
6. API key vault with encryption
7. API proxy route + SDK package
8. Overview dashboard with live stats
9. Websites monitor + uptime cron
10. Logs, Alerts, Billing, Team, Integrations, Admin
11. Seed data + E2E test + docs

Use `TODO.md` to track progress. Commit after each phase with conventional commits.

## ⚠️ Non-Negotiables

- TypeScript strict mode, zero `any`
- Every server action wrapped in try/catch with typed errors
- Loading + error + empty states on every data view
- Mobile responsive (sidebar collapses to bottom bar on <768px)
- Dark mode only (it's glassmorphism — light mode would kill the aesthetic)
- Accessibility: keyboard nav, aria labels, focus rings
- No `console.log` in production code — use a `logger` util

Start now. Build the whole thing. Ask me only if a **business decision** is needed — don't ask for permission on technical choices within this spec.