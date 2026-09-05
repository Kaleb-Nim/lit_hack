"use client";

import { AlertTriangle, Check, ExternalLink, Sparkles } from "lucide-react";
import type { ContractEditSuggestion, ContractReviewResult } from "@/lib/contract-review-model";

export function EditSuggestions({ review, onApply, onSkip, accepted = new Set(), skipped = new Set() }: { review: ContractReviewResult; onApply: (suggestion: ContractEditSuggestion) => void; onSkip?: (suggestion: ContractEditSuggestion) => void; accepted?: Set<string>; skipped?: Set<string> }) {
  return <section className="edit-suggestions">
    <div className="edit-suggestions__head"><div><span className="eyebrow"><Sparkles size={13} /> AI drafting review</span><strong>{review.suggestions.length} suggested edit{review.suggestions.length === 1 ? "" : "s"}</strong></div><span>{review.model}</span></div>
    <p className="edit-suggestions__assessment">{review.overallAssessment}</p>
    {review.suggestions.length === 0 && <div className="suggestion-empty"><Check size={15} />No material drafting change was identified. A lawyer should still verify the source.</div>}
    <div className="suggestion-list">{review.suggestions.map((suggestion) => <article key={suggestion.id}>
      <div className="suggestion-title"><span>{suggestion.action}</span><strong>{suggestion.clause}</strong><em>{suggestion.confidence}</em></div>
      {suggestion.originalText && <div className="suggestion-copy before"><small>Current wording</small><p>{suggestion.originalText}</p></div>}
      <div className="suggestion-copy after"><small>Suggested wording</small><p>{suggestion.proposedText}</p></div>
      <p className="suggestion-reason">{suggestion.reason}</p>
      <div className="suggestion-foot"><a href={suggestion.sourceUrl} target="_blank" rel="noreferrer">{suggestion.legalBasis}<ExternalLink size={11} /></a><span>{onSkip && <button className="skip" onClick={() => onSkip(suggestion)} disabled={accepted.has(suggestion.id) || skipped.has(suggestion.id)}>{skipped.has(suggestion.id) ? "Skipped" : "Skip"}</button>}<button onClick={() => onApply(suggestion)} disabled={accepted.has(suggestion.id)}>{accepted.has(suggestion.id) ? "Applied" : suggestion.action === "insert" ? "Add to working copy" : suggestion.action === "amend" ? "Apply suggestion" : "Use suggested wording"}</button></span></div>
    </article>)}</div>
    {review.caveats.length > 0 && <div className="review-caveats"><AlertTriangle size={14} /><div><strong>Lawyer review points</strong>{review.caveats.map((caveat) => <p key={caveat}>{caveat}</p>)}</div></div>}
  </section>;
}
