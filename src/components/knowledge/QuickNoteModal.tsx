"use client";

import * as React from "react";
import { ProblemNote, KnowledgeTag, MistakeCategory } from "@/services/knowledge/knowledgeTypes";
import { ProblemNoteEditor } from "./ProblemNoteEditor";
import { MistakeCapturePanel } from "./MistakeCapturePanel";
import { X, BookOpen, AlertTriangle } from "lucide-react";

type ModalMode = "note" | "mistake";

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: ModalMode;
  initialNote?: Partial<ProblemNote>;
  existingNote?: ProblemNote;
  availableTags: KnowledgeTag[];
  onSaveNote: (note: Omit<ProblemNote, "id" | "createdAt" | "updatedAt">) => Promise<unknown>;
  onUpdateNote?: (id: string, updates: Partial<ProblemNote>) => Promise<unknown>;
  onAddCustomTag?: (name: string) => Promise<KnowledgeTag>;
  onCaptureMistake?: (noteId: string, category: MistakeCategory, description?: string) => Promise<void>;
}

export function QuickNoteModal({
  isOpen,
  onClose,
  mode = "note",
  initialNote,
  existingNote,
  availableTags,
  onSaveNote,
  onUpdateNote,
  onAddCustomTag,
  onCaptureMistake,
}: QuickNoteModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeMode, setActiveMode] = React.useState<ModalMode>(mode);

  // Reset mode when modal opens
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Resets modal draft sub-mode upon open state transition
    if (isOpen) setActiveMode(mode);
  }, [isOpen, mode]);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (note: Omit<ProblemNote, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    try {
      if (existingNote && onUpdateNote) {
        await onUpdateNote(existingNote.id, note);
      } else {
        await onSaveNote(note);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptureMistake = async (category: MistakeCategory, description?: string) => {
    if (!existingNote || !onCaptureMistake) return;
    setIsSubmitting(true);
    try {
      await onCaptureMistake(existingNote.id, category, description);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = existingNote
    ? `Edit Note — ${existingNote.problemTitle}`
    : activeMode === "mistake"
    ? "Capture Mistake"
    : "Add Problem Note";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeMode === "mistake" ? "bg-red-100" : "bg-sky-100"}`}>
                {activeMode === "mistake"
                  ? <AlertTriangle className="w-4 h-4 text-red-500" />
                  : <BookOpen className="w-4 h-4 text-sky-600" />
                }
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
                {initialNote?.problemTitle && (
                  <p className="text-xs text-slate-500">{initialNote.problemTitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mode switcher (when not editing existing) */}
              {!existingNote && onCaptureMistake && (
                <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <button
                    onClick={() => setActiveMode("note")}
                    className={`px-3 py-1.5 font-semibold transition-colors cursor-pointer ${activeMode === "note" ? "bg-sky-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Note
                  </button>
                  <button
                    onClick={() => setActiveMode("mistake")}
                    className={`px-3 py-1.5 font-semibold transition-colors cursor-pointer ${activeMode === "mistake" ? "bg-red-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Mistake
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {activeMode === "mistake" && existingNote ? (
              <MistakeCapturePanel
                onCapture={handleCaptureMistake}
                onSkip={onClose}
                problemTitle={existingNote.problemTitle}
                defaultCategory={existingNote.mistakeCategory}
              />
            ) : (
              <ProblemNoteEditor
                initialNote={existingNote ?? initialNote}
                availableTags={availableTags}
                onSave={handleSave}
                onCancel={onClose}
                onAddCustomTag={onAddCustomTag}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
