"use client";

import { Download, FileText, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PearsonHeader } from "@/components/pearson-header";
import { buildDocxBlob } from "@/lib/docx";
import { downloadBlob, fileStem } from "@/lib/download";
import type { ContractEditSuggestion, ContractReviewResult } from "@/lib/contract-review-model";
import { regulationById, type RegulationId } from "@/lib/regulatory-workspace";
import { EditSuggestions } from "./edit-suggestions";
import { ReviewSessionTimer } from "./review-session-timer";
import { useReviewSession } from "./use-review-session";

export function PdfContractWorkbench({ contractKey, regulationId }: { contractKey: string; regulationId: RegulationId }) {
  const regulation = regulationById(regulationId);
  const fileName = decodeURIComponent(contractKey.split("/").at(-1) ?? "contract.pdf");
  const sourceUrl = `/api/contracts/${contractKey.split("/").map(encodeURIComponent).join("/")}`;
  const [review, setReview] = useState<ContractReviewResult | null>(null);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [inserted, setInserted] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "reviewing" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const session = useReviewSession();

  async function runReview() {
    setState("reviewing"); setMessage("");
    try {
      const response = await fetch("/api/contracts/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: contractKey, regulationId }) });
      const data = await response.json() as { review?: ContractReviewResult; error?: string };
      if (!response.ok || !data.review) throw new Error(data.error || "The PDF could not be converted and reviewed.");
      setReview(data.review); setState("idle"); setMessage("Text-first conversion and drafting suggestions are ready.");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "The PDF could not be converted and reviewed."); }
  }

  function applySuggestion(suggestion: ContractEditSuggestion) {
    if (suggestion.action === "insert" || suggestion.paragraphIndex < 0) setInserted((current) => [...current, suggestion.proposedText]);
    else setEdits((current) => ({ ...current, [suggestion.paragraphIndex]: suggestion.proposedText }));
    session.recordSuggestion(suggestion.id, "accepted");
  }

  async function download() {
    if (!review) return;
    setState("saving"); setMessage("");
    try {
      const text = [...review.paragraphs.map((paragraph) => edits[paragraph.index] ?? paragraph.text), ...inserted];
      const blob = await buildDocxBlob({ title: review.documentTitle || fileStem(fileName), description: `Editable text-first conversion of ${fileName}`, blocks: [
        { kind: "kicker", text: "Converted working copy" }, { kind: "title", text: review.documentTitle || fileStem(fileName) },
        { kind: "subtitle", text: `Converted from ${fileName}. Verify layout, tables, signatures and page references against the source PDF.` }, { kind: "rule" },
        ...text.filter(Boolean).map((value) => ({ kind: "para" as const, text: value })),
      ] });
      const ok = downloadBlob(`${fileStem(fileName)}_Pearson_editable_copy.docx`, blob);
      setMessage(ok ? "Editable Word copy downloaded. The R2 PDF was not changed." : "The browser blocked the download."); setState("idle");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "The Word copy could not be created."); }
  }

  return <div className="shell">
    <PearsonHeader kicker="PDF conversion" title={fileName} meta={regulation.shortName} position={review ? `${review.suggestions.length} suggestions` : "Source only"} actions={<><Link href={`/contracts?regulation=${regulationId}`} className="btn btn--outline-light">← Contract library</Link><button className="btn btn--gold" onClick={download} disabled={!review || state === "saving"}><Download size={14} />Download Word copy</button></>} />
    <main className="pdf-workbench">
      <aside className="pdf-source"><div><span className="eyebrow">Original R2 source</span><h1>{fileName}</h1><p><ShieldCheck size={14} />This PDF remains unchanged.</p></div><iframe src={sourceUrl} title={`Original PDF ${fileName}`} /></aside>
      <section className="pdf-conversion">
        <div className="pdf-conversion__bar"><div><span className="eyebrow">Editable conversion</span><strong>{regulation.title}</strong></div><button className="btn btn--navy" onClick={runReview} disabled={state === "reviewing"}>{state === "reviewing" ? <LoaderCircle className="spin" size={14} /> : <Sparkles size={14} />}{state === "reviewing" ? "Converting and reviewing…" : review ? "Refresh suggestions" : "Convert and suggest edits"}</button></div>
        <div className="pdf-warning"><FileText size={15} /><p><strong>Text-first conversion</strong>Paragraph wording is editable, but complex tables, signatures, images, footnotes and exact pagination may not carry into Word. The PDF is sent to your configured OpenAI API project when you start conversion; Pearson requests no response storage. Verify the downloaded copy against the PDF.</p></div>
        {message && <p className={`pdf-message ${state === "error" ? "error" : ""}`} role="status">{message}</p>}
        {!review && <div className="pdf-empty"><Sparkles size={24} /><strong>Ready to compare</strong><p>The assistant will extract the PDF, verify the selected regulation using official sources, and propose clause-level wording.</p></div>}
        {review && <div className="pdf-conversion__scroll"><EditSuggestions review={review} onApply={applySuggestion} onSkip={(suggestion) => session.recordSuggestion(suggestion.id, "skipped")} accepted={session.accepted} skipped={session.skipped} /><article className="word-paper"><div className="word-paper__title"><FileText size={18} /><div><strong>{review.documentTitle}</strong><small>Converted browser working copy</small></div></div>{review.paragraphs.map((paragraph, order) => <div className={`editable-paragraph${edits[paragraph.index] !== undefined ? " changed" : ""}`} key={paragraph.index}><span>{order + 1}</span><textarea value={edits[paragraph.index] ?? paragraph.text} rows={Math.max(2, Math.ceil((edits[paragraph.index] ?? paragraph.text).length / 105))} onChange={(event) => { session.recordManual(paragraph.index); setEdits((current) => ({ ...current, [paragraph.index]: event.target.value })); }} /></div>)}{inserted.map((value, index) => <div className="editable-paragraph changed" key={`insert-${index}`}><span>NEW</span><textarea value={value} rows={Math.max(2, Math.ceil(value.length / 105))} onChange={(event) => { session.recordManual(`insert-${index}`); setInserted((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item)); }} /></div>)}</article></div>}
      </section>
    </main>
    <ReviewSessionTimer elapsedSeconds={session.elapsedSeconds} running={session.running} startedAt={session.startedAt} approvedAt={session.approvedAt} accepted={session.accepted.size} skipped={session.skipped.size} manualEdits={session.manualEdits.size} totalSuggestions={review?.suggestions.length ?? 0} onPause={session.pause} onResume={session.start} onApprove={session.approve} />
  </div>;
}
