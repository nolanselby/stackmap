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
