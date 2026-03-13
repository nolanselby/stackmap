"use client"
import { memo, useState } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { cn } from "@/lib/utils"
import type { WorkflowStage } from "@roadmapper/schemas"

export type RoadmapNodeData = {
  stage: WorkflowStage
  variant: "best-overall" | "cheapest" | "open-source"
  budgetMonthly: number
}

export type RoadmapNodeType = Node<RoadmapNodeData>

function difficultyColor(level: string): { bg: string; text: string; border: string } {
  if (level === "low") return { bg: "rgba(22,163,74,0.08)", text: "rgb(21,128,61)", border: "rgba(22,163,74,0.2)" }
  if (level === "medium") return { bg: "rgba(202,138,4,0.08)", text: "rgb(161,98,7)", border: "rgba(202,138,4,0.2)" }
  return { bg: "rgba(220,38,38,0.08)", text: "rgb(185,28,28)", border: "rgba(220,38,38,0.2)" }
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")}
      aria-hidden="true"
      style={{ color: "rgb(var(--muted-2))" }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Badge({ level, label }: { level: string; label: string }) {
  const colors = difficultyColor(level)
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      {label}
    </span>
  )
}

function RoadmapNodeComponent({ data }: NodeProps<RoadmapNodeType>) {
  const [expanded, setExpanded] = useState(false)
  const { stage, variant, budgetMonthly } = data

  const tool =
    variant === "cheapest"
      ? (stage.cheapest_tool ?? stage.best_overall_tool)
      : variant === "open-source"
      ? (stage.opensource_tool ?? stage.best_overall_tool)
      : stage.best_overall_tool

  const isOverBudget =
    budgetMonthly < 1000 && stage.monthly_cost_estimate > budgetMonthly

  const hasAlternatives =
    (stage.cheapest_tool && variant !== "cheapest") ||
    (stage.opensource_tool && variant !== "open-source")

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "rgb(242,98,34)",
          border: "2px solid white",
          width: 10,
          height: 10,
          boxShadow: "0 0 0 1px rgba(242,98,34,0.3)",
        }}
      />

      <div
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "grain cursor-pointer transition-all duration-200 ease-out",
          "w-[272px]",
          isOverBudget && "opacity-50 grayscale-[0.7]"
        )}
        style={{
          background: expanded
            ? "rgba(255,255,255,0.92)"
            : "rgba(255,255,255,0.82)",
          border: expanded
            ? "1.5px solid rgba(242,98,34,0.55)"
            : "1.5px solid rgba(var(--line), 0.8)",
          borderRadius: "16px",
          boxShadow: expanded
            ? "0 0 0 3px rgba(242,98,34,0.08), 0 4px 16px rgba(20,12,4,0.12), 0 12px 32px rgba(20,12,4,0.08)"
            : "0 1px 3px rgba(20,12,4,0.06), 0 4px 12px rgba(20,12,4,0.08)",
        }}
        onMouseEnter={(e) => {
          if (!expanded) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(242,98,34,0.4)"
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(20,12,4,0.08), 0 8px 24px rgba(20,12,4,0.1)"
            ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"
          }
        }}
        onMouseLeave={(e) => {
          if (!expanded) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(var(--line), 0.8)"
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(20,12,4,0.06), 0 4px 12px rgba(20,12,4,0.08)"
            ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"
          }
        }}
      >
        {/* Orange top accent stripe */}
        <div
          style={{
            height: "3px",
            background: isOverBudget
              ? "rgba(var(--line), 0.6)"
              : "linear-gradient(90deg, rgb(242,98,34) 0%, rgb(251,146,60) 100%)",
            borderRadius: "16px 16px 0 0",
            marginBottom: "0",
          }}
        />

        {/* Card body */}
        <div className="px-4 pt-3.5 pb-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              {/* Stage number */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: isOverBudget
                    ? "rgba(var(--line), 0.6)"
                    : "linear-gradient(135deg, rgb(242,98,34), rgb(192,73,15))",
                  boxShadow: isOverBudget ? "none" : "0 1px 3px rgba(242,98,34,0.3)",
                }}
              >
                <span className="text-white text-[9px] font-bold leading-none">
                  {stage.stage_order}
                </span>
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.16em] truncate"
                style={{ color: "rgb(var(--muted))" }}
              >
                {stage.stage_name}
              </span>
            </div>

            {/* Cost pill */}
            <div
              className="flex items-baseline gap-0.5 rounded-full px-2 py-0.5 flex-shrink-0"
              style={
                isOverBudget
                  ? { background: "rgba(var(--line), 0.3)", border: "1px solid rgba(var(--line), 0.5)" }
                  : { background: "rgba(242,98,34,0.08)", border: "1px solid rgba(242,98,34,0.18)" }
              }
            >
              <span
                className="text-[11px] font-bold tabular-nums"
                style={{
                  color: isOverBudget ? "rgb(var(--muted-2))" : "rgb(var(--accent-2))",
                  textDecoration: isOverBudget ? "line-through" : "none",
                }}
              >
                ${stage.monthly_cost_estimate}
              </span>
              <span
                className="text-[9px] font-medium"
                style={{ color: "rgb(var(--muted-2))" }}
              >
                /mo
              </span>
            </div>
          </div>

          {/* Tool name + description */}
          <div className="mb-3">
            <p
              className="font-bold text-[15px] leading-snug"
              style={{ color: "rgb(var(--ink))" }}
            >
              {tool.name}
            </p>
            {tool.why && (
              <p
                className="text-[12px] mt-1 leading-relaxed line-clamp-2"
                style={{ color: "rgb(var(--muted))" }}
              >
                {tool.why}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge level={stage.setup_difficulty} label={`${stage.setup_difficulty} setup`} />
            <Badge level={stage.lock_in_risk} label={`${stage.lock_in_risk} lock-in`} />
            {isOverBudget && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: "rgba(220,38,38,0.08)",
                  color: "rgb(185,28,28)",
                  border: "1px solid rgba(220,38,38,0.2)",
                }}
              >
                Over budget
              </span>
            )}
          </div>

          {/* Expand toggle */}
          {(hasAlternatives || stage.why_chosen) && (
            <div
              className="flex items-center justify-center mt-3 pt-3"
              style={{ borderTop: "1px solid rgba(var(--line), 0.55)" }}
            >
              <div
                className="flex items-center gap-1 text-[11px] font-medium"
                style={{ color: "rgb(var(--muted))" }}
              >
                <span>{expanded ? "Collapse" : "See details & alternatives"}</span>
                <ChevronIcon open={expanded} />
              </div>
            </div>
          )}
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div
            className="px-4 pb-4 pt-3 space-y-3"
            style={{ borderTop: "1px solid rgba(var(--line), 0.55)" }}
          >
            {/* Why chosen */}
            {stage.why_chosen && (
              <div>
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: "rgb(var(--muted-2))" }}
                >
                  Why this tool
                </p>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "rgb(var(--ink))" }}
                >
                  {stage.why_chosen}
                </p>
              </div>
            )}

            {/* Cheaper alternative */}
            {stage.cheapest_tool && variant !== "cheapest" && (
              <div
                className="rounded-xl p-3"
                style={{
                  background: "rgba(22,163,74,0.05)",
                  border: "1px solid rgba(22,163,74,0.18)",
                }}
              >
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1"
                  style={{ color: "rgb(21,128,61)" }}
                >
                  Cheaper option
                </p>
                <p className="text-[12px] font-semibold mb-1" style={{ color: "rgb(var(--ink))" }}>
                  {stage.cheapest_tool.name}
                </p>
                {stage.cheapest_tool.why && (
                  <p className="text-[11px] leading-relaxed" style={{ color: "rgb(var(--muted))" }}>
                    {stage.cheapest_tool.why}
                  </p>
                )}
              </div>
            )}

            {/* Open-source alternative */}
            {stage.opensource_tool && variant !== "open-source" && (
              <div
                className="rounded-xl p-3"
                style={{
                  background: "rgba(37,99,235,0.05)",
                  border: "1px solid rgba(37,99,235,0.15)",
                }}
              >
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1"
                  style={{ color: "rgb(37,99,235)" }}
                >
                  Open-source option
                </p>
                <p className="text-[12px] font-semibold mb-1" style={{ color: "rgb(var(--ink))" }}>
                  {stage.opensource_tool.name}
                </p>
                {stage.opensource_tool.why && (
                  <p className="text-[11px] leading-relaxed" style={{ color: "rgb(var(--muted))" }}>
                    {stage.opensource_tool.why}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "rgb(242,98,34)",
          border: "2px solid white",
          width: 10,
          height: 10,
          boxShadow: "0 0 0 1px rgba(242,98,34,0.3)",
        }}
      />
    </>
  )
}

export const RoadmapNode = memo(RoadmapNodeComponent)
