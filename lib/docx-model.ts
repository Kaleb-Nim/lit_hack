/**
 * A tiny, serialisable document model. Server components build one of these
 * (plain data, so it can cross the server → client boundary) and the browser
 * turns it into a real .docx with `lib/docx.ts`.
 */

export type DocBlock =
  | { kind: "kicker"; text: string }
  | { kind: "title"; text: string }
  | { kind: "subtitle"; text: string }
  | { kind: "heading"; text: string; level?: 1 | 2 | 3 }
  | { kind: "para"; text: string; italic?: boolean; muted?: boolean }
  | { kind: "label"; label: string; text: string }
  | { kind: "clause"; number: string; text: string }
  | { kind: "bullet"; text: string; strong?: string }
  | { kind: "rule" }
  | { kind: "signature"; party: string; name?: string; date?: string }
  | { kind: "pagebreak" };

export interface DocModel {
  /** Word "Title" metadata and the document's first heading. */
  title: string;
  creator?: string;
  description?: string;
  blocks: DocBlock[];
}
