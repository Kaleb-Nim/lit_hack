export type ContractParagraph = { index: number; text: string };

export type ContractEditSuggestion = {
  id: string;
  paragraphIndex: number;
  action: "amend" | "insert" | "review";
  clause: string;
  originalText: string;
  proposedText: string;
  reason: string;
  legalBasis: string;
  sourceUrl: string;
  confidence: "high" | "medium" | "low";
};

export type ContractReviewResult = {
  documentTitle: string;
  documentType: string;
  overallAssessment: string;
  paragraphs: ContractParagraph[];
  suggestions: ContractEditSuggestion[];
  sources: Array<{ title: string; url: string }>;
  caveats: string[];
  model: string;
};
