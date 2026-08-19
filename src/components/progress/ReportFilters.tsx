"use client";

import * as React from "react";
import { ReportTimeRange, TimeRangePreset } from "@/services/progress/progressTypes";
import { Calendar, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReportFiltersProps {
  timeRange: ReportTimeRange;
  onSelectPreset: (preset: TimeRangePreset, customStart?: string, customEnd?: string) => void;
}

const PRESETS: { id: TimeRangePreset; label: string }[] = [
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "Last 90 Days" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom Range" },
];

export function ReportFilters({ timeRange, onSelectPreset }: ReportFiltersProps) {
  const [showCustomPicker, setShowCustomPicker] = React.useState(timeRange.preset === "custom");
  const [customStart, setCustomStart] = React.useState(timeRange.startDate);
  const [customEnd, setCustomEnd] = React.useState(timeRange.endDate);

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onSelectPreset("custom", customStart, customEnd);
      setShowCustomPicker(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-100 rounded-2xl">
      {/* Preset pills */}
      <div className="flex items-center gap-1 overflow-x-auto p-0.5">
        {PRESETS.map((preset) => {
          const isActive = timeRange.preset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                if (preset.id === "custom") {
                  setShowCustomPicker(!showCustomPicker);
                } else {
                  setShowCustomPicker(false);
                  onSelectPreset(preset.id);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-sky-700 shadow-xs border border-sky-100/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Selected Range Display */}
      <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-500 shrink-0">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span>
          {timeRange.startDate} → {timeRange.endDate}
        </span>
      </div>

      {/* Custom range picker dropdown */}
      {showCustomPicker && (
        <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800"
          />
          <Button size="sm" onClick={handleApplyCustom} className="text-xs py-1.5 px-3">
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
