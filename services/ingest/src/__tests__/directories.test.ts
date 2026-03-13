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
