"use client";

import { useMemo, useState } from "react";

/**
 * Demo scope: the roll-out search is hard-coded.
 *
 * The real thing fans the accepted wording out across the firm's matter
 * directories with fuzzy + semantic matching against the clause taxonomy.
 * None of that exists yet, so the filters, directories and hits below are
 * fixtures — the interaction (toggle a filter, watch the scope and the queue
 * count move) is what the demo is showing.
 */

const CLIENTS = ["Meridian Labs", "Calloway Group", "Northwind Health", "All clients"] as const;
const ARTICLES = ["NDAs", "Employment agreements", "Master services", "Leases"] as const;
const POLICIES = ["Firm playbook v2026.1", "Data protection policy", "Outside counsel guidelines"] as const;

const DIRECTORIES = [
  { id: "meridian", name: "Meridian — live matters", path: "/Matters/Meridian/2026", files: 34 },
  { id: "forms", name: "Standard forms", path: "/Templates/Standard forms", files: 12 },
  { id: "nda", name: "NDA precedents", path: "/Precedents/NDA", files: 87 },
  { id: "policies", name: "Firm policies", path: "/Policies", files: 9 },
] as const;

const MATCHES = [
  {
    id: "m1",
    file: "Northwind_MNDA_2025.docx",
    directory: "nda",
    path: "/Precedents/NDA",
    party: "Northwind Health",
    clause: "cl. 1.1",
    score: 96,
    snippet: "…does not include information developed independently by the Receiving Party without reference to any disclosure…",
  },
  {
    id: "m2",
    file: "Meridian_MSA_Schedule3.docx",
    directory: "meridian",
    path: "/Matters/Meridian/2026",
    party: "Meridian Labs",
    clause: "cl. 8.4",
    score: 91,
    snippet: "…shall be held in confidence in perpetuity from the date of disclosure, save for information lawfully in the public domain…",
  },
  {
    id: "m3",
    file: "Standard_NDA_mutual_v4.docx",
    directory: "forms",
    path: "/Templates/Standard forms",
    party: "Firm template",
    clause: "cl. 2.1",
    score: 88,
    snippet: "…the confidentiality obligations in this clause survive termination and continue without limit of time…",
  },
  {
    id: "m4",
    file: "Calloway_Employment_2024.docx",
    directory: "meridian",
    path: "/Matters/Meridian/2026",
    party: "Calloway Group",
    clause: "cl. 11.2",
    score: 74,
    snippet: "…the Employee shall keep confidential all Confidential Information for so long as it remains confidential…",
  },
] as const;

function toggle(set: Set<string>, id: string) {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function FindSimilarClauses({
  clause,
  title,
  text,
  onClose,
  onQueue,
}: {
  clause: string;
  title: string;
  text: string;
  onClose: () => void;
  onQueue: (count: number) => void;
}) {
  const [clients, setClients] = useState(new Set<string>(["Meridian Labs"]));
  const [articles, setArticles] = useState(new Set<string>(["NDAs", "Employment agreements"]));
  const [policies, setPolicies] = useState(new Set<string>(["Firm playbook v2026.1", "Data protection policy"]));
  const [dirs, setDirs] = useState(new Set<string>(["meridian", "forms", "nda"]));
  const [picked, setPicked] = useState(new Set<string>(["m1", "m2", "m3"]));
  const [searching, setSearching] = useState(false);

  const inScope = useMemo(() => MATCHES.filter((match) => dirs.has(match.directory)), [dirs]);
  const selected = inScope.filter((match) => picked.has(match.id));
  const filterCount = clients.size + articles.size + policies.size;
  const directoryCount = new Set(inScope.map((match) => match.directory)).size;

  const search = () => {
    setSearching(true);
    window.setTimeout(() => setSearching(false), 700);
  };

  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-label="Find similar clauses" onClick={onClose}>
      <div className="similar" onClick={(event) => event.stopPropagation()}>
        <header className="similar__head">
          <div className="eyebrow">Find similar clauses · {clause}</div>
          <h2>{title}</h2>
          <blockquote>{text}</blockquote>
        </header>

        <div className="similar__body">
          <div className="similar__filters">
            <span className="eyebrow">1 · Client</span>
            <div className="similar__chips">
              {CLIENTS.map((name) => (
                <button key={name} type="button" aria-pressed={clients.has(name)} onClick={() => setClients((current) => toggle(current, name))}>
                  {name}
                </button>
              ))}
            </div>

            <span className="eyebrow">2 · Article</span>
            <div className="similar__chips">
              {ARTICLES.map((name) => (
                <button key={name} type="button" aria-pressed={articles.has(name)} onClick={() => setArticles((current) => toggle(current, name))}>
                  {name}
                </button>
              ))}
            </div>

            <span className="eyebrow">3 · Policies</span>
            <div className="similar__chips">
              {POLICIES.map((name) => (
                <button key={name} type="button" aria-pressed={policies.has(name)} onClick={() => setPolicies((current) => toggle(current, name))}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <span className="eyebrow similar__label">Directories to search</span>
          <ul className="similar__dirs">
            {DIRECTORIES.map((directory) => (
              <li key={directory.id}>
                <label>
                  <input type="checkbox" checked={dirs.has(directory.id)} onChange={() => setDirs((current) => toggle(current, directory.id))} />
                  <span>
                    <strong>{directory.name}</strong>
                    <small>{directory.path}</small>
                  </span>
                  <em>{directory.files} files</em>
                </label>
              </li>
            ))}
          </ul>

          <span className="eyebrow similar__label">
            Matches
            <i>
              {inScope.length} clause{inScope.length === 1 ? "" : "s"} across {directoryCount} director{directoryCount === 1 ? "y" : "ies"} · {selected.length} selected
            </i>
          </span>
          <ul className={`similar__matches${searching ? " searching" : ""}`}>
            {inScope.map((match) => (
              <li key={match.id}>
                <label>
                  <input type="checkbox" checked={picked.has(match.id)} onChange={() => setPicked((current) => toggle(current, match.id))} />
                  <span>
                    <strong>{match.file}</strong>
                    <small>
                      {match.path} · {match.party} · {match.clause}
                    </small>
                    <p>{match.snippet}</p>
                  </span>
                  <em>{match.score}% match</em>
                </label>
              </li>
            ))}
            {!inScope.length && <li className="similar__empty">No directories in scope — tick one above.</li>}
          </ul>
        </div>

        <footer className="similar__foot">
          <span>
            {filterCount} filter{filterCount === 1 ? "" : "s"} · {directoryCount} director{directoryCount === 1 ? "y" : "ies"} in scope
          </span>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--gold" onClick={search} disabled={searching}>
            {searching ? "Searching…" : "Search again"}
          </button>
          <button type="button" className="btn btn--accept" onClick={() => onQueue(selected.length)} disabled={!selected.length}>
            Queue this edit in {selected.length} file{selected.length === 1 ? "" : "s"}
          </button>
        </footer>
      </div>
    </div>
  );
}
