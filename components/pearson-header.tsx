import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  /** Under the brand name, e.g. "Regulatory impact" or "Contract review". */
  kicker: string;
  /** Bold title in the document slot, e.g. the matter or the file name. */
  title: string;
  /** Dim text after the title, e.g. "Matter 2026-114". */
  meta?: string;
  /** Uppercase status text before the action buttons, e.g. "Clause 2 of 3 · 1 open". */
  position?: string;
  /** Buttons/links rendered on the right. */
  actions?: ReactNode;
}

/**
 * The navy top bar shared by every route. The brand always links home so
 * there is a deterministic way back from any step.
 */
export function PearsonHeader({ kicker, title, meta, position, actions }: Props) {
  return (
    <header className="ph">
      <Link href="/" className="ph__brand" aria-label="Pearson — back to the regulatory workspace">
        <span className="ph__name">Pearson</span>
        <span className="ph__kicker">{kicker}</span>
      </Link>
      <span className="ph__divider" />
      <div className="ph__doc">
        <span className="ph__title">{title}</span>
        {meta && <span className="ph__meta">{meta}</span>}
      </div>
      <div className="ph__actions">
        {position && (
          <span className="ph__position" aria-live="polite">
            {position}
          </span>
        )}
        {actions}
      </div>
    </header>
  );
}
