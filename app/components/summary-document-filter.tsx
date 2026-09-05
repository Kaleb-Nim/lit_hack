"use client";

import { Building2, FileText, LoaderCircle, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contractMatchesRegulation, regulationById, type RegulationId } from "@/lib/regulatory-workspace";
import { DOCUMENT_TYPES } from "@/lib/contract-metadata";

type Contract = {
  key: string;
  name: string;
  format: string;
  editable: boolean;
  convertible: boolean;
  company: string;
  documentType: string;
  status: string;
  lastModified: string;
  downloadUrl: string;
};

export function SummaryDocumentFilter({ regulationId }: { regulationId: RegulationId }) {
  const regulation = regulationById(regulationId);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documentType, setDocumentType] = useState("All document types");
  const [company, setCompany] = useState("All companies");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contracts", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as { contracts?: Contract[] };
        if (!response.ok) throw new Error();
        setContracts(body.contracts ?? []); setState("ready");
      })
      .catch((error: Error) => { if (error.name !== "AbortError") setState("error"); });
    return () => controller.abort();
  }, []);

  const relevant = useMemo(() => contracts.filter((contract) => contractMatchesRegulation(contract.key, regulationId)), [contracts, regulationId]);
  const typeCounts = useMemo(() => new Map(DOCUMENT_TYPES.map((type) => [type, relevant.filter((contract) => contract.documentType === type).length])), [relevant]);
  const companies = useMemo(() => [...new Set(relevant.map((contract) => contract.company))].sort((a, b) => a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : a.localeCompare(b)), [relevant]);
  const visible = useMemo(() => relevant.filter((contract) => documentType === "All document types" || contract.documentType === documentType).filter((contract) => company === "All companies" || contract.company === company), [company, documentType, relevant]);

  return <section className="document-impact-filter" aria-labelledby={`${regulationId}-document-filter-title`}>
    <div className="document-impact-filter__head">
      <div><span className="eyebrow"><SlidersHorizontal size={13} /> Affected-document filter</span><h2 id={`${regulationId}-document-filter-title`}>Documents by type and company</h2><p>Screen the R2 library for documents that may need changes under {regulation.shortName}. Company and type come from the contract manifest where available; otherwise they are inferred and marked unassigned when uncertain.</p></div>
      <strong>{visible.length}<small>of {relevant.length} documents</small></strong>
    </div>
    <div className="document-impact-filter__controls">
      <label><span>Document type</span><select value={documentType} onChange={(event) => setDocumentType(event.target.value)}><option>All document types</option>{DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type} ({typeCounts.get(type) ?? 0})</option>)}</select></label>
      <label><span>Company</span><select value={company} onChange={(event) => setCompany(event.target.value)}><option>All companies</option>{companies.map((item) => <option key={item}>{item}</option>)}</select></label>
      {(documentType !== "All document types" || company !== "All companies") && <button onClick={() => { setDocumentType("All document types"); setCompany("All companies"); }}>Clear filters</button>}
    </div>
    <div className="document-impact-filter__list">
      {state === "loading" && <div className="document-filter-message"><LoaderCircle className="spin" size={17} />Loading R2 documents</div>}
      {state === "error" && <div className="document-filter-message">The R2 document metadata could not be loaded.</div>}
      {state === "ready" && visible.map((contract) => {
        const workbench = contract.editable || contract.convertible;
        const href = workbench ? `/contracts/${contract.key.split("/").map(encodeURIComponent).join("/")}?regulation=${regulationId}` : contract.downloadUrl;
        return <article key={contract.key}>
          <span className="document-filter-icon"><FileText size={15} /></span>
          <div className="document-filter-name"><strong>{contract.name}</strong><small>{contract.key}</small></div>
          <span className="document-filter-company"><Building2 size={12} />{contract.company}</span>
          <span className="document-filter-type">{contract.documentType}</span>
          <Link href={href} target={workbench ? undefined : "_blank"}>{contract.editable ? "Review edits" : contract.convertible ? "Convert & review" : "Open source"}</Link>
        </article>;
      })}
      {state === "ready" && visible.length === 0 && <div className="document-filter-message">No documents match both filters.</div>}
    </div>
    <p className="document-impact-filter__note"><strong>Unassigned</strong> means the company could not be safely inferred from the object name. Shared precedents are grouped under “Shared template library”. Add `company` and `documentType` to that object&apos;s entry in `Contracts/index.json` for authoritative filtering.</p>
  </section>;
}
