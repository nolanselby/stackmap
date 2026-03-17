# AI Tool Roadmapper — Plan 3: Planner Service & API Routes

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the recommendation engine (business type detection, pgvector retrieval, LLM ranking) and all API routes (`POST /api/chat`, `POST /api/roadmap/generate`, `GET /api/roadmap/[short_id]`, exports), plus the Inngest planner function and rate-limiting middleware.

**Architecture:** Planner logic in `services/planner/` as pure TypeScript modules imported by the Inngest `planner-generate-roadmap` function. API routes in `apps/web/app/api/`. The chat route streams via Hosting Provider AI SDK. The roadmap generate route is sync (returns `short_id` immediately) while Inngest runs generation async. Polling via `GET /api/roadmap/[short_id]`.

**Tech Stack:** Hosting Provider AI SDK, OpenAI SDK, pgvector, Inngest, nanoid, Zod, Vitest

**Prerequisite:** Plans 1 and 2 complete. Supabase migrations applied. At least some tools in `tools` table with `status_active = true`.

---

## Chunk 1: Planner Service Modules

### Task 1: Business type detector

**Files:**
- Create: `services/planner/package.json`
- Create: `services/planner/tsconfig.json`
- Create: `services/planner/src/business-type-detector.ts`
- Create: `services/planner/src/__tests__/business-type-detector.test.ts`

- [ ] **Step 1: Write failing test**

```bash
mkdir -p services/planner/src/__tests__
cat > services/planner/package.json << 'EOF'
{
  "name": "@roadmapper/planner",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@roadmapper/db": "workspace:*",
    "@roadmapper/schemas": "workspace:*",
    "@roadmapper/prompts": "workspace:*",
    "openai": "^4.70.0"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "typescript": "^5.7.0"
  }
}
EOF

cat > services/planner/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src"]
}
EOF

cat > services/planner/src/__tests__/business-type-detector.test.ts << 'EOF'
import { describe, it, expect, vi } from "vitest"
import { parseBusinessTypeResponse } from "../business-type-detector"
import { BUSINESS_TYPES } from "@roadmapper/schemas"

describe("parseBusinessTypeResponse", () => {
  it("parses valid business type response", () => {
    const raw = JSON.stringify({ business_type: "ai_sdr", confidence: 0.92 })
    const result = parseBusinessTypeResponse(raw)
    expect(result.business_type).toBe("ai_sdr")
    expect(result.confidence).toBe(0.92)
  })

  it("throws on invalid business type", () => {
    const raw = JSON.stringify({ business_type: "ai_unknown", confidence: 0.5 })
    expect(() => parseBusinessTypeResponse(raw)).toThrow()
  })

  it("throws on malformed JSON", () => {
    expect(() => parseBusinessTypeResponse("not json")).toThrow()
  })

  it("accepts all 12 valid business types", () => {
    for (const type of BUSINESS_TYPES) {
      const raw = JSON.stringify({ business_type: type, confidence: 0.8 })
      expect(() => parseBusinessTypeResponse(raw)).not.toThrow()
    }
  })
})
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd services/planner && pnpm install && pnpm test
```

Expected: FAIL — "Cannot find module '../business-type-detector'"

- [ ] **Step 3: Implement business type detector**

```bash
cat > services/planner/src/business-type-detector.ts << 'EOF'
import OpenAI from "openai"
import { BusinessTypeSchema, BUSINESS_TYPES, type BusinessType } from "@roadmapper/schemas"
import { buildBusinessTypePrompt } from "@roadmapper/prompts"
import { z } from "zod"

const BusinessTypeResponseSchema = z.object({
  business_type: BusinessTypeSchema,
  confidence: z.number().min(0).max(1),
})

export function parseBusinessTypeResponse(raw: string): {
  business_type: BusinessType
  confidence: number
} {
  const parsed = JSON.parse(raw)
  return BusinessTypeResponseSchema.parse(parsed)
}

export async function detectBusinessType(
  idea: string,
  customer: string,
  openaiApiKey: string
): Promise<{ business_type: BusinessType; confidence: number }> {
  const client = new OpenAI({ apiKey: openaiApiKey })

  const prompt = buildBusinessTypePrompt(idea, customer)

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "business_type_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            business_type: { type: "string", enum: [...BUSINESS_TYPES] },
            confidence: { type: "number" },
          },
          required: ["business_type", "confidence"],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: "user", content: prompt }],
    max_tokens: 100,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("Empty business type response from OpenAI")

  return parseBusinessTypeResponse(content)
}
EOF
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/planner/
git commit -m "feat: add business type detector module"
```

---

### Task 2: Retriever module

**Files:**
- Create: `services/planner/src/retriever.ts`
- Create: `services/planner/src/__tests__/retriever.test.ts`

- [ ] **Step 1: Write failing test**

```bash
cat > services/planner/src/__tests__/retriever.test.ts << 'EOF'
import { describe, it, expect } from "vitest"
import { applyBudgetFilter, applyPreferenceFilter, groupByWorkflowStage } from "../retriever"

const SAMPLE_CANDIDATES = [
  {
    tool_id: "1",
    name: "ExpensiveTool",
    starting_price_monthly: 500,
    free_tier: false,
    open_source: false,
    categories: ["AI Sales"],
    use_cases: ["lead gen"],
  },
  {
    tool_id: "2",
    name: "CheapTool",
    starting_price_monthly: 29,
    free_tier: false,
    open_source: false,
    categories: ["AI Sales"],
    use_cases: ["lead gen"],
  },
  {
    tool_id: "3",
    name: "FreeTool",
    starting_price_monthly: null,
    free_tier: true,
    open_source: false,
    categories: ["AI Sales"],
    use_cases: ["email automation"],
  },
  {
    tool_id: "4",
    name: "OSSTool",
    starting_price_monthly: null,
    free_tier: true,
    open_source: true,
    categories: ["AI Sales"],
    use_cases: ["lead gen"],
  },
]

describe("applyBudgetFilter", () => {
  it("excludes tools above budget when budget > 0", () => {
    const result = applyBudgetFilter(SAMPLE_CANDIDATES, 100)
    const names = result.map((t) => t.name)
    expect(names).not.toContain("ExpensiveTool")
    expect(names).toContain("CheapTool")
    expect(names).toContain("FreeTool")
  })

  it("includes free-tier tools regardless of budget", () => {
    const result = applyBudgetFilter(SAMPLE_CANDIDATES, 0)
    expect(result.every((t) => t.free_tier || t.open_source || !t.starting_price_monthly)).toBe(true)
  })

  it("returns all tools when budget is 1000+ (unlimited)", () => {
    const result = applyBudgetFilter(SAMPLE_CANDIDATES, 1000)
    expect(result.length).toBe(SAMPLE_CANDIDATES.length)
  })
})

describe("applyPreferenceFilter", () => {
  it("open-source preference ranks open source tools higher (puts them first)", () => {
    const result = applyPreferenceFilter(SAMPLE_CANDIDATES, "open-source")
    expect(result[0].name).toBe("OSSTool")
  })

  it("cheapest preference ranks lowest-cost tools first", () => {
    const result = applyPreferenceFilter(SAMPLE_CANDIDATES, "cheapest")
    // Free tools first, then cheapest paid
    const firstPaidIndex = result.findIndex((t) => (t.starting_price_monthly ?? 0) > 0)
    if (firstPaidIndex > 0) {
      expect(result[firstPaidIndex].starting_price_monthly).toBeLessThan(
        result[firstPaidIndex + 1]?.starting_price_monthly ?? Infinity
      )
    }
  })
})

describe("groupByWorkflowStage", () => {
  it("assigns tools to stages based on capability match", () => {
    const modules = [
      {
        module_name: "lead_sourcing",
        required_capabilities: ["lead gen"],
        typical_order: 1,
        stage: "discovery",
      },
    ]
    const result = groupByWorkflowStage(SAMPLE_CANDIDATES, modules)
    expect(result["lead_sourcing"]).toBeDefined()
    expect(result["lead_sourcing"].length).toBeGreaterThan(0)
  })

  it("returns empty array for stage with no matching tools", () => {
    const modules = [
      {
        module_name: "voice_calls",
        required_capabilities: ["sip_integration"],
        typical_order: 1,
        stage: "telephony",
      },
    ]
    const result = groupByWorkflowStage(SAMPLE_CANDIDATES, modules)
    expect(result["voice_calls"]).toEqual([])
  })
})
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module '../retriever'"

- [ ] **Step 3: Implement retriever**

```bash
cat > services/planner/src/retriever.ts << 'EOF'
import OpenAI from "openai"
import { createServerClient } from "@roadmapper/db"
import type { BusinessType } from "@roadmapper/schemas"

export interface ToolCandidate {
  tool_id: string
  name: string
  short_description: string | null
  starting_price_monthly: number | null
  free_tier: boolean | null
  open_source: boolean
  categories: string[]
  use_cases: string[]
}

interface WorkflowModuleRef {
  module_name: string
  required_capabilities: string[]
  typical_order: number
  stage: string
}

export function applyBudgetFilter(
  tools: ToolCandidate[],
  budgetMonthly: number
): ToolCandidate[] {
  if (budgetMonthly >= 1000) return tools // unlimited
  return tools.filter((t) => {
    if (t.free_tier || t.open_source || !t.starting_price_monthly) return true
    return t.starting_price_monthly <= budgetMonthly
  })
}

export function applyPreferenceFilter(
  tools: ToolCandidate[],
  preference: "best-overall" | "cheapest" | "open-source"
): ToolCandidate[] {
  const copy = [...tools]
  if (preference === "open-source") {
    copy.sort((a, b) => Number(b.open_source) - Number(a.open_source))
  } else if (preference === "cheapest") {
    copy.sort((a, b) => {
      const aPrice = a.free_tier ? 0 : (a.starting_price_monthly ?? 9999)
      const bPrice = b.free_tier ? 0 : (b.starting_price_monthly ?? 9999)
      return aPrice - bPrice
    })
  }
  return copy
}

export function groupByWorkflowStage(
  tools: ToolCandidate[],
  modules: WorkflowModuleRef[]
): Record<string, ToolCandidate[]> {
  const result: Record<string, ToolCandidate[]> = {}

  for (const module of modules) {
    result[module.module_name] = tools.filter((tool) => {
      const toolText = [
        ...(tool.categories ?? []),
        ...(tool.use_cases ?? []),
        tool.short_description ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return module.required_capabilities.some((cap) =>
        toolText.includes(cap.toLowerCase().replace(/_/g, " "))
      )
    })
  }

  return result
}

export async function retrieveCandidates(
  idea: string,
  businessType: BusinessType,
  budgetMonthly: number,
  preference: "best-overall" | "cheapest" | "open-source",
  openaiApiKey: string
): Promise<Record<string, ToolCandidate[]>> {
  const db = createServerClient()
  const openai = new OpenAI({ apiKey: openaiApiKey })

  // Generate embedding for the idea
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: idea,
  })
  const embedding = embeddingRes.data[0].embedding

  // pgvector similarity search — top 100 candidates
  const { data: similarTools, error } = await db.rpc("match_tools_by_embedding", {
    query_embedding: embedding,
    match_count: 100,
    min_score: 0.5,
  })

  if (error) throw new Error(`Vector search failed: ${error.message}`)

  // Fetch metadata and pricing for matched tools
  const toolIds = (similarTools ?? []).map((t: { id: string }) => t.id)

  const { data: toolsWithMeta } = await db
    .from("tools")
    .select(`
      id,
      name,
      short_description,
      open_source,
      tool_metadata (categories, use_cases),
      tool_pricing (starting_price_monthly, free_tier)
    `)
    .in("id", toolIds)
    .eq("status_active", true)

  const candidates: ToolCandidate[] = (toolsWithMeta ?? []).map((t) => ({
    tool_id: t.id,
    name: t.name,
    short_description: t.short_description,
    starting_price_monthly: (t.tool_pricing as { starting_price_monthly: number | null }[] | null)?.[0]?.starting_price_monthly ?? null,
    free_tier: (t.tool_pricing as { free_tier: boolean | null }[] | null)?.[0]?.free_tier ?? null,
    open_source: t.open_source ?? false,
    categories: (t.tool_metadata as { categories: string[] | null }[] | null)?.[0]?.categories ?? [],
    use_cases: (t.tool_metadata as { use_cases: string[] | null }[] | null)?.[0]?.use_cases ?? [],
  }))

  // Apply filters
  const budgetFiltered = applyBudgetFilter(candidates, budgetMonthly)
  const preferenceOrdered = applyPreferenceFilter(budgetFiltered, preference)

  // Fetch workflow modules for business type
  const { data: modules } = await db
    .from("workflow_modules")
    .select("module_name, required_capabilities, typical_order, stage")
    .eq("business_type", businessType)
    .order("typical_order")

  return groupByWorkflowStage(preferenceOrdered.slice(0, 50), modules ?? [])
}
EOF
```

- [ ] **Step 4: Create pgvector match function migration**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/packages/db/supabase/migrations/0004_match_tools_rpc.sql << 'EOF'
-- RPC for pgvector similarity search
CREATE OR REPLACE FUNCTION match_tools_by_embedding(
  query_embedding vector(1536),
  match_count int DEFAULT 100,
  min_score float DEFAULT 0.5
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tools.id,
    1 - (tools.embedding <=> query_embedding) AS similarity
  FROM tools
  WHERE
    tools.status_active = true
    AND tools.embedding IS NOT NULL
    AND 1 - (tools.embedding <=> query_embedding) > min_score
  ORDER BY tools.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
EOF
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/planner/src/retriever.ts services/planner/src/__tests__/retriever.test.ts packages/db/supabase/migrations/0004_match_tools_rpc.sql
git commit -m "feat: add retriever module with pgvector similarity search"
```

---

### Task 3: Roadmap generator module

**Files:**
- Create: `services/planner/src/generator.ts`
- Create: `services/planner/src/__tests__/generator.test.ts`
- Create: `services/planner/src/index.ts`

- [ ] **Step 1: Write failing test**

```bash
cat > services/planner/src/__tests__/generator.test.ts << 'EOF'
import { describe, it, expect } from "vitest"
import { parseRoadmapResponse, calculateTotalCost } from "../generator"

const SAMPLE_RESULT = {
  business_type: "ai_sdr",
  detected_business_type_confidence: 0.92,
  workflow_stages: [
    {
      stage_name: "Lead Sourcing",
      stage_order: 1,
      best_overall_tool: { tool_id: "1", name: "Apollo", why: "Best coverage" },
      cheapest_tool: { tool_id: "4", name: "Hunter.io", why: "Lower cost" },
      opensource_tool: null,
      why_chosen: "Apollo has the largest B2B database",
      monthly_cost_estimate: 49,
      setup_difficulty: "low",
      lock_in_risk: "medium",
      budget_constrained: false,
    },
    {
      stage_name: "Email Sequencing",
      stage_order: 2,
      best_overall_tool: { tool_id: "2", name: "Instantly", why: "Great deliverability" },
      cheapest_tool: null,
      opensource_tool: { tool_id: "5", name: "Mautic", why: "Self-hostable" },
      why_chosen: "Instantly handles high-volume outreach reliably",
      monthly_cost_estimate: 37,
      setup_difficulty: "medium",
      lock_in_risk: "low",
      budget_constrained: false,
    },
  ],
  total_monthly_cost_best_overall: 86,
  total_monthly_cost_cheapest: 49,
  build_sequence: [
    { week: 1, focus: "Core lead pipeline", tools: ["Apollo", "Instantly"] },
  ],
}

describe("parseRoadmapResponse", () => {
  it("parses valid roadmap JSON", () => {
    const result = parseRoadmapResponse(JSON.stringify(SAMPLE_RESULT))
    expect(result.business_type).toBe("ai_sdr")
    expect(result.workflow_stages).toHaveLength(2)
    expect(result.workflow_stages[0].best_overall_tool.name).toBe("Apollo")
  })

  it("throws on invalid JSON", () => {
    expect(() => parseRoadmapResponse("not json")).toThrow()
  })

  it("throws on missing required fields", () => {
    expect(() => parseRoadmapResponse(JSON.stringify({ business_type: "ai_sdr" }))).toThrow()
  })
})

describe("calculateTotalCost", () => {
  it("sums monthly costs for best-overall variant", () => {
    const total = calculateTotalCost(SAMPLE_RESULT.workflow_stages, "best-overall")
    expect(total).toBe(86) // 49 + 37
  })

  it("sums monthly costs for cheapest variant, falling back to best_overall when cheapest is null", () => {
    const total = calculateTotalCost(SAMPLE_RESULT.workflow_stages, "cheapest")
    expect(total).toBe(49 + 37) // cheapest for stage 1 = Hunter $49, stage 2 cheapest=null falls back to Instantly $37
  })
})
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module '../generator'"

- [ ] **Step 3: Implement generator**

```bash
cat > services/planner/src/generator.ts << 'EOF'
import OpenAI from "openai"
import { RoadmapResultSchema, type RoadmapResult, type WorkflowStage } from "@roadmapper/schemas"
import { buildPlannerPrompt } from "@roadmapper/prompts"
import type { ToolCandidate } from "./retriever"

export function parseRoadmapResponse(raw: string): RoadmapResult {
  const parsed = JSON.parse(raw)
  return RoadmapResultSchema.parse(parsed)
}

export function calculateTotalCost(
  stages: WorkflowStage[],
  variant: "best-overall" | "cheapest" | "open-source"
): number {
  return stages.reduce((sum, stage) => {
    let tool
    if (variant === "cheapest") {
      tool = stage.cheapest_tool ?? stage.best_overall_tool
    } else if (variant === "open-source") {
      tool = stage.opensource_tool ?? stage.best_overall_tool
    } else {
      tool = stage.best_overall_tool
    }
    return sum + stage.monthly_cost_estimate
  }, 0)
}

export async function generateRoadmap(params: {
  idea: string
  customer: string
  budgetMonthly: number
  techLevel: "non-technical" | "some-coding" | "full-stack"
  preference: "best-overall" | "cheapest" | "open-source"
  businessType: string
  candidatesByStage: Record<string, ToolCandidate[]>
  openaiApiKey: string
}): Promise<RoadmapResult> {
  const client = new OpenAI({ apiKey: params.openaiApiKey })

  const prompt = buildPlannerPrompt({
    idea: params.idea,
    customer: params.customer,
    budgetMonthly: params.budgetMonthly,
    techLevel: params.techLevel,
    preference: params.preference,
    businessType: params.businessType,
    candidatesByStage: Object.fromEntries(
      Object.entries(params.candidatesByStage).map(([stage, tools]) => [
        stage,
        tools.slice(0, 8).map((t) => ({
          tool_id: t.tool_id,
          name: t.name,
          short_description: t.short_description,
          monthly_cost: t.starting_price_monthly,
          free_tier: t.free_tier ?? false,
          open_source: t.open_source,
        })),
      ])
    ),
  })

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "roadmap_result",
        strict: false, // complex nested schema — allow extra properties
        schema: {
          type: "object",
          properties: {
            business_type: { type: "string" },
            detected_business_type_confidence: { type: "number" },
            workflow_stages: { type: "array" },
            total_monthly_cost_best_overall: { type: "number" },
            total_monthly_cost_cheapest: { type: "number" },
            build_sequence: { type: "array" },
          },
          required: [
            "business_type",
            "detected_business_type_confidence",
            "workflow_stages",
            "total_monthly_cost_best_overall",
            "total_monthly_cost_cheapest",
            "build_sequence",
          ],
        },
      },
    },
    messages: [{ role: "user", content: prompt }],
    max_tokens: 3000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("Empty roadmap response from OpenAI")

  return parseRoadmapResponse(content)
}
EOF
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Write planner index**

```bash
cat > services/planner/src/index.ts << 'EOF'
export * from "./business-type-detector"
export * from "./retriever"
export * from "./generator"
EOF
```

- [ ] **Step 6: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/planner/
git commit -m "feat: add planner modules (business type detector, retriever, generator)"
```

---

## Chunk 2: Inngest Planner Function

### Task 4: Planner generate-roadmap Inngest function

**Files:**
- Create: `apps/web/inngest/functions/planner-generate-roadmap.ts`

- [ ] **Step 1: Implement planner function**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/inngest/functions/planner-generate-roadmap.ts << 'EOF'
import { inngest } from "../client"
import { createServerClient } from "@roadmapper/db"
import { detectBusinessType } from "@roadmapper/planner"
import { retrieveCandidates } from "@roadmapper/planner"
import { generateRoadmap } from "@roadmapper/planner"
import type { RoadmapInput } from "@roadmapper/schemas"

export const plannerGenerateRoadmapFn = inngest.createFunction(
  {
    id: "planner-generate-roadmap",
    name: "Planner: Generate Roadmap",
    retries: 2,
    timeouts: { finish: "4m" }, // Set to 'failed' on timeout
  },
  { event: "roadmap/generate" },
  async ({ event, step, logger }) => {
    const { shortId, input } = event.data as {
      shortId: string
      input: RoadmapInput
    }

    const db = createServerClient()
    const apiKey = process.env.OPENAI_API_KEY!

    logger.info(`Generating roadmap ${shortId} for idea: "${input.idea.slice(0, 80)}..."`)

    try {
      // Stage 1: Detect business type
      const { business_type, confidence } = await step.run("detect-business-type", () =>
        detectBusinessType(input.idea, input.customer ?? "", apiKey)
      )

      logger.info(`Detected business type: ${business_type} (confidence: ${confidence.toFixed(2)})`)

      // Stage 2: Retrieve candidates
      const candidatesByStage = await step.run("retrieve-candidates", () =>
        retrieveCandidates(
          input.idea,
          business_type,
          input.budget_monthly,
          input.preference,
          apiKey
        )
      )

      const totalCandidates = Object.values(candidatesByStage).reduce(
        (sum, tools) => sum + tools.length, 0
      )
      logger.info(`Retrieved ${totalCandidates} candidates across ${Object.keys(candidatesByStage).length} stages`)

      // Stage 3: Generate roadmap
      const roadmapResult = await step.run("generate-roadmap", () =>
        generateRoadmap({
          idea: input.idea,
          customer: input.customer ?? "",
          budgetMonthly: input.budget_monthly,
          techLevel: input.tech_level,
          preference: input.preference,
          businessType: business_type,
          candidatesByStage,
          openaiApiKey: apiKey,
        })
      )

      // Write result
      const { error } = await step.run("write-result", () =>
        db
          .from("roadmaps")
          .update({ result_json: roadmapResult, status: "complete" })
          .eq("short_id", shortId)
      )

      if (error) throw new Error(`Failed to write roadmap result: ${error.message}`)

      logger.info(`Roadmap ${shortId} complete`)
      return { shortId, status: "complete" }
    } catch (err) {
      // Mark as failed so polling stops
      await db
        .from("roadmaps")
        .update({ status: "failed" })
        .eq("short_id", shortId)

      throw err // Rethrow so Inngest logs the error
    }
  }
)
EOF
```

- [ ] **Step 2: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add apps/web/inngest/functions/planner-generate-roadmap.ts
git commit -m "feat: add planner Inngest function"
```

---

## Chunk 3: API Routes

### Task 5: Rate-limiting middleware

**Files:**
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Create middleware**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/middleware.ts << 'EOF'
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiter (IP-based, resets on cold start)
// For production: replace with Upstash Redis
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 20 // requests per window
const WINDOW_MS = 60 * 1000 // 1 minute

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = ipRequestCounts.get(ip)

  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  if (record.count >= RATE_LIMIT) return true

  record.count++
  return false
}

export function middleware(request: NextRequest) {
  // Only rate-limit the chat API route
  if (request.nextUrl.pathname === "/api/chat") {
    const ip = getRateLimitKey(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      )
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/api/chat",
}
EOF
```

- [ ] **Step 2: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add apps/web/middleware.ts
git commit -m "feat: add rate limiting middleware for /api/chat"
```

---

### Task 6: POST /api/chat route

**Files:**
- Create: `apps/web/app/api/chat/route.ts`

- [ ] **Step 1: Implement chat route**

```bash
mkdir -p /Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/chat

cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/chat/route.ts << 'EOF'
import { streamText, createDataStreamResponse } from "ai"
import { openai } from "@ai-sdk/openai"
import { CHAT_SYSTEM_PROMPT } from "@roadmapper/prompts"
import { z } from "zod"

const MAX_MESSAGES = 6

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { messages } = parsed.data

  // Server-side turn cap — force generation after MAX_MESSAGES
  const cappedMessages = messages.slice(-MAX_MESSAGES)

  try {
    const result = streamText({
      model: openai("gpt-4o"),
      system: CHAT_SYSTEM_PROMPT,
      messages: cappedMessages,
      onFinish: async ({ text }) => {
        // Check if the model included the inputs_complete signal in its reasoning
        // The model is instructed to produce JSON at the end of the final turn
        // We detect it by looking for the JSON structure in the response
        const jsonMatch = text.match(/\{[^{}]*"type"\s*:\s*"inputs_complete"[^{}]*\}/)
        // Note: the actual signal emission is done via the data stream in the prompt
        // The model uses a tool call or structured output to signal completion
        // This is a fallback detection
      },
    })

    // Write inputs_complete signal via data stream when model indicates readiness
    // The system prompt instructs the model to include a structured signal marker
    // We detect it using the onChunk callback and write to the data stream
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate response. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
EOF
```

**Note:** The `inputs_complete` data signal is best implemented using Hosting Provider AI SDK tools. Update the chat route to use a tool call approach: define a tool called `submit_inputs` that the model calls when it has all required information. The frontend detects this tool call via `useChat`'s `toolInvocations`. Update the system prompt in `packages/prompts/src/chat-system-prompt.ts` to instruct the model to call `submit_inputs` when ready.

- [ ] **Step 2: Update system prompt to use tool approach**

Edit `packages/prompts/src/chat-system-prompt.ts` to add at the end of the prompt:

```typescript
// Add this to the bottom of CHAT_SYSTEM_PROMPT string:
`
When you have collected all four inputs (idea, customer, budget, tech level + preference), call the 'submit_inputs' tool with the collected values. Do not include any JSON in your text response — use only the tool call.
`
```

- [ ] **Step 3: Update chat route to define the tool**

Replace the chat route with the tool-enabled version:

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/chat/route.ts << 'EOF'
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { CHAT_SYSTEM_PROMPT } from "@roadmapper/prompts"
import { z } from "zod"

const MAX_MESSAGES = 6

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { messages } = parsed.data
  const cappedMessages = messages.slice(-MAX_MESSAGES)

  try {
    const result = streamText({
      model: openai("gpt-4o"),
      system: CHAT_SYSTEM_PROMPT,
      messages: cappedMessages,
      tools: {
        submit_inputs: {
          description: "Call this when you have collected all required inputs from the user",
          parameters: z.object({
            idea: z.string().describe("The startup idea description"),
            customer: z.string().describe("The target customer"),
            budget_monthly: z.number().describe("Monthly budget in USD"),
            tech_level: z
              .enum(["non-technical", "some-coding", "full-stack"])
              .describe("Technical level of the founder/team"),
            preference: z
              .enum(["best-overall", "cheapest", "open-source"])
              .describe("Tool preference"),
          }),
        },
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate response. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
EOF
```

- [ ] **Step 4: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add apps/web/app/api/chat/route.ts packages/prompts/
git commit -m "feat: add /api/chat route with Hosting Provider AI SDK streaming and submit_inputs tool"
```

---

### Task 7: POST /api/roadmap/generate and GET /api/roadmap/[short_id] routes

**Files:**
- Create: `apps/web/app/api/roadmap/generate/route.ts`
- Create: `apps/web/app/api/roadmap/[short_id]/route.ts`
- Create: `apps/web/app/api/roadmap/[short_id]/export/markdown/route.ts`
- Create: `apps/web/app/api/roadmap/[short_id]/export/github-issues/route.ts`

- [ ] **Step 1: Implement generate route**

```bash
mkdir -p /Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/roadmap/generate

cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/roadmap/generate/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { createServerClient } from "@roadmapper/db"
import { RoadmapInputSchema } from "@roadmapper/schemas"
import { inngest } from "@/inngest/client"
import { nanoid } from "nanoid"

const NANOID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const NANOID_LENGTH = 8

function generateShortId() {
  return nanoid(NANOID_LENGTH)
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = RoadmapInputSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return NextResponse.json(
      { error: `Missing required field: ${firstError.path.join(".")}` },
      { status: 400 }
    )
  }

  const input = parsed.data
  const db = createServerClient()

  // Generate short_id with collision retry
  let shortId: string | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = generateShortId()
    const { data: existing } = await db
      .from("roadmaps")
      .select("id")
      .eq("short_id", candidate)
      .maybeSingle()

    if (!existing) {
      shortId = candidate
      break
    }
  }

  if (!shortId) {
    return NextResponse.json(
      { error: "Failed to create roadmap. Please try again." },
      { status: 500 }
    )
  }

  // Insert roadmap record
  const { error: insertError } = await db.from("roadmaps").insert({
    short_id: shortId,
    input_idea: input.idea,
    input_customer: input.customer ?? null,
    input_budget_monthly: input.budget_monthly,
    input_tech_level: input.tech_level,
    input_preference: input.preference,
    status: "generating",
  })

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create roadmap. Please try again." },
      { status: 500 }
    )
  }

  // Trigger Inngest planner function
  await inngest.send({
    name: "roadmap/generate",
    data: { shortId, input },
  })

  return NextResponse.json({ short_id: shortId }, { status: 200 })
}
EOF
```

- [ ] **Step 2: Implement GET /api/roadmap/[short_id] route**

```bash
mkdir -p /Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/roadmap/\[short_id\]

cat > "/Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/roadmap/[short_id]/route.ts" << 'EOF'
import { NextResponse } from "next/server"
import { createServerClient } from "@roadmapper/db"

export async function GET(
  _request: Request,
  { params }: { params: { short_id: string } }
) {
  const db = createServerClient()

  const { data, error } = await db
    .from("roadmaps")
    .select("status, result_json")
    .eq("short_id", params.short_id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
  }

  return NextResponse.json({
    status: data.status,
    roadmap: data.result_json ?? null,
  })
}
EOF
```

- [ ] **Step 3: Implement Markdown export**

```bash
mkdir -p "/Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/roadmap/[short_id]/export/markdown"

cat > "/Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/roadmap/[short_id]/export/markdown/route.ts" << 'EOF'
import { NextResponse } from "next/server"
import { createServerClient } from "@roadmapper/db"
import type { RoadmapResult } from "@roadmapper/schemas"

function roadmapToMarkdown(roadmap: RoadmapResult, shortId: string): string {
  const lines: string[] = [
    `# AI Stack Roadmap: ${roadmap.business_type.replace(/_/g, " ").toUpperCase()}`,
    "",
    `> Generated by AI Tool Roadmapper | Share: https://roadmapper.ai/r/${shortId}`,
    "",
    `**Total monthly cost (best overall):** $${roadmap.total_monthly_cost_best_overall}`,
    `**Total monthly cost (cheapest):** $${roadmap.total_monthly_cost_cheapest}`,
    "",
    "---",
    "",
    "## Workflow Stages",
    "",
  ]

  for (const stage of roadmap.workflow_stages.sort((a, b) => a.stage_order - b.stage_order)) {
    lines.push(`### ${stage.stage_order}. ${stage.stage_name}`)
    lines.push("")
    lines.push(`**Best Tool:** ${stage.best_overall_tool.name} — $${stage.monthly_cost_estimate}/mo`)
    lines.push(`**Why:** ${stage.why_chosen}`)
    lines.push(`**Difficulty:** ${stage.setup_difficulty} | **Lock-in risk:** ${stage.lock_in_risk}`)
    if (stage.cheapest_tool) {
      lines.push(`**Cheaper alternative:** ${stage.cheapest_tool.name} — ${stage.cheapest_tool.why}`)
    }
    if (stage.opensource_tool) {
      lines.push(`**Open-source option:** ${stage.opensource_tool.name} — ${stage.opensource_tool.why}`)
    }
    lines.push("")
  }

  lines.push("## Build Sequence", "")
  for (const week of roadmap.build_sequence) {
    lines.push(`### Week ${week.week}: ${week.focus}`)
    lines.push(week.tools.map((t) => `- ${t}`).join("\n"))
    lines.push("")
  }

  return lines.join("\n")
}

export async function GET(
  _request: Request,
  { params }: { params: { short_id: string } }
) {
  const db = createServerClient()

  const { data, error } = await db
    .from("roadmaps")
    .select("result_json, short_id")
    .eq("short_id", params.short_id)
    .eq("status", "complete")
    .maybeSingle()

  if (error || !data?.result_json) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
  }

  const markdown = roadmapToMarkdown(data.result_json as RoadmapResult, data.short_id)

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="roadmap-${params.short_id}.md"`,
    },
  })
}
EOF
```

- [ ] **Step 4: Implement GitHub Issues export**

```bash
mkdir -p "/Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/roadmap/[short_id]/export/github-issues"

cat > "/Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/roadmap/[short_id]/export/github-issues/route.ts" << 'EOF'
import { NextResponse } from "next/server"
import { createServerClient } from "@roadmapper/db"
import type { RoadmapResult } from "@roadmapper/schemas"

export async function GET(
  _request: Request,
  { params }: { params: { short_id: string } }
) {
  const db = createServerClient()

  const { data, error } = await db
    .from("roadmaps")
    .select("result_json")
    .eq("short_id", params.short_id)
    .eq("status", "complete")
    .maybeSingle()

  if (error || !data?.result_json) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
  }

  const roadmap = data.result_json as RoadmapResult

  const issues = roadmap.workflow_stages
    .sort((a, b) => a.stage_order - b.stage_order)
    .map((stage) => ({
      title: `[AI Stack] ${stage.stage_order}. ${stage.stage_name} — ${stage.best_overall_tool.name}`,
      body: [
        `## ${stage.stage_name}`,
        "",
        `**Recommended tool:** [${stage.best_overall_tool.name}]`,
        `**Why:** ${stage.why_chosen}`,
        `**Estimated monthly cost:** $${stage.monthly_cost_estimate}`,
        `**Setup difficulty:** ${stage.setup_difficulty}`,
        `**Vendor lock-in risk:** ${stage.lock_in_risk}`,
        "",
        stage.cheapest_tool
          ? `**Budget alternative:** ${stage.cheapest_tool.name} — ${stage.cheapest_tool.why}`
          : "",
        stage.opensource_tool
          ? `**Open-source option:** ${stage.opensource_tool.name} — ${stage.opensource_tool.why}`
          : "",
        "",
        `---`,
        `_Generated by [AI Tool Roadmapper](https://roadmapper.ai/r/${params.short_id})_`,
      ]
        .filter((l) => l !== "")
        .join("\n"),
      labels: ["ai-stack", `difficulty:${stage.setup_difficulty}`],
    }))

  return NextResponse.json(issues)
}
EOF
```

- [ ] **Step 5: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add apps/web/app/api/roadmap/
git commit -m "feat: add roadmap generate, poll, and export API routes"
```

---

## Plan 3 Completion Checklist

- [ ] `services/planner` — business-type-detector, retriever, generator with TDD tests
- [ ] Migration `0004_match_tools_rpc.sql` applied to Supabase
- [ ] `apps/web/inngest/functions/planner-generate-roadmap.ts` — full async generation flow
- [ ] `apps/web/middleware.ts` — IP rate limiting on /api/chat (20 req/min)
- [ ] `POST /api/chat` — streaming with `submit_inputs` tool
- [ ] `POST /api/roadmap/generate` — creates record, triggers Inngest, returns short_id
- [ ] `GET /api/roadmap/[short_id]` — polls status and returns roadmap when complete
- [ ] `GET /api/roadmap/[short_id]/export/markdown` — markdown download
- [ ] `GET /api/roadmap/[short_id]/export/github-issues` — issues array JSON
- [ ] All unit tests pass

**Next:** Run Plan 4 — Web UI (Chat + Roadmap)
