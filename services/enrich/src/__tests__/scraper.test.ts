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
