"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  VisualizerAlgorithmFamily,
  VisualizerAlgorithmId,
  AlgorithmFrame,
  AlgorithmPreset,
} from "@/services/visualizer/visualizerTypes";
import { ALGORITHM_DEFINITIONS } from "@/services/visualizer/visualizerDefinitions";
import { generateAlgorithmFrames } from "@/services/visualizer/visualizerEngine";
import { VisualizerCanvas } from "./VisualizerCanvas";
import { VisualizerControls } from "./VisualizerControls";
import { StateInspectorPanel } from "./StateInspectorPanel";
import { CodeHighlighterPanel } from "./CodeHighlighterPanel";
import { CustomInputBar } from "./CustomInputBar";
import {
  PlayCircle,
  Clock,
  HardDrive,
  BookOpen,
  Network,
  Sparkles,
} from "lucide-react";

const ALGORITHM_FAMILIES: { id: VisualizerAlgorithmFamily; label: string; algorithms: VisualizerAlgorithmId[] }[] = [
  {
    id: "two_pointers",
    label: "Two Pointers",
    algorithms: ["two_pointers"],
  },
  {
    id: "sliding_window",
    label: "Sliding Window",
    algorithms: ["sliding_window_max_sum", "sliding_window_distinct"],
  },
  {
    id: "binary_search",
    label: "Binary Search",
    algorithms: ["binary_search"],
  },
  {
    id: "monotonic_stack",
    label: "Monotonic Stack",
    algorithms: ["daily_temperatures", "next_greater_element"],
  },
  {
    id: "sorting",
    label: "Sorting",
    algorithms: ["bubble_sort", "selection_sort", "merge_sort"],
  },
];

const SPEED_INTERVALS: Record<number, number> = {
  0.5: 1200,
  1: 700,
  2: 350,
  4: 150,
};

export function VisualizerHub() {
  const searchParams = useSearchParams();
  const urlAlgo = searchParams?.get("algo") as VisualizerAlgorithmId | null;
  const urlPreset = searchParams?.get("preset");

  // Determine initial algorithm safely
  const initialAlgoId: VisualizerAlgorithmId =
    urlAlgo && ALGORITHM_DEFINITIONS[urlAlgo] ? urlAlgo : "two_pointers";

  const [activeAlgoId, setActiveAlgoId] = React.useState<VisualizerAlgorithmId>(initialAlgoId);
  const [currentPresetId, setCurrentPresetId] = React.useState<string>(urlPreset || "");
  const [currentFrameIndex, setCurrentFrameIndex] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = React.useState<0.5 | 1 | 2 | 4>(1);

  const activeDef = ALGORITHM_DEFINITIONS[activeAlgoId] || ALGORITHM_DEFINITIONS.two_pointers;

  // Generate frames based on current configuration
  const [frames, setFrames] = React.useState<readonly AlgorithmFrame[]>(() => {
    const defaultPreset = activeDef.presets[0];
    if (typeof defaultPreset.inputArray === "string") {
      return generateAlgorithmFrames({
        algorithmId: activeDef.id,
        inputString: defaultPreset.inputArray,
      });
    }
    return generateAlgorithmFrames({
      algorithmId: activeDef.id,
      numbers: defaultPreset.inputArray,
      targetValue: typeof defaultPreset.targetValue === "number" ? defaultPreset.targetValue : undefined,
      windowSize: defaultPreset.windowSize,
    });
  });

  // Handle switching algorithm
  const handleSelectAlgorithm = React.useCallback((algoId: VisualizerAlgorithmId) => {
    setActiveAlgoId(algoId);
    const def = ALGORITHM_DEFINITIONS[algoId];
    const defaultPreset = def.presets[0];
    setCurrentPresetId(defaultPreset.id);
    setIsPlaying(false);
    setCurrentFrameIndex(0);

    let generated: readonly AlgorithmFrame[];
    if (typeof defaultPreset.inputArray === "string") {
      generated = generateAlgorithmFrames({
        algorithmId: def.id,
        inputString: defaultPreset.inputArray,
      });
    } else {
      generated = generateAlgorithmFrames({
        algorithmId: def.id,
        numbers: defaultPreset.inputArray,
        targetValue: typeof defaultPreset.targetValue === "number" ? defaultPreset.targetValue : undefined,
        windowSize: defaultPreset.windowSize,
      });
    }
    setFrames(generated);
  }, []);

  // Handle selecting preset
  const handleSelectPreset = React.useCallback((preset: AlgorithmPreset) => {
    setCurrentPresetId(preset.id);
    setIsPlaying(false);
    setCurrentFrameIndex(0);

    let generated: readonly AlgorithmFrame[];
    if (typeof preset.inputArray === "string") {
      generated = generateAlgorithmFrames({
        algorithmId: activeDef.id,
        inputString: preset.inputArray,
      });
    } else {
      generated = generateAlgorithmFrames({
        algorithmId: activeDef.id,
        numbers: preset.inputArray,
        targetValue: typeof preset.targetValue === "number" ? preset.targetValue : undefined,
        windowSize: preset.windowSize,
      });
    }
    setFrames(generated);
  }, [activeDef]);

  // Handle applying custom input
  const handleApplyCustomInput = React.useCallback(
    (params: {
      numbers?: readonly number[];
      inputString?: string;
      targetValue?: number;
      windowSize?: number;
    }) => {
      setIsPlaying(false);
      setCurrentFrameIndex(0);
      const generated = generateAlgorithmFrames({
        algorithmId: activeDef.id,
        numbers: params.numbers,
        inputString: params.inputString,
        targetValue: params.targetValue,
        windowSize: params.windowSize,
      });
      setFrames(generated);
    },
    [activeDef]
  );

  // Playback stepping
  const handleStepForward = React.useCallback(() => {
    setCurrentFrameIndex((prev) => {
      if (prev >= frames.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [frames.length]);

  const handleStepBackward = React.useCallback(() => {
    setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleReset = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  }, []);

  // Auto-play timer effect
  React.useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = SPEED_INTERVALS[speedMultiplier] ?? 700;
    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedMultiplier, frames.length]);

  // Global keyboard shortcuts (ignoring input/textarea fields)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleStepForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleStepBackward();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStepForward, handleStepBackward, handleReset]);

  const activeFrame = frames[currentFrameIndex] || frames[0];
  const activeFamily = ALGORITHM_FAMILIES.find((f) => f.algorithms.includes(activeAlgoId));

  return (
    <div className="space-y-6">
      {/* Screen Reader Live Step Announcement */}
      <div className="sr-only" aria-live="polite">
        Step {currentFrameIndex + 1} of {frames.length}: {activeFrame?.explanation}
      </div>

      {/* ── Page Header Banner ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <PlayCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Interactive Algorithm Visualizer
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                V1
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Deterministic step-by-step state simulation, pointer mechanics, and synchronized pseudocode execution.
            </p>
          </div>
        </div>

        {/* Algorithm Complexity Pill */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60 shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Time: <strong className="text-slate-900">{activeDef.timeComplexity}</strong></span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-indigo-600" />
            <span>Space: <strong className="text-slate-900">{activeDef.spaceComplexity}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Algorithm Family & Concrete Algorithm Selector Tabs ──────────────── */}
      <div className="space-y-3">
        {/* Family Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {ALGORITHM_FAMILIES.map((family) => {
            const isFamilyActive = family.algorithms.includes(activeAlgoId);

            return (
              <button
                key={family.id}
                type="button"
                onClick={() => handleSelectAlgorithm(family.algorithms[0])}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer select-none ${
                  isFamilyActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {family.label}
              </button>
            );
          })}
        </div>

        {/* Concrete Algorithm Selector (if family has multiple algorithms) */}
        {activeFamily && activeFamily.algorithms.length > 1 && (
          <div className="flex items-center gap-2 pl-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sub-Algorithm:</span>
            {activeFamily.algorithms.map((subAlgoId) => {
              const subDef = ALGORITHM_DEFINITIONS[subAlgoId];
              const isSubActive = activeAlgoId === subAlgoId;

              return (
                <button
                  key={subAlgoId}
                  type="button"
                  onClick={() => handleSelectAlgorithm(subAlgoId)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSubActive
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {subDef.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Custom Input & Presets Bar ───────────────────────────────────────── */}
      <CustomInputBar
        key={activeDef.id + "_" + (currentPresetId || activeDef.presets[0]?.id)}
        algorithmDef={activeDef}
        onApplyInput={handleApplyCustomInput}
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
      />

      {/* ── Main Interactive Layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Canvas + State Inspector + Controls) ~65% */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual Canvas */}
          <VisualizerCanvas
            elements={activeFrame?.elements || []}
            auxiliaryElements={activeFrame?.auxiliaryElements || []}
            algorithmFamily={activeDef.family}
          />

          {/* Playback Controls */}
          <VisualizerControls
            currentFrameIndex={currentFrameIndex}
            totalSteps={frames.length}
            isPlaying={isPlaying}
            speedMultiplier={speedMultiplier}
            onPlayToggle={() => setIsPlaying((p) => !p)}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onReset={handleReset}
            onSpeedChange={setSpeedMultiplier}
            onScrub={(idx) => {
              setIsPlaying(false);
              setCurrentFrameIndex(idx);
            }}
          />

          {/* State Inspector Panel */}
          <StateInspectorPanel
            explanation={activeFrame?.explanation || ""}
            stateVariables={activeFrame?.stateVariables || {}}
            status={activeFrame?.status || "running"}
            stepIndex={currentFrameIndex}
            totalSteps={frames.length}
          />
        </div>

        {/* Right Column (Pseudocode Tracer + Deep Links) ~35% */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pseudocode Highlighter */}
          <CodeHighlighterPanel
            pseudocode={activeDef.pseudocode}
            activeLineNumber={activeFrame?.activeLineNumber || 1}
          />

          {/* Deep Links to Practice & Learning Graph */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Deep Learning Handoffs
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/learning-graph"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-sky-700 text-xs font-semibold border border-slate-200/80 transition-colors"
              >
                <Network className="w-3.5 h-3.5 text-sky-600" /> Skill Node
              </Link>

              <Link
                href="/practice"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Practice Problem
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
