import { ValidationResult, VisualizerAlgorithmId } from "./visualizerTypes";
import { ALGORITHM_DEFINITIONS } from "./visualizerDefinitions";

export const MIN_ARRAY_ELEMENTS = 5;
export const MAX_ARRAY_ELEMENTS = 15;
export const MIN_NUMERIC_VALUE = -999;
export const MAX_NUMERIC_VALUE = 9999;
export const MIN_TARGET_VALUE = -9999;
export const MAX_TARGET_VALUE = 99999;

/**
 * Parses and validates raw numeric array text (comma- or whitespace-separated).
 */
export function validateNumericArray(raw: string): { isValid: boolean; error?: string; numbers?: number[] } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { isValid: false, error: "Please enter an array of numbers." };
  }

  // Split on commas or whitespace
  const tokens = trimmed.split(/[\s,]+/).filter((t) => t.length > 0);

  if (tokens.length < MIN_ARRAY_ELEMENTS) {
    return {
      isValid: false,
      error: `Please enter at least ${MIN_ARRAY_ELEMENTS} numbers (provided ${tokens.length}).`,
    };
  }

  if (tokens.length > MAX_ARRAY_ELEMENTS) {
    return {
      isValid: false,
      error: `Please limit input to at most ${MAX_ARRAY_ELEMENTS} numbers (provided ${tokens.length}).`,
    };
  }

  const numbers: number[] = [];
  for (const token of tokens) {
    // Check for valid integer
    if (!/^-?\d+$/.test(token)) {
      return {
        isValid: false,
        error: `Invalid number token: "${token}". Only integer values are accepted.`,
      };
    }

    const val = Number(token);
    if (!Number.isSafeInteger(val) || Number.isNaN(val)) {
      return { isValid: false, error: `Invalid integer value: "${token}".` };
    }

    if (val < MIN_NUMERIC_VALUE || val > MAX_NUMERIC_VALUE) {
      return {
        isValid: false,
        error: `Value ${val} is out of bounds (allowed range: ${MIN_NUMERIC_VALUE} to ${MAX_NUMERIC_VALUE}).`,
      };
    }

    numbers.push(val);
  }

  return { isValid: true, numbers };
}

/**
 * Validates string input for distinct sliding window.
 */
export function validateStringInput(raw: string): { isValid: boolean; error?: string; str?: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { isValid: false, error: "Please enter a string." };
  }

  if (trimmed.length < MIN_ARRAY_ELEMENTS) {
    return {
      isValid: false,
      error: `String must have at least ${MIN_ARRAY_ELEMENTS} characters (provided ${trimmed.length}).`,
    };
  }

  if (trimmed.length > MAX_ARRAY_ELEMENTS) {
    return {
      isValid: false,
      error: `String must have at most ${MAX_ARRAY_ELEMENTS} characters (provided ${trimmed.length}).`,
    };
  }

  // Check for printable ASCII
  if (!/^[\x20-\x7E]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: "String contains non-printable or non-ASCII characters.",
    };
  }

  return { isValid: true, str: trimmed };
}

/**
 * Checks whether an array is strictly sorted in ascending order.
 */
export function isSortedAscending(arr: readonly number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }
  return true;
}

/**
 * Utility helper returning a new sorted copy of a numeric array.
 */
export function autoSortNumbers(arr: readonly number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

/**
 * Comprehensive input validator for any concrete algorithm and user payload.
 */
export function validateVisualizerInput(
  algorithmId: VisualizerAlgorithmId,
  rawInput: string,
  rawTarget?: string,
  rawWindowSize?: string
): ValidationResult {
  const def = ALGORITHM_DEFINITIONS[algorithmId];
  if (!def) {
    return { isValid: false, errorMessage: `Unknown algorithm ID: ${algorithmId}` };
  }

  // 1. Validate Primary Input
  if (def.inputType === "string") {
    const strCheck = validateStringInput(rawInput);
    if (!strCheck.isValid) {
      return { isValid: false, errorMessage: strCheck.error };
    }
    return { isValid: true, sanitizedString: strCheck.str };
  }

  // Numeric Array Validation
  const numCheck = validateNumericArray(rawInput);
  if (!numCheck.isValid || !numCheck.numbers) {
    return { isValid: false, errorMessage: numCheck.error };
  }

  const numbers = numCheck.numbers;

  // 2. Sorted Requirement Check
  if (def.requiresSortedInput && !isSortedAscending(numbers)) {
    return {
      isValid: false,
      errorMessage: "This algorithm requires a sorted array in ascending order. Click 'Auto-Sort' to continue.",
      sanitizedNumbers: numbers,
    };
  }

  // 3. Target Input Validation (if required)
  let sanitizedTarget: number | undefined;
  if (def.hasTargetInput) {
    const targetStr = (rawTarget ?? "").trim();
    if (!targetStr || !/^-?\d+$/.test(targetStr)) {
      return {
        isValid: false,
        errorMessage: "Please enter a valid target integer.",
        sanitizedNumbers: numbers,
      };
    }
    const targetVal = Number(targetStr);
    if (targetVal < MIN_TARGET_VALUE || targetVal > MAX_TARGET_VALUE) {
      return {
        isValid: false,
        errorMessage: `Target ${targetVal} is out of bounds (${MIN_TARGET_VALUE} to ${MAX_TARGET_VALUE}).`,
        sanitizedNumbers: numbers,
      };
    }
    sanitizedTarget = targetVal;
  }

  // 4. Window Size Input Validation (if required)
  let sanitizedWindowSize: number | undefined;
  if (def.hasWindowSizeInput) {
    const winStr = (rawWindowSize ?? "").trim();
    if (!winStr || !/^\d+$/.test(winStr)) {
      return {
        isValid: false,
        errorMessage: "Please enter a valid positive integer for window size K.",
        sanitizedNumbers: numbers,
      };
    }
    const winVal = Number(winStr);
    if (winVal < 1 || winVal > numbers.length) {
      return {
        isValid: false,
        errorMessage: `Window size K must be between 1 and array length (${numbers.length}).`,
        sanitizedNumbers: numbers,
      };
    }
    sanitizedWindowSize = winVal;
  }

  return {
    isValid: true,
    sanitizedNumbers: numbers,
    sanitizedTarget,
    sanitizedWindowSize,
  };
}
