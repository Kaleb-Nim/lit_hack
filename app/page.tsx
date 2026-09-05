"use client";

import { Activity, ArrowRight, Bell, BookOpen, Bot, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, ChevronRight, CirclePause, CirclePlay, Clock3, FileText, GitBranch, History, LayoutGrid, Network, Pause, Play, Scale, Search, Settings, ShieldCheck, Sparkles, TimerReset, Workflow, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type NodeKind = "regulation" | "obligation" | "document" | "workflow";
type AssetStatus = "Outdated" | "Needs Review" | "Still Valid" | "Validated";
type GraphNode = { id: string; label: string; sublabel: string; kind: NodeKind; x: number; y: number; affected?: boolean; section?: string; status?: AssetStatus; version?: string };

const nodes: GraphNode[] = [
  { id: "act", label: "Employment Act", sublabel: "External source", kind: "regulation", x: 8, y: 18, version: "2022 consolidated" },
  { id: "mom", label: "MOM Notice Period Guidance", sublabel: "External source", kind: "regulation", x: 8, y: 48, version: "Guidance 2024" },
  { id: "amendment", label: "Employment Act Amendment 2026", sublabel: "Change detected", kind: "regulation", x: 8, y: 78, affected: true, version: "Regulation v2" },
  { id: "notice", label: "Minimum Notice Period", sublabel: "7 days → 14 days", kind: "obligation", x: 39, y: 43, affected: true, section: "s. 10(3)", version: "Regulation v2" },
  { id: "termination", label: "Termination Requirements", sublabel: "Legal obligation", kind: "obligation", x: 39, y: 17 },
  { id: "notification", label: "Employee Notification", sublabel: "Legal obligation", kind: "obligation", x: 39, y: 72 },
  { id: "contract", label: "Employment Contract Template v4", sublabel: "Clause 8.2", kind: "document", x: 70, y: 12, affected: true, section: "Clause 8.2", status: "Outdated", version: "Employment Act 2022" },
  { id: "checklist", label: "HR Termination Checklist", sublabel: "Step 5", kind: "workflow", x: 70, y: 31, affected: true, section: "Step 5", status: "Outdated", version: "Employment Act 2022" },
  { id: "rule", label: "Notice Period Compliance Rule", sublabel: "Rule HR-014", kind: "workflow", x: 70, y: 50, affected: true, section: "Rule condition", status: "Outdated", version: "Employment Act 2022" },
  { id: "handbook", label: "Employee Handbook", sublabel: "Section 11", kind: "document", x: 70, y: 69, affected: true, section: "Section 11", status: "Still Valid", version: "Regulation v2" },
  { id: "advisory", label: "Client Employment Advisory", sublabel: "Paragraph 14", kind: "document", x: 70, y: 88, affected: true, section: "Paragraph 14", status: "Needs Review", version: "MOM Guidance 2024" },
];

const edges = [["act", "termination"], ["mom", "notice"], ["amendment", "notice"], ["termination", "contract"], ["notice", "contract"], ["notice", "checklist"], ["notice", "rule"], ["notice", "handbook"], ["notice", "advisory"], ["notification", "advisory"]];
const impactedAssets = ["contract", "checklist", "rule", "handbook", "advisory"];
const kindMeta: Record<NodeKind, { label: string; icon: typeof Scale }> = {
  regulation: { label: "Regulation", icon: Scale }, obligation: { label: "Obligation", icon: ShieldCheck }, document: { label: "Document", icon: FileText }, workflow: { label: "Workflow / rule", icon: Workflow },
};

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
  const [draft, setDraft] = useState("Employees must provide at least 14 days' notice before termination.");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [finishedTime, setFinishedTime] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [applySimilar, setApplySimilar] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => setTimerSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const selectedNode = nodes.find((node) => node.id === selectedId) ?? nodes[2];
  const reviewAsset = nodes.find((node) => node.id === reviewAssetId);
  const resolvedCount = impactedAssets.filter((id) => ["Still Valid", "Validated"].includes(assetStatuses[id])).length;
  const validatedTotal = 24 + Object.values(assetStatuses).filter((s) => s === "Validated").length;
  const resilience = Math.round((validatedTotal / 30) * 100);
  const graphNodes = useMemo(() => nodes.map((node) => ({ ...node, status: assetStatuses[node.id] ?? node.status })), [assetStatuses]);

  function traceImpact() { setTraceActive(true); setSelectedId("amendment"); graphRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }
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
        <div className="sidebar-brand"><span><GitBranch size={17} /></span><strong>Continuity</strong></div>
        <nav aria-label="Primary navigation">
          <small>WORKSPACE</small>
          <button className="active"><LayoutGrid size={16} /><span>Resilience</span></button>
          <button><Network size={16} /><span>Knowledge graph</span><em>24</em></button>
          <button><Activity size={16} /><span>Regulatory changes</span><em className="alert-count">1</em></button>
          <small>LEGAL OPERATIONS</small>
          <button><FileText size={16} /><span>Company assets</span></button>
          <button><BriefcaseBusiness size={16} /><span>Review queue</span><em>4</em></button>
          <button><History size={16} /><span>Audit trail</span></button>
          <small>ADMINISTRATION</small>
          <button><ShieldCheck size={16} /><span>Controls</span></button>
          <button><Settings size={16} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-footer"><div className="workspace-card"><span>AC</span><div><strong>Atlas Consulting</strong><small>Singapore workspace</small></div><ChevronDown size={14} /></div><div className="sidebar-user"><span>SL</span><div><strong>Sarah Lim</strong><small>Legal counsel</small></div><ChevronRight size={14} /></div></div>
      </aside>

      <div className="main-stage">
        <header className="topbar">
          <div className="breadcrumbs"><span>Atlas Consulting</span><ChevronRight size={13} /><strong>Regulatory resilience</strong></div>
          <div className="topbar-actions"><button className="search-button"><Search size={15} /><span>Search workspace</span><kbd>⌘ K</kbd></button><button className="icon-button" aria-label="Notifications"><Bell size={16} /><i /></button><button className="ask-button"><Sparkles size={14} />Ask Continuity</button></div>
        </header>

      <section className="content">
        <div className="page-heading">
          <div><div className="eyebrow"><Activity size={13} /> LIVE DEPENDENCY MODEL</div><h1>Regulatory resilience</h1><p>Trace legal changes through every policy, contract and operational rule they govern.</p></div>
          <div className="sync-state"><span className="live-dot" />Knowledge graph current <small>Synced 4 min ago</small></div>
        </div>

        <div className="metric-grid">
          {[["Active regulatory changes", "1", "change", "amber"], ["Impacted assets", "5", "in scope", "slate"], ["Pending human review", Object.values(assetStatuses).filter((s) => s === "Needs Review" || s === "Outdated").length.toString(), "queue", "violet"], ["Stale dependencies", Object.values(assetStatuses).filter((s) => s === "Outdated").length.toString(), "requires action", "red"], ["Validated dependencies", validatedTotal.toString(), "current", "green"]].map(([label, value, foot, tone]) => (
            <div className="metric-card" key={label}><span className={`metric-icon ${tone}`}><Network size={15} /></span><div><small>{label}</small><strong>{value}</strong><em>{foot}</em></div></div>
          ))}
          <div className="metric-card resilience-card"><div className="ring" style={{ "--progress": `${resilience * 3.6}deg` } as React.CSSProperties}><span>{resilience}%</span></div><div><small>Regulatory resilience</small><strong>{resilience}%</strong><em>{validatedTotal} of 30 dependencies current</em></div></div>
        </div>

        <div className="dashboard-grid">
          <aside className="left-column">
            <section className="panel change-card">
              <div className="panel-label"><span className="change-pulse" /> NEW CHANGE DETECTED <span className="new-badge">NEW</span></div>
              <h2>Employment Notice Period Amendment</h2>
              <div className="source-line"><span className="source-icon"><Scale size={15} /></span><div><small>Source</small><strong>Ministry of Manpower</strong></div></div>
              <div className="requirement-change"><div><small>PREVIOUS REQUIREMENT</small><span>Minimum notice period</span><strong>7 days</strong></div><ArrowRight size={17} /><div><small>UPDATED REQUIREMENT</small><span>Minimum notice period</span><strong>14 days</strong></div></div>
              <div className="effective"><Clock3 size={14} /><span>Effective</span><strong>15 October 2026</strong></div>
              <div className="ai-summary"><div><Sparkles size={14} /> AI SUMMARY</div><p>The minimum notice period has increased from 7 to 14 days. Internal employment contracts, HR procedures and automated rules that encode a 7-day minimum may require remediation.</p></div>
              <div className="change-facts"><div><small>CHANGE TYPE</small><strong>Requirement modified</strong></div><div><small>IMPACT</small><strong>5 dependent assets</strong></div><div><small>RISK</small><strong>3 potentially outdated</strong></div></div>
              <button className={`primary-button ${traceActive ? "traced" : ""}`} onClick={traceImpact}><Network size={16} />{traceActive ? "Impact traced" : "Trace impact"}<ArrowRight size={15} /></button>
            </section>
            <section className="panel timeline-panel">
              <div className="section-title"><div><History size={15} />CHANGE TIMELINE</div><span>3 versions</span></div>
              <div className="timeline">
                <div className="timeline-item"><span className="timeline-dot" /><div><time>2022</time><strong>Requirement introduced</strong><p>Minimum notice period set at <b>7 days</b></p></div></div>
                <div className="timeline-item"><span className="timeline-dot" /><div><time>2024</time><strong>Guidance clarification</strong><p>No material change</p></div></div>
                <div className="timeline-item current"><span className="timeline-dot" /><div><time>2026</time><strong>Employment Act amendment</strong><p><del>7 days</del><b>14 days</b></p></div></div>
              </div>
            </section>
          </aside>

          <section className="panel graph-panel" ref={graphRef}>
            <div className="graph-header"><div><div className="section-title"><div><GitBranch size={16} />REGULATORY KNOWLEDGE GRAPH</div><span className="live-label"><span />LIVE</span></div><p>{traceActive ? "Blast radius: 1 obligation · 5 dependent assets" : "Select a node to inspect its regulatory dependencies"}</p></div><div className="graph-actions"><button onClick={() => setTraceActive(!traceActive)}>{traceActive ? <CirclePause size={15} /> : <CirclePlay size={15} />}{traceActive ? "Clear trace" : "Trace paths"}</button></div></div>
            <div className={`graph-canvas ${traceActive ? "trace-active" : ""}`}>
              <div className="graph-columns"><span>EXTERNAL SOURCES</span><span>LEGAL OBLIGATIONS</span><span>COMPANY KNOWLEDGE &amp; ASSETS</span></div>
              <svg className="graph-lines" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">{edges.map(([fromId, toId]) => { const from = nodes.find((n) => n.id === fromId)!; const to = nodes.find((n) => n.id === toId)!; const active = from.affected && to.affected; return <path key={`${fromId}-${toId}`} className={active ? "edge affected-edge" : "edge"} d={`M ${from.x * 10 + 120} ${from.y * 5.2} C ${from.x * 10 + 210} ${from.y * 5.2}, ${to.x * 10 - 100} ${to.y * 5.2}, ${to.x * 10} ${to.y * 5.2}`} />; })}</svg>
              {graphNodes.map((node) => { const Icon = kindMeta[node.kind].icon; return <button key={node.id} className={`graph-node ${node.kind} ${node.affected ? "affected" : ""} ${selectedId === node.id ? "selected" : ""} ${node.status === "Validated" ? "node-validated" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => setSelectedId(node.id)} aria-label={`Inspect ${node.label}`}><span className="node-icon"><Icon size={15} /></span><span className="node-copy"><strong>{node.label}</strong><small>{node.sublabel}</small></span>{node.status && <span className={`node-state ${node.status.toLowerCase().replace(" ", "-")}`} />}</button>; })}
              <div className="graph-legend">{Object.entries(kindMeta).map(([kind, meta]) => <span key={kind}><i className={kind} />{meta.label}</span>)}</div>
            </div>
            <div className="node-inspector">
              <div className={`inspector-icon ${selectedNode.kind}`}>{(() => { const Icon = kindMeta[selectedNode.kind].icon; return <Icon size={18} />; })()}</div>
              <div className="inspector-main"><small>SELECTED {kindMeta[selectedNode.kind].label.toUpperCase()}</small><strong>{selectedNode.label}</strong><span>{selectedNode.section || selectedNode.sublabel}</span></div>
              <div className="inspector-data"><small>REGULATORY DEPENDENCY</small><strong>{selectedNode.kind === "regulation" ? "Primary legal source" : selectedNode.id === "notice" ? "Employment Act Amendment 2026" : "Minimum Notice Period"}</strong></div>
              <div className="inspector-data"><small>VALIDATION STATUS</small>{selectedNode.status ? <StatusPill status={assetStatuses[selectedNode.id] ?? selectedNode.status} /> : <span className="status status-valid">Mapped</span>}</div>
              <div className="inspector-data"><small>LAST VALIDATED AGAINST</small><strong>{selectedNode.version || "Employment Act 2022"}</strong></div>
              {selectedNode.status && assetStatuses[selectedNode.id] !== "Still Valid" && assetStatuses[selectedNode.id] !== "Validated" && <button className="small-button" onClick={() => openReview(selectedNode.id)}>Review change</button>}
            </div>
          </section>

          <aside className="panel impact-panel">
            <div className="section-title"><div><Activity size={15} />BLAST RADIUS</div><span>{traceActive ? "TRACED" : "READY"}</span></div>
            <div className="impact-total"><strong>5</strong><div><span>dependent assets</span><small>via Minimum Notice Period</small></div></div>
            <div className="impact-breakdown"><span><i className="red-dot" />{Object.values(assetStatuses).filter((s) => s === "Outdated").length} Outdated</span><span><i className="amber-dot" />{Object.values(assetStatuses).filter((s) => s === "Needs Review").length} Needs Review</span><span><i className="green-dot" />{Object.values(assetStatuses).filter((s) => ["Still Valid", "Validated"].includes(s)).length} Valid</span></div>
            <div className="asset-list">{impactedAssets.map((id) => { const asset = nodes.find((node) => node.id === id)!; const status = assetStatuses[id]; return <article className={`asset-item ${selectedId === id ? "active" : ""}`} key={id} onClick={() => setSelectedId(id)}><div className="asset-head"><div className={`asset-icon ${asset.kind}`}><FileText size={14} /></div><div><strong>{asset.label}</strong><small>{asset.section}</small></div><StatusPill status={status} /></div>{(status === "Outdated" || status === "Needs Review") && <><div className="dependency-row"><span>Current assumption <b>7 days</b></span><ArrowRight size={12} /><span>Requirement <b>14 days</b></span></div><p>{id === "contract" ? "This clause directly encodes the previous statutory minimum." : id === "checklist" ? "This step instructs HR to apply the former minimum." : id === "rule" ? "The automated rule tests against the former threshold." : "The advice may restate an outdated threshold."}</p><button className="review-button" onClick={(event) => { event.stopPropagation(); openReview(id); }}>Review change <ChevronRight size={14} /></button></>}{status === "Validated" && <div className="revalidated-line"><CheckCircle2 size={13} />Dependency revalidated against Regulation v2</div>}</article>; })}</div>
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
              <div className="review-context"><div><small>REGULATORY SOURCE</small><strong><Scale size={14} /> Employment Act Amendment 2026</strong></div><div><small>WHY THIS WAS FLAGGED</small><p>This clause directly implements the Minimum Notice Period obligation, which changed from 7 to 14 days.</p></div></div>
              <div className="diff-card"><div className="diff-header"><div><GitBranch size={14} />PROPOSED REMEDIATION</div><span><Bot size={13} />AI GENERATED · REQUIRES REVIEW</span></div><div className="diff-file"><FileText size={14} />{reviewAsset.label}<span>{reviewAsset.section}</span></div><div className="diff-row removed"><span className="line-number">−</span><code>Employees must provide at least <mark>7 days&apos;</mark> notice before termination.</code></div><div className="diff-row added"><span className="line-number">+</span><code>Employees must provide at least <mark>14 days&apos;</mark> notice before termination.</code></div></div>
              {manualEdit && <div className="manual-editor"><label htmlFor="manual-edit">MANUAL EDIT</label><textarea id="manual-edit" value={draft} onChange={(event) => setDraft(event.target.value)} /><small>Your edit will be recorded in the audit trail.</small></div>}
              {decision ? <div className="remediation-success"><span><CheckCircle2 size={22} /></span><div><small>REMEDIATED</small><strong>{reviewAsset.label}</strong><p><Check size={13} /> Updated &nbsp; <Check size={13} /> Human reviewed &nbsp; <Check size={13} /> Dependency revalidated</p><em>Validated against Employment Act Amendment 2026</em></div></div> : <div className="review-actions"><button className="accept-button" onClick={acceptChange}><Check size={16} />Accept change</button><button className="secondary-button" onClick={() => setDecision("Change rejected")}><X size={15} />Reject</button><button className={`secondary-button ${manualEdit ? "active" : ""}`} onClick={() => setManualEdit(!manualEdit)}><FileText size={15} />Edit manually</button><button className="secondary-button" onClick={() => setDecision("Review deferred")}><Clock3 size={15} />Defer</button><label className="similar-toggle"><input type="checkbox" checked={applySimilar} onChange={(event) => setApplySimilar(event.target.checked)} /><span><Check size={12} /></span>Apply to similar outdated assets</label></div>}
            </div>
            <aside className="review-sidebar">
              <div className="timer-card"><div className="timer-heading"><TimerReset size={16} /><span>REVIEW SESSION TRACKING</span><i className={timerRunning ? "running" : ""} /></div><strong className="timer-value">{formatTime(timerSeconds)}</strong><p>Time is recorded only while the review session is active.</p><div className="timer-controls">{!timerRunning ? <button onClick={() => setTimerRunning(true)}><Play size={14} />{timerSeconds ? "Resume" : "Start"}</button> : <button onClick={() => setTimerRunning(false)}><Pause size={14} />Pause</button>}<button onClick={finishReview} disabled={!timerSeconds}><Check size={14} />Finish review</button></div></div>
              <div className="audit-card"><div className="section-title"><div><History size={14} />AUDIT TRAIL</div></div><div className="audit-event"><span>SL</span><div><strong>Review opened</strong><p>Sarah Lim · Legal counsel</p><time>Just now</time></div></div>{(finishedTime !== null || decision) && <div className="audit-event completed"><span><Check size={13} /></span><div><strong>{decision || "Review session completed"}</strong><p>Reviewed by Sarah Lim · {Math.floor((finishedTime ?? timerSeconds) / 60)}m {(finishedTime ?? timerSeconds) % 60}s</p><time>Validated against Regulation v2</time></div></div>}</div>
              <div className="session-note"><BookOpen size={15} /><p><strong>Review session tracking</strong>This record can later be exported to your firm&apos;s billing or time-entry system.</p></div>
            </aside>
          </div>
        </div>
      </div>}
    </main>
  );
}
