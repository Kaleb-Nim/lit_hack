/**
 * Content for a historical PDPA amendment impact review on the Meridian
 * Labs matter. Ported from the madtom `pdpa-impact-review/data.js` fixture.
 *
 * Every affected file has a stable `docId` slug that doubles as the route
 * segment for `/review/[docId]`. Nothing here is personal data — the matter,
 * parties and reviewers are fictional demo content.
 */

export type ObligationId = "o1" | "o2" | "o3" | "o4" | "o5";
export type Severity = "Action required" | "Monitor";
export type FileType = "Client" | "Article" | "Policy";

export interface PolicyChange {
  name: string;
  clause: string;
  change: string;
}

export interface AffectedDoc {
  /** Route slug — see FILES for the registry. */
  docId: DocId;
  clauses: string;
}

export interface Obligation {
  id: ObligationId;
  /** e.g. "s. 26D — Notifiable breaches" */
  ref: string;
  severity: Severity;
  deadline: string;
  title: string;
  action: string;
  owner: string;
  what: string;
  risk: string;
  policies: PolicyChange[];
  docs: AffectedDoc[];
}

export type DocId =
  | "meridian-mnda-v4"
  | "meridian-client-terms"
  | "cloud-hosting-dpa"
  | "calloway-msa-2026"
  | "employment-agreement-rao-v2"
  | "standard-dpa-form"
  | "standard-employment-form"
  | "standard-mnda-form"
  | "data-protection-policy"
  | "firm-playbook-v2026-1"
  | "outside-counsel-guidelines";

export interface AffectedFile {
  docId: DocId;
  file: string;
  path: string;
  type: FileType;
  client: string;
  matter: string;
  clauses: string;
  /** Human-readable list of the obligations touching this file. */
  obligations: string;
  /** Machine-readable obligation ids, used for "find similar cases". */
  obligationIds: ObligationId[];
}

export const REGULATION = {
  jurisdiction: "Personal Data Protection Act · Singapore",
  title: "Personal Data Protection (Amendment) Act 2020",
  gazette: "Act 40 of 2020 · principal provisions commenced 1 Feb 2021",
  client: "Meridian Labs Pte Ltd",
  matter: "Matter 2026-114",
  preparedLine:
    "Verified 6 Sep 2026 against Singapore Statutes Online and PDPC sources",
  reviewer: "A. Osei, Corporate",
  summary:
    "The 2020 amendment introduced mandatory breach notification, expanded deemed-consent and legitimate-interest pathways, strengthened individual accountability, and enacted a higher financial-penalty ceiling that commenced on 1 October 2022. The enacted data-portability provisions remain uncommenced and are shown as a monitoring item.",
} as const;

export const EXECUTIVE_SUMMARY: string[] = [
  "Mandatory breach notification has applied since 1 February 2021. Processor agreements should require sufficiently prompt escalation to let the organisation assess a suspected breach and, after determining that it is notifiable, notify the PDPC within the statutory three-calendar-day period.",
  "The amendment expanded deemed consent and introduced legitimate interests and business improvement exceptions. Each reliance path needs the relevant assessment, safeguards, and records; it is not a blanket replacement for consent.",
  "The higher financial-penalty framework has applied since 1 October 2022, and individual offences have applied since 1 February 2021. Data portability was enacted in Part 6B but remains uncommenced, so it should be tracked separately from current obligations.",
];

export const OBLIGATIONS: Obligation[] = [
  {
    id: "o1",
    ref: "s. 26D — Notifiable breaches",
    severity: "Action required",
    deadline: "Commenced 1 Feb 2021",
    title: "Mandatory breach notification to the Commission and affected individuals",
    action:
      "Assess suspected breaches promptly. If a breach is determined to be notifiable, notify the PDPC as soon as practicable and no later than three calendar days after that determination; notify affected individuals when required.",
    owner: "A. Osei",
    what:
      "Act 40 of 2020 introduced the statutory breach-notification framework in Part 6A. The three-day clock runs after the organisation determines that a breach is notifiable; the Act did not impose a universal 24-hour processor deadline.",
    risk:
      "A directions order and financial penalty may follow non-compliance. Slow vendor escalation can leave too little time to assess the incident and meet the organisation's post-determination notification deadline.",
    policies: [
      { name: "Data protection policy", clause: "§ 7.2 — Incident reporting", change: "Record the assessment, determination date, PDPC filing owner, and affected-individual notification decision." },
      { name: "Firm playbook v2026.1", clause: "§ 4.6 — Processor obligations", change: "Set a prompt contractual escalation period that leaves enough time for assessment and the statutory filing deadline." },
    ],
    docs: [
      { docId: "meridian-mnda-v4", clauses: "cl. 6.1, 6.4" },
      { docId: "calloway-msa-2026", clauses: "cl. 12.3" },
      { docId: "cloud-hosting-dpa", clauses: "Annex B" },
      { docId: "standard-dpa-form", clauses: "cl. 9" },
    ],
  },
  {
    id: "o2",
    ref: "s. 26F — Data portability",
    severity: "Monitor",
    deadline: "Enacted but not commenced",
    title: "Data-portability provisions awaiting commencement",
    action:
      "Monitor commencement of Part 6B and its implementing regulations. Treat export-assistance drafting as future-readiness work, not as a current statutory duty.",
    owner: "R. Tan",
    what:
      "Act 40 of 2020 enacted Part 6B and the Twelfth Schedule, but those provisions are not in force in the current consolidated Act. There is no announced commencement date in the verified source set.",
    risk:
      "Presenting the provision as currently binding would create false compliance findings. Leaving it untracked could create implementation pressure if a commencement date is later announced.",
    policies: [
      { name: "Data protection policy", clause: "§ 5.4 — Access and correction", change: "Keep a dormant portability procedure clearly marked as not yet in force." },
      { name: "Outside counsel guidelines", clause: "§ 3.1 — Data handling", change: "Consider export assistance as a negotiated operational safeguard, without describing it as a current PDPA requirement." },
    ],
    docs: [
      { docId: "calloway-msa-2026", clauses: "cl. 12.9" },
      { docId: "standard-dpa-form", clauses: "cl. 11" },
      { docId: "cloud-hosting-dpa", clauses: "Annex C" },
    ],
  },
  {
    id: "o3",
    ref: "First Schedule, Part 3 — Legitimate interests",
    severity: "Action required",
    deadline: "Commenced 1 Feb 2021",
    title: "Consent exception for legitimate interests, subject to assessment",
    action:
      "Document a legitimate interests assessment for each processing activity relying on the exception, and record the balancing test outcome.",
    owner: "A. Osei",
    what:
      "The exception permits collection, use, or disclosure without consent where the organisation's legitimate interests outweigh likely adverse effects on individuals, subject to an assessment and reasonable safeguards.",
    risk:
      "Reliance on the exception without a documented assessment is treated as processing without consent — the assessment is the whole defence.",
    policies: [
      { name: "Data protection policy", clause: "§ 3.1 — Basis for processing", change: "New paragraph on the exception and the mandatory written assessment." },
      { name: "Firm playbook v2026.1", clause: "§ 2.4 — Consent drafting", change: "Consent clause gains a carve-out referring to the assessment register." },
    ],
    docs: [
      { docId: "meridian-client-terms", clauses: "cl. 4.2" },
      { docId: "employment-agreement-rao-v2", clauses: "cl. 11.4" },
    ],
  },
  {
    id: "o4",
    ref: "s. 48J — Financial penalties",
    severity: "Monitor",
    deadline: "Current since 1 Oct 2022",
    title: "Penalty ceiling raised to 10% of annual turnover in Singapore",
    action:
      "Reflect the revised ceiling in indemnity caps and insurance schedules; no drafting change is required to the obligation itself.",
    owner: "R. Tan",
    what:
      "For an organisation with annual turnover in Singapore above S$10 million, the maximum is 10% of that turnover; for other organisations, the maximum remains S$1 million.",
    risk:
      "Liability caps set by reference to the old ceiling now understate exposure, leaving the shortfall with the company rather than the counterparty.",
    policies: [
      { name: "Firm playbook v2026.1", clause: "§ 7.3 — Liability caps", change: "Guidance note: caps tied to statutory maxima must be recalculated." },
    ],
    docs: [
      { docId: "calloway-msa-2026", clauses: "cl. 15.2" },
      { docId: "cloud-hosting-dpa", clauses: "cl. 8" },
    ],
  },
  {
    id: "o5",
    ref: "ss. 48D–48F — Individual offences",
    severity: "Monitor",
    deadline: "Commenced 1 Feb 2021",
    title: "Individual offences for knowing or reckless mishandling of personal data",
    action:
      "Reflect the offence in employment terms and the acceptable use policy; brief the matter team at the next training round.",
    owner: "P. Rao",
    what:
      "The amendment introduced offences covering knowing or reckless unauthorised disclosure, unauthorised use for gain or to cause harm, and unauthorised re-identification of anonymised information.",
    risk:
      "Employment terms without an express prohibition make disciplinary action harder to sustain and leave the company exposed to vicarious claims.",
    policies: [
      { name: "Data protection policy", clause: "§ 9.1 — Staff obligations", change: "New prohibition on re-identification and disclosure for personal gain." },
      { name: "Outside counsel guidelines", clause: "§ 4.2 — Personnel", change: "Counsel confirms its personnel are briefed on the offence." },
    ],
    docs: [
      { docId: "employment-agreement-rao-v2", clauses: "cl. 11.4, 11.7" },
      { docId: "standard-employment-form", clauses: "cl. 14" },
    ],
  },
];

export const FILES: AffectedFile[] = [
  { docId: "meridian-mnda-v4", file: "Meridian_MNDA_v4.docx", path: "/Matters/Meridian/2026", type: "Client", client: "Meridian Labs Pte Ltd", matter: "2026-114 · NDA renewal", clauses: "cl. 6.1, 6.4", obligations: "s. 26D breach notice", obligationIds: ["o1"] },
  { docId: "meridian-client-terms", file: "Meridian_Client_Terms.docx", path: "/Matters/Meridian/2026", type: "Client", client: "Meridian Labs Pte Ltd", matter: "2026-114 · NDA renewal", clauses: "cl. 4.2", obligations: "First Schedule legitimate interests", obligationIds: ["o3"] },
  { docId: "cloud-hosting-dpa", file: "Cloud_Hosting_DPA.docx", path: "/Matters/Meridian/2026", type: "Client", client: "Meridian Labs Pte Ltd", matter: "2026-117 · Hosting DPA", clauses: "Annex B, Annex C, cl. 8", obligations: "s. 26D · s. 26F · s. 48J", obligationIds: ["o1", "o2", "o4"] },
  { docId: "calloway-msa-2026", file: "Calloway_MSA_2026.docx", path: "/Matters/Calloway/2026", type: "Client", client: "Calloway Group LLC", matter: "2026-118 · Services renewal", clauses: "cl. 12.3, 12.9, 15.2", obligations: "s. 26D · s. 26F · s. 48J", obligationIds: ["o1", "o2", "o4"] },
  { docId: "employment-agreement-rao-v2", file: "Employment_Agreement_Rao_v2.docx", path: "/Matters/Calloway/2026", type: "Client", client: "Calloway Group LLC", matter: "2026-121 · Employment", clauses: "cl. 11.4, 11.7", obligations: "First Schedule, Part 3 · ss. 48D–48F", obligationIds: ["o3", "o5"] },
  { docId: "standard-dpa-form", file: "Standard_DPA_form.docx", path: "/Templates/Standard forms", type: "Article", client: "Firm precedents", matter: "Firm templates", clauses: "cl. 9, cl. 11", obligations: "s. 26D · s. 26F", obligationIds: ["o1", "o2"] },
  { docId: "standard-employment-form", file: "Standard_Employment_form.docx", path: "/Templates/Standard forms", type: "Article", client: "Firm precedents", matter: "Firm templates", clauses: "cl. 14", obligations: "s. 48D mishandling", obligationIds: ["o5"] },
  { docId: "standard-mnda-form", file: "Standard_MNDA_form.docx", path: "/Templates/Standard forms", type: "Article", client: "Firm precedents", matter: "Firm templates", clauses: "cl. 1.1, cl. 6", obligations: "s. 26D breach notice", obligationIds: ["o1"] },
  { docId: "data-protection-policy", file: "Data_protection_policy.docx", path: "/Policies/Data protection", type: "Policy", client: "Firm policies", matter: "Policy register", clauses: "§ 3.1, § 5.4, § 7.2, § 9.1", obligations: "s. 26D · uncommenced s. 26F · First Schedule, Part 3 · ss. 48D–48F", obligationIds: ["o1", "o2", "o3", "o5"] },
  { docId: "firm-playbook-v2026-1", file: "Firm_playbook_v2026.1.docx", path: "/Policies/Playbook", type: "Policy", client: "Firm policies", matter: "Policy register", clauses: "§ 2.4, § 4.6, § 7.3", obligations: "s. 26D · First Schedule, Part 3 · s. 48J", obligationIds: ["o1", "o3", "o4"] },
  { docId: "outside-counsel-guidelines", file: "Outside_counsel_guidelines.docx", path: "/Policies/OCG", type: "Policy", client: "Firm policies", matter: "Policy register", clauses: "§ 3.1, § 4.2", obligations: "s. 26F · s. 48D", obligationIds: ["o2", "o5"] },
];

export const FILE_TYPES: FileType[] = ["Client", "Article", "Policy"];

export const TYPE_TINT: Record<FileType, { background: string; color: string }> = {
  Client: { background: "rgba(15,32,51,.08)", color: "#0f2033" },
  Article: { background: "rgba(176,135,63,.16)", color: "#8a6a2f" },
  Policy: { background: "rgba(20,101,79,.12)", color: "#14654f" },
};

/** The document the summary page's primary call to action opens first. */
export const FIRST_DOC_ID: DocId = "meridian-mnda-v4";

export const FILE_BY_ID: Record<DocId, AffectedFile> = Object.fromEntries(
  FILES.map((f) => [f.docId, f]),
) as Record<DocId, AffectedFile>;

export const OBLIGATION_BY_ID: Record<ObligationId, Obligation> = Object.fromEntries(
  OBLIGATIONS.map((o) => [o.id, o]),
) as Record<ObligationId, Obligation>;

export function isDocId(value: string): value is DocId {
  return Object.prototype.hasOwnProperty.call(FILE_BY_ID, value);
}

export function isObligationId(value: string): value is ObligationId {
  return Object.prototype.hasOwnProperty.call(OBLIGATION_BY_ID, value);
}

/**
 * "Find all similar cases": every other file that shares at least one
 * obligation with `docId`, ordered by how many obligations overlap.
 */
export function similarFiles(docId: DocId): AffectedFile[] {
  const source = FILE_BY_ID[docId];
  if (!source) return [];
  return FILES.filter((f) => f.docId !== docId)
    .map((f) => ({ f, overlap: f.obligationIds.filter((o) => source.obligationIds.includes(o)).length }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .map(({ f }) => f);
}
