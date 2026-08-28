import {
  FullPerformanceIntelligence,
} from "@/services/performance/performanceTypes";
import { PreparationGoal } from "@/services/preparation/preparationTypes";
import {
  InterventionDiagnosis,
  DiagnosisCategory,
  InterventionType,
  EvidenceFragment,
} from "./interventionTypes";
import { extractEvidenceFromIntelligence } from "./interventionEvidence";

export function runDiagnosisPipeline(
  intelligence: FullPerformanceIntelligence,
  activeGoal: PreparationGoal | null
): InterventionDiagnosis[] {
  const extracted = extractEvidenceFromIntelligence(intelligence, activeGoal);
  const now = new Date();
  const detectedAt = now.toISOString();
  const expirationDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days default

  const diagnoses: InterventionDiagnosis[] = [];

  // Guard: Check for insufficient data
  if (!extracted.hasSufficientData) {
    diagnoses.push({
      diagnosisId: `diag_insufficient_${now.getTime()}`,
      category: "INSUFFICIENT_DATA",
      severity: "LOW",
      confidence: "LOW",
      evidence: [
        {
          source: "PerformanceIntelligence",
          metric: "Total Practice Attempts",
          value: extracted.totalAttempts,
          sampleSize: extracted.totalAttempts,
          confidence: "NONE",
          explanation: `Only ${extracted.totalAttempts} practice attempt(s) recorded in this window. Minimum required is 3 attempts.`,
        },
      ],
      evidenceSummary: `Current sample size (${extracted.totalAttempts}) is too small to draw statistically reliable diagnostic conclusions.`,
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt,
      expirationDate,
      recommendedIntervention: "MASTERY_CONSOLIDATION",
      rationale: "Continue standard practice sessions until at least 3 attempts are recorded to establish a diagnostic baseline.",
    });
    return diagnoses;
  }

  // 1. Difficulty Diagnoses
  const { difficultyTrend } = intelligence;
  if (difficultyTrend.pacing === "TOO_AGGRESSIVE") {
    diagnoses.push({
      diagnosisId: `diag_diff_too_high_${now.getTime()}`,
      category: "DIFFICULTY_TOO_HIGH",
      severity: "HIGH",
      confidence: "HIGH",
      evidence: extracted.difficultyEvidence,
      evidenceSummary: difficultyTrend.pacingDiagnosis,
      affectedSkills: [],
      affectedPatterns: [],
      affectedDifficulty: "Hard",
      detectedAt,
      expirationDate,
      recommendedIntervention: "DIFFICULTY_DECREASE",
      rationale: "Repeated Hard failures and high hint reliance indicate difficulty escalation outpaced core problem decomposition skills.",
    });
  } else if (difficultyTrend.pacing === "TOO_CONSERVATIVE") {
    diagnoses.push({
      diagnosisId: `diag_diff_too_low_${now.getTime()}`,
      category: "DIFFICULTY_TOO_LOW",
      severity: "MEDIUM",
      confidence: "HIGH",
      evidence: extracted.difficultyEvidence,
      evidenceSummary: difficultyTrend.pacingDiagnosis,
      affectedSkills: [],
      affectedPatterns: [],
      affectedDifficulty: "Easy",
      detectedAt,
      expirationDate,
      recommendedIntervention: "DIFFICULTY_INCREASE",
      rationale: "Consistent 100% independent solves on lower tiers show the learner is in an underchallenging comfort zone.",
    });
  } else if (difficultyTrend.pacing === "PLATEAU" || difficultyTrend.transitionGap.hasMediumToHardGap) {
    diagnoses.push({
      diagnosisId: `diag_diff_plateau_${now.getTime()}`,
      category: "DIFFICULTY_PLATEAU",
      severity: "MEDIUM",
      confidence: "HIGH",
      evidence: extracted.difficultyEvidence,
      evidenceSummary: difficultyTrend.transitionGap.hasMediumToHardGap
        ? difficultyTrend.transitionGap.gapDescription
        : difficultyTrend.pacingDiagnosis,
      affectedSkills: [],
      affectedPatterns: [],
      affectedDifficulty: "Medium",
      detectedAt,
      expirationDate,
      recommendedIntervention: "STAGNATION_BREAK",
      rationale: "Learner solves Mediums comfortably but has plateaued before transitioning into Hard problems.",
    });
  }

  // 2. Persistent Weakness Diagnoses
  for (const w of intelligence.persistentWeaknesses) {
    const isPrerequisite = w.evidenceText.toLowerCase().includes("prerequisite") || w.evidenceText.toLowerCase().includes("bottleneck");
    diagnoses.push({
      diagnosisId: `diag_weakness_${w.id}_${now.getTime()}`,
      category: isPrerequisite ? "PREREQUISITE_BOTTLENECK" : "PERSISTENT_WEAKNESS",
      severity: w.severity,
      confidence: w.attemptCount >= 3 ? "HIGH" : "MEDIUM",
      evidence: [
        {
          source: "PersistentWeakness",
          metric: `${w.skillOrPattern} Failure Rate`,
          value: `${w.failCount} fails, ${w.hintCount} hints out of ${w.attemptCount} attempts`,
          sampleSize: w.attemptCount,
          confidence: "HIGH",
          explanation: w.evidenceText,
        },
      ],
      evidenceSummary: `Persistent weakness in ${w.skillOrPattern} across ${w.affectedSystems.join(", ")} (${w.failCount} fails, ${w.hintCount} hints).`,
      affectedSkills: [w.skillOrPattern],
      affectedPatterns: [],
      detectedAt,
      expirationDate,
      recommendedIntervention: isPrerequisite ? "PREREQUISITE_REPAIR" : "FOUNDATION_REPAIR",
      rationale: `${w.skillOrPattern} exhibits multi-session struggle. ${w.recommendedIntervention}`,
    });
  }

  // 3. Stagnation Diagnoses
  for (const st of intelligence.skillTrends.filter((s) => s.isStagnant)) {
    diagnoses.push({
      diagnosisId: `diag_stagnation_${st.skillId}_${now.getTime()}`,
      category: "SKILL_STAGNATION",
      severity: "HIGH",
      confidence: "HIGH",
      evidence: [
        {
          source: "SkillTrends",
          metric: `${st.skillName} Independent Rate`,
          value: `${st.independentSolveRate}% across ${st.totalAttempts} attempts`,
          sampleSize: st.totalAttempts,
          confidence: "HIGH",
          explanation: st.stagnationReason || st.evidenceSummary,
        },
      ],
      evidenceSummary: `Stagnation detected in ${st.skillName}: Flat solve rate and flat solve time despite high attempt volume.`,
      affectedSkills: [st.skillName],
      affectedPatterns: [],
      detectedAt,
      expirationDate,
      recommendedIntervention: "STAGNATION_BREAK",
      rationale: st.suggestedIntervention || `Introduce mixed-pattern or prerequisite-bridge practice for ${st.skillName}.`,
    });
  }

  // 4. Pattern Overexposure & Underexposure Diagnoses
  for (const pt of intelligence.patternTrends) {
    if (pt.exposureStatus === "OVEREXPOSED") {
      diagnoses.push({
        diagnosisId: `diag_overexposed_${pt.patternName.replace(/\s+/g, "_")}_${now.getTime()}`,
        category: "PATTERN_OVEREXPOSURE",
        severity: "MEDIUM",
        confidence: "HIGH",
        evidence: [
          {
            source: "PatternTrends",
            metric: `${pt.patternName} Exposure Percentage`,
            value: `${pt.exposurePercentage}% (${pt.exposureCount} attempts)`,
            sampleSize: pt.exposureCount,
            confidence: "HIGH",
            explanation: `Pattern exceeds the 35% healthy exposure concentration threshold.`,
          },
        ],
        evidenceSummary: `${pt.patternName} dominates ${pt.exposurePercentage}% of all recent practice sessions.`,
        affectedSkills: [],
        affectedPatterns: [pt.patternName],
        detectedAt,
        expirationDate,
        recommendedIntervention: "OVEREXPOSURE_CORRECTION",
        rationale: "Diversify practice distribution to prevent pattern tunnel-vision.",
      });
    } else if (pt.exposureStatus === "UNDEREXPOSED" && activeGoal) {
      const isGoalPriority = activeGoal.priorityTopics.some(
        (top) => top.toLowerCase() === pt.patternName.toLowerCase() || pt.patternName.toLowerCase().includes(top.toLowerCase())
      );
      if (isGoalPriority) {
        diagnoses.push({
          diagnosisId: `diag_underexposed_${pt.patternName.replace(/\s+/g, "_")}_${now.getTime()}`,
          category: "PATTERN_UNDEREXPOSURE",
          severity: "HIGH",
          confidence: "HIGH",
          evidence: [
            {
              source: "PatternTrends",
              metric: `${pt.patternName} Priority Exposure`,
              value: `${pt.exposurePercentage}%`,
              sampleSize: pt.exposureCount,
              confidence: "HIGH",
              explanation: `Goal priority pattern represents only ${pt.exposurePercentage}% of practice.`,
            },
          ],
          evidenceSummary: `Key goal priority pattern ${pt.patternName} is underexposed (${pt.exposurePercentage}%).`,
          affectedSkills: [],
          affectedPatterns: [pt.patternName],
          detectedAt,
          expirationDate,
          recommendedIntervention: "PATTERN_DIVERSIFICATION",
          rationale: `Boost ${pt.patternName} recommendations to meet target timeline requirements.`,
        });
      }
    }
  }

  // 5. Hint Dependency Diagnoses
  const hintRate = intelligence.metrics.hintAssistedRate.currentValue;
  const indepRate = intelligence.metrics.independentSolveRate.currentValue;
  if (hintRate >= 45 && indepRate < 50 && intelligence.metrics.hintAssistedRate.sampleSize >= 3) {
    diagnoses.push({
      diagnosisId: `diag_hint_dep_${now.getTime()}`,
      category: "HINT_DEPENDENCY",
      severity: "HIGH",
      confidence: "HIGH",
      evidence: extracted.hintDependencyEvidence,
      evidenceSummary: `Hint reliance is high (${hintRate}%) while independent solve rate remains low (${indepRate}%).`,
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt,
      expirationDate,
      recommendedIntervention: "HINT_REDUCTION",
      rationale: "Learner is using hints as a crutch rather than an educational bridge. Gradual hint delays are required.",
    });
  } else if (hintRate > 0 && indepRate >= 70 && intelligence.metrics.hintAssistedRate.sampleSize >= 3) {
    diagnoses.push({
      diagnosisId: `diag_hint_approp_${now.getTime()}`,
      category: "HINT_APPROPRIATE_LEARNING",
      severity: "LOW",
      confidence: "HIGH",
      evidence: extracted.hintDependencyEvidence,
      evidenceSummary: `Hints are being utilized effectively during exploration without harming independent mastery (${indepRate}%).`,
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt,
      expirationDate,
      recommendedIntervention: "HINT_SUPPORTED_LEARNING",
      rationale: "Maintain current hint availability to support concept acquisition.",
    });
  }

  // 6. Time Inefficiency Diagnoses
  if (intelligence.timeTrend.efficiencyGapPct >= 30 && intelligence.metrics.totalAttempts >= 3) {
    diagnoses.push({
      diagnosisId: `diag_time_ineff_${now.getTime()}`,
      category: "TIME_INEFFICIENCY",
      severity: "MEDIUM",
      confidence: "HIGH",
      evidence: extracted.timeEfficiencyEvidence,
      evidenceSummary: `Large fluency gap (${intelligence.timeTrend.efficiencyGapPct}%): Learner solves accurately but takes significantly longer than target time budget.`,
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt,
      expirationDate,
      recommendedIntervention: "TIME_PRESSURE",
      rationale: "Accuracy is established; introduce structured time constraints to build fluency.",
    });
  }

  // 7. Preparation Fatigue Diagnoses
  if (extracted.fatigueEvidence.length >= 2) {
    diagnoses.push({
      diagnosisId: `diag_fatigue_${now.getTime()}`,
      category: "PREPARATION_FATIGUE",
      severity: "CRITICAL",
      confidence: "HIGH",
      evidence: extracted.fatigueEvidence,
      evidenceSummary: "Elevated dropouts, skips, and failure clusters indicate preparation overload or fatigue.",
      affectedSkills: [],
      affectedPatterns: [],
      detectedAt,
      expirationDate,
      recommendedIntervention: "PRACTICE_RECOVERY",
      rationale: "Enter temporary recovery mode: shorten sessions, lower daily pressure, and focus on review.",
    });
  }

  return diagnoses;
}
