"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, FileUp, LoaderCircle, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import type { LawChangeDraft } from "@/lib/regulation-intake";

export function LawChangeIntake() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<LawChangeDraft | null>(null);
  const [state, setState] = useState<"idle" | "researching" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function research(event: React.FormEvent) {
    event.preventDefault();
    setState("researching"); setMessage(""); setDraft(null);
    const body = new FormData(); body.set("prompt", prompt); if (file) body.set("file", file);
    try {
      const response = await fetch("/api/regulations/discover", { method: "POST", body });
      const data = await response.json() as { draft?: LawChangeDraft; error?: string };
      if (!response.ok || !data.draft) throw new Error(data.error || "Research failed.");
      setDraft(data.draft); setState("idle");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Research failed."); setState("error"); }
  }

  async function save() {
    if (!draft) return;
    setState("saving"); setMessage("");
    try {
      const response = await fetch("/api/regulations/intake", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draft, confirmed: true }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save the change.");
      setState("saved"); setMessage("Saved to the reviewed regulatory intake in R2.");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Could not save the change."); }
  }

  return (
    <main className="law-intake">
      <header className="law-intake__intro"><span className="eyebrow"><Sparkles size={13} /> AI-assisted regulatory research</span><h1>Add a real law change from official sources.</h1><p>Describe the change or attach source material. The assistant searches Singapore government sources and prepares a review draft; it does not silently create current law.</p></header>
      <div className="law-intake__grid">
        <form className="law-form" onSubmit={research}>
          <div className="law-form__title"><Search size={18} /><div><strong>Research brief</strong><small>One law or amendment per request</small></div></div>
          <label><span>What changed?</span><textarea required={!file} rows={7} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Example: Find the latest official Workplace Fairness Act commencement position and explain which employment contract terms need review." maxLength={8000} /></label>
          <label className="law-upload"><FileUp size={18} /><span><strong>{file ? file.name : "Attach a source file"}</strong><small>PDF, DOCX, TXT or Markdown · maximum 10 MB</small></span><input type="file" accept=".pdf,.docx,.txt,.md" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
          <div className="law-form__guard"><ShieldCheck size={15} /><p><strong>Official-source guardrail</strong>Search is restricted to SSO, MOM, PDPC, MDDI and Parliament. Uploaded files are analysed for this request and are not written to your R2 contract library.</p></div>
          <button className="btn btn--gold btn--block" disabled={state === "researching" || (!prompt && !file)}>{state === "researching" ? <LoaderCircle className="spin" size={16} /> : <Sparkles size={16} />}{state === "researching" ? "Researching official sources…" : "Create review draft"}</button>
          {message && <p className={`law-message ${state === "saved" ? "success" : "error"}`} role="status">{state === "saved" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{message}</p>}
        </form>

        <section className="law-result" aria-live="polite">
          {!draft && <div className="law-result__empty"><Sparkles size={24} /><strong>No draft yet</strong><p>The before/now comparison, effective dates and source links will appear here for lawyer review.</p></div>}
          {draft && <>
            <div className="law-result__status"><span>AI research draft</span><em>{draft.confidence} confidence</em></div>
            <h2>{draft.title}</h2><p className="law-result__meta">{draft.shortName} · {draft.legalStatus} · position as at {draft.statusAsAt}</p>
            <p className="law-result__summary">{draft.summary}</p>
            <div className="law-changes">{draft.changes.map((change, index) => <article key={`${change.area}-${index}`}><div><strong>{change.area}</strong><time>{change.effectiveDate}</time></div><dl><dt>Before</dt><dd>{change.before}</dd><dt>Now</dt><dd>{change.now}</dd></dl><p><b>Contract impact:</b> {change.impact}</p></article>)}</div>
            <div className="law-sources"><strong>Official sources</strong>{draft.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.title}<ExternalLink size={12} /><small>{source.publisher}</small></a>)}</div>
            {draft.caveats.length > 0 && <div className="law-caveats"><AlertTriangle size={15} /><div><strong>Review points</strong>{draft.caveats.map((item) => <p key={item}>{item}</p>)}</div></div>}
            <div className="law-result__review"><p><strong>Lawyer confirmation required.</strong> Saving marks this as a reviewed team record. It does not alter the official source or any contract.</p><button className="btn btn--navy" onClick={save} disabled={state === "saving" || state === "saved" || draft.sources.length === 0}>{state === "saving" ? <LoaderCircle className="spin" size={15} /> : <CheckCircle2 size={15} />}{state === "saved" ? "Added to workspace" : state === "saving" ? "Saving…" : "Confirm and add"}</button></div>
          </>}
        </section>
      </div>
    </main>
  );
}
