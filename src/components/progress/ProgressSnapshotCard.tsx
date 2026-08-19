"use client";

import * as React from "react";
import { ProgressSnapshotCardData } from "@/services/progress/progressTypes";
import { Button } from "@/components/ui/Button";
import {
  Download,
  Copy,
  Check,
  Share2,
  Flame,
  Target,
  Clock,
  Trophy,
  Award,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { generateMarkdownSnippet } from "@/services/progress/progressExport";

interface ProgressSnapshotCardProps {
  card: ProgressSnapshotCardData;
  onDownloadPNG: () => Promise<void>;
  compact?: boolean;
}

export function ProgressSnapshotCard({
  card,
  onDownloadPNG,
  compact = false,
}: ProgressSnapshotCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const p = card.privacy;

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownSnippet(card);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownloadPNG();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── The Card Container (Styled for Social & Sharing) ─────────────── */}
      <div
        id="dsa-progress-snapshot-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 text-white shadow-2xl p-6 sm:p-8 space-y-6 select-none"
      >
        {/* Background glow accents */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-black tracking-wider text-sky-400 uppercase">
                DSA AI Coach · Verified Progress
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {p.displayName}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Period: {card.reportingPeriodLabel} ({card.dateRangeStr})
            </p>
          </div>

          {/* Readiness Score Gauge */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
            <span className="text-xs font-extrabold text-emerald-400">Readiness</span>
            <span className="text-2xl sm:text-3xl font-black text-white">{card.overallReadinessScore}%</span>
            <span className="text-[10px] text-slate-400 font-semibold">Algorithm Level</span>
          </div>
        </div>

        {/* Primary Metrics Grid (4 Boxes) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Problems</span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-black text-sky-400">{card.problemsSolved}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
              <span className="text-emerald-400">{card.difficultyCounts.Easy}E</span> ·
              <span className="text-amber-400">{card.difficultyCounts.Medium}M</span> ·
              <span className="text-red-400">{card.difficultyCounts.Hard}H</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Practice Streak</span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-black text-orange-400 flex items-center gap-1">
                <Flame className="w-5 h-5 fill-orange-400" />
                {card.currentStreak}d
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">Longest: {card.longestStreak} days</span>
          </div>

          {p.showStudyTime ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Focus Time</span>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-violet-400">{card.studyHoursTotal}h</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">Verified focus study</span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Milestones</span>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-violet-400">{card.unlockedAchievementCount}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">Unlocked badges</span>
            </div>
          )}

          {p.showRatings && p.showContests && card.currentRatings.codeforces ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contest Rating</span>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-400 flex items-center gap-1">
                  <Trophy className="w-5 h-5" />
                  {card.currentRatings.codeforces}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">Pupil / Specialist</span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pattern Mastery</span>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-400">{card.strongestPattern}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">High accuracy</span>
            </div>
          )}
        </div>

        {/* Highlights Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {p.showTopicStats && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Top Domain</span>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{card.topTopic}</p>
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Strongest Pattern</span>
            <p className="text-xs sm:text-sm font-bold text-sky-300 mt-0.5">{card.strongestPattern}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Top Growth Area</span>
            <p className="text-xs sm:text-sm font-bold text-emerald-300 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {card.biggestImprovementTopic}
            </p>
          </div>
        </div>

        {/* Unlocked Badges Row */}
        {p.showAchievements && card.topBadges.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Top Milestones:</span>
            {card.topBadges.map((badge) => (
              <span
                key={badge.title}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
              >
                <Award className="w-3 h-3 text-indigo-400" />
                {badge.title}
              </span>
            ))}
          </div>
        )}

        {/* Card Footer Tagline */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>Tracked with DSA AI Coach</span>
          <span>Zero private code or internal data shared</span>
        </div>
      </div>

      {/* ─── Action Controls Below Card ───────────────────────────────────── */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="text-xs font-semibold text-slate-600">
            Shareable card ready for LinkedIn, GitHub, or mentors
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCopyMarkdown}
              variant="secondary"
              className="gap-1.5 text-xs font-bold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied Markdown!" : "Copy Markdown"}
            </Button>

            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? "Generating PNG..." : "Download Card (PNG)"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
