"use client";

import { Gauge, Check } from "lucide-react";

interface ComplexityPanelProps {
  time: string;
  space: string;
  explanation: string;
  onChange: (time: string, space: string, explanation: string) => void;
}

const COMMON_COMPLEXITIES = [
  "O(1)",
  "O(log N)",
  "O(N)",
  "O(N log N)",
  "O(N^2)",
  "O(2^N)",
  "O(M * N)",
];

export function ComplexityPanel({
  time,
  space,
  explanation,
  onChange,
}: ComplexityPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4 text-sky-600" />
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Complexity Analysis
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Time Complexity */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Time Complexity
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {COMMON_COMPLEXITIES.slice(0, 5).map((opt) => (
              <button
                key={`t_${opt}`}
                type="button"
                onClick={() => onChange(opt, space, explanation)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                  time === opt
                    ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Custom Time (e.g. O(M * N))"
            value={time}
            onChange={(e) => onChange(e.target.value, space, explanation)}
            className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Space Complexity */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Space Complexity (Auxiliary)
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {COMMON_COMPLEXITIES.slice(0, 5).map((opt) => (
              <button
                key={`s_${opt}`}
                type="button"
                onClick={() => onChange(time, opt, explanation)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                  space === opt
                    ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Custom Space (e.g. O(min(M, N)))"
            value={space}
            onChange={(e) => onChange(time, e.target.value, explanation)}
            className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Justification / Trade-off Notes
        </label>
        <textarea
          rows={2}
          value={explanation}
          onChange={(e) => onChange(time, space, e.target.value)}
          placeholder="e.g. Single-pass iteration takes O(N) time; hash map stores up to N distinct elements taking O(N) space."
          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
        />
      </div>
    </div>
  );
}
