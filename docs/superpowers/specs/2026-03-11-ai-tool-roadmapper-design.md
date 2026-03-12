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
    planner/              # Roadmap generation: retrieval + LLM ranking
  packages/
    db/                   # Drizzle ORM schema + Supabase client
    schemas/              # Zod schemas shared across services
    scoring/              # Deterministic scoring logic
    prompts/              # LLM prompt templates
  .github/
    workflows/            # CI: lint, typecheck, test
```

---

## 3. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui | Zero-config Vercel deploys, App Router for streaming |
| Graph UI | React Flow | Purpose-built interactive node graph |
| Database | Supabase (Postgres + pgvector) | pgvector for embeddings, pg_cron for scheduled jobs, generous free tier |
| ORM | Drizzle ORM | Type-safe, lightweight, plays well with Supabase |
| Background jobs | Inngest | Durable execution, retries, fan-out — purpose-built for pipelines |
| Embeddings | OpenAI `text-embedding-3-small` | Fast, cheap, 1536 dimensions |
| LLM | OpenAI `gpt-4o` | Structured JSON output for enrichment and planner ranking |
| Hosting | Vercel (web), Inngest cloud (workers) | Fully managed, no ops overhead |
| Theme | Orange primary brand color | Applied throughout: buttons, accents, graph nodes, edges |

---

## 4. Data Model

### `tools`
```sql
id uuid PRIMARY KEY
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
status_active boolean DEFAULT false
embedding vector(1536)
created_at timestamptz DEFAULT now()
```

### `tool_metadata`
```sql
tool_id uuid REFERENCES tools(id)
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
tool_id uuid REFERENCES tools(id)
free_tier boolean
starting_price_monthly numeric
pricing_model text  -- seat | usage | flat | open-source
est_cost_5_users numeric
est_cost_20_users numeric
hidden_cost_notes text
```

### `tool_signals`
```sql
tool_id uuid REFERENCES tools(id)
github_stars integer
github_last_commit date
producthunt_votes integer
source_count integer
freshness_score numeric
popularity_score numeric
maintenance_score numeric
trust_score numeric
last_computed_at timestamptz
```

### `tool_alternatives`
```sql
tool_id uuid REFERENCES tools(id)
alternative_tool_id uuid REFERENCES tools(id)
reason text
cheaper boolean
better_for_nontechnical boolean
better_for_enterprise boolean
```

### `staging_tools`
```sql
id uuid PRIMARY KEY
raw_data jsonb
source text  -- product_hunt | github | futurepedia | taaft
source_id text
status text  -- pending | enriching | enriched | failed | duplicate
error_message text
created_at timestamptz DEFAULT now()
```

### `workflow_modules`
```sql
id uuid PRIMARY KEY
business_type text  -- ai_sdr | legal_doc_tool | internal_chatbot | etc.
stage text
module_name text
required_capabilities text[]
optional_capabilities text[]
typical_order integer
dependencies text[]
implementation_notes text
```

### `roadmaps`
```sql
id uuid PRIMARY KEY
short_id text UNIQUE  -- used in shareable URL
input_idea text
input_budget_monthly numeric
input_tech_level text
input_preference text
result_json jsonb  -- full structured roadmap output
created_at timestamptz DEFAULT now()
```

---

## 5. Ingestion & Enrichment Pipeline

### Daily Cron (2am UTC via Inngest scheduled functions)

Three parallel discovery functions:

**`ingest/product-hunt`**
- Source: Product Hunt GraphQL API
- Pulls last 24hrs of AI category launches
- Extracts: name, tagline, website, votes, launch_date
- Writes to `staging_tools` with `source = 'product_hunt'`

**`ingest/github`**
- Source: GitHub REST API
- Queries topics: `artificial-intelligence`, `llm`, `ai-tools`, `generative-ai`
- Sorted by recently updated, min 50 stars
- Extracts: repo name, description, stars, last_commit, homepage_url
- Writes to `staging_tools` with `source = 'github'`

**`ingest/directories`**
- Sources: Futurepedia category pages, TAAFT
- Scraper respects robots.txt, rate-limited
- Extracts: name, description, website, category tags
- Writes to `staging_tools` with `source = 'directory'`

### Enrichment Fan-out (triggered per staged record)

`enrich/process-tool` Inngest function:

1. **Dedupe check** — canonical domain extraction + slug match. If duplicate, merge signals only and mark `status = 'duplicate'`
2. **Page scrape** — fetch homepage + `/pricing` HTML
3. **LLM extraction** — `gpt-4o` with strict JSON schema:
   ```json
   {
     "primary_category": "string",
     "secondary_categories": ["string"],
     "use_cases": ["string"],
     "target_personas": ["string"],
     "pricing_model": "seat | usage | flat | open-source",
     "has_api": "boolean",
     "self_hostable": "boolean",
     "integrations": ["string"],
     "best_for": ["string"],
     "not_ideal_for": ["string"],
     "confidence": "number"
   }
   ```
4. **Embedding generation** — embed `name + short_description + use_cases` → store in `tools.embedding`
5. **Score computation** — `packages/scoring` computes all four scores deterministically from signals
6. **Threshold gate** — composite score above threshold sets `status_active = true`

**Retry logic:** Inngest exponential backoff, max 3 retries. Failures stay in `staging_tools` with `status = 'failed'` and `error_message`.

---

## 6. Recommendation Engine & Planner

### User Input (collected via chat UI, 3–4 turns)
- Startup idea (free text)
- Target customer (free text)
- Monthly budget ($0 / $50 / $200 / $500 / $1000+)
- Technical level (non-technical / some coding / full-stack)
- Preference (best overall / cheapest viable / open-source first)

### Stage 1: Retrieval (deterministic)
1. Embed user's idea via `text-embedding-3-small`
2. pgvector cosine similarity search → top 100 candidates
3. Hard filters: budget cap, `status_active = true`, preference flags
4. Join against `workflow_modules` for detected business type → map candidates to workflow stages
5. Output: ~50 tools grouped by workflow module

### Stage 2: Ranking & Generation (LLM)
`gpt-4o` receives the structured candidate set with strict response schema:

```typescript
{
  business_type: string,
  workflow_stages: [{
    stage_name: string,
    stage_order: number,
    recommended_tool: ToolRef,
    cheaper_alternative: ToolRef | null,
    opensource_alternative: ToolRef | null,
    why_chosen: string,
    monthly_cost_estimate: number,
    setup_difficulty: "low" | "medium" | "high",
    lock_in_risk: "low" | "medium" | "high"
  }],
  total_monthly_cost: number,
  build_sequence: [{ week: number, focus: string, tools: string[] }],
  plan_variants: {
    fastest_to_launch: WorkflowStage[],
    cheapest_viable: WorkflowStage[]
  }
}
```

**The LLM never invents tools** — it selects and ranks from the retrieved candidate set only and fills in `why_chosen`. Outputs are grounded and auditable.

---

## 7. Roadmap UI

### Landing Page
- Full-screen chat interface as the hero — the page IS the chat
- Orange brand theme, minimal chrome
- First message: `"Tell me what you want to build..."`
- 3–4 conversational turns collect all inputs
- Transitions to `"Generating your roadmap..."` streaming state

### Roadmap Page (`/r/[short_id]`)

**Graph View (default)**
- React Flow canvas with orange-accented nodes and edges
- Nodes: workflow stage cards (tool name, logo, cost, difficulty badge, lock-in badge)
- Edges: directed arrows for "feeds into" / "depends on"
- Click to expand: why chosen, cheaper alternative, open-source alternative, setup notes
- Top controls: toggle Best Overall / Cheapest / Open Source
- Budget slider: filters visible tools in real time

**List View (toggle)**
- Grouped by build week
- Each tool: name, cost, difficulty, why chosen, alternatives
- Total cost summary at bottom

**Export menu**
- Copy as Markdown
- Download as PDF
- Export as GitHub Issues (one issue per stage)
- Export to Linear

### URL Sharing
- Roadmap stored in `roadmaps` table with `short_id`
- Shareable URL: `roadmapper.com/r/[short_id]`
- No auth required to view or share

---

## 8. User Flow

```
User lands on site
  → Chat UI hero: "Tell me what you want to build..."
  → Turn 1: User describes idea
  → Turn 2: Bot asks about target customer + budget
  → Turn 3: Bot asks tech level + preference
  → "Generating your roadmap..." (streaming)
  → Roadmap page with graph view
  → User explores, toggles views, adjusts budget slider
  → Copies shareable URL or exports
```

---

## 9. MVP Scope (Phase 1)

**In:**
- Chat-style input UI
- Daily ingest from Product Hunt, GitHub, Futurepedia, TAAFT
- Enrichment pipeline with deduplication
- Embedding-based retrieval + LLM ranking
- Interactive graph roadmap + list view toggle
- 3 plan variants (best / cheapest / open-source)
- Shareable URL
- Export to Markdown + PDF + GitHub Issues
- 8–12 business workflow types in `workflow_modules`
- Orange theme throughout
- MIT license, public GitHub

**Out (explicitly deferred):**
- User accounts / auth
- Saved projects
- Team collaboration
- Community submissions / reviews
- Browser extension
- Enterprise features
- Linear export (Phase 2)

---

## 10. Phased Roadmap

**Phase 1 (MVP):** Core pipeline, 500–1500 tools, reliable roadmap generation, graph UI
**Phase 2:** Pricing verification, source citations, stale-tool detection, refresh jobs, Linear export
**Phase 3:** Vertical-specific ontologies, hidden-gem OSS discovery, benchmark cost data
