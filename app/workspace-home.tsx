"use client";

import { ArrowRight, BookOpen, CheckCircle2, Cloud, ExternalLink, FileText, LoaderCircle, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PearsonHeader } from "@/components/pearson-header";
import { WORKSPACE_REGULATIONS, contractMatchesRegulation, type RegulationId } from "@/lib/regulatory-workspace";

type Contract = {
  id: string;
  key: string;
  name: string;
  size: number;
  lastModified: string;
  downloadUrl: string;
  format: string;
  editable: boolean;
};

export function WorkspaceHome() {
  const [selected, setSelected] = useState<RegulationId>("PDPA2012");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const regulation = WORKSPACE_REGULATIONS.find((item) => item.id === selected)!;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contracts", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as { contracts?: Contract[] };
        if (!response.ok) throw new Error("Unable to load contracts");
        setContracts(body.contracts ?? []);
        setState("ready");
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setState("error");
      });
    return () => controller.abort();
  }, []);

  const matching = useMemo(
    () => contracts
      .filter((contract) => contractMatchesRegulation(contract.key, selected))
      .filter((contract) => !query || `${contract.name} ${contract.key}`.toLowerCase().includes(query.toLowerCase())),
    [contracts, query, selected],
  );
  const editable = matching.filter((contract) => contract.editable).length;

  return (
    <div className="shell">
      <PearsonHeader
        kicker="Regulatory workspace"
        title="Singapore legal operations"
        meta="Shared matter intelligence"
        actions={<Link href="/resilience" className="btn btn--outline-light">Dependency map</Link>}
      />
      <main className="workspace">
        <section className="workspace__intro">
          <div>
            <span className="eyebrow">Regulatory portfolio</span>
            <h1>Choose the law, then work from the source contract.</h1>
            <p>Every review starts from the original object in R2. Edits stay in your browser and download as a separate working copy.</p>
          </div>
          <div className="workspace__trust"><ShieldCheck size={18} /><span><strong>Read-only contract source</strong>R2 originals are never overwritten</span></div>
        </section>

        <section className="regulation-switcher" aria-label="Tracked regulations">
          {WORKSPACE_REGULATIONS.map((item) => (
            <button key={item.id} className={`regulation-tile${selected === item.id ? " active" : ""}`} onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}>
              <span className="regulation-tile__top"><span className="regulation-tile__code">{item.shortName}</span><span className={`law-state law-state--${item.status.toLowerCase()}`}>{item.status}</span></span>
              <strong>{item.title}</strong>
              <small>{item.statusDetail}</small>
              <span className="regulation-tile__open">Open workspace <ArrowRight size={14} /></span>
            </button>
          ))}
        </section>

        <section className="workspace-grid">
          <article className="workspace-law">
            <div className="workspace-law__head">
              <div><span className="eyebrow">Current focus</span><h2>{regulation.title}</h2><p>{regulation.summary}</p></div>
              <a href={regulation.sourceUrl} target="_blank" rel="noreferrer" className="btn btn--gold-outline">Official text <ExternalLink size={14} /></a>
            </div>
            <div className="obligation-list">
              {regulation.obligations.map((obligation) => (
                <div className="obligation-line" key={obligation.ref}>
                  <span>{obligation.ref}</span><div><strong>{obligation.title}</strong><small>{obligation.detail}</small></div><em>{obligation.state}</em>
                </div>
              ))}
            </div>
            <div className="workspace-law__actions">
              <Link href={regulation.detailUrl} className="btn btn--navy"><BookOpen size={15} />View regulation analysis</Link>
              <Link href={regulation.contractQuery} className="btn btn--gold">Review affected contracts <ArrowRight size={15} /></Link>
            </div>
          </article>

          <aside className="contract-snapshot">
            <div className="contract-snapshot__head">
              <div><span className="eyebrow"><Cloud size={12} /> Live R2 library</span><h2>Affected contracts</h2></div>
              {state === "ready" && <span>{matching.length} found · {editable} editable</span>}
            </div>
            <label className="workspace-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contract names" /></label>
            <div className="contract-snapshot__list">
              {state === "loading" && <div className="workspace-empty"><LoaderCircle className="spin" size={18} />Loading contracts from R2</div>}
              {state === "error" && <div className="workspace-empty">The R2 contract library could not be loaded.</div>}
              {state === "ready" && matching.slice(0, 6).map((contract) => (
                <Link key={contract.key} href={contract.editable ? `/contracts/${contract.key.split("/").map(encodeURIComponent).join("/")}?regulation=${selected}` : contract.downloadUrl} target={contract.editable ? undefined : "_blank"} className="contract-snapshot__row">
                  <span className="file-glyph"><FileText size={15} /></span><span><strong>{contract.name}</strong><small>{contract.format.toUpperCase()} · {(contract.size / 1024).toFixed(0)} KB</small></span>
                  <em>{contract.editable ? "Edit copy" : "View original"}</em>
                </Link>
              ))}
              {state === "ready" && matching.length === 0 && <div className="workspace-empty">No contracts match this regulation and search.</div>}
            </div>
            <Link href={regulation.contractQuery} className="contract-snapshot__all">Open all matching contracts <ArrowRight size={14} /></Link>
            <p className="contract-snapshot__note"><CheckCircle2 size={13} />Only `.docx` files can be edited in-browser. PDFs and legacy `.doc` files remain source-only.</p>
          </aside>
        </section>
      </main>
    </div>
  );
}
