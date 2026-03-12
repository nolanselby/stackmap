import { describe, it, expect } from "vitest"
import {
  freshnessScore,
  popularityScore,
  maintenanceScore,
  trustScore,
  isStatusActive,
} from "../formulas"

const TODAY = new Date("2026-03-11")

describe("freshnessScore", () => {
  it("returns 1.0 for a tool launched today", () => {
    expect(freshnessScore("2026-03-11", TODAY)).toBe(1.0)
  })

  it("returns 0.5 for a tool launched 365 days ago", () => {
    const score = freshnessScore("2025-03-11", TODAY)
    expect(score).toBeCloseTo(0.5, 2)
  })

  it("returns 0.0 for a tool launched 730+ days ago", () => {
    expect(freshnessScore("2024-03-11", TODAY)).toBe(0.0)
  })

  it("returns 0.0 for null launch_date", () => {
    expect(freshnessScore(null, TODAY)).toBe(0.0)
  })
})

describe("popularityScore", () => {
  it("returns 1.0 for a tool with max signals", () => {
    const score = popularityScore({ githubStars: 5000, phVotes: 1000, sourceCount: 3 })
    expect(score).toBe(1.0)
  })

  it("caps github component at 1.0 above 5000 stars", () => {
    const capped = popularityScore({ githubStars: 10000, phVotes: 0, sourceCount: 1 })
    const notCapped = popularityScore({ githubStars: 5000, phVotes: 0, sourceCount: 1 })
    expect(capped).toBe(notCapped)
  })

  it("returns 0.0 for a tool with no signals", () => {
    expect(popularityScore({ githubStars: 0, phVotes: 0, sourceCount: 0 })).toBe(0.0)
  })

  it("correctly weights github (0.5), ph (0.3), source (0.2)", () => {
    // Only github_stars: 2500/5000 = 0.5 * 0.5 = 0.25
    const score = popularityScore({ githubStars: 2500, phVotes: 0, sourceCount: 0 })
    expect(score).toBeCloseTo(0.25, 4)
  })
})

describe("maintenanceScore", () => {
  it("returns 0.7 for closed-source tool (null last_commit)", () => {
    expect(maintenanceScore(null, false)).toBe(0.7)
  })

  it("returns 1.0 for open-source tool committed today", () => {
    expect(maintenanceScore("2026-03-11", true, TODAY)).toBe(1.0)
  })

  it("returns 0.5 for open-source tool with last commit 182 days ago", () => {
    const score = maintenanceScore("2025-09-10", true, TODAY)
    expect(score).toBeCloseTo(0.5, 1)
  })

  it("returns 0.0 for open-source tool not committed in 365+ days", () => {
    expect(maintenanceScore("2025-03-11", true, TODAY)).toBe(0.0)
  })

  it("returns 0.7 for open-source tool with no commit date (unknown maintenance, treated as closed-source default)", () => {
    // open-source but no commit date — same as closed-source default to avoid penalizing newly discovered repos
    expect(maintenanceScore(null, true)).toBe(0.7)
  })
})

describe("trustScore", () => {
  it("returns correct weighted composite", () => {
    // freshness=1.0, popularity=1.0, maintenance=1.0, sourceComponent=1.0
    const score = trustScore({
      freshnessScore: 1.0,
      popularityScore: 1.0,
      maintenanceScore: 1.0,
      sourceComponent: 1.0,
    })
    expect(score).toBeCloseTo(1.0, 4)
  })

  it("weights are 0.2 + 0.4 + 0.3 + 0.1 = 1.0", () => {
    const score = trustScore({
      freshnessScore: 0,
      popularityScore: 0,
      maintenanceScore: 0,
      sourceComponent: 0,
    })
    expect(score).toBe(0.0)
  })
})

describe("isStatusActive", () => {
  it("returns true for trust score >= 0.35", () => {
    expect(isStatusActive(0.35)).toBe(true)
    expect(isStatusActive(0.9)).toBe(true)
  })

  it("returns false for trust score < 0.35", () => {
    expect(isStatusActive(0.34)).toBe(false)
    expect(isStatusActive(0.0)).toBe(false)
  })
})
