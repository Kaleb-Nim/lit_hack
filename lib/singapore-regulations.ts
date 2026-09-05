import { getR2Object, putR2Json } from "@/lib/r2";

export type RegulationVersion = {
  effectiveDate: string;
  basis: string;
  sourceUrl: string;
};

export type RegulationLifecycleEvent = {
  date: string;
  stage: "consultation" | "bill" | "passed" | "assent" | "published" | "commenced" | "consolidated";
  label: string;
  detail: string;
  sourceUrl: string;
};

export type RegulationRecord = {
  id: string;
  title: string;
  kind: "act" | "subsidiary-legislation";
  status: "current" | "repealed" | "uncommenced" | "revoked";
  sourceUrl: string;
  source: "Singapore Statutes Online";
  currentAsAt?: string;
  versions: RegulationVersion[];
  lifecycle?: RegulationLifecycleEvent[];
  latestChange?: {
    effectiveDate: string;
    instrument: string;
    summary: string;
    affectedProvision?: string;
    sourceUrl: string;
  };
};

export type RegulationOverlay = {
  regulationId: string;
  tracked: boolean;
  tags: string[];
  internalNotes: string;
  updatedAt: string;
};

export type RegulationCatalog = {
  fetchedAt: string | null;
  source: "Singapore Statutes Online";
  sourceUrl: string;
  instruments: RegulationRecord[];
};

const pdpaVersions: RegulationVersion[] = [
  ["2013-01-02", "Act 26 of 2012"], ["2013-12-02", "Act 26 of 2012"], ["2014-01-02", "Act 26 of 2012"], ["2014-07-02", "Act 26 of 2012"],
  ["2015-01-23", "Amended by S 19/2015"], ["2016-01-03", "Amended by Act 29 of 2014"], ["2016-10-01", "Amended by Act 22 of 2016"], ["2016-10-02", "Amended by Act 22 of 2016"],
  ["2021-01-02", "Amended by Act 40 of 2019"], ["2021-02-01", "Amended by Act 40 of 2020"], ["2021-12-31", "2020 Revised Edition"], ["2022-04-01", "Amended by Act 25 of 2021"],
  ["2022-10-01", "Amended by Act 40 of 2020"], ["2025-12-05", "Amended by Act 19 of 2025"],
].map(([effectiveDate, basis]) => ({ effectiveDate, basis, sourceUrl: `https://sso.agc.gov.sg/Act/PDPA2012?DocDate=${effectiveDate.replaceAll("-", "")}` }));

export const pdpaRecord: RegulationRecord = {
  id: "PDPA2012",
  title: "Personal Data Protection Act 2012",
  kind: "act",
  status: "current",
  source: "Singapore Statutes Online",
  sourceUrl: "https://sso.agc.gov.sg/Act/PDPA2012",
  currentAsAt: "2026-08-31",
  versions: pdpaVersions,
  lifecycle: [
    { date: "2020-05-14", stage: "consultation", label: "Public consultation opened", detail: "MCI and PDPC published the draft amendment proposal for public consultation.", sourceUrl: "https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/press-room/2020/media-release---launch-of-public-consult-of-pdp-%28amendment%29-bill-2020---14-may-2020.pdf" },
    { date: "2020-10-05", stage: "bill", label: "Amendment Bill introduced", detail: "Personal Data Protection (Amendment) Bill No. 37/2020 was published.", sourceUrl: "https://sso.agc.gov.sg/Bills-Supp/37-2020/Published/20201005" },
    { date: "2020-11-02", stage: "passed", label: "Passed by Parliament", detail: "Parliament passed the Personal Data Protection (Amendment) Bill.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/" },
    { date: "2020-11-25", stage: "assent", label: "Presidential assent", detail: "The President assented to the amendment Act.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/" },
    { date: "2020-12-10", stage: "published", label: "Amendment Act published", detail: "Personal Data Protection (Amendment) Act 2020 (Act 40 of 2020) was published.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/" },
    { date: "2021-02-01", stage: "commenced", label: "First phase commenced", detail: "Most amendments, including the mandatory data-breach notification framework, took effect.", sourceUrl: "https://www.pdpc.gov.sg/news-and-events/announcements/2021/01/amendments-to-the-personal-data-protection-act-take-effect-from-1-february-2021" },
    { date: "2022-10-01", stage: "commenced", label: "Financial penalty amendments commenced", detail: "Section 24 of the amendment Act commenced.", sourceUrl: "https://sso.agc.gov.sg/SL-Supp/S767-2022/Published/20220930" },
    { date: "2025-12-05", stage: "consolidated", label: "Current amendment incorporated", detail: "SSO incorporated Act 19 of 2025 into the consolidated PDPA version.", sourceUrl: "https://sso.agc.gov.sg/Act/PDPA2012" },
  ],
  latestChange: {
    effectiveDate: "2025-12-05",
    instrument: "Statutes (Miscellaneous Amendments) Act 2025 (Act 19 of 2025)",
    summary: "The amendment deleted paragraph 3(a) of Division 1, Part 3 of the Second Schedule.",
    affectedProvision: "Second Schedule, Part 3, Division 1, paragraph 3(a)",
    sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/19-2025/Published/20251205",
  },
};

const catalogKey = "Regulations/catalog.json";
const overlaysKey = "Regulations/overlays.json";

export async function readRegulationCatalog(): Promise<RegulationCatalog> {
  try {
    const response = await getR2Object(catalogKey);
    if (response.ok) {
      const catalog = await response.json() as RegulationCatalog;
      const withoutSeed = catalog.instruments.filter((item) => item.id !== pdpaRecord.id);
      return { ...catalog, instruments: [pdpaRecord, ...withoutSeed] };
    }
  } catch {
    // The verified PDPA record remains available before the first scheduled catalogue sync.
  }
  return { fetchedAt: null, source: "Singapore Statutes Online", sourceUrl: "https://sso.agc.gov.sg/", instruments: [pdpaRecord] };
}

export async function writeRegulationCatalog(catalog: RegulationCatalog) {
  await putR2Json(catalogKey, catalog);
}

export async function readRegulationOverlays(): Promise<RegulationOverlay[]> {
  try {
    const response = await getR2Object(overlaysKey);
    if (response.ok) return await response.json() as RegulationOverlay[];
  } catch {}
  return [];
}

export async function writeRegulationOverlay(overlay: RegulationOverlay) {
  const overlays = await readRegulationOverlays();
  const next = [...overlays.filter((item) => item.regulationId !== overlay.regulationId), overlay];
  await putR2Json(overlaysKey, next);
}
