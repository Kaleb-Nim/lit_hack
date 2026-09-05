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
