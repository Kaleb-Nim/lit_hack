/**
 * Pure helpers over the provider's `DocReview` for one `ReviewDocument`:
 * status/text lookups with sensible defaults, keyboard navigation targets,
 * the labels the chrome shows, and the signed-document exports.
 *
 * Nothing here touches React; the components call these with whatever
 * `useReview().getDoc(docId)` returns (possibly `undefined` before
 * `ensureDoc` has run, which every helper treats as "everything open").
 */

import type { DocReview, Status } from "@/lib/review/provider";
import { changeById, changeIndex, type Clause, type ReviewDocument } from "@/lib/review/documents";

export type { Status };

export const STATUS_LABEL: Record<Status, string> = {
  open: "Open",
  accepted: "Accepted",
  rejected: "Rejected",
};

/* ── Theme (ported from redline-review/theme.ts) ───────────────── */

/** Status pill colours. */
export const CHIP: Record<Status, { background: string; color: string }> = {
  open: { background: "#efe9dc", color: "#5c5449" },
  accepted: { background: "#14654f", color: "#f7f4ee" },
  rejected: { background: "#e6e1d8", color: "#7d1d21" },
};

/**
 * How the inserted wording reads in the revised column: open is a live green
 * insertion, accepted settles into the body text, rejected is struck back out.
 */
export const INSERTION: Record<
  Status,
  { background: string; borderBottomColor: string; color: string; textDecoration: string }
> = {
  open: { background: "rgba(20,101,79,.12)", borderBottomColor: "#14654f", color: "#16202c", textDecoration: "none" },
  accepted: { background: "transparent", borderBottomColor: "transparent", color: "#16202c", textDecoration: "none" },
  rejected: { background: "#f0ece4", borderBottomColor: "#c3bcae", color: "#6b6459", textDecoration: "line-through" },
};

/** The gold rail marking which clause the keyboard acts on. */
export function railColor(status: Status, selected: boolean): string {
  if (selected) return "#b0873f";
  return status === "open" ? "rgba(176,135,63,.42)" : "rgba(22,32,44,.14)";
}

/* ── Lookups ───────────────────────────────────────────────────── */

/** The seed passed to `ensureDoc` the first time a document is opened. */
export function seedFor(doc: ReviewDocument): { changeIds: string[]; texts: Record<string, string> } {
  return {
    changeIds: doc.changes.map((c) => c.id),
    texts: Object.fromEntries(doc.changes.map((c) => [c.id, c.text])),
  };
}

export function statusOf(review: DocReview | undefined, id: string): Status {
  return review?.statuses[id] ?? "open";
}

export function textOf(doc: ReviewDocument, review: DocReview | undefined, id: string): string {
  return review?.texts[id] ?? changeById(doc, id)?.text ?? "";
}

export interface Counts {
  total: number;
  open: number;
  accepted: number;
  rejected: number;
}

export function counts(doc: ReviewDocument, review: DocReview | undefined): Counts {
  const out: Counts = { total: doc.changes.length, open: 0, accepted: 0, rejected: 0 };
  for (const c of doc.changes) out[statusOf(review, c.id)] += 1;
  return out;
}

/** The first still-open change, else the first change. */
export function firstOpenId(doc: ReviewDocument, review: DocReview | undefined): string {
  return doc.changes.find((c) => statusOf(review, c.id) === "open")?.id ?? doc.changes[0].id;
}

/**
 * Prefer the next open clause below the cursor; failing that the first open
 * clause anywhere; failing that just advance one, so the key always moves.
 */
export function nextOpenId(doc: ReviewDocument, review: DocReview | undefined, selected: string): string {
  const i = changeIndex(doc, selected);
  const open = doc.changes.map((_, k) => k).filter((k) => statusOf(review, doc.changes[k].id) === "open" && k !== i);
  const forward = open.find((k) => k > i);
  const target = forward ?? (open.length ? open[0] : (i + 1) % doc.changes.length);
  return doc.changes[target].id;
}

/** Move the selection by one, wrapping around. */
export function stepId(doc: ReviewDocument, selected: string, delta: 1 | -1): string {
  const i = changeIndex(doc, selected);
  const n = (i + delta + doc.changes.length) % doc.changes.length;
  return doc.changes[n].id;
}

/* ── Labels ────────────────────────────────────────────────────── */

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Everything the chrome needs to describe the current review, in one place. */
export function derive(doc: ReviewDocument, review: DocReview | undefined, selected: string) {
  const c = counts(doc, review);
  const change = changeById(doc, selected) ?? doc.changes[0];
  const position = changeIndex(doc, change.id) + 1;
  const signedBy = review?.signedBy;
  const signedAt = review?.signedAt;
  const signed = Boolean(signedBy && signedAt);

  return {
    ...c,
    signed,
    signedBy,
    signedAt,
    selectedChange: change,
    selectedStatus: statusOf(review, change.id),
    selectedText: textOf(doc, review, change.id),

    positionLabel: `Clause ${position} of ${c.total} · ${c.open} open`,

    finalPositionLabel: signed
      ? "Signed"
      : c.open === 0
        ? `All ${c.total} edits resolved`
        : `${c.open} of ${c.total} still open`,

    footerState:
      c.open === 0
        ? "All edits resolved — open the full document to sign"
        : `${plural(c.open, "edit")} awaiting your decision`,

    finalNote: signed
      ? `Signed by ${signedBy} on ${formatDate(signedAt as string)}`
      : c.open === 0
        ? "Every clause decided — ready to sign"
        : `${plural(c.open, "edit")} still open — shown with original wording until decided`,

    finalStamp: signed
      ? `signed by ${signedBy} on ${formatDate(signedAt as string)}`
      : c.open === 0
        ? "every clause decided, awaiting signature"
        : "draft, review in progress",

    tallyLine: `${c.accepted} accepted · ${c.rejected} rejected${c.open ? ` · ${c.open} open` : ""}`,
  };
}

export type Derived = ReturnType<typeof derive>;

/* ── The document with decisions applied ───────────────────────── */

/** The wording that lands in the gap: the reviewer's text if accepted, else the original. */
export function appliedWording(doc: ReviewDocument, review: DocReview | undefined, clause: Clause): string {
  if (!clause.changeId) return "";
  const change = changeById(doc, clause.changeId);
  if (!change) return "";
  return statusOf(review, change.id) === "accepted" ? textOf(doc, review, change.id) : change.replaced;
}

/** before + applied + after as one run of text. */
export function clauseText(doc: ReviewDocument, review: DocReview | undefined, clause: Clause): string {
  const applied = appliedWording(doc, review, clause);
  return `${clause.before}${applied ? ` ${applied}` : ""}${clause.after ?? ""}`;
}

/* ── Exports ───────────────────────────────────────────────────── */

interface ExportModel {
  title: string;
  kind: string;
  executedLine: string;
  sections: { heading: string; clauses: { number: string; text: string }[] }[];
  decisions: { status: Status; clause: string; title: string; wording: string }[];
  tally: string;
  signedBy: string;
  signedDate: string;
  signatories: [string, string];
}

function exportModel(doc: ReviewDocument, review: DocReview | undefined): ExportModel {
  const d = derive(doc, review, doc.changes[0].id);
  const signedDate = d.signedAt ? d.signedAt.slice(0, 10) : "";
  return {
    title: doc.parties,
    kind: doc.kind,
    executedLine: `${doc.executed} · amended draft, ${d.finalStamp}`,
    sections: doc.sections.map((s) => ({
      heading: s.heading,
      clauses: s.clauses.map((c) => ({ number: c.number, text: clauseText(doc, review, c) })),
    })),
    decisions: doc.changes.map((c) => {
      const status = statusOf(review, c.id);
      return {
        status,
        clause: c.clause,
        title: c.title,
        wording: status === "accepted" ? textOf(doc, review, c.id) : c.replaced || "(no original wording — insertion not made)",
      };
    }),
    tally: d.tallyLine,
    signedBy: d.signedBy ?? "",
    signedDate,
    signatories: doc.signatories,
  };
}

/** Markdown export of the signed document: text, decisions and signature block. */
export function buildSignedMarkdown(doc: ReviewDocument, review: DocReview | undefined): string {
  const m = exportModel(doc, review);
  const lines: string[] = [];
  lines.push(`# ${m.title}`, "", `_${m.kind}_  `, `${m.executedLine}`, "");
  for (const s of m.sections) {
    lines.push(`## ${s.heading}`, "");
    for (const c of s.clauses) lines.push(`**${c.number}** ${c.text}`, "");
  }
  lines.push("## Decisions", "", `${m.tally}`, "");
  for (const dcn of m.decisions) {
    const label = STATUS_LABEL[dcn.status];
    const note = dcn.status === "accepted" ? "final wording" : dcn.status === "rejected" ? "original wording kept" : "undecided — original wording shown";
    lines.push(`- **${label}** — ${dcn.clause}: ${dcn.title}  `, `  ${note}: “${dcn.wording}”`);
  }
  lines.push("", "## Signature", "");
  lines.push(`${m.signatories[0]}: ${m.signedBy}  `, `Date: ${m.signedDate}`, "", `${m.signatories[1]}: ________________________  `, `Date: ____________`, "");
  lines.push(`Signed electronically by ${m.signedBy} on ${m.signedDate} via Pearson contract review.`, "");
  return lines.join("\n");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** The same content as the Markdown export, as a self-contained HTML page. */
export function buildSignedHtml(doc: ReviewDocument, review: DocReview | undefined): string {
  const m = exportModel(doc, review);
  const parts: string[] = [];
  parts.push(
    "<!doctype html>",
    `<html lang="en"><head><meta charset="utf-8"><title>${esc(m.title)}</title>`,
    "<style>body{font-family:Georgia,serif;max-width:760px;margin:48px auto;padding:0 24px;color:#16202c;line-height:1.7}h1{font-size:24px}h2{font-size:16px;margin-top:28px}.kicker{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#6b6459}.stamp{color:#6b6459;font-size:13px}.clause{display:flex;gap:14px;margin:0 0 14px}.num{flex:none;width:36px;color:#8b8577}.sig{display:flex;gap:60px;margin-top:32px;padding-top:24px;border-top:1px solid #ded8cd}.sig div{min-width:200px}.line{border-bottom:1px solid #16202c;height:36px;margin-bottom:6px;font-weight:600}.label{font-size:12.5px;color:#5c5449}ul{padding-left:18px}</style></head><body>",
    `<div class="kicker">${esc(m.kind)}</div>`,
    `<h1>${esc(m.title)}</h1>`,
    `<p class="stamp">${esc(m.executedLine)}</p>`,
  );
  for (const s of m.sections) {
    parts.push(`<h2>${esc(s.heading)}</h2>`);
    for (const c of s.clauses) parts.push(`<div class="clause"><span class="num">${esc(c.number)}</span><p>${esc(c.text)}</p></div>`);
  }
  parts.push("<h2>Decisions</h2>", `<p>${esc(m.tally)}</p>`, "<ul>");
  for (const dcn of m.decisions) {
    const note = dcn.status === "accepted" ? "final wording" : dcn.status === "rejected" ? "original wording kept" : "undecided — original wording shown";
    parts.push(`<li><strong>${STATUS_LABEL[dcn.status]}</strong> — ${esc(dcn.clause)}: ${esc(dcn.title)}<br><em>${note}:</em> “${esc(dcn.wording)}”</li>`);
  }
  parts.push("</ul>", "<h2>Signature</h2>", '<div class="sig">');
  parts.push(`<div><div class="line">${esc(m.signedBy)}</div><div class="label">${esc(m.signatories[0])} · ${esc(m.signedDate)}</div></div>`);
  parts.push(`<div><div class="line"></div><div class="label">${esc(m.signatories[1])}</div></div>`);
  parts.push("</div>", `<p class="stamp">Signed electronically by ${esc(m.signedBy)} on ${esc(m.signedDate)} via Pearson contract review.</p>`, "</body></html>");
  return parts.join("\n");
}
