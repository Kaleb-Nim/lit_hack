/**
 * Content for the PDPA (Amendment) Act 2026 impact review on the Meridian
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
  title: "PDPA (Amendment) Act 2026",
  gazette: "Gazetted 12 Aug 2026 · in force 1 Jan 2027",
  client: "Meridian Labs Pte Ltd",
  matter: "Matter 2026-114",
  preparedLine:
    "Prepared 5 Sep 2026 by A. Osei, Corporate · reviewed against firm playbook v2026.1",
  reviewer: "A. Osei, Corporate",
  summary:
    "The amendment shortens the breach notification window to three calendar days, introduces a standalone data portability obligation, permits processing on legitimate interests subject to a documented assessment, and raises the penalty ceiling to 10% of annual turnover in Singapore. Five obligations require drafting changes across the Meridian file.",
} as const;

export const EXECUTIVE_SUMMARY: string[] = [
  "The operative constraint is the notification window. Every processor agreement on the Meridian file currently promises notice “without undue delay”, which cannot reliably support a three-day filing with the Commission. Until those clauses are tightened to a fixed 24-hour processor obligation, the company depends on vendor goodwill to meet a statutory deadline carrying a turnover-based penalty.",
  "Data portability is new rather than amended, so no existing clause covers it. The standard form and the two live vendor agreements need an export assistance clause and a definition of derived data, which sits outside the obligation and should be stated expressly rather than left to argument.",
  "The legitimate interests exception is the one item where the documentation, not the drafting, is the defence: reliance without a retained assessment is treated as processing without consent. The remaining two obligations change exposure rather than duties — fixed liability caps now understate the statutory maximum, and individual mishandling becomes an offence that employment terms should name.",
];

export const OBLIGATIONS: Obligation[] = [
  {
    id: "o1",
    ref: "s. 26D — Notifiable breaches",
    severity: "Action required",
    deadline: "Notice within 3 calendar days",
    title: "Mandatory breach notification to the Commission and affected individuals",
    action:
      "Notify the PDPC within three calendar days of assessing a breach as notifiable, and notify affected individuals on the same day unless an exception applies.",
    owner: "A. Osei",
    what:
      'The assessment window is fixed at 30 days and the notification window shortened from "as soon as practicable" to three calendar days. Notification to individuals can no longer be deferred pending remediation.',
    risk:
      "Financial penalty of up to 10% of annual turnover in Singapore, plus a directions order. Vendor contracts without a matching notice window leave the company unable to meet the statutory deadline.",
    policies: [
      { name: "Data protection policy", clause: "§ 7.2 — Incident reporting", change: 'Replace "without undue delay" with the three-day statutory window; add PDPC filing owner.' },
      { name: "Firm playbook v2026.1", clause: "§ 4.6 — Processor obligations", change: "New fallback: processor must notify controller within 24 hours of discovery." },
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
    severity: "Action required",
    deadline: "Ready by 1 Jan 2027",
    title: "Portability obligation on request by an individual",
    action:
      "Transmit applicable data to another organisation in a commonly used machine-readable format on request, where that organisation has a presence in Singapore.",
    owner: "R. Tan",
    what:
      "A new obligation with no equivalent in the current Act. Applies to data provided by the individual and data generated in the course of the relationship, but not to derived data.",
    risk:
      "Directions to comply plus reputational exposure in the client base. Vendor agreements silent on export assistance will require renegotiation under time pressure.",
    policies: [
      { name: "Data protection policy", clause: "§ 5.4 — Access and correction", change: "New subsection covering portability requests, format, and the 30-day response target." },
      { name: "Outside counsel guidelines", clause: "§ 3.1 — Data handling", change: "Counsel must return matter data in machine-readable form on request." },
    ],
    docs: [
      { docId: "calloway-msa-2026", clauses: "cl. 12.9" },
      { docId: "standard-dpa-form", clauses: "cl. 11" },
      { docId: "cloud-hosting-dpa", clauses: "Annex C" },
    ],
  },
  {
    id: "o3",
    ref: "s. 15A — Legitimate interests",
    severity: "Action required",
    deadline: "Assessment by 1 Nov 2026",
    title: "Consent exception for legitimate interests, subject to assessment",
    action:
      "Document a legitimate interests assessment for each processing activity relying on the exception, and record the balancing test outcome.",
    owner: "A. Osei",
    what:
      "Collection, use, or disclosure without consent is permitted where the legitimate interests of the organisation outweigh any adverse effect on the individual, provided an assessment is conducted and retained.",
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
    deadline: "In force 1 Jan 2027",
    title: "Penalty ceiling raised to 10% of annual turnover in Singapore",
    action:
      "Reflect the revised ceiling in indemnity caps and insurance schedules; no drafting change is required to the obligation itself.",
    owner: "R. Tan",
    what:
      "The maximum financial penalty moves from S$1 million to the higher of S$1 million or 10% of annual turnover in Singapore for organisations with turnover above S$10 million.",
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
    ref: "s. 48D — Egregious mishandling",
    severity: "Monitor",
    deadline: "In force 1 Jan 2027",
    title: "Individual offences for knowing or reckless mishandling of personal data",
    action:
      "Reflect the offence in employment terms and the acceptable use policy; brief the matter team at the next training round.",
    owner: "P. Rao",
    what:
      "Unauthorised disclosure, use for a gain, or re-identification of anonymised data by an individual becomes an offence attracting a fine or imprisonment.",
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
  { docId: "meridian-client-terms", file: "Meridian_Client_Terms.docx", path: "/Matters/Meridian/2026", type: "Client", client: "Meridian Labs Pte Ltd", matter: "2026-114 · NDA renewal", clauses: "cl. 4.2", obligations: "s. 15A legitimate interests", obligationIds: ["o3"] },
  { docId: "cloud-hosting-dpa", file: "Cloud_Hosting_DPA.docx", path: "/Matters/Meridian/2026", type: "Client", client: "Meridian Labs Pte Ltd", matter: "2026-117 · Hosting DPA", clauses: "Annex B, Annex C, cl. 8", obligations: "s. 26D · s. 26F · s. 48J", obligationIds: ["o1", "o2", "o4"] },
  { docId: "calloway-msa-2026", file: "Calloway_MSA_2026.docx", path: "/Matters/Calloway/2026", type: "Client", client: "Calloway Group LLC", matter: "2026-118 · Services renewal", clauses: "cl. 12.3, 12.9, 15.2", obligations: "s. 26D · s. 26F · s. 48J", obligationIds: ["o1", "o2", "o4"] },
  { docId: "employment-agreement-rao-v2", file: "Employment_Agreement_Rao_v2.docx", path: "/Matters/Calloway/2026", type: "Client", client: "Calloway Group LLC", matter: "2026-121 · Employment", clauses: "cl. 11.4, 11.7", obligations: "s. 15A · s. 48D", obligationIds: ["o3", "o5"] },
  { docId: "standard-dpa-form", file: "Standard_DPA_form.docx", path: "/Templates/Standard forms", type: "Article", client: "Firm precedents", matter: "Firm templates", clauses: "cl. 9, cl. 11", obligations: "s. 26D · s. 26F", obligationIds: ["o1", "o2"] },
  { docId: "standard-employment-form", file: "Standard_Employment_form.docx", path: "/Templates/Standard forms", type: "Article", client: "Firm precedents", matter: "Firm templates", clauses: "cl. 14", obligations: "s. 48D mishandling", obligationIds: ["o5"] },
  { docId: "standard-mnda-form", file: "Standard_MNDA_form.docx", path: "/Templates/Standard forms", type: "Article", client: "Firm precedents", matter: "Firm templates", clauses: "cl. 1.1, cl. 6", obligations: "s. 26D breach notice", obligationIds: ["o1"] },
  { docId: "data-protection-policy", file: "Data_protection_policy.docx", path: "/Policies/Data protection", type: "Policy", client: "Firm policies", matter: "Policy register", clauses: "§ 3.1, § 5.4, § 7.2, § 9.1", obligations: "s. 26D · s. 26F · s. 15A · s. 48D", obligationIds: ["o1", "o2", "o3", "o5"] },
  { docId: "firm-playbook-v2026-1", file: "Firm_playbook_v2026.1.docx", path: "/Policies/Playbook", type: "Policy", client: "Firm policies", matter: "Policy register", clauses: "§ 2.4, § 4.6, § 7.3", obligations: "s. 26D · s. 15A · s. 48J", obligationIds: ["o1", "o3", "o4"] },
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
