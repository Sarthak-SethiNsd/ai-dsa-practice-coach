/**
 * knowledgeEngine.ts
 *
 * Deterministic analytics engine for the Problem Notes & Learning Tags System.
 * All insights are derived from persisted user data — no fabricated data.
 */

import {
  ProblemNote,
  PatternSummary,
  AiKnowledgeInsight,
  KnowledgeDashboardMetrics,
  InsightType,
  MistakeCategory,
  MISTAKE_CATEGORIES,
  DSA_PATTERNS,
} from "./knowledgeTypes";
import { RevisionItem } from "@/services/revision/revisionTypes";

// ─── Pattern Library ──────────────────────────────────────────────────────────

/**
 * Groups problem notes by their associated pattern name and computes
 * per-pattern statistics by cross-referencing SRS revision items.
 */
export function computePatternLibrary(
  notes: ProblemNote[],
  revisionItems: RevisionItem[] = []
): PatternSummary[] {
  // Build a map of pattern -> notes
  const patternMap = new Map<string, ProblemNote[]>();

  // First add all explicit DSA patterns with empty arrays
  DSA_PATTERNS.forEach((p) => patternMap.set(p, []));

  // Then populate from notes
  notes.forEach((note) => {
    if (note.patternName) {
      const existing = patternMap.get(note.patternName) ?? [];
      patternMap.set(note.patternName, [...existing, note]);
    }
    // Also bucket via tags that mention "Pattern" and patternName fallback
    note.tags.forEach((tag) => {
      if (tag === "Pattern" && note.patternName) {
        // already handled above
      }
    });
  });

  const results: PatternSummary[] = [];

  patternMap.forEach((patternNotes, patternName) => {
    if (patternNotes.length === 0) return;

    const masteredCount = patternNotes.filter((n) => n.revisionStatus === "mastered").length;
    const needsRevisionCount = patternNotes.filter(
      (n) => n.revisionStatus === "revisit" || n.revisionStatus === "forgotten"
    ).length;
    const solvedCount = patternNotes.filter(
      (n) => n.revisionStatus === "mastered" || n.revisionStatus === "in_progress"
    ).length;

    // Success rate: mastered / total
    const successRate =
      patternNotes.length > 0
        ? Math.round((masteredCount / patternNotes.length) * 100)
        : 0;

    // Cross-reference with SRS items for last practiced date
    const problemTitles = new Set(patternNotes.map((n) => n.problemTitle.toLowerCase()));
    const relevantRevItems = revisionItems.filter((r) =>
      problemTitles.has(r.problemTitle.toLowerCase())
    );
    const latestRevDate =
      relevantRevItems.length > 0
        ? relevantRevItems.reduce((latest, r) => {
            const revDate = r.lastRevisedAt || r.lastSolvedAt;
            return revDate > latest ? revDate : latest;
          }, "")
        : undefined;

    // Most common mistake
    const mistakeCounts: Partial<Record<MistakeCategory, number>> = {};
    patternNotes.forEach((n) => {
      if (n.mistakeCategory) {
        mistakeCounts[n.mistakeCategory] = (mistakeCounts[n.mistakeCategory] ?? 0) + 1;
      }
    });

    let commonMistakeCategory: MistakeCategory | undefined;
    let commonMistakeLabel: string | undefined;
    let maxCount = 0;

    Object.entries(mistakeCounts).forEach(([cat, count]) => {
      if ((count ?? 0) > maxCount) {
        maxCount = count ?? 0;
        commonMistakeCategory = cat as MistakeCategory;
        commonMistakeLabel = MISTAKE_CATEGORIES.find((m) => m.id === cat)?.label;
      }
    });

    results.push({
      patternName,
      totalProblems: patternNotes.length,
      solvedProblems: solvedCount,
      needsRevisionCount,
      masteredCount,
      successRate,
      commonMistakeCategory,
      commonMistakeLabel,
      lastPracticedDate: latestRevDate,
      problems: patternNotes,
    });
  });

  // Sort by total problems descending
  return results.sort((a, b) => b.totalProblems - a.totalProblems);
}

// ─── AI Knowledge Insights ────────────────────────────────────────────────────

/**
 * Derives actionable learning insights purely from persisted notes and tags.
 * No fabricated data — every insight requires real evidence (minimum data points).
 */
export function computeAiKnowledgeInsights(notes: ProblemNote[]): AiKnowledgeInsight[] {
  if (notes.length === 0) return [];

  const insights: AiKnowledgeInsight[] = [];

  // 1. Repeated mistakes in the same topic
  const topicMistakeCounts: Record<string, { count: number; categories: MistakeCategory[] }> = {};
  notes.forEach((n) => {
    if (n.mistakeCategory) {
      const topic = n.topic;
      if (!topicMistakeCounts[topic]) {
        topicMistakeCounts[topic] = { count: 0, categories: [] };
      }
      topicMistakeCounts[topic].count++;
      topicMistakeCounts[topic].categories.push(n.mistakeCategory);
    }
  });

  Object.entries(topicMistakeCounts)
    .filter(([, data]) => data.count >= 2)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 2)
    .forEach(([topic, data]) => {
      const topMistake = getMostFrequent(data.categories);
      const mistakeLabel = MISTAKE_CATEGORIES.find((m) => m.id === topMistake)?.label ?? topMistake;
      insights.push({
        id: `insight_repeated_mistake_${topic}`,
        type: "repeated_mistake" as InsightType,
        title: `Repeated mistakes in ${topic}`,
        description: `You've recorded ${data.count} mistakes in ${topic}. Most common issue: "${mistakeLabel}". Focus on targeted practice to break this pattern.`,
        subject: topic,
        severity: "warning",
        actionUrl: "/practice",
        actionLabel: "Practice Now",
        dataPoints: data.count,
      });
    });

  // 2. Frequently revisited patterns
  const patternRevisitCounts: Record<string, number> = {};
  notes.forEach((n) => {
    if (n.patternName && (n.revisionStatus === "revisit" || n.revisionStatus === "forgotten")) {
      patternRevisitCounts[n.patternName] = (patternRevisitCounts[n.patternName] ?? 0) + 1;
    }
  });

  Object.entries(patternRevisitCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .forEach(([pattern, count]) => {
      insights.push({
        id: `insight_pattern_uncertainty_${pattern}`,
        type: "pattern_uncertainty" as InsightType,
        title: `Pattern uncertainty: ${pattern}`,
        description: `You have ${count} problems in ${pattern} marked for revision. Build deeper familiarity with confidence-building problems.`,
        subject: pattern,
        severity: "warning",
        actionUrl: "/questions",
        actionLabel: "Find Problems",
        dataPoints: count,
      });
    });

  // 3. Concept gaps (notes tagged "Concept Gap")
  const conceptGapTopics: Record<string, number> = {};
  notes
    .filter((n) => n.tags.includes("Concept Gap"))
    .forEach((n) => {
      conceptGapTopics[n.topic] = (conceptGapTopics[n.topic] ?? 0) + 1;
    });

  Object.entries(conceptGapTopics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .forEach(([topic, count]) => {
      insights.push({
        id: `insight_concept_gap_${topic}`,
        type: "concept_gap" as InsightType,
        title: `Concept gap identified: ${topic}`,
        description: `You tagged ${count} problem${count > 1 ? "s" : ""} in ${topic} as "Concept Gap". Consider reviewing fundamentals before attempting harder problems.`,
        subject: topic,
        severity: "error",
        actionUrl: "/roadmap",
        actionLabel: "View Roadmap",
        dataPoints: count,
      });
    });

  // 4. Improving patterns (mastered count growing)
  const patternMasteredCounts: Record<string, number> = {};
  notes
    .filter((n) => n.patternName && n.revisionStatus === "mastered")
    .forEach((n) => {
      patternMasteredCounts[n.patternName!] = (patternMasteredCounts[n.patternName!] ?? 0) + 1;
    });

  Object.entries(patternMasteredCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .forEach(([pattern, count]) => {
      insights.push({
        id: `insight_improving_${pattern}`,
        type: "improving_pattern" as InsightType,
        title: `Mastery growing: ${pattern}`,
        description: `You've mastered ${count} problems using the ${pattern} pattern. Keep building on this momentum!`,
        subject: pattern,
        severity: "success",
        dataPoints: count,
      });
    });

  // 5. Problems repeatedly needing revision (tagged "Revisit" with mistakeCategory)
  const revisitNotes = notes.filter(
    (n) => n.tags.includes("Revisit") && n.revisionStatus !== "mastered"
  );
  if (revisitNotes.length >= 3) {
    insights.push({
      id: "insight_frequently_revisited",
      type: "frequently_revisited" as InsightType,
      title: `${revisitNotes.length} problems need active revision`,
      description: `You've marked ${revisitNotes.length} problems for revision. Run a targeted SRS session to strengthen these before they fade from memory.`,
      severity: "info",
      actionUrl: "/revision",
      actionLabel: "Start Revision",
      dataPoints: revisitNotes.length,
    });
  }

  // 6. Mastery achieved milestone
  const masteredNotes = notes.filter((n) => n.revisionStatus === "mastered");
  if (masteredNotes.length >= 3) {
    insights.push({
      id: "insight_mastery_achieved",
      type: "mastery_achieved" as InsightType,
      title: `${masteredNotes.length} problems mastered!`,
      description: `Excellent progress! You've marked ${masteredNotes.length} problems as mastered. Consider challenging yourself with harder variants.`,
      severity: "success",
      dataPoints: masteredNotes.length,
    });
  }

  return insights;
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export function computeKnowledgeDashboardMetrics(
  notes: ProblemNote[]
): KnowledgeDashboardMetrics {
  const totalNotes = notes.length;
  const totalTaggedProblems = notes.filter((n) => n.tags.length > 0).length;

  // Pattern count (unique pattern names used)
  const usedPatterns = new Set<string>();
  notes.forEach((n) => { if (n.patternName) usedPatterns.add(n.patternName); });

  // Tag frequency
  const tagCounts: Record<string, number> = {};
  notes.forEach((n) => {
    n.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  // Pattern frequency
  const patternCounts: Record<string, number> = {};
  notes.forEach((n) => {
    if (n.patternName) {
      patternCounts[n.patternName] = (patternCounts[n.patternName] ?? 0) + 1;
    }
  });
  const topPatterns = Object.entries(patternCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([pattern, count]) => ({ pattern, count }));

  // Most common mistake type
  const mistakeCounts: Partial<Record<MistakeCategory, number>> = {};
  notes.forEach((n) => {
    if (n.mistakeCategory) {
      mistakeCounts[n.mistakeCategory] = (mistakeCounts[n.mistakeCategory] ?? 0) + 1;
    }
  });

  let mostCommonMistakeType: KnowledgeDashboardMetrics["mostCommonMistakeType"] | undefined;
  let maxMistakeCount = 0;
  Object.entries(mistakeCounts).forEach(([cat, count]) => {
    if ((count ?? 0) > maxMistakeCount) {
      maxMistakeCount = count ?? 0;
      const label = MISTAKE_CATEGORIES.find((m) => m.id === cat)?.label ?? cat;
      mostCommonMistakeType = { category: cat as MistakeCategory, label, count: count ?? 0 };
    }
  });

  // Topics with most notes
  const topicCounts: Record<string, number> = {};
  notes.forEach((n) => {
    topicCounts[n.topic] = (topicCounts[n.topic] ?? 0) + 1;
  });
  const topicsWithMostNotes = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  // Status counts
  const needsRevisionCount = notes.filter(
    (n) => n.revisionStatus === "revisit" || n.revisionStatus === "forgotten"
  ).length;
  const masteredCount = notes.filter((n) => n.revisionStatus === "mastered").length;

  // Recently updated (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyUpdatedCount = notes.filter(
    (n) => new Date(n.updatedAt) >= sevenDaysAgo
  ).length;

  return {
    totalNotes,
    totalTaggedProblems,
    totalPatterns: usedPatterns.size,
    topTags,
    topPatterns,
    mostCommonMistakeType,
    topicsWithMostNotes,
    needsRevisionCount,
    recentlyUpdatedCount,
    masteredCount,
  };
}

// ─── Search & Filter ──────────────────────────────────────────────────────────

import { KnowledgeSearchFilters } from "./knowledgeTypes";

export function filterAndSortNotes(
  notes: ProblemNote[],
  filters: KnowledgeSearchFilters
): ProblemNote[] {
  let result = [...notes];

  // Text search
  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (n) =>
        n.problemTitle.toLowerCase().includes(q) ||
        (n.personalExplanation ?? "").toLowerCase().includes(q) ||
        (n.keyInsight ?? "").toLowerCase().includes(q) ||
        (n.approachUsed ?? "").toLowerCase().includes(q) ||
        (n.mistakeMade ?? "").toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Platform filter
  if (filters.platform) {
    result = result.filter((n) => n.platform === filters.platform);
  }

  // Topic filter
  if (filters.topic) {
    result = result.filter((n) =>
      n.topic.toLowerCase() === filters.topic!.toLowerCase()
    );
  }

  // Difficulty filter
  if (filters.difficulty) {
    result = result.filter((n) => n.difficulty === filters.difficulty);
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((n) =>
      filters.tags!.some((filterTag) => n.tags.includes(filterTag))
    );
  }

  // Pattern filter
  if (filters.pattern) {
    result = result.filter((n) => n.patternName === filters.pattern);
  }

  // Mistake category filter
  if (filters.mistakeCategory) {
    result = result.filter((n) => n.mistakeCategory === filters.mistakeCategory);
  }

  // Revision status filter
  if (filters.revisionStatus) {
    result = result.filter((n) => n.revisionStatus === filters.revisionStatus);
  }

  // Sort
  const sortBy = filters.sortBy ?? "recently_updated";
  result.sort((a, b) => {
    switch (sortBy) {
      case "recently_updated":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "recently_solved":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "most_revisited":
        const aRev = a.revisionStatus === "revisit" || a.revisionStatus === "forgotten" ? 1 : 0;
        const bRev = b.revisionStatus === "revisit" || b.revisionStatus === "forgotten" ? 1 : 0;
        return bRev - aRev;
      case "most_mistakes":
        return (b.mistakeCategory ? 1 : 0) - (a.mistakeCategory ? 1 : 0);
      case "difficulty": {
        const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return (diffOrder[a.difficulty] ?? 2) - (diffOrder[b.difficulty] ?? 2);
      }
      default:
        return 0;
    }
  });

  return result;
}

// ─── SRS Sync Helper ──────────────────────────────────────────────────────────

/**
 * Extracts knowledge signals suitable for boosting recommendation scores.
 * Returns topics and patterns that have weakness signals so external engines
 * can factor them in without tight coupling.
 */
export function extractKnowledgeSignals(notes: ProblemNote[]): {
  weakTopics: string[];
  weakPatterns: string[];
  edgeCaseWeakTopics: string[];
  revisitProblemTitles: string[];
  masteredProblemTitles: string[];
} {
  const weakTopics = new Set<string>();
  const weakPatterns = new Set<string>();
  const edgeCaseWeakTopics = new Set<string>();
  const revisitProblemTitles: string[] = [];
  const masteredProblemTitles: string[] = [];

  notes.forEach((n) => {
    if (
      n.mistakeCategory === "didnt_understand_pattern" ||
      n.mistakeCategory === "wrong_approach" ||
      n.revisionStatus === "forgotten"
    ) {
      weakTopics.add(n.topic);
      if (n.patternName) weakPatterns.add(n.patternName);
    }

    if (
      n.mistakeCategory === "edge_case_missed" ||
      n.tags.includes("Edge Case")
    ) {
      edgeCaseWeakTopics.add(n.topic);
    }

    if (n.revisionStatus === "revisit" || n.revisionStatus === "forgotten") {
      revisitProblemTitles.push(n.problemTitle);
    }

    if (n.revisionStatus === "mastered") {
      masteredProblemTitles.push(n.problemTitle);
    }
  });

  return {
    weakTopics: Array.from(weakTopics),
    weakPatterns: Array.from(weakPatterns),
    edgeCaseWeakTopics: Array.from(edgeCaseWeakTopics),
    revisitProblemTitles,
    masteredProblemTitles,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMostFrequent<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const freq = new Map<T, number>();
  arr.forEach((v) => freq.set(v, (freq.get(v) ?? 0) + 1));
  let max = 0;
  let result: T | undefined;
  freq.forEach((count, val) => {
    if (count > max) { max = count; result = val; }
  });
  return result;
}
