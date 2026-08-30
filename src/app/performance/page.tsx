"use client";

import * as React from "react";
import {
  FullPerformanceIntelligence,
  PerformanceWindow,
  PERFORMANCE_WINDOW_CONFIGS,
} from "@/services/performance/performanceTypes";
import { compilePerformanceIntelligence } from "@/services/performance/performanceEngine";

// Component imports
import { PerformanceOverview } from "@/components/performance/PerformanceOverview";
import { SkillTrendChart } from "@/components/performance/SkillTrendChart";
import { PatternTrendTable } from "@/components/performance/PatternTrendTable";
import { DifficultyProgression } from "@/components/performance/DifficultyProgression";
import { TimeEfficiencyPanel } from "@/components/performance/TimeEfficiencyPanel";
import { PersistentWeaknesses } from "@/components/performance/PersistentWeaknesses";
import { ImprovementSignals } from "@/components/performance/ImprovementSignals";
import { LearningVelocityCard } from "@/components/performance/LearningVelocityCard";
import { StrategicRecommendations } from "@/components/performance/StrategicRecommendations";
import { PerformanceTimeline } from "@/components/performance/PerformanceTimeline";
import { AIPerformanceCoach } from "@/components/performance/AIPerformanceCoach";

type PerformanceTab =
  | "overview"
  | "skills"
  | "patterns"
  | "difficulty_time"
  | "weaknesses"
  | "strategy"
  | "coach"
  | "timeline";

export default function PerformancePage() {
  const [selectedWindow, setSelectedWindow] = React.useState<PerformanceWindow>("30d");
  const [activeTab, setActiveTab] = React.useState<PerformanceTab>("overview");
  const [intelligence, setIntelligence] = React.useState<FullPerformanceIntelligence | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async (win: PerformanceWindow, force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await compilePerformanceIntelligence(win, force);
      setIntelligence(data);
    } catch (err) {
      console.error("[PerformancePage] Load error:", err);
      setError("Failed to compile performance intelligence. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Asynchronous data loader; state updates occur after engine compilation resolves
    loadData(selectedWindow);
  }, [selectedWindow, loadData]);

  const handleWindowChange = (win: PerformanceWindow) => {
    setSelectedWindow(win);
  };

  const tabs: { id: PerformanceTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "skills", label: "Skills", icon: "🧠" },
    { id: "patterns", label: "Patterns", icon: "🎯" },
    { id: "difficulty_time", label: "Difficulty & Speed", icon: "⚖️" },
    { id: "weaknesses", label: "Weaknesses & Signals", icon: "⚠️" },
    { id: "strategy", label: "Strategy & Velocity", icon: "🚀" },
    { id: "coach", label: "AI Coach", icon: "🤖" },
    { id: "timeline", label: "Timeline", icon: "📜" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Longitudinal Performance Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Multi-session learning trajectories, verified skill progression, persistent weakness diagnosis, and goal-aligned strategic interventions.
          </p>
        </div>

        {/* Time Window Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit shrink-0 border border-slate-200/60">
          {(["7d", "30d", "90d", "all"] as const).map((win) => {
            const config = PERFORMANCE_WINDOW_CONFIGS[win];
            const isActive = selectedWindow === win;
            return (
              <button
                key={win}
                onClick={() => handleWindowChange(win)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title={config.description}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Loading / Error State ───────────────────────────────────────────── */}
      {isLoading && !intelligence ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl mx-auto mb-3">
            ⏳
          </div>
          <p className="text-sm font-bold text-slate-800">Compiling Longitudinal Intelligence...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating historical sessions, contests, SRS items, and learning graph nodes.</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <p className="text-sm font-bold text-red-800">{error}</p>
          <button
            onClick={() => loadData(selectedWindow, true)}
            className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer hover:bg-red-700"
          >
            Retry Analysis
          </button>
        </div>
      ) : intelligence ? (
        <div className="space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <PerformanceOverview
              intelligence={intelligence}
              onSelectTab={(t) => setActiveTab(t as PerformanceTab)}
            />
          )}

          {/* Tab 2: Skills */}
          {activeTab === "skills" && (
            <SkillTrendChart skills={intelligence.skillTrends} />
          )}

          {/* Tab 3: Patterns */}
          {activeTab === "patterns" && (
            <PatternTrendTable patterns={intelligence.patternTrends} />
          )}

          {/* Tab 4: Difficulty & Speed */}
          {activeTab === "difficulty_time" && (
            <div className="space-y-6">
              <DifficultyProgression difficultyTrend={intelligence.difficultyTrend} />
              <TimeEfficiencyPanel timeTrend={intelligence.timeTrend} />
            </div>
          )}

          {/* Tab 5: Weaknesses & Signals */}
          {activeTab === "weaknesses" && (
            <div className="space-y-6">
              <PersistentWeaknesses weaknesses={intelligence.persistentWeaknesses} />
              <ImprovementSignals signals={intelligence.improvementSignals} />
            </div>
          )}

          {/* Tab 6: Strategy & Velocity */}
          {activeTab === "strategy" && (
            <div className="space-y-6">
              <LearningVelocityCard velocity={intelligence.learningVelocity} />
              <StrategicRecommendations recommendations={intelligence.strategicRecommendations} />
            </div>
          )}

          {/* Tab 7: AI Coach */}
          {activeTab === "coach" && (
            <AIPerformanceCoach intelligence={intelligence} />
          )}

          {/* Tab 8: Timeline */}
          {activeTab === "timeline" && (
            <PerformanceTimeline timeline={intelligence.timeline} />
          )}
        </div>
      ) : null}
    </div>
  );
}
