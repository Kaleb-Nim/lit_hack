"use client";

import { FileText } from "lucide-react";
import type { EditableParagraph } from "@/lib/docx-working-copy";

type Props = {
  fileName: string;
  title: string;
  subtitle: string;
  paragraphs: EditableParagraph[];
  /** Accepted amendments and manual edits, keyed by source paragraph index. */
  edits: Record<number, string>;
  /** Accepted insertions, keyed by suggestion id — appended at the end, as they are in the .docx. */
  insertions: Record<string, string>;
};

/**
 * The working copy read as one continuous document rather than clause by
 * clause: every accepted amendment is already in the body text, insertions
 * sit at the end, and anything rejected or still undecided keeps the R2
 * source wording. This is the same content `buildWorkingCopy` writes into
 * the downloaded .docx, so what is on screen is what downloads.
 */
export function ContractFullDocument({ fileName, title, subtitle, paragraphs, edits, insertions }: Props) {
  const inserted = Object.entries(insertions).filter(([, value]) => value.trim());
  const amended = paragraphs.filter((paragraph) => (edits[paragraph.index] ?? paragraph.text) !== paragraph.text);

  const summary = amended.length + inserted.length === 0
    ? "No changes applied yet — this is the R2 source wording"
    : `${amended.length} amended · ${inserted.length} inserted · everything else unchanged`;

  return <div className="contract-final">
    <div className="contract-final__bar">
      <span className="contract-final__title">Full document</span>
      <span className="contract-final__meta">{fileName} · every accepted change applied</span>
      <span className="contract-final__note">{summary}</span>
    </div>

    <div className="contract-final__scroll">
      <article className="word-paper contract-final__paper">
        <div className="word-paper__title">
          <FileText size={18} />
          <div><strong>{title}</strong><small>{subtitle}</small></div>
        </div>

        {paragraphs.map((paragraph) => {
          const value = edits[paragraph.index] ?? paragraph.text;
          const changed = value !== paragraph.text;
          return <p key={paragraph.index} className={`contract-final__para${changed ? " amended" : ""}`}>
            {changed && <span className="contract-final__mark">Amended</span>}
            {value}
          </p>;
        })}

        {inserted.map(([id, value]) => <p key={id} className="contract-final__para inserted">
          <span className="contract-final__mark">Inserted</span>
          {value}
        </p>)}
      </article>

      <p className="contract-final__footnote">
        The R2 original is untouched. This is the wording that goes into the Word working copy you download.
      </p>
    </div>
  </div>;
}
