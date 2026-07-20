import { Problem, ProblemAdapter } from '../types';

// Raw Codeforces problem format (simulating what might come from Codeforces API)
export interface CodeforcesProblemRaw {
  problemId: number;
  problemName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  typicalTime: string;
  solutions: Record<string, string>;
  complexity: {
    time: string;
    space: string;
  };
  keyTakeaways: string[];
  contestId?: number;
  index?: string;
}

export class CodeforcesAdapter implements ProblemAdapter<CodeforcesProblemRaw> {
  adapt(rawData: CodeforcesProblemRaw): Problem {
    return {
      id: rawData.problemId,
      title: rawData.problemName,
      difficulty: rawData.difficulty,
      topics: rawData.topics,
      estimated: rawData.typicalTime,
      solutions: rawData.solutions,
      complexity: {
        time: rawData.complexity.time,
        space: rawData.complexity.space,
      },
      takeaways: rawData.keyTakeaways,
      platform: 'codeforces'
    };
  }
}