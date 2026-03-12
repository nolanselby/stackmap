"use client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RoadmapResult } from "@roadmapper/schemas"

interface RoadmapListProps {
  roadmap: RoadmapResult
  variant: "best-overall" | "cheapest" | "open-source"
  budgetMonthly: number
}

export function RoadmapList({ roadmap, variant, budgetMonthly }: RoadmapListProps) {
  const sorted = [...roadmap.workflow_stages].sort((a, b) => a.stage_order - b.stage_order)
  const totalCost =
    variant === "cheapest"
      ? roadmap.total_monthly_cost_cheapest
      : roadmap.total_monthly_cost_best_overall

  return (
    <div className="space-y-8 pb-16">
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
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Week {week.week}
              </div>
              <p className="text-sm text-gray-600 font-medium">{week.focus}</p>
            </div>

            <div className="space-y-3 pl-4 border-l-2 border-orange-100">
              {weekStages.map((stage) => {
                const tool =
                  variant === "cheapest"
                    ? (stage.cheapest_tool ?? stage.best_overall_tool)
                    : variant === "open-source"
                    ? (stage.opensource_tool ?? stage.best_overall_tool)
                    : stage.best_overall_tool

                const isOverBudget =
                  budgetMonthly < 1000 && stage.monthly_cost_estimate > budgetMonthly

                return (
                  <div
                    key={stage.stage_order}
                    className={cn(
                      "bg-white rounded-xl border border-gray-100 p-4 shadow-sm",
                      isOverBudget && "opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-orange-500 font-medium uppercase tracking-wide">
                          {stage.stage_name}
                        </p>
                        <p className="font-semibold text-gray-800 mt-0.5">{tool.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">
                          ${stage.monthly_cost_estimate}/mo
                        </p>
                        {isOverBudget && (
                          <Badge variant="high" className="text-[10px] mt-1">
                            Over budget
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      {stage.why_chosen}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
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

                      {isOverBudget && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          No tool fits your budget for this stage. Consider the cheapest option or
                          increasing your budget.
                        </p>
                      )}
                    </div>

                    {(stage.cheapest_tool || stage.opensource_tool) && (
                      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-50">
                        {stage.cheapest_tool && (
                          <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                            {stage.cheapest_tool.name}
                          </span>
                        )}
                        {stage.opensource_tool && (
                          <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                            {stage.opensource_tool.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Total cost */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex justify-between items-center">
        <p className="font-semibold text-gray-800">Estimated total</p>
        <p className="text-xl font-bold text-orange-600">${totalCost}/mo</p>
      </div>
    </div>
  )
}
