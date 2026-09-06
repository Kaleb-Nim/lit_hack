import type { RegulationId } from "@/lib/regulatory-workspace";

export type RegulatorySource = {
  date: string;
  publisher: string;
  title: string;
  takeaway: string;
  url: string;
  kind: "Official record" | "News context" | "Practitioner analysis";
};

export type RegulatoryJourney = {
  whyPassed: string[];
  workflowUse: string;
  sources: RegulatorySource[];
};

export const REGULATORY_JOURNEYS: Record<RegulationId, RegulatoryJourney> = {
  PDPA2012: {
    whyPassed: [
      "Create a national baseline for responsible private-sector use of personal data while supporting Singapore's position as a trusted business hub.",
      "Update that baseline for a data-driven economy by expanding carefully defined uses of data and strengthening organisational accountability.",
      "Give breaches and serious mishandling clearer consequences through mandatory notification, individual offences and a stronger penalty framework.",
    ],
    workflowUse: "Use the official records to establish the operative rule and date. Use reporting and practitioner analysis to understand the debate, likely business impact and the clauses worth triaging first.",
    sources: [
      { date: "2 Nov 2020", publisher: "PDPC", title: "Amendments to the PDPA passed", takeaway: "Official explanation of the digital-economy rationale and the reform package approved by Parliament.", url: "https://www.pdpc.gov.sg/news-and-events/press-room/2020/11/amendments-to-the-personal-data-protection-act-and-spam-control-act-passed", kind: "Official record" },
      { date: "10 Dec 2020", publisher: "Singapore Statutes Online", title: "Personal Data Protection (Amendment) Act 2020", takeaway: "Authoritative enacted text, passage and assent record, and the provisions used for clause-level review.", url: "https://sso.agc.gov.sg/Acts-Supp/40-2020/", kind: "Official record" },
      { date: "5 Oct 2020", publisher: "CNA", title: "Companies face much higher financial penalties for personal data breaches", takeaway: "Contemporary reporting on the proposed penalty increase, breach notification and business impact when the Bill was introduced.", url: "https://www.channelnewsasia.com/singapore/companies-face-much-higher-financial-penalties-personal-data-breaches-5665276", kind: "News context" },
      { date: "2 Nov 2020", publisher: "CNA", title: "MPs question scope and business impact of PDPA changes", takeaway: "Records the parliamentary concerns behind the final balance between data use, accountability and regulatory coverage.", url: "https://www.channelnewsasia.com/singapore/changes-data-protection-act-mps-ask-why-theres-different-law-govt-concerned-about-impact-businesses-5662901", kind: "News context" },
      { date: "Nov 2020", publisher: "Allen & Gledhill", title: "PDPA Amendment Bill passed", takeaway: "A legal-practice summary of breach notification, data portability, permitted-use pathways and the increased penalty cap.", url: "https://www.allenandgledhill.com/sg/publication/articles/17160/personal-data-protection-amendment-bill-passed-to-introduce-mandatory-data-breach-notification-data-portability-requirement-and-increased-financial-penalty-cap", kind: "Practitioner analysis" },
    ],
  },
  WFA2025: {
    whyPassed: [
      "Turn long-standing tripartite fair-employment guidelines into enforceable protection against the forms of workplace discrimination seen most often in complaints.",
      "Give workers a real route to redress while retaining mediation, education and workplace harmony as the default approach.",
      "Set clearer duties for hiring, employment decisions, grievances and retaliation without making employment relations unnecessarily litigious or prescriptive.",
    ],
    workflowUse: "Treat Act 8 of 2025 and Act 22 of 2025 as one readiness programme: first identify affected employment documents, then preserve evidence and grievance processes for the future claims framework.",
    sources: [
      { date: "4 Aug 2023", publisher: "Ministry of Manpower", title: "Government accepts the Tripartite Committee's recommendations", takeaway: "The clearest official account of the policy balance: protect workers, preserve harmony and support employers.", url: "https://www.mom.gov.sg/newsroom/press-releases/2023/0804-government-accepts-tripartite-committee-final-recommendations-for-wfl", kind: "Official record" },
      { date: "12 Nov 2024", publisher: "Ministry of Manpower", title: "Workplace Fairness Bill first-reading factsheet", takeaway: "Explains why the law builds on TGFEP and why the substantive duties and dispute process were split into two Bills.", url: "https://www.mom.gov.sg/newsroom/press-releases/2024/1112-fact-sheet-on-workplace-fairness-bill-first-reading", kind: "Official record" },
      { date: "13 Feb 2023", publisher: "CNA", title: "Tripartite committee proposes workplace-fairness protections", takeaway: "Contemporary coverage of the first proposed characteristics, complaint evidence and the preference for mediation.", url: "https://www.channelnewsasia.com/singapore/anti-discrimination-workplace-law-fairness-3273846", kind: "News context" },
      { date: "8 Jan 2025", publisher: "CNA", title: "Singapore passes landmark anti-discrimination Bill", takeaway: "Summarises the parliamentary debate over scope, protected groups, enforcement and the education-first approach.", url: "https://www.channelnewsasia.com/singapore/singapore-passes-landmark-anti-discrimination-bill-workers-4845501", kind: "News context" },
      { date: "4 Nov 2025", publisher: "CNA", title: "Workplace fairness law completed; end-2027 target", takeaway: "Connects the second Bill's mediation and claims process to the first Act and reports the current implementation target.", url: "https://www.channelnewsasia.com/singapore/landmark-workplace-fairness-law-passed-take-effect-in-2027-5444626", kind: "News context" },
    ],
  },
};
