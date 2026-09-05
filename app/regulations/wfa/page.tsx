import Link from "next/link";
import { DownloadButton } from "@/app/download-button";
import { PearsonHeader } from "@/components/pearson-header";
import type { DocModel } from "@/lib/docx-model";
import { regulationById } from "@/lib/regulatory-workspace";
import { SummaryDocumentFilter } from "@/app/components/summary-document-filter";
import { LegislativeLifecycle } from "@/app/components/legislative-lifecycle";
import "../../summary.css";

const wfa = regulationById("WFA2025");

const summary: DocModel = {
  title: "Workplace Fairness Act 2025 readiness summary",
  description: "Readiness summary for Singapore employment documents and processes",
  blocks: [
    { kind: "kicker", text: "Singapore employment law" },
    { kind: "title", text: "Workplace Fairness Act 2025 readiness summary" },
    { kind: "subtitle", text: "Act 8 of 2025 · uncommenced as at 6 September 2026" },
    { kind: "heading", text: "Executive summary", level: 1 },
    { kind: "para", text: "The Workplace Fairness Act 2025 has been passed but is not yet in force. It establishes statutory protections against workplace discrimination in hiring, during employment, and in dismissal, retrenchment or termination." },
    { kind: "para", text: "The Act also addresses discriminatory directions, policies and advertisements, fair consideration, grievance handling and retaliation. Existing employment templates and processes can be assessed now as readiness work, but findings must not be described as breaches of a law already in force." },
    { kind: "heading", text: "Priority readiness areas", level: 1 },
    ...wfa.obligations.flatMap((item) => [
      { kind: "heading" as const, text: `${item.ref} ${item.title}`, level: 2 as const },
      { kind: "para" as const, text: item.detail },
    ]),
  ],
};

const readiness = [
  { ref: "ss. 5–7, 17–19", title: "Employment decisions and discrimination", action: "Review recruitment, promotion, performance, dismissal and retrenchment wording for decisions tied to protected characteristics.", why: "The Act addresses discrimination across the employment lifecycle, including discriminatory policies and advertisements." },
  { ref: "ss. 8–16", title: "Protected characteristics", action: "Map equal-opportunity wording and decision records to the statutory characteristic definitions.", why: "The Act defines protected characteristics including nationality, sex, marital status, pregnancy, caregiving responsibilities, language ability, disability and mental health condition." },
  { ref: "s. 26", title: "Fair consideration", action: "Document fair consideration in hiring and promotion workflows and identify evidence retained for review.", why: "Fair consideration is a distinct fair-employment-practice requirement in Part 6." },
  { ref: "ss. 27–28", title: "Grievance handling and retaliation", action: "Check grievance channels, confidentiality, investigation steps and anti-retaliation clauses in policies and employment documents.", why: "The Act separately addresses grievance handling and prohibits retaliation." },
];

export default function WorkplaceFairnessPage() {
  return <div className="shell">
    <PearsonHeader kicker="Regulatory readiness" title="Workplace Fairness Act 2025" meta="Singapore employment" actions={<><Link href="/" className="btn btn--outline-light">← Main workspace</Link><DownloadButton filename="WFA_2025_Readiness_Summary.docx" model={summary} label="Download summary" className="btn btn--outline-light" /><Link href="/contracts?regulation=WFA2025" className="btn btn--gold">R2 contracts →</Link></>} />
    <main className="shell__main"><div className="summary"><div className="summary__col">
      <section className="hero"><div className="hero__row"><span className="hero__tag">Readiness horizon</span><span className="hero__gazette">Act 8 of 2025 · uncommenced as at 6 Sep 2026</span><span className="hero__position">4 readiness areas</span></div><div className="hero__jurisdiction">Singapore · Employment</div><h1 className="hero__title">Workplace Fairness Act 2025</h1><p className="hero__lede">The Act is real and passed, but not yet in force. Pearson separates future-readiness work from current legal obligations so the team can prepare contracts without creating false breach findings.</p></section>
      <section className="card exec"><div className="eyebrow">Executive summary</div><p className="exec__para">The Act establishes protections against workplace discrimination in hiring, during employment, and in dismissal, retrenchment or termination. It also covers discriminatory directions, policies and advertisements.</p><p className="exec__para">Part 6 adds fair consideration, grievance-handling and anti-retaliation requirements. Current templates can be reviewed now, with every proposed change labelled as readiness work until commencement.</p><div className="exec__foot"><span className="exec__prepared">Verified against the official uncommenced Act on Singapore Statutes Online</span><a href={wfa.sourceUrl} target="_blank" rel="noreferrer" className="btn btn--ghost">Open official text</a></div></section>
      <LegislativeLifecycle events={wfa.lifecycle} />
      <div className="cta"><Link href="/contracts?regulation=WFA2025" className="cta__main"><span className="cta__text"><span className="cta__title">Review employment documents</span><span className="cta__blurb">Open matching R2 contracts. Editable `.docx` files become local working copies; source files remain untouched.</span></span><span className="cta__right"><span className="cta__count">WFA</span><span className="cta__pill">Open contracts →</span></span></Link></div>
      <div className="legend"><h2 className="legend__title" style={{margin:0}}>Readiness areas</h2><span className="legend__sub">Preparation only until commencement</span></div>
      {readiness.map((item) => <article className="card ob ob--action" key={item.ref}><span className="ob__bar"/><div className="ob__body"><div className="ob__head"><span className="eyebrow">{item.ref}</span><span className="chip ob__sev">Readiness review</span><span className="ob__deadline">Uncommenced</span></div><h2 className="ob__title">{item.title}</h2><div className="ob__grid"><div className="ob__col ob__col--action"><div className="eyebrow">Action</div><p>{item.action}</p></div><div className="ob__col ob__col--what"><div className="eyebrow">Why it matters</div><p>{item.why}</p></div></div><div className="ob__foot"><Link href="/contracts?regulation=WFA2025" className="ob__docs">Review matching contracts →</Link></div></div></article>)}
      <SummaryDocumentFilter regulationId="WFA2025" />
    </div></div></main>
  </div>;
}
