# NexOps Deployment Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account
- A [Resend](https://resend.com) account (for emails)

---

## Step 1 — Install dependencies

```bash
pnpm install
```

---

## Step 2 — Configure environment variables

```bash
cp .env.example apps/web/.env.local
```

Fill in all values in `apps/web/.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string |
| `NEXOPS_ENCRYPTION_KEY` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CRON_SECRET` | Any random secret string |
| `RESEND_API_KEY` | Resend → API Keys |

---

## Step 3 — Run Supabase migrations

```bash
# Option A: Using Supabase CLI
npx supabase db push

# Option B: Direct SQL
psql "$DATABASE_URL" < supabase/migrations/0001_initial_schema.sql
```

---

## Step 4 — (Optional) Seed demo data

```bash
psql "$DATABASE_URL" < supabase/seed.sql
```

---

## Step 5 — Run locally

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Step 6 — Deploy to Vercel

### 6a. Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial NexOps platform"
git remote add origin https://github.com/yourorg/nexops.git
git push -u origin main
```

### 6b. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set **Root Directory** to `apps/web`
4. Add all environment variables from `.env.example`
5. Click **Deploy**

---

## Step 7 — Run migrations in production

After the first Vercel deployment, run migrations against your production Supabase project:

```bash
DATABASE_URL=<prod-db-url> npx drizzle-kit push
```

Or via Supabase Studio → SQL Editor.

---

## Step 8 — Configure Vercel Cron

The `vercel.json` at the repo root configures the uptime check cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/uptime",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes automatically on Vercel. The cron is authenticated via the `CRON_SECRET` env var.

---

## Step 9 — Configure Supabase Auth

1. Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to your Vercel deployment URL
3. Add redirect URL: `https://your-app.vercel.app/auth/callback`
4. Enable Google OAuth: Authentication → Providers → Google
5. Enable GitHub OAuth: Authentication → Providers → GitHub

---

## Checklist

- [ ] `pnpm install` succeeds
- [ ] `.env.local` filled with real values
- [ ] Supabase migrations applied
- [ ] Auth providers configured
- [ ] App deployed to Vercel
- [ ] Vercel Cron active
- [ ] E2E test passing: `pnpm test:e2e`
