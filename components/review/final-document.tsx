"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { FlowSteps } from "@/components/flow-steps";
import { LarpHeader } from "@/components/larp-header";
import { fileStem } from "@/lib/download";
import { downloadDocx } from "@/lib/docx";
import { changeById, type ReviewDocument } from "@/lib/review/documents";
import { useReview } from "@/lib/review/provider";
import { appliedWording, buildSignedModel, derive, formatDate, seedFor, statusOf } from "@/lib/review/state";

const DEFAULT_SIGNER = "A. Osei";

/**
 * The document as it would export right now: accepted edits are applied,
 * anything still open or rejected keeps its original wording. Below the
 * paper: sign, download, and the two onward steps.
 */
export function FinalDocumentView({ doc }: { doc: ReviewDocument }) {
  const { hydrated, getDoc, ensureDoc, sign, queue, nextInQueue } = useReview();
  const review = getDoc(doc.id);
  const ready = hydrated && review !== undefined;

  const [name, setName] = useState(DEFAULT_SIGNER);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated) ensureDoc(doc.id, seedFor(doc));
  }, [hydrated, doc, ensureDoc]);

  const derived = useMemo(() => derive(doc, review, doc.changes[0].id), [doc, review]);
  const canSign = ready && derived.open === 0 && !derived.signed && name.trim().length > 0;

  const next = ready ? nextInQueue(doc.id) : null;
  const queueIndex = queue.indexOf(doc.id);
  const remaining = queueIndex >= 0 ? queue.length - queueIndex - 1 : 0;

  const clausesHref = `/review/${doc.id}`;
  const stem = fileStem(doc.fileName);

  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    setNote(null);
    try {
      const ok = await downloadDocx(`${stem}_signed.docx`, buildSignedModel(doc, review));
      if (!ok) setNote("Download blocked by the browser — try again or copy the document from the page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shell">
      <LarpHeader
        kicker="Contract review"
        title={doc.fileName}
        meta={doc.subtitle}
        position={ready ? derived.finalPositionLabel : "Loading document…"}
        actions={
          <Link href={clausesHref} className="btn btn--outline-light">
            ← Back to clauses
          </Link>
        }
      />
      <FlowSteps current="document" hrefs={{ summary: "/regulations/pdpa", clauses: clausesHref }} />

      <main className="shell__main review">
        <section className="final" aria-label="Full document">
          <div className="finalBar">
            <span className="finalBar__title">Full document</span>
            <span className="finalBar__meta">{doc.fileName} · every decision applied</span>
            {ready && derived.signed && <span className="chip chip--signed">Signed</span>}
            <span className="finalBar__note" aria-live="polite">
              {ready ? derived.finalNote : ""}
            </span>
          </div>

          <div className="finalScroll">
            <article className="paper">
              <div className="paper__kicker">{doc.kind}</div>
              <h4 className="paper__title">{doc.parties}</h4>
              <p className="paper__stamp">
                {doc.executed} · amended draft, {ready ? derived.finalStamp : "loading"}
              </p>

              {doc.sections.map((section) => (
                <Fragment key={section.heading}>
                  <h5 className="paper__heading">{section.heading}</h5>
                  {section.clauses.map((clause, i) => {
                    const change = clause.changeId ? changeById(doc, clause.changeId) : undefined;
                    const applied = ready ? appliedWording(doc, review, clause) : (change?.replaced ?? "");
                    const open = change ? statusOf(review, change.id) === "open" : false;
                    const last = i === section.clauses.length - 1;
                    return (
                      <div key={clause.number} className={`paper__clause${last ? " paper__clause--last" : ""}`}>
                        <span className="paper__number">{clause.number}</span>
                        <p className={`paper__text${ready && open ? " paper__text--open" : ""}`}>
                          {clause.before}
                          {applied ? ` ${applied}` : ""}
                          {clause.after}
                        </p>
                      </div>
                    );
                  })}
                </Fragment>
              ))}

              <div className="signatures">
                <div className="signature">
                  <div className="signature__line">{ready && derived.signed ? derived.signedBy : ""}</div>
                  <div className="signature__label">{doc.signatories[0]}</div>
                  {ready && derived.signed && derived.signedAt && (
                    <div className="signature__date">Signed {formatDate(derived.signedAt)}</div>
                  )}
                </div>
                <div className="signature">
                  <div className="signature__line" />
                  <div className="signature__label">{doc.signatories[1]}</div>
                </div>
              </div>
            </article>

            <div className="signBlock" aria-label="Sign and download">
              <div className="signBlock__title">Sign</div>
              {ready && derived.signed ? (
                <div className="signBlock__row">
                  <span className="chip chip--signed">Signed</span>
                  <span className="signBlock__hint">
                    {derived.signedBy} · {derived.signedAt ? formatDate(derived.signedAt) : ""}
                  </span>
                </div>
              ) : (
                <>
                  <div className="signBlock__row">
                    <label className="eyebrow" htmlFor="signer-name">
                      Signing as
                    </label>
                    <input
                      id="signer-name"
                      className="signBlock__input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!ready || derived.open > 0}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="btn btn--gold"
                      disabled={!canSign}
                      onClick={() => sign(doc.id, name.trim())}
                    >
                      Sign document
                    </button>
                  </div>
                  {ready && derived.open > 0 && (
                    <div className="signBlock__hint">
                      Decide every clause before signing — <Link href={clausesHref}>back to the clauses</Link>.
                    </div>
                  )}
                </>
              )}

              <div className="signBlock__rule" />

              <div className="signBlock__row">
                <button
                  type="button"
                  className="btn btn--navy"
                  disabled={!ready || !derived.signed || saving}
                  aria-busy={saving}
                  onClick={save}
                >
                  {saving ? "Preparing .docx…" : "Save / download (.docx)"}
                </button>
                {ready && !derived.signed && <span className="signBlock__hint">Available once the document is signed.</span>}
              </div>
              {note && (
                <div className="signBlock__note" role="alert">
                  {note}
                </div>
              )}
            </div>

            <div className="tally">
              <span className="tally__line" aria-live="polite">
                {ready ? derived.tallyLine : ""}
              </span>
              {next && (
                <span className="tally__remaining">
                  {remaining} remaining in this run
                </span>
              )}
              <div className="tally__actions">
                <Link href="/contracts?regulation=PDPA2012" className="btn btn--gold">
                  Open R2 contract library →
                </Link>
                {next && (
                  <Link href={`/review/${next}`} className="btn btn--navy">
                    Open next document →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Link href={clausesHref} className="btn btn--ghost btn--sm">
          ← Back to clauses
        </Link>
        <span className="footer__meta">{doc.pageCount}</span>
        <span className="footer__meta">{doc.reviewer}</span>
        <span className="footer__state">{ready ? derived.tallyLine : ""}</span>
      </footer>
    </div>
  );
}
