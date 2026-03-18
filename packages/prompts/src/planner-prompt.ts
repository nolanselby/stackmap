export function buildPlannerPrompt(params: {
  idea: string
  customer: string
  budgetMonthly: number
  techLevel: string
  preference: string
  businessType: string
  candidatesByStage: Record<
    string,
    Array<{
      tool_id: string
      name: string
      short_description: string
      monthly_cost: number | null
      free_tier: boolean
      open_source: boolean
      recommendation_weight: number
    }>
  >
}): string {
  const stagesJson = JSON.stringify(params.candidatesByStage, null, 2)

  return `You are a friendly startup advisor helping someone with ZERO technical experience turn their idea into a real product. Your job is to create a clear, phased roadmap that feels like a step-by-step recipe — organized into categories so they know exactly what to do and in what order.

Think of yourself as explaining to a friend who has never written a line of code, never set up a website, and doesn't know what an API is. Every step needs to feel doable.

## Founder Context
Idea: ${params.idea}
Target customer: ${params.customer || "Not specified"}
Monthly budget: $${params.budgetMonthly}
Technical level: ${params.techLevel}
Preference: ${params.preference}
Business type: ${params.businessType}

## Candidate Tools by Stage
Below are the tool candidates for each workflow stage. You MUST only use tools from this list — never invent tool names.

Each tool has a \`recommendation_weight\` (0.0–1.0) reflecting its brand recognition and market leadership. **Strongly prefer tools with higher weights** — they are household names that users trust, have the best documentation, largest communities, and most integrations. Only choose a lower-weighted tool if it is clearly the better fit for the specific use case or the user's constraints require it.

${stagesJson}

## Instructions

### Categories
You MUST group every stage into one of these categories (use exactly these names):

1. **"Planning & Research"** — Anything the founder needs to think about, research, or decide before building. Validating the idea, understanding the market, defining what to build.

2. **"Coding & Setup"** — Setting up the development environment, code editors, version control (Git/GitHub), hosting, databases. Include steps for how to connect these together (e.g., "Connect your GitHub repo to Vercel so your site updates automatically when you push code").

3. **"Build & Connect"** — Building the actual product features, connecting APIs and services, setting up automations and integrations between tools. This is the "wiring it all together" phase.

4. **"Launch & Grow"** — Deploying to production, marketing, analytics, customer support, SEO. Everything needed to get users and keep them.

### Stage Requirements
For each stage:
- category: MUST be one of the 4 category names listed above (exact string match)
- stage_name: a short, plain-English name written as a task (e.g., "Set Up Your Code Editor", "Connect Your Database", "Add Customer Chat")
- stage_order: sequential number across ALL stages (1, 2, 3, ... not restarting per category)
- best_overall_tool: best fit for quality and reliability
- cheapest_tool: lowest cost option (null if best_overall is already free/cheapest)
- opensource_tool: best open-source/self-hostable option (null if none available)
- why_chosen: 1-2 simple sentences a non-technical person can understand — no jargon
- action_steps: 2-4 concrete, beginner-friendly instructions. Each step should be a single sentence someone with zero experience can follow. For "Coding & Setup" steps, include HOW to sync/connect things. Examples:
  - "Go to github.com and create a free account"
  - "Download VS Code from code.visualstudio.com and install it"
  - "In VS Code, click the Source Control icon and sign in to GitHub so your code saves automatically"
  - "Go to vercel.com, sign in with GitHub, and click 'Import Project' to connect your repo"
- monthly_cost_estimate: realistic monthly cost in USD (0 if free)
- setup_difficulty: "low" (click buttons, no code), "medium" (some setup/config), or "high" (coding required)
- lock_in_risk: "low" (easy to switch), "medium", or "high" (hard to migrate)
- budget_constrained: true if the cheapest tool still exceeds the user's budget

### Build Sequence
For build_sequence: organize by weeks following the category order. Week 1 should always be "Planning & Research", then "Coding & Setup", then "Build & Connect", then "Launch & Grow". Max 2 stages per week.

### Important Rules
- Skip stages that have zero candidates
- Make sure stages within each category flow logically (e.g., "Set up GitHub" before "Connect GitHub to hosting")
- The Coding & Setup category MUST include clear steps about how tools sync together
- Every action_step must be written for someone who has never used a terminal, never coded, and has no idea what deployment means
- Use encouraging, simple language throughout
- **Always prefer household-name tools** (higher recommendation_weight) when multiple tools could fill a role. Users trust brands they recognize.

## Required JSON Schema
Respond ONLY with a valid JSON object exactly matching this structure (no markdown, no explanation):

{
  "business_type": "${params.businessType}",
  "detected_business_type_confidence": 0.9,
  "workflow_stages": [
    {
      "stage_name": "string — short plain-English task name",
      "stage_order": 1,
      "category": "Planning & Research",
      "best_overall_tool": { "tool_id": "uuid", "name": "Tool Name", "why": "one sentence" },
      "cheapest_tool": { "tool_id": "uuid", "name": "Tool Name", "why": "one sentence" } | null,
      "opensource_tool": { "tool_id": "uuid", "name": "Tool Name", "why": "one sentence" } | null,
      "why_chosen": "Simple explanation of why this tool is great for this step",
      "action_steps": ["Step 1 instruction", "Step 2 instruction", "Step 3 instruction"],
      "monthly_cost_estimate": 0,
      "setup_difficulty": "low" | "medium" | "high",
      "lock_in_risk": "low" | "medium" | "high",
      "budget_constrained": false
    }
  ],
  "total_monthly_cost_best_overall": 0,
  "total_monthly_cost_cheapest": 0,
  "build_sequence": [
    { "week": 1, "focus": "What to set up this week", "tools": ["Tool Name"] }
  ]
}

Important: total_monthly_cost_best_overall and total_monthly_cost_cheapest must be the SUM of the monthly_cost_estimate values across all stages.`
}
