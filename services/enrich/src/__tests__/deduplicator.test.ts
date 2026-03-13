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
