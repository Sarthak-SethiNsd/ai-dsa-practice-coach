"use client";

import * as React from "react";
import { VirtualTour, GalleryItem } from "@/services/gallery/galleryTypes";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  Compass,
  CheckCircle2,
} from "lucide-react";

interface VirtualTourPlayerProps {
  tour: VirtualTour | null;
  galleryItems: GalleryItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function VirtualTourPlayer({
  tour,
  galleryItems,
  isOpen,
  onClose,
}: VirtualTourPlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [playIntervalSec, setPlayIntervalSec] = React.useState<number>(5);
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Map of gallery items by ID
  const itemMap = React.useMemo(() => {
    return new Map(galleryItems.map((item) => [item.id, item]));
  }, [galleryItems]);

  const totalSteps = tour?.steps.length ?? 0;
  const currentStep = tour?.steps[currentStepIndex];
  const currentItem = currentStep ? itemMap.get(currentStep.galleryItemId) : null;

  // Step navigation handlers
  const handlePrev = React.useCallback(() => {
    setIsPlaying(false);
    setIsCompleted(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = React.useCallback(() => {
    if (currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      setIsCompleted(true);
      return;
    }
    setCurrentStepIndex((prev) => prev + 1);
  }, [currentStepIndex, totalSteps]);

  const handleJumpToStep = (index: number) => {
    setIsPlaying(false);
    setIsCompleted(false);
    setCurrentStepIndex(index);
  };

  // Auto-play timer loop
  React.useEffect(() => {
    if (!isPlaying || !isOpen || isCompleted) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          setIsCompleted(true);
          return prev;
        }
        return prev + 1;
      });
    }, playIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isOpen, isCompleted, playIntervalSec, totalSteps]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || !tour) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      ref={modalRef}
    >
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        Step {currentStepIndex + 1} of {totalSteps}: {currentStep?.headline}
      </div>

      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Progress & Navigation Header */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Virtual Tour • Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <h2 id="tour-title" className="text-sm font-bold text-white line-clamp-1">
                {tour.title}
              </h2>
            </div>
          </div>

          {/* Controls: Auto-Play, Intervals, Close */}
          <div className="flex items-center gap-2">
            {/* Auto-Play Toggle */}
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              title="Spacebar toggles play/pause"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isPlaying ? "Pause" : "Auto-Play"}
            </button>

            {/* Interval Selector */}
            <select
              value={playIntervalSec}
              onChange={(e) => setPlayIntervalSec(Number(e.target.value))}
              aria-label="Auto-play interval"
              className="px-2 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={3}>3s speed</option>
              <option value={5}>5s speed</option>
              <option value={8}>8s speed</option>
            </select>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer ml-1"
              aria-label="Exit tour"
              title="Exit Tour (Escape)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="px-6 py-2 bg-slate-950/40 border-b border-slate-800/60">
          <ProgressBar completed={currentStepIndex + 1} total={totalSteps} height={4} showLabel={false} />
        </div>

        {/* Main Body: Visual Diagram + Commentary Panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[360px] lg:min-h-[520px]">
          {/* Left / Top: Active Visual Diagram */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 overflow-auto">
            {currentItem ? (
              <div
                className="w-full max-w-4xl max-h-[60vh] flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: currentItem.svgContent }}
              />
            ) : (
              <div className="text-slate-500 text-sm">Visual diagram not found for this step.</div>
            )}
          </div>

          {/* Right / Bottom: Tour Commentary & Takeaways */}
          <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between p-6 overflow-y-auto max-h-[42vh] lg:max-h-[560px]">
            <div className="space-y-4">
              {/* Step Headline */}
              <div>
                <Badge variant="primary" className="text-[10px] py-0 px-2 mb-1.5">
                  Step {currentStepIndex + 1}
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  {currentStep?.headline}
                </h3>
              </div>

              {/* Narration */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentStep?.narration}
              </p>

              {/* Action Prompt */}
              {currentStep?.actionPrompt && (
                <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/60 text-xs text-sky-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{currentStep.actionPrompt}</span>
                </div>
              )}

              {/* Key Takeaways */}
              {currentStep?.keyTakeaways && currentStep.keyTakeaways.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Key Insights
                  </h4>
                  <ul className="space-y-1.5">
                    {currentStep.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Step Navigation Dots & Arrows */}
            <div className="pt-5 border-t border-slate-800 mt-5 space-y-3">
              {/* Step Dots */}
              <div className="flex items-center justify-center gap-1.5">
                {tour.steps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleJumpToStep(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? "w-6 bg-sky-500"
                        : idx < currentStepIndex
                        ? "w-2 bg-emerald-500"
                        : "w-2 bg-slate-700 hover:bg-slate-600"
                    }`}
                    aria-label={`Jump to step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Previous / Next Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="flex-1 gap-1 cursor-pointer bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                {currentStepIndex < totalSteps - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNext}
                    className="flex-1 gap-1 cursor-pointer shadow-sm"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onClose}
                    className="flex-1 gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                  >
                    Finish Tour <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
