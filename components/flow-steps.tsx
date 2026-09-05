import Link from "next/link";

export type FlowStep = "summary" | "clauses" | "document" | "run";

const STEPS: { id: FlowStep; label: string }[] = [
  { id: "summary", label: "Summary & key pointers" },
  { id: "clauses", label: "Clauses" },
  { id: "document", label: "Full document & sign" },
  { id: "run", label: "Similar cases & run" },
];

/**
 * The four-step breadcrumb under the header. Steps before the current one
 * link to their route so the reviewer can go back without the browser
 * button; later steps are inert.
 */
export function FlowSteps({ current, hrefs }: { current: FlowStep; hrefs: Partial<Record<FlowStep, string>> }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <nav className="steps" aria-label="Review flow">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const href = done ? hrefs[step.id] : undefined;
        const inner = (
          <>
            <span className="steps__num">{done ? "✓" : i + 1}</span>
            {step.label}
          </>
        );
        return (
          <span key={step.id} style={{ display: "contents" }}>
            {i > 0 && <span className="steps__sep" aria-hidden="true">→</span>}
            {href ? (
              <Link href={href} className="steps__item" data-done="true">
                {inner}
              </Link>
            ) : (
              <span className="steps__item" aria-current={i === currentIndex ? "step" : undefined} data-done={done}>
                {inner}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
