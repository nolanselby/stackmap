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
