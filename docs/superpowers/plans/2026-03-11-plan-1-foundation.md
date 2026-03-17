# AI Tool Roadmapper — Plan 1: Foundation

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the monorepo, define the complete database schema with migrations, and implement the shared packages (scoring, schemas, db client) with full test coverage — so every downstream plan has a working foundation to build on.

**Architecture:** pnpm workspace + Turborepo monorepo. `packages/db` owns the Drizzle schema and Supabase client. `packages/schemas` owns all Zod types shared across services. `packages/scoring` is a pure function library with no external dependencies. `apps/web` is a bare Next.js 14 scaffold — UI is built in Plan 4.

**Tech Stack:** pnpm, Turborepo, Next.js 14, TypeScript, Drizzle ORM, Supabase, Zod, Vitest

---

## Chunk 1: Monorepo Scaffold

### Task 1: Initialize pnpm workspace

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `tsconfig.base.json`

- [ ] **Step 1: Initialize root package.json**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
cat > package.json << 'EOF'
{
  "name": "ai-tool-roadmapper",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0"
  }
}
EOF
```

- [ ] **Step 2: Create pnpm workspace config**

```bash
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
EOF
```

- [ ] **Step 3: Create turbo.json**

```bash
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
EOF
```

- [ ] **Step 4: Create base tsconfig**

```bash
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
EOF
```

- [ ] **Step 5: Create .gitignore**

```bash
cat > .gitignore << 'EOF'
node_modules/
.next/
dist/
.turbo/
.env
.env.local
.env*.local
*.tsbuildinfo
EOF
```

- [ ] **Step 6: Create .env.example**

```bash
cat > .env.example << 'EOF'
# OpenAI
OPENAI_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Inngest
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# Data Sources
PRODUCT_HUNT_API_TOKEN=
GITHUB_TOKEN=

# Postgres connection string (from Supabase project settings > Database > Connection string)
DATABASE_URL=
EOF
```

- [ ] **Step 7: Install root deps**

```bash
pnpm install
```

Expected: lockfile created, `node_modules` at root.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: initialize pnpm workspace + turborepo monorepo"
```

---

### Task 2: Create packages/schemas

**Files:**
- Create: `packages/schemas/package.json`
- Create: `packages/schemas/tsconfig.json`
- Create: `packages/schemas/src/tool.ts`
- Create: `packages/schemas/src/roadmap.ts`
- Create: `packages/schemas/src/workflow.ts`
- Create: `packages/schemas/src/enrichment.ts`
- Create: `packages/schemas/src/index.ts`
- Create: `packages/schemas/src/__tests__/schemas.test.ts`

- [ ] **Step 1: Scaffold package**

```bash
mkdir -p packages/schemas/src/__tests__
cat > packages/schemas/package.json << 'EOF'
{
  "name": "@roadmapper/schemas",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "typescript": "^5.7.0"
  }
}
EOF

cat > packages/schemas/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
EOF
```

- [ ] **Step 2: Write failing tests first (TDD)**

```bash
cat > packages/schemas/src/__tests__/schemas.test.ts << 'EOF'
import { describe, it, expect } from "vitest"
import {
  RoadmapInputSchema,
  EnrichmentOutputSchema,
  BusinessTypeSchema,
  BUSINESS_TYPES,
} from "../index"

describe("RoadmapInputSchema", () => {
  it("accepts valid input", () => {
    const result = RoadmapInputSchema.safeParse({
      idea: "An AI SDR tool for B2B SaaS companies",
      customer: "Sales teams",
      budget_monthly: 200,
      tech_level: "some-coding",
      preference: "best-overall",
    })
    expect(result.success).toBe(true)
  })

  it("rejects idea shorter than 10 chars", () => {
    const result = RoadmapInputSchema.safeParse({
      idea: "short",
      budget_monthly: 200,
      tech_level: "non-technical",
      preference: "cheapest",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid tech_level", () => {
    const result = RoadmapInputSchema.safeParse({
      idea: "A valid idea description here",
      budget_monthly: 100,
      tech_level: "expert",
      preference: "best-overall",
    })
    expect(result.success).toBe(false)
  })
})

describe("BusinessTypeSchema", () => {
  it("accepts all 12 business types", () => {
    for (const type of BUSINESS_TYPES) {
      expect(BusinessTypeSchema.safeParse(type).success).toBe(true)
    }
  })

  it("rejects unknown business type", () => {
    expect(BusinessTypeSchema.safeParse("ai_unknown").success).toBe(false)
  })
})

describe("EnrichmentOutputSchema", () => {
  it("accepts valid enrichment output", () => {
    const result = EnrichmentOutputSchema.safeParse({
      primary_category: "AI Sales",
      secondary_categories: ["CRM", "Outreach"],
      use_cases: ["lead generation", "email personalization"],
      target_personas: ["sales reps", "founders"],
      pricing_model: "seat",
      starting_price_monthly: 49,
      free_tier: false,
      has_api: true,
      self_hostable: false,
      integrations: ["Salesforce", "HubSpot"],
      best_for: ["B2B SaaS teams"],
      not_ideal_for: ["enterprise on-prem"],
    })
    expect(result.success).toBe(true)
  })

  it("accepts null starting_price_monthly", () => {
    const result = EnrichmentOutputSchema.safeParse({
      primary_category: "AI Coding",
      secondary_categories: [],
      use_cases: ["code completion"],
      target_personas: ["developers"],
      pricing_model: "open-source",
      starting_price_monthly: null,
      free_tier: true,
      has_api: false,
      self_hostable: true,
      integrations: [],
      best_for: ["solo developers"],
      not_ideal_for: [],
    })
    expect(result.success).toBe(true)
  })
})
EOF
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd packages/schemas && pnpm install && pnpm test
```

Expected: FAIL — "Cannot find module '../index'"

- [ ] **Step 4: Write tool schema**

```bash
cat > packages/schemas/src/tool.ts << 'EOF'
import { z } from "zod"

export const ToolSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  website_url: z.string().url().nullable(),
  logo_url: z.string().url().nullable(),
  short_description: z.string().nullable(),
  long_description: z.string().nullable(),
  github_url: z.string().url().nullable(),
  open_source: z.boolean().default(false),
  launch_date: z.string().nullable(), // ISO date string
  last_verified_at: z.string().datetime().nullable(),
  status_active: z.boolean().default(false),
  created_at: z.string().datetime(),
})

export const ToolRefSchema = z.object({
  tool_id: z.string().uuid(),
  name: z.string(),
  why: z.string(),
})

export const StagingToolSchema = z.object({
  id: z.string().uuid(),
  raw_data: z.record(z.unknown()),
  source: z.enum(["product_hunt", "github", "futurepedia", "taaft"]),
  source_id: z.string().nullable(),
  status: z.enum(["pending", "enriching", "enriched", "failed", "duplicate"]),
  error_message: z.string().nullable(),
  created_at: z.string().datetime(),
})

export type Tool = z.infer<typeof ToolSchema>
export type ToolRef = z.infer<typeof ToolRefSchema>
export type StagingTool = z.infer<typeof StagingToolSchema>
EOF
```

- [ ] **Step 6: Write enrichment schema**

```bash
cat > packages/schemas/src/enrichment.ts << 'EOF'
import { z } from "zod"

export const EnrichmentOutputSchema = z.object({
  primary_category: z.string(),
  secondary_categories: z.array(z.string()),
  use_cases: z.array(z.string()),
  target_personas: z.array(z.string()),
  pricing_model: z.enum(["seat", "usage", "flat", "open-source"]),
  starting_price_monthly: z.number().nullable(),
  free_tier: z.boolean(),
  has_api: z.boolean(),
  self_hostable: z.boolean(),
  integrations: z.array(z.string()),
  best_for: z.array(z.string()),
  not_ideal_for: z.array(z.string()),
})

export type EnrichmentOutput = z.infer<typeof EnrichmentOutputSchema>
EOF
```

- [ ] **Step 7: Write roadmap schema**

```bash
cat > packages/schemas/src/roadmap.ts << 'EOF'
import { z } from "zod"
import { ToolRefSchema } from "./tool"

export const WorkflowStageSchema = z.object({
  stage_name: z.string(),
  stage_order: z.number().int().positive(),
  best_overall_tool: ToolRefSchema,
  cheapest_tool: ToolRefSchema.nullable(),
  opensource_tool: ToolRefSchema.nullable(),
  why_chosen: z.string(),
  monthly_cost_estimate: z.number().nonnegative(),
  setup_difficulty: z.enum(["low", "medium", "high"]),
  lock_in_risk: z.enum(["low", "medium", "high"]),
  budget_constrained: z.boolean().default(false),
})

export const BuildSequenceItemSchema = z.object({
  week: z.number().int().positive(),
  focus: z.string(),
  tools: z.array(z.string()), // tool names (not IDs)
})

export const RoadmapResultSchema = z.object({
  business_type: z.string(),
  detected_business_type_confidence: z.number().min(0).max(1),
  workflow_stages: z.array(WorkflowStageSchema),
  total_monthly_cost_best_overall: z.number().nonnegative(),
  total_monthly_cost_cheapest: z.number().nonnegative(),
  build_sequence: z.array(BuildSequenceItemSchema),
})

export const RoadmapInputSchema = z.object({
  idea: z.string().min(10).max(500),
  customer: z.string().max(200).optional(),
  budget_monthly: z.number().nonnegative(),
  tech_level: z.enum(["non-technical", "some-coding", "full-stack"]),
  preference: z.enum(["best-overall", "cheapest", "open-source"]),
})

export const RoadmapRecordSchema = z.object({
  id: z.string().uuid(),
  short_id: z.string().length(8),
  input_idea: z.string(),
  input_customer: z.string().nullable(),
  input_budget_monthly: z.number().nullable(),
  input_tech_level: z.string().nullable(),
  input_preference: z.string().nullable(),
  result_json: RoadmapResultSchema.nullable(),
  status: z.enum(["generating", "complete", "failed"]),
  created_at: z.string().datetime(),
})

export type WorkflowStage = z.infer<typeof WorkflowStageSchema>
export type RoadmapResult = z.infer<typeof RoadmapResultSchema>
export type RoadmapInput = z.infer<typeof RoadmapInputSchema>
export type RoadmapRecord = z.infer<typeof RoadmapRecordSchema>
EOF
```

- [ ] **Step 8: Write workflow schema**

```bash
cat > packages/schemas/src/workflow.ts << 'EOF'
import { z } from "zod"

export const BUSINESS_TYPES = [
  "ai_sdr",
  "ai_customer_support",
  "ai_internal_search",
  "ai_content_ops",
  "ai_coding_assistant",
  "ai_research_tool",
  "ai_recruiting",
  "ai_data_enrichment",
  "ai_document_processing",
  "ai_voice_agent",
  "ai_ecommerce",
  "ai_analytics",
] as const

export const BusinessTypeSchema = z.enum(BUSINESS_TYPES)

export const WorkflowModuleSchema = z.object({
  id: z.string().uuid(),
  business_type: BusinessTypeSchema,
  stage: z.string(),
  module_name: z.string(),
  required_capabilities: z.array(z.string()),
  optional_capabilities: z.array(z.string()),
  typical_order: z.number().int().positive(),
  dependencies: z.array(z.string()),
  implementation_notes: z.string().nullable(),
})

export type BusinessType = z.infer<typeof BusinessTypeSchema>
export type WorkflowModule = z.infer<typeof WorkflowModuleSchema>
EOF
```

- [ ] **Step 9: Write index.ts**

```bash
cat > packages/schemas/src/index.ts << 'EOF'
export * from "./tool"
export * from "./enrichment"
export * from "./roadmap"
export * from "./workflow"
EOF
```

- [ ] **Step 10: Run tests to verify they now pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 11: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add packages/schemas/
git commit -m "feat: add @roadmapper/schemas package with Zod types"
```

---

## Chunk 2: Scoring Package + DB Package

### Task 3: Create packages/scoring

**Files:**
- Create: `packages/scoring/package.json`
- Create: `packages/scoring/tsconfig.json`
- Create: `packages/scoring/src/formulas.ts`
- Create: `packages/scoring/src/index.ts`
- Create: `packages/scoring/src/__tests__/scoring.test.ts`

- [ ] **Step 1: Scaffold package**

```bash
mkdir -p packages/scoring/src/__tests__
cat > packages/scoring/package.json << 'EOF'
{
  "name": "@roadmapper/scoring",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "typescript": "^5.7.0"
  }
}
EOF

cat > packages/scoring/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
EOF
```

- [ ] **Step 2: Write the failing tests first (TDD)**

```bash
cat > packages/scoring/src/__tests__/scoring.test.ts << 'EOF'
import { describe, it, expect } from "vitest"
import {
  freshnessScore,
  popularityScore,
  maintenanceScore,
  trustScore,
  isStatusActive,
} from "../formulas"

const TODAY = new Date("2026-03-11")

describe("freshnessScore", () => {
  it("returns 1.0 for a tool launched today", () => {
    expect(freshnessScore("2026-03-11", TODAY)).toBe(1.0)
  })

  it("returns 0.5 for a tool launched 365 days ago", () => {
    const score = freshnessScore("2025-03-11", TODAY)
    expect(score).toBeCloseTo(0.5, 2)
  })

  it("returns 0.0 for a tool launched 730+ days ago", () => {
    expect(freshnessScore("2024-03-11", TODAY)).toBe(0.0)
  })

  it("returns 0.0 for null launch_date", () => {
    expect(freshnessScore(null, TODAY)).toBe(0.0)
  })
})

describe("popularityScore", () => {
  it("returns 1.0 for a tool with max signals", () => {
    const score = popularityScore({ githubStars: 5000, phVotes: 1000, sourceCount: 3 })
    expect(score).toBe(1.0)
  })

  it("caps github component at 1.0 above 5000 stars", () => {
    const capped = popularityScore({ githubStars: 10000, phVotes: 0, sourceCount: 1 })
    const notCapped = popularityScore({ githubStars: 5000, phVotes: 0, sourceCount: 1 })
    expect(capped).toBe(notCapped)
  })

  it("returns 0.0 for a tool with no signals", () => {
    expect(popularityScore({ githubStars: 0, phVotes: 0, sourceCount: 0 })).toBe(0.0)
  })

  it("correctly weights github (0.5), ph (0.3), source (0.2)", () => {
    // Only github_stars: 2500/5000 = 0.5 * 0.5 = 0.25
    const score = popularityScore({ githubStars: 2500, phVotes: 0, sourceCount: 0 })
    expect(score).toBeCloseTo(0.25, 4)
  })
})

describe("maintenanceScore", () => {
  it("returns 0.7 for closed-source tool (null last_commit)", () => {
    expect(maintenanceScore(null, false)).toBe(0.7)
  })

  it("returns 1.0 for open-source tool committed today", () => {
    expect(maintenanceScore("2026-03-11", true, TODAY)).toBe(1.0)
  })

  it("returns 0.5 for open-source tool with last commit 182 days ago", () => {
    const score = maintenanceScore("2025-09-10", true, TODAY)
    expect(score).toBeCloseTo(0.5, 1)
  })

  it("returns 0.0 for open-source tool not committed in 365+ days", () => {
    expect(maintenanceScore("2025-03-11", true, TODAY)).toBe(0.0)
  })

  it("returns 0.7 for open-source tool with no commit date (unknown maintenance, treated as closed-source default)", () => {
    // open-source but no commit date — same as closed-source default to avoid penalizing newly discovered repos
    expect(maintenanceScore(null, true)).toBe(0.7)
  })
})

describe("trustScore", () => {
  it("returns correct weighted composite", () => {
    // freshness=1.0, popularity=1.0, maintenance=1.0, sourceComponent=1.0
    const score = trustScore({
      freshnessScore: 1.0,
      popularityScore: 1.0,
      maintenanceScore: 1.0,
      sourceComponent: 1.0,
    })
    expect(score).toBeCloseTo(1.0, 4)
  })

  it("weights are 0.2 + 0.4 + 0.3 + 0.1 = 1.0", () => {
    const score = trustScore({
      freshnessScore: 0,
      popularityScore: 0,
      maintenanceScore: 0,
      sourceComponent: 0,
    })
    expect(score).toBe(0.0)
  })
})

describe("isStatusActive", () => {
  it("returns true for trust score >= 0.35", () => {
    expect(isStatusActive(0.35)).toBe(true)
    expect(isStatusActive(0.9)).toBe(true)
  })

  it("returns false for trust score < 0.35", () => {
    expect(isStatusActive(0.34)).toBe(false)
    expect(isStatusActive(0.0)).toBe(false)
  })
})
EOF
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd packages/scoring && pnpm install && pnpm test
```

Expected: FAIL — "Cannot find module '../formulas'"

- [ ] **Step 4: Implement formulas**

```bash
cat > packages/scoring/src/formulas.ts << 'EOF'
const STATUS_ACTIVE_THRESHOLD = 0.35

export function freshnessScore(launchDate: string | null, today: Date = new Date()): number {
  if (!launchDate) return 0.0
  const launch = new Date(launchDate)
  const daysSince = (today.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, 1 - daysSince / 730)
}

export function popularityScore(signals: {
  githubStars: number
  phVotes: number
  sourceCount: number
}): number {
  const githubComponent = Math.min(signals.githubStars / 5000, 1.0)
  const phComponent = Math.min(signals.phVotes / 1000, 1.0)
  const sourceComponent = Math.min(signals.sourceCount / 3, 1.0)
  return githubComponent * 0.5 + phComponent * 0.3 + sourceComponent * 0.2
}

export function sourceComponent(sourceCount: number): number {
  return Math.min(sourceCount / 3, 1.0)
}

export function maintenanceScore(
  lastCommit: string | null,
  isOpenSource: boolean,
  today: Date = new Date()
): number {
  if (!isOpenSource || !lastCommit) return 0.7
  const commit = new Date(lastCommit)
  const daysSince = (today.getTime() - commit.getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, 1 - daysSince / 365)
}

export function trustScore(scores: {
  freshnessScore: number
  popularityScore: number
  maintenanceScore: number
  sourceComponent: number
}): number {
  return (
    scores.freshnessScore * 0.2 +
    scores.popularityScore * 0.4 +
    scores.maintenanceScore * 0.3 +
    scores.sourceComponent * 0.1
  )
}

export function isStatusActive(trust: number): boolean {
  return trust >= STATUS_ACTIVE_THRESHOLD
}
EOF
```

- [ ] **Step 5: Write index.ts**

```bash
cat > packages/scoring/src/index.ts << 'EOF'
export {
  freshnessScore,
  popularityScore,
  sourceComponent,
  maintenanceScore,
  trustScore,
  isStatusActive,
} from "./formulas"
EOF
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all 12 tests pass.

- [ ] **Step 7: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add packages/scoring/
git commit -m "feat: add @roadmapper/scoring package with TDD scoring formulas"
```

---

### Task 4: Create packages/prompts

**Files:**
- Create: `packages/prompts/package.json`
- Create: `packages/prompts/tsconfig.json`
- Create: `packages/prompts/src/chat-system-prompt.ts`
- Create: `packages/prompts/src/enrichment-prompt.ts`
- Create: `packages/prompts/src/business-type-prompt.ts`
- Create: `packages/prompts/src/planner-prompt.ts`
- Create: `packages/prompts/src/index.ts`

- [ ] **Step 1: Scaffold package**

```bash
mkdir -p packages/prompts/src
cat > packages/prompts/package.json << 'EOF'
{
  "name": "@roadmapper/prompts",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@roadmapper/schemas": "workspace:*"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "typescript": "^5.7.0"
  }
}
EOF

cat > packages/prompts/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
EOF
```

- [ ] **Step 2: Write chat system prompt**

```bash
cat > packages/prompts/src/chat-system-prompt.ts << 'EOF'
export const CHAT_SYSTEM_PROMPT = `You are an AI stack advisor helping founders figure out what tools to use to build their startup idea. Your job is to collect 4 pieces of information through natural conversation, then signal that you are ready to generate a roadmap.

## Conversation Flow

Turn 1 (user gives idea): Acknowledge their idea enthusiastically in 1-2 sentences. Then ask: "Who is your target customer, and roughly what's your monthly budget for tools — are you thinking under $50, around $100-200, or $500+?"

Turn 2 (user answers budget/customer): Confirm what you heard. Then ask: "Last question — how technical are you or your team? Non-technical (no coding), some coding (can follow tutorials), or full-stack developer?"

Turn 3 (user answers tech level): Confirm. Then ask: "And would you prefer the best overall tools for the job, the most budget-friendly stack, or to lean on open-source tools where possible?"

Turn 4 (user answers preference): Say "Perfect, I have everything I need. Generating your roadmap now..."

Then IMMEDIATELY emit a data signal (do not include any other text after that last message).

## Rules
- One question per turn maximum
- Be warm and concise — this is a founder who is excited about their idea
- If the user provides incomplete info, make a reasonable assumption and proceed rather than asking again
- Do not mention tools, tech stacks, or recommendations during the conversation — save it all for the roadmap
- Maximum 6 messages total before forcing generation with best-effort interpretation of inputs
`

export const CHAT_INPUTS_COMPLETE_SIGNAL = "inputs_complete"
EOF
```

- [ ] **Step 3: Write enrichment prompt**

```bash
cat > packages/prompts/src/enrichment-prompt.ts << 'EOF'
export function buildEnrichmentPrompt(toolData: {
  name: string
  description: string
  homepageHtml: string
  pricingHtml: string | null
  githubReadme: string | null
}): string {
  return `You are classifying an AI tool for a directory. Extract structured information from the provided content.

Tool name: ${toolData.name}
Description: ${toolData.description}

Homepage content (truncated):
${toolData.homepageHtml.slice(0, 3000)}

${toolData.pricingHtml ? `Pricing page content:\n${toolData.pricingHtml.slice(0, 2000)}` : "No pricing page available."}

${toolData.githubReadme ? `GitHub README (truncated):\n${toolData.githubReadme.slice(0, 2000)}` : ""}

Extract the following information and respond with valid JSON matching the schema exactly. Be conservative — only state things you can verify from the content.`
}
EOF
```

- [ ] **Step 4: Write business type prompt**

```bash
cat > packages/prompts/src/business-type-prompt.ts << 'EOF'
import { BUSINESS_TYPES } from "@roadmapper/schemas"

export function buildBusinessTypePrompt(idea: string, customer: string): string {
  return `Classify this startup idea into exactly one of the following business types.

Startup idea: "${idea}"
Target customer: "${customer}"

Business types:
${BUSINESS_TYPES.map((t) => `- ${t}`).join("\n")}

Respond with JSON: { "business_type": "<one of the above>", "confidence": <0.0-1.0> }`
}
EOF
```

- [ ] **Step 5: Write planner prompt**

```bash
cat > packages/prompts/src/planner-prompt.ts << 'EOF'
export function buildPlannerPrompt(params: {
  idea: string
  customer: string
  budgetMonthly: number
  techLevel: string
  preference: string
  businessType: string
  candidatesByStage: Record<string, Array<{ tool_id: string; name: string; short_description: string; monthly_cost: number | null; free_tier: boolean; open_source: boolean }>>
}): string {
  const stagesJson = JSON.stringify(params.candidatesByStage, null, 2)

  return `You are building a roadmap for an AI startup. Select the best tools from the provided candidates for each workflow stage.

## Startup Context
Idea: ${params.idea}
Target customer: ${params.customer}
Monthly budget: $${params.budgetMonthly}
Technical level: ${params.techLevel}
Preference: ${params.preference}
Business type: ${params.businessType}

## Candidate Tools by Stage
${stagesJson}

## Instructions
- For each stage, select tools from the candidates list ONLY — do not invent tool names
- Choose best_overall_tool based on quality/fit
- Choose cheapest_tool as the lowest-cost option (null if best_overall is already free)
- Choose opensource_tool as a self-hostable option (null if none in candidates)
- Set budget_constrained to true if the cheapest available tool exceeds the user's budget cap for that stage
- build_sequence: group stages into weeks (max 2 stages per week), tools array should contain best_overall_tool names
- Respond with valid JSON matching the RoadmapResult schema exactly`
}
EOF
```

- [ ] **Step 6: Write index.ts**

```bash
cat > packages/prompts/src/index.ts << 'EOF'
export * from "./chat-system-prompt"
export * from "./enrichment-prompt"
export * from "./business-type-prompt"
export * from "./planner-prompt"
EOF
```

- [ ] **Step 7: Install and build**

```bash
cd packages/prompts && pnpm install && pnpm build
```

- [ ] **Step 8: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add packages/prompts/
git commit -m "feat: add @roadmapper/prompts package with LLM prompt templates"
```

---

## Chunk 3: Database Package + Migrations

### Task 5: Create packages/db

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/supabase/migrations/0001_initial.sql`
- Create: `packages/db/supabase/migrations/0002_workflow_modules_seed.sql`

- [ ] **Step 1: Scaffold package**

```bash
mkdir -p packages/db/src packages/db/supabase/migrations
cat > packages/db/package.json << 'EOF'
{
  "name": "@roadmapper/db",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.46.0",
    "drizzle-orm": "^0.36.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "drizzle-kit": "^0.28.0"
  }
}
EOF

cat > packages/db/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
EOF
```

- [ ] **Step 2: Write Drizzle schema**

```bash
cat > packages/db/src/schema.ts << 'EOF'
import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  jsonb,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// pgvector type (raw SQL until drizzle-orm ships native support)
const vector = (name: string) =>
  text(name) // stored as text in schema, pgvector handles the actual type via raw SQL migrations

export const tools = pgTable(
  "tools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    website_url: text("website_url"),
    logo_url: text("logo_url"),
    short_description: text("short_description"),
    long_description: text("long_description"),
    github_url: text("github_url"),
    open_source: boolean("open_source").default(false),
    launch_date: date("launch_date"),
    last_verified_at: timestamp("last_verified_at", { withTimezone: true }),
    status_active: boolean("status_active").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({ slugIdx: index("tools_slug_idx").on(t.slug) })
)

export const toolMetadata = pgTable("tool_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  categories: text("categories").array(),
  use_cases: text("use_cases").array(),
  target_personas: text("target_personas").array(),
  business_stages: text("business_stages").array(),
  api_available: boolean("api_available"),
  self_hostable: boolean("self_hostable"),
  enterprise_ready: boolean("enterprise_ready"),
  input_types: text("input_types").array(),
  output_types: text("output_types").array(),
  integrations: text("integrations").array(),
})

export const toolPricing = pgTable("tool_pricing", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  free_tier: boolean("free_tier"),
  starting_price_monthly: numeric("starting_price_monthly"),
  pricing_model: text("pricing_model"),
  est_cost_5_users: numeric("est_cost_5_users"),
  est_cost_20_users: numeric("est_cost_20_users"),
  hidden_cost_notes: text("hidden_cost_notes"),
})

export const toolSignals = pgTable("tool_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  github_stars: integer("github_stars"),
  github_last_commit: date("github_last_commit"),
  producthunt_votes: integer("producthunt_votes"),
  source_count: integer("source_count"),
  freshness_score: numeric("freshness_score"),
  popularity_score: numeric("popularity_score"),
  maintenance_score: numeric("maintenance_score"),
  trust_score: numeric("trust_score"),
  last_computed_at: timestamp("last_computed_at", { withTimezone: true }),
})

export const toolAlternatives = pgTable("tool_alternatives", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  alternative_tool_id: uuid("alternative_tool_id").references(() => tools.id, {
    onDelete: "cascade",
  }),
  reason: text("reason"),
  cheaper: boolean("cheaper"),
  better_for_nontechnical: boolean("better_for_nontechnical"),
  better_for_enterprise: boolean("better_for_enterprise"),
})

export const stagingTools = pgTable("staging_tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  raw_data: jsonb("raw_data").notNull(),
  source: text("source").notNull(),
  source_id: text("source_id"),
  status: text("status").notNull().default("pending"),
  error_message: text("error_message"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export const workflowModules = pgTable("workflow_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  business_type: text("business_type").notNull(),
  stage: text("stage").notNull(),
  module_name: text("module_name").notNull(),
  required_capabilities: text("required_capabilities").array(),
  optional_capabilities: text("optional_capabilities").array(),
  typical_order: integer("typical_order"),
  dependencies: text("dependencies").array(),
  implementation_notes: text("implementation_notes"),
})

export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  short_id: text("short_id").unique().notNull(),
  input_idea: text("input_idea").notNull(),
  input_customer: text("input_customer"),
  input_budget_monthly: numeric("input_budget_monthly"),
  input_tech_level: text("input_tech_level"),
  input_preference: text("input_preference"),
  result_json: jsonb("result_json"),
  status: text("status").default("generating"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
})
EOF
```

- [ ] **Step 3: Write Supabase client**

```bash
cat > packages/db/src/client.ts << 'EOF'
import { createClient } from "@supabase/supabase-js"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Server-side Supabase client (uses service role key — bypasses RLS)
export function createServerClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, key)
}

// Drizzle client for type-safe queries
export function createDrizzleClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("Missing DATABASE_URL")
  const client = postgres(connectionString)
  return drizzle(client, { schema })
}

export * from "./schema"
EOF
```

- [ ] **Step 4: Write index.ts**

```bash
cat > packages/db/src/index.ts << 'EOF'
export * from "./schema"
export * from "./client"
EOF
```

- [ ] **Step 5: Write initial SQL migration**

```bash
cat > packages/db/supabase/migrations/0001_initial.sql << 'EOF'
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- tools
CREATE TABLE tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  website_url text,
  logo_url text,
  short_description text,
  long_description text,
  github_url text,
  open_source boolean DEFAULT false,
  launch_date date,
  last_verified_at timestamptz,
  status_active boolean DEFAULT false,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX tools_slug_idx ON tools(slug);
CREATE INDEX tools_status_active_idx ON tools(status_active);
CREATE INDEX tools_embedding_idx ON tools USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- tool_metadata
CREATE TABLE tool_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  categories text[],
  use_cases text[],
  target_personas text[],
  business_stages text[],
  api_available boolean,
  self_hostable boolean,
  enterprise_ready boolean,
  input_types text[],
  output_types text[],
  integrations text[]
);

-- tool_pricing
CREATE TABLE tool_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  free_tier boolean,
  starting_price_monthly numeric,
  pricing_model text,
  est_cost_5_users numeric,
  est_cost_20_users numeric,
  hidden_cost_notes text
);

-- tool_signals
CREATE TABLE tool_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  github_stars integer,
  github_last_commit date,
  producthunt_votes integer,
  source_count integer DEFAULT 0,
  freshness_score numeric,
  popularity_score numeric,
  maintenance_score numeric,
  trust_score numeric,
  last_computed_at timestamptz
);

-- tool_alternatives
CREATE TABLE tool_alternatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  alternative_tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  reason text,
  cheaper boolean,
  better_for_nontechnical boolean,
  better_for_enterprise boolean
);

-- staging_tools
CREATE TABLE staging_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_data jsonb NOT NULL,
  source text NOT NULL,
  source_id text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX staging_tools_status_idx ON staging_tools(status);
CREATE INDEX staging_tools_source_idx ON staging_tools(source);

-- workflow_modules
CREATE TABLE workflow_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type text NOT NULL,
  stage text NOT NULL,
  module_name text NOT NULL,
  required_capabilities text[],
  optional_capabilities text[],
  typical_order integer,
  dependencies text[],
  implementation_notes text
);

CREATE INDEX workflow_modules_business_type_idx ON workflow_modules(business_type);

-- roadmaps
CREATE TABLE roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id text UNIQUE NOT NULL,
  input_idea text NOT NULL,
  input_customer text,
  input_budget_monthly numeric,
  input_tech_level text,
  input_preference text,
  result_json jsonb,
  status text DEFAULT 'generating',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX roadmaps_short_id_idx ON roadmaps(short_id);
EOF
```

- [ ] **Step 6: Write workflow modules seed migration**

```bash
cat > packages/db/supabase/migrations/0002_workflow_modules_seed.sql << 'EOF'
-- Seed workflow modules for all 12 business types
-- ai_sdr
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_sdr', 'discovery', 'lead_sourcing', ARRAY['prospect_discovery', 'company_search'], ARRAY['technographic_filtering', 'intent_signals'], 1, ARRAY[]::text[], 'Find and identify target prospects'),
('ai_sdr', 'enrichment', 'lead_enrichment', ARRAY['contact_enrichment', 'email_lookup'], ARRAY['linkedin_data', 'firmographic_data'], 2, ARRAY['lead_sourcing'], 'Enrich lead records with contact data'),
('ai_sdr', 'qualification', 'lead_scoring', ARRAY['ai_scoring'], ARRAY['crm_integration', 'intent_signals'], 3, ARRAY['lead_enrichment'], 'Score and prioritize leads by fit'),
('ai_sdr', 'outreach', 'email_sequencing', ARRAY['email_automation', 'ai_personalization'], ARRAY['multi_channel', 'a_b_testing'], 4, ARRAY['lead_scoring'], 'Automated personalized outreach'),
('ai_sdr', 'conversation', 'call_analysis', ARRAY['call_recording', 'ai_transcription'], ARRAY['sentiment_analysis', 'coaching'], 5, ARRAY[]::text[], 'Record and analyze sales calls'),
('ai_sdr', 'operations', 'crm_sync', ARRAY['crm_integration', 'webhook'], ARRAY['bi_directional_sync', 'auto_logging'], 6, ARRAY['lead_scoring'], 'Sync all activity to CRM'),
('ai_sdr', 'reporting', 'analytics', ARRAY['analytics_dashboard'], ARRAY['revenue_attribution', 'forecasting'], 7, ARRAY['crm_sync'], 'Pipeline visibility and reporting');

-- ai_customer_support
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_customer_support', 'intake', 'ticket_intake', ARRAY['multi_channel_support', 'ticket_creation'], ARRAY['email_parsing', 'web_widget'], 1, ARRAY[]::text[], 'Receive support requests from all channels'),
('ai_customer_support', 'resolution', 'ai_response', ARRAY['llm_chat', 'knowledge_base'], ARRAY['auto_resolution', 'escalation_rules'], 2, ARRAY['ticket_intake'], 'AI-powered first response and resolution'),
('ai_customer_support', 'knowledge', 'knowledge_management', ARRAY['knowledge_base', 'doc_search'], ARRAY['auto_article_generation', 'gap_detection'], 3, ARRAY[]::text[], 'Maintain self-serve knowledge base'),
('ai_customer_support', 'routing', 'smart_routing', ARRAY['intent_classification', 'agent_routing'], ARRAY['skill_based_routing', 'priority_scoring'], 4, ARRAY['ticket_intake'], 'Route complex tickets to right agents'),
('ai_customer_support', 'analytics', 'support_analytics', ARRAY['analytics_dashboard', 'csat_tracking'], ARRAY['sentiment_trend', 'deflection_rate'], 5, ARRAY['ai_response'], 'Track resolution rates and customer satisfaction');

-- ai_content_ops
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_content_ops', 'strategy', 'topic_research', ARRAY['keyword_research', 'topic_ideation'], ARRAY['competitor_analysis', 'trend_detection'], 1, ARRAY[]::text[], 'Identify what content to create'),
('ai_content_ops', 'creation', 'ai_writing', ARRAY['ai_text_generation', 'long_form_content'], ARRAY['brand_voice_tuning', 'multi_format'], 2, ARRAY['topic_research'], 'Generate first drafts at scale'),
('ai_content_ops', 'assets', 'image_generation', ARRAY['ai_image_generation'], ARRAY['brand_kit', 'batch_generation'], 3, ARRAY['ai_writing'], 'Generate images and visual assets'),
('ai_content_ops', 'optimization', 'seo_optimization', ARRAY['seo_analysis', 'on_page_optimization'], ARRAY['internal_linking', 'schema_markup'], 4, ARRAY['ai_writing'], 'Optimize content for search'),
('ai_content_ops', 'distribution', 'publishing', ARRAY['cms_integration', 'scheduling'], ARRAY['social_distribution', 'newsletter'], 5, ARRAY['seo_optimization'], 'Publish and distribute content'),
('ai_content_ops', 'measurement', 'content_analytics', ARRAY['analytics_dashboard', 'rank_tracking'], ARRAY['attribution', 'content_roi'], 6, ARRAY['publishing'], 'Track content performance');

-- ai_coding_assistant
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_coding_assistant', 'development', 'code_completion', ARRAY['ai_code_completion', 'ide_integration'], ARRAY['multi_language', 'context_awareness'], 1, ARRAY[]::text[], 'AI-powered code completion in IDE'),
('ai_coding_assistant', 'review', 'code_review', ARRAY['automated_code_review', 'pr_integration'], ARRAY['security_scanning', 'style_enforcement'], 2, ARRAY['code_completion'], 'Automated PR review and feedback'),
('ai_coding_assistant', 'testing', 'test_generation', ARRAY['ai_test_generation', 'coverage_analysis'], ARRAY['e2e_generation', 'test_maintenance'], 3, ARRAY['code_completion'], 'Generate and maintain test suites'),
('ai_coding_assistant', 'documentation', 'doc_generation', ARRAY['code_documentation', 'readme_generation'], ARRAY['api_docs', 'changelog_generation'], 4, ARRAY['code_completion'], 'Auto-generate code documentation'),
('ai_coding_assistant', 'deployment', 'ci_cd', ARRAY['ci_cd_pipeline', 'deployment_automation'], ARRAY['preview_deploys', 'rollback'], 5, ARRAY['test_generation'], 'Automated build and deployment');

-- ai_research_tool
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_research_tool', 'ingestion', 'document_ingestion', ARRAY['document_parsing', 'pdf_extraction'], ARRAY['web_crawling', 'batch_upload'], 1, ARRAY[]::text[], 'Ingest documents and sources'),
('ai_research_tool', 'search', 'semantic_search', ARRAY['vector_search', 'hybrid_search'], ARRAY['citation_linking', 'relevance_tuning'], 2, ARRAY['document_ingestion'], 'Search across ingested knowledge'),
('ai_research_tool', 'synthesis', 'ai_summarization', ARRAY['llm_summarization', 'key_point_extraction'], ARRAY['multi_doc_synthesis', 'structured_output'], 3, ARRAY['semantic_search'], 'Summarize and synthesize findings'),
('ai_research_tool', 'output', 'report_generation', ARRAY['structured_output', 'export'], ARRAY['citation_formatting', 'template_support'], 4, ARRAY['ai_summarization'], 'Generate structured research reports');

-- ai_recruiting
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_recruiting', 'sourcing', 'candidate_sourcing', ARRAY['talent_search', 'linkedin_sourcing'], ARRAY['passive_candidate_id', 'boolean_search'], 1, ARRAY[]::text[], 'Find qualified candidates'),
('ai_recruiting', 'screening', 'resume_screening', ARRAY['resume_parsing', 'ai_scoring'], ARRAY['skills_matching', 'culture_fit'], 2, ARRAY['candidate_sourcing'], 'Screen and score applicants'),
('ai_recruiting', 'outreach', 'candidate_outreach', ARRAY['email_automation', 'personalization'], ARRAY['multi_channel', 'response_tracking'], 3, ARRAY['resume_screening'], 'Automated personalized outreach'),
('ai_recruiting', 'assessment', 'skills_assessment', ARRAY['technical_assessment', 'structured_interview'], ARRAY['coding_challenge', 'async_video'], 4, ARRAY['candidate_outreach'], 'Evaluate candidate skills'),
('ai_recruiting', 'operations', 'ats_sync', ARRAY['ats_integration', 'pipeline_management'], ARRAY['offer_management', 'onboarding'], 5, ARRAY['skills_assessment'], 'Track candidates through pipeline');

-- ai_data_enrichment
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_data_enrichment', 'ingestion', 'data_ingestion', ARRAY['csv_import', 'crm_sync', 'api_input'], ARRAY['batch_processing', 'streaming'], 1, ARRAY[]::text[], 'Ingest raw contact or company lists'),
('ai_data_enrichment', 'enrichment', 'contact_enrichment', ARRAY['email_lookup', 'phone_lookup', 'company_data'], ARRAY['social_profiles', 'technographics'], 2, ARRAY['data_ingestion'], 'Enrich records with contact data'),
('ai_data_enrichment', 'validation', 'data_validation', ARRAY['email_verification', 'deduplication'], ARRAY['phone_validation', 'data_health_score'], 3, ARRAY['contact_enrichment'], 'Validate and deduplicate records'),
('ai_data_enrichment', 'output', 'crm_export', ARRAY['crm_integration', 'csv_export'], ARRAY['bi_directional_sync', 'webhook'], 4, ARRAY['data_validation'], 'Export enriched data to destination');

-- ai_document_processing
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_document_processing', 'intake', 'document_intake', ARRAY['pdf_parsing', 'ocr'], ARRAY['batch_upload', 'email_ingestion'], 1, ARRAY[]::text[], 'Receive and parse documents'),
('ai_document_processing', 'extraction', 'data_extraction', ARRAY['structured_extraction', 'llm_extraction'], ARRAY['custom_fields', 'table_extraction'], 2, ARRAY['document_intake'], 'Extract structured data from docs'),
('ai_document_processing', 'classification', 'document_classification', ARRAY['ai_classification'], ARRAY['confidence_scoring', 'human_review_queue'], 3, ARRAY['document_intake'], 'Classify document types'),
('ai_document_processing', 'output', 'output_integration', ARRAY['api_output', 'webhook', 'export'], ARRAY['crm_sync', 'erp_sync'], 4, ARRAY['data_extraction'], 'Send structured data to downstream systems');

-- ai_voice_agent
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_voice_agent', 'telephony', 'call_infrastructure', ARRAY['sip_integration', 'phone_number_provisioning'], ARRAY['call_routing', 'ivr'], 1, ARRAY[]::text[], 'Phone number and call routing setup'),
('ai_voice_agent', 'conversation', 'conversational_ai', ARRAY['llm_voice', 'asr', 'tts'], ARRAY['latency_optimization', 'multi_language'], 2, ARRAY['call_infrastructure'], 'AI conversation engine for calls'),
('ai_voice_agent', 'knowledge', 'knowledge_base', ARRAY['knowledge_retrieval', 'faq_management'], ARRAY['real_time_lookup', 'crm_lookup'], 3, ARRAY['conversational_ai'], 'Knowledge the agent can access during calls'),
('ai_voice_agent', 'escalation', 'human_handoff', ARRAY['warm_transfer', 'call_summary'], ARRAY['sentiment_triggered', 'skill_based_routing'], 4, ARRAY['conversational_ai'], 'Hand off to human agent when needed'),
('ai_voice_agent', 'analytics', 'call_analytics', ARRAY['call_recording', 'transcript_analysis'], ARRAY['intent_tracking', 'conversion_attribution'], 5, ARRAY['conversational_ai'], 'Analyze call outcomes and quality');

-- ai_ecommerce
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_ecommerce', 'discovery', 'product_recommendations', ARRAY['recommendation_engine', 'personalization'], ARRAY['visual_search', 'cross_sell'], 1, ARRAY[]::text[], 'Personalized product recommendations'),
('ai_ecommerce', 'search', 'ai_search', ARRAY['semantic_search', 'natural_language_search'], ARRAY['voice_search', 'typo_tolerance'], 2, ARRAY[]::text[], 'AI-powered product search'),
('ai_ecommerce', 'support', 'customer_support', ARRAY['ai_chat', 'order_lookup'], ARRAY['returns_automation', 'live_handoff'], 3, ARRAY[]::text[], 'AI support for order and product questions'),
('ai_ecommerce', 'marketing', 'email_personalization', ARRAY['email_automation', 'segmentation'], ARRAY['browse_abandonment', 'dynamic_content'], 4, ARRAY['product_recommendations'], 'Personalized email marketing'),
('ai_ecommerce', 'analytics', 'ecommerce_analytics', ARRAY['revenue_analytics', 'attribution'], ARRAY['clv_prediction', 'churn_prediction'], 5, ARRAY['email_personalization'], 'Revenue and customer analytics');

-- ai_analytics
INSERT INTO workflow_modules (business_type, stage, module_name, required_capabilities, optional_capabilities, typical_order, dependencies, implementation_notes) VALUES
('ai_analytics', 'collection', 'data_collection', ARRAY['event_tracking', 'api_connectors'], ARRAY['sdk_integration', 'server_side_tracking'], 1, ARRAY[]::text[], 'Collect data from all sources'),
('ai_analytics', 'storage', 'data_warehouse', ARRAY['data_storage', 'query_engine'], ARRAY['real_time_ingestion', 'data_lake'], 2, ARRAY['data_collection'], 'Store and query analytics data'),
('ai_analytics', 'transformation', 'data_modeling', ARRAY['sql_transformation', 'data_modeling'], ARRAY['dbt_support', 'lineage_tracking'], 3, ARRAY['data_warehouse'], 'Model and transform raw data'),
('ai_analytics', 'visualization', 'dashboards', ARRAY['dashboard_builder', 'chart_library'], ARRAY['embedded_analytics', 'white_label'], 4, ARRAY['data_modeling'], 'Build and share dashboards'),
('ai_analytics', 'intelligence', 'ai_insights', ARRAY['anomaly_detection', 'natural_language_query'], ARRAY['predictive_analytics', 'auto_insights'], 5, ARRAY['dashboards'], 'AI-generated insights and alerts');
EOF
```

- [ ] **Step 7: Install deps**

```bash
cd packages/db && pnpm install
```

- [ ] **Step 8: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add packages/db/
git commit -m "feat: add @roadmapper/db package with Drizzle schema and SQL migrations"
```

---

## Chunk 4: Next.js App Scaffold + CI

### Task 6: Scaffold apps/web

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx` (placeholder)

- [ ] **Step 1: Create Next.js app**

```bash
mkdir -p /Users/nolanselby/ai-tool-roadmapper/apps/web/app
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/package.json << 'EOF'
{
  "name": "@roadmapper/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "14.2.20",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "ai": "^4.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "nanoid": "^5.0.0",
    "@supabase/supabase-js": "^2.46.0",
    "inngest": "^3.22.0",
    "@inngest/middleware-encryption": "^0.0.2",
    "reactflow": "^12.0.0",
    "@roadmapper/db": "workspace:*",
    "@roadmapper/schemas": "workspace:*",
    "@roadmapper/scoring": "workspace:*",
    "@roadmapper/prompts": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
EOF
```

- [ ] **Step 2: Create tsconfig.json**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
```

- [ ] **Step 3: Create next.config.ts**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/next.config.ts << 'EOF'
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@roadmapper/db",
    "@roadmapper/schemas",
    "@roadmapper/scoring",
    "@roadmapper/prompts",
  ],
}

export default nextConfig
EOF
```

- [ ] **Step 4: Create Tailwind config**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        brand: {
          DEFAULT: "#f97316",
          dark: "#ea580c",
        },
      },
    },
  },
  plugins: [],
}

export default config
EOF
```

- [ ] **Step 5: Create root layout**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/app/layout.tsx << 'EOF'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Tool Roadmapper",
  description: "Tell us what you want to build. Get an AI tool stack and roadmap.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF

cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
```

- [ ] **Step 6: Create placeholder landing page**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/app/page.tsx << 'EOF'
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-500">AI Tool Roadmapper</h1>
        <p className="mt-4 text-gray-600">Coming soon — chat UI built in Plan 4</p>
      </div>
    </main>
  )
}
EOF
```

- [ ] **Step 7: Install deps**

```bash
cd apps/web && pnpm install
```

- [ ] **Step 8: Verify build**

```bash
pnpm build
```

Expected: Next.js build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add apps/web/
git commit -m "feat: scaffold Next.js app with orange brand theme"
```

---

### Task 7: Set up GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write CI workflow**

```bash
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test
EOF
```

- [ ] **Step 2: Write deploy workflow**

```bash
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Deploy to Hosting Provider
        uses: amondnet/hosting-provider-action@v25
        with:
          hosting-provider-token: ${{ secrets.HOSTING_TOKEN }}
          hosting-provider-org-id: ${{ secrets.HOSTING_ORG_ID }}
          hosting-provider-project-id: ${{ secrets.HOSTING_PROJECT_ID }}
          hosting-provider-args: "--prod"
          working-directory: apps/web
EOF
```

- [ ] **Step 3: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add .github/
git commit -m "feat: add GitHub Actions CI and Hosting Provider deploy workflows"
```

---

### Task 8: Add services directory structure

**Files:**
- Create: `services/ingest/.gitkeep`
- Create: `services/enrich/.gitkeep`
- Create: `services/planner/.gitkeep`

- [ ] **Step 1: Create service directories**

```bash
mkdir -p services/ingest services/enrich services/planner
touch services/ingest/.gitkeep services/enrich/.gitkeep services/planner/.gitkeep
```

- [ ] **Step 2: Create scripts directory**

```bash
mkdir -p scripts
cat > scripts/bulk-seed.ts << 'EOF'
/**
 * One-time bulk seed script.
 * Run with: npx tsx scripts/bulk-seed.ts
 *
 * Pulls top AI tools from Product Hunt and GitHub, writes to staging_tools.
 * Then triggers enrichment fan-out.
 * Implemented in Plan 2 alongside the ingest service.
 */
console.log("Bulk seed script — implemented in Plan 2")
EOF
```

- [ ] **Step 3: Final commit for Plan 1**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/ scripts/
git commit -m "feat: foundation complete — monorepo, schema, scoring, DB, CI all in place"
```

---

## Plan 1 Completion Checklist

- [ ] pnpm workspace + Turborepo initialized
- [ ] `packages/schemas` — all Zod types, tests passing
- [ ] `packages/scoring` — all scoring formulas, TDD tests passing
- [ ] `packages/prompts` — all LLM prompt templates
- [ ] `packages/db` — Drizzle schema, Supabase client, SQL migrations
- [ ] `apps/web` — Next.js scaffold, orange Tailwind theme, builds successfully
- [ ] `.github/workflows` — CI (lint + typecheck + test) + deploy workflows
- [ ] `.env.example` committed with all required variables
- [ ] All changes committed to `main`

**Known gaps carried forward to Plan 2:**
- `scripts/bulk-seed.ts` is a stub — Plan 2 implements the full bulk seed logic. Do not run enrichment pipeline tests until the seed script is implemented and `staging_tools` has data.

**Next:** Run Plan 2 — Ingestion & Enrichment Pipeline
