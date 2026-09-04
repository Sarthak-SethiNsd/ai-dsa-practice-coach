import { AlgorithmFrame, VisualizerAlgorithmId } from "./visualizerTypes";
import { generateTwoPointersFrames } from "./engines/twoPointersEngine";
import {
  generateSlidingWindowMaxSumFrames,
  generateSlidingWindowDistinctFrames,
} from "./engines/slidingWindowEngine";
import { generateBinarySearchFrames } from "./engines/binarySearchEngine";
import {
  generateDailyTemperaturesFrames,
  generateNextGreaterElementFrames,
} from "./engines/monotonicStackEngine";
import {
  generateBubbleSortFrames,
  generateSelectionSortFrames,
  generateMergeSortFrames,
} from "./engines/sortingEngine";

export interface VisualizerEngineParams {
  algorithmId: VisualizerAlgorithmId;
  numbers?: readonly number[];
  inputString?: string;
  targetValue?: number;
  windowSize?: number;
}

/**
 * Central dispatcher executing the pure deterministic frame generator for any of the 9 concrete algorithms.
 */
export function generateAlgorithmFrames(params: VisualizerEngineParams): readonly AlgorithmFrame[] {
  const { algorithmId, numbers = [], inputString = "", targetValue = 0, windowSize = 3 } = params;

  switch (algorithmId) {
    case "two_pointers":
      return generateTwoPointersFrames(numbers, targetValue);

    case "sliding_window_max_sum":
      return generateSlidingWindowMaxSumFrames(numbers, windowSize);

    case "sliding_window_distinct":
      return generateSlidingWindowDistinctFrames(inputString);

    case "binary_search":
      return generateBinarySearchFrames(numbers, targetValue);

    case "daily_temperatures":
      return generateDailyTemperaturesFrames(numbers);

    case "next_greater_element":
      return generateNextGreaterElementFrames(numbers);

    case "bubble_sort":
      return generateBubbleSortFrames(numbers);

    case "selection_sort":
      return generateSelectionSortFrames(numbers);

    case "merge_sort":
      return generateMergeSortFrames(numbers);

    default: {
      const _exhaustiveCheck: never = algorithmId;
      throw new Error(`Unhandled algorithm ID: ${_exhaustiveCheck}`);
    }
  }
}
