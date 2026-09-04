"use client";

import * as React from "react";
import { VisualElement, ElementHighlightType } from "@/services/visualizer/visualizerTypes";
import { Layers } from "lucide-react";

interface VisualizerCanvasProps {
  elements: readonly VisualElement[];
  auxiliaryElements?: readonly VisualElement[];
  algorithmFamily: string;
}

const HIGHLIGHT_STYLES: Record<ElementHighlightType, { card: string; text: string; badge?: string }> = {
  default: {
    card: "bg-white border-slate-200/90 text-slate-800 shadow-xs",
    text: "text-slate-800",
  },
  pointer_left: {
    card: "bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-400/40 shadow-sm",
    text: "text-sky-950 font-bold",
    badge: "L",
  },
  pointer_right: {
    card: "bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-400/40 shadow-sm",
    text: "text-indigo-950 font-bold",
    badge: "R",
  },
  pointer_mid: {
    card: "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/50 shadow-sm",
    text: "text-amber-950 font-extrabold",
    badge: "MID",
  },
  window_active: {
    card: "bg-sky-50/70 border-sky-400 text-sky-950 shadow-xs",
    text: "text-sky-900 font-bold",
  },
  comparing: {
    card: "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300 animate-pulse shadow-sm",
    text: "text-amber-950 font-bold",
  },
  swapping: {
    card: "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-400/50 shadow-sm",
    text: "text-rose-950 font-bold",
  },
  matched: {
    card: "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/60 shadow-sm",
    text: "text-emerald-950 font-black",
  },
  sorted: {
    card: "bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-xs",
    text: "text-emerald-900 font-bold",
  },
  discarded: {
    card: "bg-slate-100 border-slate-200 text-slate-400 opacity-40 grayscale",
    text: "text-slate-400 line-through",
  },
  stack_top: {
    card: "bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-400 shadow-sm",
    text: "text-amber-950 font-black",
    badge: "TOP",
  },
  stack_resolved: {
    card: "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs",
    text: "text-emerald-900 font-bold",
  },
};

export function VisualizerCanvas({
  elements,
  auxiliaryElements = [],
  algorithmFamily,
}: VisualizerCanvasProps) {
  // Find sliding window span if active
  const windowIndices = elements
    .filter((e) => e.highlight === "window_active" || e.highlight === "comparing")
    .map((e) => e.index);
  const minWindowIdx = windowIndices.length > 0 ? Math.min(...windowIndices) : -1;
  const maxWindowIdx = windowIndices.length > 0 ? Math.max(...windowIndices) : -1;
  const isSlidingWindowActive = algorithmFamily === "sliding_window" && minWindowIdx !== -1 && maxWindowIdx !== -1;

  return (
    <div className="flex flex-col space-y-4">
      {/* Primary Visual Canvas */}
      <div className="relative p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner min-h-[220px] flex flex-col justify-center items-center overflow-x-auto select-none">
        {/* Sliding Window Invariant Bracket Label */}
        {isSlidingWindowActive && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30 backdrop-blur-sm animate-in fade-in duration-200">
            <span>Window: [Indices {minWindowIdx} .. {maxWindowIdx}]</span>
          </div>
        )}

        {/* Horizontal Array Grid */}
        <div className="flex items-end justify-center gap-2 sm:gap-3 py-4 min-w-max">
          {elements.map((elem) => {
            const style = HIGHLIGHT_STYLES[elem.highlight] || HIGHLIGHT_STYLES.default;
            const pointerLabel = elem.label || style.badge;

            return (
              <div
                key={elem.id}
                className="flex flex-col items-center gap-1.5 transition-all duration-200"
                aria-label={`Index ${elem.index}, value ${elem.value}${pointerLabel ? `, ${pointerLabel}` : ""}`}
              >
                {/* Pointer Badge */}
                <div className="h-6 flex items-center justify-center">
                  {pointerLabel ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-sky-500 text-white shadow-xs">
                      {pointerLabel}
                    </span>
                  ) : (
                    <span className="h-4" />
                  )}
                </div>

                {/* Primary Card Element */}
                <div
                  className={`w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center rounded-xl border-2 text-base sm:text-lg font-mono font-extrabold transition-all duration-200 ${style.card}`}
                >
                  <span className={style.text}>{elem.value}</span>
                </div>

                {/* Index Pill */}
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  [{elem.index}]
                </span>

                {/* Secondary Resolved Value Badge (e.g. for stack wait days / next greater) */}
                {elem.secondaryValue !== undefined && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                    {elem.secondaryValue}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auxiliary Workspace: Monotonic Stack or Merge Buffers */}
      {auxiliaryElements.length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{algorithmFamily === "monotonic_stack" ? "Monotonic Stack (Bottom ➔ Top)" : "Auxiliary Buffer"}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {auxiliaryElements.map((aux) => (
              <div
                key={aux.id}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 shadow-xs"
              >
                {aux.label && (
                  <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px] font-semibold">
                    {aux.label}
                  </span>
                )}
                <span>{aux.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
