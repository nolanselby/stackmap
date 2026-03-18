"use client"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { ExportMenu } from "./ExportMenu"
import { Share2, Check, ExternalLink, ChevronRight, ChevronDown } from "lucide-react"
import type { RoadmapResult, WorkflowStage } from "@roadmapper/schemas"

type Variant = "best-overall" | "cheapest" | "open-source"

type ToolMeta = {
  logo_url: string | null
  website_url: string | null
  short_description: string | null
}

interface RoadmapViewProps {
  roadmap: RoadmapResult
  shortId: string
  toolsMeta: Record<string, ToolMeta>
}

const CATEGORY_ORDER = [
  "Planning & Research",
  "Coding & Setup",
  "Build & Connect",
  "Launch & Grow",
] as const

type CategoryName = (typeof CATEGORY_ORDER)[number]

const CATEGORY_STYLES: Record<
  CategoryName,
  {
    headerBg: string
    headerText: string
    columnBg: string
    cardBorder: string
    cardBg: string
    accent: string
    badgeBg: string
    badgeText: string
    icon: string
  }
> = {
  "Planning & Research": {
    headerBg: "bg-violet-500",
    headerText: "text-white",
    columnBg: "bg-violet-50/60",
    cardBorder: "border-violet-200",
    cardBg: "bg-white",
    accent: "text-violet-600",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
    icon: "💡",
  },
  "Coding & Setup": {
    headerBg: "bg-sky-500",
    headerText: "text-white",
    columnBg: "bg-sky-50/60",
    cardBorder: "border-sky-200",
    cardBg: "bg-white",
    accent: "text-sky-600",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
    icon: "⚙️",
  },
  "Build & Connect": {
    headerBg: "bg-emerald-500",
    headerText: "text-white",
    columnBg: "bg-emerald-50/60",
    cardBorder: "border-emerald-200",
    cardBg: "bg-white",
    accent: "text-emerald-600",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    icon: "🔗",
  },
  "Launch & Grow": {
    headerBg: "bg-amber-500",
    headerText: "text-white",
    columnBg: "bg-amber-50/60",
    cardBorder: "border-amber-200",
    cardBg: "bg-white",
    accent: "text-amber-600",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    icon: "🚀",
  },
}

function ToolLogo({
  toolId,
  toolName,
  toolsMeta,
  size = 24,
}: {
  toolId: string
  toolName: string
  toolsMeta: Record<string, ToolMeta>
  size?: number
}) {
  const meta = toolsMeta[toolId]
  const logoUrl = meta?.logo_url

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${toolName} logo`}
        width={size}
        height={size}
        className="rounded-md object-contain flex-shrink-0"
        style={{ width: size, height: size }}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = "none"
          const sibling = target.nextElementSibling as HTMLElement | null
          if (sibling) sibling.style.display = "flex"
        }}
      />
    )
  }

  return (
    <div
      className="rounded-md bg-gray-100 flex items-center justify-center font-bold text-gray-400 flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {toolName.charAt(0).toUpperCase()}
    </div>
  )
}

function StageCard({
  stage,
  variant,
  toolsMeta,
  categoryStyle,
  index,
}: {
  stage: WorkflowStage
  variant: Variant
  toolsMeta: Record<string, ToolMeta>
  categoryStyle: (typeof CATEGORY_STYLES)[CategoryName]
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tool =
    variant === "cheapest"
      ? (stage.cheapest_tool ?? stage.best_overall_tool)
      : variant === "open-source"
        ? (stage.opensource_tool ?? stage.best_overall_tool)
        : stage.best_overall_tool

  const meta = toolsMeta[tool.tool_id]
  const actionSteps = (stage as any).action_steps as string[] | undefined

  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      <div
        className={cn(
          "rounded-xl border p-4 transition-all cursor-pointer",
          categoryStyle.cardBg,
          categoryStyle.cardBorder,
          expanded ? "shadow-md ring-1 ring-gray-200" : "shadow-sm hover:shadow-md"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Stage header */}
        <div className="flex items-start gap-3">
          <ToolLogo
            toolId={tool.tool_id}
            toolName={tool.name}
            toolsMeta={toolsMeta}
            size={32}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 leading-snug">
              {stage.stage_name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-600">
                {tool.name}
              </span>
              {stage.monthly_cost_estimate === 0 ? (
                <span className="text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                  Free
                </span>
              ) : (
                <span className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-full">
                  ${stage.monthly_cost_estimate}/mo
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 mt-0.5">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              {stage.why_chosen}
            </p>

            {meta?.short_description && (
              <p className="text-xs text-gray-500 italic mb-3">
                {meta.short_description}
              </p>
            )}

            {actionSteps && actionSteps.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  How to do this
                </p>
                <ol className="space-y-1.5">
                  {actionSteps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-gray-700"
                    >
                      <span
                        className={cn(
                          "flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5",
                          categoryStyle.headerBg
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="flex items-center gap-3 text-[10px]">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full font-medium",
                  stage.setup_difficulty === "low"
                    ? "bg-green-50 text-green-700"
                    : stage.setup_difficulty === "medium"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                )}
              >
                {stage.setup_difficulty === "low"
                  ? "Easy setup"
                  : stage.setup_difficulty === "medium"
                    ? "Some setup"
                    : "Advanced"}
              </span>

              {meta?.website_url && (
                <a
                  href={meta.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1 font-medium transition-colors",
                    categoryStyle.accent
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit site <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryColumn({
  category,
  stages,
  variant,
  toolsMeta,
  phaseNumber,
  columnIndex,
}: {
  category: CategoryName
  stages: WorkflowStage[]
  variant: Variant
  toolsMeta: Record<string, ToolMeta>
  phaseNumber: number
  columnIndex: number
}) {
  const style = CATEGORY_STYLES[category]
  const sorted = [...stages].sort((a, b) => a.stage_order - b.stage_order)

  return (
    <div
      className="animate-slide-up flex flex-col"
      style={{
        animationDelay: `${columnIndex * 120}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Phase header */}
      <div className={cn("rounded-t-xl px-4 py-3", style.headerBg)}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <div>
            <p className={cn("text-[10px] font-medium uppercase tracking-wider opacity-80", style.headerText)}>
              Phase {phaseNumber}
            </p>
            <h3 className={cn("text-sm font-bold", style.headerText)}>
              {category}
            </h3>
          </div>
        </div>
      </div>

      {/* Column body */}
      <div
        className={cn(
          "flex-1 rounded-b-xl border border-t-0 p-3 space-y-3",
          style.columnBg,
          style.cardBorder
        )}
      >
        {sorted.map((stage, i) => (
          <div key={stage.stage_order}>
            <StageCard
              stage={stage}
              variant={variant}
              toolsMeta={toolsMeta}
              categoryStyle={style}
              index={columnIndex * 4 + i}
            />
            {/* Vertical connector arrow within column */}
            {i < sorted.length - 1 && (
              <div className="flex justify-center py-1">
                <svg width="12" height="16" viewBox="0 0 12 16" className="text-gray-300">
                  <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="2,10 6,16 10,10" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-400">
            No steps in this phase
          </div>
        )}
      </div>
    </div>
  )
}

function PhaseConnectorArrow() {
  return (
    <div className="hidden lg:flex items-center justify-center flex-shrink-0 -mx-1" style={{ width: 32 }}>
      <svg width="32" height="24" viewBox="0 0 32 24" className="text-gray-300">
        <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        <polygon points="22,8 32,12 22,16" fill="currentColor" />
      </svg>
    </div>
  )
}

function MobilePhaseConnector() {
  return (
    <div className="flex lg:hidden justify-center py-2">
      <svg width="24" height="28" viewBox="0 0 24 28" className="text-gray-300">
        <line x1="12" y1="0" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        <polygon points="8,18 12,28 16,18" fill="currentColor" />
      </svg>
    </div>
  )
}

export function RoadmapView({ roadmap, shortId, toolsMeta }: RoadmapViewProps) {
  const [variant, setVariant] = useState<Variant>("best-overall")
  const [copied, setCopied] = useState(false)

  const totalCost =
    variant === "cheapest"
      ? roadmap.total_monthly_cost_cheapest
      : roadmap.total_monthly_cost_best_overall

  const businessLabel = roadmap.business_type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  function handleShareCopy() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const stagesByCategory = new Map<CategoryName, WorkflowStage[]>()
  for (const cat of CATEGORY_ORDER) {
    stagesByCategory.set(cat, [])
  }

  for (const stage of roadmap.workflow_stages ?? []) {
    const cat = (stage.category ?? "Build & Connect") as CategoryName
    const bucket = stagesByCategory.get(cat)
    if (bucket) {
      bucket.push(stage)
    } else {
      stagesByCategory.get("Build & Connect")!.push(stage)
    }
  }

  const activeCategories = CATEGORY_ORDER.filter(
    (cat) => (stagesByCategory.get(cat)?.length ?? 0) > 0
  )

  const totalStages = roadmap.workflow_stages?.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3 min-w-0">
              <a
                href="/"
                className="text-orange-500 hover:text-orange-600 transition-colors flex-shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </a>
              <div className="h-5 w-px bg-gray-200" />
              <h1 className="text-sm font-medium text-gray-900 truncate">
                {businessLabel}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Share"}
              </button>
              <ExportMenu shortId={shortId} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Your Roadmap
          </h2>
          <p className="text-gray-400 text-sm">
            {totalStages} steps across {activeCategories.length} phases
            &middot;{" "}
            <span className="font-medium text-gray-600">
              {totalCost === 0 ? "Free" : `$${totalCost}/mo`}
            </span>
            <span className="text-gray-300 mx-2">&middot;</span>
            <span className="text-gray-400">
              Click any step to see how to do it
            </span>
          </p>
        </div>

        {/* Variant tabs */}
        <div className="flex items-center mb-6">
          <div className="inline-flex items-center bg-white rounded-full p-1 gap-0.5 border border-gray-200 shadow-sm">
            {VARIANTS.map((v) => (
              <button
                key={v.value}
                onClick={() => setVariant(v.value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  variant === v.value
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phase flow diagram */}
        <div className="lg:flex lg:items-start lg:gap-0">
          {activeCategories.map((category, colIdx) => (
            <div key={category} className="flex lg:flex-1 flex-col lg:flex-row items-stretch">
              <div className="flex-1 min-w-0">
                <CategoryColumn
                  category={category}
                  stages={stagesByCategory.get(category) ?? []}
                  variant={variant}
                  toolsMeta={toolsMeta}
                  phaseNumber={colIdx + 1}
                  columnIndex={colIdx}
                />
              </div>

              {/* Connector arrow between columns */}
              {colIdx < activeCategories.length - 1 && (
                <>
                  <PhaseConnectorArrow />
                  <MobilePhaseConnector />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Build sequence timeline */}
        {roadmap.build_sequence && roadmap.build_sequence.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Week-by-Week Plan
            </h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {roadmap.build_sequence.map((item, i) => (
                <div
                  key={item.week}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4",
                    i < roadmap.build_sequence.length - 1 &&
                      "border-b border-gray-100"
                  )}
                >
                  <div className="flex-shrink-0 w-16 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-bold">
                      Week {item.week}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.focus}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.tools.map((toolName) => (
                        <span
                          key={toolName}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                        >
                          {toolName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total cost summary */}
        <div className="mt-8 bg-gray-900 text-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Estimated monthly total
            </p>
            <p className="text-sm text-gray-400">
              {variant === "cheapest"
                ? "Cheapest stack"
                : variant === "open-source"
                  ? "Open-source stack"
                  : "Best overall stack"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              {totalCost === 0 ? "Free" : `$${totalCost}`}
            </p>
            {totalCost > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">per month</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pb-8 text-center">
          <a
            href="/"
            className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            Generate another roadmap
          </a>
        </div>
      </div>
    </div>
  )
}

const VARIANTS: { value: Variant; label: string }[] = [
  { value: "best-overall", label: "Best Overall" },
  { value: "cheapest", label: "Cheapest" },
  { value: "open-source", label: "Open Source" },
]
