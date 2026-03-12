"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { RoadmapControls } from "./RoadmapControls"
import { RoadmapList } from "./RoadmapList"
import { ExportMenu } from "./ExportMenu"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RoadmapResult } from "@roadmapper/schemas"

// Lazy-load React Flow to avoid SSR issues
const RoadmapGraph = dynamic(
  () => import("./RoadmapGraph").then((m) => ({ default: m.RoadmapGraph })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-orange-50 animate-pulse rounded-xl" />
    ),
  }
)

interface RoadmapViewProps {
  roadmap: RoadmapResult
  shortId: string
}

export function RoadmapView({ roadmap, shortId }: RoadmapViewProps) {
  const [variant, setVariant] = useState<"best-overall" | "cheapest" | "open-source">(
    "best-overall"
  )
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph")
  const [budgetMonthly, setBudgetMonthly] = useState(1000)
  const [copied, setCopied] = useState(false)

  const totalCost =
    variant === "cheapest"
      ? roadmap.total_monthly_cost_cheapest
      : roadmap.total_monthly_cost_best_overall

  function handleShareCopy() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const businessLabel = roadmap.business_type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center gap-4 px-4 py-3 bg-white border-b border-orange-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">AI</span>
          </div>
          <span className="font-semibold text-gray-800 text-sm">{businessLabel} Roadmap</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShareCopy} className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Share"}
          </Button>
          <ExportMenu shortId={shortId} />
        </div>
      </header>

      {/* Controls */}
      <RoadmapControls
        variant={variant}
        onVariantChange={setVariant}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        budgetMonthly={budgetMonthly}
        onBudgetChange={setBudgetMonthly}
        totalCost={totalCost}
      />

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === "graph" ? (
          <div className="w-full h-full p-4">
            <RoadmapGraph
              roadmap={roadmap}
              variant={variant}
              budgetMonthly={budgetMonthly}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 max-w-3xl mx-auto">
            <RoadmapList
              roadmap={roadmap}
              variant={variant}
              budgetMonthly={budgetMonthly}
            />
          </div>
        )}
      </div>
    </div>
  )
}
