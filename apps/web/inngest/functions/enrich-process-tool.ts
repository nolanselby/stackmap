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
import type { EnrichmentOutput } from "@roadmapper/schemas"
import {
  freshnessScore,
  popularityScore,
  sourceComponent,
  maintenanceScore,
  trustScore,
  isStatusActive,
} from "@roadmapper/scoring"
import OpenAI from "openai"

// Suppress unused import warning — canonicalizeDomain is used for domain normalization elsewhere
void canonicalizeDomain

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
    const staging = await step.run("fetch-staging", async () => {
      const result = await db.from("staging_tools").select("*").eq("id", stagingId).single()
      if (result.error || !result.data) throw new Error(`Staging record not found: ${stagingId}`)
      return result.data
    }) as { id: string; raw_data: Record<string, unknown>; source: string }

    const raw = staging.raw_data as Record<string, unknown>
    const websiteUrl = (raw.website_url as string | null) ?? null
    const name = raw.name as string
    const slug = generateSlug(name)

    // 2. Dedupe check
    const existingTools = await step.run("check-duplicates", async () => {
      const result = await db.from("tools").select("slug, website_url")
      return result.data ?? []
    }) as Array<{ slug: string; website_url: string | null }>

    if (isDuplicate(websiteUrl, slug, existingTools)) {
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
    }) as { homepageText: string; pricingText: string | null }

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
    ) as EnrichmentOutput

    // 5. Generate embedding
    const embeddingText = `${name} — ${raw.short_description ?? ""}. Use cases: ${enrichment.use_cases.join(", ")}`
    const embedding = await step.run("generate-embedding", async () => {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
      const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: embeddingText,
      })
      return res.data[0].embedding
    }) as number[]

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

    const tool = await step.run("insert-tool", async () => {
      const result = await db
        .from("tools")
        .upsert({ ...toolRecord }, { onConflict: "slug" })
        .select("id")
        .single()
      if (result.error || !result.data) {
        await db
          .from("staging_tools")
          .update({ status: "failed", error_message: result.error?.message ?? "Unknown error" })
          .eq("id", stagingId)
        throw new Error(`Failed to insert tool: ${result.error?.message}`)
      }
      return result.data
    }) as { id: string }

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
