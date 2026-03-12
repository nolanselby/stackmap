"use client"
import { useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { RoadmapNode, type RoadmapNodeType, type RoadmapNodeData } from "./RoadmapNode"
import type { RoadmapResult } from "@roadmapper/schemas"

const NODE_WIDTH = 260
const NODE_HEIGHT = 140
const H_GAP = 60
const V_GAP = 80

// nodeTypes must be defined outside component to avoid re-renders
const nodeTypes = { roadmapNode: RoadmapNode }

interface RoadmapGraphProps {
  roadmap: RoadmapResult
  variant: "best-overall" | "cheapest" | "open-source"
  budgetMonthly: number
}

export function RoadmapGraph({ roadmap, variant, budgetMonthly }: RoadmapGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const sorted = [...roadmap.workflow_stages].sort((a, b) => a.stage_order - b.stage_order)

    // Simple linear layout — top to bottom, 2 columns when > 6 stages
    const useColumns = sorted.length > 6
    const colCount = useColumns ? 2 : 1

    const nodes: RoadmapNodeType[] = sorted.map((stage, i) => {
      const col = useColumns ? i % colCount : 0
      const row = useColumns ? Math.floor(i / colCount) : i
      return {
        id: `stage-${stage.stage_order}`,
        type: "roadmapNode",
        position: {
          x: col * (NODE_WIDTH + H_GAP),
          y: row * (NODE_HEIGHT + V_GAP),
        },
        data: { stage, variant, budgetMonthly } satisfies RoadmapNodeData,
      }
    })

    const edges: Edge[] = sorted.slice(0, -1).map((stage, i) => ({
      id: `edge-${i}`,
      source: `stage-${stage.stage_order}`,
      target: `stage-${sorted[i + 1].stage_order}`,
      type: "smoothstep",
      style: { stroke: "#f97316", strokeWidth: 2 },
      animated: false,
    }))

    return { nodes, edges }
  }, [roadmap, variant, budgetMonthly])

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-orange-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#fed7aa" gap={20} />
        <Controls className="!border-orange-200 !bg-white" />
        <MiniMap
          nodeColor="#f97316"
          maskColor="rgba(255, 247, 237, 0.7)"
          className="!border-orange-200"
        />
      </ReactFlow>
    </div>
  )
}
