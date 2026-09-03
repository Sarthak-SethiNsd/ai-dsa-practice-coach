"use client";

import * as React from "react";
import Link from "next/link";
import { GalleryItem } from "@/services/gallery/galleryTypes";
import { Button } from "@/components/ui/Button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Star,
  BookOpen,
  Network,
} from "lucide-react";

interface ImageLightboxModalProps {
  item: GalleryItem | null;
  allItems: GalleryItem[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newItem: GalleryItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function ImageLightboxModal({
  item,
  allItems,
  isOpen,
  onClose,
  onNavigate,
  isFavorite,
  onToggleFavorite,
}: ImageLightboxModalProps) {
  const [zoomLevel, setZoomLevel] = React.useState<number>(1);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const triggerElementRef = React.useRef<HTMLElement | null>(null);

  // Focus management & capture trigger element
  React.useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
    return () => {
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    };
  }, [isOpen]);

  // Current item index in filtered set
  const currentIndex = item ? allItems.findIndex((i) => i.id === item.id) : -1;
  const hasMultiple = allItems.length > 1;

  const handlePrev = React.useCallback(() => {
    if (!hasMultiple || currentIndex === -1) return;
    const prevIdx = (currentIndex - 1 + allItems.length) % allItems.length;
    onNavigate(allItems[prevIdx]);
    setZoomLevel(1);
  }, [allItems, currentIndex, hasMultiple, onNavigate]);

  const handleNext = React.useCallback(() => {
    if (!hasMultiple || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % allItems.length;
    onNavigate(allItems[nextIdx]);
    setZoomLevel(1);
  }, [allItems, currentIndex, hasMultiple, onNavigate]);

  // Zoom controls
  const handleZoomIn = React.useCallback(() => {
    setZoomLevel((z) => (z < 2 ? Math.round((z + 0.5) * 10) / 10 : 2));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setZoomLevel((z) => (z > 1 ? Math.round((z - 0.5) * 10) / 10 : 1));
  }, []);

  const handleZoomReset = React.useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Keyboard navigation & Focus Trapping
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
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleZoomReset();
      } else if (e.key === "Tab" && modalRef.current) {
        // Focus trap
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, handleZoomIn, handleZoomOut, handleZoomReset, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      ref={modalRef}
    >
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite">
        Showing visual {currentIndex + 1} of {allItems.length}: {item.title}
      </div>

      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left / Top: Diagram Viewport */}
        <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[580px] p-4 overflow-hidden select-none">
          {/* Top Control Bar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            {/* Position indicator */}
            <span className="px-3 py-1 rounded-lg bg-slate-900/80 text-slate-300 text-xs font-semibold backdrop-blur-sm pointer-events-auto border border-slate-700/60">
              {currentIndex + 1} / {allItems.length}
            </span>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/60 pointer-events-auto">
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-2 py-1 rounded-lg text-xs font-mono font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Reset Zoom (0)"
                aria-label="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            </div>
          </div>

          {/* Scalable Diagram */}
          <div className="w-full h-full flex items-center justify-center overflow-auto p-4 max-h-[70vh]">
            <div
              className="w-full max-w-4xl transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
              dangerouslySetInnerHTML={{ __html: item.svgContent }}
            />
          </div>

          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 text-white border border-slate-700 hover:bg-sky-600 hover:border-sky-500 transition-all backdrop-blur-sm cursor-pointer shadow-lg"
                title="Previous Diagram (Left Arrow)"
                aria-label="Previous Diagram"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 text-white border border-slate-700 hover:bg-sky-600 hover:border-sky-500 transition-all backdrop-blur-sm cursor-pointer shadow-lg"
                title="Next Diagram (Right Arrow)"
                aria-label="Next Diagram"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Right / Bottom: Metadata & Deep Links Panel */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between p-6 overflow-y-auto max-h-[40vh] lg:max-h-[92vh]">
          <div className="space-y-5">
            {/* Header with Title & Close */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  {item.category.replace("_", " ")}
                </span>
                <h2 id="lightbox-title" className="text-xl font-bold text-white mt-1">
                  {item.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Close dialog"
                title="Close (Escape)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>

            {/* Key Invariant Notes */}
            {item.detailedNotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Key Algorithmic Invariants
                </h4>
                <ul className="space-y-1.5">
                  {item.detailedNotes.map((note, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-sky-400 font-bold shrink-0">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Topic Chips */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topics</h4>
              <div className="flex flex-wrap gap-1.5">
                {item.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions & Deep Links */}
          <div className="pt-6 border-t border-slate-800 space-y-3 mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onToggleFavorite(item.id)}
                className={`flex-1 gap-1.5 cursor-pointer text-xs ${
                  isFavorite
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </Button>
            </div>

            {/* Deep Links */}
            <div className="grid grid-cols-2 gap-2">
              {item.relatedSkillNodeId && (
                <Link
                  href={`/learning-graph`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Network className="w-3.5 h-3.5" /> Skill Graph
                </Link>
              )}

              <Link
                href={`/practice`}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Practice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
