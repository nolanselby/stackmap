"use client"
import { memo, useState } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { WorkflowStage } from "@roadmapper/schemas"

export type RoadmapNodeData = {
  stage: WorkflowStage
  variant: "best-overall" | "cheapest" | "open-source"
  budgetMonthly: number
}

export type RoadmapNodeType = Node<RoadmapNodeData>

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

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-orange-400" />
      <div
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "bg-white rounded-xl border-2 p-4 shadow-sm cursor-pointer transition-all duration-200 min-w-[200px] max-w-[260px]",
          isOverBudget ? "border-gray-200 opacity-60" : "border-orange-200 hover:border-orange-400",
          expanded && "border-orange-400 shadow-md"
        )}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-orange-500 font-medium uppercase tracking-wide">
                {stage.stage_name}
              </p>
              <p className="font-semibold text-gray-800 text-sm mt-0.5">{tool.name}</p>
            </div>
            {isOverBudget && (
              <Badge variant="high" className="text-[10px] shrink-0">
                Over budget
              </Badge>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <Badge
              variant={
                stage.setup_difficulty === "low"
                  ? "low"
                  : stage.setup_difficulty === "medium"
                  ? "medium"
                  : "high"
              }
            >
              {stage.setup_difficulty} setup
            </Badge>
            <Badge
              variant={
                stage.lock_in_risk === "low"
                  ? "low"
                  : stage.lock_in_risk === "medium"
                  ? "medium"
                  : "high"
              }
            >
              {stage.lock_in_risk} lock-in
            </Badge>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            ${stage.monthly_cost_estimate}/mo
          </p>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 text-xs text-gray-600">
              <p className="leading-relaxed">{stage.why_chosen}</p>

              {stage.cheapest_tool && variant !== "cheapest" && (
                <div>
                  <p className="font-medium text-green-700">
                    Cheaper: {stage.cheapest_tool.name}
                  </p>
                  <p className="text-gray-500 mt-0.5">{stage.cheapest_tool.why}</p>
                </div>
              )}

              {stage.opensource_tool && variant !== "open-source" && (
                <div>
                  <p className="font-medium text-blue-700">
                    Open source: {stage.opensource_tool.name}
                  </p>
                  <p className="text-gray-500 mt-0.5">{stage.opensource_tool.why}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-400" />
    </>
  )
}

export const RoadmapNode = memo(RoadmapNodeComponent)
