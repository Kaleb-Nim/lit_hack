import { getR2Object, putR2Json } from "@/lib/r2";

export const pdpaComparisonDates = {
  before: "2021-01-02",
  current: "2025-12-05",
} as const;

export type PdpaSourceSnapshot = {
  regulationId: "PDPA2012";
  effectiveDate: string;
  sourceUrl: string;
  fetchedAt: string;
  text: string;
};

export type PdpaComparisonChange = {
  area: string;
  before: string;
  now: string;
  effectiveDate: string;
  significance: string;
  sourceUrl: string;
};

export type PdpaComparison = {
  regulationId: "PDPA2012";
  fromDate: string;
  toDate: string;
  headline: string;
  executiveSummary: string;
  changes: PdpaComparisonChange[];
  businessImpact: string[];
  caveats: string[];
  generatedAt: string | null;
  generatedBy: "verified-baseline" | "openai";
  model: string | null;
  sourceCoverage: "verified-change-records" | "cached-official-text";
  sourceDocuments: Array<{ label: string; effectiveDate: string; sourceUrl: string; cached: boolean }>;
};

const pdpcCommencementUrl = "https://www.pdpc.gov.sg/news-and-events/announcements/2021/01/amendments-to-the-personal-data-protection-act-take-effect-from-1-february-2021";
const amendmentActUrl = "https://sso.agc.gov.sg/Acts-Supp/40-2020/";
const financialPenaltyUrl = "https://sso.agc.gov.sg/SL-Supp/S767-2022/Published/20220930";
const latestAmendmentUrl = "https://sso.agc.gov.sg/Acts-Supp/19-2025/Published/20251205";

export const verifiedPdpaComparison: PdpaComparison = {
  regulationId: "PDPA2012",
  fromDate: pdpaComparisonDates.before,
  toDate: pdpaComparisonDates.current,
  headline: "PDPA before the 2020 reform package compared with the current consolidated Act",
  executiveSummary: "The current PDPA includes the major reforms introduced by the Personal Data Protection (Amendment) Act 2020, later commencement of its financial-penalty provisions, and a further 2025 schedule amendment. The most operationally significant change is the mandatory data-breach notification framework that commenced on 1 February 2021.",
  changes: [
    {
      area: "Mandatory data-breach notification",
      before: "The selected pre-amendment version did not contain the statutory breach-notification framework introduced by Act 40 of 2020.",
      now: "Organisations must assess data breaches and notify qualifying breaches under the framework now contained in the PDPA.",
      effectiveDate: "2021-02-01",
      significance: "Incident-response plans, escalation rules and processor contracts should support timely assessment and notification.",
      sourceUrl: pdpcCommencementUrl,
    },
    {
      area: "Consent and permitted-use framework",
      before: "The earlier Act had a narrower deemed-consent and exceptions framework.",
      now: "The 2020 reforms expanded deemed consent and introduced additional pathways including legitimate interests and business improvement, subject to statutory conditions and safeguards.",
      effectiveDate: "2021-02-01",
      significance: "Processing registers and consent assessments may need a documented legal basis and safeguards for each use of personal data.",
      sourceUrl: amendmentActUrl,
    },
    {
      area: "Accountability and enforcement",
      before: "The pre-amendment version did not contain the complete accountability and enforcement package enacted in 2020.",
      now: "The amended Act strengthened organisational accountability and introduced offences addressing serious mishandling of personal data by individuals.",
      effectiveDate: "2021-02-01",
      significance: "Policies, staff training and access controls should be checked against the amended duties and offences.",
      sourceUrl: amendmentActUrl,
    },
    {
      area: "Financial penalties",
      before: "The higher financial-penalty framework enacted in 2020 was not yet in force.",
      now: "The relevant financial-penalty amendments commenced on 1 October 2022.",
      effectiveDate: "2022-10-01",
      significance: "Risk scoring and incident escalation should use the current enforcement exposure, not the earlier position.",
      sourceUrl: financialPenaltyUrl,
    },
    {
      area: "2025 schedule amendment",
      before: "Division 1, Part 3 of the Second Schedule included paragraph 3(a).",
      now: "Act 19 of 2025 deleted paragraph 3(a) of Division 1, Part 3 of the Second Schedule.",
      effectiveDate: "2025-12-05",
      significance: "Any internal rule relying specifically on that schedule provision should be revalidated against the current text.",
      sourceUrl: latestAmendmentUrl,
    },
  ],
  businessImpact: [
    "Revalidate breach-response and regulator-notification workflows.",
    "Check processor and vendor contracts for prompt incident-notification obligations.",
    "Document the statutory basis and safeguards for processing that relies on the expanded exceptions.",
    "Update training, access controls and enforcement-risk assessments.",
  ],
  caveats: [
    "This is a high-level change summary, not legal advice or an exhaustive section-by-section opinion.",
    "Open the linked official versions before relying on a provision for a legal decision.",
  ],
  generatedAt: null,
  generatedBy: "verified-baseline",
  model: null,
  sourceCoverage: "verified-change-records",
  sourceDocuments: [
    { label: "Before 2020 amendments commenced", effectiveDate: pdpaComparisonDates.before, sourceUrl: "https://sso.agc.gov.sg/Act/PDPA2012?DocDate=20210102", cached: false },
    { label: "Current consolidated version", effectiveDate: pdpaComparisonDates.current, sourceUrl: "https://sso.agc.gov.sg/Act/PDPA2012?DocDate=20251205", cached: false },
  ],
};

const compactDate = (date: string) => date.replaceAll("-", "");
const sourceKey = (date: string) => `Regulations/sources/PDPA2012/${compactDate(date)}.json`;
const comparisonKey = (fromDate: string, toDate: string) => `Regulations/comparisons/PDPA2012/${compactDate(fromDate)}--${compactDate(toDate)}.json`;

export async function readPdpaSourceSnapshot(date: string): Promise<PdpaSourceSnapshot | null> {
  try {
    const response = await getR2Object(sourceKey(date));
    if (response.ok) return await response.json() as PdpaSourceSnapshot;
  } catch {}
  return null;
}

export async function writePdpaSourceSnapshot(snapshot: PdpaSourceSnapshot) {
  await putR2Json(sourceKey(snapshot.effectiveDate), snapshot);
}

export async function readPdpaComparison(fromDate = pdpaComparisonDates.before, toDate = pdpaComparisonDates.current): Promise<PdpaComparison> {
  try {
    const response = await getR2Object(comparisonKey(fromDate, toDate));
    if (response.ok) return await response.json() as PdpaComparison;
  } catch {}
  return verifiedPdpaComparison;
}

export async function writePdpaComparison(comparison: PdpaComparison) {
  await putR2Json(comparisonKey(comparison.fromDate, comparison.toDate), comparison);
}

export function extractLegalText(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(?:p|div|section|article|li|tr|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, value: string) => String.fromCharCode(Number(value)))
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 20)
    .join("\n");
}

export function changedTextEvidence(beforeText: string, currentText: string) {
  const before = beforeText.split("\n");
  const current = currentText.split("\n");
  const normalize = (line: string) => line.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const beforeSet = new Set(before.map(normalize));
  const currentSet = new Set(current.map(normalize));
  const removed = before.filter((line) => !currentSet.has(normalize(line))).slice(0, 220).join("\n").slice(0, 50000);
  const added = current.filter((line) => !beforeSet.has(normalize(line))).slice(0, 220).join("\n").slice(0, 50000);
  return { removed, added };
}
