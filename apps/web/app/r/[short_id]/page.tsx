"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingState } from "@/components/roadmap/LoadingState"
import { RoadmapView } from "@/components/roadmap/RoadmapView"
import type { RoadmapResult } from "@roadmapper/schemas"

const POLL_INTERVAL_MS = 2000
const MAX_POLL_DURATION_MS = 5 * 60 * 1000 // 5 minutes

export default function RoadmapPage() {
  const params = useParams()
  const router = useRouter()
  const shortId = params.short_id as string

  const [status, setStatus] = useState<"generating" | "complete" | "failed" | "timeout">(
    "generating"
  )
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null)

  useEffect(() => {
    let stopped = false
    const startedAt = Date.now()

    async function poll() {
      if (stopped) return

      if (Date.now() - startedAt > MAX_POLL_DURATION_MS) {
        setStatus("timeout")
        return
      }

      try {
        const res = await fetch(`/api/roadmap/${shortId}`)
        if (res.status === 404) {
          setStatus("failed")
          return
        }
        const data = await res.json()

        if (data.status === "complete" && data.roadmap) {
          setRoadmap(data.roadmap)
          setStatus("complete")
          return
        }

        if (data.status === "failed") {
          setStatus("failed")
          return
        }

        // Still generating — poll again
        setTimeout(poll, POLL_INTERVAL_MS)
      } catch {
        setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    poll()
    return () => {
      stopped = true
    }
  }, [shortId])

  if (status === "generating") {
    return <LoadingState />
  }

  if (status === "failed" || status === "timeout") {
    const isTimeout = status === "timeout"
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "rgb(var(--paper))" }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 700px 500px at 50% 40%, rgba(242,98,34,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 text-center max-w-sm w-full">
          {/* CSS illustration — broken circuit */}
          <div className="flex justify-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(242,98,34,0.08)",
                border: "1px solid rgba(242,98,34,0.2)",
              }}
            >
              {isTimeout ? (
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
                  <circle cx="16" cy="16" r="12" stroke="rgba(242,98,34,0.4)" strokeWidth="1.5" />
                  <path d="M16 9v7l4 4" stroke="rgb(242,98,34)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
                  <path d="M8 24L24 8M8 8l16 16" stroke="rgb(242,98,34)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>
          </div>

          <div
            className="grain rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(var(--line), 0.7)",
              boxShadow: "0 2px 8px rgba(20,12,4,0.06), 0 12px 32px rgba(20,12,4,0.08)",
            }}
          >
            <h2
              className="display text-2xl leading-tight mb-3"
              style={{ color: "rgb(var(--ink))" }}
            >
              {isTimeout ? "Taking longer than expected" : "Something went wrong"}
            </h2>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgb(var(--muted))" }}
            >
              {isTimeout
                ? "The roadmap generation is taking too long. Try refreshing — it may already be ready."
                : "We couldn't generate your roadmap this time. It happens occasionally. Give it another try."}
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              {isTimeout && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:brightness-[0.97]"
                  style={{
                    background: "rgba(var(--line), 0.4)",
                    border: "1px solid rgba(var(--line), 0.8)",
                    color: "rgb(var(--ink))",
                  }}
                >
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                    <path d="M2 8a6 6 0 1 0 1.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M2 4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Refresh
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, rgb(242,98,34) 0%, rgb(192,73,15) 100%)",
                  color: "white",
                  boxShadow: "0 1px 4px rgba(242,98,34,0.3), 0 4px 12px rgba(242,98,34,0.18)",
                }}
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!roadmap) return <LoadingState />

  return <RoadmapView roadmap={roadmap} shortId={shortId} />
}
