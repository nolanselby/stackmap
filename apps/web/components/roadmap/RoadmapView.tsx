"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ExportMenu } from "./ExportMenu"
import { Share2, Check, ExternalLink, ChevronDown } from "lucide-react"
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

function ToolLogo({ toolId, toolName, toolsMeta, size = 40 }: { toolId: string; toolName: string; toolsMeta: Record<string, ToolMeta>; size?: number }) {
  const meta = toolsMeta[toolId]
  const logoUrl = meta?.logo_url

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${toolName} logo`}
        width={size}
        height={size}
        className="rounded-lg object-contain"
        style={{ width: size, height: size }}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = "none"
          target.nextElementSibling?.classList.remove("hidden")
        }}
      />
    )
  }

  return (
    <div
      className="rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {toolName.charAt(0).toUpperCase()}
    </div>
  )
}

function StepCard({
  stage,
  variant,
  toolsMeta,
  index,
}: {
  stage: WorkflowStage
  variant: Variant
  toolsMeta: Record<string, ToolMeta>
  index: number
}) {
  const [showAlts, setShowAlts] = useState(false)

  const tool =
    variant === "cheapest"
      ? (stage.cheapest_tool ?? stage.best_overall_tool)
      : variant === "open-source"
      ? (stage.opensource_tool ?? stage.best_overall_tool)
      : stage.best_overall_tool

  const meta = toolsMeta[tool.tool_id]
  const websiteUrl = meta?.website_url
  const description = meta?.short_description

  const alternatives = [
    variant !== "best-overall" && stage.best_overall_tool ? { label: "Best Overall", tool: stage.best_overall_tool } : null,
    variant !== "cheapest" && stage.cheapest_tool ? { label: "Cheapest", tool: stage.cheapest_tool } : null,
    variant !== "open-source" && stage.opensource_tool ? { label: "Open Source", tool: stage.opensource_tool } : null,
  ].filter(Boolean) as Array<{ label: string; tool: { tool_id: string; name: string; why: string } }>

  const actionSteps = (stage as any).action_steps as string[] | undefined

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all animate-slide-up"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
        animationDelay: `${index * 80}ms`,
        animationFillMode: "both",
      }}
    >
      <div className="p-6">
        {/* Step header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {stage.stage_order}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{stage.stage_name}</h3>
        </div>

        {/* Main tool card */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl mb-4">
          <ToolLogo toolId={tool.tool_id} toolName={tool.name} toolsMeta={toolsMeta} size={48} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-base">{tool.name}</span>
              {stage.monthly_cost_estimate === 0 ? (
                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Free</span>
              ) : (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                  ${stage.monthly_cost_estimate}/mo
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{description}</p>
            )}
            <p className="text-sm text-gray-600">{stage.why_chosen}</p>
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 mt-2 transition-colors"
              >
                Visit website
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Action steps */}
        {actionSteps && actionSteps.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">How to get started</h4>
            <ol className="space-y-2">
              {actionSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => setShowAlts(!showAlts)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showAlts ? "Hide" : "Show"} alternatives ({alternatives.length})
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAlts && "rotate-180")} />
            </button>

            {showAlts && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alternatives.map((alt) => {
                  const altMeta = toolsMeta[alt.tool.tool_id]
                  return (
                    <div key={alt.tool.tool_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <ToolLogo toolId={alt.tool.tool_id} toolName={alt.tool.name} toolsMeta={toolsMeta} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800 truncate">{alt.tool.name}</span>
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide flex-shrink-0">{alt.label}</span>
                        </div>
                        {alt.tool.why && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{alt.tool.why}</p>
                        )}
                        {altMeta?.website_url && (
                          <a
                            href={altMeta.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-500 hover:text-orange-600 mt-1 inline-flex items-center gap-1"
                          >
                            Visit <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
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

  const sorted = [...(roadmap.workflow_stages ?? [])].sort((a, b) => a.stage_order - b.stage_order)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3 min-w-0">
              <a href="/" className="text-orange-500 hover:text-orange-600 transition-colors flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </a>
              <div className="h-5 w-px bg-gray-200" />
              <h1 className="text-sm font-medium text-gray-900 truncate">{businessLabel}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Share"}
              </button>
              <ExportMenu shortId={shortId} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Title section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Roadmap</h2>
          <p className="text-gray-500 text-sm">
            {sorted.length} steps to build your {businessLabel.toLowerCase()} &middot;{" "}
            <span className="font-medium text-gray-700">
              {totalCost === 0 ? "Free" : `$${totalCost}/mo`}
            </span>
          </p>
        </div>

        {/* Variant tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-0.5">
            {VARIANTS.map((v) => (
              <button
                key={v.value}
                onClick={() => setVariant(v.value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  variant === v.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {sorted.map((stage, i) => (
            <StepCard
              key={stage.stage_order}
              stage={stage}
              variant={variant}
              toolsMeta={toolsMeta}
              index={i}
            />
          ))}
        </div>

        {/* Total cost summary */}
        <div className="mt-8 bg-gray-900 text-white rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Estimated monthly total</p>
            <p className="text-sm text-gray-300">
              {variant === "cheapest" ? "Cheapest stack" : variant === "open-source" ? "Open-source stack" : "Best overall stack"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{totalCost === 0 ? "Free" : `$${totalCost}`}</p>
            {totalCost > 0 && <p className="text-xs text-gray-400 mt-0.5">per month</p>}
          </div>
        </div>

        {/* Build sequence */}
        {(roadmap.build_sequence?.length ?? 0) > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Build schedule</h3>
            <div className="space-y-3">
              {(roadmap.build_sequence ?? []).map((week) => (
                <div key={week.week} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 flex-shrink-0">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                      Week {week.week}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{week.focus}</p>
                    <p className="text-xs text-gray-400 mt-1">{week.tools.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pb-8 text-center">
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
