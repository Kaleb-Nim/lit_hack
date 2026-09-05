import Link from "next/link";
import { PearsonHeader } from "@/components/pearson-header";
import { FILES, REGULATION } from "@/lib/pdpa/data";

export default function NotFound() {
  return (
    <div className="shell">
      <PearsonHeader kicker="Regulatory impact" title={REGULATION.client} meta={REGULATION.matter} />
      <main className="shell__main">
        <div className="status">
          <section className="card status__card" aria-labelledby="nf-title">
            <div className="eyebrow">Not found</div>
            <h1 id="nf-title" className="status__title">
              That page is not in this matter
            </h1>
            <p className="status__body">
              The address does not match the impact summary, one of the {FILES.length} affected files, or a review
              step. Start again from the summary, or pick a file from the affected-files list.
            </p>
            <div className="status__actions">
              <Link href="/" className="btn btn--gold">
                ← Back to summary
              </Link>
              <Link href="/files" className="btn btn--ghost">
                See all affected files
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
