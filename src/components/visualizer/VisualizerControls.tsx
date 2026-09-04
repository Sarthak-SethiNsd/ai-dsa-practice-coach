"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sliders,
} from "lucide-react";

interface VisualizerControlsProps {
  currentFrameIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMultiplier: 0.5 | 1 | 2 | 4;
  onPlayToggle: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: 0.5 | 1 | 2 | 4) => void;
  onScrub: (frameIndex: number) => void;
}

export function VisualizerControls({
  currentFrameIndex,
  totalSteps,
  isPlaying,
  speedMultiplier,
  onPlayToggle,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  onScrub,
}: VisualizerControlsProps) {
  const isAtStart = currentFrameIndex === 0;
  const isAtEnd = totalSteps > 0 && currentFrameIndex >= totalSteps - 1;

  return (
    <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          {/* Reset */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            disabled={isAtStart}
            className="cursor-pointer gap-1 text-slate-600 disabled:opacity-40"
            title="Reset (Key: R)"
            aria-label="Reset simulation to initial frame"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          {/* Step Back */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onStepBackward}
            disabled={isAtStart}
            className="cursor-pointer gap-1 text-slate-700 disabled:opacity-40"
            title="Step Back (Key: Left Arrow)"
            aria-label="Step backward one frame"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          {/* Play / Pause Toggle */}
          <Button
            variant="primary"
            size="sm"
            onClick={onPlayToggle}
            className="cursor-pointer gap-1.5 shadow-sm shadow-sky-500/10 min-w-[90px]"
            title="Play/Pause (Key: Space)"
            aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play
              </>
            )}
          </Button>

          {/* Step Forward */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onStepForward}
            disabled={isAtEnd}
            className="cursor-pointer gap-1 text-slate-700 disabled:opacity-40"
            title="Step Forward (Key: Right Arrow)"
            aria-label="Step forward one frame"
          >
            <span className="hidden sm:inline">Next</span>
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Speed Selector & Frame Counter */}
        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 mr-1">Speed:</span>
            {([0.5, 1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onSpeedChange(spd)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  speedMultiplier === spd
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Frame Counter Pill */}
          <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-mono font-bold">
            Step {totalSteps > 0 ? currentFrameIndex + 1 : 0} / {totalSteps}
          </div>
        </div>
      </div>

      {/* Frame Scrubber Range Bar */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentFrameIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
          aria-label="Step scrubber"
        />
      </div>
    </div>
  );
}
