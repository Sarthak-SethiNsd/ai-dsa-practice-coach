"use client";

import * as React from "react";
import { AlgorithmDefinition, AlgorithmPreset } from "@/services/visualizer/visualizerTypes";
import {
  validateVisualizerInput,
  autoSortNumbers,
  validateNumericArray,
} from "@/services/visualizer/visualizerValidation";
import { Button } from "@/components/ui/Button";
import { Play, AlertCircle, ArrowUpDown, Bookmark } from "lucide-react";

interface CustomInputBarProps {
  algorithmDef: AlgorithmDefinition;
  onApplyInput: (params: {
    numbers?: readonly number[];
    inputString?: string;
    targetValue?: number;
    windowSize?: number;
  }) => void;
  currentPresetId?: string;
  onSelectPreset: (preset: AlgorithmPreset) => void;
}

export function CustomInputBar({
  algorithmDef,
  onApplyInput,
  currentPresetId,
  onSelectPreset,
}: CustomInputBarProps) {
  const activePreset =
    algorithmDef.presets.find((p) => p.id === currentPresetId) || algorithmDef.presets[0];

  // Lazy state initializers
  const [rawInput, setRawInput] = React.useState<string>(() => {
    if (!activePreset) return "";
    return typeof activePreset.inputArray === "string"
      ? activePreset.inputArray
      : activePreset.inputArray.join(", ");
  });

  const [rawTarget, setRawTarget] = React.useState<string>(() => {
    if (!activePreset || activePreset.targetValue === undefined) return "";
    return String(activePreset.targetValue);
  });

  const [rawWindowSize, setRawWindowSize] = React.useState<string>(() => {
    if (!activePreset || activePreset.windowSize === undefined) return "";
    return String(activePreset.windowSize);
  });

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    const preset = algorithmDef.presets.find((p) => p.id === presetId);
    if (preset) {
      onSelectPreset(preset);
      if (typeof preset.inputArray === "string") {
        setRawInput(preset.inputArray);
      } else {
        setRawInput(preset.inputArray.join(", "));
      }
      setRawTarget(preset.targetValue !== undefined ? String(preset.targetValue) : "");
      setRawWindowSize(preset.windowSize !== undefined ? String(preset.windowSize) : "");
      setErrorMessage(null);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateVisualizerInput(
      algorithmDef.id,
      rawInput,
      algorithmDef.hasTargetInput ? rawTarget : undefined,
      algorithmDef.hasWindowSizeInput ? rawWindowSize : undefined
    );

    if (!result.isValid) {
      setErrorMessage(result.errorMessage ?? "Invalid input parameters.");
      return;
    }

    setErrorMessage(null);
    onApplyInput({
      numbers: result.sanitizedNumbers,
      inputString: result.sanitizedString,
      targetValue: typeof result.sanitizedTarget === "number" ? result.sanitizedTarget : undefined,
      windowSize: result.sanitizedWindowSize,
    });
  };

  const handleAutoSort = () => {
    const parsed = validateNumericArray(rawInput);
    if (parsed.isValid && parsed.numbers) {
      const sorted = autoSortNumbers(parsed.numbers);
      const sortedStr = sorted.join(", ");
      setRawInput(sortedStr);
      setErrorMessage(null);

      const targetVal = algorithmDef.hasTargetInput ? Number(rawTarget) : undefined;
      onApplyInput({
        numbers: sorted,
        targetValue: targetVal,
      });
    }
  };

  return (
    <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
      {/* Top Presets Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Curated Presets:</span>
        </div>

        <select
          value={currentPresetId || algorithmDef.presets[0]?.id}
          onChange={handlePresetChange}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          aria-label="Select algorithm preset"
        >
          {algorithmDef.presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.title}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Input Form */}
      <form onSubmit={handleCustomSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          {/* Primary Array / String Input */}
          <div className="flex-1 space-y-1">
            <label htmlFor="custom-array-input" className="text-xs font-bold text-slate-700">
              {algorithmDef.inputType === "string"
                ? "Custom String Input (5-15 chars):"
                : "Custom Array Elements (5-15 numbers):"}
            </label>
            <input
              id="custom-array-input"
              type="text"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={algorithmDef.inputType === "string" ? "e.g. abcabcbb" : "e.g. 2, 7, 11, 15"}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Target Value (if applicable) */}
          {algorithmDef.hasTargetInput && (
            <div className="w-full sm:w-28 space-y-1">
              <label htmlFor="target-input" className="text-xs font-bold text-slate-700">
                Target Sum:
              </label>
              <input
                id="target-input"
                type="text"
                value={rawTarget}
                onChange={(e) => setRawTarget(e.target.value)}
                placeholder="e.g. 9"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          )}

          {/* Window Size K (if applicable) */}
          {algorithmDef.hasWindowSizeInput && (
            <div className="w-full sm:w-28 space-y-1">
              <label htmlFor="window-size-input" className="text-xs font-bold text-slate-700">
                Window (K):
              </label>
              <input
                id="window-size-input"
                type="text"
                value={rawWindowSize}
                onChange={(e) => setRawWindowSize(e.target.value)}
                placeholder="e.g. 3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          )}

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="gap-1.5 cursor-pointer shadow-sm shadow-sky-500/10 shrink-0 h-[38px]"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run Custom
          </Button>
        </div>

        {/* Validation Error Alert & Auto-Sort Helper */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>

            {algorithmDef.requiresSortedInput && (
              <button
                type="button"
                onClick={handleAutoSort}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
              >
                <ArrowUpDown className="w-3 h-3" /> Auto-Sort Array
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
