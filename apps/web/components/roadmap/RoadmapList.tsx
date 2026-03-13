"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { RoadmapResult, WorkflowStage } from "@roadmapper/schemas"

interface RoadmapListProps {
  roadmap: RoadmapResult
  variant: "best-overall" | "cheapest" | "open-source"
  budgetMonthly: number
}

function difficultyStyle(level: string): { background: string; color: string; border: string } {
  if (level === "low")
    return { background: "rgba(22,163,74,0.07)", color: "rgb(21,128,61)", border: "rgba(22,163,74,0.18)" }
  if (level === "medium")
    return { background: "rgba(202,138,4,0.07)", color: "rgb(161,98,7)", border: "rgba(202,138,4,0.2)" }
  return { background: "rgba(220,38,38,0.07)", color: "rgb(185,28,28)", border: "rgba(220,38,38,0.2)" }
}

function StageCard({
  stage,
  variant,
  budgetMonthly,
  index,
}: {
  stage: WorkflowStage
  variant: "best-overall" | "cheapest" | "open-source"
  budgetMonthly: number
  index: number
}) {
  const [expanded, setExpanded] = useState(false)

  const tool =
    variant === "cheapest"
      ? (stage.cheapest_tool ?? stage.best_overall_tool)
      : variant === "open-source"
      ? (stage.opensource_tool ?? stage.best_overall_tool)
      : stage.best_overall_tool

  const isOverBudget = budgetMonthly < 1000 && stage.monthly_cost_estimate > budgetMonthly
  const hasAlternatives = stage.cheapest_tool || stage.opensource_tool

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden transition-all duration-200 animate-slide-up",
        isOverBudget && "opacity-55"
      )}
      style={{
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(var(--line), 0.65)",
        boxShadow: "0 1px 3px rgba(20,12,4,0.04), 0 4px 12px rgba(20,12,4,0.06)",
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
      }}
    >
      <div className="flex">
        {/* Left accent stripe */}
        <div
          className="w-[3px] flex-shrink-0"
          style={{
            background: isOverBudget
              ? "rgba(var(--line), 0.5)"
              : "linear-gradient(180deg, rgb(242,98,34) 0%, rgb(192,73,15) 100%)",
          }}
        />

        <div className="flex-1 px-4 py-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {/* Stage number */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: isOverBudget
                    ? "rgba(var(--line), 0.6)"
                    : "linear-gradient(135deg, rgb(242,98,34), rgb(192,73,15))",
                  boxShadow: isOverBudget ? "none" : "0 1px 4px rgba(242,98,34,0.3)",
                }}
              >
                <span className="text-white text-[10px] font-bold">{stage.stage_order}</span>
              </div>

              <div className="min-w-0">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-0.5"
                  style={{ color: "rgb(var(--muted-2))" }}
                >
                  {stage.stage_name}
                </p>
                <p
                  className="font-bold text-[15px] leading-snug"
                  style={{ color: "rgb(var(--ink))" }}
                >
                  {tool.name}
                </p>
              </div>
            </div>

            {/* Cost */}
            <div className="flex-shrink-0 text-right">
              <div
                className="inline-flex items-baseline gap-0.5 rounded-full px-2.5 py-1"
                style={
                  isOverBudget
                    ? { background: "rgba(var(--line), 0.3)", border: "1px solid rgba(var(--line), 0.5)" }
                    : { background: "rgba(242,98,34,0.08)", border: "1px solid rgba(242,98,34,0.18)" }
                }
              >
                <span
                  className="text-[12px] font-bold tabular-nums"
                  style={{
                    color: isOverBudget ? "rgb(var(--muted-2))" : "rgb(var(--accent-2))",
                    textDecoration: isOverBudget ? "line-through" : "none",
                  }}
                >
                  ${stage.monthly_cost_estimate}
                </span>
                <span className="text-[10px]" style={{ color: "rgb(var(--muted-2))" }}>/mo</span>
              </div>
              {isOverBudget && (
                <p
                  className="text-[10px] font-medium mt-1"
                  style={{ color: "rgb(185,28,28)" }}
                >
                  Over budget
                </p>
              )}
            </div>
          </div>

          {/* Why chosen */}
          {stage.why_chosen && (
            <p
              className="text-[13px] mt-2.5 leading-relaxed pl-9"
              style={{ color: "rgb(var(--muted))" }}
            >
              {stage.why_chosen}
            </p>
          )}

          {/* Badges */}
          <div className="flex items-center flex-wrap gap-2 mt-2.5 pl-9">
            {[
              { level: stage.setup_difficulty, label: `${stage.setup_difficulty} setup` },
              { level: stage.lock_in_risk, label: `${stage.lock_in_risk} lock-in` },
            ].map(({ level, label }) => {
              const s = difficultyStyle(level)
              return (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ background: s.background, color: s.color, border: `1px solid ${s.border}` }}
                >
                  {label}
                </span>
              )
            })}
          </div>

          {/* Expand alternatives */}
          {hasAlternatives && (
            <div className="pl-9 mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-150"
                style={{ color: expanded ? "rgb(var(--accent))" : "rgb(var(--muted))" }}
              >
                <span>{expanded ? "Hide alternatives" : "Show alternatives"}</span>
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className={cn("w-3 h-3 transition-transform duration-200", expanded && "rotate-180")}
                  aria-hidden="true"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {expanded && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stage.cheapest_tool && variant !== "cheapest" && (
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: "rgba(22,163,74,0.05)",
                        border: "1px solid rgba(22,163,74,0.16)",
                      }}
                    >
                      <p
                        className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1"
                        style={{ color: "rgb(21,128,61)" }}
                      >
                        Cheaper option
                      </p>
                      <p
                        className="text-[12px] font-semibold mb-1"
                        style={{ color: "rgb(var(--ink))" }}
                      >
                        {stage.cheapest_tool.name}
                      </p>
                      {stage.cheapest_tool.why && (
                        <p
                          className="text-[11px] leading-relaxed"
                          style={{ color: "rgb(var(--muted))" }}
                        >
                          {stage.cheapest_tool.why}
                        </p>
                      )}
                    </div>
                  )}
                  {stage.opensource_tool && variant !== "open-source" && (
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: "rgba(37,99,235,0.05)",
                        border: "1px solid rgba(37,99,235,0.14)",
                      }}
                    >
                      <p
                        className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1"
                        style={{ color: "rgb(37,99,235)" }}
                      >
                        Open-source option
                      </p>
                      <p
                        className="text-[12px] font-semibold mb-1"
                        style={{ color: "rgb(var(--ink))" }}
                      >
                        {stage.opensource_tool.name}
                      </p>
                      {stage.opensource_tool.why && (
                        <p
                          className="text-[11px] leading-relaxed"
                          style={{ color: "rgb(var(--muted))" }}
                        >
                          {stage.opensource_tool.why}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function RoadmapList({ roadmap, variant, budgetMonthly }: RoadmapListProps) {
  const sorted = [...roadmap.workflow_stages].sort((a, b) => a.stage_order - b.stage_order)
  const totalCost =
    variant === "cheapest"
      ? roadmap.total_monthly_cost_cheapest
      : roadmap.total_monthly_cost_best_overall

  let globalIndex = 0

  return (
    <div className="space-y-10 pb-16">
      {roadmap.build_sequence.map((week) => {
        const weekStages = sorted.filter((s) =>
          week.tools.some((t) => {
            const tool =
              variant === "cheapest"
                ? (s.cheapest_tool ?? s.best_overall_tool)
                : variant === "open-source"
                ? (s.opensource_tool ?? s.best_overall_tool)
                : s.best_overall_tool
            return tool.name === t
          })
        )

        return (
          <div key={week.week}>
            {/* Week header */}
            <div className="flex items-center gap-3 mb-4 sticky top-0 py-2 z-10"
              style={{ background: "rgba(var(--paper), 0.85)", backdropFilter: "blur(8px)" }}
            >
              <div
                className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgb(242,98,34), rgb(192,73,15))",
                  color: "white",
                  boxShadow: "0 1px 4px rgba(242,98,34,0.3)",
                }}
              >
                Week {week.week}
              </div>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(var(--line), 0.7)" }}
              />
              <p
                className="text-[12px] font-medium flex-shrink-0"
                style={{ color: "rgb(var(--muted))" }}
              >
                {week.focus}
              </p>
            </div>

            <div className="space-y-3">
              {weekStages.map((stage) => {
                const idx = globalIndex++
                return (
                  <StageCard
                    key={stage.stage_order}
                    stage={stage}
                    variant={variant}
                    budgetMonthly={budgetMonthly}
                    index={idx}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Total cost summary */}
      <div
        className="grain flex items-center justify-between rounded-2xl px-5 py-5"
        style={{
          background: "linear-gradient(135deg, rgb(15,12,10) 0%, rgb(25,20,16) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.04) inset",
        }}
      >
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Estimated total
          </p>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
            {variant === "cheapest"
              ? "Cheapest stack"
              : variant === "open-source"
              ? "Open-source stack"
              : "Best overall stack"}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-3xl font-bold tabular-nums"
            style={{
              background: "linear-gradient(135deg, rgb(251,146,60) 0%, rgb(242,98,34) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ${totalCost}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            per month
          </p>
        </div>
      </div>
    </div>
  )
}
