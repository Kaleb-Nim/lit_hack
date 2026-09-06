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
    sourceLabel?: string;
    sourceKind?: "Official" | "News";
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
      { date: "2011-09", stage: "Consultation", title: "Data-protection framework tested publicly", description: "Two public consultations developed the proposed national data-protection framework and Do Not Call regime.", sourceUrl: "https://www.imda.gov.sg/regulations-and-licences/regulations/consultations/consultation-papers/2016/public-consultation-by-mica-on-proposed-personal-data-protection-bill-for-singapore", sourceLabel: "IMDA consultation record" },
      { date: "2012-03-19", stage: "Draft Bill", title: "Draft PDPA opened for consultation", description: "The draft Bill translated the consultation feedback into proposed statutory duties before Parliament considered it.", sourceUrl: "https://www.imda.gov.sg/regulations-and-licences/regulations/consultations/consultation-papers/2016/public-consultation-by-mica-on-proposed-personal-data-protection-bill-for-singapore", sourceLabel: "IMDA consultation record" },
      { date: "2012-10-15", stage: "Passed", title: "Original PDPA passed", description: "Parliament passed the Personal Data Protection Bill after a year-long public consultation process.", sourceUrl: "https://www.nas.gov.sg/archivesonline/data/pdfdoc/20121227005/mci_press_release_personal_date_protection_act_20_dec_2012.pdf", sourceLabel: "MCI archival release" },
      { date: "2013-01-02", stage: "Institution", title: "PDPC established", description: "The regulator was established and the Act began a phased implementation programme.", sourceUrl: "https://www.pdpc.gov.sg/overview-of-pdpa/the-legislation/personal-data-protection-act", sourceLabel: "PDPC overview" },
      { date: "2014-01-02", stage: "Commenced", title: "Do Not Call rules commenced", description: "The Do Not Call Registry provisions became operational ahead of the main data-protection rules.", sourceUrl: "https://www.pdpc.gov.sg/overview-of-pdpa/the-legislation/personal-data-protection-act", sourceLabel: "PDPC overview" },
      { date: "2014-07-02", stage: "Commenced", title: "Main protection rules commenced", description: "The core obligations governing collection, use, disclosure, access, correction, security and retention took effect.", sourceUrl: "https://www.pdpc.gov.sg/overview-of-pdpa/the-legislation/personal-data-protection-act", sourceLabel: "PDPC overview" },
      { date: "2017-07-27", stage: "Policy review", title: "Digital-economy review began", description: "PDPC consulted on mandatory breach notification and new approaches to using data without consent in defined circumstances.", sourceUrl: "https://www.pdpc.gov.sg/news-and-events/announcements/2017/07/first-public-consultation-on-review-of-the-pdpa", sourceLabel: "PDPC consultation" },
      { date: "2020-05-14", stage: "Draft Bill", title: "Amendment Bill opened for consultation", description: "A final draft package was tested publicly before introduction, including accountability, consent and enforcement reforms.", sourceUrl: "https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Press-Room/2020/Media-Release---Launch-of-Public-Consult-of-PDP-%28Amendment%29-Bill-2020---14-May-2020.pdf", sourceLabel: "MCI / PDPC release" },
      { date: "2020-10-05", stage: "Introduced", title: "Amendment Bill introduced", description: "Bill 37/2020 proposed mandatory breach notification, expanded permitted-use pathways, stronger accountability and higher penalties.", sourceUrl: "https://sso.agc.gov.sg/Bills-Supp/37-2020/Published/20201005?DocDate=20201005", sourceLabel: "Bill 37/2020" },
      { date: "2020-11-02", stage: "Passed", title: "Amendment Bill passed", description: "Parliament passed the reforms following debate about innovation, individual protection and organisational accountability.", sourceUrl: "https://www.pdpc.gov.sg/news-and-events/press-room/2020/11/amendments-to-the-personal-data-protection-act-and-spam-control-act-passed", sourceLabel: "PDPC passage record" },
      { date: "2020-12-10", stage: "Published", title: "Amendment Act published", description: "Act 40 of 2020 recorded passage on 2 November and presidential assent on 25 November 2020.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/", sourceLabel: "Act 40 of 2020" },
      { date: "2021-02-01", stage: "Commenced", title: "Principal reforms commenced", description: "Most reforms, including mandatory breach notification, deemed consent changes and individual offences, came into operation.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/", sourceLabel: "Act 40 of 2020", current: true },
      { date: "2022-10-01", stage: "Commenced", title: "Higher penalty framework commenced", description: "The turnover-based financial-penalty framework took effect; enacted data-portability provisions remain a separate monitoring item.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/40-2020/", sourceLabel: "Act 40 of 2020", current: true },
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
      { date: "2007", stage: "Policy foundation", title: "Tripartite fair-employment guidelines introduced", description: "The TGFEP established an education-led framework that the later legislation would preserve and strengthen.", sourceUrl: "https://www.mom.gov.sg/newsroom/press-releases/2024/1112-fact-sheet-on-workplace-fairness-bill-first-reading", sourceLabel: "MOM factsheet" },
      { date: "2021-08-29", stage: "Policy commitment", title: "Legislation announced", description: "The National Day Rally commitment began the move from tripartite guidelines to enforceable workplace-fairness protections.", sourceUrl: "https://www.mom.gov.sg/-/media/mom/documents/press-releases/2023/tripartite-committee-on-workplace-fairness-final-report.pdf", sourceLabel: "Tripartite final report" },
      { date: "2023-02-13", stage: "Interim report", title: "Initial protections proposed", description: "The Tripartite Committee proposed protected characteristics, employer duties and a mediation-led enforcement model.", sourceUrl: "https://www.channelnewsasia.com/singapore/anti-discrimination-workplace-law-fairness-3273846", sourceLabel: "CNA report", sourceKind: "News" },
      { date: "2023-08-04", stage: "Policy accepted", title: "Government accepted final recommendations", description: "All 22 recommendations were accepted, balancing worker protection, workplace harmony and practical compliance for employers.", sourceUrl: "https://www.mom.gov.sg/newsroom/press-releases/2023/0804-government-accepts-tripartite-committee-final-recommendations-for-wfl", sourceLabel: "MOM announcement" },
      { date: "2024-11-12", stage: "Introduced", title: "First Workplace Fairness Bill introduced", description: "The first of two Bills defined prohibited discrimination and employer obligations while allowing preparation time.", sourceUrl: "https://www.mom.gov.sg/newsroom/press-releases/2024/1112-fact-sheet-on-workplace-fairness-bill-first-reading", sourceLabel: "MOM first-reading factsheet" },
      { date: "2025-01-08", stage: "Passed", title: "Core Workplace Fairness Bill passed", description: "Parliament unanimously passed the first Bill after debating scope, protected characteristics and implementation.", sourceUrl: "https://www.mom.gov.sg/newsroom/press-releases/2025/passing-of-workplace-fairness-bill-marks-next-step-in-building-fair-and-harmonious-workplaces", sourceLabel: "MOM passage release" },
      { date: "2025-02-13", stage: "Published", title: "Workplace Fairness Act published", description: "Act 8 of 2025 recorded presidential assent on 3 February and publication on 13 February; it remains uncommenced.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/8-2025/Published/20250213?DocDate=20250213", sourceLabel: "Act 8 of 2025" },
      { date: "2025-08-26", stage: "Consultation", title: "Dispute-resolution framework consulted on", description: "MOM sought feedback on how workplace-discrimination claims should move through mediation, tribunals and the courts.", sourceUrl: "https://www.mom.gov.sg/newsroom/press-releases/2025/0826-public-consultation-on-workplace-fairness-act-second-bill", sourceLabel: "MOM consultation" },
      { date: "2025-10-14", stage: "Introduced", title: "Dispute Resolution Bill introduced", description: "The second Bill supplied the claim process and remedies needed to make the substantive protections operational.", sourceUrl: "https://www.mom.gov.sg/newsroom/press-releases/2025/1014-workplace-fairness-dispute-resolution-bill-factsheet", sourceLabel: "MOM second-bill factsheet" },
      { date: "2025-11-04", stage: "Passed", title: "Dispute Resolution Bill passed", description: "Parliament approved the mediation-first claims framework, completing the two-Bill legislative package.", sourceUrl: "https://www.mom.gov.sg/newsroom/press-releases/2025/workplace-fairness--dispute-resolution----bill-press-release", sourceLabel: "MOM passage release" },
      { date: "2025-12-23", stage: "Published", title: "Dispute Resolution Act published", description: "Act 22 of 2025 recorded presidential assent on 25 November and remains uncommenced.", sourceUrl: "https://sso.agc.gov.sg/Acts-Supp/22-2025", sourceLabel: "Act 22 of 2025", current: true },
      { date: "End 2027", stage: "Target", title: "Government implementation target", description: "The Government aims to bring the complete framework into force by end-2027. This is a target, not a commenced obligation.", sourceUrl: "https://www.mom.gov.sg/newsroom/speeches/2025/1104-second-reading-of-workplace-fairness-dispute-resolution-bill", sourceLabel: "MOM second-reading speech", current: true },
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
