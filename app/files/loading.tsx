import { LarpHeader } from "@/components/larp-header";
import { REGULATION } from "@/lib/pdpa/data";

export default function Loading() {
  return (
    <div className="shell">
      <LarpHeader kicker="Regulatory impact" title={REGULATION.client} meta={REGULATION.matter} />
      <main className="shell__main">
        <div className="status">
          <section className="card status__card" aria-busy="true" aria-live="polite">
            <div className="eyebrow">Loading</div>
            <h1 className="status__title">Preparing the review…</h1>
            <p className="status__body">Tracing {REGULATION.title} through the Meridian file.</p>
            <div className="status__pulse" aria-hidden="true" />
          </section>
        </div>
      </main>
    </div>
  );
}
