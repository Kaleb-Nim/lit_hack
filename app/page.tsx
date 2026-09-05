import Link from "next/link";
import { PearsonHeader } from "@/components/pearson-header";
import { FlowSteps } from "@/components/flow-steps";
import {
  EXECUTIVE_SUMMARY,
  FILES,
  FILE_BY_ID,
  FIRST_DOC_ID,
  OBLIGATIONS,
  REGULATION,
  type Obligation,
} from "@/lib/pdpa/data";
import type { DocBlock, DocModel } from "@/lib/docx-model";
import { DownloadButton } from "./download-button";
import "./summary.css";

/* ── Word memos ─────────────────────────────────────────────────── */

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "s. 26D — Notifiable breaches" → "26D" (matches the original export filenames). */
const refCode = (ref: string) => (ref.split(" ")[1] ?? ref).replace(".", "");

function obligationBlocks(o: Obligation): DocBlock[] {
  return [
    { kind: "heading", text: o.ref, level: 2 },
    { kind: "para", text: o.title, italic: true },
    { kind: "label", label: "Severity", text: o.severity },
    { kind: "label", label: "Deadline", text: o.deadline },
    { kind: "label", label: "Owner", text: o.owner },
    { kind: "heading", text: "Action", level: 3 },
    { kind: "para", text: o.action },
    { kind: "heading", text: "What changes", level: 3 },
    { kind: "para", text: o.what },
    { kind: "heading", text: "Exposure if unchanged", level: 3 },
    { kind: "para", text: o.risk },
    { kind: "heading", text: "Policies modified", level: 3 },
    ...o.policies.map<DocBlock>((p) => ({ kind: "bullet", strong: `${p.name}, ${p.clause}:`, text: p.change })),
    { kind: "heading", text: `Documents affected (${o.docs.length})`, level: 3 },
    ...o.docs.map<DocBlock>((d) => {
      const f = FILE_BY_ID[d.docId];
      return { kind: "bullet", strong: f.file, text: `(${f.path}) — ${d.clauses}` };
    }),
  ];
}

function frontMatter(title: string): DocBlock[] {
  return [
    { kind: "kicker", text: REGULATION.jurisdiction },
    { kind: "title", text: title },
    { kind: "subtitle", text: REGULATION.gazette },
    { kind: "subtitle", text: `${REGULATION.client} · ${REGULATION.matter}` },
    { kind: "subtitle", text: REGULATION.preparedLine },
    { kind: "rule" },
  ];
}

function summaryMemo(): DocModel {
  const actionCount = OBLIGATIONS.filter((o) => o.severity === "Action required").length;
  const title = `${REGULATION.title} — impact summary`;
  return {
    title,
    description: `Impact summary for ${REGULATION.client}, ${REGULATION.matter}`,
    blocks: [
      ...frontMatter(title),
      { kind: "heading", text: "Executive summary", level: 1 },
      ...EXECUTIVE_SUMMARY.map<DocBlock>((p) => ({ kind: "para", text: p })),
      { kind: "para", text: `${OBLIGATIONS.length} obligations · ${actionCount} require drafting · ${FILES.length} files affected`, italic: true, muted: true },
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
  const position = `${OBLIGATIONS.length} obligations · ${actionCount} require drafting · ${FILES.length} files affected`;
  const first = FILE_BY_ID[FIRST_DOC_ID];
  const matterCount = new Set(FILES.filter((f) => f.type === "Client").map((f) => f.matter)).size;
  const policyCount = FILES.filter((f) => f.type === "Policy").length;

  return (
    <div className="shell">
      <PearsonHeader
        kicker="Regulatory impact"
        title={REGULATION.client}
        meta={REGULATION.matter}
        actions={
          <>
            <DownloadButton
              filename="PDPA_2026_Impact_Summary_Meridian.docx"
              model={summaryMemo()}
              label="Download summary"
              className="btn btn--outline-light"
            />
            <Link href="/files" className="btn btn--gold">
              Affected files →
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
                <DownloadButton filename="PDPA_2026_Impact_Summary_Meridian.docx" model={summaryMemo()} label="Download summary" />
              </div>
            </section>

            {/* Primary call to action */}
            <div className="cta">
              <Link href={`/review/${FIRST_DOC_ID}`} className="cta__main">
                <span className="cta__text">
                  <span className="cta__title">Review the clauses</span>
                  <span className="cta__blurb">
                    Start with {first.file} ({first.clauses}, {first.obligations}) — accept or reject each AI-revised
                    clause, sign, then run the same review across the other {FILES.length - 1} files
                  </span>
                </span>
                <span className="cta__right">
                  <span className="cta__count">{FILES.length}</span>
                  <span className="cta__pill">Review the clauses →</span>
                </span>
              </Link>
              <Link href="/files" className="cta__secondary">
                See all affected files — {FILES.length} documents across {matterCount} client matters, firm precedents
                and {policyCount} policies →
              </Link>
            </div>

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
          <Link href={`/files?obligation=${o.id}`} className="ob__docs">
            {plural(o.docs.length, "document")} affected →
          </Link>
          <span className="ob__meta">·</span>
          <span className="ob__meta">Owner: {o.owner}</span>
          <DownloadButton filename={`PDPA_2026_${refCode(o.ref)}_memo.docx`} model={obligationMemo(o)} label="Download memo" />
        </div>
      </div>
    </article>
  );
}
