export type VisualizerAlgorithmFamily =
  | "two_pointers"
  | "sliding_window"
  | "binary_search"
  | "monotonic_stack"
  | "sorting";

export type VisualizerAlgorithmId =
  | "two_pointers"
  | "sliding_window_max_sum"
  | "sliding_window_distinct"
  | "binary_search"
  | "daily_temperatures"
  | "next_greater_element"
  | "bubble_sort"
  | "selection_sort"
  | "merge_sort";

export type ElementHighlightType =
  | "default"
  | "pointer_left"
  | "pointer_right"
  | "pointer_mid"
  | "window_active"
  | "comparing"
  | "swapping"
  | "matched"
  | "sorted"
  | "discarded"
  | "stack_top"
  | "stack_resolved";

export interface VisualElement {
  readonly id: string;
  readonly value: number | string;
  readonly index: number;
  readonly highlight: ElementHighlightType;
  readonly label?: string;
  readonly secondaryValue?: number | string;
}

export type StateValue =
  | string
  | number
  | boolean
  | null
  | readonly StateValue[]
  | { readonly [key: string]: StateValue };

export interface PseudocodeLine {
  readonly lineNumber: number;
  readonly code: string;
  readonly indent: number;
}

export interface AlgorithmFrame {
  readonly stepIndex: number;
  readonly totalSteps: number;
  readonly activeLineNumber: number;
  readonly explanation: string;
  readonly elements: readonly VisualElement[];
  readonly auxiliaryElements?: readonly VisualElement[];
  readonly stateVariables: Readonly<Record<string, StateValue>>;
  readonly isTerminal: boolean;
  readonly status: "running" | "success" | "failure" | "completed";
}

export interface AlgorithmPreset {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly inputArray: readonly number[] | string;
  readonly targetValue?: number | string;
  readonly windowSize?: number;
  readonly expectedOutcome: string;
}

export interface AlgorithmDefinition {
  readonly id: VisualizerAlgorithmId;
  readonly family: VisualizerAlgorithmFamily;
  readonly title: string;
  readonly description: string;
  readonly timeComplexity: string;
  readonly spaceComplexity: string;
  readonly inputType: "number_array" | "string";
  readonly hasTargetInput?: boolean;
  readonly hasWindowSizeInput?: boolean;
  readonly requiresSortedInput?: boolean;
  readonly pseudocode: readonly PseudocodeLine[];
  readonly presets: readonly AlgorithmPreset[];
  readonly relatedSkillId: string;
  readonly relatedPracticeId?: number;
}

export interface PlaybackState {
  readonly currentFrameIndex: number;
  readonly isPlaying: boolean;
  readonly speedMultiplier: 0.5 | 1 | 2 | 4;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errorMessage?: string;
  readonly sanitizedNumbers?: readonly number[];
  readonly sanitizedString?: string;
  readonly sanitizedTarget?: number | string;
  readonly sanitizedWindowSize?: number;
}
