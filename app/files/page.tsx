import Link from "next/link";
import { PearsonHeader } from "@/components/pearson-header";
import { FlowSteps, type FlowStep } from "@/components/flow-steps";
import {
  FILES,
  FILE_BY_ID,
  OBLIGATION_BY_ID,
  REGULATION,
  isDocId,
  isObligationId,
  similarFiles,
  type DocId,
} from "@/lib/pdpa/data";
import { FilesExplorer, type ExplorerScope } from "./files-explorer";
import "./files.css";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Step 4 — the affected-files explorer and the run.
 *
 * `?obligation=<id>` pre-ticks only that obligation's documents;
 * `?similar=<docId>` pre-ticks every file sharing an obligation with that
 * document and adds a "Back to document" link. Unknown ids fall back to the
 * default (everything ticked) with a small notice rather than a 404 — the
 * page itself is always valid.
 */
export default async function FilesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const obligationParam = first(sp.obligation);
  const similarParam = first(sp.similar);

  let scope: ExplorerScope = { kind: "all" };
  let invalid: string | null = null;
  let similarDocId: DocId | null = null;

  if (similarParam !== undefined) {
    if (isDocId(similarParam)) {
      similarDocId = similarParam;
      const source = FILE_BY_ID[similarParam];
      scope = {
        kind: "similar",
        docId: similarParam,
        file: source.file,
        obligations: source.obligations,
        selected: similarFiles(similarParam).map((f) => f.docId),
      };
    } else {
      invalid = `“${similarParam}” is not a document in this matter — showing all ${FILES.length} files.`;
    }
  } else if (obligationParam !== undefined) {
    if (isObligationId(obligationParam)) {
      const o = OBLIGATION_BY_ID[obligationParam];
      scope = {
        kind: "obligation",
        id: obligationParam,
        ref: o.ref,
        title: o.title,
        selected: o.docs.map((d) => d.docId),
      };
    } else {
      invalid = `“${obligationParam}” is not one of the five obligations — showing all ${FILES.length} files.`;
    }
  }

  const hrefs: Partial<Record<FlowStep, string>> = similarDocId
    ? { summary: "/", clauses: `/review/${similarDocId}`, document: `/review/${similarDocId}/final` }
    : { summary: "/" };

  return (
    <div className="shell">
      <PearsonHeader
        kicker="Regulatory impact"
        title="Affected files"
        meta={`${REGULATION.client} · ${REGULATION.matter}`}
        actions={
          <>
            {similarDocId && (
              <Link href={`/review/${similarDocId}/final`} className="btn btn--outline-light">
                ← Back to document
              </Link>
            )}
            <Link href="/" className="btn btn--outline-light">
              ← Back to summary
            </Link>
          </>
        }
      />
      <FlowSteps current="run" hrefs={hrefs} />
      <main className="shell__main">
        {/* Keyed on the scope so client-side navigation between ?obligation= values resets the ticks. */}
        <FilesExplorer key={`${obligationParam ?? ""}|${similarParam ?? ""}`} scope={scope} invalidNotice={invalid} />
      </main>
    </div>
  );
}
