import Link from "next/link";
import { LarpHeader } from "@/components/larp-header";
import { FlowSteps } from "@/components/flow-steps";
import {
  EXECUTIVE_SUMMARY,
  OBLIGATIONS,
  REGULATION,
  type Obligation,
} from "@/lib/pdpa/data";
import type { DocBlock, DocModel } from "@/lib/docx-model";
import { DownloadButton } from "@/app/download-button";
import { SummaryDocumentFilter } from "@/app/components/summary-document-filter";
import { LegislativeLifecycle } from "@/app/components/legislative-lifecycle";
import { RegulatorySourceBriefing } from "@/app/components/regulatory-source-briefing";
import { REGULATORY_JOURNEYS } from "@/lib/regulatory-journey";
import { regulationById } from "@/lib/regulatory-workspace";
import "../../summary.css";

const pdpaWorkspace = regulationById("PDPA2012");

/* ── Word memos ─────────────────────────────────────────────────── */

/** "s. 26D — Notifiable breaches" → "26D" (matches the original export filenames). */
const refCode = (ref: string) => (ref.split(" ")[1] ?? ref).replace(".", "");

function obligationBlocks(o: Obligation): DocBlock[] {
  return [
    { kind: "heading", text: o.ref, level: 2 },
    { kind: "para", text: o.title, italic: true },
    { kind: "label", label: "Severity", text: o.severity },
    { kind: "label", label: "Deadline", text: o.deadline },
    { kind: "heading", text: "Action", level: 3 },
    { kind: "para", text: o.action },
    { kind: "heading", text: "What changes", level: 3 },
    { kind: "para", text: o.what },
    { kind: "heading", text: "Exposure if unchanged", level: 3 },
    { kind: "para", text: o.risk },
    { kind: "heading", text: "Policies modified", level: 3 },
    ...o.policies.map<DocBlock>((p) => ({ kind: "bullet", strong: `${p.name}, ${p.clause}:`, text: p.change })),
  ];
}

function frontMatter(title: string): DocBlock[] {
  return [
    { kind: "kicker", text: REGULATION.jurisdiction },
    { kind: "title", text: title },
    { kind: "subtitle", text: REGULATION.gazette },
    { kind: "subtitle", text: REGULATION.preparedLine },
    { kind: "rule" },
  ];
}

function summaryMemo(): DocModel {
  const actionCount = OBLIGATIONS.filter((o) => o.severity === "Action required").length;
  const title = `${REGULATION.title} — impact summary`;
  return {
    title,
    description: "Verified Singapore PDPA impact summary",
    blocks: [
      ...frontMatter(title),
      { kind: "heading", text: "Executive summary", level: 1 },
      ...EXECUTIVE_SUMMARY.map<DocBlock>((p) => ({ kind: "para", text: p })),
      { kind: "para", text: `${OBLIGATIONS.length} change areas · ${actionCount} require current drafting review · source contracts are loaded separately from R2`, italic: true, muted: true },
      { kind: "heading", text: "Key actionable items", level: 1 },
      ...OBLIGATIONS.flatMap(obligationBlocks),
    ],
  };
}

function obligationMemo(o: Obligation): DocModel {
  const title = `${REGULATION.title} — ${o.ref}`;
  return { title, description: o.title, blocks: [...frontMatter(title), ...obligationBlocks(o)] };
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function SummaryPage() {
  const actionCount = OBLIGATIONS.filter((o) => o.severity === "Action required").length;
  const position = `${OBLIGATIONS.length} change areas · ${actionCount} require review · live R2 library`;
  return (
    <div className="shell">
      <LarpHeader
        kicker="Regulatory impact"
        title="Personal Data Protection Act 2012"
        meta="Singapore · current"
        actions={
          <>
            <Link href="/" className="btn btn--outline-light">
              ← Main workspace
            </Link>
            <DownloadButton
              filename="PDPA_2020_Impact_Summary_Meridian.docx"
              model={summaryMemo()}
              label="Download summary"
              className="btn btn--outline-light"
            />
            <Link href="/contracts?regulation=PDPA2012" className="btn btn--gold">
              R2 contracts →
            </Link>
          </>
        }
      />
      <FlowSteps current="summary" hrefs={{}} />

      <main className="shell__main">
        <div className="summary">
          <div className="summary__col">
            {/* Hero */}
            <section className="hero" aria-labelledby="hero-title">
              <div className="hero__row">
                <span className="hero__tag">Regulation change</span>
                <span className="hero__gazette">{REGULATION.gazette}</span>
                <span className="hero__position">{position}</span>
              </div>
              <div className="hero__jurisdiction">{REGULATION.jurisdiction}</div>
              <h1 id="hero-title" className="hero__title">
                {REGULATION.title}
              </h1>
              <p className="hero__lede">{REGULATION.summary}</p>
            </section>

            {/* Executive summary */}
            <section className="card exec" aria-labelledby="exec-title">
              <div id="exec-title" className="eyebrow">
                Executive summary
              </div>
              {EXECUTIVE_SUMMARY.map((p, i) => (
                <p key={i} className="exec__para">
                  {p}
                </p>
              ))}
              <div className="exec__foot">
                <span className="exec__prepared">{REGULATION.preparedLine}</span>
                <DownloadButton filename="PDPA_2020_Impact_Summary_Meridian.docx" model={summaryMemo()} label="Download summary" />
              </div>
            </section>

            <LegislativeLifecycle events={pdpaWorkspace.lifecycle} />
            <RegulatorySourceBriefing journey={REGULATORY_JOURNEYS.PDPA2012} />

            {/* Primary call to action */}
            {/* <div className="cta">
              <Link href="/contracts?regulation=PDPA2012" className="cta__main">
                <span className="cta__text">
                  <span className="cta__title">Review the source contracts</span>
                  <span className="cta__blurb">
                    Open the live R2 library, edit supported Word documents as browser-only working copies, and download without changing the source object.
                  </span>
                </span>
                <span className="cta__right">
                  <span className="cta__count">R2</span>
                  <span className="cta__pill">Open contracts →</span>
                </span>
              </Link>
              <Link href="/" className="cta__secondary">
                Switch regulation or return to the shared legal workspace →
              </Link>
            </div> */}

            {/* Legend */}
            <div className="legend">
              <h2 className="legend__title" style={{ margin: 0 }}>
                Key actionable items
              </h2>
              <span className="legend__sub">Five obligations, ordered by deadline</span>
              <span className="legend__swatch">
                <span className="legend__bar" style={{ background: "var(--crimson)" }} />
                <span className="legend__label">Action required</span>
              </span>
              <span className="legend__swatch">
                <span className="legend__bar" style={{ background: "rgba(176,135,63,.42)" }} />
                <span className="legend__label">Monitor only</span>
              </span>
            </div>

            {/* Obligation cards */}
            {OBLIGATIONS.map((o) => (
              <ObligationCard key={o.id} obligation={o} />
            ))}
            <SummaryDocumentFilter regulationId="PDPA2012" />
          </div>
        </div>
      </main>
    </div>
  );
}

function ObligationCard({ obligation: o }: { obligation: Obligation }) {
  const action = o.severity === "Action required";
  return (
    <article className={`card ob${action ? " ob--action" : ""}`} aria-labelledby={`${o.id}-title`}>
      <span className="ob__bar" aria-hidden="true" />
      <div className="ob__body">
        <div className="ob__head">
          <span className="eyebrow">{o.ref}</span>
          <span className="chip ob__sev">{o.severity}</span>
          <span className="ob__deadline">{o.deadline}</span>
        </div>

        <h3 id={`${o.id}-title`} className="ob__title">
          {o.title}
        </h3>

        <div className="ob__grid">
          <div className="ob__col ob__col--action">
            <div className="eyebrow">Action</div>
            <p>{o.action}</p>
          </div>
          <div className="ob__col ob__col--what">
            <div className="eyebrow">What changes</div>
            <p>{o.what}</p>
          </div>
          <div className="ob__col ob__col--risk">
            <div className="eyebrow">Exposure if unchanged</div>
            <p>{o.risk}</p>
          </div>
        </div>

        <div className="eyebrow ob__policies-label">Policies modified</div>
        <div className="ob__policies">
          {o.policies.map((p) => (
            <div key={`${p.name}-${p.clause}`} className="ob__policy">
              <span className="ob__policy-id">
                <span className="ob__policy-name">{p.name}</span>
                <span className="ob__policy-clause">{p.clause}</span>
              </span>
              <span className="ob__policy-change">{p.change}</span>
            </div>
          ))}
        </div>

        <div className="ob__foot">
          <Link href="/contracts?regulation=PDPA2012" className="ob__docs">
            Open matching R2 contracts →
          </Link>
          <DownloadButton filename={`PDPA_2020_${refCode(o.ref)}_memo.docx`} model={obligationMemo(o)} label="Download memo" />
        </div>
      </div>
    </article>
  );
}
