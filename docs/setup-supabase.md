# Supabase Setup Guide

This guide walks you through setting up a Supabase project for local development and production.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New project**.
3. Choose your organisation, give the project a name (e.g. `ai-tool-roadmapper-dev`), set a strong database password, and select the region closest to you.
4. Click **Create new project** and wait ~2 minutes for provisioning to complete.

---

## 2. Enable the pgvector Extension

The tool database uses `pgvector` for semantic similarity search. You must enable it before running migrations.

**Option A — Supabase Dashboard (recommended)**

1. In your project, go to **Database → Extensions**.
2. Search for `vector`.
3. Toggle it on.

**Option B — SQL Editor**

```sql
create extension if not exists vector;
```

---

## 3. Run the Migrations

All migration files live in `packages/db/supabase/migrations/`. Run them in order using the Supabase SQL Editor or the Supabase CLI.

### Using the Supabase Dashboard SQL Editor

Open each file below in order and run the contents:

| Order | File | Description |
|---|---|---|
| 1 | `0001_initial.sql` | Core tables: tools, categories, roadmaps, sessions |
| 2 | `0002_workflow_modules_seed.sql` | Seed workflow module taxonomy |
| 3 | `0003_embedding_rpc.sql` | RPC function for generating embeddings |
| 4 | `0004_match_tools_rpc.sql` | RPC function for vector similarity search |
| 5 | `0005_schema_hardening.sql` | Constraints, indexes, and FK enforcement |
| 6 | `0006_full_schema.sql` | Final schema consolidation |
| 7 | `0007_seed_taxonomy.sql` | Seed AI tool taxonomy and categories |

### Using the Supabase CLI

If you prefer the CLI:

```bash
# Install the CLI
npm install -g supabase

# Log in
supabase login

# Link to your project (find your project ref in the Supabase dashboard URL)
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push
```

---

## 4. Get Your Connection Strings

In the Supabase dashboard, go to **Settings → API**.

Copy the following values into `apps/web/.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → Project API keys → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → Project API keys → `service_role` (keep secret) |
| `DATABASE_URL` | Settings → Database → Connection string → URI |

> **Note on DATABASE_URL:** For serverless deployments use the **Transaction** pooler connection string to avoid exhausting connection limits. For local development the direct connection string is fine.

---

## 5. Row Level Security (RLS)

The migrations include RLS policies to protect your data. A few things to keep in mind:

- **Server-side operations** (Inngest jobs, API routes that call `supabaseAdmin`) use the `service_role` key, which bypasses RLS. Never expose this key in client-side code.
- **Client-side operations** (if any) use the `anon` key and are subject to RLS policies. Review `0005_schema_hardening.sql` for the policy definitions.
- For local development you can temporarily disable RLS on a table via the dashboard (**Table Editor → select table → RLS**), but always re-enable it before deploying.

---

## 6. Local Development with Supabase CLI (Optional)

If you prefer a fully local Supabase stack (no cloud project needed during development):

```bash
# Start local Supabase (requires Docker)
supabase start

# The CLI will print local credentials — copy them into .env.local
```

Stop the local stack with:

```bash
supabase stop
```

---

## Troubleshooting

**`ERROR: extension "vector" does not exist`**
Enable pgvector before running migrations (see Step 2).

**`connection refused` or timeout on DATABASE_URL**
Make sure you are using the correct connection string. For serverless, use the Transaction pooler URL (port 6543), not the direct connection (port 5432).

**RLS blocking reads in your API routes**
Ensure server-side Supabase calls use the client initialised with `SUPABASE_SERVICE_ROLE_KEY`, not the anon key.
