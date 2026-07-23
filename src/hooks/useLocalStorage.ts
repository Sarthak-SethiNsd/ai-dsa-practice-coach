"use client";

import * as React from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * Reusable hook for persisting React state in localStorage.
 * Uses useSyncExternalStore for clean React 18+ SSR & hydration compliance without setState-in-effect lint warnings.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const getSnapshot = React.useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const getServerSnapshot = React.useCallback(() => {
    return null;
  }, []);

  const storeValueRaw = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const value: T = React.useMemo(() => {
    if (storeValueRaw === null) return initialValue;
    try {
      return JSON.parse(storeValueRaw) as T;
    } catch {
      return initialValue;
    }
  }, [storeValueRaw, initialValue]);

  const setValue = React.useCallback(
    (val: T | ((prev: T) => T)) => {
      try {
        const currentRaw = window.localStorage.getItem(key);
        const currentVal: T =
          currentRaw !== null ? (JSON.parse(currentRaw) as T) : initialValue;
        const nextVal = val instanceof Function ? val(currentVal) : val;
        window.localStorage.setItem(key, JSON.stringify(nextVal));
        window.dispatchEvent(new Event("storage"));
      } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [value, setValue];
}
