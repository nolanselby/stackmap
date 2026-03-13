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
