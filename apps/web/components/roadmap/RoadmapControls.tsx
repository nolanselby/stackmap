"use client"
import { cn } from "@/lib/utils"

type Variant = "best-overall" | "cheapest" | "open-source"
type ViewMode = "graph" | "list"

interface RoadmapControlsProps {
  variant: Variant
  onVariantChange: (v: Variant) => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  budgetMonthly: number
  onBudgetChange: (b: number) => void
  totalCost: number
}

const VARIANTS: { value: Variant; label: string }[] = [
  { value: "best-overall", label: "Best Overall" },
  { value: "cheapest", label: "Cheapest" },
  { value: "open-source", label: "Open Source" },
]

const BUDGET_STEPS = [0, 50, 100, 200, 500, 1000]

export function RoadmapControls({
  variant,
  onVariantChange,
  viewMode,
  onViewModeChange,
  budgetMonthly,
  onBudgetChange,
  totalCost,
}: RoadmapControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-white border-b border-orange-100">
      {/* Plan toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
        {VARIANTS.map((v) => (
          <button
            key={v.value}
            onClick={() => onVariantChange(v.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              variant === v.value
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-white"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
        {(["graph", "list"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewModeChange(v)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
              viewMode === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:bg-white"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Budget slider */}
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Budget: ${budgetMonthly === 1000 ? "1000+" : budgetMonthly}/mo
        </span>
        <input
          type="range"
          min={0}
          max={5}
          value={BUDGET_STEPS.indexOf(budgetMonthly)}
          onChange={(e) => onBudgetChange(BUDGET_STEPS[Number(e.target.value)])}
          className="w-28 accent-orange-500"
        />
      </div>

      {/* Total cost */}
      <div className="text-sm font-semibold text-orange-600 whitespace-nowrap">
        ~${totalCost}/mo
      </div>
    </div>
  )
}
