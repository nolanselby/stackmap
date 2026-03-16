"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { RoadmapControls } from "./RoadmapControls"
import { RoadmapList } from "./RoadmapList"
import { ExportMenu } from "./ExportMenu"
import { Share2, Check } from "lucide-react"
import type { RoadmapResult } from "@roadmapper/schemas"

// Lazy-load React Flow to avoid SSR issues
const RoadmapGraph = dynamic(
  () => import("./RoadmapGraph").then((m) => ({ default: m.RoadmapGraph })),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full rounded-2xl flex items-center justify-center"
        style={{
          background: "rgb(var(--paper))",
          border: "1px solid rgb(var(--line))",
        }}
      >
        <div className="text-center space-y-3">
          <div
            className="w-7 h-7 rounded-full mx-auto"
            style={{
              border: "2px solid rgb(var(--line))",
              borderTopColor: "rgb(var(--accent))",
              animation: "spin-slow 1.2s linear infinite",
            }}
          />
          <span className="text-sm" style={{ color: "rgb(var(--muted))" }}>
            Loading graph…
          </span>
        </div>
      </div>
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
    setTimeout(() => setCopied(false), 2200)
  }

  const businessLabel = roadmap.business_type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="h-screen flex flex-col" style={{ background: "rgb(var(--paper))" }}>

      {/* ── Top bar ── */}
      <header
        className="flex-shrink-0 flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3"
        style={{
          borderBottom: "1px solid rgb(var(--line))",
          background: "rgb(var(--paper-3))",
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 min-w-0 flex-shrink-0" aria-label="Home">
          <div
            className="w-6 h-6 rounded-[7px] flex items-center justify-center"
            style={{ background: "rgb(var(--accent))" }}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" fill="white" fillOpacity="0.95" />
            </svg>
          </div>
        </a>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[12px] hidden sm:inline"
            style={{ color: "rgb(var(--muted-2))" }}
          >
            Roadmaps
          </span>
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 hidden sm:block" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="rgb(var(--muted-2))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1
            className="font-semibold text-[14px] sm:text-[15px] leading-none truncate"
            style={{ color: "rgb(var(--ink))" }}
          >
            {businessLabel}
          </h1>
        </div>

        <div className="flex-1" />

        {/* Cost badge */}
        <div
          className="flex items-baseline gap-0.5 rounded-full px-3 py-1 flex-shrink-0"
          style={{
            background: "rgba(var(--accent), 0.08)",
            border: "1px solid rgba(var(--accent), 0.18)",
          }}
        >
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: "rgb(var(--accent-2))" }}
          >
            ${totalCost}
          </span>
          <span className="text-[11px]" style={{ color: "rgb(var(--muted))" }}>
            /mo
          </span>
        </div>

        {/* Share button */}
        <button
          onClick={handleShareCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-150 hover:bg-[rgb(var(--line-2))]"
          style={{
            border: "1px solid rgb(var(--line))",
            color: copied ? "rgb(22,163,74)" : "rgb(var(--ink))",
            background: copied ? "rgba(22,163,74,0.05)" : "transparent",
          }}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span className="text-[12px] font-medium hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" style={{ color: "rgb(var(--muted))" }} />
              <span className="text-[12px] font-medium hidden sm:inline">Share</span>
            </>
          )}
        </button>

        <ExportMenu shortId={shortId} />
      </header>

      {/* ── Controls bar ── */}
      <RoadmapControls
        variant={variant}
        onVariantChange={setVariant}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        budgetMonthly={budgetMonthly}
        onBudgetChange={setBudgetMonthly}
        totalCost={totalCost}
      />

      {/* ── Content ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === "graph" ? (
          <div className="w-full h-full p-3">
            <RoadmapGraph
              roadmap={roadmap}
              variant={variant}
              budgetMonthly={budgetMonthly}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="max-w-3xl mx-auto px-5 py-6">
              <RoadmapList
                roadmap={roadmap}
                variant={variant}
                budgetMonthly={budgetMonthly}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
