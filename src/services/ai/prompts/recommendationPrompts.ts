import { AiRecommendationRequest } from "../aiTypes";

export interface RecommendationPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export function buildRecommendationPrompt(request: AiRecommendationRequest): RecommendationPrompt {
  const candidatesPayload = request.candidateProblems.map(p => ({
    id: p.id,
    platform: p.platform,
    platformProblemId: p.platformProblemId || `${p.platform}-${p.id}`,
    title: p.title,
    url: p.url,
    difficulty: p.difficulty,
    topics: p.topics
  }));

  const systemPrompt = `You are an expert DSA Coach AI specializing in personalized practice problem selection.
CRITICAL MANDATE: You MUST ONLY select, rank, and explain problems from the provided candidate list below.
NEVER invent, fabricate, or hallucinate new problem titles, fake IDs, or non-existent URLs.
All recommended problem IDs MUST strictly exist in the candidate list.
Always respond with strict JSON matching the exact schema requested.`;

  const userPrompt = `Select and rank up to ${request.platformConfig.questionsPerDay} problems from the candidates below for the student:

Student Profile:
- Main Language: ${request.selectedLanguage}
- Target Topics: ${request.selectedTopics.join(", ")}
- Platform: ${request.platformConfig.platform}
- Target Difficulty: ${request.platformConfig.difficulty}
- User Profile Details: ${JSON.stringify(request.userProfile || { selectedLanguage: request.selectedLanguage, selectedTopics: request.selectedTopics })}
- Recent History: ${JSON.stringify(request.recentHistory || [])}

Candidate Problems (JSON):
${JSON.stringify(candidatesPayload)}

Return a JSON object with this exact structure:
{
  "recommendationReason": "High-level 1-2 sentence explanation of why this curated problem set fits the student's current profile",
  "strengthsMatched": ["Core strength or topic match 1", "Core strength or topic match 2"],
  "suggestedLearningOrder": [
    "Step 1: Start with [Problem Title] to reinforce basic pattern",
    "Step 2: Progress to [Problem Title] for edge case practice"
  ],
  "problems": [
    {
      "id": number (must match an existing candidate id),
      "platform": "${request.platformConfig.platform}",
      "platformProblemId": "string (must match candidate platformProblemId)",
      "title": "string (must match candidate title)",
      "url": "string (must match candidate url)",
      "difficulty": "Easy" | "Medium" | "Hard",
      "topics": ["string"],
      "selectionReason": "1 sentence explanation of why this specific problem was selected"
    }
  ]
}`;

  return { systemPrompt, userPrompt };
}
