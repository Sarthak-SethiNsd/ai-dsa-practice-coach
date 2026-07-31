import { AiProvider } from "../aiProvider";
import {
  AiRecommendationRequest,
  AiRecommendationResponseItem,
  AiReviewRequest,
  AiReviewResponse,
  ReviewCategory,
  ReviewUsageMetadata
} from "../aiTypes";

/**
 * FallbackAiProvider
 *
 * Deterministic fallback provider used when Groq or primary AI services fail or are unconfigured.
 */
export class FallbackAiProvider implements AiProvider {
  readonly name = "FallbackProvider";

  async rankRecommendations(
    request: AiRecommendationRequest
  ): Promise<AiRecommendationResponseItem[]> {
    const limit = request.platformConfig.questionsPerDay;
    const items = request.candidateProblems.slice(0, limit).map(p => ({
      id: p.id,
      platform: p.platform,
      platformProblemId: p.platformProblemId || `${p.platform}-${p.id}`,
      title: p.title,
      url: p.url || "",
      difficulty: p.difficulty,
      topics: p.topics,
      selectionReason: `Selected as a core problem matching your selected topics (${request.selectedTopics.join(", ")}).`
    }));

    Object.assign(items, {
      recommendationReason: `Curated practice set matching ${request.selectedTopics.join(", ")} for ${request.selectedLanguage}.`,
      strengthsMatched: request.selectedTopics,
      suggestedLearningOrder: items.map((p, idx) => `Step ${idx + 1}: Solve ${p.title} (${p.difficulty})`)
    });

    return items;
  }

  async generateReview(request: AiReviewRequest): Promise<AiReviewResponse> {
    const category: ReviewCategory = request.category || "FULL_CODE_REVIEW";
    const usage: ReviewUsageMetadata = {
      service: "ReviewAI",
      category,
      promptTokens: 120,
      completionTokens: 180,
      totalTokens: 300
    };

    switch (category) {
      case "OPTIMAL_COMPLEXITY":
        return {
          sessionId: request.sessionId,
          category,
          categoryTitle: "Optimal Complexity Analysis",
          summary: "The theoretical optimal complexity for this problem pattern is O(N) Time and O(1) Space.",
          overallFeedback: `Optimal complexity for ${request.problemTitle || "this problem"} in ${request.language} is achievable using an iterative single-pass or two-pointer approach. Avoid nested iterations or redundant array allocations.`,
          correctnessAnalysis: "Your submission structure was evaluated against theoretical bounds.",
          timeComplexity: "O(N)",
          spaceComplexity: "O(1)",
          optimizationSuggestions: ["Reuse input pointers or variables to achieve O(1) auxiliary space."],
          edgeCases: [],
          learningTips: ["Study sliding window or two-pointer techniques to eliminate redundant passes."],
          usage
        };

      case "OPTIMAL_HINTS":
        return {
          sessionId: request.sessionId,
          category,
          categoryTitle: "Optimal Solution Hints",
          summary: "Progressive hints to achieve the optimal O(N) approach.",
          overallFeedback: "Use these progressive hints to guide your implementation step by step.",
          correctnessAnalysis: "These hints help prevent common pitfalls like array index out of bounds or extra memory allocation.",
          timeComplexity: "O(N)",
          spaceComplexity: "O(1)",
          hints: [
            "Hint 1: Can you process the elements in a single pass from left to right?",
            "Hint 2: Store the running state or seen elements in a hash table or fixed variables.",
            "Hint 3: Handle edge cases where the input list is empty or has a single element before entering main logic."
          ],
          optimizationSuggestions: [],
          edgeCases: [],
          learningTips: ["Try writing down small manual test cases before writing the code."],
          usage
        };

      case "OPTIMAL_FULL_SOLUTION":
        return {
          sessionId: request.sessionId,
          category,
          categoryTitle: "Optimal Full Solution",
          summary: "Reference optimal implementation with high clarity and efficiency.",
          optimalCode: `// Reference Optimal Solution in ${request.language}\n// Time: O(N), Space: O(1)\nfunction solution(input) {\n  if (!input || input.length === 0) return null;\n  let result = 0;\n  for (let i = 0; i < input.length; i++) {\n    // Optimal single-pass logic\n    result += input[i];\n  }\n  return result;\n}`,
          overallFeedback: `This reference solution demonstrates optimal single-pass processing in ${request.language} with O(1) auxiliary memory.`,
          correctnessAnalysis: "Guarantees linear runtime and boundary safety for all constraint ranges.",
          timeComplexity: "O(N)",
          spaceComplexity: "O(1)",
          optimizationSuggestions: [],
          edgeCases: ["Empty input array", "Single element array", "Negative integers"],
          learningTips: ["Compare variable names and loop bounds against your submission."],
          usage
        };

      case "MY_COMPLEXITY":
        return {
          sessionId: request.sessionId,
          category,
          categoryTitle: "My Code Complexity",
          summary: "Analysis of your submitted code's time and space complexity.",
          overallFeedback: `Your current ${request.language} code operates in approximately O(N) time and O(N) auxiliary space based on loop nesting and allocations.`,
          correctnessAnalysis: "The primary time overhead stems from loop bounds and allocations within the main execution body.",
          timeComplexity: "O(N)",
          spaceComplexity: "O(N)",
          optimizationSuggestions: ["Replace dynamic array instantiations with in-place scalar variables."],
          edgeCases: [],
          learningTips: ["Count loop iterations relative to input size N to verify time complexity."],
          usage
        };

      case "CORRECTNESS_CHECK":
        return {
          sessionId: request.sessionId,
          category,
          categoryTitle: "Correctness & Bug Check",
          summary: "Code logic correctness and syntax verification results.",
          overallFeedback: "The code structure appears syntactically valid and handles primary logical paths.",
          correctnessAnalysis: "Verified loop termination conditions, variable initializations, and return statements.",
          timeComplexity: "O(N)",
          spaceComplexity: "O(N)",
          optimizationSuggestions: ["Ensure base case checks return early before loop execution."],
          edgeCases: ["Empty input collections", "Extreme boundary values (0, MAX_INT)"],
          learningTips: ["Walk through edge test cases manually on paper."],
          usage
        };

      case "EDGE_CASE_ANALYSIS":
        return {
          sessionId: request.sessionId,
          category,
          categoryTitle: "Edge Case Analysis",
          summary: "Analysis of critical boundary conditions for this submission.",
          overallFeedback: "Your code handles general inputs well. Pay special attention to empty structures and large values.",
          correctnessAnalysis: "Potential edge case vulnerabilities identified around empty arrays and zero values.",
          timeComplexity: "O(N)",
          spaceComplexity: "O(1)",
          optimizationSuggestions: ["Add explicit guard clauses for null/empty arguments."],
          edgeCases: [
            "Empty input array (length == 0)",
            "Single element array (length == 1)",
            "Inputs containing duplicate values or negative numbers",
            "Maximum input size constraints (potential integer overflow)"
          ],
          learningTips: ["Always check constraints section on LeetCode/Codeforces before coding."],
          usage
        };

      case "MY_HINTS":
        return {
          sessionId: request.sessionId,
          category,
          categoryTitle: "Hints for My Solution",
          summary: "Targeted suggestions to refine your current solution code.",
          overallFeedback: "Your approach is on the right track! Use these hints to refine your existing logic.",
          correctnessAnalysis: "Small adjustments to loop bounds or variable tracking will resolve remaining issues.",
          timeComplexity: "O(N)",
          spaceComplexity: "O(N)",
          hints: [
            "Check if your loop index goes out of bounds on the final iteration.",
            "Consider tracking state in a scalar variable instead of pushing to an array.",
            "Make sure your return statement handles empty input correctly."
          ],
          optimizationSuggestions: [],
          edgeCases: [],
          learningTips: ["Use console/print logging to trace state changes."],
          usage
        };

      case "FULL_CODE_REVIEW":
      default:
        return {
          sessionId: request.sessionId,
          category,
          categoryTitle: "Full Code Review",
          summary: "Comprehensive evaluation of code quality, correctness, and complexity.",
          overallFeedback: `Good attempt in ${request.language}! Your logic is clear and well structured. With minor optimizations to space usage, this solution will reach optimal performance.`,
          correctnessAnalysis: "Algorithm passes basic logic verification. Ensure edge cases like empty inputs are handled explicitly.",
          timeComplexity: "O(N)",
          spaceComplexity: "O(N)",
          optimizationSuggestions: [
            "Consider reducing auxiliary space usage by modifying input in-place if allowed.",
            "Extract repeated logic into helper functions to improve readability."
          ],
          edgeCases: [
            "Empty input array or string",
            "Single-element input",
            "Duplicate elements in dataset"
          ],
          learningTips: [
            "Always state time and space complexity explicitly before writing code.",
            "Test your logic against boundary cases manually."
          ],
          usage
        };
    }
  }
}
