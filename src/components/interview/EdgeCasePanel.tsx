"use client";

import { useState } from "react";
import { ShieldAlert, Plus, X, CheckCircle2 } from "lucide-react";

interface EdgeCasePanelProps {
  edgeCases: string[];
  onAddEdgeCase: (ec: string) => void;
  onRemoveEdgeCase: (index: number) => void;
}

const COMMON_EDGE_PRESETS = [
  "Empty / null input",
  "Single element array",
  "All duplicate elements",
  "Negative numbers",
  "Large boundary values (10^9)",
  "No valid solution exists",
  "Odd vs even input length",
];

export function EdgeCasePanel({
  edgeCases,
  onAddEdgeCase,
  onRemoveEdgeCase,
}: EdgeCasePanelProps) {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    if (inputVal.trim()) {
      onAddEdgeCase(inputVal.trim());
      setInputVal("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-600" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Edge Case Discovery ({edgeCases.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Identified for testing phase
        </span>
      </div>

      {/* Preset Quick-Add */}
      <div className="flex gap-1.5 flex-wrap">
        {COMMON_EDGE_PRESETS.map((preset) => {
          const isAdded = edgeCases.includes(preset);
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                if (!isAdded) onAddEdgeCase(preset);
              }}
              disabled={isAdded}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                isAdded
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-700"
              }`}
            >
              {isAdded ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <Plus className="w-3 h-3 text-slate-400" />
              )}
              {preset}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add custom edge case (e.g. string with only spaces)..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors shrink-0"
        >
          Add
        </button>
      </div>

      {/* Active edge cases list */}
      {edgeCases.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {edgeCases.map((ec, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
            >
              <span>{ec}</span>
              <button
                type="button"
                onClick={() => onRemoveEdgeCase(idx)}
                className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
