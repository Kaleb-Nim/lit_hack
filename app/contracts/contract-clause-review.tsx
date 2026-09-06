"use client";

import { Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MutableRefObject, type ReactNode } from "react";
import { ComparePane } from "@/components/review/compare-pane";
import { SidePanel } from "@/components/review/side-panel";
import { useReviewKeys } from "@/components/review/use-review-keys";
import type { ContractEditSuggestion, ContractReviewResult } from "@/lib/contract-review-model";
import type { ReviewDocument } from "@/lib/review/documents";
import type { DocReview, Status } from "@/lib/review/provider";

type Props = {
  review: ContractReviewResult;
  accepted: Set<string>;
  skipped: Set<string>;
  onAccept: (suggestion: ContractEditSuggestion) => void;
  onReject: (suggestion: ContractEditSuggestion) => void;
  onUpdateAccepted: (suggestion: ContractEditSuggestion) => void;
  /**
   * The AI drafting assessment above the redline. The .docx workbench hides
   * it — the timer occupies that strip instead — while the PDF
   * workbench, which has no such strip, still shows it.
   */
  showAssessment?: boolean;
  /** Call to action under the side panel, e.g. "open the full document". */
  panelFooter?: ReactNode;
  /**
   * Filled with the "advance to the next clause" action so chrome outside this
   * component (the header button) can drive the selection it owns.
   */
  nextClauseRef?: MutableRefObject<(() => void) | null>;
};

function nextId(suggestions: ContractEditSuggestion[], selected: string, delta = 1) {
  const index = Math.max(0, suggestions.findIndex((suggestion) => suggestion.id === selected));
  return suggestions[(index + delta + suggestions.length) % suggestions.length]?.id ?? "";
}

/**
 * R2-backed clause review using the same comparison primitives and interaction
 * model as `/review/[docId]`. Only accepted wording is handed back to the
 * working-copy builder; the R2 source remains read-only.
 */
function ContractClauseReviewBody({ review, accepted, skipped, onAccept, onReject, onUpdateAccepted, showAssessment = true, panelFooter, nextClauseRef }: Props) {
  const suggestions = review.suggestions;
  const [selected, setSelected] = useState(() => suggestions[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(suggestions.map((suggestion) => [suggestion.id, suggestion.proposedText])),
  );

  const active = suggestions.find((suggestion) => suggestion.id === selected) ?? suggestions[0];
  const statusFor = useCallback(
    (id: string): Status => (accepted.has(id) ? "accepted" : skipped.has(id) ? "rejected" : "open"),
    [accepted, skipped],
  );

  const doc = useMemo<ReviewDocument>(() => ({
    // ComparePane does not use the registry id; this preserves its shared model.
    id: "r2-contract" as ReviewDocument["id"],
    fileName: review.documentTitle,
    kind: review.documentType || "Contract document",
    subtitle: "R2 source · unchanged",
    parties: review.documentTitle,
    executed: "R2 source",
    pageCount: `${suggestions.length} proposed change${suggestions.length === 1 ? "" : "s"}`,
    originalLabel: "R2 source · unchanged",
    revisedLabel: "working copy · click an insertion to edit it",
    signatories: ["", ""],
    reviewer: `AI-assisted review · ${review.model}`,
    sections: [{
      heading: review.documentType || "Proposed amendments",
      clauses: suggestions.map((suggestion, index) => ({
        // The gutter is sized for "1.1". Model clause labels run to a full
        // sentence, so they go in the side-panel eyebrow and the gutter keeps
        // a short ordinal.
        number: String(index + 1),
        before: "",
        after: "",
        changeId: suggestion.id,
      })),
    }],
    changes: suggestions.map((suggestion) => ({
      id: suggestion.id,
      clause: suggestion.clause,
      title: suggestion.action === "insert" ? "Insert a new clause" : "Review proposed amendment",
      rationale: suggestion.reason,
      text: drafts[suggestion.id] ?? suggestion.proposedText,
      replaced: suggestion.originalText || "No equivalent clause was found in the source document.",
      obligationId: "o1",
    })),
  }), [drafts, review, suggestions]);

  const docReview = useMemo<DocReview>(() => ({
    statuses: Object.fromEntries(suggestions.map((suggestion) => [suggestion.id, statusFor(suggestion.id)])),
    texts: Object.fromEntries(suggestions.map((suggestion) => [suggestion.id, drafts[suggestion.id] ?? suggestion.proposedText])),
  }), [drafts, statusFor, suggestions]);

  const accept = useCallback(() => {
    if (!active) return;
    onAccept({ ...active, proposedText: drafts[active.id] ?? active.proposedText });
  }, [active, drafts, onAccept]);
  const reject = useCallback(() => active && onReject(active), [active, onReject]);
  const next = useCallback(() => setSelected((id) => nextId(suggestions, id)), [suggestions]);
  const previous = useCallback(() => setSelected((id) => nextId(suggestions, id, -1)), [suggestions]);

  useReviewKeys({ active: Boolean(active), onAccept: accept, onReject: reject, onNext: next, onPrev: previous });

  useEffect(() => {
    if (!nextClauseRef) return;
    nextClauseRef.current = next;
    return () => { nextClauseRef.current = null; };
  }, [next, nextClauseRef]);

  if (!active) {
    return <div className="contract-review-empty"><Check size={18} />No material drafting changes were identified.</div>;
  }

  const setText = (id: string, text: string) => {
    setDrafts((current) => ({ ...current, [id]: text }));
    const suggestion = suggestions.find((item) => item.id === id);
    if (suggestion && accepted.has(id)) onUpdateAccepted({ ...suggestion, proposedText: text });
  };
  const setStatus = (id: string, status: Status) => {
    const suggestion = suggestions.find((item) => item.id === id);
    if (!suggestion) return;
    if (status === "accepted") onAccept({ ...suggestion, proposedText: drafts[id] ?? suggestion.proposedText });
    else onReject(suggestion);
  };

  return (
    <div className="contract-review-stack">
      {showAssessment && <div className="contract-review-assessment">
        <div><span className="eyebrow">AI drafting assessment</span><p>{review.overallAssessment}</p></div>
        <span>{accepted.size + skipped.size} of {suggestions.length} resolved</span>
      </div>}
      <div className="review contract-clause-review">
        <ComparePane doc={doc} review={docReview} selected={active.id} onSelect={setSelected} onSetStatus={setStatus} onSetText={setText} />
        <div className="contract-review-panel">
          <SidePanel change={doc.changes.find((change) => change.id === active.id) ?? doc.changes[0]} status={statusFor(active.id)} text={drafts[active.id] ?? active.proposedText} onEditText={(text) => setText(active.id, text)} onAccept={accept} onReject={reject} onNextClause={next} footer={panelFooter} showRationale={showAssessment} />
        </div>
      </div>
    </div>
  );
}

export function ContractClauseReview(props: Props) {
  const reviewKey = props.review.suggestions.map((suggestion) => `${suggestion.id}:${suggestion.proposedText}`).join("|");
  return <ContractClauseReviewBody key={reviewKey} {...props} />;
}
