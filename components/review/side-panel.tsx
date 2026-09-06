"use client";

import type { ReactNode } from "react";
import type { Change } from "@/lib/review/documents";
import type { Status } from "@/lib/review/state";
import { Chip } from "./chip";

interface Props {
  change: Change;
  status: Status;
  text: string;
  onEditText: (text: string) => void;
  onAccept: () => void;
  onReject: () => void;
  onNextClause: () => void;
  /** Optional call to action under the next-clause button, e.g. "open the full document". */
  footer?: ReactNode;
  /**
   * The "why" paragraph under the title. Off on the contract workbench, where
   * model rationales run long enough to squeeze the wording box shut.
   */
  showRationale?: boolean;
}

export function SidePanel({ change, status, text, onEditText, onAccept, onReject, onNextClause, footer, showRationale = true }: Props) {
  return (
    <aside className="panel" aria-label="Selected clause">
      <div className="panel__head">
        <div className="eyebrow">{change.clause}</div>
        <div className="panel__title">{change.title}</div>
        {showRationale && <p className="panel__rationale">{change.rationale}</p>}
      </div>

      <div className="panel__body">
        <label className="eyebrow" htmlFor="suggested-wording">
          Suggested wording
        </label>
        <textarea
          id="suggested-wording"
          className="panel__textarea"
          value={text}
          onChange={(e) => onEditText(e.target.value)}
        />
        <div className="panel__hint">Edit freely — accepting keeps this box.</div>
      </div>

      <div className="panel__foot">
        <div className="panel__status">
          <span className="panel__statusLabel">This clause</span>
          <Chip status={status} />
        </div>
        <div className="panel__buttons">
          <button type="button" className="btn btn--block btn--accept" onClick={onAccept}>
            Accept
          </button>
          <button type="button" className="btn btn--block btn--ghost" onClick={onReject}>
            Reject
          </button>
        </div>
        <button type="button" className="btn btn--gold btn--next-panel" onClick={onNextClause}>
          Go to next clause →
        </button>
        {footer}
      </div>
    </aside>
  );
}
