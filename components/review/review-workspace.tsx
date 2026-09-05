"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { FlowSteps } from "@/components/flow-steps";
import { PearsonHeader } from "@/components/pearson-header";
import type { ReviewDocument } from "@/lib/review/documents";
import { useReview, type DocReview, type Status } from "@/lib/review/provider";
import { derive, firstOpenId, nextOpenId, seedFor, stepId } from "@/lib/review/state";
import { ComparePane } from "./compare-pane";
import { SidePanel } from "./side-panel";
import { useReviewKeys } from "./use-review-keys";

function Skeleton() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading review">
      <div className="skeleton__sheet">
        <div className="skeleton__line skeleton__line--short" />
        <div className="skeleton__line" />
        <div className="skeleton__line skeleton__line--mid" />
        <div className="skeleton__line" />
        <div className="skeleton__line skeleton__line--mid" />
        <div className="skeleton__line skeleton__line--short" />
      </div>
    </div>
  );
}

/** Header, step indicator, main region and footer shared by the loading and ready states. */
function ReviewShell({
  doc,
  position,
  footerState,
  children,
}: {
  doc: ReviewDocument;
  position: string;
  footerState: string;
  children: ReactNode;
}) {
  const finalHref = `/review/${doc.id}/final`;
  return (
    <div className="shell">
      <PearsonHeader
        kicker="Contract review"
        title={doc.fileName}
        meta={doc.subtitle}
        position={position}
        actions={
          <>
            <Link href="/" className="btn btn--outline-light">
              ← Back to summary
            </Link>
            <Link href={finalHref} className="btn btn--gold">
              Open full document →
            </Link>
          </>
        }
      />
      <FlowSteps current="clauses" hrefs={{ summary: "/" }} />

      <main className="shell__main review">{children}</main>

      <footer className="footer">
        <span className="footer__meta">{doc.pageCount}</span>
        <span className="footer__meta">{doc.reviewer}</span>
        <span className="footer__state" aria-live="polite">
          {footerState}
        </span>
        <Link href={finalHref} className="btn btn--navy">
          Open full document →
        </Link>
      </footer>
    </div>
  );
}

/**
 * The reviewer proper. Mounted only once the provider has hydrated and the
 * document is seeded, so the initial selection can be computed lazily from
 * the stored statuses. Decisions and edited wording live in the provider;
 * only the selected clause is local.
 */
function ReviewBody({ doc, review }: { doc: ReviewDocument; review: DocReview }) {
  const { setStatus, setText } = useReview();
  const [selected, setSelected] = useState<string>(() => firstOpenId(doc, review));

  const derived = useMemo(() => derive(doc, review, selected), [doc, review, selected]);

  const accept = useCallback(() => setStatus(doc.id, selected, "accepted"), [doc.id, selected, setStatus]);
  const reject = useCallback(() => setStatus(doc.id, selected, "rejected"), [doc.id, selected, setStatus]);
  const next = useCallback(() => setSelected((s) => nextOpenId(doc, review, s)), [doc, review]);
  const prev = useCallback(() => setSelected((s) => stepId(doc, s, -1)), [doc]);

  useReviewKeys({ active: true, onAccept: accept, onReject: reject, onNext: next, onPrev: prev });

  return (
    <ReviewShell doc={doc} position={derived.positionLabel} footerState={derived.footerState}>
      <ComparePane
        doc={doc}
        review={review}
        selected={selected}
        onSelect={setSelected}
        onSetStatus={(id: string, status: Status) => setStatus(doc.id, id, status)}
        onSetText={(id: string, text: string) => setText(doc.id, id, text)}
      />
      <SidePanel
        change={derived.selectedChange}
        status={derived.selectedStatus}
        text={derived.selectedText}
        onEditText={(text) => setText(doc.id, selected, text)}
        onAccept={accept}
        onReject={reject}
        onNextClause={next}
      />
    </ReviewShell>
  );
}

/** Seeds the provider for this document and shows a skeleton until it is ready. */
export function ReviewWorkspace({ doc }: { doc: ReviewDocument }) {
  const { hydrated, getDoc, ensureDoc } = useReview();
  const review = getDoc(doc.id);

  // Seed once sessionStorage has been read, so a stored review is never
  // overwritten by fresh defaults.
  useEffect(() => {
    if (hydrated) ensureDoc(doc.id, seedFor(doc));
  }, [hydrated, doc, ensureDoc]);

  if (!hydrated || !review) {
    return (
      <ReviewShell doc={doc} position="Loading review…" footerState="">
        <Skeleton />
      </ReviewShell>
    );
  }

  return <ReviewBody key={doc.id} doc={doc} review={review} />;
}
