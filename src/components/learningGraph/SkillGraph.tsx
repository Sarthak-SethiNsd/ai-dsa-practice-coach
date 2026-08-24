"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  SkillNode,
  DependencyEdge,
  MasteryStatus,
} from "@/services/learningGraph/learningGraphTypes";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
} from "lucide-react";

interface SkillGraphProps {
  nodes: SkillNode[];
  edges: DependencyEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  focusMode: "none" | "prerequisites" | "dependents";
  focusedNodeIds: Set<string>;
}

const STATUS_COLORS: Record<
  MasteryStatus,
  { bg: string; border: string; text: string; fill: string; dot: string }
> = {
  MASTERED: {
    bg: "bg-emerald-50",
    border: "border-emerald-500",
    text: "text-emerald-950",
    fill: "#10b981",
    dot: "bg-emerald-500",
  },
  DEVELOPING: {
    bg: "bg-sky-50",
    border: "border-sky-500",
    text: "text-sky-950",
    fill: "#0ea5e9",
    dot: "bg-sky-500",
  },
  LEARNING: {
    bg: "bg-amber-50",
    border: "border-amber-500",
    text: "text-amber-950",
    fill: "#f59e0b",
    dot: "bg-amber-500",
  },
  DISCOVERED: {
    bg: "bg-slate-100",
    border: "border-slate-400",
    text: "text-slate-700",
    fill: "#94a3b8",
    dot: "bg-slate-400",
  },
  DECAYING: {
    bg: "bg-rose-50",
    border: "border-rose-500",
    text: "text-rose-950",
    fill: "#f43f5e",
    dot: "bg-rose-500",
  },
  LOCKED: {
    bg: "bg-slate-50",
    border: "border-slate-300",
    text: "text-slate-400",
    fill: "#cbd5e1",
    dot: "bg-slate-300",
  },
};

export function SkillGraph({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  focusMode,
  focusedNodeIds,
}: SkillGraphProps) {
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Handle pan drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(0.85);
    setPan({ x: 40, y: 30 });
  };

  return (
    <div className="relative w-full h-[650px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* Controls Overlay Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-slate-300 text-xs">
        <span className="font-mono font-bold text-sky-400">
          {nodes.length} Nodes • {edges.length} Dependencies
        </span>
        <div className="h-3 w-px bg-slate-700 mx-1" />
        <button
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          className="p-1 hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
          className="p-1 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1 hover:text-white transition-colors cursor-pointer"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <span className="font-mono text-[11px] text-slate-400 pl-1">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-[11px]">
        {(["MASTERED", "DEVELOPING", "LEARNING", "DECAYING", "LOCKED"] as MasteryStatus[]).map(
          (status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status].dot}`} />
              <span className="text-slate-400 capitalize">{status.toLowerCase()}</span>
            </div>
          )
        )}
      </div>

      {/* Interactive SVG Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full cursor-${isDragging ? "grabbing" : "grab"}`}
      >
        <svg
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <defs>
            {/* Standard Arrow Marker */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>

            {/* Active Highlight Arrow Marker */}
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Grid Background Pattern */}
          <pattern
            id="grid-pattern"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="25" cy="25" r="1" fill="#334155" opacity="0.3" />
          </pattern>
          <rect width="2000" height="2000" fill="url(#grid-pattern)" />

          {/* Dependency Edges (Lines) */}
          {edges.map((edge) => {
            const source = nodeMap.get(edge.sourceId);
            const target = nodeMap.get(edge.targetId);
            if (!source || !target) return null;

            const x1 = (source.position?.x ?? 200) + 90;
            const y1 = (source.position?.y ?? 100) + 30;
            const x2 = (target.position?.x ?? 200) + 90;
            const y2 = (target.position?.y ?? 100) + 30;

            const isEdgeFocused =
              (selectedNodeId === edge.sourceId || selectedNodeId === edge.targetId) ||
              (hoveredNodeId === edge.sourceId || hoveredNodeId === edge.targetId);

            // Bezier curve midpoint
            const dx = x2 - x1;
            const dy = y2 - y1;
            const cx1 = x1 + dx * 0.2;
            const cy1 = y1 + dy * 0.5;
            const cx2 = x1 + dx * 0.8;
            const cy2 = y1 + dy * 0.5;

            const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

            return (
              <g key={edge.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isEdgeFocused ? "#38bdf8" : "#334155"}
                  strokeWidth={isEdgeFocused ? 2.5 : 1.2}
                  strokeDasharray={edge.type === "related" ? "4 3" : undefined}
                  markerEnd={isEdgeFocused ? "url(#arrow-active)" : "url(#arrow)"}
                  opacity={isEdgeFocused ? 1.0 : 0.45}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Skill Nodes */}
          {nodes.map((node) => {
            const x = node.position?.x ?? 200;
            const y = node.position?.y ?? 100;
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isFocused = focusedNodeIds.size === 0 || focusedNodeIds.has(node.id);
            const style = STATUS_COLORS[node.status];

            return (
              <g
                key={node.id}
                transform={`translate(${x}, ${y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer"
                opacity={isFocused ? 1.0 : 0.25}
              >
                {/* Node Box */}
                <rect
                  width="180"
                  height="60"
                  rx="16"
                  fill={isSelected ? "#0f172a" : "#1e293b"}
                  stroke={isSelected ? "#38bdf8" : isHovered ? "#94a3b8" : style.fill}
                  strokeWidth={isSelected ? 3 : 1.5}
                  filter={isSelected ? "drop-shadow(0 0 12px rgba(56, 189, 248, 0.4))" : undefined}
                  className="transition-all duration-150"
                />

                {/* Status Dot */}
                <circle cx="18" cy="20" r="5" fill={style.fill} />

                {/* Node Title */}
                <text
                  x="30"
                  y="24"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.name.length > 20 ? node.name.slice(0, 18) + "..." : node.name}
                </text>

                {/* Mastery Bar / Score */}
                {node.status === "LOCKED" ? (
                  <g transform="translate(30, 36)">
                    <text fill="#94a3b8" fontSize="9" fontWeight="600">
                      🔒 Locked (Prereq &lt; 45%)
                    </text>
                  </g>
                ) : (
                  <g transform="translate(30, 34)">
                    {/* Meter background */}
                    <rect width="100" height="4" rx="2" fill="#334155" />
                    {/* Meter fill */}
                    <rect
                      width={Math.max(4, node.masteryScore)}
                      height="4"
                      rx="2"
                      fill={style.fill}
                    />
                    {/* Score Label */}
                    <text
                      x="110"
                      y="6"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.masteryScore}%
                    </text>
                  </g>
                )}

                {/* Difficulty Chip */}
                <text
                  x="155"
                  y="18"
                  fill="#64748b"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {node.difficulty}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
