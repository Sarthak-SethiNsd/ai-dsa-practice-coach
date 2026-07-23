"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * Keyboard shortcut definitions.
 * Maps a lowercase key character to a route path.
 */
const SHORTCUTS: Record<string, string> = {
  g: "/",
  p: "/practice",
  r: "/review",
  h: "/history",
  s: "/profile",
};

/**
 * Returns true if the keyboard event originated from an editable element
 * (input, textarea, select, or contenteditable) where shortcuts should be suppressed.
 */
function isEditableTarget(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Hook that registers global single-key navigation shortcuts.
 * Shortcuts are ignored when the user is typing inside an editable element.
 */
export function useKeyboardShortcuts() {
  const router = useRouter();

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore modifier combos (Ctrl, Alt, Meta)
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      // Ignore when user is typing in a form element
      if (isEditableTarget(event)) return;

      const path = SHORTCUTS[event.key.toLowerCase()];
      if (path) {
        router.push(path);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
