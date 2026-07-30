import { AiReviewRequest, ReviewCategory } from "../aiTypes";

export interface CategoryPrompt {
  systemPrompt: string;
  userPrompt: string;
  categoryTitle: string;
}

export function buildOptimalComplexityPrompt(request: AiReviewRequest): CategoryPrompt {
  return {
    categoryTitle: "Optimal Complexity Analysis",
    systemPrompt: `You are an expert DSA Coach specializing in asymptotic complexity analysis.
Always respond with strict JSON matching the requested schema. Never output markdown outside JSON.`,
    userPrompt: `Analyze the theoretical optimal time and space complexity for the following problem context and code:

Problem Title: ${request.problemTitle || "Submitted Code Review"}
Language: ${request.language}
Problem Statement: ${request.problemStatement || "N/A"}

Submitted Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Return a JSON object with this exact structure:
{
  "categoryTitle": "Optimal Complexity Analysis",
  "summary": "1-2 sentence overview of the optimal theoretical complexity for this problem",
  "timeComplexity": "e.g. O(N)",
  "spaceComplexity": "e.g. O(1)",
  "overallFeedback": "Detailed explanation of why this time and space complexity is optimal for this problem",
  "correctnessAnalysis": "Comparison between the submitted code's complexity and theoretical optimal",
  "optimizationSuggestions": ["Suggestion to reach optimal complexity if not already optimal"],
  "edgeCases": [],
  "learningTips": ["Key data structures or techniques required for optimal complexity"]
}`
  };
}

export function buildOptimalHintsPrompt(request: AiReviewRequest): CategoryPrompt {
  return {
    categoryTitle: "Optimal Solution Hints",
    systemPrompt: `You are an expert DSA Coach providing progressive, step-by-step guidance towards an optimal solution.
Always respond with strict JSON matching the requested schema. Never output markdown outside JSON.`,
    userPrompt: `Provide progressive hints to solve the following problem optimally:

Problem Title: ${request.problemTitle || "Submitted Code Review"}
Language: ${request.language}
Problem Statement: ${request.problemStatement || "N/A"}

Current Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Return a JSON object with this exact structure:
{
  "categoryTitle": "Optimal Solution Hints",
  "summary": "Overview of the key algorithmic concept needed for the optimal approach",
  "hints": [
    "Hint 1: High level intuition or observation",
    "Hint 2: Key data structure or algorithm state design",
    "Hint 3: Concrete transition or invariant step"
  ],
  "overallFeedback": "Guide on how to approach thinking through this problem step-by-step",
  "correctnessAnalysis": "How these hints address potential flaws in typical approaches",
  "timeComplexity": "Optimal Time Complexity",
  "spaceComplexity": "Optimal Space Complexity",
  "optimizationSuggestions": [],
  "edgeCases": [],
  "learningTips": ["Core patterns to memorize for similar problems"]
}`
  };
}

export function buildOptimalFullSolutionPrompt(request: AiReviewRequest): CategoryPrompt {
  return {
    categoryTitle: "Optimal Full Solution",
    systemPrompt: `You are an expert DSA Coach providing clean, production-grade reference solutions.
Always respond with strict JSON matching the requested schema. Never output markdown outside JSON.`,
    userPrompt: `Provide the complete, optimal reference solution in ${request.language} for:

Problem Title: ${request.problemTitle || "Submitted Code Review"}
Language: ${request.language}
Problem Statement: ${request.problemStatement || "N/A"}

Submitted Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Return a JSON object with this exact structure:
{
  "categoryTitle": "Optimal Full Solution",
  "summary": "Clear explanation of the optimal strategy and algorithm",
  "optimalCode": "Complete clean code in ${request.language} with clear variable names and concise inline comments",
  "timeComplexity": "Optimal Time Complexity",
  "spaceComplexity": "Optimal Space Complexity",
  "overallFeedback": "Line-by-line or section breakdown of how the optimal solution operates",
  "correctnessAnalysis": "Why this solution guarantees correctness across all test cases",
  "optimizationSuggestions": [],
  "edgeCases": ["Handled edge cases in the solution"],
  "learningTips": ["Best coding practices demonstrated in this solution"]
}`
  };
}

export function buildMyComplexityPrompt(request: AiReviewRequest): CategoryPrompt {
  return {
    categoryTitle: "My Code Complexity",
    systemPrompt: `You are an expert DSA Coach evaluating submitted solution algorithms.
Always respond with strict JSON matching the requested schema. Never output markdown outside JSON.`,
    userPrompt: `Analyze the time and space complexity of the submitted user solution:

Problem Title: ${request.problemTitle || "Submitted Code Review"}
Language: ${request.language}

Submitted Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Return a JSON object with this exact structure:
{
  "categoryTitle": "My Code Complexity",
  "summary": "Summary of your submitted code's efficiency profile",
  "timeComplexity": "Calculated time complexity of user code",
  "spaceComplexity": "Calculated auxiliary space complexity of user code",
  "overallFeedback": "Detailed breakdown showing how each loop, recursion, or data structure contributes to time and space complexity",
  "correctnessAnalysis": "Identification of any performance bottlenecks or unnecessary allocations",
  "optimizationSuggestions": ["Concrete changes to improve time or space complexity"],
  "edgeCases": [],
  "learningTips": ["How to analyze recurrence relations or loop bounds for this pattern"]
}`
  };
}

export function buildCorrectnessCheckPrompt(request: AiReviewRequest): CategoryPrompt {
  return {
    categoryTitle: "Correctness & Bug Check",
    systemPrompt: `You are an expert DSA Coach conducting strict code correctness verification.
Always respond with strict JSON matching the requested schema. Never output markdown outside JSON.`,
    userPrompt: `Thoroughly check the submitted code for correctness, logic bugs, off-by-one errors, infinite loops, and edge cases:

Problem Title: ${request.problemTitle || "Submitted Code Review"}
Language: ${request.language}
Problem Statement: ${request.problemStatement || "N/A"}

Submitted Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Return a JSON object with this exact structure:
{
  "categoryTitle": "Correctness & Bug Check",
  "summary": "Verdict on whether the code is correct, partially correct, or buggy",
  "correctnessAnalysis": "Detailed bug audit: list specific line numbers or expressions containing logical errors or potential runtime crashes",
  "overallFeedback": "Overall evaluation of solution logic and correctness",
  "timeComplexity": "Time complexity if code runs",
  "spaceComplexity": "Space complexity if code runs",
  "optimizationSuggestions": ["Fixes required to ensure 100% test case pass rate"],
  "edgeCases": ["Failing or tricky test inputs for this code"],
  "learningTips": ["Invariant testing techniques to catch bugs early"]
}`
  };
}

export function buildEdgeCaseAnalysisPrompt(request: AiReviewRequest): CategoryPrompt {
  return {
    categoryTitle: "Edge Case Analysis",
    systemPrompt: `You are an expert DSA Coach identifying boundary conditions and edge cases.
Always respond with strict JSON matching the requested schema. Never output markdown outside JSON.`,
    userPrompt: `Identify critical edge cases and boundary conditions for this code and problem:

Problem Title: ${request.problemTitle || "Submitted Code Review"}
Language: ${request.language}
Problem Statement: ${request.problemStatement || "N/A"}

Submitted Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Return a JSON object with this exact structure:
{
  "categoryTitle": "Edge Case Analysis",
  "summary": "Summary of critical edge cases relevant to this problem and implementation",
  "edgeCases": [
    "Edge Case 1: description and expected vs actual behavior",
    "Edge Case 2: description and expected vs actual behavior",
    "Edge Case 3: description and expected vs actual behavior"
  ],
  "overallFeedback": "Analysis of how well the current submission handles these boundary conditions",
  "correctnessAnalysis": "Potential overflow, index-out-of-bounds, or empty input vulnerabilities",
  "timeComplexity": "Time complexity on edge cases",
  "spaceComplexity": "Space complexity on edge cases",
  "optimizationSuggestions": ["Guard clauses or checks to add"],
  "learningTips": ["Standard checklist for edge cases in this topic area"]
}`
  };
}

export function buildMyHintsPrompt(request: AiReviewRequest): CategoryPrompt {
  return {
    categoryTitle: "Hints for My Solution",
    systemPrompt: `You are an expert DSA Coach helping students debug and optimize their code.
Always respond with strict JSON matching the requested schema. Never output markdown outside JSON.`,
    userPrompt: `Provide specific hints targeted directly at fixing and improving the user's submitted solution:

Problem Title: ${request.problemTitle || "Submitted Code Review"}
Language: ${request.language}
Problem Statement: ${request.problemStatement || "N/A"}

Submitted Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Return a JSON object with this exact structure:
{
  "categoryTitle": "Hints for My Solution",
  "summary": "Directional advice for improving the current submission",
  "hints": [
    "Hint 1: Observation about current logic",
    "Hint 2: Where the state or pointer calculation can be adjusted",
    "Hint 3: How to refine the loop or condition"
  ],
  "overallFeedback": "Encouraging evaluation of the user's current approach",
  "correctnessAnalysis": "Which parts of the user's logic are on the right track vs need adjustment",
  "timeComplexity": "Current Time Complexity",
  "spaceComplexity": "Current Space Complexity",
  "optimizationSuggestions": [],
  "edgeCases": [],
  "learningTips": ["Self-debugging strategies for this problem type"]
}`
  };
}

export function buildFullCodeReviewPrompt(request: AiReviewRequest): CategoryPrompt {
  return {
    categoryTitle: "Full Code Review",
    systemPrompt: `You are an expert DSA Code Reviewer providing comprehensive analysis.
Always respond with strict JSON matching the exact schema requested. Never add commentary outside the JSON.`,
    userPrompt: `Review the following submission:

Problem Title: ${request.problemTitle || "Submitted Code Review"}
Problem URL: ${request.problemUrl || "N/A"}
Problem Statement: ${request.problemStatement || "N/A"}
Language: ${request.language}
Difficulty: ${request.difficulty || "N/A"}
Topics: ${(request.topics || []).join(", ") || "N/A"}

User Solution Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Return a JSON object with exactly these keys:
{
  "categoryTitle": "Full Code Review",
  "summary": "High-level summary of code review findings",
  "overallFeedback": "High level code quality evaluation (2-3 sentences)",
  "correctnessAnalysis": "Analysis of algorithm correctness and logic",
  "timeComplexity": "e.g. O(N log N)",
  "spaceComplexity": "e.g. O(N)",
  "optimizationSuggestions": ["suggestion 1", "suggestion 2"],
  "edgeCases": ["edge case 1", "edge case 2"],
  "learningTips": ["tip 1", "tip 2"]
}`
  };
}

export function getReviewPrompt(
  category: ReviewCategory | undefined,
  request: AiReviewRequest
): CategoryPrompt {
  const cat = category || "FULL_CODE_REVIEW";
  switch (cat) {
    case "OPTIMAL_COMPLEXITY":
      return buildOptimalComplexityPrompt(request);
    case "OPTIMAL_HINTS":
      return buildOptimalHintsPrompt(request);
    case "OPTIMAL_FULL_SOLUTION":
      return buildOptimalFullSolutionPrompt(request);
    case "MY_COMPLEXITY":
      return buildMyComplexityPrompt(request);
    case "CORRECTNESS_CHECK":
      return buildCorrectnessCheckPrompt(request);
    case "EDGE_CASE_ANALYSIS":
      return buildEdgeCaseAnalysisPrompt(request);
    case "MY_HINTS":
      return buildMyHintsPrompt(request);
    case "FULL_CODE_REVIEW":
    default:
      return buildFullCodeReviewPrompt(request);
  }
}
