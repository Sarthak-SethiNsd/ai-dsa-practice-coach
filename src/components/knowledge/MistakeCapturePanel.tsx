"use client";

import * as React from "react";
import { MISTAKE_CATEGORIES, MistakeCategory } from "@/services/knowledge/knowledgeTypes";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, X, Check, ChevronRight } from "lucide-react";

interface MistakeCapturePanelProps {
  onCapture: (category: MistakeCategory, description?: string) => void;
  onSkip?: () => void;
  problemTitle?: string;
  defaultCategory?: MistakeCategory;
}

export function MistakeCapturePanel({
  onCapture,
  onSkip,
  problemTitle,
  defaultCategory,
}: MistakeCapturePanelProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<MistakeCategory | null>(
    defaultCategory ?? null
  );
  const [description, setDescription] = React.useState("");
  const [step, setStep] = React.useState<"select" | "describe">("select");

  const handleSelectCategory = (cat: MistakeCategory) => {
    setSelectedCategory(cat);
    setStep("describe");
  };

  const handleSubmit = () => {
    if (!selectedCategory) return;
    onCapture(selectedCategory, description.trim() || undefined);
  };

  if (step === "describe") {
    const selectedInfo = MISTAKE_CATEGORIES.find((m) => m.id === selectedCategory);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Describe the mistake</p>
              <p className="text-xs text-slate-500">{problemTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setStep("select")}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-1"
          >
            ← Change type
          </button>
        </div>

        {/* Selected category */}
        <div className="p-3 rounded-xl bg-red-50 border border-red-100">
          <p className="text-xs font-bold text-red-700">{selectedInfo?.label}</p>
          <p className="text-xs text-red-600 mt-0.5">{selectedInfo?.description}</p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-1 block">
            What specifically went wrong? <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 'I kept getting index out of bounds because I forgot to check the empty array case before accessing nums[0]'"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 bg-white resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="gap-1.5 cursor-pointer">
              <X className="w-4 h-4" /> Skip
            </Button>
          )}
          <Button onClick={handleSubmit} className="gap-1.5 flex-1 cursor-pointer">
            <Check className="w-4 h-4" />
            Save Mistake
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">What went wrong?</p>
          {problemTitle && <p className="text-xs text-slate-500">{problemTitle}</p>}
        </div>
      </div>

      <p className="text-xs text-slate-500 font-medium">
        Select the primary reason this problem was difficult. This helps personalize your future recommendations.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {MISTAKE_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleSelectCategory(category.id)}
            className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
              selectedCategory === category.id
                ? "border-red-300 bg-red-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/30"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">{category.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        ))}
      </div>

      {onSkip && (
        <Button variant="ghost" onClick={onSkip} className="w-full gap-1.5 cursor-pointer text-slate-500">
          <X className="w-4 h-4" /> Skip mistake capture
        </Button>
      )}
    </div>
  );
}
