import { ArrowUpRight, Landmark, Newspaper } from "lucide-react";
import type { RegulatoryJourney } from "@/lib/regulatory-journey";

export function RegulatorySourceBriefing({ journey }: { journey: RegulatoryJourney }) {
  return (
    <section className="card source-briefing" aria-labelledby="source-briefing-title">
      <header className="source-briefing__head">
        <div>
          <span className="eyebrow"><Landmark size={15} aria-hidden="true" />Legislative source briefing</span>
          <h2 id="source-briefing-title">Why the Act was passed</h2>
        </div>
        <span>{journey.sources.length} selected sources</span>
      </header>

      <div className="source-briefing__rationale">
        <ol>
          {journey.whyPassed.map((reason) => <li key={reason}>{reason}</li>)}
        </ol>
        <p><strong>How to use this:</strong> {journey.workflowUse}</p>
      </div>

      <div className="source-briefing__sources">
        {journey.sources.map((source) => (
          <a href={source.url} target="_blank" rel="noreferrer" key={`${source.publisher}-${source.title}`}>
            <span className={`source-briefing__kind source-briefing__kind--${source.kind.toLowerCase().replaceAll(" ", "-")}`}>
              {source.kind === "Official record" ? <Landmark size={13} aria-hidden="true" /> : <Newspaper size={13} aria-hidden="true" />}
              {source.kind}
            </span>
            <span className="source-briefing__meta">{source.date} · {source.publisher}</span>
            <strong>{source.title}</strong>
            <p>{source.takeaway}</p>
            <span className="source-briefing__open">Open source <ArrowUpRight size={13} aria-hidden="true" /></span>
          </a>
        ))}
      </div>
    </section>
  );
}
