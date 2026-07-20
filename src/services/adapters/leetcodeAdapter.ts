import { Problem, ProblemAdapter } from '../types';

// Raw LeetCode problem format (simulating what might come from LeetCode API)
export interface LeetCodeProblemRaw {
  questionId: number;
  questionTitle: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  timeToSolve: string;
  codeSamples: Record<string, string>;
  complexityAnalysis: {
    timeComplexity: string;
    spaceComplexity: string;
  };
  learningPoints: string[];
}

export class LeetCodeAdapter implements ProblemAdapter<LeetCodeProblemRaw> {
  adapt(rawData: LeetCodeProblemRaw): Problem {
    return {
      id: rawData.questionId,
      title: rawData.questionTitle,
      difficulty: rawData.difficultyLevel,
      topics: rawData.tags,
      estimated: rawData.timeToSolve,
      solutions: rawData.codeSamples,
      complexity: {
        time: rawData.complexityAnalysis.timeComplexity,
        space: rawData.complexityAnalysis.spaceComplexity,
      },
      takeaways: rawData.learningPoints,
      platform: 'leetcode'
    };
  }
}