"use client";

/**
 * Cross-route review state.
 *
 * Lives in the root layout so it survives client-side navigation between
 * `/`, `/review/[docId]`, `/review/[docId]/final` and `/files`, and is
 * mirrored to sessionStorage so a hard refresh or browser back/forward does
 * not lose the reviewer's decisions.
 *
 * The store is a small external store read through `useSyncExternalStore`:
 * the server (and the hydration pass) see an empty store, the first client
 * render after hydration reads sessionStorage, and `hydrated` flips to true
 * at the same moment so pages can swap their skeletons for real content.
 *
 * Owned by the review agent; the summary/files agent only consumes
 * `startRun`, `queue`, `docs` and `hydrated`.
 */

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { DocId } from "@/lib/pdpa/data";

export type Status = "open" | "accepted" | "rejected";

export interface DocReview {
  statuses: Record<string, Status>;
  texts: Record<string, string>;
  signedBy?: string;
  signedAt?: string;
}

export interface ReviewStore {
  docs: Partial<Record<DocId, DocReview>>;
  /** Ordered run queue set from /files. */
  queue: DocId[];
}

export interface ReviewApi extends ReviewStore {
  /** True once sessionStorage has been read; render placeholders before. */
  hydrated: boolean;
  getDoc(docId: DocId): DocReview | undefined;
  /** Seed a doc's texts the first time it is opened (idempotent). */
  ensureDoc(docId: DocId, seed: { changeIds: string[]; texts: Record<string, string> }): void;
  setStatus(docId: DocId, changeId: string, status: Status): void;
  setText(docId: DocId, changeId: string, text: string): void;
  sign(docId: DocId, name: string): void;
  resetDoc(docId: DocId): void;
  /** Start a run over `ids`; the first id is the document to open. */
  startRun(ids: DocId[]): void;
  /** The queue entry after `docId`, or null when it is last / not queued. */
  nextInQueue(docId: DocId): DocId | null;
  clearQueue(): void;
  /** Wipe everything (used by the "start over" affordance and tests). */
  resetAll(): void;
}

const STORAGE_KEY = "pearson.review.v1";
const EMPTY: ReviewStore = { docs: {}, queue: [] };

function readStorage(): ReviewStore {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ReviewStore>;
    return {
      docs: parsed.docs && typeof parsed.docs === "object" ? parsed.docs : {},
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
    };
  } catch {
    return EMPTY;
  }
}

function writeStorage(store: ReviewStore) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Private mode or quota: the in-memory store still works for this tab.
  }
}

/* ── External store ────────────────────────────────────────────── */

let current: ReviewStore = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function getSnapshot(): ReviewStore {
  if (!loaded) {
    loaded = true;
    current = readStorage();
  }
  return current;
}

function getServerSnapshot(): ReviewStore {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function update(fn: (s: ReviewStore) => ReviewStore) {
  const next = fn(getSnapshot());
  if (next === current) return;
  current = next;
  writeStorage(next);
  listeners.forEach((l) => l());
}

/* ── Provider ──────────────────────────────────────────────────── */

const ReviewContext = createContext<ReviewApi | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const api = useMemo<ReviewApi>(
    () => ({
      ...store,
      hydrated,
      getDoc: (docId) => store.docs[docId],
      ensureDoc: (docId, seed) =>
        update((s) => {
          if (s.docs[docId]) return s;
          const statuses = Object.fromEntries(seed.changeIds.map((id) => [id, "open" as Status]));
          return { ...s, docs: { ...s.docs, [docId]: { statuses, texts: { ...seed.texts } } } };
        }),
      setStatus: (docId, changeId, status) =>
        update((s) => {
          const doc = s.docs[docId] ?? { statuses: {}, texts: {} };
          if (doc.statuses[changeId] === status) return s;
          return { ...s, docs: { ...s.docs, [docId]: { ...doc, statuses: { ...doc.statuses, [changeId]: status } } } };
        }),
      setText: (docId, changeId, text) =>
        update((s) => {
          const doc = s.docs[docId] ?? { statuses: {}, texts: {} };
          if (doc.texts[changeId] === text) return s;
          return { ...s, docs: { ...s.docs, [docId]: { ...doc, texts: { ...doc.texts, [changeId]: text } } } };
        }),
      sign: (docId, name) =>
        update((s) => {
          const doc = s.docs[docId] ?? { statuses: {}, texts: {} };
          return { ...s, docs: { ...s.docs, [docId]: { ...doc, signedBy: name, signedAt: new Date().toISOString() } } };
        }),
      resetDoc: (docId) =>
        update((s) => {
          if (!s.docs[docId]) return s;
          const docs = { ...s.docs };
          delete docs[docId];
          return { ...s, docs };
        }),
      startRun: (ids) => update((s) => ({ ...s, queue: ids.filter((id, i) => ids.indexOf(id) === i) })),
      nextInQueue: (docId) => {
        const i = store.queue.indexOf(docId);
        return i >= 0 && i + 1 < store.queue.length ? store.queue[i + 1] : null;
      },
      clearQueue: () => update((s) => (s.queue.length ? { ...s, queue: [] } : s)),
      resetAll: () => update(() => EMPTY),
    }),
    [store, hydrated],
  );

  return <ReviewContext.Provider value={api}>{children}</ReviewContext.Provider>;
}

export function useReview(): ReviewApi {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReview must be used inside <ReviewProvider> (app/layout.tsx)");
  return ctx;
}
