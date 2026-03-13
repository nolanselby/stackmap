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
