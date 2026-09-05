"use client";

import { useEffect, useRef, useState } from "react";

export function useReviewSession(autoStart = false) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [approvedAt, setApprovedAt] = useState<Date | null>(null);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [manualEdits, setManualEdits] = useState<Set<string>>(new Set());
  const anchor = useRef(0);
  const base = useRef(0);

  useEffect(() => {
    if (!autoStart) return;
    const timer = window.setTimeout(() => {
      const now = Date.now();
      setStartedAt(new Date(now));
      anchor.current = now;
      base.current = 0;
      setRunning(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoStart]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsedMs(base.current + Date.now() - anchor.current), 250);
    return () => window.clearInterval(timer);
  }, [running]);

  function start() {
    if (running) return;
    if (!startedAt || approvedAt) {
      if (approvedAt) { setElapsedMs(0); base.current = 0; setAccepted(new Set()); setSkipped(new Set()); setManualEdits(new Set()); }
      setStartedAt(new Date()); setApprovedAt(null);
    }
    anchor.current = Date.now(); base.current = approvedAt ? 0 : elapsedMs; setRunning(true);
  }

  function pause() {
    if (!running) return;
    const value = base.current + Date.now() - anchor.current;
    base.current = value; setElapsedMs(value); setRunning(false);
  }

  function approve() {
    if (!startedAt) return;
    if (running) {
      const value = base.current + Date.now() - anchor.current;
      base.current = value; setElapsedMs(value);
    }
    setRunning(false); setApprovedAt(new Date());
  }

  function recordManual(id: string | number) { start(); setManualEdits((current) => new Set(current).add(String(id))); }
  function recordSuggestion(id: string, decision: "accepted" | "skipped") {
    start();
    if (decision === "accepted") { setAccepted((current) => new Set(current).add(id)); setSkipped((current) => { const next = new Set(current); next.delete(id); return next; }); }
    else { setSkipped((current) => new Set(current).add(id)); setAccepted((current) => { const next = new Set(current); next.delete(id); return next; }); }
  }

  return { elapsedSeconds: Math.floor(elapsedMs / 1000), running, startedAt, approvedAt, accepted, skipped, manualEdits, start, pause, approve, recordManual, recordSuggestion };
}
