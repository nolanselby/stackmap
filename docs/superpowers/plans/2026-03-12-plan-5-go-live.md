# AI Tool Roadmapper — Plan 5: Go-Live

**Date:** 2026-03-12
**Goal:** Connect real services, populate the tool database, deploy to production, and verify the full end-to-end flow works.

**Prerequisites:** Plans 1–4 complete (all code committed).

**Estimated time:** ~1.5–2 hours of active work (bulk seed + enrichment runs in background).

---

## Overview

There are 6 phases in order:

1. **Supabase** — create project, run migrations, configure RLS
2. **API Keys** — gather OpenAI, Product Hunt, GitHub tokens
3. **Inngest** — create app and get signing/event keys
4. **Local env wiring** — update `.env.local` with real values, verify app starts
5. **Vercel deploy** — link project, add env vars, push to production
6. **Seed + smoke test** — run bulk seed, trigger enrichment, test end-to-end

---

## Phase 1: Supabase Setup

### Task 1.1: Create Supabase project

- [ ] Go to https://supabase.com/dashboard and click **New project**
- [ ] Name it `ai-tool-roadmapper`
- [ ] Choose the **Free** tier (or Pro if you expect immediate traffic)
- [ ] Pick a region close to your Vercel deployment (US East is a safe default)
- [ ] Set a strong database password — save it somewhere safe
- [ ] Wait for project to finish provisioning (~60 seconds)

### Task 1.2: Collect Supabase credentials

From **Project Settings → API**, copy:

- [ ] **Project URL** → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
- [ ] **`anon` public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **`service_role` secret key** → `SUPABASE_SERVICE_ROLE_KEY`

From **Project Settings → Database**, copy:

- [ ] **Connection string (URI)** — select "URI" mode → `DATABASE_URL`
  - Replace `[YOUR-PASSWORD]` placeholder with the password you set above

### Task 1.3: Run migrations

Run all 4 migration files **in order** via the Supabase SQL Editor
(Dashboard → SQL Editor → paste and run each file):

- [ ] `packages/db/supabase/migrations/0001_initial.sql`
  — creates all tables (tools, tool_metadata, tool_pricing, tool_signals, tool_alternatives, staging_tools, workflow_modules, roadmaps)
- [ ] `packages/db/supabase/migrations/0002_workflow_modules_seed.sql`
  — seeds workflow modules for all 12 business types
- [ ] `packages/db/supabase/migrations/0003_embedding_rpc.sql`
  — creates `update_tool_embedding()` RPC
- [ ] `packages/db/supabase/migrations/0004_match_tools_rpc.sql`
  — creates `match_tools_by_embedding()` RPC for pgvector similarity search

> **Verify:** After running 0001, check Table Editor — you should see all 8 tables listed.
> After 0002, run `SELECT count(*) FROM workflow_modules;` — should return > 50 rows.

### Task 1.4: Configure Row Level Security (RLS)

The app uses the **service role key** server-side, so RLS doesn't block writes. However, the `roadmaps` table exposes result JSON via the API and we want anyone to read it (roadmaps are public by short_id).

Run in SQL Editor:

- [ ] Enable RLS on `roadmaps` and add a public read policy:

```sql
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Anyone can read roadmaps (they're shared by URL)
CREATE POLICY "public_read_roadmaps"
  ON roadmaps FOR SELECT
  USING (true);

-- Service role bypasses RLS — no insert/update policy needed for client reads
```

- [ ] Leave `tools`, `tool_metadata`, `tool_pricing`, `tool_signals`, `staging_tools`, `workflow_modules` with RLS disabled (they're only accessed server-side via service role key).

---

## Phase 2: API Keys

### Task 2.1: OpenAI API key

- [ ] Go to https://platform.openai.com/api-keys
- [ ] Click **Create new secret key** → name it `ai-tool-roadmapper`
- [ ] Copy the key → `OPENAI_API_KEY`
- [ ] Verify you have credits / a payment method on the account

> **Cost note:** Bulk enrichment of ~800 tools (~500 PH + ~300 GitHub) will use roughly $2–5 of OpenAI credits (gpt-4o + text-embedding-3-small). The planner itself costs <$0.02 per roadmap generation.

### Task 2.2: Product Hunt API token

- [ ] Go to https://www.producthunt.com/v2/oauth/applications
- [ ] Click **Add an Application**
- [ ] Name: `AI Tool Roadmapper`, redirect URI: `http://localhost` (not used)
- [ ] After creating, go to the app and click **Generate Token** (Developer Token — no OAuth needed)
- [ ] Copy the token → `PRODUCT_HUNT_API_TOKEN`

### Task 2.3: GitHub token (for ingest)

- [ ] Go to https://github.com/settings/tokens → **Generate new token (classic)**
- [ ] Name: `ai-tool-roadmapper-ingest`
- [ ] Scopes: `public_repo` only (read-only access to public repos is sufficient)
- [ ] No expiry (or 90 days and rotate)
- [ ] Copy the token → `GITHUB_TOKEN`

---

## Phase 3: Inngest Setup

### Task 3.1: Create Inngest account and app

- [ ] Go to https://app.inngest.com and sign up / log in
- [ ] Click **Create App**
- [ ] Name: `ai-tool-roadmapper`

### Task 3.2: Collect Inngest keys

From the app dashboard:

- [ ] **Event Key** → `INNGEST_EVENT_KEY` (used to send events)
- [ ] **Signing Key** → `INNGEST_SIGNING_KEY` (used to verify webhooks from Inngest to your app)

### Task 3.3: Note your Inngest sync URL

After deploying to Vercel (Phase 5), you'll need to register your app with Inngest at:
`https://your-vercel-domain.vercel.app/api/inngest`

This is done in Phase 5, Step 5.4.

---

## Phase 4: Wire Up Local Environment

### Task 4.1: Update `.env.local`

Replace all placeholder values in `apps/web/.env.local`:

```bash
# Real values from Phases 1–3
OPENAI_API_KEY=sk-...

SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

INNGEST_SIGNING_KEY=signkey-prod-...
INNGEST_EVENT_KEY=...

PRODUCT_HUNT_API_TOKEN=...
GITHUB_TOKEN=ghp_...

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

### Task 4.2: Verify the app starts cleanly

```bash
cd /Users/nolanselby/ai-tool-roadmapper
pnpm dev
```

- [ ] App starts at http://localhost:3000
- [ ] No "missing env var" errors in terminal
- [ ] Chat page loads and sends a message (AI responds)
- [ ] Submitting inputs triggers `/api/roadmap/generate` — check Supabase Table Editor for a new row in `roadmaps` with status `generating`

> **At this point the planner Inngest function won't run yet** because Inngest can't reach `localhost`. The roadmap will stay `generating` until you've done Phase 5 and the function is deployed. That's expected.

---

## Phase 5: Vercel Deployment

### Task 5.1: Install Vercel CLI and link project

```bash
npm i -g vercel
cd /Users/nolanselby/ai-tool-roadmapper/apps/web
vercel link
```

- [ ] Follow prompts: link to existing project or create new → `ai-tool-roadmapper`
- [ ] Note the **Project ID** and **Org ID** shown after linking (needed for GitHub Actions secrets)

### Task 5.2: Add environment variables to Vercel

```bash
# From apps/web directory — add each var to production
vercel env add OPENAI_API_KEY production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add INNGEST_SIGNING_KEY production
vercel env add INNGEST_EVENT_KEY production
vercel env add PRODUCT_HUNT_API_TOKEN production
vercel env add GITHUB_TOKEN production
```

> Alternatively: add them all at once via the Vercel Dashboard → Project → Settings → Environment Variables.

- [ ] Also add to **Preview** environment if you want PR previews to work.

### Task 5.3: Deploy to production

```bash
cd /Users/nolanselby/ai-tool-roadmapper/apps/web
vercel --prod
```

- [ ] Deployment completes — note your production URL (e.g. `ai-tool-roadmapper.vercel.app`)
- [ ] Visit the URL — chat page loads correctly

### Task 5.4: Register app with Inngest

- [ ] Go to https://app.inngest.com → your app → **Sync**
- [ ] Enter your sync URL: `https://ai-tool-roadmapper.vercel.app/api/inngest`
- [ ] Click **Sync** — Inngest will ping the endpoint and discover all your functions
- [ ] Verify all 6 functions appear in the Inngest dashboard:
  - `ingest-product-hunt`
  - `ingest-github`
  - `ingest-directories`
  - `enrich-fanout`
  - `enrich-process-tool`
  - `planner-generate-roadmap`

### Task 5.5: Add GitHub Actions secrets

In your GitHub repo → Settings → Secrets and variables → Actions, add:

- [ ] `VERCEL_TOKEN` — from https://vercel.com/account/tokens → Create Token
- [ ] `VERCEL_ORG_ID` — from `.vercel/project.json` after `vercel link` (field: `orgId`)
- [ ] `VERCEL_PROJECT_ID` — from `.vercel/project.json` (field: `projectId`)

> This enables the auto-deploy workflow (`.github/workflows/deploy.yml`) to deploy on every push to `main`.

---

## Phase 6: Seed the Tool Database + Smoke Test

### Task 6.1: Run the bulk seed script

This fetches top AI tools from Product Hunt (~500) and GitHub (~300) and writes them to `staging_tools`. Expects real API tokens in the environment.

```bash
cd /Users/nolanselby/ai-tool-roadmapper
# Ensure env vars are set in your shell (or copy from .env.local)
export $(cat apps/web/.env.local | grep -v '#' | xargs)
npx tsx scripts/bulk-seed.ts
```

- [ ] Script completes — should report ~800 records inserted into `staging_tools`
- [ ] Verify in Supabase Table Editor: `staging_tools` has rows with `status = 'pending'`

### Task 6.2: Trigger enrichment fan-out

Send the `ingest/complete` event to Inngest to kick off enrichment for all pending records:

```bash
# Using Inngest CLI (install if needed: npm i -g inngest-cli)
# Or send via curl:
curl -X POST https://inn.gs/e/$INNGEST_EVENT_KEY \
  -H "Content-Type: application/json" \
  -d '{"name": "ingest/complete", "data": {}}'
```

- [ ] Event sent — check Inngest dashboard for `enrich-fanout` function run
- [ ] `enrich-fanout` fans out individual `enrich/process-tool` events for each pending tool
- [ ] Individual `enrich-process-tool` runs appear in dashboard (may take 10–20 minutes to process all ~800)

> **What enrichment does:** For each staging tool, it scrapes the website, extracts pricing info, classifies use cases, generates an embedding, and upserts into the `tools` table with `status_active = true`.

### Task 6.3: Monitor enrichment progress

While enrichment runs (background), check progress:

```sql
-- In Supabase SQL Editor
SELECT
  status,
  count(*) as count
FROM staging_tools
GROUP BY status;

-- Check enriched tools
SELECT count(*) FROM tools WHERE status_active = true;
```

- [ ] Enrichment is making progress (count of `status_active = true` in `tools` grows over time)
- [ ] Aim for at least 200+ active tools before running the first real roadmap test (the planner needs candidates to work with)

### Task 6.4: End-to-end smoke test

Once at least 200 tools are enriched:

- [ ] Go to `https://ai-tool-roadmapper.vercel.app`
- [ ] Describe a startup idea (e.g. "An AI SDR that automatically finds and emails leads for B2B SaaS companies")
- [ ] Answer the 3–4 follow-up questions
- [ ] The chat should call `submit_inputs` and redirect to `/r/[short_id]`
- [ ] The loading state shows (spinning dots)
- [ ] Within ~30 seconds, the roadmap appears:
  - Graph view shows nodes connected by orange edges
  - Each node shows stage name, tool name, cost, difficulty/lock-in badges
  - Clicking a node expands it with reasoning
- [ ] Toggle to List view — shows same data in card format
- [ ] Click Share — URL copies to clipboard
- [ ] Export → Download Markdown — downloads a `.md` file
- [ ] Export → GitHub Issues — modal appears, can enter token + repo

### Task 6.5: Check Inngest logs for any errors

- [ ] In Inngest dashboard → Functions → `planner-generate-roadmap` → look at the run for your test
- [ ] All 4 steps should show green: `detect-business-type`, `retrieve-candidates`, `generate-roadmap`, `write-result`
- [ ] If any step failed, check the error message and address (common issues: empty candidates from retriever if DB not seeded enough, or OpenAI rate limits)

---

## Phase 7: Post-Launch Housekeeping

### Task 7.1: Set up recurring ingestion (optional but recommended)

The ingest Inngest functions support being triggered on a schedule. Send trigger events via Supabase `pg_cron` or Inngest's built-in cron support:

```sql
-- Example: trigger weekly Product Hunt ingestion via pg_cron
-- (In Supabase Dashboard → Database → Extensions, enable pg_cron first)
SELECT cron.schedule(
  'weekly-ph-ingest',
  '0 9 * * 1', -- Every Monday at 9am UTC
  $$
    SELECT net.http_post(
      'https://inn.gs/e/' || current_setting('app.inngest_event_key'),
      '{"name": "ingest/product-hunt", "data": {}}'::jsonb,
      '{"Content-Type": "application/json"}'::jsonb
    );
  $$
);
```

- [ ] Decide on ingestion cadence (weekly is a good start)
- [ ] Enable `pg_cron` extension in Supabase if using the SQL approach
- [ ] Alternatively, set up Inngest's native cron triggers in the function definitions

### Task 7.2: Custom domain (optional)

- [ ] In Vercel → Project → Settings → Domains, add your custom domain
- [ ] Update the markdown export URL in `apps/web/app/api/roadmap/[short_id]/export/markdown/route.ts`:
  - Line 9: change `https://roadmapper.ai/r/${shortId}` to your actual domain

### Task 7.3: Dead tool detection (optional)

- [ ] Set up a weekly cron to mark tools as `status_active = false` if they haven't been verified in 60 days
- [ ] The scoring package has a `freshness_score` mechanism to support this — wire it to a Supabase `pg_cron` or Inngest cron function

---

## Go-Live Checklist Summary

```
[ ] Supabase project created
[ ] All 4 migrations run
[ ] RLS configured for roadmaps table
[ ] OpenAI API key set
[ ] Product Hunt API token set
[ ] GitHub token set
[ ] Inngest app created, keys collected
[ ] .env.local updated with real values
[ ] App starts locally without errors
[ ] Deployed to Vercel
[ ] Inngest synced to Vercel URL
[ ] GitHub Actions secrets added
[ ] Bulk seed script run (~800 tools in staging_tools)
[ ] Enrichment fan-out triggered
[ ] 200+ tools enriched and active
[ ] End-to-end smoke test passed
[ ] Roadmap graph renders correctly
[ ] Export (Markdown) works
```
