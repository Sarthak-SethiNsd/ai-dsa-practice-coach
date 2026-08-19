"use client";

import * as React from "react";
import { ProgressReportData } from "@/services/progress/progressTypes";
import {
  Target,
  Layers,
  Trophy,
  Clock,
  RotateCcw,
  AlertTriangle,
  Compass,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ProgressReportProps {
  report: ProgressReportData;
}

export function ProgressReport({ report }: ProgressReportProps) {
  const p = report.privacy;
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Problem Solving & Platform Breakdown */}
      <ReportSection
        id="problems"
        title="Problem Solving Breakdown"
        subtitle={`${report.problemSolving.total} verified problems solved`}
        icon={<Target className="w-5 h-5 text-sky-600" />}
        isCollapsed={!!collapsedSections["problems"]}
        onToggle={() => toggleSection("problems")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-800 uppercase">Easy Problems</span>
            <p className="text-2xl font-black text-emerald-950 mt-1">{report.problemSolving.byDifficulty.Easy}</p>
            <p className="text-xs text-emerald-700 mt-0.5">Foundational fundamentals</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-xs font-bold text-amber-800 uppercase">Medium Problems</span>
            <p className="text-2xl font-black text-amber-950 mt-1">{report.problemSolving.byDifficulty.Medium}</p>
            <p className="text-xs text-amber-700 mt-0.5">Core interview level</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100">
            <span className="text-xs font-bold text-red-800 uppercase">Hard Problems</span>
            <p className="text-2xl font-black text-red-950 mt-1">{report.problemSolving.byDifficulty.Hard}</p>
            <p className="text-xs text-red-700 mt-0.5">Advanced algorithmic challenge</p>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mt-4 text-xs font-semibold text-slate-700">
          <span>LeetCode Solved: <strong>{report.problemSolving.byPlatform.leetcode}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Codeforces Solved: <strong>{report.problemSolving.byPlatform.codeforces}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Total Attempted: <strong>{report.summary.totalAttempted}</strong></span>
        </div>
      </ReportSection>

      {/* 2. Topic Mastery (if permitted) */}
      {p.showTopicStats && (
        <ReportSection
          id="topics"
          title="Domain & Topic Mastery"
          subtitle={`${report.topics.masteredCount} Mastered · ${report.topics.proficientCount} Proficient`}
          icon={<Layers className="w-5 h-5 text-violet-600" />}
          isCollapsed={!!collapsedSections["topics"]}
          onToggle={() => toggleSection("topics")}
        >
          <div className="space-y-3">
            {report.topics.topTopics.map((topic) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">{topic.topic}</p>
                  <p className="text-xs text-slate-500">{topic.solvedCount} problems solved · Review Quality: {topic.qualityScore}/100</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{topic.successRate}% Success</span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      topic.masteryTier === "Mastered"
                        ? "bg-emerald-100 text-emerald-800"
                        : topic.masteryTier === "Advanced"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {topic.masteryTier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* 3. Pattern Library Performance */}
      <ReportSection
        id="patterns"
        title="Pattern Library Analytics"
        subtitle={`${report.patterns.patternsTracked} patterns tracked with ${report.patterns.overallPatternSuccessRate}% average success rate`}
        icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
        isCollapsed={!!collapsedSections["patterns"]}
        onToggle={() => toggleSection("patterns")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {report.patterns.topPatterns.map((pat) => (
            <div
              key={pat.name}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{pat.name}</span>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {pat.successRate}% Accuracy
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {pat.total} problems ({pat.mastered} Mastered)
              </p>
              {pat.commonMistake && (
                <p className="text-[11px] text-red-600 font-medium bg-red-50 p-2 rounded-xl">
                  Watch for: {pat.commonMistake}
                </p>
              )}
            </div>
          ))}
        </div>
      </ReportSection>

      {/* 4. Contest Intelligence (if permitted) */}
      {p.showRatings && p.showContests && (
        <ReportSection
          id="contests"
          title="Competitive Contest Intelligence"
          subtitle={`Current Rating: ${report.contests.currentCodeforcesRating} · Peak: ${report.contests.peakCodeforcesRating} pts`}
          icon={<Trophy className="w-5 h-5 text-indigo-600" />}
          isCollapsed={!!collapsedSections["contests"]}
          onToggle={() => toggleSection("contests")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-xs font-bold text-indigo-800 uppercase">Contest Rating</span>
              <p className="text-2xl font-black text-indigo-950 mt-1">{report.contests.currentCodeforcesRating}</p>
              <p className="text-xs text-indigo-700 mt-0.5">Codeforces Division 2</p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
              <span className="text-xs font-bold text-sky-800 uppercase">Best Global Rank</span>
              <p className="text-2xl font-black text-sky-950 mt-1">
                {report.contests.bestRank ? `#${report.contests.bestRank.toLocaleString()}` : "N/A"}
              </p>
              <p className="text-xs text-sky-700 mt-0.5">Top percentile performance</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-800 uppercase">Avg Solved/Contest</span>
              <p className="text-2xl font-black text-emerald-950 mt-1">{report.contests.avgProblemsSolvedPerContest}</p>
              <p className="text-xs text-emerald-700 mt-0.5">Consistent per-round rate</p>
            </div>
          </div>
        </ReportSection>
      )}

      {/* 5. Study Sessions & Focus Consistency (if permitted) */}
      {p.showStudyTime && (
        <ReportSection
          id="study"
          title="Focus Study Sessions & Consistency"
          subtitle={`${report.studySessions.totalSessions} sessions logged · ${report.summary.studyHours} total study hours`}
          icon={<Clock className="w-5 h-5 text-violet-600" />}
          isCollapsed={!!collapsedSections["study"]}
          onToggle={() => toggleSection("study")}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Total Sessions</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{report.studySessions.totalSessions}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Avg Duration</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{report.studySessions.averageSessionMinutes}m</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Task Completion</span>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{report.studySessions.completionRate}%</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Active Streak</span>
              <p className="text-xl font-bold text-orange-600 mt-0.5">{report.summary.currentStreak} Days</p>
            </div>
          </div>
        </ReportSection>
      )}

      {/* 6. Spaced Repetition Activity */}
      <ReportSection
        id="srs"
        title="Spaced Repetition & Long-Term Memory"
        subtitle={`${report.spacedRepetition.totalRevisionsCompleted} revisions completed · ${report.spacedRepetition.overallRetentionScore}% retention`}
        icon={<RotateCcw className="w-5 h-5 text-emerald-600" />}
        isCollapsed={!!collapsedSections["srs"]}
        onToggle={() => toggleSection("srs")}
      >
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div>
            <p className="text-sm font-bold text-emerald-950">Active Memory Health</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              SuperMemo SM-2 interval algorithm keeping forgotten concepts refreshed
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-700">{report.spacedRepetition.overallRetentionScore}%</span>
            <p className="text-[10px] text-emerald-600 font-bold uppercase">Memory Retention</p>
          </div>
        </div>
      </ReportSection>

      {/* 7. Weakness & Mistake Trends (if permitted) */}
      {p.showWeaknesses && report.weaknesses.topMistakeTypes.length > 0 && (
        <ReportSection
          id="weaknesses"
          title="Mistake Patterns & Growth Bottlenecks"
          subtitle="Identified from structured post-problem mistake logs"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          isCollapsed={!!collapsedSections["weaknesses"]}
          onToggle={() => toggleSection("weaknesses")}
        >
          <div className="space-y-2">
            {report.weaknesses.topMistakeTypes.map((m) => (
              <div
                key={m.category}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs font-semibold text-amber-950"
              >
                <span>{m.label}</span>
                <span className="bg-amber-200 text-amber-900 rounded-full px-2 py-0.5 text-xs font-black">
                  {m.count} occurrences
                </span>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* 8. Recommended Next Focus Areas */}
      <ReportSection
        id="nextSteps"
        title="Recommended Next Focus Areas"
        subtitle="Driven by recommendation and roadmap engines"
        icon={<Compass className="w-5 h-5 text-sky-600" />}
        isCollapsed={!!collapsedSections["nextSteps"]}
        onToggle={() => toggleSection("nextSteps")}
      >
        <ul className="space-y-2.5 text-xs font-medium text-slate-700">
          {report.aiNarrative.nextFocusAreas.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2 p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </ReportSection>
    </div>
  );
}

// ─── Collapsible Section Container ────────────────────────────────────────────

function ReportSection({
  id,
  title,
  subtitle,
  icon,
  children,
  isCollapsed,
  onToggle,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
      <div
        onClick={onToggle}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-700">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && <div className="pt-2 border-t border-slate-50">{children}</div>}
    </div>
  );
}
