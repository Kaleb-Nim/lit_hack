export type RegulationId = "PDPA2012" | "WFA2025";

export type WorkspaceRegulation = {
  id: RegulationId;
  shortName: string;
  title: string;
  status: "Current" | "Uncommenced";
  statusDetail: string;
  jurisdiction: string;
  summary: string;
  sourceUrl: string;
  detailUrl: string;
  contractQuery: string;
  lifecycle: Array<{
    date: string;
    stage: string;
    title: string;
    description: string;
    sourceUrl: string;
    current?: boolean;
  }>;
  obligations: Array<{ ref: string; title: string; detail: string; state: "Review" | "Monitor" }>;
};

export const WORKSPACE_REGULATIONS: WorkspaceRegulation[] = [
  {
    id: "PDPA2012",
    shortName: "PDPA",
    title: "Personal Data Protection Act 2012",
    status: "Current",
    statusDetail: "Current consolidated Act · historical comparison available",
    jurisdiction: "Singapore · Data protection",
    summary:
      "Review contracts against mandatory breach notification, consent pathways, accountability, individual offences and the current financial-penalty framework.",
    sourceUrl: "https://sso.agc.gov.sg/Act/PDPA2012",
    detailUrl: "/regulations/pdpa",
    contractQuery: "/contracts?regulation=PDPA2012",
    lifecycle: [
      { date: "2020-10-05", stage: "Introduced", title: "Amendment Bill introduced", description: "Personal Data Protection (Amendment) Bill 37/2020 received its first reading.", sourceUrl: "https://www.parliament.gov.sg/docs/default-source/default-document-library/personal-data-protection-%28amendment%29-bill-37-2020.pdf" },
      { date: "2020-11-02", stage: "Passed", title: "Passed by Parliament", description: "Parliament passed the Personal Data Protection (Amendment) Bill.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/Published/20201210?DocDate=20201210" },
      { date: "2020-11-25", stage: "Assent", title: "Presidential assent", description: "The President assented to the Personal Data Protection (Amendment) Act 2020.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/Published/20201210?DocDate=20201210" },
      { date: "2020-12-10", stage: "Published", title: "Amendment Act published", description: "Act 40 of 2020 was published in the Acts Supplement.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/Published/20201210?DocDate=20201210" },
      { date: "2021-02-01", stage: "Commenced", title: "Principal provisions commenced", description: "Most provisions, including the mandatory breach-notification framework, came into operation.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/Published/20201210?DocDate=20201210", current: true },
      { date: "2022-10-01", stage: "Commenced", title: "Higher penalty framework commenced", description: "Section 24, introducing the current financial-penalty framework, came into operation.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/Published/20201210?DocDate=20201210", current: true },
    ],
    obligations: [
      { ref: "s. 26D", title: "Notifiable data breaches", detail: "Assessment and regulator-notification workflow", state: "Review" },
      { ref: "First Schedule, Part 3", title: "Legitimate interests", detail: "Assessment, safeguards and retained records", state: "Review" },
      { ref: "Part 6B", title: "Data portability", detail: "Enacted but not commenced", state: "Monitor" },
    ],
  },
  {
    id: "WFA2025",
    shortName: "WFA",
    title: "Workplace Fairness Act 2025",
    status: "Uncommenced",
    statusDetail: "Act 8 of 2025 · uncommenced as at 6 Sep 2026",
    jurisdiction: "Singapore · Employment",
    summary:
      "Prepare employment documents and workplace processes for statutory protections covering hiring, employment decisions, dismissal, grievances and retaliation.",
    sourceUrl: "https://sso.agc.gov.sg/Act/WFA2025/Uncommenced/20250304073414?DocDate=20250213",
    detailUrl: "/regulations/wfa",
    contractQuery: "/contracts?regulation=WFA2025",
    lifecycle: [
      { date: "2025-01-08", stage: "Passed", title: "Passed by Parliament", description: "Parliament passed the Workplace Fairness Bill.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/8-2025/Published/20250213?DocDate=20250213" },
      { date: "2025-02-03", stage: "Assent", title: "Presidential assent", description: "The Workplace Fairness Act 2025 received presidential assent.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/8-2025/Published/20250213?DocDate=20250213" },
      { date: "2025-02-13", stage: "Published", title: "Act published", description: "Act 8 of 2025 was published and remains uncommenced.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/8-2025/Published/20250213?DocDate=20250213", current: true },
    ],
    obligations: [
      { ref: "ss. 17–19", title: "Workplace discrimination", detail: "Employment decisions, policies and advertisements", state: "Review" },
      { ref: "s. 26", title: "Fair consideration", detail: "Fair access to employment opportunities", state: "Review" },
      { ref: "ss. 27–28", title: "Grievances and retaliation", detail: "Process, confidentiality and anti-retaliation controls", state: "Review" },
    ],
  },
];

export function isRegulationId(value: string | null | undefined): value is RegulationId {
  return WORKSPACE_REGULATIONS.some((regulation) => regulation.id === value);
}

export function regulationById(value: string | null | undefined) {
  return WORKSPACE_REGULATIONS.find((regulation) => regulation.id === value) ?? WORKSPACE_REGULATIONS[0];
}

export function contractMatchesRegulation(key: string, regulationId: RegulationId) {
  if (regulationId === "PDPA2012") return true;
  return /employment|employee|offer|intern|staff|workplace|hr[\s/_-]/i.test(decodeURIComponent(key));
}
