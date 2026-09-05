"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FILES,
  FILE_TYPES,
  TYPE_TINT,
  type AffectedFile,
  type DocId,
  type FileType,
  type ObligationId,
} from "@/lib/pdpa/data";
import { useReview } from "@/lib/review/provider";

export type ExplorerScope =
  | { kind: "all" }
  | { kind: "obligation"; id: ObligationId; ref: string; title: string; selected: DocId[] }
  | { kind: "similar"; docId: DocId; file: string; obligations: string; selected: DocId[] };

type Split = "matter" | "client";

/** Milliseconds between one file's "Ready" and the next. */
const STEP_MS = 350;
/** Gap between committing the run queue and opening the first document. */
const NAV_DELAY_MS = 120;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

interface Run {
  ids: DocId[];
  /** How many of `ids` have reached "Ready". */
  done: number;
}

export function FilesExplorer({ scope, invalidNotice }: { scope: ExplorerScope; invalidNotice: string | null }) {
  const router = useRouter();
  const { startRun, hydrated } = useReview();

  const [types, setTypes] = useState<FileType[]>(FILE_TYPES);
  const [split, setSplit] = useState<Split>("matter");
  const [picked, setPicked] = useState<Set<DocId>>(
    () => new Set(scope.kind === "all" ? FILES.map((f) => f.docId) : scope.selected),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const timers = useRef<number[]>([]);

  const visible = useMemo(() => FILES.filter((f) => types.includes(f.type)), [types]);
  const visiblePicked = useMemo(() => visible.filter((f) => picked.has(f.docId)), [visible, picked]);
  const allPicked = visible.length > 0 && visiblePicked.length === visible.length;
  const canRun = hydrated && visiblePicked.length > 0;

  /* ── timers ─────────────────────────────────────────────────── */
  const clearTimers = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }, []);

  // Leaving the page mid-run must not leave timers firing into an unmounted tree.
  useEffect(() => clearTimers, [clearTimers]);

  const cancelRun = useCallback(() => {
    clearTimers();
    setRun(null);
  }, [clearTimers]);

  const closeDialog = useCallback(() => {
    cancelRun();
    setDialogOpen(false);
  }, [cancelRun]);

  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialogOpen, closeDialog]);

  /* ── the run ────────────────────────────────────────────────── */
  const confirmRun = () => {
    const ids = visiblePicked.map((f) => f.docId);
    if (ids.length === 0 || run) return;
    clearTimers();
    setRun({ ids, done: 0 });
    ids.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setRun((r) => (r ? { ...r, done: i + 1 } : r)), STEP_MS * (i + 1)),
      );
    });
    // Commit the queue first, then navigate on a later tick so the provider's
    // sessionStorage mirror has flushed before any navigation can unload the page.
    timers.current.push(window.setTimeout(() => startRun(ids), STEP_MS * (ids.length + 1)));
    timers.current.push(
      window.setTimeout(() => {
        timers.current = [];
        router.push(`/review/${ids[0]}`);
      }, STEP_MS * (ids.length + 1) + NAV_DELAY_MS),
    );
  };

  /* ── selection ──────────────────────────────────────────────── */
  const toggleType = (t: FileType) =>
    setTypes((cur) => (cur.includes(t) ? cur.filter((v) => v !== t) : [...cur, t]));

  const togglePick = (id: DocId) =>
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAll = () => setPicked(allPicked ? new Set() : new Set(visible.map((f) => f.docId)));

  /* ── grouping ───────────────────────────────────────────────── */
  const groups = useMemo(() => {
    const order: string[] = [];
    const byKey = new Map<string, AffectedFile[]>();
    for (const f of visible) {
      const key = f[split];
      if (!byKey.has(key)) {
        order.push(key);
        byKey.set(key, []);
      }
      byKey.get(key)!.push(f);
    }
    return order.map((name) => {
      const rows = byKey.get(name)!;
      return { name, sub: split === "matter" ? rows[0].client : rows[0].path, rows };
    });
  }, [visible, split]);

  const footLine =
    visible.length === 0
      ? "No file types selected"
      : `${visiblePicked.length} of ${visible.length} shown file${visible.length === 1 ? "" : "s"} selected for review`;

  return (
    <div className="fx">
      {/* Filter bar */}
      <div className="fx__bar">
        <div className="fx__bar-row">
          <h1 className="fx__title" style={{ margin: 0 }}>
            Affected files
          </h1>
          <span className="fx__count">
            {visible.length} of {FILES.length} files shown · {picked.size} selected
          </span>
        </div>

        {scope.kind === "obligation" && (
          <div className="fx__banner" role="status">
            <span className="fx__banner-label">Scoped to {scope.ref}</span>
            <span className="fx__banner-sub">
              {scope.title} · {plural(scope.selected.length, "document")} pre-selected
            </span>
            <Link href="/files">Show all files</Link>
          </div>
        )}
        {scope.kind === "similar" && (
          <div className="fx__banner" role="status">
            <span className="fx__banner-label">Similar to {scope.file}</span>
            <span className="fx__banner-sub">
              {plural(scope.selected.length, "other file")} share its obligations ({scope.obligations})
            </span>
            <Link href={`/review/${scope.docId}/final`}>← Back to document</Link>
          </div>
        )}
        {invalidNotice && (
          <div className="fx__banner fx__banner--warn" role="status">
            <span className="fx__banner-sub">{invalidNotice}</span>
            <Link href="/files">Clear</Link>
          </div>
        )}

        <div className="fx__filters">
          <span className="eyebrow">File type</span>
          {FILE_TYPES.map((t) => {
            const on = types.includes(t);
            const n = FILES.filter((f) => f.type === t).length;
            return (
              <button key={t} type="button" className="fx__chip fx__chip--type" aria-pressed={on} onClick={() => toggleType(t)}>
                {t} ({n})
              </button>
            );
          })}
          <span className="fx__vsep" aria-hidden="true" />
          <span className="eyebrow">Split by</span>
          {(
            [
              ["matter", "Case / matter"],
              ["client", "Client"],
            ] as const
          ).map(([v, label]) => (
            <button key={v} type="button" className="fx__chip fx__chip--split" aria-pressed={split === v} onClick={() => setSplit(v)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrolling pane */}
      <div className="fx__pane">
        <div className="fx__col">
          {visible.length === 0 ? (
            <div className="card fx__empty">
              <span className="fx__empty-title">No files match this filter</span>
              <span className="fx__empty-body">
                Select at least one file type above — Client, Article, or Policy — to list the affected documents.
              </span>
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.name} className="card" aria-label={g.name}>
                <div className="fx__group-head">
                  <span className="fx__group-name">{g.name}</span>
                  <span className="fx__group-sub">{g.sub}</span>
                  <span className="fx__group-count">{plural(g.rows.length, "file")} affected</span>
                </div>
                {g.rows.map((f) => {
                  const on = picked.has(f.docId);
                  return (
                    <button
                      key={f.docId}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      className="fx__row"
                      onClick={() => togglePick(f.docId)}
                    >
                      <span className="fx__tick" aria-hidden="true">
                        {on ? "✓" : ""}
                      </span>
                      <span className="fx__row-main">
                        <span className="fx__row-file">{f.file}</span>
                        <span className="fx__row-path">
                          {f.path} · {f.clauses}
                        </span>
                      </span>
                      <span className="fx__row-obl">{f.obligations}</span>
                      <span className="chip" style={TYPE_TINT[f.type]}>
                        {f.type}
                      </span>
                    </button>
                  );
                })}
              </section>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fx__foot">
        <span className="fx__foot-line">{footLine}</span>
        {hydrated && visiblePicked.length === 0 && (
          <span className="fx__foot-note" role="status">
            Tick at least one file to run the review.
          </span>
        )}
        <div className="fx__foot-actions">
          <button type="button" className="btn btn--ghost" onClick={selectAll} disabled={visible.length === 0}>
            {allPicked ? "Clear selection" : "Select all shown"}
          </button>
          <button type="button" className="btn btn--gold" disabled={!canRun} onClick={() => setDialogOpen(true)}>
            Review {plural(visiblePicked.length, "file")} →
          </button>
        </div>
      </div>

      {dialogOpen && (
        <RunDialog files={visiblePicked} run={run} onCancel={closeDialog} onConfirm={confirmRun} />
      )}
    </div>
  );
}

/* ── Run dialog (port of queueDialog, but the confirm actually runs) ── */

function RunDialog({
  files,
  run,
  onCancel,
  onConfirm,
}: {
  files: AffectedFile[];
  run: Run | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const title = `Personal Data Protection (Amendment) Act 2020 — selected files`;
  const running = run !== null;
  const finished = running && run.done >= run.ids.length;

  return (
    <div
      className="scrim"
      onClick={(e) => {
        // A click on the scrim, outside the dialog body, dismisses it.
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="run-title">
        <div className="dialog__head">
          <div className="eyebrow">{running ? "Running review" : "Send to review"}</div>
          <div id="run-title" className="dialog__title">
            {title}
          </div>
        </div>

        <div className="dialog__body">
          {running ? (
            <>
              <div className="dialog__meter" aria-hidden="true">
                <div className="dialog__meter-fill" style={{ width: `${(run.done / run.ids.length) * 100}%` }} />
              </div>
              <p className="dialog__blurb">
                {finished
                  ? `All ${plural(run.ids.length, "redline")} ready — opening the first document.`
                  : "Preparing redline drafts against every selected document. Each one opens in the review queue for clause-by-clause approval."}
              </p>
              <ol className="dialog__list" aria-live="polite" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {files.map((f, i) => {
                  const state = i < run.done ? "ready" : i === run.done ? "busy" : "queued";
                  return (
                    <li key={f.docId} className={`dialog__item dialog__item--${state}`}>
                      <span className="dialog__item-file">{f.file}</span>
                      <span className="dialog__item-path">{f.clauses}</span>
                      <span className="dialog__item-right">
                        {state === "ready" ? "Ready" : state === "busy" ? "Preparing redline…" : "Queued"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </>
          ) : (
            <>
              <p className="dialog__blurb">
                Redline drafts will be prepared against every document below and opened in the review queue for
                clause-by-clause approval.
              </p>
              <div className="dialog__list">
                {files.map((f) => (
                  <div key={f.docId} className="dialog__item">
                    <span className="dialog__item-file">{f.file}</span>
                    <span className="dialog__item-path">{f.path}</span>
                    <span className="dialog__item-right">{f.clauses}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="dialog__foot">
          <span className="dialog__note">
            {running ? `${run.done} of ${run.ids.length} ready` : `${plural(files.length, "file")} selected for review`}
          </span>
          <div className="dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={finished}>
              Cancel
            </button>
            <button type="button" className="btn btn--gold" onClick={onConfirm} disabled={running || files.length === 0}>
              {running ? (finished ? "Opening…" : "Running…") : "Run review →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
