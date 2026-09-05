"use client";

import { useEffect, useRef } from "react";
import { INSERTION, type Status } from "@/lib/review/state";

interface Props {
  value: string;
  status: Status;
  label: string;
  onSelect: () => void;
  onCommit: (text: string) => void;
}

/**
 * The inserted wording, edited in place.
 *
 * Deliberately uncontrolled: React never owns the children, so re-rendering
 * the page (a status chip flipping, the tally updating) can't reset the
 * caret mid-word. The DOM is reconciled with the model only when the model
 * changes underneath us — e.g. the reviewer edits the same clause from the
 * side panel.
 */
export function EditableInsertion({ value, status, label, onSelect, onCommit }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const editable = status !== "rejected";

  useEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== value) el.textContent = value;
  }, [value]);

  return (
    <span
      ref={ref}
      className="insertion"
      style={INSERTION[status]}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      tabIndex={editable ? 0 : -1}
      role={editable ? "textbox" : undefined}
      aria-label={editable ? label : undefined}
      onMouseDown={onSelect}
      onFocus={onSelect}
      onBlur={(e) => onCommit(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        // Insertions are single runs of text; Enter commits rather than
        // splitting the clause into two lines.
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}
