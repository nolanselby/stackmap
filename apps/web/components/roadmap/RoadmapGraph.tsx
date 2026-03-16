"use client"
import { useMemo } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { RoadmapNode, type RoadmapNodeType, type RoadmapNodeData } from "./RoadmapNode"
import type { RoadmapResult } from "@roadmapper/schemas"

const NODE_WIDTH = 272
const NODE_HEIGHT = 168
const H_GAP = 88
const V_GAP = 72

// Must be defined outside component to avoid re-renders
const nodeTypes = { roadmapNode: RoadmapNode }

interface RoadmapGraphProps {
  roadmap: RoadmapResult
  variant: "best-overall" | "cheapest" | "open-source"
  budgetMonthly: number
  onNodeClick?: (id: string) => void
  selectedId?: string | null
}

export function RoadmapGraph({ roadmap, variant, budgetMonthly, onNodeClick, selectedId }: RoadmapGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const sorted = [...roadmap.workflow_stages].sort((a, b) => a.stage_order - b.stage_order)

    const useColumns = sorted.length > 6
    const colCount = useColumns ? 2 : 1

    const nodes: RoadmapNodeType[] = sorted.map((stage, i) => {
      const col = useColumns ? i % colCount : 0
      const row = useColumns ? Math.floor(i / colCount) : i
      const id = `stage-${stage.stage_order}`
      return {
        id,
        type: "roadmapNode",
        position: {
          x: col * (NODE_WIDTH + H_GAP),
          y: row * (NODE_HEIGHT + V_GAP),
        },
        data: { stage, variant, budgetMonthly } satisfies RoadmapNodeData,
        selected: id === selectedId,
      }
    })

    const edges: Edge[] = sorted.slice(0, -1).map((stage, i) => ({
      id: `edge-${i}`,
      source: `stage-${stage.stage_order}`,
      target: `stage-${sorted[i + 1].stage_order}`,
      type: "smoothstep",
      interactionWidth: 0,
      style: {
        stroke: "rgba(255,255,255,0.15)",
        strokeWidth: 2,
      },
      animated: false,
    }))

    return { nodes, edges }
  }, [roadmap, variant, budgetMonthly, selectedId])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        onNodeClick={(_, node) => onNodeClick?.(node.id)}
        minZoom={0.15}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        style={{
          background: "rgb(var(--figma-canvas))",
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="rgba(255,255,255,0.08)"
          gap={24}
          size={1}
        />
        <Controls
          showInteractive={false}
          className="!shadow-none !border-white/10 !bg-white/5"
          style={{ bottom: 16, right: 16, left: "auto" }}
        />
      </ReactFlow>
    </div>
  )
}
