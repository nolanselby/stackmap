import { describe, it, expect, vi } from "vitest"
import { parseBusinessTypeResponse } from "../business-type-detector"
import { BUSINESS_TYPES } from "@roadmapper/schemas"

describe("parseBusinessTypeResponse", () => {
  it("parses valid business type response", () => {
    const raw = JSON.stringify({ business_type: "ai_sdr", confidence: 0.92 })
    const result = parseBusinessTypeResponse(raw)
    expect(result.business_type).toBe("ai_sdr")
    expect(result.confidence).toBe(0.92)
  })

  it("throws on invalid business type", () => {
    const raw = JSON.stringify({ business_type: "ai_unknown", confidence: 0.5 })
    expect(() => parseBusinessTypeResponse(raw)).toThrow()
  })

  it("throws on malformed JSON", () => {
    expect(() => parseBusinessTypeResponse("not json")).toThrow()
  })

  it("accepts all 12 valid business types", () => {
    for (const type of BUSINESS_TYPES) {
      const raw = JSON.stringify({ business_type: type, confidence: 0.8 })
      expect(() => parseBusinessTypeResponse(raw)).not.toThrow()
    }
  })
})
