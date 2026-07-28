import {
  AiRecommendationRequest,
  AiRecommendationResponseItem,
  AiReviewRequest,
  AiReviewResponse
} from './aiTypes';

/**
 * Provider-based AI Architecture Abstraction.
 * Decouples the application from any specific AI service (Gemini, OpenAI, Groq, local models).
 */
export interface AiProvider {
  readonly name: string;
  
  /**
   * Ranks and selects candidate problems from supported platform providers.
   * Does NOT generate or invent fake coding problems.
   */
  rankRecommendations(request: AiRecommendationRequest): Promise<AiRecommendationResponseItem[]>;

  /**
   * Evaluates submitted solution code along with optional problem statement/link.
   * Returns a structured JSON evaluation.
   */
  generateReview(request: AiReviewRequest): Promise<AiReviewResponse>;
}
