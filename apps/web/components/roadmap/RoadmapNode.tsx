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
  if (level === "low") return { bg: "rgba(22,163,74,0.08)", text: "rgb(21,128,61)", border: "rgba(22,163,74,0.18)" }
  if (level === "medium") return { bg: "rgba(202,138,4,0.08)", text: "rgb(161,98,7)", border: "rgba(202,138,4,0.18)" }
  return { bg: "rgba(220,38,38,0.08)", text: "rgb(185,28,28)", border: "rgba(220,38,38,0.18)" }
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

function RoadmapNodeComponent({ data, selected }: NodeProps<RoadmapNodeType>) {
  const { stage, variant, budgetMonthly } = data

  const tool =
    variant === "cheapest"
      ? (stage.cheapest_tool ?? stage.best_overall_tool)
      : variant === "open-source"
      ? (stage.opensource_tool ?? stage.best_overall_tool)
      : stage.best_overall_tool

  const isOverBudget =
    budgetMonthly < 1000 && stage.monthly_cost_estimate > budgetMonthly

  return (
    <div className="group">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[rgb(var(--figma-blue))] !border-2 !border-[rgb(var(--figma-canvas))] !opacity-0 group-hover:!opacity-100 transition-opacity"
      />

      <div
        className={cn(
          "w-[240px] px-3 py-2.5 transition-all duration-200",
          selected ? "ring-2 ring-[rgb(var(--figma-blue))] ring-offset-2 ring-offset-[rgb(var(--figma-canvas))]" : "border border-white/10 hover:border-white/25",
          isOverBudget && "opacity-60"
        )}
        style={{
          background: "rgb(var(--figma-surface))",
          borderRadius: "6px",
          boxShadow: selected ? "0 0 0 1px rgb(var(--figma-blue))" : "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
           <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--figma-purple))]" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight truncate">Stage {stage.stage_order}</span>
           </div>
           {isOverBudget && (
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
           )}
        </div>

        <h3 className="text-[13px] font-bold text-white/90 leading-tight mb-1 truncate">{stage.stage_name}</h3>
        <div className="flex items-center gap-2">
           <span className="text-[11px] text-white/50 font-medium truncate">{tool.name}</span>
           <span className="ml-auto text-[10px] font-bold text-white/30 truncate">${stage.monthly_cost_estimate}/mo</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[rgb(var(--figma-blue))] !border-2 !border-[rgb(var(--figma-canvas))] !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
    </div>
  )
}

export const RoadmapNode = memo(RoadmapNodeComponent)
