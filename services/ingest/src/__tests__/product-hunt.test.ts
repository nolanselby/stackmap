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
