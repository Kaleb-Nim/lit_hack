import Link from "next/link";
import { FlowSteps } from "@/components/flow-steps";
import { PearsonHeader } from "@/components/pearson-header";
import { REGULATION } from "@/lib/pdpa/data";

export default function ReviewNotFound() {
  return (
    <div className="shell">
      <PearsonHeader
        kicker="Contract review"
        title="Document not found"
        meta={REGULATION.matter}
        actions={
          <Link href="/" className="btn btn--outline-light">
            ← Back to summary
          </Link>
        }
      />
      <FlowSteps current="clauses" hrefs={{ summary: "/" }} />
      <main className="shell__main nf">
        <div className="nf__card">
          <div className="eyebrow">Not in this matter</div>
          <h1 className="nf__title">That document is not in this matter</h1>
          <p className="nf__body">
            The link points at a file that is not on the {REGULATION.client} impact review. Pick one of the affected
            files instead, or start again from the summary.
          </p>
          <div className="nf__actions">
            <Link href="/files" className="btn btn--gold">
              Browse affected files →
            </Link>
            <Link href="/" className="btn btn--ghost">
              Back to summary
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
