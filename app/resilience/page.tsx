"use client";

import { Activity, ArrowRight, BookOpen, Bot, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Cloud, ExternalLink, FileText, GitBranch, History, LayoutGrid, Network, Pause, Play, RefreshCw, Scale, Sparkles, TimerReset, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RegulationLibrary } from "@/app/components/regulation-library";
import { TopDownContractGraph } from "@/app/resilience/top-down-contract-graph";

type NodeKind = "regulation" | "obligation" | "document" | "workflow";
type AssetStatus = "Outdated" | "Needs Review" | "Still Valid" | "Validated";
type GraphNode = { id: string; label: string; sublabel: string; kind: NodeKind; x: number; y: number; affected?: boolean; section?: string; status?: AssetStatus; version?: string };
type R2Contract = { id: string; key: string; name: string; section: string; dependency: string; currentAssumption: string; updatedRequirement: string; reason: string; status: AssetStatus; size: number; lastModified: string; downloadUrl: string; format?: string; company?: string; documentType?: string };

const nodes: GraphNode[] = [
  { id: "act", label: "Personal Data Protection Act 2012", sublabel: "Official source", kind: "regulation", x: 8, y: 18, version: "PDPA 2012" },
  { id: "mom", label: "PDPC Public Consultation 2020", sublabel: "Pre-legislative source", kind: "regulation", x: 8, y: 48, version: "14 May 2020" },
  { id: "amendment", label: "PDPA Amendment Act 2020", sublabel: "Published 10 Dec 2020", kind: "regulation", x: 8, y: 78, affected: true, version: "Act 40 of 2020" },
  { id: "notice", label: "Data Breach Notification", sublabel: "Commenced 1 Feb 2021", kind: "obligation", x: 39, y: 43, affected: true, section: "Part 6A", version: "Act 40 of 2020" },
  { id: "termination", label: "Accountability Requirements", sublabel: "Legal obligation", kind: "obligation", x: 39, y: 17 },
  { id: "notification", label: "Consent & Notification", sublabel: "Legal obligation", kind: "obligation", x: 39, y: 72 },
  { id: "contract", label: "Data Processing Agreement", sublabel: "Incident clause", kind: "document", x: 70, y: 12, affected: true, section: "Incident clause", status: "Outdated", version: "PDPA pre-amendment" },
  { id: "checklist", label: "Breach Response Checklist", sublabel: "Notification step", kind: "workflow", x: 70, y: 31, affected: true, section: "Notification step", status: "Outdated", version: "PDPA pre-amendment" },
  { id: "rule", label: "Breach Assessment Rule", sublabel: "Rule PRIV-014", kind: "workflow", x: 70, y: 50, affected: true, section: "Rule condition", status: "Outdated", version: "PDPA pre-amendment" },
  { id: "handbook", label: "Privacy Handbook", sublabel: "Incident response", kind: "document", x: 70, y: 69, affected: true, section: "Incident response", status: "Still Valid", version: "PDPA Amendment Act 2020" },
  { id: "advisory", label: "Client Privacy Advisory", sublabel: "Breach notification", kind: "document", x: 70, y: 88, affected: true, section: "Breach notification", status: "Needs Review", version: "PDPA Amendment Act 2020" },
];

const impactedAssets = ["contract", "checklist", "rule", "handbook", "advisory"];

function formatTime(seconds: number) {
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((n) => String(n).padStart(2, "0")).join(":");
}

function StatusPill({ status }: { status: AssetStatus }) {
  const classes: Record<AssetStatus, string> = { Outdated: "status status-outdated", "Needs Review": "status status-review", "Still Valid": "status status-valid", Validated: "status status-validated" };
  return <span className={classes[status]}>{status === "Validated" && <Check size={11} />} {status}</span>;
}

export default function Home() {
  const [traceActive, setTraceActive] = useState(false);
  const [selectedId, setSelectedId] = useState("amendment");
  const [assetStatuses, setAssetStatuses] = useState<Record<string, AssetStatus>>(Object.fromEntries(nodes.filter((node) => node.status).map((node) => [node.id, node.status!])));
  const [reviewAssetId, setReviewAssetId] = useState<string | null>(null);
  const [manualEdit, setManualEdit] = useState(false);
  const [draft, setDraft] = useState("The processor must notify the company without undue delay after becoming aware of a personal data breach.");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [finishedTime, setFinishedTime] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [applySimilar, setApplySimilar] = useState(false);
  const [r2Contracts, setR2Contracts] = useState<R2Contract[]>([]);
  const [r2State, setR2State] = useState<"loading" | "connected" | "unconfigured" | "error">("loading");
  const [r2Message, setR2Message] = useState("");
  const [syncNonce, setSyncNonce] = useState(0);
  const [regulationsOpen, setRegulationsOpen] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => setTimerSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contracts", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { contracts?: R2Contract[]; error?: string };
        if (!response.ok) throw new Error(`${response.status}:${data.error ?? "Unable to load contracts"}`);
        setR2Contracts(data.contracts ?? []);
        setR2State("connected");
        setR2Message(`${data.contracts?.length ?? 0} contracts synced from R2`);
        setAssetStatuses((current) => {
          const next = { ...current };
          (data.contracts ?? []).slice(0, impactedAssets.length).forEach((contract, index) => { next[impactedAssets[index]] = contract.status; });
          return next;
        });
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        setR2State(error.message.startsWith("503:") ? "unconfigured" : "error");
        setR2Message(error.message.replace(/^\d+:/, ""));
      });
    return () => controller.abort();
  }, [syncNonce]);

  const resolvedCount = impactedAssets.filter((id) => ["Still Valid", "Validated"].includes(assetStatuses[id])).length;
  const validatedTotal = 24 + Object.values(assetStatuses).filter((s) => s === "Validated").length;
  const resilience = Math.round((validatedTotal / 30) * 100);
  const graphNodes = useMemo(() => nodes.map((node) => {
    const slot = impactedAssets.indexOf(node.id);
    const contract = slot >= 0 ? r2Contracts[slot] : undefined;
    return { ...node, label: contract?.name ?? node.label, sublabel: contract?.section ?? node.sublabel, section: contract?.section ?? node.section, status: assetStatuses[node.id] ?? contract?.status ?? node.status };
  }), [assetStatuses, r2Contracts]);
  const reviewAsset = graphNodes.find((node) => node.id === reviewAssetId);
  const displayedAssetIds = r2State === "connected" ? impactedAssets.slice(0, Math.min(r2Contracts.length, impactedAssets.length)) : impactedAssets;

  function setAmendmentTrace(active: boolean) {
    setTraceActive(active);
    if (active) setSelectedId("amendment");
    window.requestAnimationFrame(() => graphRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }
  function traceImpact() { setAmendmentTrace(!traceActive); }
  function refreshContracts() { setR2State("loading"); setR2Message(""); setSyncNonce((value) => value + 1); }
  function openReview(id: string) { setReviewAssetId(id); setManualEdit(false); setDecision(null); setTimerSeconds(0); setTimerRunning(false); setFinishedTime(null); setApplySimilar(false); }
  function finishReview() { setTimerRunning(false); setFinishedTime(timerSeconds); }
  function acceptChange() {
    if (!reviewAssetId) return;
    const next = { ...assetStatuses, [reviewAssetId]: "Validated" as AssetStatus };
    if (applySimilar) Object.keys(next).forEach((id) => { if (next[id] === "Outdated") next[id] = "Validated"; });
    setAssetStatuses(next); setTimerRunning(false); setFinishedTime(timerSeconds); setDecision("Change accepted"); setSelectedId(reviewAssetId);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="sidebar-brand"><span><GitBranch size={17} /></span><strong>L.A.R.P</strong></Link>
        <nav aria-label="Primary navigation">
          <small>WORKSPACE</small>
          <button className="active"><LayoutGrid size={16} /><span>Resilience</span></button>
          <button onClick={traceImpact}><Network size={16} /><span>Knowledge graph</span><em>24</em></button>
          <button onClick={() => setRegulationsOpen(true)}><Activity size={16} /><span>Regulatory history</span><em className="alert-count">1</em></button>
          <small>LEGAL OPERATIONS</small>
          <Link href="/contracts"><FileText size={16} /><span>Company assets</span></Link>
          <Link href="/contracts?regulation=PDPA2012"><BriefcaseBusiness size={16} /><span>Review queue</span><em>4</em></Link>
        </nav>
        <div className="sidebar-footer"><div className="workspace-card"><span>AC</span><div><strong>Atlas Consulting</strong><small>Singapore workspace</small></div><ChevronDown size={14} /></div><div className="sidebar-user"><span>SL</span><div><strong>Sarah Lim</strong><small>Legal counsel</small></div><ChevronRight size={14} /></div></div>
      </aside>

      <div className="main-stage">
        <header className="topbar">
          <div className="breadcrumbs"><span>Atlas Consulting</span><ChevronRight size={13} /><strong>Regulatory resilience</strong></div>
          <div className="topbar-actions"><Link className="search-button" href="/"><LayoutGrid size={15} /><span>Main workspace</span></Link><Link className="ask-button" href="/contracts"><FileText size={14} />Contract library</Link></div>
        </header>

      <section className="content">
        <div className="page-heading">
          <div><div className="eyebrow"><Activity size={13} /> LIVE DEPENDENCY MODEL</div><h1>Regulatory resilience</h1><p>Trace legal changes through every policy, contract and operational rule they govern.</p></div>
          <button className={`sync-state ${r2State}`} onClick={refreshContracts} title={r2Message}><span className="live-dot" /><Cloud size={13} />{r2State === "connected" ? "R2 contracts connected" : r2State === "loading" ? "Syncing R2 contracts" : "R2 setup required"}<small>{r2State === "connected" ? `${r2Contracts.length} objects` : "View setup"}</small><RefreshCw size={12} /></button>
        </div>

        <div className="metric-grid">
          {[["Active regulatory changes", "1", "change", "amber"], ["Impacted assets", r2State === "connected" ? r2Contracts.length.toString() : "5", r2State === "connected" ? "from R2" : "demo data", "slate"], ["Pending human review", Object.values(assetStatuses).filter((s) => s === "Needs Review" || s === "Outdated").length.toString(), "queue", "violet"], ["Stale dependencies", Object.values(assetStatuses).filter((s) => s === "Outdated").length.toString(), "requires action", "red"], ["Validated dependencies", validatedTotal.toString(), "current", "green"]].map(([label, value, foot, tone]) => (
            <div className="metric-card" key={label}><span className={`metric-icon ${tone}`}><Network size={15} /></span><div><small>{label}</small><strong>{value}</strong><em>{foot}</em></div></div>
          ))}
          <div className="metric-card resilience-card"><div className="ring" style={{ "--progress": `${resilience * 3.6}deg` } as React.CSSProperties}><span>{resilience}%</span></div><div><small>Regulatory resilience</small><strong>{resilience}%</strong><em>{validatedTotal} of 30 dependencies current</em></div></div>
        </div>

        <div className="dashboard-grid">
          <aside className="left-column">
            <section className="panel change-card">
              <div className="panel-label"><span className="change-pulse" /> NEW CHANGE DETECTED <span className="new-badge">NEW</span></div>
              <h2>PDPA Amendment Act 2020</h2>
              <div className="source-line"><span className="source-icon"><Scale size={15} /></span><div><small>Source</small><strong>Singapore Statutes Online</strong></div></div>
              <div className="requirement-change"><div><small>BEFORE AMENDMENT</small><span>Breach notification</span><strong>No statutory regime</strong></div><ArrowRight size={17} /><div><small>AFTER COMMENCEMENT</small><span>Breach notification</span><strong>Mandatory framework</strong></div></div>
              <div className="effective"><Clock3 size={14} /><span>Effective</span><strong>1 February 2021</strong></div>
              <div className="ai-summary"><div><Sparkles size={14} /> VERIFIED SUMMARY</div><p>The 2020 amendment introduced a mandatory data-breach notification framework. Contracts and incident-response processes can now be traced against the real consultation, Bill, enactment and commencement history.</p></div>
              <div className="change-facts"><div><small>CHANGE TYPE</small><strong>Requirement modified</strong></div><div><small>IMPACT</small><strong>5 dependent assets</strong></div><div><small>RISK</small><strong>3 potentially outdated</strong></div></div>
              <button className={`primary-button ${traceActive ? "traced" : ""}`} onClick={traceImpact} aria-pressed={traceActive}><Network size={16} />{traceActive ? "Clear amendment trace" : "Trace amendment impact"}<ArrowRight size={15} /></button>
            </section>
            <section className="panel timeline-panel">
              <div className="section-title"><div><History size={15} />LEGISLATIVE TIMELINE</div><span>4 stages</span></div>
              <div className="timeline">
                <div className="timeline-item"><span className="timeline-dot" /><div><time>14 May 2020</time><strong>Public consultation</strong><p>Draft amendment proposal released</p></div></div>
                <div className="timeline-item"><span className="timeline-dot" /><div><time>5 Oct 2020</time><strong>Bill introduced</strong><p>Bill No. 37/2020 published</p></div></div>
                <div className="timeline-item"><span className="timeline-dot" /><div><time>10 Dec 2020</time><strong>Amendment Act published</strong><p>Act 40 of 2020</p></div></div>
                <div className="timeline-item current"><span className="timeline-dot" /><div><time>1 Feb 2021</time><strong>First phase commenced</strong><p>Mandatory breach notification framework</p></div></div>
              </div>
            </section>
          </aside>

          <section className="panel graph-panel" ref={graphRef}>
            <div className="graph-header"><div><div className="section-title"><div><GitBranch size={16} />REGULATORY KNOWLEDGE GRAPH</div><span className="live-label"><span />LIVE</span></div><p>{r2State === "connected" ? `${r2Contracts.length} R2 contracts grouped into top-down screening families` : "Connect R2 to populate the contract branches"}</p></div><div className="graph-actions"><button onClick={refreshContracts}><RefreshCw size={15} />Refresh graph</button></div></div>
            <TopDownContractGraph contracts={r2Contracts} traceActive={traceActive} onTraceChange={setAmendmentTrace} />
          </section>

          <aside className="panel impact-panel">
            <div className="section-title"><div><Activity size={15} />BLAST RADIUS</div><span>{r2State === "connected" ? "R2 LIVE" : traceActive ? "TRACED" : "DEMO"}</span></div>
            <div className="impact-total"><strong>{r2State === "connected" ? r2Contracts.length : 5}</strong><div><span>dependent assets</span><small>via Data Breach Notification</small></div></div>
            <div className="impact-breakdown"><span><i className="red-dot" />{Object.values(assetStatuses).filter((s) => s === "Outdated").length} Outdated</span><span><i className="amber-dot" />{Object.values(assetStatuses).filter((s) => s === "Needs Review").length} Needs Review</span><span><i className="green-dot" />{Object.values(assetStatuses).filter((s) => ["Still Valid", "Validated"].includes(s)).length} Valid</span></div>
            {(r2State !== "connected" || r2Contracts.length === 0) && <div className="r2-notice"><Cloud size={15} /><div><strong>{r2State === "loading" ? "Connecting to contract storage…" : r2State === "connected" ? "No contracts found under the configured prefix" : "Showing demo contracts"}</strong><p>{r2Message || "Add the read-only R2 credentials to .env.local, then refresh."}</p></div></div>}
            <div className="asset-list">{displayedAssetIds.map((id, index) => { const asset = graphNodes.find((node) => node.id === id)!; const contract = r2Contracts[index]; const status = assetStatuses[id]; const current = contract?.currentAssumption ?? "No mapped statutory notification workflow"; const updated = contract?.updatedRequirement ?? "Assess and notify qualifying breaches"; const reason = contract?.reason ?? (id === "contract" ? "This agreement should be checked for timely processor-to-company incident notice." : id === "checklist" ? "This workflow should include assessment and statutory notification decisions." : id === "rule" ? "The automated rule should map the breach-assessment criteria." : "This document may need to reflect the notification framework."); return <article className={`asset-item ${selectedId === id ? "active" : ""}`} key={id} onClick={() => setSelectedId(id)}><div className="asset-head"><div className={`asset-icon ${asset.kind}`}><FileText size={14} /></div><div><strong>{asset.label}</strong><small>{asset.section}</small></div><StatusPill status={status} /></div>{contract && <a className="contract-link" href={contract.downloadUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><ExternalLink size={11} />Open source contract · {(contract.size / 1024).toFixed(0)} KB</a>}{(status === "Outdated" || status === "Needs Review") && <><div className="dependency-row"><span>Current assumption <b>{current}</b></span><ArrowRight size={12} /><span>Requirement <b>{updated}</b></span></div><p>{reason}</p><button className="review-button" onClick={(event) => { event.stopPropagation(); openReview(id); }}>Review change <ChevronRight size={14} /></button></>}{status === "Validated" && <div className="revalidated-line"><CheckCircle2 size={13} />Dependency revalidated against PDPA Amendment Act 2020</div>}</article>; })}</div>
            <div className="progress-card"><div><span>Regulatory change remediation</span><strong>{resolvedCount} / 5 assets resolved</strong></div><div className="progress-track"><span style={{ width: `${resolvedCount * 20}%` }} /></div><small>{resolvedCount * 20}% complete</small></div>
          </aside>
        </div>
      </section>
      </div>

      {reviewAsset && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Human review workspace">
        <div className="review-modal">
          <div className="review-topbar"><div className="review-title"><span className="review-doc-icon"><FileText size={18} /></span><div><small>HUMAN REVIEW WORKSPACE</small><strong>{reviewAsset.label}</strong><span>{reviewAsset.section}</span></div></div><button className="icon-button" onClick={() => setReviewAssetId(null)} aria-label="Close review"><X size={18} /></button></div>
          <div className="review-layout">
            <div className="review-content">
              <div className="review-context"><div><small>REGULATORY SOURCE</small><strong><Scale size={14} /> PDPA Amendment Act 2020</strong></div><div><small>WHY THIS WAS FLAGGED</small><p>This asset may depend on the mandatory data-breach notification framework that commenced on 1 February 2021.</p></div></div>
              <div className="diff-card"><div className="diff-header"><div><GitBranch size={14} />PROPOSED REMEDIATION</div><span><Bot size={13} />AI GENERATED · REQUIRES REVIEW</span></div><div className="diff-file"><FileText size={14} />{reviewAsset.label}<span>{reviewAsset.section}</span></div><div className="diff-row removed"><span className="line-number">−</span><code>The processor will inform the company of security incidents where practicable.</code></div><div className="diff-row added"><span className="line-number">+</span><code>The processor must notify the company without undue delay after becoming aware of a personal data breach.</code></div></div>
              {manualEdit && <div className="manual-editor"><label htmlFor="manual-edit">MANUAL EDIT</label><textarea id="manual-edit" value={draft} onChange={(event) => setDraft(event.target.value)} /><small>Your edit will be recorded in the audit trail.</small></div>}
              {decision ? <div className="remediation-success"><span><CheckCircle2 size={22} /></span><div><small>REMEDIATED</small><strong>{reviewAsset.label}</strong><p><Check size={13} /> Updated &nbsp; <Check size={13} /> Human reviewed &nbsp; <Check size={13} /> Dependency revalidated</p><em>Validated against PDPA Amendment Act 2020</em></div></div> : <div className="review-actions"><button className="accept-button" onClick={acceptChange}><Check size={16} />Accept change</button><button className="secondary-button" onClick={() => setDecision("Change rejected")}><X size={15} />Reject</button><button className={`secondary-button ${manualEdit ? "active" : ""}`} onClick={() => setManualEdit(!manualEdit)}><FileText size={15} />Edit manually</button><button className="secondary-button" onClick={() => setDecision("Review deferred")}><Clock3 size={15} />Defer</button><label className="similar-toggle"><input type="checkbox" checked={applySimilar} onChange={(event) => setApplySimilar(event.target.checked)} /><span><Check size={12} /></span>Apply to similar outdated assets</label></div>}
            </div>
            <aside className="review-sidebar">
              <div className="timer-card"><div className="timer-heading"><TimerReset size={16} /><span>REVIEW SESSION TRACKING</span><i className={timerRunning ? "running" : ""} /></div><strong className="timer-value">{formatTime(timerSeconds)}</strong><p>Time is recorded only while the review session is active.</p><div className="timer-controls">{!timerRunning ? <button onClick={() => setTimerRunning(true)}><Play size={14} />{timerSeconds ? "Resume" : "Start"}</button> : <button onClick={() => setTimerRunning(false)}><Pause size={14} />Pause</button>}<button onClick={finishReview} disabled={!timerSeconds}><Check size={14} />Finish review</button></div></div>
              <div className="audit-card"><div className="section-title"><div><History size={14} />AUDIT TRAIL</div></div><div className="audit-event"><span>SL</span><div><strong>Review opened</strong><p>Sarah Lim · Legal counsel</p><time>Just now</time></div></div>{(finishedTime !== null || decision) && <div className="audit-event completed"><span><Check size={13} /></span><div><strong>{decision || "Review session completed"}</strong><p>Reviewed by Sarah Lim · {Math.floor((finishedTime ?? timerSeconds) / 60)}m {(finishedTime ?? timerSeconds) % 60}s</p><time>Validated against PDPA Amendment Act 2020</time></div></div>}</div>
              <div className="session-note"><BookOpen size={15} /><p><strong>Review session tracking</strong>This record can later be exported to your firm&apos;s billing or time-entry system.</p></div>
            </aside>
          </div>
        </div>
      </div>}
      {regulationsOpen && <RegulationLibrary onClose={() => setRegulationsOpen(false)} />}
    </main>
  );
}
