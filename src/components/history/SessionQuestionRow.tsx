import * as React from "react";
import { SessionQuestionItem } from "@/services/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExternalLink } from "lucide-react";

interface SessionQuestionRowProps {
  question: SessionQuestionItem;
  onOpen: (problemId: number) => void;
}

function getDifficultyVariant(difficulty: string) {
  if (difficulty === "Easy") return "success" as const;
  if (difficulty === "Medium") return "primary" as const;
  return "warning" as const;
}

function getStatusVariant(status: string) {
  if (status === "Completed") return "success" as const;
  if (status === "In Progress") return "primary" as const;
  if (status === "Skipped") return "neutral" as const;
  return "neutral" as const;
}

const platformLabel: Record<string, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
};

/**
 * A single question row rendered inside an expanded SessionHistoryCard.
 */
export function SessionQuestionRow({ question, onOpen }: SessionQuestionRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50/70 transition-colors border border-transparent hover:border-slate-100">
      {/* Left: title + meta */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-bold text-slate-800 truncate">{question.problemTitle}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Platform */}
          <Badge variant="secondary" className="text-[10px]">
            {platformLabel[question.platform] ?? question.platform}
          </Badge>
          {/* Difficulty */}
          <Badge variant={getDifficultyVariant(question.difficulty)} className="text-[10px]">
            {question.difficulty}
          </Badge>
          {/* Topics (max 3) */}
          {question.topics.slice(0, 3).map(t => (
            <Badge key={t} variant="neutral" className="text-[10px]">
              {t}
            </Badge>
          ))}
          {question.topics.length > 3 && (
            <Badge variant="neutral" className="text-[10px]">
              +{question.topics.length - 3}
            </Badge>
          )}
        </div>
      </div>

      {/* Right: estimated + status + open */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400 font-medium hidden sm:block">
          {question.estimated}
        </span>
        <Badge variant={getStatusVariant(question.status)} className="text-[10px]">
          {question.status}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpen(question.problemId)}
          className="text-sky-600 hover:text-sky-700 cursor-pointer flex items-center gap-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </Button>
      </div>
    </div>
  );
}
