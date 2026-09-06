"use client";

import type { Change, Clause } from "@/lib/review/documents";
import { railColor, type Status } from "@/lib/review/state";
import { EditableInsertion } from "./editable-insertion";

interface Props {
  clause: Clause;
  change?: Change;
  status: Status;
  selected: boolean;
  text: string;
  onSelect: () => void;
  onCommitText: (text: string) => void;
}

/**
 * One clause, emitted as the two side-by-side grid cells that keep the
 * original and the revision on exactly the same line.
 */
export function ClauseRow({ clause, change, status, selected, text, onSelect, onCommitText }: Props) {
  const rail = change ? railColor(status, selected) : undefined;
  const cellClass = change ? "cell cell--clause-with-actions" : "cell";

  return (
    <>
      <div className={cellClass} data-change-id={change?.id}>
        <div className="clause">
          <span className="clause__bar" style={{ background: rail }} />
          <span className="clause__number">{clause.number}</span>
          <p className="clause__text">
            {clause.before}
            {change && (
              <>
                {change.replaced && (
                  <>
                    {" "}
                    <span className="struck">{change.replaced}</span>
                  </>
                )}
                <span
                  className="caret"
                  title={change.replaced ? "Replacement wording goes here" : "A sentence is inserted here"}
                />
              </>
            )}
            {clause.after}
          </p>
        </div>
      </div>

      <div className={cellClass} data-change-id={change?.id}>
        <div className="clause">
          <span className="clause__bar" style={{ background: rail }} />
          <span className="clause__number">{clause.number}</span>
          <p className="clause__text">
            {clause.before}
            {change && (
              <>
                {" "}
                <EditableInsertion
                  value={text}
                  status={status}
                  label={`Suggested wording for ${change.clause}`}
                  onSelect={onSelect}
                  onCommit={onCommitText}
                />
              </>
            )}
            {clause.after}
          </p>
        </div>
      </div>
    </>
  );
}
