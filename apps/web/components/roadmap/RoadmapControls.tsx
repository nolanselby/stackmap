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

const VARIANTS: { value: Variant; label: string; icon: string }[] = [
  { value: "best-overall", label: "Best", icon: "★" },
  { value: "cheapest", label: "Cheapest", icon: "↓" },
  { value: "open-source", label: "OSS", icon: "⊕" },
]

const BUDGET_STEPS = [0, 50, 100, 200, 500, 1000]

function GraphIcon({ active }: { active: boolean }) {
  const color = active ? "rgb(var(--accent))" : "rgb(var(--muted))"
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden="true">
      <rect x="1" y="1" width="5" height="4" rx="1.2" fill={color} />
      <rect x="10" y="1" width="5" height="4" rx="1.2" fill={color} />
      <rect x="5.5" y="11" width="5" height="4" rx="1.2" fill={color} />
      <line x1="3.5" y1="5" x2="3.5" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12.5" y1="5" x2="12.5" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.5" y1="8" x2="8" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12.5" y1="8" x2="8" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="8" x2="8" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  const color = active ? "rgb(var(--accent))" : "rgb(var(--muted))"
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden="true">
      <line x1="5" y1="4" x2="14" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="8" x2="14" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="12" x2="14" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="2.5" cy="4" r="1" fill={color} />
      <circle cx="2.5" cy="8" r="1" fill={color} />
      <circle cx="2.5" cy="12" r="1" fill={color} />
    </svg>
  )
}

export function RoadmapControls({
  variant,
  onVariantChange,
  viewMode,
  onViewModeChange,
  budgetMonthly,
  onBudgetChange,
}: RoadmapControlsProps) {
  const budgetLabel = budgetMonthly >= 1000 ? "No limit" : `$${budgetMonthly}/mo`

  return (
    <div
      className="flex-shrink-0 flex flex-wrap items-center gap-2.5 px-4 sm:px-5 py-2.5"
      style={{
        borderBottom: "1px solid rgb(var(--line))",
        background: "rgb(var(--paper-3))",
      }}
    >
      {/* Variant toggle pills */}
      <div
        className="flex rounded-lg p-0.5 gap-0.5"
        style={{
          background: "rgb(var(--line-2))",
          border: "1px solid rgb(var(--line))",
        }}
      >
        {VARIANTS.map((v) => {
          const isActive = variant === v.value
          return (
            <button
              key={v.value}
              onClick={() => onVariantChange(v.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150",
                "focus-visible:outline-none"
              )}
              style={
                isActive
                  ? {
                      background: "rgb(var(--paper-3))",
                      color: "rgb(var(--ink))",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    }
                  : {
                      background: "transparent",
                      color: "rgb(var(--muted))",
                    }
              }
            >
              <span
                style={{
                  fontSize: "11px",
                  color: isActive ? "rgb(var(--accent))" : "rgb(var(--muted-2))",
                }}
              >
                {v.icon}
              </span>
              {v.label}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div
        className="hidden sm:block w-px h-4"
        style={{ background: "rgb(var(--line))" }}
      />

      {/* View mode toggle */}
      <div
        className="flex rounded-lg p-0.5 gap-0.5"
        style={{
          background: "rgb(var(--line-2))",
          border: "1px solid rgb(var(--line))",
        }}
      >
        {(["graph", "list"] as const).map((mode) => {
          const isActive = viewMode === mode
          return (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              title={`${mode === "graph" ? "Graph" : "List"} view`}
              className={cn(
                "p-1.5 rounded-md transition-all duration-150 flex items-center justify-center",
                "focus-visible:outline-none"
              )}
              style={
                isActive
                  ? {
                      background: "rgb(var(--paper-3))",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    }
                  : {
                      background: "transparent",
                    }
              }
            >
              {mode === "graph" ? (
                <GraphIcon active={isActive} />
              ) : (
                <ListIcon active={isActive} />
              )}
            </button>
          )
        })}
      </div>

      {/* Budget slider */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "rgb(var(--muted-2))" }}
          >
            Budget
          </span>
          <span
            className="text-[12px] font-semibold tabular-nums min-w-[64px] text-right"
            style={{ color: "rgb(var(--ink))" }}
          >
            {budgetLabel}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          value={BUDGET_STEPS.indexOf(budgetMonthly)}
          onChange={(e) => onBudgetChange(BUDGET_STEPS[Number(e.target.value)])}
          className="w-24 sm:w-32"
          aria-label="Monthly budget filter"
        />
      </div>
    </div>
  )
}
