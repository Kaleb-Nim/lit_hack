/**
 * Clause fixtures for `/review/[docId]`, keyed by the `DocId` registry in
 * `lib/pdpa/data.ts`. Both compare columns and the final document render
 * from this one model, so the three views can never drift apart.
 *
 * A clause that carries a suggested edit splits into three parts:
 *
 *   before | replaced/inserted | after
 *
 *   original column   before + strike(replaced) + caret + after
 *   revised column    before + editable(text)           + after
 *   final document    before + (accepted ? text : replaced) + after
 *
 * Four documents are hand-written; the remaining seven are generated from
 * the affected-file registry and the obligation policy notes so that every
 * `DocId` resolves to a document with two or three changes.
 */

import {
  FILE_BY_ID,
  FILES,
  OBLIGATIONS,
  OBLIGATION_BY_ID,
  REGULATION,
  isDocId,
  type AffectedFile,
  type DocId,
  type Obligation,
  type ObligationId,
} from "@/lib/pdpa/data";

export interface Change {
  /** Stable id within the document, e.g. "c1". Keys statuses and texts. */
  id: string;
  /** Side-panel eyebrow, e.g. "Clause 6.1 — Personal data". */
  clause: string;
  /** Side-panel headline describing what the edit does. */
  title: string;
  /** Why the edit is proposed — the obligation and the policy note behind it. */
  rationale: string;
  /** The AI's suggested wording. Seeds the editable text, which the reviewer may change. */
  text: string;
  /** The original wording this edit replaces. Empty when the edit is a pure insertion. */
  replaced: string;
  /** The obligation this edit responds to. */
  obligationId: ObligationId;
}

export interface Clause {
  number: string;
  /** Wording that precedes the edit (no trailing space — the renderer adds it). */
  before: string;
  /** Wording that follows the edit, including any leading space or punctuation. */
  after?: string;
  /** Present when this clause carries a suggested edit. */
  changeId?: string;
}

export interface Section {
  heading: string;
  clauses: Clause[];
}

export interface DocumentMeta {
  fileName: string;
  /** Uppercase kicker above the document, e.g. "Mutual non-disclosure agreement". */
  kind: string;
  /** Header meta after the file name. */
  subtitle: string;
  /** Title line on the final document. */
  parties: string;
  /** e.g. "Executed 14 February 2026". */
  executed: string;
  pageCount: string;
  originalLabel: string;
  revisedLabel: string;
  /** Labels under the two signature lines. */
  signatories: [string, string];
}

export interface ReviewDocument extends DocumentMeta {
  id: DocId;
  reviewer: string;
  sections: Section[];
  changes: Change[];
}

const REVIEWER = `Reviewer: ${REGULATION.reviewer}`;

/* ── Hand-written fixtures ─────────────────────────────────────── */

const MERIDIAN_MNDA: Omit<ReviewDocument, "id" | "reviewer"> = {
  fileName: "Meridian_MNDA_v4.docx",
  kind: "Mutual non-disclosure agreement",
  subtitle: "Mutual NDA · Meridian Labs / Calloway Group",
  parties: "Meridian Labs Pte Ltd and Calloway Group LLC",
  executed: "Executed 14 February 2026",
  pageCount: "Page 1 of 6 · 2,318 words",
  originalLabel: "v3 · executed 14 Feb 2026",
  revisedLabel: "v4 draft · click an insertion to edit it",
  signatories: ["For Meridian Labs Pte Ltd", "For Calloway Group LLC"],
  sections: [
    {
      heading: "1. Definitions",
      clauses: [
        {
          number: "1.1",
          before:
            "“Confidential Information” means all information disclosed by the Disclosing Party to the Receiving Party, in any form and whether or not marked as confidential, and includes any Personal Data comprised in that information.",
        },
        {
          number: "1.4",
          before:
            "“Act” means the Personal Data Protection Act 2012 as amended from time to time, “Commission” means the Personal Data Protection Commission, and “Personal Data” has the meaning given in the Act.",
        },
      ],
    },
    {
      heading: "2. Obligations of confidence",
      clauses: [
        {
          number: "2.1",
          before:
            "The Receiving Party shall hold the Confidential Information in confidence and shall not disclose it to any third party without the prior written consent of the Disclosing Party.",
        },
      ],
    },
    {
      heading: "6. Personal data",
      clauses: [
        {
          number: "6.1",
          changeId: "c1",
          before:
            "Where the Receiving Party becomes aware of any unauthorised access to, or loss, disclosure or alteration of, Personal Data comprised in the Confidential Information (a “Data Breach”), it shall notify the Disclosing Party in writing",
          after: ", giving such details of the Data Breach as are then known to it.",
        },
        {
          number: "6.2",
          before:
            "The Receiving Party shall process Personal Data comprised in the Confidential Information only for the Purpose and in accordance with the Act.",
        },
        {
          number: "6.4",
          changeId: "c2",
          before:
            "The Receiving Party shall provide the Disclosing Party with all information and assistance reasonably requested in connection with a Data Breach",
          after:
            ", and shall not notify the Commission or any affected individual on the Disclosing Party's behalf without its prior written instruction.",
        },
        {
          number: "6.5",
          changeId: "c3",
          before:
            "The Receiving Party shall keep a written record of every Data Breach affecting the Confidential Information, whether or not it is assessed as notifiable.",
        },
      ],
    },
  ],
  changes: [
    {
      id: "c1",
      clause: "Clause 6.1 — Personal data",
      title: "Breach notice: “without undue delay” → 24 hours to support statutory assessment",
      rationale:
        "Once the Disclosing Party determines that a breach is notifiable, s. 26D allows no more than three calendar days for the Commission filing. A fixed processor escalation period gives it time to investigate and make that determination.",
      text: "within 24 hours of becoming aware, and in any event in time for the Disclosing Party to notify the Commission within three calendar days",
      replaced: "without undue delay",
      obligationId: "o1",
    },
    {
      id: "c2",
      clause: "Clause 6.4 — Personal data",
      title: "Breach assistance tied to the statutory window and its required content",
      rationale:
        "The Commission filing must describe the breach, the individuals affected and the remediation. Assistance promised “as soon as reasonably practicable” leaves Meridian unable to complete the filing in time.",
      text: "within the three-calendar-day window in section 26D of the Act, including the nature of the Data Breach, the categories and approximate number of individuals affected, and the measures taken or proposed",
      replaced: "as soon as reasonably practicable",
      obligationId: "o1",
    },
    {
      id: "c3",
      clause: "Clause 6.5 — Personal data",
      title: "Breach register made available to the Disclosing Party",
      rationale:
        "The 30-day assessment window under s. 26D runs from discovery. A record that Meridian can inspect is the evidence that the assessment was made in time.",
      text: "The record shall be made available to the Disclosing Party on request and retained for not less than three years after the Data Breach.",
      replaced: "",
      obligationId: "o1",
    },
  ],
};

const CALLOWAY_MSA: Omit<ReviewDocument, "id" | "reviewer"> = {
  fileName: "Calloway_MSA_2026.docx",
  kind: "Master services agreement",
  subtitle: "Services renewal · Calloway Group / Meridian Labs",
  parties: "Calloway Group LLC and Meridian Labs Pte Ltd",
  executed: "Executed 3 March 2026",
  pageCount: "Page 1 of 31 · 11,904 words",
  originalLabel: "2026 renewal · executed 3 Mar 2026",
  revisedLabel: "Amendment draft · click an insertion to edit it",
  signatories: ["For Calloway Group LLC", "For Meridian Labs Pte Ltd"],
  sections: [
    {
      heading: "12. Data protection",
      clauses: [
        {
          number: "12.1",
          before:
            "Each party shall comply with the Act in connection with this Agreement. As between the parties, the Customer is the organisation responsible for Customer Personal Data and the Supplier processes it as a data intermediary on the Customer's behalf.",
        },
        {
          number: "12.3",
          changeId: "c1",
          before: "The Supplier shall notify the Customer",
          after:
            " any Personal Data Breach affecting Customer Personal Data, and shall provide such further information as the Customer reasonably requires to assess and report the breach.",
        },
        {
          number: "12.9",
          changeId: "c2",
          before: "On the Customer's written request, the Supplier shall",
          after:
            ". “Derived Data” means data produced by the Supplier's own analysis or processing of Customer Personal Data.",
        },
      ],
    },
    {
      heading: "15. Limitation of liability",
      clauses: [
        {
          number: "15.1",
          before:
            "Subject to clause 15.3, each party's aggregate liability under or in connection with this Agreement in any Contract Year shall not exceed the Charges paid or payable in that Contract Year.",
        },
        {
          number: "15.2",
          changeId: "c3",
          before:
            "Notwithstanding clause 15.1, the Supplier's aggregate liability for breach of clause 12 shall not exceed",
          after: ".",
        },
      ],
    },
  ],
  changes: [
    {
      id: "c1",
      clause: "Clause 12.3 — Data protection",
      title: "Breach notice: “without undue delay” → 24 hours to support statutory assessment",
      rationale:
        "Once the Customer determines that a breach is notifiable, s. 26D allows no more than three calendar days for the Commission filing. A fixed supplier escalation period gives the Customer time to investigate and make that determination.",
      text: "within 24 hours of becoming aware of, and in any event in time for the Customer to notify the Commission within three calendar days of,",
      replaced: "without undue delay after becoming aware of",
      obligationId: "o1",
    },
    {
      id: "c2",
      clause: "Clause 12.9 — Data protection",
      title: "Future-ready export assistance, with derived data carved out",
      rationale:
        "Part 6B was enacted but is not yet in force. This optional drafting prepares for a future commencement without presenting data portability as a current statutory obligation.",
      text: "transmit to the Customer, or to another organisation nominated by the Customer, any Customer Personal Data (including data generated in the course of the Services, but excluding Derived Data) in a commonly used, machine-readable format within ten Business Days of the request, and shall return or delete the remaining Customer Personal Data on expiry or termination of this Agreement",
      replaced: "return or delete Customer Personal Data on expiry or termination of this Agreement",
      obligationId: "o2",
    },
    {
      id: "c3",
      clause: "Clause 15.2 — Limitation of liability",
      title: "Data protection cap recalculated against the raised statutory maximum",
      rationale:
        "s. 48J raises the ceiling to the higher of S$1 million or 10% of annual turnover in Singapore. A cap fixed at the old S$1 million figure leaves the shortfall with the Customer (playbook § 7.3).",
      text: "the greater of S$1,000,000 and the maximum financial penalty imposable on the Customer under section 48J of the Act at the date of the breach, calculated by reference to the Customer's annual turnover in Singapore",
      replaced: "S$1,000,000, being the maximum financial penalty then imposable under the Act",
      obligationId: "o4",
    },
  ],
};

const CLOUD_HOSTING_DPA: Omit<ReviewDocument, "id" | "reviewer"> = {
  fileName: "Cloud_Hosting_DPA.docx",
  kind: "Data processing agreement",
  subtitle: "Hosting DPA · Meridian Labs / Northgate Cloud",
  parties: "Meridian Labs Pte Ltd and Northgate Cloud Services Pte Ltd",
  executed: "Executed 21 January 2026",
  pageCount: "Page 1 of 14 · 5,266 words",
  originalLabel: "Executed 21 Jan 2026",
  revisedLabel: "Variation draft · click an insertion to edit it",
  signatories: ["For Meridian Labs Pte Ltd", "For Northgate Cloud Services Pte Ltd"],
  sections: [
    {
      heading: "8. Liability",
      clauses: [
        {
          number: "8.1",
          before:
            "The Processor shall indemnify the Controller against any financial penalty imposed on the Controller by the Commission to the extent it results from the Processor's breach of this Agreement.",
        },
        {
          number: "8.2",
          changeId: "c1",
          before: "The Processor's liability under clause 8.1 shall not exceed",
          after: ", and shall be recalculated at the date of the breach rather than the date of this Agreement.",
        },
      ],
    },
    {
      heading: "Annex B — Security incident procedure",
      clauses: [
        {
          number: "B.1",
          before:
            "The Processor operates a 24/7 security operations function and shall log every suspected incident affecting Controller Data at the time of detection.",
        },
        {
          number: "B.2",
          changeId: "c2",
          before:
            "Where an incident involves unauthorised access to, or loss, disclosure or alteration of, Controller Data, the Processor shall notify the Controller's nominated contact",
          after:
            ", and shall thereafter provide updates at intervals of no more than 24 hours until the incident is closed.",
        },
      ],
    },
    {
      heading: "Annex C — Return and export of data",
      clauses: [
        {
          number: "C.1",
          changeId: "c3",
          before: "On termination of the Services, the Processor shall",
          after: ".",
        },
        {
          number: "C.2",
          before:
            "Backups containing Controller Data shall be overwritten in the ordinary rotation cycle and in any event within 90 days of termination.",
        },
      ],
    },
  ],
  changes: [
    {
      id: "c1",
      clause: "Clause 8.2 — Liability",
      title: "Indemnity cap recalculated against the raised statutory maximum",
      rationale:
        "s. 48J raises the ceiling to the higher of S$1 million or 10% of annual turnover in Singapore. An indemnity capped at the old figure leaves the shortfall with Meridian (playbook § 7.3).",
      text: "the greater of S$1,000,000 and 10% of the Controller's annual turnover in Singapore, being the maximum financial penalty imposable under section 48J of the Act",
      replaced: "S$1,000,000, being the maximum financial penalty imposable under the Act",
      obligationId: "o4",
    },
    {
      id: "c2",
      clause: "Annex B.2 — Security incident procedure",
      title: "Incident notice: “within a reasonable time” → 24 hours to support assessment",
      rationale:
        "Once Meridian determines that a breach is notifiable, s. 26D allows no more than three calendar days for the Commission filing. A fixed provider escalation period gives Meridian time to investigate and make that determination.",
      text: "within 24 hours of detection, and in any event in time for the Controller to notify the Commission within three calendar days",
      replaced: "within a reasonable time",
      obligationId: "o1",
    },
    {
      id: "c3",
      clause: "Annex C.1 — Return and export of data",
      title: "Future-ready machine-readable export during the term",
      rationale:
        "Part 6B was enacted but remains uncommenced. This optional clause is future-readiness drafting; it must not be reported as a current statutory requirement.",
      text: "return Controller Data to the Controller, and at any time during the term on written request shall export the Controller Data relating to a named individual (excluding data derived by the Processor's own analysis) in a commonly used, machine-readable format within five Business Days",
      replaced: "return Controller Data to the Controller in the format in which it was received",
      obligationId: "o2",
    },
  ],
};

const EMPLOYMENT_RAO: Omit<ReviewDocument, "id" | "reviewer"> = {
  fileName: "Employment_Agreement_Rao_v2.docx",
  kind: "Contract of employment",
  subtitle: "Employment · Calloway Group / Head of Data Operations",
  parties: "Calloway Group LLC and the Employee",
  executed: "Executed 8 April 2026",
  pageCount: "Page 1 of 12 · 4,410 words",
  originalLabel: "v2 · executed 8 Apr 2026",
  revisedLabel: "v3 draft · click an insertion to edit it",
  signatories: ["For Calloway Group LLC", "Signed by the Employee"],
  sections: [
    {
      heading: "11. Confidentiality and personal data",
      clauses: [
        {
          number: "11.1",
          before:
            "The Employee shall not, during or after the employment, use or disclose any Confidential Information except in the proper performance of the Employee's duties or as required by law.",
        },
        {
          number: "11.4",
          changeId: "c1",
          before:
            "The Company may collect, use and disclose the Employee's personal data for the purposes of managing the employment relationship",
          after: ".",
        },
        {
          number: "11.7",
          changeId: "c2",
          before: "The Employee",
          after: ".",
        },
      ],
    },
    {
      heading: "14. Termination",
      clauses: [
        {
          number: "14.1",
          before:
            "Either party may terminate the employment by giving the other not less than three months' written notice.",
        },
        {
          number: "14.2",
          changeId: "c3",
          before:
            "The Company may terminate the employment without notice or payment in lieu where the Employee",
          after: ".",
        },
      ],
    },
  ],
  changes: [
    {
      id: "c1",
      clause: "Clause 11.4 — Confidentiality and personal data",
      title: "Consent supplemented by a documented legitimate interests basis",
      rationale:
        "The legitimate-interests exception in Part 3 of the First Schedule requires an assessment and reasonable safeguards. Consent-only drafting does not document reliance on that separate exception.",
      text: "on the basis of the Employee's consent given by signing this Agreement or, where the Company's legitimate interests outweigh any likely adverse effect on the Employee, on the basis of a written assessment completed and retained by the Company under Part 3 of the First Schedule to the Act and made available to the Employee on request",
      replaced: "with the Employee's consent, which the Employee gives by signing this Agreement",
      obligationId: "o3",
    },
    {
      id: "c2",
      clause: "Clause 11.7 — Confidentiality and personal data",
      title: "Express prohibition naming the s. 48D mishandling offence",
      rationale:
        "s. 48D makes knowing or reckless unauthorised disclosure, use for gain and re-identification of anonymised data an individual offence. Employment terms that name the conduct make disciplinary action easier to sustain.",
      text: "shall not disclose personal data held by the Company other than as required in the proper performance of the Employee's duties; shall not use personal data to obtain a gain for the Employee or any other person, or to cause harm or loss to any person; and shall not re-identify, or attempt to re-identify, any anonymised data held by the Company. The Employee acknowledges that knowing or reckless conduct of that kind is an offence under section 48D of the Act, independently of any liability of the Company",
      replaced: "shall not disclose personal data held by the Company other than as required in the proper performance of the Employee's duties",
      obligationId: "o5",
    },
    {
      id: "c3",
      clause: "Clause 14.2 — Termination",
      title: "Summary dismissal ground extended to clause 11.7 conduct",
      rationale:
        "Linking the offence to gross misconduct lets the Company act on the conduct itself without waiting for a prosecution, and answers the vicarious-liability exposure noted against s. 48D.",
      text: "commits an act of gross misconduct, which includes any conduct described in clause 11.7 whether or not a prosecution follows",
      replaced: "commits an act of gross misconduct",
      obligationId: "o5",
    },
  ],
};

type HandWrittenId = "meridian-mnda-v4" | "calloway-msa-2026" | "cloud-hosting-dpa" | "employment-agreement-rao-v2";

const HAND_WRITTEN: Record<HandWrittenId, Omit<ReviewDocument, "id" | "reviewer">> = {
  "meridian-mnda-v4": MERIDIAN_MNDA,
  "calloway-msa-2026": CALLOWAY_MSA,
  "cloud-hosting-dpa": CLOUD_HOSTING_DPA,
  "employment-agreement-rao-v2": EMPLOYMENT_RAO,
};

/* ── Generated fixtures ────────────────────────────────────────── */

/** Who speaks in a generated clause, per document. */
interface Voice {
  /** Party bound by the obligation, sentence-initial: "The Processor". */
  subject: string;
  /** The same party mid-sentence: "the Processor". */
  mid: string;
  /** The other side, mid-sentence: "the Controller". */
  counterparty: string;
  /** Possessive for the subject: "its", "the Employee's". */
  poss: string;
  /** True for a contract of employment, where the subject is an individual. */
  employment?: boolean;
}

interface GeneratedMeta extends DocumentMeta {
  voice: Voice;
}

type GeneratedId = Exclude<DocId, HandWrittenId>;

const GENERATED_META: Record<GeneratedId, GeneratedMeta> = {
  "meridian-client-terms": {
    fileName: "Meridian_Client_Terms.docx",
    kind: "Standard terms of business",
    subtitle: "Client terms · Meridian Labs",
    parties: "Meridian Labs Pte Ltd — terms of business for clients",
    executed: "Issued 14 February 2026",
    pageCount: "Page 1 of 9 · 3,712 words",
    originalLabel: "Issued 14 Feb 2026",
    revisedLabel: "Amendment draft · click an insertion to edit it",
    signatories: ["For Meridian Labs Pte Ltd", "For the Client"],
    voice: { subject: "Meridian", mid: "Meridian", counterparty: "the Client", poss: "its" },
  },
  "standard-dpa-form": {
    fileName: "Standard_DPA_form.docx",
    kind: "Precedent · data processing agreement",
    subtitle: "Firm precedent · Standard forms",
    parties: "Standard form data processing agreement",
    executed: "Precedent last revised 2 May 2025",
    pageCount: "Page 1 of 16 · 6,120 words",
    originalLabel: "Precedent v2025.2",
    revisedLabel: "v2026.1 draft · click an insertion to edit it",
    signatories: ["For the Controller", "For the Processor"],
    voice: { subject: "The Processor", mid: "the Processor", counterparty: "the Controller", poss: "its" },
  },
  "standard-employment-form": {
    fileName: "Standard_Employment_form.docx",
    kind: "Precedent · contract of employment",
    subtitle: "Firm precedent · Standard forms",
    parties: "Standard form contract of employment",
    executed: "Precedent last revised 9 June 2025",
    pageCount: "Page 1 of 11 · 4,088 words",
    originalLabel: "Precedent v2025.2",
    revisedLabel: "v2026.1 draft · click an insertion to edit it",
    signatories: ["For the Company", "Signed by the Employee"],
    voice: { subject: "The Employee", mid: "the Employee", counterparty: "the Company", poss: "the Employee's", employment: true },
  },
  "standard-mnda-form": {
    fileName: "Standard_MNDA_form.docx",
    kind: "Precedent · mutual non-disclosure agreement",
    subtitle: "Firm precedent · Standard forms",
    parties: "Standard form mutual non-disclosure agreement",
    executed: "Precedent last revised 17 March 2025",
    pageCount: "Page 1 of 6 · 2,204 words",
    originalLabel: "Precedent v2025.2",
    revisedLabel: "v2026.1 draft · click an insertion to edit it",
    signatories: ["For the Disclosing Party", "For the Receiving Party"],
    voice: { subject: "The Receiving Party", mid: "the Receiving Party", counterparty: "the Disclosing Party", poss: "its" },
  },
  "data-protection-policy": {
    fileName: "Data_protection_policy.docx",
    kind: "Firm policy · data protection",
    subtitle: "Policy register · Data protection",
    parties: "Data protection policy",
    executed: "Policy adopted 1 July 2025",
    pageCount: "Page 1 of 18 · 7,340 words",
    originalLabel: "Adopted 1 Jul 2025",
    revisedLabel: "2027 revision · click an insertion to edit it",
    signatories: ["Managing Partner", "Data Protection Officer"],
    voice: { subject: "The firm", mid: "the firm", counterparty: "the Data Protection Officer", poss: "its" },
  },
  "firm-playbook-v2026-1": {
    fileName: "Firm_playbook_v2026.1.docx",
    kind: "Firm policy · drafting playbook",
    subtitle: "Policy register · Playbook v2026.1",
    parties: "Contract drafting playbook",
    executed: "Playbook v2026.1 issued 6 January 2026",
    pageCount: "Page 1 of 42 · 15,980 words",
    originalLabel: "v2026.1 · issued 6 Jan 2026",
    revisedLabel: "v2026.2 draft · click an insertion to edit it",
    signatories: ["Head of Corporate", "Knowledge Management"],
    voice: { subject: "The organisation", mid: "the organisation", counterparty: "the controller", poss: "its" },
  },
  "outside-counsel-guidelines": {
    fileName: "Outside_counsel_guidelines.docx",
    kind: "Firm policy · outside counsel guidelines",
    subtitle: "Policy register · OCG",
    parties: "Outside counsel guidelines",
    executed: "Guidelines issued 12 August 2025",
    pageCount: "Page 1 of 8 · 3,015 words",
    originalLabel: "Issued 12 Aug 2025",
    revisedLabel: "2027 revision · click an insertion to edit it",
    signatories: ["General Counsel", "For outside counsel"],
    voice: { subject: "Counsel", mid: "counsel", counterparty: "the firm", poss: "its" },
  },
};

type Wording = Pick<Change, "title" | "text" | "replaced"> & Pick<Clause, "before" | "after">;

interface Template {
  /** Section heading topic, e.g. "Personal data breaches". */
  topic: string;
  /** Unchanged clause that sets the scene, placed before the edited clause. */
  intro: (v: Voice) => string;
  /** The main edit for this obligation. */
  primary: (v: Voice) => Wording;
  /** A follow-on edit, used when the obligation appears twice or a second edit is needed. */
  companion: (v: Voice) => Wording;
  /** Variant for a clause in section 1 (definitions). */
  definition: (v: Voice) => Wording;
}

const TEMPLATES: Record<ObligationId, Template> = {
  o1: {
    topic: "Personal data breaches",
    intro: (v) =>
      `${v.subject} shall maintain appropriate security arrangements to protect personal data in ${v.poss} possession or under ${v.poss} control against unauthorised access, collection, use, disclosure, copying, modification or disposal.`,
    primary: (v) => ({
      title: "Breach notice: “without undue delay” → 24 hours to support statutory assessment",
      before: `Where ${v.mid} becomes aware of any unauthorised access to, or loss, disclosure or alteration of, personal data, ${v.employment ? "the Employee" : "it"} shall notify ${v.counterparty} in writing`,
      replaced: "without undue delay",
      text: `within 24 hours of becoming aware, and in any event in time for ${v.counterparty} to notify the Commission within three calendar days`,
      after: ", giving such details of the breach as are then known.",
    }),
    companion: (v) => ({
      title: "Notice content aligned with the s. 26D filing",
      before: `Each notice of a breach given to ${v.counterparty} shall describe`,
      replaced: "the nature of the breach and the measures taken",
      text: "the nature of the breach, the categories and approximate number of individuals affected, and the measures taken or proposed, and shall be followed by a written update whenever further information becomes available within the three-calendar-day statutory window",
      after: ".",
    }),
    definition: () => ({
      title: "“Data Breach” defined without the significant-harm threshold",
      before:
        "“Data Breach” means any unauthorised access to, or collection, use, disclosure, copying, modification or disposal of, personal data",
      replaced: "that is likely to result in significant harm to an affected individual",
      text: "whether or not it is assessed as notifiable under section 26D of the Act, and “Commission” means the Personal Data Protection Commission",
      after: ".",
    }),
  },
  o2: {
    topic: "Data portability",
    intro: (v) =>
      `${v.subject} shall respond to a request for access to, or correction of, personal data within 30 days of receiving it, or inform the requester in writing of the date by which ${v.employment ? "the Employee" : "it"} will respond.`,
    primary: (v) => ({
      title: "Future-ready machine-readable transmission, with derived data carved out",
      before: `On written request, ${v.mid} shall`,
      replaced: "return or destroy all personal data on termination of the relationship",
      text: "transmit the requesting individual's personal data, including data generated in the course of the relationship but excluding Derived Data, to the individual or to a nominated organisation with a presence in Singapore in a commonly used, machine-readable format within 30 days",
      after: ".",
    }),
    companion: (v) => ({
      title: "Future-readiness definition of derived data",
      before: "“Derived Data” means",
      replaced: `data produced by ${v.poss === "its" ? v.mid + "'s" : v.poss} own analysis`,
      text: `data produced by ${v.poss === "its" ? v.mid + "'s" : v.poss} own analysis or processing of personal data, for use if the uncommenced portability provisions in Part 6B of the Act come into force`,
      after: ".",
    }),
    definition: (v) => ({
      title: "Future-readiness definitions for uncommenced Part 6B",
      before: "“Portable Data” means",
      replaced: "personal data provided by an individual",
      text: `personal data provided by an individual and data generated in the course of the relationship, but excludes “Derived Data”, being data produced by ${v.poss === "its" ? v.mid + "'s" : v.poss} own analysis or processing; these definitions apply only if the uncommenced portability provisions in Part 6B of the Act come into force`,
      after: ".",
    }),
  },
  o3: {
    topic: "Basis for processing",
    intro: (v) =>
      `${v.subject} shall inform the individual of the purposes for which personal data is collected, used or disclosed on or before collection.`,
    primary: (v) => ({
      title: "Legitimate interests basis added, subject to a retained written assessment",
      before: `${v.subject} may collect, use or disclose personal data`,
      replaced: "only with the consent of the individual concerned",
      text: `with the consent of the individual concerned or, where the legitimate interests of ${v.mid} outweigh any adverse effect on the individual, on the basis of a written legitimate interests assessment completed and retained before the processing begins`,
      after: ".",
    }),
    companion: (v) => ({
      title: "Assessment register as the record of the balancing test",
      before: "Every legitimate interests assessment shall be",
      replaced: "kept on file",
      text: `entered in a register maintained by ${v.mid}, recording the interest relied on, the adverse effects considered and the outcome of the balancing test, and retained for as long as the processing continues and three years thereafter`,
      after: ".",
    }),
    definition: () => ({
      title: "“Legitimate Interests Assessment” defined",
      before: "“Legitimate Interests Assessment” means a written assessment",
      replaced: "of the purposes of processing",
      text: "under Part 3 of the First Schedule to the Act, completed and retained before processing begins, recording that the legitimate interests relied on outweigh any likely adverse effect on the individual",
      after: ".",
    }),
  },
  o4: {
    topic: "Liability",
    intro: (v) =>
      `${v.subject} shall indemnify ${v.counterparty} against any financial penalty imposed by the Commission to the extent it results from a breach of this clause.`,
    primary: () => ({
      title: "Cap recalculated against the raised statutory maximum",
      before: "Liability under this clause shall not exceed",
      replaced: "S$1,000,000, being the maximum financial penalty then imposable under the Act",
      text: "the greater of S$1,000,000 and 10% of the indemnified party's annual turnover in Singapore, being the maximum financial penalty imposable under section 48J of the Act",
      after: ".",
    }),
    companion: () => ({
      title: "Caps tied to statutory maxima recalculated at the date of breach",
      before: "Any cap expressed by reference to a statutory maximum shall be read as referring to the maximum",
      replaced: "in force at the date of this Agreement",
      text: "in force at the date of the breach, and the parties shall review the insurance schedule whenever that maximum changes",
      after: ".",
    }),
    definition: () => ({
      title: "“Statutory Maximum” defined by reference to s. 48J",
      before: "“Statutory Maximum” means",
      replaced: "S$1,000,000",
      text: "the greater of S$1,000,000 and 10% of the relevant organisation's annual turnover in Singapore, as provided in section 48J of the Act",
      after: ".",
    }),
  },
  o5: {
    topic: "Personnel obligations",
    intro: (v) =>
      v.employment
        ? `${v.subject} shall comply with ${v.counterparty}'s data protection policy and acceptable use policy as amended from time to time.`
        : `${v.subject} shall ensure that personnel with access to personal data are bound by obligations of confidence no less protective than this clause.`,
    primary: (v) => ({
      title: "Express prohibition naming the s. 48D mishandling offence",
      before: v.employment || v.subject === "Counsel" ? `${v.subject} shall` : "Personnel shall",
      replaced: `not disclose personal data other than in the proper performance of ${v.employment ? v.poss : v.subject === "Counsel" ? "its" : "their"} duties`,
      text: `not disclose personal data other than in the proper performance of ${v.employment ? v.poss : v.subject === "Counsel" ? "its" : "their"} duties, shall not use personal data to obtain a gain or to cause harm or loss to any person, and shall not re-identify anonymised data; knowing or reckless conduct of that kind is an offence under section 48D of the Act`,
      after: ".",
    }),
    companion: (v) =>
      v.employment
        ? {
            title: "Annual training extended to the s. 48D offences",
            before: `${v.subject} shall attend the data protection training provided by ${v.counterparty}`,
            replaced: "on joining",
            text: "on joining and at least annually thereafter, including a briefing on the individual offences under section 48D of the Act",
            after: ".",
          }
        : {
            title: "Confirmation that personnel are briefed on the offence",
            before: `${v.subject} shall confirm in writing, on request and at least annually, that ${v.poss} personnel have been briefed on`,
            replaced: "their obligations under this clause",
            text: "their obligations under this clause and on the individual offences under section 48D of the Act",
            after: ".",
          },
    definition: () => ({
      title: "“Mishandling” defined by reference to s. 48D",
      before: "“Mishandling” means",
      replaced: "any breach of this clause",
      text: "the knowing or reckless unauthorised disclosure of personal data, its use to obtain a gain or to cause harm or loss, or the re-identification of anonymised data, each an offence under section 48D of the Act",
      after: ".",
    }),
  },
};

/** "cl. 6.1, 6.4" | "Annex B, cl. 8" | "§ 3.1, § 5.4" → ["6.1", "6.4"] etc. */
function parseClauseRefs(clauses: string): string[] {
  return clauses
    .split(",")
    .map((s) => s.trim().replace(/^(cl\.|§|Annex)\s*/i, "").trim())
    .filter(Boolean);
}

/** "Data_protection_policy.docx" → "data protection policy", to match `policies[].name`. */
function policyName(file: AffectedFile): string {
  return file.file.replace(/\.docx$/i, "").replace(/_/g, " ").toLowerCase();
}

/** The policy note for a policy file's clause, if any obligation names it. */
function policyNote(file: AffectedFile, ref: string) {
  if (file.type !== "Policy") return undefined;
  for (const o of OBLIGATIONS) {
    const note = o.policies.find(
      (p) => p.name.toLowerCase() === policyName(file) && p.clause.startsWith(`§ ${ref} `),
    );
    if (note) return { obligation: o, note };
  }
  return undefined;
}

/** Which obligation a clause of `file` answers, by the obligation's own doc list. */
function obligationForClause(file: AffectedFile, ref: string, index: number): Obligation {
  const byDocList = OBLIGATIONS.find((o) =>
    o.docs.some((d) => d.docId === file.docId && parseClauseRefs(d.clauses).includes(ref)),
  );
  if (byDocList) return byDocList;
  const byPolicy = policyNote(file, ref);
  if (byPolicy) return byPolicy.obligation;
  const ids = file.obligationIds;
  return OBLIGATION_BY_ID[ids[index % ids.length]];
}

/** Resolve "9" → { intro: "9.1", clause: "9.2" }, "4.2" → { intro: "4.1", clause: "4.2" }, "B" → { intro: "B.1", clause: "B.2" }. */
function numberFor(ref: string): { intro?: string; clause: string; major: string } {
  if (ref.includes(".")) {
    const [major, minorRaw] = ref.split(".");
    const minor = Number(minorRaw);
    return { major, clause: ref, intro: minor > 1 ? `${major}.${minor - 1}` : undefined };
  }
  return { major: ref, intro: `${ref}.1`, clause: `${ref}.2` };
}

function bump(clause: string): string {
  return clause.replace(/(\d+)$/, (m) => String(Number(m) + 1));
}

function generateDocument(id: GeneratedId): ReviewDocument {
  const file = FILE_BY_ID[id];
  const meta = GENERATED_META[id];
  const isPolicy = file.type === "Policy";
  const refs = parseClauseRefs(file.clauses).slice(0, 3);

  interface Slot {
    number: ReturnType<typeof numberFor>;
    obligation: Obligation;
    variant: keyof Pick<Template, "primary" | "companion" | "definition">;
  }

  const seen = new Set<ObligationId>();
  const slots: Slot[] = refs.map((ref, i) => {
    const obligation = obligationForClause(file, ref, i);
    const number = numberFor(ref);
    const variant: Slot["variant"] =
      !isPolicy && number.major === "1" ? "definition" : seen.has(obligation.id) ? "companion" : "primary";
    seen.add(obligation.id);
    return { number, obligation, variant };
  });

  // The registry names a single clause for some files; add a follow-on clause
  // so every document carries at least two edits.
  if (slots.length < 2) {
    const first = slots[0];
    const other = file.obligationIds.find((o) => o !== first.obligation.id);
    const obligation = other ? OBLIGATION_BY_ID[other] : first.obligation;
    slots.push({
      number: { major: first.number.major, clause: bump(first.number.clause) },
      obligation,
      variant: other ? "primary" : "companion",
    });
  }

  const sections: Section[] = [];
  const changes: Change[] = [];

  slots.forEach((slot, i) => {
    const changeId = `c${i + 1}`;
    const template = TEMPLATES[slot.obligation.id];
    const note = policyNote(file, slot.number.clause)?.note;
    const body = template[slot.variant](meta.voice);
    const { major, clause: clauseNumber, intro: introNumber } = slot.number;
    const isAnnex = /^[A-Z]$/.test(major);

    const topic = note
      ? note.clause.replace(/^§\s*[\d.]+\s*—\s*/, "")
      : slot.variant === "definition"
        ? "Definitions"
        : template.topic;
    const heading = isPolicy ? `§ ${major} — ${topic}` : isAnnex ? `Annex ${major} — ${topic}` : `${major}. ${topic}`;

    const clauses: Clause[] = [];
    if (introNumber && slot.variant !== "definition") {
      clauses.push({ number: introNumber, before: template.intro(meta.voice) });
    }
    clauses.push({ number: clauseNumber, changeId, before: body.before, after: body.after });

    const existing = sections.find((s) => s.heading === heading);
    if (existing) {
      for (const c of clauses) if (!existing.clauses.some((e) => e.number === c.number)) existing.clauses.push(c);
    } else {
      sections.push({ heading, clauses });
    }

    const clauseLabel = isPolicy ? `§ ${clauseNumber}` : isAnnex ? `Annex ${clauseNumber}` : `Clause ${clauseNumber}`;
    changes.push({
      id: changeId,
      clause: `${clauseLabel} — ${topic}`,
      title: note ? note.change.replace(/\.$/, "") : body.title,
      rationale: note
        ? `${slot.obligation.ref}: ${slot.obligation.what} Policy note (${note.clause}): ${note.change}`
        : `${slot.obligation.ref}: ${slot.obligation.what} ${slot.obligation.action}`,
      text: body.text,
      replaced: body.replaced,
      obligationId: slot.obligation.id,
    });
  });

  return { id, reviewer: REVIEWER, ...meta, sections, changes };
}

/* ── Registry ──────────────────────────────────────────────────── */

function buildAll(): Record<DocId, ReviewDocument> {
  const out = {} as Record<DocId, ReviewDocument>;
  const isHandWritten = (id: DocId): id is HandWrittenId => Object.prototype.hasOwnProperty.call(HAND_WRITTEN, id);
  for (const file of FILES) {
    const id = file.docId;
    out[id] = isHandWritten(id)
      ? { id, reviewer: REVIEWER, ...HAND_WRITTEN[id] }
      : generateDocument(id);
  }
  return out;
}

const DOCUMENTS: Record<DocId, ReviewDocument> = buildAll();

export const DOCUMENT_META: Record<DocId, DocumentMeta> = Object.fromEntries(
  (Object.keys(DOCUMENTS) as DocId[]).map((id) => {
    const { fileName, kind, subtitle, parties, executed, pageCount, originalLabel, revisedLabel, signatories } =
      DOCUMENTS[id];
    return [id, { fileName, kind, subtitle, parties, executed, pageCount, originalLabel, revisedLabel, signatories }];
  }),
) as Record<DocId, DocumentMeta>;

/** The document for a route slug, or null so the page can call `notFound()`. */
export function getDocument(id: string): ReviewDocument | null {
  if (!isDocId(id)) return null;
  return DOCUMENTS[id] ?? null;
}

export function changeById(doc: ReviewDocument, id: string): Change | undefined {
  return doc.changes.find((c) => c.id === id);
}

/** Ordinal of a change within the document, 0-based. Used for "Clause n of N". */
export function changeIndex(doc: ReviewDocument, id: string): number {
  return doc.changes.findIndex((c) => c.id === id);
}
