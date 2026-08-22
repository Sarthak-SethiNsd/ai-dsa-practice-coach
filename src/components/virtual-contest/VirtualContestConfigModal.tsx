"use client";

import { useState } from "react";
import {
  VCConfig,
  VCPlatform,
  VCContestType,
  VCDifficulty,
  VCDurationMinutes,
  VCProblemCount,
} from "@/services/contest/virtualContestTypes";
import {
  Trophy,
  X,
  Sparkles,
  Layers,
  Clock,
  Target,
  Swords,
  CheckCircle2,
} from "lucide-react";

interface VirtualContestConfigModalProps {
  isOpen: boolean;
  config: VCConfig;
  topicOptions: string[];
  onConfigChange: (partial: Partial<VCConfig>) => void;
  onStart: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PLATFORMS: { label: string; value: VCPlatform; desc: string }[] = [
  { label: "Mixed Platforms", value: "mixed", desc: "LeetCode & Codeforces challenges" },
  { label: "LeetCode", value: "leetcode", desc: "Standard Big Tech contest style" },
  { label: "Codeforces", value: "codeforces", desc: "Fast-paced competitive math & greedy" },
];

const CONTEST_TYPES: { label: string; value: VCContestType; desc: string }[] = [
  { label: "Standard", value: "Standard", desc: "Balanced difficulty progression" },
  { label: "Weak Topic Drill", value: "Weak Topic Drill", desc: "Prioritizes your mistake patterns" },
  { label: "Rating Challenge", value: "Rating Challenge", desc: "Higher difficulty competitive simulation" },
  { label: "Interview Prep", value: "Interview Preparation", desc: "Core algorithms with clean code focus" },
];

const DIFFICULTIES: { label: string; value: VCDifficulty }[] = [
  { label: "Adaptive (A: Easy → Hard)", value: "Adaptive" },
  { label: "Mixed Difficulty", value: "Mixed" },
  { label: "Easy", value: "Easy" },
  { label: "Medium", value: "Medium" },
  { label: "Hard", value: "Hard" },
];

const DURATIONS: { label: string; value: VCDurationMinutes }[] = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
  { label: "120 min", value: 120 },
];

const PROBLEM_COUNTS: { label: string; value: VCProblemCount }[] = [
  { label: "2 Problems", value: 2 },
  { label: "3 Problems", value: 3 },
  { label: "4 Problems", value: 4 },
  { label: "5 Problems", value: 5 },
];

export function VirtualContestConfigModal({
  isOpen,
  config,
  topicOptions,
  onConfigChange,
  onStart,
  onCancel,
  isLoading = false,
}: VirtualContestConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Configure Virtual Contest
              </h2>
              <p className="text-xs text-slate-500">
                Simulate realistic timed contests with real platform problems.
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* 1. Platform */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
              Platform
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onConfigChange({ platform: p.value })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    config.platform === p.value
                      ? "bg-sky-50/80 border-sky-500 text-sky-950 ring-2 ring-sky-400/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs">{p.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Contest Type */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
              Contest Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONTEST_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onConfigChange({ contestType: t.value })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    config.contestType === t.value
                      ? "bg-amber-50/80 border-amber-500 text-amber-950 ring-2 ring-amber-400/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs">{t.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Duration & Problem Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Duration
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => onConfigChange({ durationMinutes: d.value })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      config.durationMinutes === d.value
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Count */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-slate-400" />
                Problem Count
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PROBLEM_COUNTS.map((pc) => (
                  <button
                    key={pc.value}
                    type="button"
                    onClick={() => onConfigChange({ problemCount: pc.value })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      config.problemCount === pc.value
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {pc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Difficulty & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                Difficulty Mode
              </label>
              <select
                value={config.difficulty}
                onChange={(e) =>
                  onConfigChange({ difficulty: e.target.value as VCDifficulty })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                Topic Focus
              </label>
              <select
                value={config.topic}
                onChange={(e) => onConfigChange({ topic: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="All Topics">All Topics (Standard)</option>
                <option value="Weak Topics">Weak Topics (Knowledge Base Sync)</option>
                {topicOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onStart}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Swords className="w-4 h-4 text-emerald-400" />
            <span>{isLoading ? "Preparing Contest..." : "Launch Contest"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
