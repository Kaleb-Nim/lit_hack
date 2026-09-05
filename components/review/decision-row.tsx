"use client";

import { railColor, type Status } from "@/lib/review/state";
import { Chip } from "./chip";

interface Props {
  status: Status;
  selected: boolean;
  last: boolean;
  clauseLabel: string;
  onAccept: () => void;
  onReject: () => void;
}

/** Accept / reject controls, sitting under the revised column only. */
export function DecisionRow({ status, selected, last, clauseLabel, onAccept, onReject }: Props) {
  const className = `cell${last ? " cell--actions-last" : ""}`;

  return (
    <>
      <div className={className} />
      <div className={className}>
        <div className="clause">
          <span className="clause__bar" style={{ background: railColor(status, selected) }} />
          <span className="clause__number" />
          <div className="decision">
            <Chip status={status} />
            <button
              type="button"
              className="btn btn--sm btn--accept"
              onClick={onAccept}
              aria-label={`Accept the edit to clause ${clauseLabel}`}
            >
              Accept
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={onReject}
              aria-label={`Reject the edit to clause ${clauseLabel}`}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
