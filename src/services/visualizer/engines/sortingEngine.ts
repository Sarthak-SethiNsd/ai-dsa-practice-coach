import { AlgorithmFrame, VisualElement } from "../visualizerTypes";

/**
 * Deterministic frame generator for Bubble Sort.
 */
export function generateBubbleSortFrames(input: readonly number[]): readonly AlgorithmFrame[] {
  const arr = [...input];
  const n = arr.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  const sortedIndices = new Set<number>();

  const makeElements = (
    comparingIndices: number[] = [],
    swappingIndices: number[] = []
  ): readonly VisualElement[] => {
    return arr.map((val, idx) => {
      const isComparing = comparingIndices.includes(idx);
      const isSwapping = swappingIndices.includes(idx);
      const isSorted = sortedIndices.has(idx);

      return {
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: isSwapping
          ? "swapping"
          : isComparing
          ? "comparing"
          : isSorted
          ? "sorted"
          : "default",
        label: isSorted ? "✓" : isComparing ? "CMP" : undefined,
      };
    });
  };

  // Initial Frame
  rawFrames.push({
    activeLineNumber: 2,
    explanation: `Initialized Bubble Sort on array [${arr.join(", ")}].`,
    elements: makeElements(),
    stateVariables: {
      pass: 0,
      comparingPair: null,
      swappedInPass: false,
      sortedSuffix: [],
    },
    isTerminal: false,
    status: "running",
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      // Comparison Frame
      rawFrames.push({
        activeLineNumber: 4,
        explanation: `Comparing adjacent elements at indices [${j}, ${j + 1}]: ${arr[j]} vs ${arr[j + 1]}.`,
        elements: makeElements([j, j + 1]),
        stateVariables: {
          pass: i,
          comparingPair: [j, j + 1],
          swappedInPass: swapped,
          sortedSuffix: Array.from(sortedIndices),
        },
        isTerminal: false,
        status: "running",
      });

      if (arr[j] > arr[j + 1]) {
        // Swap
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;

        rawFrames.push({
          activeLineNumber: 5,
          explanation: `${arr[j + 1]} > ${arr[j]}. Swapped elements at indices ${j} and ${j + 1} ➔ [${arr.join(", ")}].`,
          elements: makeElements([], [j, j + 1]),
          stateVariables: {
            pass: i,
            comparingPair: [j, j + 1],
            swappedInPass: true,
            sortedSuffix: Array.from(sortedIndices),
          },
          isTerminal: false,
          status: "running",
        });
      }
    }

    // Mark sorted element at end of pass
    const sortedIdx = n - 1 - i;
    sortedIndices.add(sortedIdx);

    rawFrames.push({
      activeLineNumber: 6,
      explanation: `Pass ${i + 1} complete. Element ${arr[sortedIdx]} at index ${sortedIdx} is in its final sorted position.`,
      elements: makeElements(),
      stateVariables: {
        pass: i,
        comparingPair: null,
        swappedInPass: swapped,
        sortedSuffix: Array.from(sortedIndices),
      },
      isTerminal: false,
      status: "running",
    });

    if (!swapped) {
      // Early exit: No swaps in pass
      for (let k = 0; k < n; k++) sortedIndices.add(k);

      rawFrames.push({
        activeLineNumber: 6,
        explanation: `Early termination: No swaps occurred in pass ${i + 1}. Array is fully sorted.`,
        elements: makeElements(),
        stateVariables: {
          pass: i,
          comparingPair: null,
          swappedInPass: false,
          sortedSuffix: Array.from(sortedIndices),
        },
        isTerminal: false,
        status: "running",
      });
      break;
    }
  }

  // Ensure all marked sorted
  for (let k = 0; k < n; k++) sortedIndices.add(k);

  // Terminal Frame
  rawFrames.push({
    activeLineNumber: 7,
    explanation: `Completed! Array sorted in ascending order: [${arr.join(", ")}].`,
    elements: arr.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: "sorted",
      label: "✓",
    })),
    stateVariables: {
      pass: n - 1,
      comparingPair: null,
      swappedInPass: false,
      sortedSuffix: Array.from(sortedIndices),
    },
    isTerminal: true,
    status: "completed",
  });

  const totalSteps = rawFrames.length;
  return rawFrames.map((rf, idx) => ({
    ...rf,
    stepIndex: idx,
    totalSteps,
  }));
}

/**
 * Deterministic frame generator for Selection Sort.
 */
export function generateSelectionSortFrames(input: readonly number[]): readonly AlgorithmFrame[] {
  const arr = [...input];
  const n = arr.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  const sortedIndices = new Set<number>();

  const makeElements = (
    currentMinIdx: number,
    scanningIdx?: number,
    swappingIndices: number[] = []
  ): readonly VisualElement[] => {
    return arr.map((val, idx) => {
      const isSorted = sortedIndices.has(idx);
      const isSwapping = swappingIndices.includes(idx);
      const isMin = idx === currentMinIdx;
      const isScanning = idx === scanningIdx;

      return {
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: isSwapping
          ? "swapping"
          : isMin
          ? "pointer_mid"
          : isScanning
          ? "comparing"
          : isSorted
          ? "sorted"
          : "default",
        label: isSorted ? "✓" : isMin ? "MIN" : isScanning ? "SCAN" : undefined,
      };
    });
  };

  // Initial Frame
  rawFrames.push({
    activeLineNumber: 2,
    explanation: `Initialized Selection Sort on array [${arr.join(", ")}].`,
    elements: makeElements(0),
    stateVariables: {
      sortedPrefixLength: 0,
      currentMinIndex: null,
      currentMinValue: null,
      scanIndex: null,
    },
    isTerminal: false,
    status: "running",
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    rawFrames.push({
      activeLineNumber: 3,
      explanation: `Pass ${i + 1}: Initialized candidate minimum at index ${i} (value: ${arr[i]}).`,
      elements: makeElements(minIdx),
      stateVariables: {
        sortedPrefixLength: i,
        currentMinIndex: minIdx,
        currentMinValue: arr[minIdx],
        scanIndex: null,
      },
      isTerminal: false,
      status: "running",
    });

    for (let j = i + 1; j < n; j++) {
      const isNewMin = arr[j] < arr[minIdx];

      rawFrames.push({
        activeLineNumber: 4,
        explanation: `Scanning index ${j} (val: ${arr[j]}) vs current min at index ${minIdx} (val: ${arr[minIdx]}).`,
        elements: makeElements(minIdx, j),
        stateVariables: {
          sortedPrefixLength: i,
          currentMinIndex: minIdx,
          currentMinValue: arr[minIdx],
          scanIndex: j,
        },
        isTerminal: false,
        status: "running",
      });

      if (isNewMin) {
        minIdx = j;
        rawFrames.push({
          activeLineNumber: 5,
          explanation: `New minimum found! arr[${j}] (${arr[j]}) < previous min. Updated minIdx = ${minIdx}.`,
          elements: makeElements(minIdx, j),
          stateVariables: {
            sortedPrefixLength: i,
            currentMinIndex: minIdx,
            currentMinValue: arr[minIdx],
            scanIndex: j,
          },
          isTerminal: false,
          status: "running",
        });
      }
    }

    // Swap min to sorted prefix position i
    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      rawFrames.push({
        activeLineNumber: 6,
        explanation: `Swapped minimum element ${arr[i]} into sorted position at index ${i} (with index ${minIdx}).`,
        elements: makeElements(i, undefined, [i, minIdx]),
        stateVariables: {
          sortedPrefixLength: i + 1,
          currentMinIndex: minIdx,
          currentMinValue: arr[i],
          scanIndex: null,
        },
        isTerminal: false,
        status: "running",
      });
    }

    sortedIndices.add(i);
  }

  sortedIndices.add(n - 1);

  // Terminal Frame
  rawFrames.push({
    activeLineNumber: 7,
    explanation: `Completed! Array sorted in ascending order: [${arr.join(", ")}].`,
    elements: arr.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: "sorted",
      label: "✓",
    })),
    stateVariables: {
      sortedPrefixLength: n,
      currentMinIndex: null,
      currentMinValue: null,
      scanIndex: null,
    },
    isTerminal: true,
    status: "completed",
  });

  const totalSteps = rawFrames.length;
  return rawFrames.map((rf, idx) => ({
    ...rf,
    stepIndex: idx,
    totalSteps,
  }));
}

/**
 * Deterministic frame generator for Merge Sort.
 * Traversal Order: LEFT SUBTREE FIRST -> RIGHT SUBTREE -> MERGE.
 */
export function generateMergeSortFrames(input: readonly number[]): readonly AlgorithmFrame[] {
  const arr = [...input];
  const n = arr.length;
  const rawFrames: Array<Omit<AlgorithmFrame, "stepIndex" | "totalSteps">> = [];

  const sortedSubarrays: Array<[number, number]> = [];

  const makeElements = (
    activeRange?: [number, number],
    writingIndex?: number,
    comparingIndices: number[] = []
  ): readonly VisualElement[] => {
    return arr.map((val, idx) => {
      const inRange = activeRange ? idx >= activeRange[0] && idx <= activeRange[1] : false;
      const isWriting = idx === writingIndex;
      const isComparing = comparingIndices.includes(idx);
      const isGloballySorted = activeRange && activeRange[0] === 0 && activeRange[1] === n - 1 && sortedSubarrays.some(([s, e]) => s === 0 && e === n - 1);

      return {
        id: `elem_${idx}`,
        value: val,
        index: idx,
        highlight: isWriting
          ? "swapping"
          : isComparing
          ? "comparing"
          : isGloballySorted
          ? "sorted"
          : inRange
          ? "window_active"
          : "default",
        label: isWriting ? "WRITE" : isComparing ? "CMP" : inRange ? "SUB" : undefined,
      };
    });
  };

  // Initial Frame
  rawFrames.push({
    activeLineNumber: 1,
    explanation: `Initialized Merge Sort on array [${arr.join(", ")}]. Divide and conquer range [0, ${n - 1}].`,
    elements: makeElements([0, n - 1]),
    auxiliaryElements: [],
    stateVariables: {
      activeSubarray: [0, n - 1],
      mid: null,
      leftBuffer: [],
      rightBuffer: [],
      writeIndex: null,
    },
    isTerminal: false,
    status: "running",
  });

  // Recursive Merge Sort function with deterministic Left -> Right -> Merge order
  const mergeSortRecursive = (left: number, right: number) => {
    if (left >= right) {
      return;
    }

    const mid = left + Math.floor((right - left) / 2);

    // Frame: Divide
    rawFrames.push({
      activeLineNumber: 3,
      explanation: `Dividing range [${left} .. ${right}] at mid = ${mid}: Left [${left} .. ${mid}], Right [${mid + 1} .. ${right}].`,
      elements: makeElements([left, right]),
      auxiliaryElements: [],
      stateVariables: {
        activeSubarray: [left, right],
        mid,
        leftBuffer: arr.slice(left, mid + 1),
        rightBuffer: arr.slice(mid + 1, right + 1),
        writeIndex: null,
      },
      isTerminal: false,
      status: "running",
    });

    // 1. Recurse Left Subtree First
    mergeSortRecursive(left, mid);

    // 2. Recurse Right Subtree Next
    mergeSortRecursive(mid + 1, right);

    // 3. Merge Step
    const leftBuffer = arr.slice(left, mid + 1);
    const rightBuffer = arr.slice(mid + 1, right + 1);

    const makeAuxElements = (p1: number, p2: number): readonly VisualElement[] => {
      const aux: VisualElement[] = [];
      leftBuffer.forEach((val, idx) => {
        aux.push({
          id: `aux_left_${idx}`,
          value: val,
          index: idx,
          highlight: idx === p1 ? "pointer_left" : idx < p1 ? "discarded" : "window_active",
          label: idx === p1 ? "L_PTR" : `L[${idx}]`,
        });
      });
      rightBuffer.forEach((val, idx) => {
        aux.push({
          id: `aux_right_${idx}`,
          value: val,
          index: idx + leftBuffer.length,
          highlight: idx === p2 ? "pointer_right" : idx < p2 ? "discarded" : "window_active",
          label: idx === p2 ? "R_PTR" : `R[${idx}]`,
        });
      });
      return aux;
    };

    // Frame: Extract Buffers
    rawFrames.push({
      activeLineNumber: 6,
      explanation: `Loaded auxiliary buffers for merge [${left} .. ${right}]: Left=[${leftBuffer.join(", ")}], Right=[${rightBuffer.join(", ")}].`,
      elements: makeElements([left, right]),
      auxiliaryElements: makeAuxElements(0, 0),
      stateVariables: {
        activeSubarray: [left, right],
        mid,
        leftBuffer: [...leftBuffer],
        rightBuffer: [...rightBuffer],
        writeIndex: left,
      },
      isTerminal: false,
      status: "running",
    });

    let p1 = 0;
    let p2 = 0;
    let k = left;

    // Compare and write smaller value
    while (p1 < leftBuffer.length && p2 < rightBuffer.length) {
      const valL = leftBuffer[p1];
      const valR = rightBuffer[p2];

      if (valL <= valR) {
        arr[k] = valL;
        rawFrames.push({
          activeLineNumber: 6,
          explanation: `Left buffer ${valL} <= Right buffer ${valR}. Writing ${valL} to arr[${k}].`,
          elements: makeElements([left, right], k),
          auxiliaryElements: makeAuxElements(p1, p2),
          stateVariables: {
            activeSubarray: [left, right],
            mid,
            leftBuffer: [...leftBuffer],
            rightBuffer: [...rightBuffer],
            writeIndex: k,
          },
          isTerminal: false,
          status: "running",
        });
        p1++;
      } else {
        arr[k] = valR;
        rawFrames.push({
          activeLineNumber: 6,
          explanation: `Right buffer ${valR} < Left buffer ${valL}. Writing ${valR} to arr[${k}].`,
          elements: makeElements([left, right], k),
          auxiliaryElements: makeAuxElements(p1, p2),
          stateVariables: {
            activeSubarray: [left, right],
            mid,
            leftBuffer: [...leftBuffer],
            rightBuffer: [...rightBuffer],
            writeIndex: k,
          },
          isTerminal: false,
          status: "running",
        });
        p2++;
      }
      k++;
    }

    // Drain remaining left buffer
    while (p1 < leftBuffer.length) {
      arr[k] = leftBuffer[p1];
      rawFrames.push({
        activeLineNumber: 6,
        explanation: `Right buffer exhausted. Flushing remaining Left element ${leftBuffer[p1]} to arr[${k}].`,
        elements: makeElements([left, right], k),
        auxiliaryElements: makeAuxElements(p1, p2),
        stateVariables: {
          activeSubarray: [left, right],
          mid,
          leftBuffer: [...leftBuffer],
          rightBuffer: [...rightBuffer],
          writeIndex: k,
        },
        isTerminal: false,
        status: "running",
      });
      p1++;
      k++;
    }

    // Drain remaining right buffer
    while (p2 < rightBuffer.length) {
      arr[k] = rightBuffer[p2];
      rawFrames.push({
        activeLineNumber: 6,
        explanation: `Left buffer exhausted. Flushing remaining Right element ${rightBuffer[p2]} to arr[${k}].`,
        elements: makeElements([left, right], k),
        auxiliaryElements: makeAuxElements(p1, p2),
        stateVariables: {
          activeSubarray: [left, right],
          mid,
          leftBuffer: [...leftBuffer],
          rightBuffer: [...rightBuffer],
          writeIndex: k,
        },
        isTerminal: false,
        status: "running",
      });
      p2++;
      k++;
    }

    sortedSubarrays.push([left, right]);

    // Subarray Merged Frame
    rawFrames.push({
      activeLineNumber: 6,
      explanation: `Subarray [${left} .. ${right}] merged and sorted: [${arr.slice(left, right + 1).join(", ")}].`,
      elements: makeElements([left, right]),
      auxiliaryElements: [],
      stateVariables: {
        activeSubarray: [left, right],
        mid,
        leftBuffer: [],
        rightBuffer: [],
        writeIndex: null,
      },
      isTerminal: false,
      status: "running",
    });
  };

  mergeSortRecursive(0, n - 1);

  // Terminal Frame
  rawFrames.push({
    activeLineNumber: 6,
    explanation: `Completed! Array sorted in ascending order: [${arr.join(", ")}].`,
    elements: arr.map((val, idx) => ({
      id: `elem_${idx}`,
      value: val,
      index: idx,
      highlight: "sorted",
      label: "✓",
    })),
    auxiliaryElements: [],
    stateVariables: {
      activeSubarray: [0, n - 1],
      mid: null,
      leftBuffer: [],
      rightBuffer: [],
      writeIndex: null,
    },
    isTerminal: true,
    status: "completed",
  });

  const totalSteps = rawFrames.length;
  return rawFrames.map((rf, idx) => ({
    ...rf,
    stepIndex: idx,
    totalSteps,
  }));
}
