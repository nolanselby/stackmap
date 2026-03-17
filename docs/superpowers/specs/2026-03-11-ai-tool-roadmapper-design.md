# AI Tool Roadmapper — Design Spec

**Date:** 2026-03-11
**Status:** Approved
**License:** MIT (public GitHub repo from day one)

---

## 1. Product Summary

An AI stack planner for founders. Users describe their startup idea in a chat interface, answer 3–4 conversational follow-up questions, and receive an interactive visual roadmap recommending the exact AI tools to build their product — grouped by workflow stage, with cost estimates, alternatives, and a phased build sequence.

**Core promise:** "Tell us what you want to build, and we show you exactly which AI tools to use, in what order, and what it'll cost."

**Target personas:**
- Non-technical founders — need a complete plan with no assumptions
- Technical founders / indie hackers — want fastest/cheapest stack with open-source alternatives surfaced

**No user accounts, anywhere, ever.** Roadmaps stored with a short ID and shared via URL only.

---

## 2. Repo Structure

```
ai-tool-roadmapper/
  apps/
    web/                  # Next.js 14, TypeScript, Tailwind, shadcn/ui, React Flow
  services/
    ingest/               # Inngest functions: pull from PH, GitHub, directories
    enrich/               # Inngest functions: scrape, classify, price extraction
    planner/              # Roadmap generation: retrieval + LLM ranking (Inngest function)
  packages/
    db/                   # Drizzle ORM schema + Supabase client
    schemas/              # Zod schemas shared across services
    scoring/              # Deterministic scoring logic
    prompts/              # LLM prompt templates (system prompts, extraction prompts)
  .github/
    workflows/            # CI: lint, typecheck, test, Hosting Provider preview deploy
```

---

## 3. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui | Zero-config Hosting Provider deploys, App Router for streaming |
| Graph UI | React Flow v12 (MIT license) | Purpose-built interactive node graph |
| Database | Supabase (Postgres + pgvector) | pgvector for embeddings, pg_cron for scheduled jobs, generous free tier |
| ORM | Drizzle ORM | Type-safe, lightweight, plays well with Supabase |
| Background jobs | Inngest | Durable execution, retries, fan-out — purpose-built for pipelines |
| Embeddings | OpenAI `text-embedding-3-small` | Fast, cheap, 1536 dimensions |
| LLM | OpenAI `gpt-4o` | Structured JSON output for enrichment and planner ranking |
| Streaming | Hosting Provider AI SDK (`useChat`, `streamText`) | Handles chat streaming and roadmap generation streaming |
| Hosting | Hosting Provider (web), Inngest cloud (workers) | Fully managed, no ops overhead |
| Theme | Orange primary brand color | Applied throughout: buttons, accents, graph nodes, edges |
| Test framework | Vitest + Testing Library | Fast, native ESM, good Next.js support |

### Environment Variables
A `.env.example` file is committed to the repo. Actual secrets are never committed. Required variables:
```
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=
PRODUCT_HUNT_API_TOKEN=
GITHUB_TOKEN=
```

---

## 4. Data Model

All tables include `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` unless noted.

### `tools`
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
name text NOT NULL
slug text UNIQUE NOT NULL
website_url text
logo_url text
short_description text
long_description text
github_url text
open_source boolean DEFAULT false
launch_date date
last_verified_at timestamptz
status_active boolean DEFAULT false  -- set to true when composite score >= threshold
embedding vector(1536)
created_at timestamptz DEFAULT now()
```

### `tool_metadata`
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
tool_id uuid REFERENCES tools(id) ON DELETE CASCADE
categories text[]
use_cases text[]
target_personas text[]
business_stages text[]
api_available boolean
self_hostable boolean
enterprise_ready boolean
input_types text[]
output_types text[]
integrations text[]
```

### `tool_pricing`
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
tool_id uuid REFERENCES tools(id) ON DELETE CASCADE
free_tier boolean
starting_price_monthly numeric
pricing_model text  -- seat | usage | flat | open-source
est_cost_5_users numeric
est_cost_20_users numeric
hidden_cost_notes text
```

### `tool_signals`
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
tool_id uuid REFERENCES tools(id) ON DELETE CASCADE
github_stars integer
github_last_commit date
producthunt_votes integer
source_count integer  -- number of discovery sources that found this tool
freshness_score numeric  -- 0-1, see scoring spec in Section 9
popularity_score numeric  -- 0-1
maintenance_score numeric  -- 0-1
trust_score numeric  -- 0-1, composite
last_computed_at timestamptz
```

### `tool_alternatives`
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
tool_id uuid REFERENCES tools(id) ON DELETE CASCADE
alternative_tool_id uuid REFERENCES tools(id) ON DELETE CASCADE
reason text
cheaper boolean
better_for_nontechnical boolean
better_for_enterprise boolean
```

### `staging_tools`
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
raw_data jsonb NOT NULL
source text NOT NULL  -- product_hunt | github | futurepedia | taaft
source_id text  -- original ID in source system
status text NOT NULL DEFAULT 'pending'  -- pending | enriching | enriched | failed | duplicate
error_message text
created_at timestamptz DEFAULT now()
```

**Transition from `staging_tools` to `tools`:**
The `enrich/process-tool` Inngest function is responsible for this transition. After successful enrichment, it:
1. Inserts a new record into `tools` (or updates if slug matches existing)
2. Inserts into `tool_metadata`, `tool_pricing`, `tool_signals`
3. Sets `staging_tools.status = 'enriched'`

If the record is a duplicate, only `tool_signals` is updated with new signal data. `staging_tools.status` is set to `'duplicate'`.

### `workflow_modules`
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
business_type text NOT NULL  -- see list in Section 10
stage text NOT NULL
module_name text NOT NULL
required_capabilities text[]
optional_capabilities text[]
typical_order integer
dependencies text[]  -- module_names that must precede this one
implementation_notes text
```

### `roadmaps`
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
short_id text UNIQUE NOT NULL  -- nanoid(8), e.g. "x7kP2mQr"
input_idea text NOT NULL
input_customer text
input_budget_monthly numeric
input_tech_level text  -- non-technical | some-coding | full-stack
input_preference text  -- best-overall | cheapest | open-source
result_json jsonb  -- full structured roadmap output, null while generating
status text DEFAULT 'generating'  -- generating | complete | failed
created_at timestamptz DEFAULT now()
```

`short_id` is generated server-side using `nanoid` with alphabet `0-9A-Za-z`, length 8. Collision probability is negligible at MVP scale.

---

## 5. API Routes

All routes live in `apps/web/app/api/`.

### `POST /api/chat`
Handles the conversational input flow. Streams responses back via Hosting Provider AI SDK (`streamText`).

**Request:**
```typescript
{ messages: { role: "user" | "assistant", content: string }[] }
```

**Response:** Server-Sent Events stream (Hosting Provider AI SDK format)

**Rate limiting:** IP-based rate limit enforced in Next.js middleware: max 20 requests per IP per minute. Exceeding returns HTTP 429. Max 6 messages per conversation session (enforced server-side by checking `messages.length`); if exceeded, the bot responds with a "let me generate your roadmap now" message and forces generation.

**Error response:**
```typescript
// HTTP 429: { error: "Too many requests. Please wait a moment." }
// HTTP 400: { error: "Invalid request body" }
// HTTP 500: { error: "Failed to generate response. Please try again." }
```

The chat bot is driven by `gpt-4o` with a system prompt from `packages/prompts/chat-system-prompt.ts`. The system prompt instructs the model to:
1. Acknowledge the idea and ask about the target customer + budget (turn 2)
2. Ask about tech level + preference: best overall, cheapest viable, or open-source first (turn 3)
3. Once all inputs are collected, use the Hosting Provider AI SDK **data stream channel** to emit a structured data message alongside the final text response. This is done via `streamText`'s `onFinish` callback writing to `DataStreamWriter`:
   ```typescript
   // Server-side, inside the streamText handler:
   dataStream.writeData({
     type: "inputs_complete",
     idea: "...", customer: "...", budget: 200,
     tech_level: "some-coding", preference: "best-overall"
   })
   ```
   The frontend detects this via `useChat`'s `data` array: whenever `data` contains an object with `type === "inputs_complete"`, it extracts the fields and calls `POST /api/roadmap/generate`.

If the user provides nonsensical or insufficient input, the bot asks a clarifying follow-up (max 1 additional turn before generating anyway with best-effort interpretation).

### `POST /api/roadmap/generate`
Creates a roadmap record and triggers the planner Inngest function.

**Request:**
```typescript
{
  idea: string,
  customer: string,
  budget_monthly: number,
  tech_level: "non-technical" | "some-coding" | "full-stack",
  preference: "best-overall" | "cheapest" | "open-source"
}
```

**Response (200):**
```typescript
{ short_id: string }  // immediately returns short_id; generation is async
```

**Error responses:**
```typescript
// HTTP 400: { error: "Missing required field: idea" }
// HTTP 500: { error: "Failed to create roadmap. Please try again." }
```

The frontend redirects to `/r/[short_id]` and polls for completion.

### `GET /api/roadmap/[short_id]`
Returns the current state of a roadmap.

**Response (200):**
```typescript
{
  status: "generating" | "complete" | "failed",
  roadmap: RoadmapResult | null  // null while generating or failed
}
```

**Error responses:**
```typescript
// HTTP 404: { error: "Roadmap not found" }
```

The frontend polls every 2 seconds while `status === 'generating'`. **Maximum poll duration: 5 minutes.** If `status` is still `'generating'` after 5 minutes, the frontend stops polling and displays: "This is taking longer than expected. Try refreshing the page." The Inngest planner function has a configured timeout of 4 minutes; on timeout, it writes `roadmaps.status = 'failed'` before terminating.

### `GET /api/roadmap/[short_id]/export/markdown`
Returns roadmap as Markdown text (200) or `{ error: "Roadmap not found" }` (404).

### `GET /api/roadmap/[short_id]/export/github-issues`
Returns an array of GitHub issue objects:
```typescript
[{ title: string, body: string, labels: string[] }]
```
The user opens a modal, enters their GitHub personal access token and target `owner/repo`. The frontend calls the GitHub API directly from the browser:
```
POST https://api.github.com/repos/{owner}/{repo}/issues
Authorization: Bearer {token}
Content-Type: application/json
```
The token is held only in React component state for the duration of the modal session and is never sent to our servers or stored. On GitHub API error (401, 403, 404, 422), the modal displays: "Failed to create issue: {error.message}". Token is never logged.

---

## 6. Ingestion & Enrichment Pipeline

### Daily Cron (2am UTC via Inngest scheduled functions)

Three parallel discovery functions. Each requires authentication:
- **Product Hunt**: API token (OAuth app, `PRODUCT_HUNT_API_TOKEN`). Rate limit: 150 requests/hour. The daily job fetches one page of results, staying well within limits.
- **GitHub**: Personal access token (`GITHUB_TOKEN`). Authenticated rate limit: 5000 requests/hour. The job uses a single search query + pagination, using ~20–50 requests per run.
- **Directories**: HTTP scraping, no auth. Rate-limited to 1 request/second per domain. Respects `robots.txt`. If a target domain is unreachable, the job logs the failure and continues — it does not block other sources.

**`ingest/product-hunt`**
- GraphQL API, pulls last 24hrs of AI category launches
- Extracts: name, tagline, website, votes, launch_date
- Writes to `staging_tools` with `source = 'product_hunt'`

**`ingest/github`**
- REST API, queries topics: `artificial-intelligence`, `llm`, `ai-tools`, `generative-ai`
- Sorted by recently updated, min 50 stars
- Extracts: repo name, description, stars, last_commit, homepage_url
- Writes to `staging_tools` with `source = 'github'`

**`ingest/directories`**
- Sources: Futurepedia category pages, TAAFT
- Scraper: Cheerio for HTML parsing, Playwright headless only if JS rendering is required
- Extracts: name, description, website, category tags
- Writes to `staging_tools` with `source = 'directory'`

### Enrichment Fan-out

After each ingest run completes, an `ingest/complete` Inngest event triggers `enrich/process-tool` once per new staging record. This fan-out is handled by Inngest's `step.sendEvent` with a batch payload.

**`enrich/process-tool` steps:**

1. **Dedupe check**
   - Extract canonical domain from `website_url` (strip `www.`, subdomain, path): `app.toolname.com` and `www.toolname.com` → `toolname.com`
   - Match against `tools.website_url` (normalized) and `tools.slug`
   - If match found: update `tool_signals` only, set `staging_tools.status = 'duplicate'`, stop
   - Edge case: same tool on PH and GitHub with different names → domain match catches this
   - **If `website_url` is null** (common for GitHub-sourced repos with no homepage): fall back to slug-only match using `slugify(name)`. If no slug match, treat as new tool. Accept that some duplicates may slip through — they are filtered at the `trust_score` gate anyway.

2. **Page scrape**
   - Fetch homepage HTML (Cheerio)
   - Attempt `/pricing` page fetch
   - On fetch failure: continue with partial data, note in enrichment

3. **LLM extraction** — `gpt-4o` with `response_format: { type: "json_schema" }`:
   ```json
   {
     "primary_category": "string",
     "secondary_categories": ["string"],
     "use_cases": ["string"],
     "target_personas": ["string"],
     "pricing_model": "seat | usage | flat | open-source",
     "starting_price_monthly": "number | null",
     "free_tier": "boolean",
     "has_api": "boolean",
     "self_hostable": "boolean",
     "integrations": ["string"],
     "best_for": ["string"],
     "not_ideal_for": ["string"]
   }
   ```
   (`confidence` field removed — not used downstream.)
   If LLM returns malformed JSON: log error, set `staging_tools.status = 'failed'`, stop. Inngest retries up to 3 times with exponential backoff.

4. **Embedding generation**
   - Input: `{name} — {short_description}. Use cases: {use_cases.join(", ")}`
   - Model: `text-embedding-3-small`
   - On failure: retry via Inngest backoff

5. **Score computation** — calls `packages/scoring` (see Section 9)

6. **Threshold gate** — if composite score >= 0.35: `status_active = true`

7. **Write to `tools`** — insert or update, then insert child records

**Cost estimate for enrichment pipeline:**
- ~1 `gpt-4o` call per new tool (~500 input tokens, ~150 output tokens) ≈ $0.002/tool
- ~1 embedding call per tool ≈ $0.00002/tool
- 500 new tools/day ≈ ~$1/day during initial seeding, <$0.10/day steady state

---

## 7. Recommendation Engine & Planner

The planner runs as an Inngest function (`planner/generate-roadmap`) triggered by the `roadmap/generate` event sent from `POST /api/roadmap/generate`. Generation is **asynchronous** — the API route returns `short_id` immediately, and the frontend polls `GET /api/roadmap/[short_id]` until complete.

### Stage 1: Business Type Detection
Before retrieval, classify the user's idea into one of the 12 business types (Section 10) using `gpt-4o` with a classification prompt. Output is a single `business_type` string. This classification is deterministic via a strict enum in the JSON schema response.

### Stage 2: Retrieval (deterministic)
1. Embed user's idea via `text-embedding-3-small`
2. pgvector cosine similarity search against `tools.embedding` → top 100 candidates
3. Hard filters: `status_active = true`, budget cap on `tool_pricing.starting_price_monthly`, preference flags
4. Join against `workflow_modules` for detected `business_type` → map candidates to workflow stages
5. Output: ~50 tools grouped by workflow module

If pgvector returns zero results after filtering (e.g., budget too low for all tools in a stage): include free-tier tools and open-source alternatives for that stage regardless of preference setting, and flag the stage in the output as `"budget_constrained": true`.

### Stage 3: Ranking & Generation (LLM)
`gpt-4o` receives the structured candidate set (never free-form invention) with strict JSON schema response:

```typescript
{
  business_type: string,
  detected_business_type_confidence: number,
  workflow_stages: [{
    stage_name: string,
    stage_order: number,
    best_overall_tool: ToolRef,
    cheapest_tool: ToolRef | null,       // null if best_overall is already free
    opensource_tool: ToolRef | null,     // null if none available in candidates
    why_chosen: string,
    monthly_cost_estimate: number,
    setup_difficulty: "low" | "medium" | "high",
    lock_in_risk: "low" | "medium" | "high",
    budget_constrained: boolean
  }],
  total_monthly_cost_best_overall: number,
  total_monthly_cost_cheapest: number,
  build_sequence: [{
    week: number,       // 1-indexed, sequential, max = ceil(stage_count / 2)
    focus: string,      // human-readable description of the week's goal
    tools: string[]     // tool names (not IDs) from best_overall_tool for that week's stages
  }]
}
```

`ToolRef`: `{ tool_id: string, name: string, why: string }`

The three plan variants (Best Overall / Cheapest / Open Source) are derived client-side from `best_overall_tool`, `cheapest_tool`, and `opensource_tool` fields in each stage — not as separate top-level objects. The UI toggle simply switches which field is displayed per stage, and recalculates the total cost. No re-querying required.

**On malformed LLM response:** If JSON parsing fails after retries, set `roadmaps.status = 'failed'`. The UI shows an error message: "Something went wrong generating your roadmap. Try again."

---

## 8. Roadmap UI

### Landing Page (`/`)
- Full-screen chat interface — the page IS the chat
- Orange brand theme, minimal chrome
- First bot message: `"Tell me what you want to build — describe your startup idea in a sentence or two."`
- Uses Hosting Provider AI SDK `useChat` hook for streaming
- When `inputs_complete` message is received: frontend calls `POST /api/roadmap/generate`, receives `short_id`, navigates to `/r/[short_id]`

### Loading Page (`/r/[short_id]` while `status === 'generating'`)
- Animated orange progress indicator
- Polling `GET /api/roadmap/[short_id]` every 2 seconds
- Shows copy: "Analyzing tools across our database..." (static, not dynamic)
- On `status === 'failed'`: shows error message with "Try again" button that returns to `/`

### Roadmap Page (`/r/[short_id]` when `status === 'complete'`)

**Top bar:**
- Roadmap title (derived from `business_type`)
- Plan toggle: Best Overall | Cheapest | Open Source (switches which tool is shown per stage)
- Budget slider: $0–$1000/mo (client-side filter)
- Export menu button

**Budget slider behavior:** Filters which tool variant is shown per stage based on `monthly_cost_estimate`. When the active plan variant's tool exceeds the budget: (a) the node in graph view is dimmed with a "Over budget" badge, but the node is NOT removed — removing nodes would break edges and disconnect the graph layout; (b) in list view, the row shows a "Over budget — consider the cheapest alternative" inline note. The slider never triggers a server re-query.

**Fallback message for budget-constrained stages:** "No tool fits your budget for this stage. Consider the open-source option or increasing your budget."

**Graph View (default)**
- React Flow v12 canvas, orange-accented nodes and edges
- Node: workflow stage card (tool name, logo, monthly cost badge, difficulty badge, lock-in badge)
- Edge: directed arrow labeled "feeds into" or "depends on"
- Click node: expands drawer showing why_chosen, alternatives with comparison, setup notes
- Layout: dagre auto-layout (top-to-bottom)

**List View (toggle)**
- Grouped by build week from `build_sequence`
- Each tool row: name, logo, cost, difficulty, why_chosen, inline alternative pills
- Total cost row at bottom, updates with plan toggle

**Export menu:**
- Copy as Markdown — client-side generation from roadmap JSON
- Download as PDF — client-side via `@react-pdf/renderer`. Must be loaded with `dynamic(() => import(...), { ssr: false })` to avoid Next.js SSR build failures (library is browser-only).
- Export as GitHub Issues — modal prompts for GitHub token + repo name (token not stored), calls GitHub Issues API from the browser directly
- Export to Linear — **deferred to Phase 2, not in MVP**

**URL sharing:** `roadmapper.com/r/[short_id]` — no auth required to view

---

## 9. Scoring Package (`packages/scoring`)

All scores are `0.0–1.0`. Composite threshold for `status_active = true` is **0.35**.

### `freshness_score`
```
days_since_launch = today - launch_date
freshness_score = max(0, 1 - (days_since_launch / 730))  // decays to 0 over 2 years
```

### `popularity_score`
```
github_component = min(github_stars / 5000, 1.0)  // capped at 5000 stars = 1.0
ph_component = min(producthunt_votes / 1000, 1.0)
source_component = min(source_count / 3, 1.0)  // found in all 3 source classes = 1.0
popularity_score = (github_component * 0.5) + (ph_component * 0.3) + (source_component * 0.2)
```

### `maintenance_score`
```
// Only applies to open-source tools; defaults to 0.7 for closed-source
days_since_commit = today - github_last_commit
maintenance_score = max(0, 1 - (days_since_commit / 365))  // decays to 0 over 1 year
// Closed-source: maintenance_score = 0.7 (assumed active unless status_active set to false manually)
```

### `trust_score` (composite)

`source_component` is a named intermediate variable computed once and shared by both `popularity_score` and `trust_score`:
```
source_component = min(source_count / 3, 1.0)  // same variable used in popularity_score above
```

```
trust_score = (freshness_score * 0.2) + (popularity_score * 0.4) + (maintenance_score * 0.3) + (source_component * 0.1)
```

Weights sum to 1.0. `source_component` intentionally appears in both `popularity_score` (as a sub-component with 0.2 weight within that score) and `trust_score` (with 0.1 weight) — this double-weighting slightly amplifies multi-source discovery as a trust signal, which is intentional.

### Status Active Gate
```
status_active = trust_score >= 0.35
```

---

## 10. Workflow Business Types (Seed Data)

The `workflow_modules` table is seeded with these 12 business types. Each type has 5–8 modules.

1. `ai_sdr` — AI sales development representative tool
2. `ai_customer_support` — AI-powered customer support / helpdesk
3. `ai_internal_search` — Internal knowledge base / enterprise search
4. `ai_content_ops` — AI content creation and publishing pipeline
5. `ai_coding_assistant` — AI coding tool or developer productivity platform
6. `ai_research_tool` — AI research assistant (legal, academic, market research)
7. `ai_recruiting` — AI recruiting and talent sourcing platform
8. `ai_data_enrichment` — AI data enrichment / lead intelligence pipeline
9. `ai_document_processing` — AI document analysis, extraction, summarization
10. `ai_voice_agent` — AI phone / voice agent platform
11. `ai_ecommerce` — AI-powered ecommerce personalization or operations tool
12. `ai_analytics` — AI business intelligence or analytics platform

Each module entry specifies `required_capabilities`, `optional_capabilities`, `typical_order`, and `dependencies`. This seed data is committed as a SQL migration file.

**Representative example — `ai_sdr` modules:**

| order | module_name | required_capabilities | optional_capabilities | dependencies |
|---|---|---|---|---|
| 1 | lead_sourcing | prospect_discovery, company_search | technographic_filtering | — |
| 2 | lead_enrichment | contact_enrichment, email_lookup | linkedin_data, firmographic_data | lead_sourcing |
| 3 | lead_scoring | ai_scoring, crm_integration | intent_signals | lead_enrichment |
| 4 | email_sequencing | email_automation, personalization | multi_channel | lead_scoring |
| 5 | call_analysis | call_recording, ai_transcription | sentiment_analysis | — |
| 6 | crm_sync | crm_integration, webhook | bi_directional_sync | lead_scoring |
| 7 | reporting | analytics_dashboard | revenue_attribution | crm_sync |

The full seed data for all 12 business types is defined in `scripts/seed-workflow-modules.ts` and applied via `supabase/migrations/0002_workflow_modules_seed.sql`. This file must exist before the planner service can be tested.

`short_id` collision: on `UNIQUE` constraint violation inserting into `roadmaps`, the API route retries up to 3 times with a freshly generated nanoid. After 3 failures, returns HTTP 500. At MVP scale (< 100k roadmaps), probability of even one collision is negligible.

**DB access pattern:** All database access is proxied through Next.js API routes using `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS). The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is listed in env vars for future use but is **not used client-side in MVP** — there are no direct browser-to-Supabase calls. No RLS policies are required at MVP.

---

## 11. CI/CD

### `.github/workflows/ci.yml`
- Triggers: push to any branch, PRs to `main`
- Steps: install, lint (ESLint), typecheck (tsc --noEmit), unit tests (Vitest)
- Test scope: `packages/scoring` scoring formulas, `packages/schemas` Zod validation, deduplication logic in `services/enrich`

### `.github/workflows/deploy.yml`
- Triggers: push to `main`
- Steps: Hosting Provider production deploy via `hosting-provider --prod` (Hosting Provider GitHub integration handles preview deploys automatically)

### Inngest functions
- **Authoritative location:** `apps/web/inngest/` — co-located with the Next.js app and registered via the Inngest Next.js serve handler at `apps/web/app/api/inngest/route.ts`
- The `services/ingest/`, `services/enrich/`, and `services/planner/` directories in the repo structure contain the **business logic modules** imported by the Inngest functions in `apps/web/inngest/`. They are not separate deployable services.
- Deployed automatically when Hosting Provider deploys `apps/web`

---

## 12. Seed Strategy

Phase 1 targets 500–1500 tools. Initial population strategy:
1. Run a one-time bulk import script (`scripts/bulk-seed.ts`) that:
   - Pulls the top 500 AI tools from Product Hunt (all time, AI category)
   - Pulls the top 500 GitHub repos by stars in AI topics
   - Writes all to `staging_tools`
2. Trigger enrichment fan-out for all staged records
3. After enrichment, ~40–60% are expected to pass the `trust_score >= 0.35` gate and become `status_active = true`
4. Daily cron then maintains freshness going forward

---

## 13. MVP Scope

**In:**
- Chat-style input UI (landing page IS the chat)
- Daily ingest from Product Hunt, GitHub, Futurepedia, TAAFT
- Enrichment pipeline with deduplication and scoring
- Embedding-based retrieval + LLM ranking
- Interactive graph roadmap (React Flow) + list view toggle
- 3 plan variants (best overall / cheapest / open-source) derived client-side
- Shareable URL via short_id (nanoid)
- Export: Markdown, PDF, GitHub Issues
- 12 business workflow types seeded in `workflow_modules`
- Orange brand theme
- MIT license, public GitHub
- `.env.example` with all required variables documented

**Out (explicitly deferred):**
- User accounts / auth
- Saved projects
- Team collaboration
- Community submissions / reviews
- Browser extension
- Enterprise features
- Linear export
- Real-time budget re-querying (slider filters existing results only)

---

## 14. Phased Roadmap

**Phase 1 (MVP):** Core pipeline, 500–1500 tools, reliable roadmap generation, graph UI, shareable URLs
**Phase 2:** Pricing verification, source citations in roadmap, stale-tool detection + refresh jobs, Linear export, more business types
**Phase 3:** Vertical-specific ontologies, hidden-gem OSS discovery, benchmark cost data, niche community embedding
