"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { RoadmapList } from "./RoadmapList"
import { ExportMenu } from "./ExportMenu"
import { Share2, Check } from "lucide-react"
import type { RoadmapResult } from "@roadmapper/schemas"

type Variant = "best-overall" | "cheapest" | "open-source"
type ViewMode = "graph" | "list"

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
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [variant, setVariant] = useState<"best-overall" | "cheapest" | "open-source">(
    "best-overall"
  )
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph")
  const [budgetMonthly, setBudgetMonthly] = useState(1000)
  const [copied, setCopied] = useState(false)

  const selectedStage = roadmap.workflow_stages.find(s => s.stage_order === selectedStageId)

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
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "rgb(var(--figma-bg))", color: "white" }}>

      {/* ── Figma Top Bar ── */}
      <header
        className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-white/5"
        style={{ background: "rgb(var(--figma-toolbar))" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </a>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[12px] text-white/40 font-medium">Roadmap</span>
            <span className="text-[12px] text-white/20">/</span>
            <span className="text-[13px] font-semibold truncate text-white/90">{businessLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
             <span className="text-[11px] font-bold text-white/60 tabular-nums">${totalCost}/mo</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors hover:bg-white/5 border border-white/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "Link Copied" : "Share"}
            </button>
            <ExportMenu shortId={shortId} />
          </div>
        </div>
      </header>

      {/* ── Figma Toolbar (Sub-header) ── */}
      <div className="h-10 flex-shrink-0 flex items-center px-4 border-b border-white/5 gap-2" style={{ background: "rgb(var(--figma-toolbar))" }}>
        <div className="flex items-center h-6 bg-white/5 rounded p-0.5 border border-white/5">
           {VARIANTS.map(v => (
             <button
               key={v.value}
               onClick={() => setVariant(v.value)}
               className={cn(
                 "px-3 h-full rounded text-[11px] font-medium transition-all",
                 variant === v.value ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
               )}
             >
               {v.label}
             </button>
           ))}
        </div>

        <div className="w-px h-4 bg-white/5 mx-1" />

        <div className="flex items-center h-6 bg-white/5 rounded p-0.5 border border-white/5">
          <button
            onClick={() => setViewMode("graph")}
            className={cn(
              "px-2.5 h-full rounded transition-all",
              viewMode === "graph" ? "bg-white/10 text-white" : "text-white/40"
            )}
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-sm opacity-60" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "px-2.5 h-full rounded transition-all",
              viewMode === "list" ? "bg-white/10 text-white" : "text-white/40"
            )}
          >
            <div className="w-3.5 h-3.5 flex flex-col gap-0.5 justify-center opacity-60">
               <div className="h-0.5 w-full bg-current" />
               <div className="h-0.5 w-full bg-current" />
               <div className="h-0.5 w-full bg-current" />
            </div>
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/40 uppercase tracking-wider font-bold">Max Budget</span>
          <input
            type="range"
            min={0}
            max={5}
            value={BUDGET_STEPS.indexOf(budgetMonthly)}
            onChange={(e) => setBudgetMonthly(BUDGET_STEPS[Number(e.target.value)])}
            className="w-32 figma-range"
          />
          <span className="text-[11px] font-bold tabular-nums text-white/80 min-w-[50px]">
            {budgetMonthly >= 1000 ? "Any" : `$${budgetMonthly}`}
          </span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* ── Left Sidebar (Stages/Layers) ── */}
        <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col" style={{ background: "rgb(var(--figma-toolbar))" }}>
          <div className="px-4 py-3 border-b border-white/5">
             <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Workflow Layers</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {roadmap.workflow_stages.map((s) => (
              <button
                key={s.stage_order}
                onClick={() => setSelectedStageId(s.stage_order)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 transition-colors",
                  selectedStageId === s.stage_order ? "bg-[rgb(var(--figma-blue))]/10 text-[rgb(var(--figma-blue))]" : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  selectedStageId === s.stage_order ? "bg-[rgb(var(--figma-blue))]" : "bg-white/20"
                )} />
                <span className="text-[12px] font-medium truncate">{s.stage_name}</span>
                <span className="ml-auto text-[10px] opacity-40">#{s.stage_order}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main Canvas ── */}
        <main className="flex-1 relative overflow-hidden" style={{ background: "rgb(var(--figma-canvas))" }}>
          {viewMode === "graph" ? (
            <RoadmapGraph
              roadmap={roadmap}
              variant={variant}
              budgetMonthly={budgetMonthly}
              onNodeClick={(id) => setSelectedStageId(Number(id.replace("stage-", "")))}
              selectedId={selectedStageId ? `stage-${selectedStageId}` : null}
            />
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
        </main>

        {/* ── Right Sidebar (Inspector) ── */}
        <aside className="w-[320px] flex-shrink-0 border-l border-white/5 flex flex-col" style={{ background: "rgb(var(--figma-toolbar))" }}>
           {selectedStage ? (
             <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                   <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Stage Properties</span>
                   <button onClick={() => setSelectedStageId(null)} className="text-white/40 hover:text-white transition-colors">
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M12.5 3.5l-9 9m0-9l9 9" stroke="currentColor" strokeWidth="1.5"/></svg>
                   </button>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto scrollbar-thin">
                   {/* Tool Identitiy */}
                   <section>
                      <h3 className="text-[14px] font-semibold text-white/90 mb-1">{selectedStage.stage_name}</h3>
                      <p className="text-[12px] text-white/50 leading-relaxed mb-4">{selectedStage.why_chosen}</p>

                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold bg-[rgb(var(--figma-blue))] px-1.5 py-0.5 rounded text-white uppercase tracking-tighter">Selected Tool</span>
                         </div>
                         <p className="font-bold text-[15px] mb-1">
                            {variant === 'cheapest' ? (selectedStage.cheapest_tool?.name ?? selectedStage.best_overall_tool.name) :
                             variant === 'open-source' ? (selectedStage.opensource_tool?.name ?? selectedStage.best_overall_tool.name) :
                             selectedStage.best_overall_tool.name}
                         </p>
                         <p className="text-[12px] text-white/60">
                            ${selectedStage.monthly_cost_estimate}/month
                         </p>
                      </div>
                   </section>

                   {/* Alternatives */}
                   <section>
                      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Alternatives</h4>
                      <div className="space-y-2">
                         {[
                           { type: 'Best Overall', tool: selectedStage.best_overall_tool, current: variant === 'best-overall' },
                           { type: 'Cheapest', tool: selectedStage.cheapest_tool, current: variant === 'cheapest' },
                           { type: 'Open Source', tool: selectedStage.opensource_tool, current: variant === 'open-source' }
                         ].filter(t => t.tool).map((alt, i) => (
                           <div key={i} className={cn(
                             "p-3 rounded-lg border transition-all",
                             alt.current ? "border-[rgb(var(--figma-blue))]/40 bg-[rgb(var(--figma-blue))]/5" : "border-white/5 bg-white/[0.02]"
                           )}>
                              <p className="text-[10px] text-white/40 mb-1">{alt.type}</p>
                              <p className="text-[12px] font-semibold">{alt.tool!.name}</p>
                              {alt.tool!.why && <p className="text-[11px] text-white/40 mt-1">{alt.tool!.why}</p>}
                           </div>
                         ))}
                      </div>
                   </section>

                   {/* Difficulty & Risk */}
                   <section>
                      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Implementation</h4>
                      <div className="grid grid-cols-2 gap-2">
                         <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-[10px] text-white/30 mb-1">Setup</p>
                            <p className="text-[12px] font-bold capitalize">{selectedStage.setup_difficulty}</p>
                         </div>
                         <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                            <p className="text-[10px] text-white/30 mb-1">Lock-in</p>
                            <p className="text-[12px] font-bold capitalize">{selectedStage.lock_in_risk}</p>
                         </div>
                      </div>
                   </section>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/20">
                <svg viewBox="0 0 24 24" className="w-12 h-12 mb-4 opacity-10 fill-current"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                <p className="text-[13px] font-medium">Select a stage on the canvas<br/>to view properties</p>
             </div>
           )}
        </aside>
      </div>
    </div>
  )
}

const VARIANTS: { value: Variant; label: string }[] = [
  { value: "best-overall", label: "Best Overall" },
  { value: "cheapest", label: "Cheapest" },
  { value: "open-source", label: "Open Source" },
]

const BUDGET_STEPS = [0, 50, 100, 200, 500, 1000]
