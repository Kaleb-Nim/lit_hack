"use client";

import { useEffect } from "react";

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return !!el && (/^(input|textarea|select)$/i.test(el.tagName) || el.isContentEditable);
};

interface Handlers {
  /** False before hydration or while a dialog is open. */
  active: boolean;
  onAccept: () => void;
  onReject: () => void;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * Y accept · N reject · ↓ next open clause · ↑ previous clause.
 * Inert while the reviewer is typing in an input, textarea or insertion.
 */
export function useReviewKeys({ active, onAccept, onReject, onNext, onPrev }: Handlers) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;

      switch (e.key) {
        case "y":
        case "Y":
          onAccept();
          break;
        case "n":
        case "N":
          onReject();
          break;
        case "ArrowDown":
          onNext();
          break;
        case "ArrowUp":
          onPrev();
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onAccept, onReject, onNext, onPrev]);
}
