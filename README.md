# NexOps — SaaS Control Center

> Mission control for indie & small-team SaaS builders. One glassmorphic hub for all your APIs, projects, uptime, logs, billing, and team.

## Architecture

```
nexops/
├── apps/
│   └── web/                  # Next.js 15 app (App Router, RSC, Server Actions)
│       ├── app/
│       │   ├── (auth)/       # login, signup, callback
│       │   ├── (dashboard)/  # all 11 feature modules
│       │   ├── (admin)/      # super-admin panel
│       │   └── api/          # proxy, ingest, cron, webhooks
│       ├── components/
│       │   ├── ui/           # shadcn-style glassmorphic components
│       │   ├── glass/        # ambient orbs, stat cards, status dots
│       │   └── dashboard/    # sidebar, topbar, mobile nav
│       └── lib/
│           ├── db/           # Drizzle schema + queries
│           ├── supabase/     # server + client + middleware
│           ├── crypto/       # AES-256-GCM vault
│           └── actions/      # server actions for CRUD
├── packages/
│   ├── sdk/                  # @nexops/sdk — npm package for tracking
│   └── shared/               # Zod schemas, types, constants
└── supabase/
    ├── migrations/           # Full schema with RLS policies
    └── seed.sql              # Demo data
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC, Server Actions) |
| Language | TypeScript (strict) |
| UI | Tailwind v4 + Radix primitives + Framer Motion |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (email + Google + GitHub OAuth) |
| Charts | Recharts + custom SVG |
| State | Zustand + TanStack Query |
| Validation | Zod everywhere |
| Encryption | @noble/ciphers AES-256-GCM |
| Email | Resend |
| Deployment | Vercel (with Cron jobs) |

## Features

1. **Overview Dashboard** — Live API call sparklines, cost tracking, team presence, alerts
2. **Projects** — CRUD with environments, Vercel/GitHub/Supabase linking
3. **API Monitor** — Per-provider call tracking, p50/p95/p99 latency, cost breakdown
4. **API Key Vault** — AES-256-GCM encrypted storage, proxy mode + SDK mode
5. **Website Monitor** — Uptime checks every 1/5/15min, SSL expiry, 90-day history
6. **Logs Explorer** — Full-text search, level filtering, live tail
7. **Alerts** — Rule engine with multi-channel notifications
8. **Billing** — MRR, API cost aggregation, invoices
9. **Team** — Role-based access (Owner/Admin/Developer/Viewer), presence indicators
10. **Integrations** — OAuth for Vercel, GitHub, Stripe, Slack, Discord, and more
11. **Admin Panel** — Super-admin user/org management, impersonation

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill env vars
cp .env.example apps/web/.env.local

# 3. Run database migrations
pnpm supabase:migrate

# 4. Seed demo data
psql $DATABASE_URL < supabase/seed.sql

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## SDK Usage

```ts
import { createNexops } from "@nexops/sdk";

const nexops = createNexops({
  apiKey: process.env.NEXOPS_API_KEY!,
  projectId: "your-project-id",
});

// Track an API call
const result = await nexops.track(
  () => openai.chat.completions.create({ model: "gpt-4o", messages }),
  { provider: "openai" }
);

// Send a log
await nexops.log("error", "Payment failed", { userId, amount });
```

## Proxy Mode

```ts
// Instead of: https://api.openai.com/v1/chat/completions
// Use:         https://app.nexops.dev/proxy/openai/v1/chat/completions
// With header: x-nexops-key-id: your-key-id

const response = await fetch("https://app.nexops.dev/proxy/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "x-nexops-key-id": process.env.NEXOPS_KEY_ID!,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ model: "gpt-4o", messages }),
});
```

## Environment Variables

See [.env.example](.env.example) for all required variables.
