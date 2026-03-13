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
}

export function RoadmapGraph({ roadmap, variant, budgetMonthly }: RoadmapGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const sorted = [...roadmap.workflow_stages].sort((a, b) => a.stage_order - b.stage_order)

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
      style: {
        stroke: "rgb(242,98,34)",
        strokeWidth: 2,
        strokeOpacity: 0.5,
      },
      animated: false,
    }))

    return { nodes, edges }
  }, [roadmap, variant, budgetMonthly])

  return (
    <div
      className="w-full h-full rounded-3xl overflow-hidden"
      style={{
        border: "1px solid rgba(var(--line), 0.6)",
        boxShadow: "0 1px 3px rgba(20,12,4,0.04), 0 4px 16px rgba(20,12,4,0.06)",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.15}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(250,244,233,0.65) 100%)",
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="rgba(242,98,34,0.22)"
          gap={24}
          size={1.4}
        />
        <Controls
          showInteractive={false}
          className="!shadow-none"
          style={{ bottom: 16, right: 16, left: "auto" }}
        />
        <MiniMap
          nodeColor={(node) => {
            const nodeData = node.data as RoadmapNodeData
            if (
              nodeData?.budgetMonthly < 1000 &&
              nodeData?.stage?.monthly_cost_estimate > nodeData?.budgetMonthly
            ) {
              return "#d1d5db"
            }
            return "#f97316"
          }}
          maskColor="rgba(250,247,242,0.75)"
          style={{
            background: "rgba(255,255,255,0.85)",
            borderRadius: "12px",
          }}
        />
      </ReactFlow>
    </div>
  )
}
