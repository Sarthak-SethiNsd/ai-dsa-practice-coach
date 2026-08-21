import {
  InterviewSession,
  InterviewDimensionScores,
  ReadinessTier,
  HintLevel,
  EvaluationDimension,
} from "./interviewTypes";

// ─── Dimension Weights ────────────────────────────────────────────────────────
// Sums to 1.0 (100%)

export const DIMENSION_WEIGHTS = {
  problemUnderstanding: 0.10,
  approachQuality: 0.12,
  algorithmCorrectness: 0.15,
  complexityAnalysis: 0.10,
  implementationQuality: 0.15,
  edgeCasesAwareness: 0.10,
  communicationQuality: 0.10,
  hintDependency: 0.08,
  timeManagement: 0.05,
  adaptability: 0.05,
} as const;

// ─── Hint Penalty Rules ───────────────────────────────────────────────────────

export const HINT_PENALTIES: Record<HintLevel, number> = {
  1: 3,  // Conceptual direction: minimal penalty
  2: 7,  // Approach guidance: moderate penalty
  3: 15, // Strong algorithmic hint: significant penalty
  4: 25, // Near-solution guidance: heavy penalty
};

// ─── Readiness Tier Resolver ──────────────────────────────────────────────────

export function computeReadinessTier(score: number): {
  tier: ReadinessTier;
  bandLabel: string;
  description: string;
} {
  if (score >= 90) {
    return {
      tier: "Advanced",
      bandLabel: "Strong Hire / Advanced Readiness",
      description: "Demonstrates exceptional problem-solving, crisp complexity analysis, and proactive edge case mastery under interview conditions.",
    };
  }
  if (score >= 80) {
    return {
      tier: "Strong",
      bandLabel: "Hire / Strong Interview Readiness",
      description: "Solid algorithmic foundation, structured communication, and independent debugging with minimal guidance required.",
    };
  }
  if (score >= 66) {
    return {
      tier: "Interview Ready",
      bandLabel: "Interview Ready / Consistent",
      description: "Capable of solving standard technical problems. Benefit from tightening edge-case testing and sharpening complexity justification.",
    };
  }
  if (score >= 50) {
    return {
      tier: "Developing",
      bandLabel: "Developing Readiness",
      description: "Understands core patterns but shows reliance on hints or struggles with rigorous complexity and boundary conditions.",
    };
  }
  return {
    tier: "Beginner",
    bandLabel: "Foundational Practice Needed",
    description: "Requires deliberate concept revision, standard pattern reinforcement, and structured communication practice.",
  };
}

// ─── Individual Dimension Evaluators ──────────────────────────────────────────

function evaluateProblemUnderstanding(session: InterviewSession): EvaluationDimension {
  const candidateMsgs = session.messages.filter((m) => m.sender === "candidate");
  const clarifyMsgs = candidateMsgs.filter(
    (m) => m.phase === "problem_understanding" || m.content.includes("?") || m.content.toLowerCase().includes("assume")
  );

  let score = 70; // baseline
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (clarifyMsgs.length >= 2) {
    score += 25;
    strengths.push("Proactively verified constraints and edge assumptions before proceeding.");
  } else if (clarifyMsgs.length === 1) {
    score += 15;
    strengths.push("Confirmed input parameters with interviewer.");
  } else {
    score -= 15;
    areasToImprove.push("Skipped asking clarifying questions regarding boundary constraints or input types.");
  }

  score = Math.min(100, Math.max(20, score));

  const evidence = clarifyMsgs.length > 0
    ? `Asked ${clarifyMsgs.length} clarifying question(s) during initial problem inspection.`
    : "Jumped directly into algorithm without explicitly confirming constraints or ambiguous cases.";

  return {
    id: "problemUnderstanding",
    name: "Problem Understanding",
    score,
    weight: DIMENSION_WEIGHTS.problemUnderstanding,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateApproachQuality(session: InterviewSession): EvaluationDimension {
  const approachMsgs = session.messages.filter(
    (m) => m.sender === "candidate" && m.phase === "approach_discussion"
  );
  const mentionsBruteForce = approachMsgs.some((m) =>
    m.content.toLowerCase().includes("brute") || m.content.toLowerCase().includes("naive") || m.content.toLowerCase().includes("o(n^2)")
  );
  const mentionsOptimal = approachMsgs.some((m) =>
    m.content.toLowerCase().includes("hash") || m.content.toLowerCase().includes("pointer") || m.content.toLowerCase().includes("dp") || m.content.toLowerCase().includes("optimal")
  );

  let score = 65;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (mentionsBruteForce && mentionsOptimal) {
    score = 92;
    strengths.push("Articulated brute-force baseline and contrasted it against optimal design.");
  } else if (approachMsgs.length >= 2) {
    score = 80;
    strengths.push("Discussed solution strategy before coding.");
  } else if (approachMsgs.length === 1) {
    score = 70;
    areasToImprove.push("Could expand more on trade-offs between space and time.");
  } else {
    score = 45;
    areasToImprove.push("Limited discussion of algorithmic approach prior to implementation.");
  }

  const evidence = approachMsgs.length > 0
    ? `Exchanged ${approachMsgs.length} message(s) detailing approach and algorithmic trade-offs.`
    : "Provided minimal approach explanation before typing code.";

  return {
    id: "approachQuality",
    name: "Approach Quality",
    score,
    weight: DIMENSION_WEIGHTS.approachQuality,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateAlgorithmCorrectness(session: InterviewSession): EvaluationDimension {
  const code = session.candidateCode[session.selectedLanguage] || "";
  const submitted = session.solutionSubmitted;
  const currentQ = session.questions[session.currentQuestionIndex];

  let score = 50;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (submitted && code.length > 40) {
    score = 88;
    strengths.push("Submitted a complete algorithmic implementation matching problem requirements.");
  } else if (code.length > 80) {
    score = 75;
    strengths.push("Constructed substantial logic covering primary traversal/computation.");
  } else if (code.length > 20) {
    score = 60;
    areasToImprove.push("Implementation was incomplete or lacked key helper logic.");
  } else {
    score = 35;
    areasToImprove.push("Did not construct working algorithm implementation.");
  }

  if (currentQ?.topics.some((t) => code.toLowerCase().includes(t.toLowerCase().slice(0, 4)))) {
    score = Math.min(100, score + 7);
  }

  const evidence = submitted
    ? `Submitted solution in ${session.selectedLanguage} containing ${code.split("\n").length} lines of code.`
    : code.length > 0
    ? "Drafted code in editor but did not formally finalize submission before conclusion."
    : "No runnable code was produced during the session.";

  return {
    id: "algorithmCorrectness",
    name: "Algorithm Correctness",
    score,
    weight: DIMENSION_WEIGHTS.algorithmCorrectness,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateComplexityAnalysis(session: InterviewSession): EvaluationDimension {
  const currentQ = session.questions[session.currentQuestionIndex];
  const statedTime = session.candidateComplexity.time.trim().toUpperCase().replace(/\s+/g, "");
  const statedSpace = session.candidateComplexity.space.trim().toUpperCase().replace(/\s+/g, "");
  const refTime = currentQ?.referenceComplexity.time.trim().toUpperCase().replace(/\s+/g, "") || "O(N)";
  const refSpace = currentQ?.referenceComplexity.space.trim().toUpperCase().replace(/\s+/g, "") || "O(1)";

  let score = 50;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  const timeMatch = statedTime.includes(refTime.slice(0, 3)) || (statedTime.length > 0 && statedTime === refTime);
  const spaceMatch = statedSpace.includes(refSpace.slice(0, 3)) || (statedSpace.length > 0 && statedSpace === refSpace);

  if (timeMatch && spaceMatch) {
    score = 95;
    strengths.push(`Correctly identified Time: ${session.candidateComplexity.time} and Space: ${session.candidateComplexity.space}.`);
  } else if (timeMatch || spaceMatch) {
    score = 75;
    strengths.push("Accurately derived one complexity dimension.");
    areasToImprove.push("Miscalculated or overlooked auxiliary space/time factor.");
  } else if (session.candidateComplexity.time || session.candidateComplexity.space) {
    score = 55;
    areasToImprove.push(`Stated complexities (${session.candidateComplexity.time || "N/A"} / ${session.candidateComplexity.space || "N/A"}) differed from optimal (${refTime} / ${refSpace}).`);
  } else {
    score = 30;
    areasToImprove.push("Did not provide explicit Time or Space complexity derivations.");
  }

  const evidence = session.candidateComplexity.explanation
    ? `Stated Time: ${session.candidateComplexity.time || "Unstated"}, Space: ${session.candidateComplexity.space || "Unstated"}. Provided rationale: "${session.candidateComplexity.explanation.slice(0, 60)}..."`
    : `Stated Time: ${session.candidateComplexity.time || "Unstated"}, Space: ${session.candidateComplexity.space || "Unstated"}.`;

  return {
    id: "complexityAnalysis",
    name: "Complexity Analysis",
    score,
    weight: DIMENSION_WEIGHTS.complexityAnalysis,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateImplementationQuality(session: InterviewSession): EvaluationDimension {
  const code = session.candidateCode[session.selectedLanguage] || "";
  let score = 60;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  const hasMeaningfulVars = !code.includes("var a =") && !code.includes("int x =") && (code.includes("left") || code.includes("count") || code.includes("map") || code.includes("curr") || code.includes("index"));
  const hasCommentsOrSpacing = code.includes("//") || code.includes("#") || code.includes("\n\n");

  if (code.length > 50 && hasMeaningfulVars) {
    score += 20;
    strengths.push("Used clean, semantic variable naming reflecting problem domain.");
  }
  if (hasCommentsOrSpacing) {
    score += 10;
    strengths.push("Organized code with readable structure and separation of concerns.");
  }
  if (code.length < 20) {
    score = 40;
    areasToImprove.push("Code volume was minimal or not structured.");
  }

  score = Math.min(100, Math.max(30, score));

  const evidence = `Code structure in ${session.selectedLanguage}: ${code.split("\n").length} lines, semantic naming score: ${hasMeaningfulVars ? "High" : "Moderate"}.`;

  return {
    id: "implementationQuality",
    name: "Implementation Quality",
    score,
    weight: DIMENSION_WEIGHTS.implementationQuality,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateEdgeCases(session: InterviewSession): EvaluationDimension {
  const edgeCases = session.candidateEdgeCases;
  let score = 50;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (edgeCases.length >= 3) {
    score = 92;
    strengths.push(`Identified ${edgeCases.length} distinct edge/boundary cases.`);
  } else if (edgeCases.length >= 1) {
    score = 75;
    strengths.push(`Tested ${edgeCases.length} specific edge scenario(s).`);
    areasToImprove.push("Could proactively explore more extreme boundaries (empty, duplicates, limits).");
  } else {
    score = 40;
    areasToImprove.push("Did not formally document or trace edge cases.");
  }

  const evidence = edgeCases.length > 0
    ? `Candidate documented ${edgeCases.length} edge condition(s): ${edgeCases.slice(0, 2).join("; ")}.`
    : "No explicit edge case analysis logged during testing phase.";

  return {
    id: "edgeCasesAwareness",
    name: "Edge Case Awareness",
    score,
    weight: DIMENSION_WEIGHTS.edgeCasesAwareness,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateCommunication(session: InterviewSession): EvaluationDimension {
  const candidateMsgs = session.messages.filter((m) => m.sender === "candidate");
  const totalWords = candidateMsgs.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0);

  let score = 60;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (candidateMsgs.length >= 6 && totalWords > 80) {
    score = 90;
    strengths.push("Maintained active, clear think-aloud communication throughout all interview phases.");
  } else if (candidateMsgs.length >= 3) {
    score = 75;
    strengths.push("Responded constructively to interviewer inquiries.");
    areasToImprove.push("Practice continuous think-aloud rather than working in long silent stretches.");
  } else {
    score = 45;
    areasToImprove.push("Minimal verbal/textual communication during the interview.");
  }

  const evidence = `Candidate sent ${candidateMsgs.length} messages totaling ~${totalWords} words across interview phases.`;

  return {
    id: "communicationQuality",
    name: "Communication Quality",
    score,
    weight: DIMENSION_WEIGHTS.communicationQuality,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateHintDependency(session: InterviewSession): EvaluationDimension {
  const currentQ = session.questions[session.currentQuestionIndex];
  const qId = String(currentQ?.id || "q1");
  const unlocked = session.hintsUnlocked[qId] || [];

  let penalty = 0;
  unlocked.forEach((lvl) => {
    penalty += HINT_PENALTIES[lvl] || 5;
  });

  const score = Math.max(20, 100 - penalty);
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (unlocked.length === 0) {
    strengths.push("Solved problem completely independently with 0 hints unlocked.");
  } else if (unlocked.length === 1 && unlocked[0] === 1) {
    strengths.push("Used only a minor conceptual hint and drove the implementation independently.");
  } else {
    areasToImprove.push(`Unlocked ${unlocked.length} hint(s) (Penalty: -${penalty} pts). Strive for greater initial problem breakdown before requesting guidance.`);
  }

  const evidence = unlocked.length === 0
    ? "No hints requested — 100% autonomous problem solving."
    : `Requested ${unlocked.length} hint(s) (Levels: ${unlocked.join(", ")}) resulting in a ${penalty}-point deduction.`;

  return {
    id: "hintDependency",
    name: "Hint Dependency",
    score,
    weight: DIMENSION_WEIGHTS.hintDependency,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateTimeManagement(session: InterviewSession): EvaluationDimension {
  const totalAllocatedSec = session.totalDurationSeconds;
  const timeUsedSec = totalAllocatedSec - session.remainingSeconds;
  const fractionUsed = timeUsedSec / Math.max(1, totalAllocatedSec);

  let score = 70;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (session.solutionSubmitted && fractionUsed <= 0.85) {
    score = 92;
    strengths.push("Completed interview workflow with comfortable buffer for testing and review.");
  } else if (session.solutionSubmitted) {
    score = 80;
    strengths.push("Submitted solution within the allocated time window.");
  } else if (fractionUsed >= 0.95) {
    score = 50;
    areasToImprove.push("Ran low on time before completing all phases; practice timeboxing approach discussion.");
  }

  const minsUsed = Math.round(timeUsedSec / 60);
  const minsTotal = Math.round(totalAllocatedSec / 60);
  const evidence = `Used ~${minsUsed} mins out of ${minsTotal} mins allocated (${Math.round(fractionUsed * 100)}% of budget).`;

  return {
    id: "timeManagement",
    name: "Time Management",
    score,
    weight: DIMENSION_WEIGHTS.timeManagement,
    evidence,
    strengths,
    areasToImprove,
  };
}

function evaluateAdaptability(session: InterviewSession): EvaluationDimension {
  const currentPhaseIndex = session.currentPhase;
  const phaseCompletedCount = Object.keys(session.phaseDurationsSeconds).length;

  let score = 65;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (phaseCompletedCount >= 5 || currentPhaseIndex === "follow_up_optimization" || currentPhaseIndex === "testing_edge_cases") {
    score = 88;
    strengths.push("Smoothly navigated through problem breakdown, implementation, and verification phases.");
  } else if (phaseCompletedCount >= 3) {
    score = 75;
    strengths.push("Progressed through core algorithm and coding stages.");
  } else {
    score = 50;
    areasToImprove.push("Stalled in early phases; work on transitioning faster from idea to code.");
  }

  const evidence = `Candidate transitioned through ${phaseCompletedCount} interview phase(s) during the session.`;

  return {
    id: "adaptability",
    name: "Adaptability",
    score,
    weight: DIMENSION_WEIGHTS.adaptability,
    evidence,
    strengths,
    areasToImprove,
  };
}

// ─── Master Performance Evaluator ─────────────────────────────────────────────

export function evaluateInterviewSession(session: InterviewSession): {
  dimensions: InterviewDimensionScores;
  overallScore: number;
  readinessTier: ReadinessTier;
  readinessBandLabel: string;
  mainStrengths: string[];
  mainWeaknesses: string[];
} {
  const dimensions: InterviewDimensionScores = {
    problemUnderstanding: evaluateProblemUnderstanding(session),
    approachQuality: evaluateApproachQuality(session),
    algorithmCorrectness: evaluateAlgorithmCorrectness(session),
    complexityAnalysis: evaluateComplexityAnalysis(session),
    implementationQuality: evaluateImplementationQuality(session),
    edgeCasesAwareness: evaluateEdgeCases(session),
    communicationQuality: evaluateCommunication(session),
    hintDependency: evaluateHintDependency(session),
    timeManagement: evaluateTimeManagement(session),
    adaptability: evaluateAdaptability(session),
  };

  // Compute weighted overall score
  let weightedSum = 0;
  Object.values(dimensions).forEach((dim) => {
    weightedSum += dim.score * dim.weight;
  });

  const overallScore = Math.round(Math.min(100, Math.max(0, weightedSum)));
  const { tier: readinessTier, bandLabel: readinessBandLabel } = computeReadinessTier(overallScore);

  // Aggregate top strengths and weaknesses from dimension breakdowns
  const allStrengths: string[] = [];
  const allWeaknesses: string[] = [];

  (Object.values(dimensions) as EvaluationDimension[]).forEach((dim) => {
    dim.strengths.forEach((s: string) => allStrengths.push(s));
    dim.areasToImprove.forEach((w: string) => allWeaknesses.push(w));
  });

  const mainStrengths = allStrengths.slice(0, 4);
  const mainWeaknesses = allWeaknesses.slice(0, 4);

  return {
    dimensions,
    overallScore,
    readinessTier,
    readinessBandLabel,
    mainStrengths: mainStrengths.length > 0 ? mainStrengths : ["Demonstrated positive persistence during technical breakdown."],
    mainWeaknesses: mainWeaknesses.length > 0 ? mainWeaknesses : ["Continue practicing timed complexity analysis and think-aloud pacing."],
  };
}
