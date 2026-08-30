"use client";

import * as React from "react";
import {
  ProblemNote,
  KnowledgeTag,
  MistakeCategory,
  NoteRevisionStatus,
  DSA_PATTERNS,
  MISTAKE_CATEGORIES,
} from "@/services/knowledge/knowledgeTypes";
import { Platform, Difficulty } from "@/services/types";
import { ProblemTagSelector } from "./ProblemTagSelector";
import { Button } from "@/components/ui/Button";
import {
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  Clock,
  Zap,
  BookOpen,
  Code2,
  RefreshCw,
} from "lucide-react";

const DIFFICULTY_OPTIONS: Difficulty[] = ["Easy", "Medium", "Hard"];
const PLATFORMS: Platform[] = ["leetcode", "codeforces"];
const REVISION_STATUSES: { id: NoteRevisionStatus; label: string }[] = [
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "revisit", label: "Needs Revisit" },
  { id: "forgotten", label: "Forgotten" },
  { id: "mastered", label: "Mastered" },
];

interface ProblemNoteEditorProps {
  initialNote?: Partial<ProblemNote>;
  availableTags: KnowledgeTag[];
  onSave: (note: Omit<ProblemNote, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onCancel?: () => void;
  onAddCustomTag?: (name: string) => Promise<KnowledgeTag>;
  isSubmitting?: boolean;
}

export function ProblemNoteEditor({
  initialNote,
  availableTags,
  onSave,
  onCancel,
  onAddCustomTag,
  isSubmitting = false,
}: ProblemNoteEditorProps) {
  // Problem identity
  const [platform, setPlatform] = React.useState<Platform>(initialNote?.platform ?? "leetcode");
  const [problemTitle, setProblemTitle] = React.useState(initialNote?.problemTitle ?? "");
  const [topic, setTopic] = React.useState(initialNote?.topic ?? "");
  const [difficulty, setDifficulty] = React.useState<Difficulty>(initialNote?.difficulty ?? "Medium");
  const [problemUrl, setProblemUrl] = React.useState(initialNote?.problemUrl ?? "");
  const [platformProblemId] = React.useState(initialNote?.platformProblemId ?? "");

  // Note content
  const [personalExplanation, setPersonalExplanation] = React.useState(initialNote?.personalExplanation ?? "");
  const [approachUsed, setApproachUsed] = React.useState(initialNote?.approachUsed ?? "");
  const [keyInsight, setKeyInsight] = React.useState(initialNote?.keyInsight ?? "");
  const [mistakeMade, setMistakeMade] = React.useState(initialNote?.mistakeMade ?? "");
  const [mistakeCategory, setMistakeCategory] = React.useState<MistakeCategory | "">(
    initialNote?.mistakeCategory ?? ""
  );
  const [edgeCasesDiscovered, setEdgeCasesDiscovered] = React.useState(initialNote?.edgeCasesDiscovered ?? "");
  const [timeComplexity, setTimeComplexity] = React.useState(initialNote?.timeComplexity ?? "");
  const [spaceComplexity, setSpaceComplexity] = React.useState(initialNote?.spaceComplexity ?? "");
  const [alternativeApproach, setAlternativeApproach] = React.useState(initialNote?.alternativeApproach ?? "");

  // Tags & patterns
  const [tags, setTags] = React.useState<string[]>(initialNote?.tags ?? []);
  const [patternName, setPatternName] = React.useState<string>(initialNote?.patternName ?? "");

  // Status
  const [revisionStatus, setRevisionStatus] = React.useState<NoteRevisionStatus>(
    initialNote?.revisionStatus ?? "not_started"
  );

  // Section collapse
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemTitle.trim()) return;

    const note: Omit<ProblemNote, "id" | "createdAt" | "updatedAt"> = {
      problemId: platformProblemId || problemTitle.toLowerCase().replace(/\s+/g, "-"),
      platformProblemId: platformProblemId || undefined,
      platform,
      problemTitle: problemTitle.trim(),
      topic: topic.trim() || "General",
      difficulty,
      problemUrl: problemUrl.trim() || undefined,
      personalExplanation: personalExplanation.trim() || undefined,
      approachUsed: approachUsed.trim() || undefined,
      keyInsight: keyInsight.trim() || undefined,
      mistakeMade: mistakeMade.trim() || undefined,
      mistakeCategory: (mistakeCategory as MistakeCategory) || undefined,
      edgeCasesDiscovered: edgeCasesDiscovered.trim() || undefined,
      timeComplexity: timeComplexity.trim() || undefined,
      spaceComplexity: spaceComplexity.trim() || undefined,
      alternativeApproach: alternativeApproach.trim() || undefined,
      tags,
      patternName: tags.includes("Pattern") ? (patternName || undefined) : undefined,
      revisionStatus,
    };

    await onSave(note);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Problem Identity */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Problem Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 mb-1 block">Problem Title *</label>
            <input
              type="text"
              value={problemTitle}
              onChange={(e) => setProblemTitle(e.target.value)}
              placeholder="e.g., Two Sum"
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white capitalize"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Arrays, Dynamic Programming"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Revision Status</label>
            <select
              value={revisionStatus}
              onChange={(e) => setRevisionStatus(e.target.value as NoteRevisionStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
            >
              {REVISION_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 mb-1 block">Problem URL (optional)</label>
            <input
              type="url"
              value={problemUrl}
              onChange={(e) => setProblemUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <ProblemTagSelector
          selectedTags={tags}
          availableTags={availableTags}
          onChange={setTags}
          onAddCustomTag={onAddCustomTag}
        />

        {/* Pattern selector (shown when "Pattern" tag is active) */}
        {tags.includes("Pattern") && (
          <div className="mt-3">
            <label className="text-xs font-bold text-slate-600 mb-1 block">Pattern Name</label>
            <select
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
            >
              <option value="">— Select pattern —</option>
              {DSA_PATTERNS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Core Notes */}
      <div className="space-y-3">
        <NoteField
          icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
          label="Key Insight / Aha Moment"
          placeholder="The breakthrough insight that unlocks this problem..."
          value={keyInsight}
          onChange={setKeyInsight}
          rows={2}
          highlight="amber"
        />

        <NoteField
          icon={<Code2 className="w-4 h-4 text-sky-500" />}
          label="Approach Used"
          placeholder="Which algorithm or data structure did you use?"
          value={approachUsed}
          onChange={setApproachUsed}
          rows={2}
          highlight="sky"
        />

        <NoteField
          icon={<BookOpen className="w-4 h-4 text-violet-500" />}
          label="Personal Explanation"
          placeholder="Explain the solution in your own words..."
          value={personalExplanation}
          onChange={setPersonalExplanation}
          rows={3}
          highlight="violet"
        />
      </div>

      {/* Mistake capture */}
      <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-bold text-slate-700">Mistake Capture</span>
          <span className="text-xs text-slate-400">(optional)</span>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-1 block">What went wrong?</label>
          <select
            value={mistakeCategory}
            onChange={(e) => setMistakeCategory(e.target.value as MistakeCategory | "")}
            className="w-full px-3 py-2 rounded-xl border border-red-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-400/30 bg-white"
          >
            <option value="">— No mistake captured —</option>
            {MISTAKE_CATEGORIES.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {mistakeCategory && (
          <NoteField
            label="Describe the mistake"
            placeholder="What specifically went wrong? How will you avoid it next time?"
            value={mistakeMade}
            onChange={setMistakeMade}
            rows={2}
          />
        )}
      </div>

      {/* Advanced fields (collapsible) */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Advanced Notes
            <span className="text-xs font-normal text-slate-400">(complexity, edge cases, alternatives)</span>
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time Complexity
                </label>
                <input
                  type="text"
                  value={timeComplexity}
                  onChange={(e) => setTimeComplexity(e.target.value)}
                  placeholder="e.g., O(N log N)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Space Complexity
                </label>
                <input
                  type="text"
                  value={spaceComplexity}
                  onChange={(e) => setSpaceComplexity(e.target.value)}
                  placeholder="e.g., O(N)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white"
                />
              </div>
            </div>

            <NoteField
              label="Edge Cases Discovered"
              placeholder="Empty input, duplicate values, integer overflow..."
              value={edgeCasesDiscovered}
              onChange={setEdgeCasesDiscovered}
              rows={2}
            />

            <NoteField
              label="Alternative Approach"
              placeholder="Different algorithm or optimization trade-off..."
              value={alternativeApproach}
              onChange={setAlternativeApproach}
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="gap-1.5 cursor-pointer">
            <X className="w-4 h-4" /> Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!problemTitle.trim() || isSubmitting}
          className="gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </form>
  );
}

// ─── Local helper ─────────────────────────────────────────────────────────────

interface NoteFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  icon?: React.ReactNode;
  highlight?: "amber" | "sky" | "violet";
}

function NoteField({ label, placeholder, value, onChange, rows = 2, icon, highlight }: NoteFieldProps) {
  const borderColor =
    highlight === "amber"
      ? "border-amber-200 focus:ring-amber-400/30"
      : highlight === "sky"
      ? "border-sky-200 focus:ring-sky-400/30"
      : highlight === "violet"
      ? "border-violet-200 focus:ring-violet-400/30"
      : "border-slate-200 focus:ring-sky-400/30";

  return (
    <div>
      <label className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 bg-white resize-none ${borderColor}`}
      />
    </div>
  );
}
