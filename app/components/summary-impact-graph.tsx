"use client";

import { FileText, Scale, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import type { ContractReviewResult } from "@/lib/contract-review-model";
import { regulationById, type RegulationId } from "@/lib/regulatory-workspace";

export type ImpactGraphContract = {
  key: string;
  name: string;
  editable: boolean;
  convertible: boolean;
  company: string;
  documentType: string;
  downloadUrl: string;
  priority: "High" | "Medium" | "Low";
  prioritySource: "AI checked" | "Pre-screened";
};

type PolicyArea = { id: string; label: string; description: string; pattern: RegExp };

const POLICY_AREAS: Record<RegulationId, PolicyArea[]> = {
  PDPA2012: [
    { id: "breach", label: "Breach notification", description: "Detection, escalation and notification timing", pattern: /breach|incident|26d|notify|notification/i },
    { id: "consent", label: "Consent & purpose", description: "Consent, permitted use and purpose limitation", pattern: /consent|purpose|legitimate interest|business improvement/i },
    { id: "protection", label: "Data protection", description: "Security safeguards and processor duties", pattern: /protect|security|safeguard|processor|access control/i },
    { id: "retention", label: "Retention & transfer", description: "Deletion, retention and overseas transfers", pattern: /retain|retention|delete|disposal|transfer|overseas/i },
    { id: "accountability", label: "Accountability", description: "Governance, records and responsible roles", pattern: /accountab|record|policy|dpo|responsib|audit/i },
  ],
  WFA2025: [
    { id: "decisions", label: "Fair employment decisions", description: "Hiring, appraisal, promotion and dismissal", pattern: /hire|hiring|recruit|promotion|dismiss|employment decision|performance/i },
    { id: "characteristics", label: "Protected characteristics", description: "Protection from workplace discrimination", pattern: /characteristic|discriminat|age|nationality|sex|race|religion|disability/i },
    { id: "grievance", label: "Grievance handling", description: "Reporting, investigation and remediation", pattern: /grievance|complaint|report|investigat|remedi/i },
    { id: "records", label: "Records & accountability", description: "Policies, training and decision records", pattern: /record|policy|training|accountab|document/i },
  ],
};

function policyHits(contract: ImpactGraphContract, regulationId: RegulationId, review: ContractReviewResult | null) {
  const areas = POLICY_AREAS[regulationId];
  const evidence = review
    ? review.suggestions.map((suggestion) => `${suggestion.clause} ${suggestion.reason} ${suggestion.legalBasis} ${suggestion.proposedText}`).join(" ")
    : decodeURIComponent(`${contract.key} ${contract.name} ${contract.documentType}`);
  const matched = areas.filter((area) => area.pattern.test(evidence));
  if (matched.length) return matched;
  return regulationId === "WFA2025"
    ? areas.filter((area) => area.id === "decisions" || area.id === "records")
    : areas.filter((area) => area.id === "protection" || area.id === "accountability");
}

function priorityReasons(contract: ImpactGraphContract, regulationId: RegulationId, review: ContractReviewResult | null) {
  if (review) {
    const high = review.suggestions.filter((suggestion) => suggestion.confidence === "high").length;
    if (contract.priority === "High") return [
      `${high} high-confidence clause finding${high === 1 ? "" : "s"} from the cached AI review.`,
      `${review.suggestions.length} proposed change${review.suggestions.length === 1 ? "" : "s"} include official-source legal reasoning.`,
    ];
    if (contract.priority === "Medium") return [
      `${review.suggestions.length} material clause suggestion${review.suggestions.length === 1 ? "" : "s"} found, with none marked high confidence.`,
      "A lawyer should confirm the scope and proposed wording.",
    ];
    return ["The completed AI review found no material clause change.", "The file remains available for legal confirmation and audit history."];
  }

  const value = decodeURIComponent(`${contract.key} ${contract.name}`).toLowerCase();
  const direct = regulationId === "WFA2025"
    ? /employment|employee|offer|intern|staff|workplace/.test(value)
    : /privacy|personal data|data protection|processing|security|confidential|nda/.test(value);
  return [
    direct ? `The file name contains terms directly associated with ${regulationById(regulationId).shortName}.` : "The file was included through its document type or an indirect metadata match.",
    `${contract.documentType} documents are ${contract.priority === "High" ? "likely to contain operative clauses" : "screened for potentially relevant clauses"}.`,
    "This is a pre-screen only. Review & edit replaces it with clause-level evidence.",
  ];
}

function contractHref(contract: ImpactGraphContract, regulationId: RegulationId) {
  return contract.editable || contract.convertible
    ? `/contracts/${contract.key.split("/").map(encodeURIComponent).join("/")}?regulation=${regulationId}`
    : contract.downloadUrl;
}

export function SummaryImpactGraph({
  regulationId,
  contracts,
  reviews,
  selectedKey,
  onSelect,
}: {
  regulationId: RegulationId;
  contracts: ImpactGraphContract[];
  reviews: Record<string, ContractReviewResult>;
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const regulation = regulationById(regulationId);
  const selected = contracts.find((contract) => contract.key === selectedKey) ?? contracts[0];
  const review = selected ? reviews[selected.key] ?? null : null;
  const hits = selected ? policyHits(selected, regulationId, review) : [];
  const reasons = selected ? priorityReasons(selected, regulationId, review) : [];
  const workbench = Boolean(selected && (selected.editable || selected.convertible));

  const { nodes, edges } = (() => {
    if (!selected) return { nodes: [], edges: [] };
    const areas = POLICY_AREAS[regulationId];
    const columnWidth = 310;
    const rootX = Math.max(0, ((areas.length - 1) * columnWidth) / 2);
    const graphNodes: Node[] = [{
      id: "regulation",
      type: "input",
      position: { x: rootX, y: 0 },
      sourcePosition: Position.Bottom,
      className: "flow-node flow-node--regulation",
      data: { label: <div className="flow-node__label"><Scale size={16} /><span><small>Official regulation</small><strong>{regulation.title}</strong></span></div> },
      style: { width: 280 },
    }];
    const graphEdges: Edge[] = [];
    const documentsByPrimaryArea = new Map(areas.map((area) => [area.id, [] as Array<{ contract: ImpactGraphContract; index: number }>]));

    areas.forEach((area, index) => {
      const areaHit = hits.some((hit) => hit.id === area.id);
      graphNodes.push({
        id: `policy-${area.id}`,
        position: { x: index * columnWidth, y: 150 },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        className: `flow-node flow-node--policy${areaHit ? " is-selected-path" : ""}`,
        data: { label: <div className="flow-node__label"><ShieldCheck size={15} /><span><strong>{area.label}</strong><small>{area.description}</small></span></div> },
        style: { width: 250 },
      });
      graphEdges.push({
        id: `regulation-${area.id}`,
        source: "regulation",
        target: `policy-${area.id}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        className: areaHit ? "flow-edge is-selected-path" : "flow-edge",
      });
    });

    contracts.forEach((contract, index) => {
      const contractHits = policyHits(contract, regulationId, reviews[contract.key] ?? null);
      const primary = contractHits[0] ?? areas[0];
      documentsByPrimaryArea.get(primary.id)?.push({ contract, index });
    });

    areas.forEach((area, areaIndex) => {
      const column = documentsByPrimaryArea.get(area.id) ?? [];
      column.forEach(({ contract, index }, row) => {
        const id = `document-${index}`;
        const isSelected = contract.key === selected.key;
        graphNodes.push({
          id,
          type: "output",
          position: { x: areaIndex * columnWidth, y: 335 + row * 104 },
          targetPosition: Position.Top,
          className: `flow-node flow-node--document flow-node--${contract.priority.toLowerCase()}${isSelected ? " is-selected" : ""}`,
          data: {
            contractKey: contract.key,
            priority: contract.priority,
            label: <div className="flow-node__label"><FileText size={14} /><span><strong>{contract.name}</strong><small>{contract.company} · {contract.documentType}</small></span><b>{contract.priority}</b></div>,
          },
          style: { width: 250 },
        });

        policyHits(contract, regulationId, reviews[contract.key] ?? null).forEach((hit) => {
          graphEdges.push({
            id: `${hit.id}-${id}`,
            source: `policy-${hit.id}`,
            target: id,
            markerEnd: { type: MarkerType.ArrowClosed },
            className: isSelected ? "flow-edge is-selected-path" : "flow-edge",
            animated: isSelected,
          });
        });
      });
    });

    return { nodes: graphNodes, edges: graphEdges };
  })();

  if (!selected) return <div className="document-filter-message">No documents match the current filters.</div>;

  return <div className="impact-graph">
    <div className="impact-graph__canvas" aria-label={`Dependency path for ${selected.name}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.025, minZoom: 0.34, maxZoom: 1.1 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        onNodeClick={(_, node) => {
          const key = node.data.contractKey;
          if (typeof key === "string") onSelect(key);
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#c9c4b9" />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeColor={(node) => node.id === "regulation" ? "#16202c" : node.className?.toString().includes("--high") ? "#9b2226" : node.className?.toString().includes("--medium") ? "#b0873f" : "#d8d3c9"} />
      </ReactFlow>
    </div>

    <aside className="impact-explanation">
      <div className="impact-explanation__head"><span className={`document-filter-priority document-filter-priority--${selected.priority.toLowerCase()}`}><strong>{selected.priority}</strong><small>{review && <Sparkles size={10} />}{selected.prioritySource}</small></span><div><span className="eyebrow">Why this priority</span><h3>{selected.name}</h3></div></div>
      <p className="impact-explanation__path">{regulation.shortName} → {hits.map((hit) => hit.label).join(" + ")} → {selected.documentType}</p>
      <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      {review?.suggestions.length ? <div className="impact-explanation__evidence"><span>Clause evidence</span>{review.suggestions.slice(0, 3).map((suggestion) => <p key={suggestion.id}><strong>{suggestion.clause}</strong>{suggestion.reason}</p>)}</div> : null}
      <Link href={contractHref(selected, regulationId)} target={workbench ? undefined : "_blank"}>{workbench ? "Review & edit" : "Open source"}</Link>
    </aside>

  </div>;
}
