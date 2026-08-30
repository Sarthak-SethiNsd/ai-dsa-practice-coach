"use client";

import * as React from "react";
import { AdaptiveStrategyResult } from "@/services/intervention/interventionTypes";
import { compileAdaptiveStrategy } from "@/services/intervention/interventionEngine";

// Component imports
import { AdaptiveStrategyOverview } from "@/components/intervention/AdaptiveStrategyOverview";
import { ActiveInterventions } from "@/components/intervention/ActiveInterventions";
import { StrategyDiagnosis } from "@/components/intervention/StrategyDiagnosis";
import { DifficultyCalibrationPanel } from "@/components/intervention/DifficultyCalibrationPanel";
import { PracticeModeCalibration } from "@/components/intervention/PracticeModeCalibration";
import { StrategyPriorityPanel } from "@/components/intervention/StrategyPriorityPanel";
import { InterventionTimeline } from "@/components/intervention/InterventionTimeline";
import { InterventionOutcome } from "@/components/intervention/InterventionOutcome";
import { StrategyHistory } from "@/components/intervention/StrategyHistory";
import { AIStrategyCoach } from "@/components/intervention/AIStrategyCoach";

type StrategyTab =
  | "overview"
  | "interventions"
  | "diagnosis"
  | "difficulty"
  | "practice_mode"
  | "priority"
  | "history"
  | "coach";

export default function StrategyPage() {
  const [activeTab, setActiveTab] = React.useState<StrategyTab>("overview");
  const [result, setResult] = React.useState<AdaptiveStrategyResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadStrategy = React.useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await compileAdaptiveStrategy(force);
      setResult(data);
    } catch (err) {
      console.error("[StrategyPage] Load error:", err);
      setError("Failed to compile adaptive strategy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Asynchronous data loader; synchronizes strategy with Intervention engine
    loadStrategy();
  }, [loadStrategy]);

  const tabs: { id: StrategyTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "interventions", label: "Interventions", icon: "⚡" },
    { id: "diagnosis", label: "Diagnosis", icon: "🔍" },
    { id: "difficulty", label: "Difficulty", icon: "⚖️" },
    { id: "practice_mode", label: "Practice Mode", icon: "🎯" },
    { id: "priority", label: "Priority Ranking", icon: "🔢" },
    { id: "history", label: "History & Outcomes", icon: "📜" },
    { id: "coach", label: "AI Coach", icon: "🤖" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Adaptive Intervention & Strategy Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            The decision layer converting longitudinal performance evidence into actionable strategy modes, difficulty calibration, and targeted interventions.
          </p>
        </div>

        <button
          onClick={() => loadStrategy(true)}
          className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs shrink-0 self-start md:self-auto"
        >
          🔄 Re-evaluate Strategy
        </button>
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
      {isLoading && !result ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mx-auto mb-3">
            ⏳
          </div>
          <p className="text-sm font-bold text-slate-800">Compiling Adaptive Strategy...</p>
          <p className="text-xs text-slate-400 mt-1">Evaluating performance intelligence, running diagnoses, and resolving intervention priorities.</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <p className="text-sm font-bold text-red-800">{error}</p>
          <button
            onClick={() => loadStrategy(true)}
            className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer hover:bg-red-700"
          >
            Retry Strategy Compilation
          </button>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <AdaptiveStrategyOverview
              result={result}
              onSelectTab={(t) => setActiveTab(t as StrategyTab)}
            />
          )}

          {/* Tab 2: Interventions */}
          {activeTab === "interventions" && (
            <ActiveInterventions plans={result.plans} />
          )}

          {/* Tab 3: Diagnosis */}
          {activeTab === "diagnosis" && (
            <StrategyDiagnosis diagnoses={result.diagnoses} />
          )}

          {/* Tab 4: Difficulty */}
          {activeTab === "difficulty" && (
            <DifficultyCalibrationPanel
              policy={result.state.difficultyPolicy}
              preferredDifficulty={result.state.preferredDifficulty}
              pacingDiagnosis={result.intelligenceSummary.pacingDiagnosis}
            />
          )}

          {/* Tab 5: Practice Mode */}
          {activeTab === "practice_mode" && (
            <PracticeModeCalibration
              preferredModes={result.state.preferredPracticeModes}
              timePressureLevel={result.state.timePressureLevel}
              currentModeRationale={result.state.modeRationale}
            />
          )}

          {/* Tab 6: Priority */}
          {activeTab === "priority" && (
            <StrategyPriorityPanel plans={result.plans} />
          )}

          {/* Tab 7: History & Outcomes */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <StrategyHistory history={result.history} />
              <InterventionTimeline plans={result.plans} />
              <InterventionOutcome outcomes={result.outcomes} />
            </div>
          )}

          {/* Tab 8: AI Coach */}
          {activeTab === "coach" && (
            <AIStrategyCoach result={result} />
          )}
        </div>
      ) : null}
    </div>
  );
}
