"use client";

import { Fragment } from "react";
import { changeById, type ReviewDocument } from "@/lib/review/documents";
import type { DocReview, Status } from "@/lib/review/provider";
import { statusOf, textOf } from "@/lib/review/state";
import { ClauseRow } from "./clause-row";
import { DecisionRow } from "./decision-row";

function Legend() {
  return (
    <div className="legend">
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--struck" />
        <span className="legend__label">Struck</span>
      </div>
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--inserted" />
        <span className="legend__label">Inserted</span>
      </div>
      <div className="legend__item">
        <span className="legend__swatch legend__swatch--bar" />
        <span className="legend__label">Modified clause</span>
      </div>
      <span className="legend__hint">Clauses stay level · one scroll · Y accept · N reject · ↓ next</span>
    </div>
  );
}

interface Props {
  doc: ReviewDocument;
  review: DocReview | undefined;
  selected: string;
  onSelect: (id: string) => void;
  onSetStatus: (id: string, status: Status) => void;
  onSetText: (id: string, text: string) => void;
}

export function ComparePane({ doc, review, selected, onSelect, onSetStatus, onSetText }: Props) {
  const lastChange = doc.changes[doc.changes.length - 1]?.id;

  return (
    <section className="compare" aria-label="Original and revised clauses">
      <Legend />

      <div className="columns">
        <div className="columns__cell">
          <span className="columns__title">Original</span>
          <span className="columns__note">{doc.originalLabel}</span>
        </div>
        <div className="columns__cell">
          <span className="columns__title">AI revised</span>
          <span className="columns__note">{doc.revisedLabel}</span>
        </div>
      </div>

      <div className="scroll">
        <div className="sheet">
          <div className="cell cell--kicker">
            <div className="doc__kicker">{doc.kind}</div>
          </div>
          <div className="cell cell--kicker">
            <div className="doc__kicker">{doc.kind}</div>
          </div>

          {doc.sections.map((section, sectionIndex) => {
            const headingClass = `cell ${sectionIndex === 0 ? "cell--heading-first" : "cell--heading"}`;
            return (
              <Fragment key={section.heading}>
                <div className={headingClass}>
                  <h5 className="doc__heading">{section.heading}</h5>
                </div>
                <div className={headingClass}>
                  <h5 className="doc__heading">{section.heading}</h5>
                </div>

                {section.clauses.map((clause) => {
                  const id = clause.changeId;
                  const change = id ? changeById(doc, id) : undefined;
                  const status = id ? statusOf(review, id) : "open";
                  const isSelected = id === selected;

                  return (
                    <Fragment key={clause.number}>
                      <ClauseRow
                        clause={clause}
                        change={change}
                        status={status}
                        selected={isSelected}
                        text={id ? textOf(doc, review, id) : ""}
                        onSelect={() => id && onSelect(id)}
                        onCommitText={(text) => id && onSetText(id, text)}
                      />
                      {id && (
                        <DecisionRow
                          status={status}
                          selected={isSelected}
                          last={id === lastChange}
                          clauseLabel={clause.number}
                          onAccept={() => onSetStatus(id, "accepted")}
                          onReject={() => onSetStatus(id, "rejected")}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
