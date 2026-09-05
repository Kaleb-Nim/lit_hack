"use client";

import { Cloud, ExternalLink, FileText, LoaderCircle, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PearsonHeader } from "@/components/pearson-header";
import { contractMatchesRegulation, regulationById, type RegulationId } from "@/lib/regulatory-workspace";

type Contract = { id: string; key: string; name: string; size: number; lastModified: string; downloadUrl: string; format: string; editable: boolean };

export function ContractLibrary({ initialRegulation }: { initialRegulation: RegulationId }) {
  const [regulationId, setRegulationId] = useState<RegulationId>(initialRegulation);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const regulation = regulationById(regulationId);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contracts", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as { contracts?: Contract[] };
        if (!response.ok) throw new Error();
        setContracts(body.contracts ?? []);
        setState("ready");
      })
      .catch((error: Error) => { if (error.name !== "AbortError") setState("error"); });
    return () => controller.abort();
  }, []);

  const visible = useMemo(() => contracts
    .filter((contract) => contractMatchesRegulation(contract.key, regulationId))
    .filter((contract) => !query || `${contract.name} ${contract.key}`.toLowerCase().includes(query.toLowerCase())), [contracts, query, regulationId]);

  return <div className="shell">
    <PearsonHeader kicker="Contract library" title={regulation.shortName} meta={regulation.title} actions={<Link href="/" className="btn btn--outline-light">← Main workspace</Link>} />
    <main className="contracts-page">
      <div className="contracts-page__head">
        <div><span className="eyebrow">R2 source library</span><h1>Affected contracts</h1><p>Select a `.docx` file to edit a browser-only working copy. Source objects are read-only.</p></div>
        <div className="source-lock"><ShieldCheck size={17} /><span><strong>No write-back</strong>Downloads create a new local file</span></div>
      </div>
      <div className="contracts-toolbar">
        <div className="law-toggle" aria-label="Regulation filter">
          {(["PDPA2012", "WFA2025"] as RegulationId[]).map((id) => <button key={id} aria-pressed={regulationId === id} onClick={() => setRegulationId(id)}>{regulationById(id).shortName}</button>)}
        </div>
        <label className="contracts-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search R2 contracts" /></label>
        <span className="contracts-count">{state === "ready" ? `${visible.length} files` : "Connecting…"}</span>
      </div>
      <section className="contracts-table" aria-label={`${regulation.shortName} contracts`}>
        <div className="contracts-table__header"><span>Document</span><span>Format</span><span>Last modified</span><span>Action</span></div>
        {state === "loading" && <div className="contracts-message"><LoaderCircle className="spin" size={18} />Loading directly from R2</div>}
        {state === "error" && <div className="contracts-message">The contract library could not be loaded. Check the read-only R2 credentials.</div>}
        {state === "ready" && visible.map((contract) => {
          const href = contract.editable ? `/contracts/${contract.key.split("/").map(encodeURIComponent).join("/")}?regulation=${regulationId}` : contract.downloadUrl;
          return <article className="contract-row" key={contract.key}>
            <span className="contract-row__doc"><i><FileText size={16} /></i><span><strong>{contract.name}</strong><small>{contract.key}</small></span></span>
            <span><b className={`format-badge format-badge--${contract.format}`}>{contract.format.toUpperCase()}</b><small>{(contract.size / 1024).toFixed(0)} KB</small></span>
            <time>{contract.lastModified ? new Date(contract.lastModified).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }) : "—"}</time>
            <Link href={href} target={contract.editable ? undefined : "_blank"} className={contract.editable ? "btn btn--gold" : "btn btn--ghost"}>{contract.editable ? "Edit working copy" : <>Open original <ExternalLink size={13} /></>}</Link>
          </article>;
        })}
        {state === "ready" && visible.length === 0 && <div className="contracts-message">No contracts match this regulation and search.</div>}
      </section>
      <p className="contracts-footnote"><Cloud size={13} />Source: configured Cloudflare R2 bucket · `.docx` is editable · `.doc` and PDF remain source-only</p>
    </main>
  </div>;
}
