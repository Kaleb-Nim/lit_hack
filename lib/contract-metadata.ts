export const DOCUMENT_TYPES = [
  "Agreement",
  "Policy",
  "Case study",
  "Article",
  "Offer letter",
  "Template",
  "Guidance",
  "Other",
] as const;
export type ContractDocumentType = (typeof DOCUMENT_TYPES)[number];

export function inferDocumentType(
  key: string,
  name: string,
): ContractDocumentType {
  const value = decodeURIComponent(`${key} ${name}`).toLowerCase();
  if (/\bpolic(?:y|ies)\b/.test(value)) return "Policy";
  if (/case[ _-]?study|judg(?:e)?ment|court decision|tribunal/.test(value))
    return "Case study";
  if (/\barticle\b|newsletter|legal update|commentary|blog/.test(value))
    return "Article";
  if (/offer[ _-]?letter|letter of offer/.test(value)) return "Offer letter";
  if (/precedent|template|\bmodel\b|vima/.test(value)) return "Template";
  if (/guide|handbook|advisory|checklist|practice note/.test(value))
    return "Guidance";
  if (/agreement|contract|\bnda\b|non[ -]?disclosure|deed|terms/.test(value))
    return "Agreement";
  return "Other";
}

export function inferclient(key: string, name: string) {
  const value = decodeURIComponent(`${key} ${name}`);
  const known: Array<[RegExp, string]> = [
    [/\bCapgemini\b/i, "Capgemini"],
    [/\bWhiteFern\b/i, "WhiteFern"],
    [/\bIPL24\b/i, "IPL24"],
    [/\bMeridian Labs\b/i, "Meridian Labs"],
    [/\bVIMA\b|Contracts[\\/]gen_s dad/i, "Shared template library"],
    [
      /Contracts[\\/]lawnet|lawnet\.com[ _-]?precedents/i,
      "Shared template library",
    ],
  ];
  return known.find(([pattern]) => pattern.test(value))?.[1] ?? "Unassigned";
}
