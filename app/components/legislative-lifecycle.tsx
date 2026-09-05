import { ExternalLink, History } from "lucide-react";

type LifecycleEvent = {
  date: string;
  stage: string;
  title: string;
  description: string;
  sourceUrl: string;
  current?: boolean;
};

export function LegislativeLifecycle({ events }: { events: LifecycleEvent[] }) {
  return (
    <section className="card legislative-lifecycle" aria-labelledby="legislative-lifecycle-title">
      <header className="legislative-lifecycle__head">
        <h2 id="legislative-lifecycle-title"><History size={19} aria-hidden="true" />Legislative lifecycle</h2>
        <span>{events.length} source events</span>
      </header>
      <ol className="legislative-lifecycle__list">
        {events.map((event) => (
          <li className={event.current ? "is-current" : undefined} key={`${event.date}-${event.stage}`}>
            <span className="legislative-lifecycle__rail" aria-hidden="true"><i /></span>
            <time dateTime={event.date}>{event.date}</time>
            <div className="legislative-lifecycle__event">
              <span>{event.stage}</span>
              <strong>{event.title}</strong>
              <p>{event.description}</p>
            </div>
            <a href={event.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open official source for ${event.title}`} title="Open official source">
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
