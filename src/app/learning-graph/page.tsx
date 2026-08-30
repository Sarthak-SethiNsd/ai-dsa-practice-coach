"use client";

import { useState } from "react";
import { useLearningGraph } from "@/hooks/useLearningGraph";
import { SkillCategory, MasteryStatus } from "@/services/learningGraph/learningGraphTypes";

// UI Components
import { SkillGraph } from "@/components/learningGraph/SkillGraph";
import { SkillCardView } from "@/components/learningGraph/SkillCardView";
import { SkillDetailPanel } from "@/components/learningGraph/SkillDetailPanel";
import { LearningPathView } from "@/components/learningGraph/LearningPathView";
import { BottleneckRadar } from "@/components/learningGraph/BottleneckRadar";
import { UnlockedSkillsPanel } from "@/components/learningGraph/UnlockedSkillsPanel";
import { GraphInsightsPanel } from "@/components/learningGraph/GraphInsightsPanel";
import { AIGraphCoach } from "@/components/learningGraph/AIGraphCoach";

import {
  Network,
  Search,
  Layers,
  Map,
  AlertTriangle,
  Sparkles,
  Award,
  Grid,
  Maximize2,
  RefreshCw,
} from "lucide-react";

type SubView = "paths" | "bottlenecks" | "unlocks" | "insights" | "coach";

const CATEGORIES: { label: string; value: SkillCategory | "all" }[] = [
  { label: "All Categories", value: "all" },
  { label: "Fundamentals", value: "fundamentals" },
  { label: "Data Structures", value: "data_structures" },
  { label: "Algorithmic Paradigms", value: "algorithmic_paradigms" },
  { label: "Advanced Structures", value: "advanced_structures" },
];

export default function LearningGraphPage() {
  const {
    state,
    isLoading,
    error,
    refreshGraph,
    selectedNodeId,
    selectedNode,
    setSelectedNodeId,
    focusMode,
    setFocusMode,
    focusedNodeIds,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    filteredNodes,
    pathTargetId,
    setPathTargetId,
    adaptivePath,
  } = useLearningGraph();

  const [viewMode, setViewMode] = useState<"graph" | "cards">("graph");
  const [activeSubView, setActiveSubView] = useState<SubView>("paths");

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center space-y-3">
        <Network className="w-10 h-10 text-sky-600 animate-spin" />
        <span className="text-xs font-bold text-slate-600">
          Synthesizing DSA Skill Dependency Graph...
        </span>
      </div>
    );
  }

  const { stats } = state;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-800 text-sky-400 border border-slate-700 shadow-inner">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Shared Intelligence Layer
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Adaptive DSA Learning Graph
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshGraph}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Re-evaluate Graph Mastery"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Graph Mastery
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400">
                {stats.overallGraphMasteryPct}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mastered
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                {stats.masteredCount} <span className="text-xs font-normal text-slate-400">skills</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Developing
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-sky-400">
                {stats.developingCount}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Learning
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-400">
                {stats.learningCount}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Locked
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-400">
                {stats.lockedCount}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Decaying (SRS)
              </span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-400">
                {stats.decayingCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills & patterns..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as SkillCategory | "all")}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode("graph")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "graph"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visual Graph</span>
          </button>

          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "cards"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards View</span>
          </button>
        </div>
      </div>

      {/* Main Graph & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === "graph" ? (
            <SkillGraph
              nodes={filteredNodes}
              edges={state.edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              focusMode={focusMode}
              focusedNodeIds={focusedNodeIds}
            />
          ) : (
            <SkillCardView
              nodes={filteredNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          )}
        </div>

        {/* Inspector Detail Panel */}
        <div className="lg:col-span-1">
          <SkillDetailPanel
            node={selectedNode}
            allNodes={state.nodes}
            onSelectNode={setSelectedNodeId}
            onClose={() => setSelectedNodeId(null)}
            onSetFocusMode={setFocusMode}
            focusMode={focusMode}
          />
        </div>
      </div>

      {/* Sub-Views Tabs */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveSubView("paths")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "paths"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Adaptive Learning Paths</span>
          </button>

          <button
            onClick={() => setActiveSubView("bottlenecks")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "bottlenecks"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Bottleneck Radar ({state.bottlenecks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView("unlocks")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "unlocks"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Recently Unlocked ({state.unlockedSkills.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView("insights")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "insights"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Graph Insights</span>
          </button>

          <button
            onClick={() => setActiveSubView("coach")}
            className={`shrink-0 flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubView === "coach"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Graph Coach</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeSubView === "paths" && (
          <LearningPathView
            path={adaptivePath}
            allNodes={state.nodes}
            targetSkillId={pathTargetId}
            onSelectTarget={setPathTargetId}
            onSelectNode={setSelectedNodeId}
          />
        )}

        {activeSubView === "bottlenecks" && (
          <BottleneckRadar
            bottlenecks={state.bottlenecks}
            onSelectNode={setSelectedNodeId}
          />
        )}

        {activeSubView === "unlocks" && (
          <UnlockedSkillsPanel
            unlockedSkills={state.unlockedSkills}
            onSelectNode={setSelectedNodeId}
          />
        )}

        {activeSubView === "insights" && (
          <GraphInsightsPanel insights={state.insights} />
        )}

        {activeSubView === "coach" && (
          <AIGraphCoach coachAdvice={state.coachAdvice} />
        )}
      </div>
    </div>
  );
}
