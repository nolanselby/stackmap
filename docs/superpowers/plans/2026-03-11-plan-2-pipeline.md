# AI Tool Roadmapper — Plan 2: Ingestion & Enrichment Pipeline

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the daily cron ingestion pipeline (Product Hunt, GitHub, directories) and the enrichment fan-out (scrape, LLM classify, embed, score, promote to `tools` table), plus the bulk seed script for initial population.

**Architecture:** All pipeline logic lives in `services/ingest/`, `services/enrich/`, and `services/planner/` as pure TypeScript modules. Inngest functions in `apps/web/inngest/functions/` import these modules and handle orchestration, retries, and fan-out. The Inngest serve handler is registered at `apps/web/app/api/inngest/route.ts`. All DB writes use the Supabase service-role client from `@roadmapper/db`.

**Tech Stack:** Inngest, Cheerio, OpenAI SDK, @roadmapper/scoring, @roadmapper/schemas, Supabase, Vitest

**Prerequisite:** Plan 1 complete. `DATABASE_URL`, `OPENAI_API_KEY`, `PRODUCT_HUNT_API_TOKEN`, `GITHUB_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` set in `.env`.

---

## Chunk 1: Ingest Services

### Task 1: Product Hunt ingest module

**Files:**
- Create: `services/ingest/package.json`
- Create: `services/ingest/tsconfig.json`
- Create: `services/ingest/src/product-hunt.ts`
- Create: `services/ingest/src/__tests__/product-hunt.test.ts`

- [ ] **Step 1: Write failing test**

```bash
mkdir -p services/ingest/src/__tests__
cat > services/ingest/package.json << 'EOF'
{
  "name": "@roadmapper/ingest",
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
    "@roadmapper/schemas": "workspace:*"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "typescript": "^5.7.0"
  }
}
EOF

cat > services/ingest/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src"]
}
EOF

cat > services/ingest/src/__tests__/product-hunt.test.ts << 'EOF'
import { describe, it, expect, vi } from "vitest"
import { normalizeProductHuntPost } from "../product-hunt"

describe("normalizeProductHuntPost", () => {
  it("maps PH post fields to staging_tools raw_data shape", () => {
    const post = {
      id: "ph_123",
      name: "Awesome AI Tool",
      tagline: "The best AI tool ever",
      url: "https://www.producthunt.com/posts/awesome-ai-tool",
      website: "https://awesomeaitool.com",
      votesCount: 342,
      createdAt: "2026-03-10T10:00:00Z",
      thumbnail: { url: "https://img.example.com/logo.png" },
    }

    const result = normalizeProductHuntPost(post)

    expect(result.source).toBe("product_hunt")
    expect(result.source_id).toBe("ph_123")
    expect(result.raw_data.name).toBe("Awesome AI Tool")
    expect(result.raw_data.website_url).toBe("https://awesomeaitool.com")
    expect(result.raw_data.short_description).toBe("The best AI tool ever")
    expect(result.raw_data.producthunt_votes).toBe(342)
    expect(result.raw_data.launch_date).toBe("2026-03-10")
    expect(result.status).toBe("pending")
  })

  it("handles missing website gracefully", () => {
    const post = {
      id: "ph_456",
      name: "No Website Tool",
      tagline: "A tool with no website",
      url: "https://www.producthunt.com/posts/no-website-tool",
      website: null,
      votesCount: 10,
      createdAt: "2026-03-10T10:00:00Z",
      thumbnail: null,
    }

    const result = normalizeProductHuntPost(post)
    expect(result.raw_data.website_url).toBeNull()
  })
})
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd services/ingest && pnpm install && pnpm test
```

Expected: FAIL — "Cannot find module '../product-hunt'"

- [ ] **Step 3: Implement product-hunt module**

```bash
cat > services/ingest/src/product-hunt.ts << 'EOF'
const PH_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql"

interface PHPost {
  id: string
  name: string
  tagline: string
  url: string
  website: string | null
  votesCount: number
  createdAt: string
  thumbnail: { url: string } | null
}

interface PHResponse {
  data: {
    posts: {
      edges: Array<{ node: PHPost }>
    }
  }
}

export interface NormalizedStagingRecord {
  source: "product_hunt"
  source_id: string
  status: "pending"
  raw_data: {
    name: string
    website_url: string | null
    logo_url: string | null
    short_description: string
    producthunt_votes: number
    launch_date: string
  }
}

export function normalizeProductHuntPost(post: PHPost): NormalizedStagingRecord {
  return {
    source: "product_hunt",
    source_id: post.id,
    status: "pending",
    raw_data: {
      name: post.name,
      website_url: post.website ?? null,
      logo_url: post.thumbnail?.url ?? null,
      short_description: post.tagline,
      producthunt_votes: post.votesCount,
      launch_date: post.createdAt.slice(0, 10), // ISO date
    },
  }
}

export async function fetchProductHuntPosts(
  apiToken: string,
  hoursBack = 24
): Promise<NormalizedStagingRecord[]> {
  const postedAfter = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

  const query = `
    query {
      posts(order: NEWEST, postedAfter: "${postedAfter}", topic: "artificial-intelligence") {
        edges {
          node {
            id
            name
            tagline
            url
            website
            votesCount
            createdAt
            thumbnail { url }
          }
        }
      }
    }
  `

  const res = await fetch(PH_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error(`Product Hunt API error: ${res.status} ${res.statusText}`)

  const json: PHResponse = await res.json()
  return json.data.posts.edges.map(({ node }) => normalizeProductHuntPost(node))
}
EOF
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/ingest/
git commit -m "feat: add Product Hunt ingest module with normalization"
```

---

### Task 2: GitHub ingest module

**Files:**
- Create: `services/ingest/src/github.ts`
- Create: `services/ingest/src/__tests__/github.test.ts`

- [ ] **Step 1: Write failing test**

```bash
cat > services/ingest/src/__tests__/github.test.ts << 'EOF'
import { describe, it, expect } from "vitest"
import { normalizeGitHubRepo } from "../github"

describe("normalizeGitHubRepo", () => {
  it("maps GitHub repo fields to staging_tools shape", () => {
    const repo = {
      id: 12345678,
      name: "awesome-llm-tool",
      full_name: "someuser/awesome-llm-tool",
      description: "An awesome LLM tool for developers",
      html_url: "https://github.com/someuser/awesome-llm-tool",
      homepage: "https://awesomellm.dev",
      stargazers_count: 1250,
      pushed_at: "2026-03-09T14:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
      topics: ["llm", "ai-tools"],
    }

    const result = normalizeGitHubRepo(repo)

    expect(result.source).toBe("github")
    expect(result.source_id).toBe("12345678")
    expect(result.raw_data.name).toBe("awesome-llm-tool")
    expect(result.raw_data.github_url).toBe("https://github.com/someuser/awesome-llm-tool")
    expect(result.raw_data.website_url).toBe("https://awesomellm.dev")
    expect(result.raw_data.github_stars).toBe(1250)
    expect(result.raw_data.open_source).toBe(true)
    expect(result.raw_data.github_last_commit).toBe("2026-03-09")
  })

  it("uses null for website when homepage is empty string", () => {
    const repo = {
      id: 99,
      name: "no-homepage",
      full_name: "user/no-homepage",
      description: "No homepage",
      html_url: "https://github.com/user/no-homepage",
      homepage: "",
      stargazers_count: 100,
      pushed_at: "2026-01-01T00:00:00Z",
      created_at: "2025-01-01T00:00:00Z",
      topics: [],
    }

    const result = normalizeGitHubRepo(repo)
    expect(result.raw_data.website_url).toBeNull()
  })
})
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module '../github'"

- [ ] **Step 3: Implement github module**

```bash
cat > services/ingest/src/github.ts << 'EOF'
const GITHUB_API_URL = "https://api.github.com"
const AI_TOPICS = ["artificial-intelligence", "llm", "ai-tools", "generative-ai"]
const MIN_STARS = 50

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null | ""
  stargazers_count: number
  pushed_at: string
  created_at: string
  topics: string[]
}

export interface NormalizedGitHubRecord {
  source: "github"
  source_id: string
  status: "pending"
  raw_data: {
    name: string
    website_url: string | null
    github_url: string
    short_description: string | null
    github_stars: number
    github_last_commit: string
    open_source: boolean
    launch_date: string
  }
}

export function normalizeGitHubRepo(repo: GitHubRepo): NormalizedGitHubRecord {
  return {
    source: "github",
    source_id: String(repo.id),
    status: "pending",
    raw_data: {
      name: repo.name,
      website_url: repo.homepage && repo.homepage.trim() !== "" ? repo.homepage : null,
      github_url: repo.html_url,
      short_description: repo.description,
      github_stars: repo.stargazers_count,
      github_last_commit: repo.pushed_at.slice(0, 10),
      open_source: true,
      launch_date: repo.created_at.slice(0, 10),
    },
  }
}

export async function fetchGitHubRepos(
  token: string
): Promise<NormalizedGitHubRecord[]> {
  const results: NormalizedGitHubRecord[] = []
  const seen = new Set<number>()

  for (const topic of AI_TOPICS) {
    const url = `${GITHUB_API_URL}/search/repositories?q=topic:${topic}+stars:>=${MIN_STARS}&sort=updated&order=desc&per_page=100`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    })

    if (!res.ok) {
      console.error(`GitHub API error for topic ${topic}: ${res.status}`)
      continue
    }

    const json: { items: GitHubRepo[] } = await res.json()

    for (const repo of json.items) {
      if (!seen.has(repo.id)) {
        seen.add(repo.id)
        results.push(normalizeGitHubRepo(repo))
      }
    }

    // Respect GitHub rate limits — 1s between topic queries
    await new Promise((r) => setTimeout(r, 1000))
  }

  return results
}
EOF
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/ingest/src/github.ts services/ingest/src/__tests__/github.test.ts
git commit -m "feat: add GitHub ingest module"
```

---

### Task 3: Directories scraper module

**Files:**
- Create: `services/ingest/src/directories.ts`
- Create: `services/ingest/src/__tests__/directories.test.ts`

- [ ] **Step 1: Add cheerio dependency**

```bash
cd services/ingest
# Add cheerio to package.json dependencies
cat > package.json << 'EOF'
{
  "name": "@roadmapper/ingest",
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
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "@types/cheerio": "^0.22.35",
    "vitest": "^2.1.0",
    "typescript": "^5.7.0"
  }
}
EOF
pnpm install
```

- [ ] **Step 2: Write failing test**

```bash
cat > services/ingest/src/__tests__/directories.test.ts << 'EOF'
import { describe, it, expect } from "vitest"
import { extractToolsFromHtml, normalizeDirectoryTool } from "../directories"

const SAMPLE_HTML = `
<div class="tool-card" data-name="TestTool AI" data-url="https://testtool.ai">
  <h3>TestTool AI</h3>
  <p class="description">An AI tool for testing purposes with amazing features.</p>
  <a class="website-link" href="https://testtool.ai">Visit</a>
  <span class="category">Productivity</span>
</div>
<div class="tool-card" data-name="Another Tool" data-url="https://anothertool.com">
  <h3>Another Tool</h3>
  <p class="description">Does amazing things with AI.</p>
  <a class="website-link" href="https://anothertool.com">Visit</a>
  <span class="category">Analytics</span>
</div>
`

describe("normalizeDirectoryTool", () => {
  it("produces correct staging record shape", () => {
    const result = normalizeDirectoryTool({
      name: "TestTool AI",
      website_url: "https://testtool.ai",
      description: "An AI tool for testing",
      categories: ["Productivity"],
    }, "futurepedia")

    expect(result.source).toBe("futurepedia")
    expect(result.raw_data.name).toBe("TestTool AI")
    expect(result.raw_data.website_url).toBe("https://testtool.ai")
    expect(result.status).toBe("pending")
  })
})

describe("extractToolsFromHtml", () => {
  it("is a function that accepts html and a selector config", () => {
    // The extraction logic is configurable per directory source
    expect(typeof extractToolsFromHtml).toBe("function")
  })
})
EOF
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module '../directories'"

- [ ] **Step 4: Implement directories module**

```bash
cat > services/ingest/src/directories.ts << 'EOF'
import * as cheerio from "cheerio"

export type DirectorySource = "futurepedia" | "taaft"

interface RawDirectoryTool {
  name: string
  website_url: string | null
  description: string | null
  categories: string[]
}

export interface NormalizedDirectoryRecord {
  source: DirectorySource
  source_id: string | null
  status: "pending"
  raw_data: {
    name: string
    website_url: string | null
    short_description: string | null
    categories: string[]
  }
}

export function normalizeDirectoryTool(
  tool: RawDirectoryTool,
  source: DirectorySource
): NormalizedDirectoryRecord {
  return {
    source,
    source_id: tool.website_url ?? null,
    status: "pending",
    raw_data: {
      name: tool.name,
      website_url: tool.website_url,
      short_description: tool.description,
      categories: tool.categories,
    },
  }
}

interface SelectorConfig {
  toolCard: string
  name: string
  description: string
  link: string
  category: string
}

// Configurable per-directory HTML extraction
const FUTUREPEDIA_SELECTORS: SelectorConfig = {
  toolCard: ".tool-card",
  name: "h3",
  description: "p.description",
  link: "a.website-link",
  category: "span.category",
}

export function extractToolsFromHtml(
  html: string,
  source: DirectorySource,
  selectors: SelectorConfig = FUTUREPEDIA_SELECTORS
): NormalizedDirectoryRecord[] {
  const $ = cheerio.load(html)
  const tools: NormalizedDirectoryRecord[] = []

  $(selectors.toolCard).each((_, el) => {
    const name = $(el).find(selectors.name).text().trim()
    const description = $(el).find(selectors.description).text().trim()
    const link = $(el).find(selectors.link).attr("href") ?? null
    const category = $(el).find(selectors.category).text().trim()

    if (!name) return

    tools.push(
      normalizeDirectoryTool(
        {
          name,
          website_url: link,
          description: description || null,
          categories: category ? [category] : [],
        },
        source
      )
    )
  })

  return tools
}

export async function fetchDirectoryPage(
  url: string,
  source: DirectorySource,
  selectors?: SelectorConfig
): Promise<NormalizedDirectoryRecord[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "AI-Tool-Roadmapper/1.0 (+https://github.com/your-repo)" },
  })

  if (!res.ok) {
    console.error(`Directory fetch failed for ${url}: ${res.status}`)
    return []
  }

  const html = await res.text()
  return extractToolsFromHtml(html, source, selectors)
}
EOF
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Create ingest index**

```bash
cat > services/ingest/src/index.ts << 'EOF'
export * from "./product-hunt"
export * from "./github"
export * from "./directories"
EOF
```

- [ ] **Step 7: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/ingest/
git commit -m "feat: add directory scraper ingest module"
```

---

## Chunk 2: Enrichment Services

### Task 4: Deduplicator module

**Files:**
- Create: `services/enrich/package.json`
- Create: `services/enrich/tsconfig.json`
- Create: `services/enrich/src/deduplicator.ts`
- Create: `services/enrich/src/__tests__/deduplicator.test.ts`

- [ ] **Step 1: Write failing test**

```bash
mkdir -p services/enrich/src/__tests__
cat > services/enrich/package.json << 'EOF'
{
  "name": "@roadmapper/enrich",
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
    "@roadmapper/scoring": "workspace:*",
    "cheerio": "^1.0.0",
    "openai": "^4.70.0"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "typescript": "^5.7.0"
  }
}
EOF

cat > services/enrich/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src"]
}
EOF

cat > services/enrich/src/__tests__/deduplicator.test.ts << 'EOF'
import { describe, it, expect } from "vitest"
import { canonicalizeDomain, generateSlug, isDuplicate } from "../deduplicator"

describe("canonicalizeDomain", () => {
  it("strips www prefix", () => {
    expect(canonicalizeDomain("https://www.toolname.com/pricing")).toBe("toolname.com")
  })

  it("strips subdomains", () => {
    expect(canonicalizeDomain("https://app.toolname.com/dashboard")).toBe("toolname.com")
  })

  it("returns null for invalid URL", () => {
    expect(canonicalizeDomain("not-a-url")).toBeNull()
    expect(canonicalizeDomain(null)).toBeNull()
  })

  it("handles URLs without www or subdomains", () => {
    expect(canonicalizeDomain("https://toolname.com")).toBe("toolname.com")
  })
})

describe("generateSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(generateSlug("Awesome AI Tool")).toBe("awesome-ai-tool")
  })

  it("strips punctuation", () => {
    expect(generateSlug("Tool.AI (Beta)")).toBe("toolai-beta")
  })
})

describe("isDuplicate", () => {
  it("returns true when canonical domains match", () => {
    const existing = [
      { website_url: "https://www.toolname.com", slug: "toolname" },
    ]
    expect(isDuplicate("https://app.toolname.com", "toolname-v2", existing)).toBe(true)
  })

  it("returns true when slugs match", () => {
    const existing = [
      { website_url: null, slug: "awesome-ai-tool" },
    ]
    expect(isDuplicate(null, "awesome-ai-tool", existing)).toBe(true)
  })

  it("returns false when no match", () => {
    const existing = [
      { website_url: "https://othertool.com", slug: "other-tool" },
    ]
    expect(isDuplicate("https://newtool.com", "new-tool", existing)).toBe(false)
  })

  it("returns false for empty existing list", () => {
    expect(isDuplicate("https://newtool.com", "new-tool", [])).toBe(false)
  })
})
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd services/enrich && pnpm install && pnpm test
```

Expected: FAIL — "Cannot find module '../deduplicator'"

- [ ] **Step 3: Implement deduplicator**

```bash
cat > services/enrich/src/deduplicator.ts << 'EOF'
export function canonicalizeDomain(url: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    // Strip www. and all subdomains to get root domain
    const parts = parsed.hostname.split(".")
    if (parts.length >= 2) {
      return parts.slice(-2).join(".")
    }
    return parsed.hostname
  } catch {
    return null
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface ExistingTool {
  website_url: string | null
  slug: string
}

export function isDuplicate(
  websiteUrl: string | null,
  slug: string,
  existing: ExistingTool[]
): boolean {
  const incomingDomain = canonicalizeDomain(websiteUrl)

  for (const tool of existing) {
    // Domain match (primary)
    if (incomingDomain && tool.website_url) {
      const existingDomain = canonicalizeDomain(tool.website_url)
      if (existingDomain && existingDomain === incomingDomain) return true
    }
    // Slug match (fallback, e.g. GitHub repos with no homepage)
    if (tool.slug === slug) return true
  }

  return false
}
EOF
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/enrich/
git commit -m "feat: add deduplicator module with TDD"
```

---

### Task 5: Scraper module

**Files:**
- Create: `services/enrich/src/scraper.ts`
- Create: `services/enrich/src/__tests__/scraper.test.ts`

- [ ] **Step 1: Write failing test**

```bash
cat > services/enrich/src/__tests__/scraper.test.ts << 'EOF'
import { describe, it, expect } from "vitest"
import { extractTextFromHtml, buildEnrichmentInput } from "../scraper"

describe("extractTextFromHtml", () => {
  it("strips HTML tags and returns plain text", () => {
    const html = "<div><h1>Tool Name</h1><p>A great tool for AI tasks.</p></div>"
    const result = extractTextFromHtml(html)
    expect(result).toContain("Tool Name")
    expect(result).toContain("A great tool for AI tasks.")
    expect(result).not.toContain("<h1>")
  })

  it("truncates to specified length", () => {
    const html = "<p>" + "x".repeat(5000) + "</p>"
    const result = extractTextFromHtml(html, 1000)
    expect(result.length).toBeLessThanOrEqual(1000)
  })
})

describe("buildEnrichmentInput", () => {
  it("combines tool data into enrichment input object", () => {
    const input = buildEnrichmentInput({
      name: "TestTool",
      description: "A test tool",
      homepageText: "Homepage content here",
      pricingText: "$49/month per seat",
      githubReadme: null,
    })

    expect(input.name).toBe("TestTool")
    expect(input.description).toBe("A test tool")
    expect(input.homepageHtml).toBe("Homepage content here")
    expect(input.pricingHtml).toBe("$49/month per seat")
    expect(input.githubReadme).toBeNull()
  })
})
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module '../scraper'"

- [ ] **Step 3: Implement scraper**

```bash
cat > services/enrich/src/scraper.ts << 'EOF'
import * as cheerio from "cheerio"

export function extractTextFromHtml(html: string, maxLength = 3000): string {
  const $ = cheerio.load(html)
  // Remove script/style tags
  $("script, style, nav, footer, header").remove()
  const text = $.text().replace(/\s+/g, " ").trim()
  return text.slice(0, maxLength)
}

export interface EnrichmentInput {
  name: string
  description: string
  homepageHtml: string
  pricingHtml: string | null
  githubReadme: string | null
}

export function buildEnrichmentInput(data: {
  name: string
  description: string
  homepageText: string
  pricingText: string | null
  githubReadme: string | null
}): EnrichmentInput {
  return {
    name: data.name,
    description: data.description,
    homepageHtml: data.homepageText,
    pricingHtml: data.pricingText,
    githubReadme: data.githubReadme,
  }
}

export async function scrapeToolPage(url: string): Promise<{
  homepageText: string
  pricingText: string | null
}> {
  const headers = {
    "User-Agent": "AI-Tool-Roadmapper/1.0",
  }

  let homepageText = ""
  let pricingText: string | null = null

  try {
    const homeRes = await fetch(url, { headers })
    if (homeRes.ok) {
      const html = await homeRes.text()
      homepageText = extractTextFromHtml(html, 3000)
    }
  } catch (e) {
    console.warn(`Failed to fetch homepage ${url}:`, e)
  }

  try {
    const pricingUrl = new URL("/pricing", url).toString()
    const priceRes = await fetch(pricingUrl, { headers })
    if (priceRes.ok) {
      const html = await priceRes.text()
      pricingText = extractTextFromHtml(html, 2000)
    }
  } catch {
    // Pricing page not available — not an error
  }

  return { homepageText, pricingText }
}
EOF
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/enrich/src/scraper.ts services/enrich/src/__tests__/scraper.test.ts
git commit -m "feat: add scraper module"
```

---

### Task 6: LLM Classifier module

**Files:**
- Create: `services/enrich/src/classifier.ts`
- Create: `services/enrich/src/__tests__/classifier.test.ts`

- [ ] **Step 1: Write failing test**

```bash
cat > services/enrich/src/__tests__/classifier.test.ts << 'EOF'
import { describe, it, expect, vi } from "vitest"
import { parseEnrichmentResponse } from "../classifier"

describe("parseEnrichmentResponse", () => {
  it("parses valid enrichment JSON", () => {
    const raw = JSON.stringify({
      primary_category: "AI Sales",
      secondary_categories: ["CRM"],
      use_cases: ["lead gen"],
      target_personas: ["founders"],
      pricing_model: "seat",
      starting_price_monthly: 49,
      free_tier: false,
      has_api: true,
      self_hostable: false,
      integrations: ["Salesforce"],
      best_for: ["B2B"],
      not_ideal_for: ["enterprise"],
    })

    const result = parseEnrichmentResponse(raw)
    expect(result.primary_category).toBe("AI Sales")
    expect(result.pricing_model).toBe("seat")
    expect(result.has_api).toBe(true)
  })

  it("throws on invalid JSON", () => {
    expect(() => parseEnrichmentResponse("not json")).toThrow()
  })

  it("throws on schema mismatch", () => {
    const badJson = JSON.stringify({ primary_category: "Sales" }) // missing required fields
    expect(() => parseEnrichmentResponse(badJson)).toThrow()
  })
})
EOF
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL — "Cannot find module '../classifier'"

- [ ] **Step 3: Implement classifier**

```bash
cat > services/enrich/src/classifier.ts << 'EOF'
import OpenAI from "openai"
import { EnrichmentOutputSchema, type EnrichmentOutput } from "@roadmapper/schemas"
import { buildEnrichmentPrompt } from "@roadmapper/prompts"
import type { EnrichmentInput } from "./scraper"

export function parseEnrichmentResponse(raw: string): EnrichmentOutput {
  const parsed = JSON.parse(raw) // throws on invalid JSON
  return EnrichmentOutputSchema.parse(parsed) // throws on schema mismatch
}

export async function classifyTool(
  input: EnrichmentInput,
  openaiApiKey: string
): Promise<EnrichmentOutput> {
  const client = new OpenAI({ apiKey: openaiApiKey })

  const prompt = buildEnrichmentPrompt(input)

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_schema", json_schema: {
      name: "enrichment_output",
      strict: true,
      schema: {
        type: "object",
        properties: {
          primary_category: { type: "string" },
          secondary_categories: { type: "array", items: { type: "string" } },
          use_cases: { type: "array", items: { type: "string" } },
          target_personas: { type: "array", items: { type: "string" } },
          pricing_model: { type: "string", enum: ["seat", "usage", "flat", "open-source"] },
          starting_price_monthly: { type: ["number", "null"] },
          free_tier: { type: "boolean" },
          has_api: { type: "boolean" },
          self_hostable: { type: "boolean" },
          integrations: { type: "array", items: { type: "string" } },
          best_for: { type: "array", items: { type: "string" } },
          not_ideal_for: { type: "array", items: { type: "string" } },
        },
        required: [
          "primary_category", "secondary_categories", "use_cases",
          "target_personas", "pricing_model", "starting_price_monthly",
          "free_tier", "has_api", "self_hostable", "integrations",
          "best_for", "not_ideal_for"
        ],
        additionalProperties: false,
      }
    }},
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("Empty response from OpenAI")

  return parseEnrichmentResponse(content)
}
EOF
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Write enrich index**

```bash
cat > services/enrich/src/index.ts << 'EOF'
export * from "./deduplicator"
export * from "./scraper"
export * from "./classifier"
EOF
```

- [ ] **Step 6: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add services/enrich/src/classifier.ts services/enrich/src/__tests__/classifier.test.ts services/enrich/src/index.ts
git commit -m "feat: add LLM classifier module"
```

---

## Chunk 3: Inngest Functions

### Task 7: Set up Inngest client and serve handler

**Files:**
- Create: `apps/web/inngest/client.ts`
- Create: `apps/web/app/api/inngest/route.ts`

- [ ] **Step 1: Create Inngest client**

```bash
mkdir -p /Users/nolanselby/ai-tool-roadmapper/apps/web/inngest/functions
mkdir -p /Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/inngest

cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/inngest/client.ts << 'EOF'
import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "ai-tool-roadmapper",
  eventKey: process.env.INNGEST_EVENT_KEY,
})
EOF
```

- [ ] **Step 2: Create Inngest serve handler**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/app/api/inngest/route.ts << 'EOF'
import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { ingestProductHuntFn } from "@/inngest/functions/ingest-product-hunt"
import { ingestGitHubFn } from "@/inngest/functions/ingest-github"
import { ingestDirectoriesFn } from "@/inngest/functions/ingest-directories"
import { enrichProcessToolFn } from "@/inngest/functions/enrich-process-tool"
import { plannerGenerateRoadmapFn } from "@/inngest/functions/planner-generate-roadmap"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    ingestProductHuntFn,
    ingestGitHubFn,
    ingestDirectoriesFn,
    enrichProcessToolFn,
    plannerGenerateRoadmapFn,
  ],
})
EOF
```

- [ ] **Step 3: Update tsconfig paths in apps/web to support @/ alias**

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
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
```

- [ ] **Step 4: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add apps/web/inngest/client.ts apps/web/app/api/inngest/route.ts apps/web/tsconfig.json
git commit -m "feat: add Inngest client and serve handler"
```

---

### Task 8: Ingest Inngest functions (cron)

**Files:**
- Create: `apps/web/inngest/functions/ingest-product-hunt.ts`
- Create: `apps/web/inngest/functions/ingest-github.ts`
- Create: `apps/web/inngest/functions/ingest-directories.ts`

- [ ] **Step 1: Create Product Hunt cron function**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/inngest/functions/ingest-product-hunt.ts << 'EOF'
import { inngest } from "../client"
import { fetchProductHuntPosts } from "@roadmapper/ingest"
import { createServerClient } from "@roadmapper/db"

export const ingestProductHuntFn = inngest.createFunction(
  { id: "ingest-product-hunt", name: "Daily Product Hunt Ingest" },
  { cron: "0 2 * * *" }, // 2am UTC daily
  async ({ step, logger }) => {
    const token = process.env.PRODUCT_HUNT_API_TOKEN!

    const posts = await step.run("fetch-posts", () =>
      fetchProductHuntPosts(token, 24)
    )

    logger.info(`Fetched ${posts.length} Product Hunt posts`)

    if (posts.length === 0) return { inserted: 0 }

    const db = createServerClient()

    const { error } = await step.run("insert-staging", () =>
      db.from("staging_tools").insert(
        posts.map((p) => ({
          raw_data: p.raw_data,
          source: p.source,
          source_id: p.source_id,
          status: "pending",
        }))
      )
    )

    if (error) throw new Error(`DB insert failed: ${error.message}`)

    // Trigger enrichment for each new record
    await step.sendEvent("trigger-enrichment", {
      name: "ingest/complete",
      data: { source: "product_hunt", count: posts.length },
    })

    return { inserted: posts.length }
  }
)
EOF
```

- [ ] **Step 2: Create GitHub cron function**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/inngest/functions/ingest-github.ts << 'EOF'
import { inngest } from "../client"
import { fetchGitHubRepos } from "@roadmapper/ingest"
import { createServerClient } from "@roadmapper/db"

export const ingestGitHubFn = inngest.createFunction(
  { id: "ingest-github", name: "Daily GitHub Ingest" },
  { cron: "30 2 * * *" }, // 2:30am UTC daily
  async ({ step, logger }) => {
    const token = process.env.GITHUB_TOKEN!

    const repos = await step.run("fetch-repos", () => fetchGitHubRepos(token))

    logger.info(`Fetched ${repos.length} GitHub repos`)

    if (repos.length === 0) return { inserted: 0 }

    const db = createServerClient()

    // Insert in batches of 100 to avoid payload limits
    const batches = []
    for (let i = 0; i < repos.length; i += 100) {
      batches.push(repos.slice(i, i + 100))
    }

    let inserted = 0
    for (const batch of batches) {
      await step.run(`insert-batch-${inserted}`, async () => {
        const { error } = await db.from("staging_tools").insert(
          batch.map((r) => ({
            raw_data: r.raw_data,
            source: r.source,
            source_id: r.source_id,
            status: "pending",
          }))
        )
        if (error) throw new Error(`DB insert failed: ${error.message}`)
      })
      inserted += batch.length
    }

    await step.sendEvent("trigger-enrichment", {
      name: "ingest/complete",
      data: { source: "github", count: inserted },
    })

    return { inserted }
  }
)
EOF
```

- [ ] **Step 3: Create directories cron function**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/inngest/functions/ingest-directories.ts << 'EOF'
import { inngest } from "../client"
import { fetchDirectoryPage } from "@roadmapper/ingest"
import { createServerClient } from "@roadmapper/db"

// Futurepedia category pages — update these URLs as needed
const DIRECTORY_SOURCES = [
  { url: "https://www.futurepedia.io/ai-tools", source: "futurepedia" as const },
  { url: "https://www.futurepedia.io/ai-tools/productivity", source: "futurepedia" as const },
  { url: "https://www.futurepedia.io/ai-tools/sales", source: "futurepedia" as const },
]

const RATE_LIMIT_MS = 1000 // 1 request per second per domain

export const ingestDirectoriesFn = inngest.createFunction(
  { id: "ingest-directories", name: "Daily Directory Ingest" },
  { cron: "0 3 * * *" }, // 3am UTC daily
  async ({ step, logger }) => {
    const db = createServerClient()
    let totalInserted = 0

    for (const { url, source } of DIRECTORY_SOURCES) {
      const tools = await step.run(`fetch-${source}-${url.split("/").pop()}`, async () => {
        await new Promise((r) => setTimeout(r, RATE_LIMIT_MS))
        return fetchDirectoryPage(url, source)
      })

      logger.info(`Fetched ${tools.length} tools from ${url}`)

      if (tools.length === 0) continue

      await step.run(`insert-${source}-${totalInserted}`, async () => {
        const { error } = await db.from("staging_tools").insert(
          tools.map((t) => ({
            raw_data: t.raw_data,
            source: t.source,
            source_id: t.source_id,
            status: "pending",
          }))
        )
        if (error) throw new Error(`DB insert failed: ${error.message}`)
      })

      totalInserted += tools.length
    }

    if (totalInserted > 0) {
      await step.sendEvent("trigger-enrichment", {
        name: "ingest/complete",
        data: { source: "directory", count: totalInserted },
      })
    }

    return { inserted: totalInserted }
  }
)
EOF
```

- [ ] **Step 4: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add apps/web/inngest/functions/ingest-product-hunt.ts apps/web/inngest/functions/ingest-github.ts apps/web/inngest/functions/ingest-directories.ts
git commit -m "feat: add daily cron Inngest functions for all ingest sources"
```

---

### Task 9: Enrich process-tool Inngest function

**Files:**
- Create: `apps/web/inngest/functions/enrich-process-tool.ts`

- [ ] **Step 1: Create enrichment fan-out listener**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/inngest/functions/enrich-process-tool.ts << 'EOF'
import { inngest } from "../client"
import { createServerClient } from "@roadmapper/db"
import {
  canonicalizeDomain,
  generateSlug,
  isDuplicate,
  scrapeToolPage,
  buildEnrichmentInput,
  classifyTool,
} from "@roadmapper/enrich"
import {
  freshnessScore,
  popularityScore,
  sourceComponent,
  maintenanceScore,
  trustScore,
  isStatusActive,
} from "@roadmapper/scoring"
import OpenAI from "openai"

export const enrichProcessToolFn = inngest.createFunction(
  {
    id: "enrich-process-tool",
    name: "Enrich: Process Staged Tool",
    retries: 3,
    throttle: { limit: 10, period: "1m" }, // max 10 enrichments per minute (OpenAI rate limit)
  },
  { event: "tool/enrich" },
  async ({ event, step, logger }) => {
    const { stagingId } = event.data as { stagingId: string }
    const db = createServerClient()

    // 1. Fetch staging record
    const { data: staging, error: fetchError } = await step.run("fetch-staging", () =>
      db.from("staging_tools").select("*").eq("id", stagingId).single()
    )

    if (fetchError || !staging) throw new Error(`Staging record not found: ${stagingId}`)

    const raw = staging.raw_data as Record<string, unknown>
    const websiteUrl = (raw.website_url as string | null) ?? null
    const name = raw.name as string
    const slug = generateSlug(name)

    // 2. Dedupe check
    const { data: existingTools } = await step.run("check-duplicates", () =>
      db.from("tools").select("slug, website_url")
    )

    if (isDuplicate(websiteUrl, slug, existingTools ?? [])) {
      // Update signals only for the matched tool
      logger.info(`Duplicate detected for ${name}, updating signals only`)

      await step.run("mark-duplicate", () =>
        db.from("staging_tools").update({ status: "duplicate" }).eq("id", stagingId)
      )

      return { status: "duplicate", name }
    }

    // Mark as enriching
    await step.run("mark-enriching", () =>
      db.from("staging_tools").update({ status: "enriching" }).eq("id", stagingId)
    )

    // 3. Scrape pages
    const scraped = await step.run("scrape-pages", async () => {
      if (!websiteUrl) return { homepageText: "", pricingText: null }
      return scrapeToolPage(websiteUrl)
    })

    // 4. LLM extraction
    const enrichment = await step.run("llm-classify", () =>
      classifyTool(
        buildEnrichmentInput({
          name,
          description: (raw.short_description as string) ?? "",
          homepageText: scraped.homepageText,
          pricingText: scraped.pricingText,
          githubReadme: null,
        }),
        process.env.OPENAI_API_KEY!
      )
    )

    // 5. Generate embedding
    const embeddingText = `${name} — ${raw.short_description ?? ""}. Use cases: ${enrichment.use_cases.join(", ")}`
    const embedding = await step.run("generate-embedding", async () => {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
      const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: embeddingText,
      })
      return res.data[0].embedding
    })

    // 6. Compute scores
    const launchDate = (raw.launch_date as string | null) ?? null
    const githubStars = (raw.github_stars as number) ?? 0
    const phVotes = (raw.producthunt_votes as number) ?? 0
    const githubLastCommit = (raw.github_last_commit as string | null) ?? null
    const isOpenSource = (raw.open_source as boolean) ?? false
    const sourceCount =
      (staging.source === "product_hunt" ? 1 : 0) +
      (staging.source === "github" ? 1 : 0) +
      (staging.source === "futurepedia" || staging.source === "taaft" ? 1 : 0)

    const fScore = freshnessScore(launchDate)
    const pScore = popularityScore({ githubStars, phVotes, sourceCount })
    const mScore = maintenanceScore(githubLastCommit, isOpenSource)
    const sComponent = sourceComponent(sourceCount)
    const tScore = trustScore({
      freshnessScore: fScore,
      popularityScore: pScore,
      maintenanceScore: mScore,
      sourceComponent: sComponent,
    })
    const active = isStatusActive(tScore)

    // 7. Write to tools table
    const toolRecord = {
      name,
      slug,
      website_url: websiteUrl,
      logo_url: (raw.logo_url as string | null) ?? null,
      short_description: (raw.short_description as string | null) ?? null,
      github_url: (raw.github_url as string | null) ?? null,
      open_source: isOpenSource,
      launch_date: launchDate,
      status_active: active,
      last_verified_at: new Date().toISOString(),
    }

    const { data: tool, error: insertError } = await step.run("insert-tool", () =>
      db.from("tools").upsert({ ...toolRecord }, { onConflict: "slug" }).select("id").single()
    )

    if (insertError || !tool) {
      await db.from("staging_tools").update({
        status: "failed",
        error_message: insertError?.message ?? "Unknown error",
      }).eq("id", stagingId)
      throw new Error(`Failed to insert tool: ${insertError?.message}`)
    }

    // Insert child records and embedding in parallel
    await step.run("insert-metadata-pricing-signals", async () => {
      await Promise.all([
        db.from("tool_metadata").upsert({
          tool_id: tool.id,
          categories: [enrichment.primary_category, ...enrichment.secondary_categories],
          use_cases: enrichment.use_cases,
          target_personas: enrichment.target_personas,
          api_available: enrichment.has_api,
          self_hostable: enrichment.self_hostable,
          integrations: enrichment.integrations,
        }),
        db.from("tool_pricing").upsert({
          tool_id: tool.id,
          free_tier: enrichment.free_tier,
          starting_price_monthly: enrichment.starting_price_monthly,
          pricing_model: enrichment.pricing_model,
        }),
        db.from("tool_signals").upsert({
          tool_id: tool.id,
          github_stars: githubStars,
          github_last_commit: githubLastCommit,
          producthunt_votes: phVotes,
          source_count: sourceCount,
          freshness_score: fScore,
          popularity_score: pScore,
          maintenance_score: mScore,
          trust_score: tScore,
          last_computed_at: new Date().toISOString(),
        }),
        // Store embedding via raw SQL (pgvector)
        db.rpc("update_tool_embedding", { tool_id: tool.id, embedding }),
      ])
    })

    await step.run("mark-enriched", () =>
      db.from("staging_tools").update({ status: "enriched" }).eq("id", stagingId)
    )

    logger.info(`Enriched tool: ${name} (active=${active}, trust=${tScore.toFixed(2)})`)
    return { status: "enriched", name, active, trustScore: tScore }
  }
)
EOF
```

- [ ] **Step 2: Create the pgvector embedding update RPC**

Add this to a new migration file:

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/packages/db/supabase/migrations/0003_embedding_rpc.sql << 'EOF'
-- RPC to update tool embedding (pgvector type not directly supported by Supabase JS client)
CREATE OR REPLACE FUNCTION update_tool_embedding(tool_id uuid, embedding vector(1536))
RETURNS void AS $$
  UPDATE tools SET embedding = $2 WHERE id = $1;
$$ LANGUAGE sql;
EOF
```

- [ ] **Step 3: Create ingest/complete listener that fans out enrichment**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/apps/web/inngest/functions/enrich-fanout.ts << 'EOF'
import { inngest } from "../client"
import { createServerClient } from "@roadmapper/db"

// Triggered after each ingest job completes — fans out enrichment per pending staged tool
export const enrichFanoutFn = inngest.createFunction(
  { id: "enrich-fanout", name: "Enrich: Fan-out Pending Tools" },
  { event: "ingest/complete" },
  async ({ step, logger }) => {
    const db = createServerClient()

    const { data: pending } = await step.run("fetch-pending", () =>
      db.from("staging_tools")
        .select("id")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(500)
    )

    if (!pending || pending.length === 0) {
      logger.info("No pending staging tools to enrich")
      return { fanned_out: 0 }
    }

    await step.sendEvent(
      "fan-out-enrichment",
      pending.map((row) => ({
        name: "tool/enrich",
        data: { stagingId: row.id },
      }))
    )

    logger.info(`Fanned out enrichment for ${pending.length} tools`)
    return { fanned_out: pending.length }
  }
)
EOF
```

- [ ] **Step 4: Add enrichFanoutFn to the serve handler**

```bash
# Edit apps/web/app/api/inngest/route.ts to add the new function
# Open the file and add the import + function to the functions array
```

Update `apps/web/app/api/inngest/route.ts`:
```typescript
// Add import:
import { enrichFanoutFn } from "@/inngest/functions/enrich-fanout"

// Add to functions array:
enrichFanoutFn,
```

- [ ] **Step 5: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add apps/web/inngest/ packages/db/supabase/migrations/0003_embedding_rpc.sql
git commit -m "feat: add enrichment Inngest functions with fan-out"
```

---

## Chunk 4: Bulk Seed Script

### Task 10: Implement bulk seed script

**Files:**
- Modify: `scripts/bulk-seed.ts`

- [ ] **Step 1: Implement bulk seed**

```bash
cat > /Users/nolanselby/ai-tool-roadmapper/scripts/bulk-seed.ts << 'EOF'
/**
 * One-time bulk seed script.
 * Run: npx tsx scripts/bulk-seed.ts
 *
 * Pulls top AI tools from Product Hunt (all-time) + GitHub (top stars),
 * writes to staging_tools, then triggers enrichment fan-out.
 */
import { createServerClient } from "@roadmapper/db"
import { fetchGitHubRepos } from "@roadmapper/ingest"

// For Product Hunt all-time top, we use a longer lookback window
const PH_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql"

async function fetchAllTimePHTools(apiToken: string, limit = 500) {
  const query = `
    query {
      posts(order: VOTES, topic: "artificial-intelligence", first: ${limit}) {
        edges {
          node {
            id name tagline url website votesCount createdAt
            thumbnail { url }
          }
        }
      }
    }
  `
  const res = await fetch(PH_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`PH API error: ${res.status}`)
  const json = await res.json()
  return json.data.posts.edges.map(({ node }: { node: Record<string, unknown> }) => ({
    source: "product_hunt" as const,
    source_id: String(node.id),
    status: "pending" as const,
    raw_data: {
      name: node.name,
      website_url: node.website ?? null,
      logo_url: (node.thumbnail as { url: string } | null)?.url ?? null,
      short_description: node.tagline,
      producthunt_votes: node.votesCount,
      launch_date: (node.createdAt as string).slice(0, 10),
    },
  }))
}

async function main() {
  const db = createServerClient()

  console.log("Starting bulk seed...")

  // Product Hunt top 500
  const phToken = process.env.PRODUCT_HUNT_API_TOKEN
  if (!phToken) throw new Error("Missing PRODUCT_HUNT_API_TOKEN")
  console.log("Fetching Product Hunt top 500 AI tools...")
  const phTools = await fetchAllTimePHTools(phToken, 500)
  console.log(`Fetched ${phTools.length} PH tools`)

  // GitHub top repos
  const ghToken = process.env.GITHUB_TOKEN
  if (!ghToken) throw new Error("Missing GITHUB_TOKEN")
  console.log("Fetching GitHub AI repos (may take ~2 minutes due to rate limiting)...")
  const ghRepos = await fetchGitHubRepos(ghToken)
  const ghRecords = ghRepos.map((r) => ({
    source: r.source,
    source_id: r.source_id,
    status: r.status,
    raw_data: r.raw_data,
  }))
  console.log(`Fetched ${ghRecords.length} GitHub repos`)

  // Insert all into staging_tools in batches
  const allRecords = [...phTools, ...ghRecords]
  console.log(`Inserting ${allRecords.length} records into staging_tools...`)

  for (let i = 0; i < allRecords.length; i += 100) {
    const batch = allRecords.slice(i, i + 100)
    const { error } = await db.from("staging_tools").insert(batch)
    if (error) {
      console.error(`Batch insert error at offset ${i}:`, error.message)
    } else {
      console.log(`Inserted batch ${i}–${i + batch.length}`)
    }
  }

  console.log("Bulk seed complete. Run enrichment fan-out next:")
  console.log("  Send event 'ingest/complete' to Inngest to trigger enrichment for all pending records.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
EOF
```

- [ ] **Step 2: Commit**

```bash
cd /Users/nolanselby/ai-tool-roadmapper
git add scripts/bulk-seed.ts packages/db/supabase/migrations/
git commit -m "feat: implement bulk seed script for initial tool population"
```

---

## Plan 2 Completion Checklist

- [ ] `services/ingest` — Product Hunt, GitHub, directories modules with tests
- [ ] `services/enrich` — deduplicator, scraper, classifier with TDD tests
- [ ] `apps/web/inngest/client.ts` — Inngest client initialized
- [ ] `apps/web/app/api/inngest/route.ts` — serve handler with all functions registered
- [ ] Inngest functions: ingest-product-hunt, ingest-github, ingest-directories (all with 2am–3am UTC crons)
- [ ] Inngest functions: enrich-fanout (listener for `ingest/complete`), enrich-process-tool (listener for `tool/enrich`)
- [ ] Migration `0003_embedding_rpc.sql` committed
- [ ] `scripts/bulk-seed.ts` fully implemented
- [ ] All unit tests pass (`pnpm test` from root)

**Apply migrations to Supabase before running bulk seed:**
```bash
supabase db push  # from the project root, requires supabase CLI
```

**Next:** Run Plan 3 — Planner Service & API Routes
