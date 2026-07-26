import * as React from "react";
import { DailyPracticeSession } from "@/services/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SessionQuestionRow } from "@/components/history/SessionQuestionRow";
import { ChevronDown, ChevronUp, CalendarDays, Clock } from "lucide-react";

interface SessionHistoryCardProps {
  session: DailyPracticeSession;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenQuestion: (problemId: number) => void;
}

const platformLabel: Record<string, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
};

/**
 * Parses an estimated-time string and returns total minutes.
 */
function parseMinutes(estimated: string): number {
  if (!estimated) return 0;
  const lower = estimated.toLowerCase();
  const num = parseFloat(lower.replace(/[^0-9.]/g, "")) || 0;
  if (lower.includes("hr") || lower.includes("hour")) return Math.round(num * 60);
  return Math.round(num);
}

function formatSessionTime(questions: DailyPracticeSession["questions"]): string {
  const total = questions.reduce((acc, q) => acc + parseMinutes(q.estimated), 0);
  if (total === 0) return "—";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatSessionDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Derives the unique set of platforms practiced in a session.
 */
function getPlatforms(session: DailyPracticeSession): string[] {
  const set = new Set(session.questions.map(q => q.platform));
  return Array.from(set);
}

/**
 * Expandable card for a single DailyPracticeSession.
 *
 * Collapsed state: summary row with date, platforms, completion counts,
 * a ProgressBar, estimated time, and topics.
 *
 * Expanded state: adds a scrollable list of SessionQuestionRow items.
 */
export function SessionHistoryCard({
  session,
  isExpanded,
  onToggle,
  onOpenQuestion,
}: SessionHistoryCardProps) {
  const { metadata, questions, date } = session;
  const platforms = getPlatforms(session);
  const totalTime = formatSessionTime(questions);
  const visibleTopics = metadata.topicsCovered.slice(0, 3);
  const extraTopics = metadata.topicsCovered.length - visibleTopics.length;

  return (
    <Card className="overflow-hidden transition-all">
      {/* ── Collapsed header (always visible) ── */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 hover:bg-slate-50/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 rounded-2xl"
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col gap-3">
          {/* Row 1: date + platforms + chevron */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              {/* Date */}
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                <CalendarDays className="w-4 h-4 text-sky-500 shrink-0" />
                {formatSessionDate(date)}
              </div>
              {/* Platform badges */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {platforms.map(p => (
                  <Badge key={p} variant="secondary" className="text-[10px]">
                    {platformLabel[p] ?? p}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Chevron */}
            <span className="text-slate-400 shrink-0 mt-0.5">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </div>

          {/* Row 2: stats + progress */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Counts */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 shrink-0">
              <span>
                <span className="text-slate-800 font-extrabold">{metadata.totalQuestions}</span> total
              </span>
              <span className="text-emerald-600">
                <span className="font-extrabold">{metadata.completedCount}</span> done
              </span>
              <span className="text-amber-500">
                <span className="font-extrabold">{metadata.skippedCount}</span> skipped
              </span>
            </div>

            {/* Progress bar (reusable component) */}
            <div className="flex-1 min-w-0">
              <ProgressBar
                completed={metadata.completedCount}
                total={metadata.totalQuestions}
                height={6}
                showLabel
              />
            </div>
          </div>

          {/* Row 3: time + topics */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {totalTime}
            </div>
            <span className="text-slate-200 hidden sm:block">•</span>
            {visibleTopics.map(t => (
              <Badge key={t} variant="neutral" className="text-[10px]">
                {t}
              </Badge>
            ))}
            {extraTopics > 0 && (
              <Badge variant="neutral" className="text-[10px]">
                +{extraTopics} more
              </Badge>
            )}
          </div>
        </div>
      </button>

      {/* ── Expanded question list ── */}
      {isExpanded && (
        <CardContent className="pt-0 px-3 pb-4 space-y-1 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-3 pb-1">
            Questions ({questions.length})
          </p>
          {questions.map(q => (
            <SessionQuestionRow
              key={q.problemId}
              question={q}
              onOpen={onOpenQuestion}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}
