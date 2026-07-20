import { ProblemService } from './types';
import { Problem, RecommendationRequest } from './types';

/**
 * RecommendationEngine that works with any platform service implementing the ProblemService interface
 */
export class RecommendationEngine {
  private services: ProblemService[];

  constructor(services: ProblemService[]) {
    this.services = services;
  }

  /**
   * Get problem recommendations from all registered services
   * @param request - The recommendation request containing topics, platforms, count per platform, difficulty, and total limit
   * @returns Promise resolving to array of recommended problems
   */
  async getRecommendations(request: RecommendationRequest): Promise<Problem[]> {
    try {
      // Get problems from all services concurrently
      const servicePromises = this.services.map(service =>
        service.getProblems(request)
      );

      const results = await Promise.all(servicePromises);

      // Flatten results from all services
      let allProblems: Problem[] = [];
      results.forEach(result => {
        allProblems = [...allProblems, ...result];
      });

      // Remove duplicates by problem ID (in case same problem exists in multiple platforms)
      const uniqueProblems = Array.from(
        new Map(allProblems.map(problem => [problem.id, problem])).values()
      );

      // Sort by ID for consistent ordering
      uniqueProblems.sort((a, b) => a.id - b.id);

      // Apply total limit if specified
      if (request.totalLimit && request.totalLimit > 0) {
        return uniqueProblems.slice(0, request.totalLimit);
      }

      return uniqueProblems;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Return empty array on error to maintain app stability
      return [];
    }
  }

  /**
   * Add a new platform service to the engine
   * @param service - The platform service to add
   */
  addService(service: ProblemService): void {
    this.services.push(service);
  }

  /**
   * Remove a platform service from the engine
   * @param service - The platform service to remove
   */
  removeService(service: ProblemService): void {
    const index = this.services.indexOf(service);
    if (index > -1) {
      this.services.splice(index, 1);
    }
  }

  /**
   * Get all registered services
   * @returns Array of registered platform services
   */
  getServices(): ProblemService[] {
    return [...this.services];
  }
}