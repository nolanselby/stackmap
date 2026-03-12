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
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center space-y-4 max-w-md px-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {status === "timeout"
              ? "This is taking longer than expected"
              : "Something went wrong generating your roadmap"}
          </h2>
          <p className="text-gray-500 text-sm">
            {status === "timeout" ? "Try refreshing the page." : "Try again."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    )
  }

  if (!roadmap) return <LoadingState />

  return <RoadmapView roadmap={roadmap} shortId={shortId} />
}
