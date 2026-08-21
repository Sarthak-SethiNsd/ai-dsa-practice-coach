import { Platform, Difficulty } from "@/services/types";

// ─── Configuration Types ──────────────────────────────────────────────────────

export type InterviewType =
  | "General DSA"
  | "Arrays & Strings"
  | "Linked Lists"
  | "Trees"
  | "Graphs"
  | "Dynamic Programming"
  | "Mixed DSA"
  | "Interview Weakness Drill";

export type InterviewDifficulty = Difficulty | "Adaptive";

export type InterviewDuration = 15 | 30 | 45 | 60;

export type InterviewStyle =
  | "Standard"
  | "Strict"
  | "Coaching"
  | "Company Simulation";

export interface InterviewConfig {
  type: InterviewType;
  difficulty: InterviewDifficulty;
  durationMinutes: InterviewDuration;
  questionCount: number;
  style: InterviewStyle;
  targetCompanyLabel?: string; // Optional context label (e.g. "General Big Tech simulation")
}

// ─── Phase Definitions (7-Phase Workflow) ─────────────────────────────────────

export type InterviewPhase =
  | "problem_understanding"
  | "approach_discussion"
  | "algorithm_design"
  | "complexity_analysis"
  | "implementation"
  | "testing_edge_cases"
  | "follow_up_optimization";

export interface PhaseInfo {
  id: InterviewPhase;
  number: number;
  name: string;
  shortLabel: string;
  description: string;
  guidance: string;
  interviewerGoal: string;
}

export const INTERVIEW_PHASES: PhaseInfo[] = [
  {
    id: "problem_understanding",
    number: 1,
    name: "Problem Understanding & Clarifications",
    shortLabel: "Clarify",
    description: "Read the problem statement, clarify assumptions, and verify constraints with the interviewer.",
    guidance: "State what you understand, ask about empty/negative inputs, and confirm data limits.",
    interviewerGoal: "Evaluate whether candidate clarifies ambiguities before jumping into solution.",
  },
  {
    id: "approach_discussion",
    number: 2,
    name: "Approach Discussion & Trade-offs",
    shortLabel: "Approach",
    description: "Explain brute-force and optimized approaches before writing code. Discuss trade-offs.",
    guidance: "Walk through high-level ideas, compare time/space complexities of each approach.",
    interviewerGoal: "Assess algorithmic intuition, structured thinking, and awareness of alternative paths.",
  },
  {
    id: "algorithm_design",
    number: 3,
    name: "Algorithm Design & Data Structures",
    shortLabel: "Algorithm",
    description: "Define the specific data structures and step-by-step logic of the chosen optimal approach.",
    guidance: "Detail how state is maintained (e.g., hash map, two pointers, recursion stack, DP table).",
    interviewerGoal: "Verify solid technical foundation and ability to formulate clean logic.",
  },
  {
    id: "complexity_analysis",
    number: 4,
    name: "Complexity Analysis",
    shortLabel: "Complexity",
    description: "State and justify big-O Time and Space complexities with respect to input dimensions.",
    guidance: "Identify best, average, and worst-case time complexities and auxiliary space used.",
    interviewerGoal: "Validate deep understanding of theoretical computational efficiency.",
  },
  {
    id: "implementation",
    number: 5,
    name: "Implementation & Clean Coding",
    shortLabel: "Code",
    description: "Write clean, modular, and idiomatic code adhering to good naming and structure.",
    guidance: "Type out your solution, keep helper functions modular, and handle base cases first.",
    interviewerGoal: "Evaluate coding velocity, syntactic fluency, and clean code hygiene.",
  },
  {
    id: "testing_edge_cases",
    number: 6,
    name: "Testing & Edge Case Discovery",
    shortLabel: "Test",
    description: "Dry-run the code with sample inputs and identify critical edge/boundary cases.",
    guidance: "Trace through empty arrays, single elements, duplicates, max limits, and negative values.",
    interviewerGoal: "Determine if candidate tests their own code rigorously without waiting for interviewer.",
  },
  {
    id: "follow_up_optimization",
    number: 7,
    name: "Follow-up & Further Optimization",
    shortLabel: "Follow-up",
    description: "Discuss potential scale-up constraints, concurrency, streaming, or in-place optimizations.",
    guidance: "Explore what happens if inputs don't fit in memory or if calls are repeated frequently.",
    interviewerGoal: "Test advanced problem solving, adaptability, and engineering maturity.",
  },
];

// ─── Hint System ──────────────────────────────────────────────────────────────

export type HintLevel = 1 | 2 | 3 | 4;

export interface HintItem {
  level: HintLevel;
  label: string;
  description: string;
  penaltyPoints: number; // Level 1: 3, Level 2: 7, Level 3: 15, Level 4: 25
  content: string;
  unlocked: boolean;
  unlockedAt?: string; // ISO datetime
}

// ─── Chat & Communication ─────────────────────────────────────────────────────

export type MessageSender = "interviewer" | "candidate" | "system";

export interface InterviewChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  phase: InterviewPhase;
  timestamp: string; // ISO datetime
  isHint?: boolean;
  hintLevel?: HintLevel;
}

// ─── Problem Context ──────────────────────────────────────────────────────────

export interface InterviewProblem {
  id: number | string;
  platformProblemId?: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  platform: Platform;
  url?: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: Record<string, string>; // language -> code template
  referenceComplexity: {
    time: string;
    space: string;
  };
  keyEdgeCases: string[];
  hints: Record<HintLevel, string>;
  optimalSolutionSnippet?: string;
}

// ─── Evaluation Dimensions ────────────────────────────────────────────────────

export interface EvaluationDimension {
  id: string;
  name: string;
  score: number; // 0 - 100
  weight: number; // decimal (sums to 1.0)
  evidence: string; // transparent explanation based on actual candidate actions
  strengths: string[];
  areasToImprove: string[];
}

export type ReadinessTier =
  | "Beginner"
  | "Developing"
  | "Interview Ready"
  | "Strong"
  | "Advanced";

export interface InterviewDimensionScores {
  problemUnderstanding: EvaluationDimension;
  approachQuality: EvaluationDimension;
  algorithmCorrectness: EvaluationDimension;
  complexityAnalysis: EvaluationDimension;
  implementationQuality: EvaluationDimension;
  edgeCasesAwareness: EvaluationDimension;
  communicationQuality: EvaluationDimension;
  hintDependency: EvaluationDimension;
  timeManagement: EvaluationDimension;
  adaptability: EvaluationDimension;
}

// ─── Post-Interview Report ────────────────────────────────────────────────────

export interface AIInterviewReport {
  id: string;
  interviewId: string;
  date: string;
  overallScore: number; // 0 - 100
  readinessTier: ReadinessTier;
  readinessBandLabel: string;
  dimensions: InterviewDimensionScores;
  mainStrengths: string[];
  mainWeaknesses: string[];
  missedEdgeCases: string[];
  complexityAssessment: {
    statedTime: string;
    statedSpace: string;
    actualTime: string;
    actualSpace: string;
    isAccurate: boolean;
    feedback: string;
  };
  hintUsageSummary: {
    totalHints: number;
    totalPenaltyPoints: number;
    hintsUsed: { level: HintLevel; label: string; penalty: number }[];
  };
  timeManagementSummary: {
    allocatedMinutes: number;
    actualMinutesSpent: number;
    phaseTimesSeconds: Record<InterviewPhase, number>;
    paceEvaluation: "Paced Well" | "Rushed" | "Too Slow";
  };
  recommendedTopics: string[];
  recommendedPatterns: string[];
  suggestedNextDifficulty: Difficulty | "Adaptive";
  actionableNextSteps: string[];
}

// ─── Active Interview Session State ───────────────────────────────────────────

export type InterviewStatus = "in_progress" | "completed" | "abandoned";

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  status: InterviewStatus;
  startedAt: string; // ISO
  endedAt?: string;
  totalDurationSeconds: number;
  remainingSeconds: number;
  currentQuestionIndex: number;
  questions: InterviewProblem[];
  currentPhase: InterviewPhase;
  phaseStartTime: number; // timestamp
  phaseDurationsSeconds: Record<InterviewPhase, number>;
  messages: InterviewChatMessage[];
  candidateCode: Record<string, string>; // language -> code
  selectedLanguage: string;
  candidateComplexity: {
    time: string;
    space: string;
    explanation: string;
  };
  candidateEdgeCases: string[];
  hintsUnlocked: Record<string, HintLevel[]>; // questionId -> hint levels unlocked
  solutionSubmitted: boolean;
  report?: AIInterviewReport;
}

// ─── Historical Record & Analytics ────────────────────────────────────────────

export interface InterviewHistoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  style: InterviewStyle;
  durationMinutes: number;
  actualDurationMinutes: number;
  questionsAttempted: number;
  questionsCompleted: number;
  overallScore: number;
  readinessTier: ReadinessTier;
  mainStrengths: string[];
  mainWeaknesses: string[];
  hintCount: number;
  status: InterviewStatus;
  reportSummary?: {
    communicationScore: number;
    complexityScore: number;
    algorithmScore: number;
    edgeCaseScore: number;
  };
}

export interface InterviewAnalyticsSummary {
  totalInterviews: number;
  completedInterviews: number;
  avgScore: number;
  highestScore: number;
  currentReadinessTier: ReadinessTier;
  readinessProgressPercent: number; // 0 - 100% towards Advanced
  totalQuestionsSolved: number;
  totalMinutesPracticed: number;
  avgHintCountPerInterview: number;
  scoreTrend: { date: string; score: number; type: string }[];
  topicPerformance: {
    topic: string;
    interviewCount: number;
    avgScore: number;
    readinessStatus: "Strong" | "Developing" | "Needs Practice";
  }[];
  difficultyDistribution: Record<Difficulty | "Adaptive", number>;
  communicationTrend: { date: string; score: number }[];
  complexityAccuracyTrend: { date: string; score: number }[];
  strongestAreas: string[];
  weakestAreas: string[];
}

// ─── Interview Readiness Profile ──────────────────────────────────────────────

export interface InterviewReadinessProfile {
  overallScore: number;
  tier: ReadinessTier;
  tierDescription: string;
  dimensionsSummary: {
    problemSolving: number;
    communication: number;
    complexityAnalysis: number;
    edgeCaseDetection: number;
    cleanCoding: number;
    independence: number; // inverse of hint dependency
  };
  keyWeaknesses: string[];
  recommendedFocus: string;
  interviewsCount: number;
  lastInterviewDate: string | null;
}
