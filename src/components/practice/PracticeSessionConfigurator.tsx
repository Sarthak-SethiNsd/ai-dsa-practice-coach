"use client";

import * as React from "react";
import {
  PracticeSessionMode,
  PracticeSessionConfig,
  SESSION_MODE_CONFIGS,
  SESSION_PRESETS,
  getDefaultConfig,
} from "@/services/practice/practiceTypes";
import { getActiveGoal } from "@/services/preparation/preparationStorage";
import { PreparationGoal } from "@/services/preparation/preparationTypes";
import { Platform, Difficulty } from "@/services/types";

interface PracticeSessionConfiguratorProps {
  onStart: (config: PracticeSessionConfig) => void;
  isLoading?: boolean;
  initialDurationMinutes?: number;
  initialMode?: PracticeSessionMode;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120] as const;

export function PracticeSessionConfigurator({
  onStart,
  isLoading = false,
  initialDurationMinutes,
  initialMode,
}: PracticeSessionConfiguratorProps) {
  const [selectedMode, setSelectedMode] = React.useState<PracticeSessionMode>(
    initialMode ?? "smart_practice"
  );
  const [durationMinutes, setDurationMinutes] = React.useState<number>(
    initialDurationMinutes ?? 60
  );
  const [showCustom, setShowCustom] = React.useState(false);
  const [customDuration, setCustomDuration] = React.useState(60);
  const [platform, setPlatform] = React.useState<Platform | "any">("any");
  const [diffPref, setDiffPref] = React.useState<Difficulty | "Mixed" | "Adaptive">("Mixed");
  const [targetSkill, setTargetSkill] = React.useState("");
  const [targetPattern, setTargetPattern] = React.useState("");
  const [activeGoal] = React.useState<PreparationGoal | null>(() => {
    try {
      return getActiveGoal();
    } catch {
      return null;
    }
  });

  const effectiveDuration = showCustom ? customDuration : durationMinutes;

  const handleStart = () => {
    const base = getDefaultConfig(selectedMode, effectiveDuration);
    const config: PracticeSessionConfig = {
      ...base,
      preferredPlatform: platform,
      difficultyPreference: diffPref,
      targetSkill: targetSkill.trim() || null,
      targetPattern: targetPattern.trim() || null,
      activeGoalId: activeGoal?.id ?? null,
    };
    onStart(config);
  };

  const selectedModeConfig = SESSION_MODE_CONFIGS.find((m) => m.mode === selectedMode)!;

  return (
    <div className="space-y-6">
      {/* Active Goal Banner */}
      {activeGoal && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-lg">🏁</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Active Goal</p>
            <p className="text-sm font-semibold text-amber-900 truncate">{activeGoal.name}</p>
          </div>
          <span className="text-xs text-amber-600 font-medium shrink-0">{activeGoal.dailyMinutes}m/day</span>
        </div>
      )}

      {/* Mode Selection */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3">Session Mode</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SESSION_MODE_CONFIGS.map((mc) => {
            const isActive = selectedMode === mc.mode;
            return (
              <button
                key={mc.mode}
                onClick={() => setSelectedMode(mc.mode)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  isActive
                    ? `${mc.bgColor} ${mc.borderColor} ${mc.color}`
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-xl">{mc.icon}</span>
                <span className="text-xs font-bold leading-tight">{mc.label}</span>
              </button>
            );
          })}
        </div>
        {/* Mode description */}
        <div className={`mt-2 px-3 py-2 rounded-lg ${selectedModeConfig.bgColor} ${selectedModeConfig.borderColor} border`}>
          <p className="text-xs text-slate-700">{selectedModeConfig.description}</p>
        </div>
      </div>

      {/* Duration Presets */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3">Duration</h3>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => { setDurationMinutes(d); setShowCustom(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                !showCustom && durationMinutes === d
                  ? "bg-sky-600 border-sky-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-sky-300"
              }`}
            >
              {d}m
            </button>
          ))}
          <button
            onClick={() => setShowCustom(true)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
              showCustom
                ? "bg-sky-600 border-sky-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-sky-300"
            }`}
          >
            Custom
          </button>
        </div>

        {showCustom && (
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={180}
              step={5}
              value={customDuration}
              onChange={(e) => setCustomDuration(parseInt(e.target.value, 10))}
              className="flex-1 accent-sky-600"
            />
            <span className="text-sm font-bold text-sky-700 w-14 text-right">{customDuration}m</span>
          </div>
        )}
      </div>

      {/* Advanced Filters (Collapsible) */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 select-none">
          <span className="text-sky-600 group-open:rotate-90 transition-transform inline-block">▶</span>
          Advanced Filters (optional)
        </summary>
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-100">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | "any")}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-sky-300 focus:outline-none"
              >
                <option value="any">Any Platform</option>
                <option value="leetcode">LeetCode</option>
                <option value="codeforces">Codeforces</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Difficulty</label>
              <select
                value={diffPref}
                onChange={(e) => setDiffPref(e.target.value as Difficulty | "Mixed" | "Adaptive")}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-sky-300 focus:outline-none"
              >
                <option value="Mixed">Mixed (Adaptive)</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Target Skill (optional)</label>
            <input
              type="text"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              placeholder="e.g. Dynamic Programming, Binary Search"
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-sky-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Target Pattern (optional)</label>
            <input
              type="text"
              value={targetPattern}
              onChange={(e) => setTargetPattern(e.target.value)}
              placeholder="e.g. Sliding Window, Two Pointers"
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-sky-300 focus:outline-none"
            />
          </div>
        </div>
      </details>

      {/* Session Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">
              {selectedModeConfig.icon} {selectedModeConfig.label} · {effectiveDuration} min
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              ~{Math.floor(effectiveDuration / (SESSION_PRESETS[effectiveDuration]?.targetProblemCount ?? 3))}–
              {Math.ceil(effectiveDuration / 15)} problems
              {activeGoal ? ` · Aligned to "${activeGoal.name}"` : ""}
            </p>
          </div>
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold shadow-sm hover:bg-sky-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Planning..." : "Start Session →"}
          </button>
        </div>
      </div>
    </div>
  );
}
