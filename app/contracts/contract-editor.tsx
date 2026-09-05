"use client";

import { Check, Download, FileText, LoaderCircle, RotateCcw, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PearsonHeader } from "@/components/pearson-header";
import { downloadBlob, fileStem } from "@/lib/download";
import { buildWorkingCopy, readDocxParagraphs, type EditableParagraph } from "@/lib/docx-working-copy";
import { regulationById, type RegulationId } from "@/lib/regulatory-workspace";

export function ContractEditor({ contractKey, regulationId }: { contractKey: string; regulationId: RegulationId }) {
  const [source, setSource] = useState<ArrayBuffer | null>(null);
  const [paragraphs, setParagraphs] = useState<EditableParagraph[]>([]);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error" | "saving">("loading");
  const [message, setMessage] = useState("");
  const regulation = regulationById(regulationId);
  const fileName = decodeURIComponent(contractKey.split("/").at(-1) ?? "contract.docx");
  const sourceUrl = `/api/contracts/${contractKey.split("/").map(encodeURIComponent).join("/")}`;

  useEffect(() => {
    const controller = new AbortController();
    fetch(sourceUrl, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("The source document could not be loaded from R2.");
        const buffer = await response.arrayBuffer();
        const extracted = await readDocxParagraphs(buffer);
        setSource(buffer);
        setParagraphs(extracted);
        setState("ready");
      })
      .catch((error: Error) => { if (error.name !== "AbortError") { setMessage(error.message); setState("error"); } });
    return () => controller.abort();
  }, [sourceUrl]);

  const changedCount = Object.keys(edits).filter((key) => edits[Number(key)] !== paragraphs.find((paragraph) => paragraph.index === Number(key))?.text).length;
  const visible = useMemo(() => paragraphs.filter((paragraph) => !query || (edits[paragraph.index] ?? paragraph.text).toLowerCase().includes(query.toLowerCase())), [edits, paragraphs, query]);

  const download = async () => {
    if (!source) return;
    setState("saving");
    setMessage("");
    try {
      const changes = new Map<number, string>();
      Object.entries(edits).forEach(([index, text]) => changes.set(Number(index), text));
      const blob = await buildWorkingCopy(source, changes);
      const ok = downloadBlob(`${fileStem(fileName)}_Pearson_working_copy.docx`, blob);
      setMessage(ok ? "Working copy downloaded. The R2 original was not changed." : "The browser blocked the download.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The working copy could not be created.");
    } finally {
      setState("ready");
    }
  };

  return <div className="shell">
    <PearsonHeader kicker="Word working copy" title={fileName} meta={regulation.shortName} position={`${changedCount} edited`} actions={<><Link href={`/contracts?regulation=${regulationId}`} className="btn btn--outline-light">← Contract library</Link><button className="btn btn--gold" onClick={download} disabled={!source || state === "saving"}><Download size={14} />{state === "saving" ? "Preparing…" : "Download copy"}</button></>} />
    <main className="editor-page">
      <aside className="editor-context">
        <span className="eyebrow">Review context</span><h1>{regulation.title}</h1><p>{regulation.summary}</p>
        <div className="purity-card"><ShieldCheck size={18} /><div><strong>Original protected</strong><p>This editor only fetched the R2 object with GET. Your text changes stay in browser memory and are applied to a downloaded copy.</p></div></div>
        <a href={sourceUrl} target="_blank" rel="noreferrer" className="btn btn--ghost">Open original source</a>
      </aside>
      <section className="document-editor">
        <div className="document-editor__bar"><div><span className="eyebrow">Editable Word text</span><strong>{paragraphs.length} paragraphs · {changedCount} changed</strong></div><label><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find text" /></label><button className="btn btn--ghost btn--sm" onClick={() => setEdits({})} disabled={!changedCount}><RotateCcw size={13} />Reset edits</button></div>
        <div className="document-editor__scroll">
          {state === "loading" && <div className="editor-message"><LoaderCircle className="spin" />Reading the Word document from R2</div>}
          {state === "error" && <div className="editor-message">{message}</div>}
          {(state === "ready" || state === "saving") && <article className="word-paper">
            <div className="word-paper__title"><FileText size={18} /><div><strong>{fileName}</strong><small>Browser working copy</small></div></div>
            {visible.map((paragraph, order) => {
              const value = edits[paragraph.index] ?? paragraph.text;
              const changed = value !== paragraph.text;
              return <div className={`editable-paragraph${changed ? " changed" : ""}`} key={paragraph.index}><span>{order + 1}</span><textarea value={value} rows={Math.max(2, Math.ceil(value.length / 105))} onChange={(event) => setEdits((current) => ({ ...current, [paragraph.index]: event.target.value }))} aria-label={`Paragraph ${order + 1}`} />{changed && <button onClick={() => setEdits((current) => { const next = { ...current }; delete next[paragraph.index]; return next; })} aria-label={`Reset paragraph ${order + 1}`}><RotateCcw size={13} /></button>}</div>;
            })}
          </article>}
        </div>
        <footer className="editor-footer"><span aria-live="polite">{message || <><Check size={13} />Changes are local until you download a copy.</>}</span><button className="btn btn--gold" onClick={download} disabled={!source || state === "saving"}><Download size={14} />Download Word working copy</button></footer>
      </section>
    </main>
  </div>;
}
