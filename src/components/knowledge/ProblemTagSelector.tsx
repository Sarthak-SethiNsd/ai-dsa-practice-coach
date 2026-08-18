"use client";

import * as React from "react";
import { Tag, Plus, X, Check } from "lucide-react";
import { KnowledgeTag, BUILTIN_TAGS } from "@/services/knowledge/knowledgeTypes";
import { Button } from "@/components/ui/Button";

const TAG_COLORS: Record<string, string> = {
  "Important": "bg-red-100 text-red-700 border-red-200",
  "Revisit": "bg-amber-100 text-amber-700 border-amber-200",
  "Mistake": "bg-orange-100 text-orange-700 border-orange-200",
  "Pattern": "bg-violet-100 text-violet-700 border-violet-200",
  "Optimization": "bg-sky-100 text-sky-700 border-sky-200",
  "Edge Case": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Interview": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Contest": "bg-purple-100 text-purple-700 border-purple-200",
  "Easy Win": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Difficult": "bg-rose-100 text-rose-700 border-rose-200",
  "Concept Gap": "bg-pink-100 text-pink-700 border-pink-200",
};

function getTagStyle(tagName: string): string {
  return TAG_COLORS[tagName] ?? "bg-slate-100 text-slate-700 border-slate-200";
}

interface ProblemTagSelectorProps {
  selectedTags: string[];
  availableTags: KnowledgeTag[];
  onChange: (tags: string[]) => void;
  onAddCustomTag?: (name: string) => Promise<KnowledgeTag>;
  compact?: boolean;
}

export function ProblemTagSelector({
  selectedTags,
  availableTags,
  onChange,
  onAddCustomTag,
  compact = false,
}: ProblemTagSelectorProps) {
  const [newTagInput, setNewTagInput] = React.useState("");
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const handleAddCustom = async () => {
    const name = newTagInput.trim();
    if (!name || !onAddCustomTag) return;
    await onAddCustomTag(name);
    onChange([...selectedTags, name]);
    setNewTagInput("");
    setShowCustomInput(false);
  };

  const allTagNames = [
    ...BUILTIN_TAGS,
    ...availableTags
      .filter((t) => t.isCustom)
      .map((t) => t.name),
  ];

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="flex items-center gap-1.5 mb-1">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tags</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allTagNames.map((tagName) => {
          const isSelected = selectedTags.includes(tagName);
          const style = getTagStyle(tagName);

          return (
            <button
              key={tagName}
              type="button"
              onClick={() => toggleTag(tagName)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                ${isSelected ? style + " ring-2 ring-offset-1 ring-sky-400/40" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              {tagName}
            </button>
          );
        })}

        {/* Add custom tag button */}
        {onAddCustomTag && !showCustomInput && (
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-sky-400 hover:text-sky-600 transition-colors duration-150 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Custom Tag
          </button>
        )}

        {/* Custom tag input */}
        {showCustomInput && (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); }
                if (e.key === "Escape") { setShowCustomInput(false); setNewTagInput(""); }
              }}
              placeholder="Tag name..."
              className="text-xs px-2.5 py-1 rounded-lg border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white w-28"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="p-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { setShowCustomInput(false); setNewTagInput(""); }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Selected tags summary */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs text-slate-400 font-medium">Selected:</span>
          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border cursor-pointer ${getTagStyle(tag)}`}
            >
              {tag}
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-red-500 h-5 px-1 cursor-pointer"
              onClick={() => onChange([])}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Standalone tag badge for display
export function TagBadge({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  const style = getTagStyle(tag);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {tag}
      {onRemove && (
        <button type="button" onClick={onRemove} className="cursor-pointer ml-0.5 hover:opacity-70">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}
