# Pearson review flow — route and ownership contract

Target repo: `/Users/kalebnim/Documents/GitHub/lit_hack` (Next.js 16.2 App Router, React 19,
Tailwind 4, Bun). **Read `node_modules/next/dist/docs/01-app/` before writing code** — this
Next.js differs from training data. In particular: `params` and `searchParams` are Promises,
`"use client"` pages cannot be `async`, `next/link` for navigation, `useRouter` from
`next/navigation`.

Source material to port (read-only, do NOT copy files wholesale — port into the contract below):

- Summary + explorer (static JS): `/Users/kalebnim/orca/workspaces/GitHub/madtom/pdpa-impact-review/{app.js,data.js,index.html,README.md}`
- Clause reviewer (Vite/React 18): `/Users/kalebnim/orca/workspaces/GitHub/Build-merge-docx-feature/redline-review/src/**` and its `README.md`

Both share the Pearson design system (navy / gold / cream, Playfair Display + Source Sans 3 +
Lora). The tokens, `.btn*`, `.chip`, `.card`, `.eyebrow`, `.ph*` header, `.steps*`, `.shell*`,
`.scrim` / `.dialog` classes already exist in `app/globals.css`. Reuse them; add route-specific
CSS in your own file (see ownership). Fonts are loaded in `app/layout.tsx` via `next/font` and
exposed as `--font-playfair`, `--font-source-sans`, `--font-lora`; use `var(--serif-display)`,
`var(--sans)`, `var(--serif-body)`.

## The flow (this is the user's spec — do not reorder)

```
1. /                          Summary of the PDPA amendment + key pointers (5 obligations)
        │  "Review the clauses →"           → /review/meridian-mnda-v4
        │  obligation card "Review N docs"  → /files?obligation=o1
        │  "See all affected files"         → /files
        ▼
2. /review/[docId]            Clauses: original vs AI-revised, Accept (yes) / Reject (no) per clause
        │  "← Back to summary"              → /
        │  "Open full document →"           → /review/[docId]/final
        ▼
3. /review/[docId]/final      Full document with decisions applied; Sign; then EITHER
        │  "← Back to clauses"              → /review/[docId]
        │  "Save / download"                → real file download (signed document)
        │  "Find all similar cases & run →" → /files?similar=[docId]
        │  "Open next document →" (only when the run queue has a next doc) → /review/[next]
        ▼
4. /files                     Affected files explorer (filter by type, split by matter/client,
        │                     tick rows). "Run review on N files →" runs, then opens the first.
        │  "← Back to summary"              → /
        │  "← Back to document" (when ?similar=) → /review/[similar]/final
        │  run complete                     → /review/[first selected docId]
```

**Back navigation rule:** every "Back" control is a `<Link href=...>` with the explicit
destination above. Never use `router.back()` — it breaks when the page was opened directly.
Because these are real routes, the browser Back button also works; state survives it because
review decisions live in `ReviewProvider` (root layout) mirrored to sessionStorage.

## Shared modules (already written — consume, do not fork)

- `lib/pdpa/data.ts` — `REGULATION`, `EXECUTIVE_SUMMARY`, `OBLIGATIONS`, `FILES`, `FILE_BY_ID`,
  `OBLIGATION_BY_ID`, `FILE_TYPES`, `TYPE_TINT`, `FIRST_DOC_ID`, `isDocId()`, `isObligationId()`,
  `similarFiles(docId)`. `DocId` is the route slug for `/review/[docId]`. There are 11 files.
- `lib/review/provider.tsx` — `ReviewProvider` (mounted in root layout) and `useReview()`:
  `docs`, `queue`, `hydrated`, `getDoc`, `ensureDoc`, `setStatus`, `setText`, `sign`,
  `resetDoc`, `startRun(ids)`, `nextInQueue(docId)`, `clearQueue`, `resetAll`.
  The review agent (B) owns this file from now on and may extend it, but must keep the
  existing signatures because agent A calls `startRun`, `queue`, `docs`, `hydrated`.
- `components/pearson-header.tsx` — `<PearsonHeader kicker title meta? position? actions? />`.
  Brand links to `/`.
- `components/flow-steps.tsx` — `<FlowSteps current hrefs />` four-step breadcrumb. Render it
  directly under the header on every route. `hrefs` gives the link for each earlier step, e.g.
  on `/review/x/final`: `{ summary: "/", clauses: "/review/x" }`.
- `app/globals.css`, `app/layout.tsx` — shared; only agent A may edit these, and only additively.

## Ownership (disjoint — do not touch the other agent's files)

### Agent A — summary, key pointers, affected files, run, global handling
- `app/page.tsx` (+ `app/summary.css` or a CSS module) — port `summaryView()`: hero, executive
  summary, the "Go to review" CTA (now linking to `/review/meridian-mnda-v4` with the label
  "Review the clauses →"), legend, five obligation cards. Each card's "N documents affected"
  becomes a link to `/files?obligation=<id>`; "Download as Google Doc" becomes a real download
  (see handling). Page may be a server component with small client islands.
- `app/files/page.tsx` (+ CSS) — port `explorerView()`: filter chips, split by matter/client,
  tick rows, select-all, footer. Honour `?obligation=` (pre-tick only that obligation's docs),
  `?similar=<docId>` (pre-tick `similarFiles(docId)`, show a "Similar to <file>" banner and a
  "← Back to document" link). The "Review N files →" button opens the run dialog (port of
  `queueDialog`), whose confirm **runs**: show a progress list ("Preparing redline for X…",
  one row per file, ~350 ms apart, using `setTimeout`, cancellable), then call
  `startRun(ids)` and `router.push('/review/' + ids[0])`. Zero selected → button disabled and
  an inline message, never a crash.
- `app/error.tsx` (client, "Something went wrong" + Try again + Back to summary),
  `app/not-found.tsx`, `app/loading.tsx` — Pearson-styled.
- `lib/download.ts` — `downloadText(filename, text, mime)` using a Blob + object URL, revoking
  the URL afterwards, with try/catch that returns `false` on failure so callers can show an
  inline error. Agent B imports this too — write it first and keep the signature.
- Downloads on the summary: "Download summary" builds a Markdown memo from
  `REGULATION`, `EXECUTIVE_SUMMARY` and `OBLIGATIONS` (or one obligation) and calls
  `downloadText`. Filenames as in the original (`PDPA_2026_Impact_Summary_Meridian.md`,
  `PDPA_2026_<ref>_memo.md`).
- `app/globals.css` / `app/layout.tsx` additive edits only if truly needed.

### Agent B — clauses, full document, sign, download, next-in-queue
- `lib/review/documents.ts` — clause fixtures keyed by `DocId`, shape from redline-review's
  `document.ts` (`SECTIONS`, `CHANGES`, `before | replaced | after`). Content must relate to the
  PDPA obligations that `lib/pdpa/data.ts` says touch that file (e.g. Meridian_MNDA cl. 6.1/6.4
  → breach notice tightened from "without undue delay" to 24 hours / three-day statutory window;
  Calloway MSA cl. 12.3 breach notice, 12.9 portability/export assistance, 15.2 liability cap;
  Employment agreement cl. 11.4 legitimate interests / 11.7 mishandling offence). Write full,
  hand-crafted fixtures for at least these four: `meridian-mnda-v4`, `calloway-msa-2026`,
  `cloud-hosting-dpa`, `employment-agreement-rao-v2`. For the remaining seven, generate a
  plausible 2–3 change fixture programmatically from `FILE_BY_ID[docId].clauses` and the
  obligations' `policies[].change` text so **every DocId resolves** — no 404 for a valid id.
  Export `getDocument(docId): ReviewDocument | null` and `DOCUMENT_META` (fileName, kind,
  parties, executed, pageCount, originalLabel, revisedLabel).
- `lib/review/state.ts` — `derive()` etc., adapted to read from the provider's `DocReview`.
- `lib/review/provider.tsx` — you own it now (keep the public signatures).
- `app/review/layout.tsx` + `app/review/review.css` — port `styles.css` minus the tokens and
  button classes already in globals (do not redefine `.btn`, `.chip`, `.eyebrow`, `.scrim`,
  `.dialog`; keep `.compare`, `.sheet`, `.cell*`, `.clause*`, `.panel*`, `.paper*`, etc.).
- `app/review/[docId]/page.tsx` — server component: `const { docId } = await params`; if
  `!isDocId(docId)` or `getDocument()` is null → `notFound()`. Renders `<PearsonHeader>` with
  kicker "Contract review", `<FlowSteps current="clauses" hrefs={{ summary: "/" }} />`, then a
  client `ReviewWorkspace` (compare pane + side panel + footer + keyboard Y/N/↑/↓ hook).
  Header actions: "← Back to summary" (Link `/`) and "Open full document →"
  (Link `/review/[docId]/final`). Footer: "Open full document →" as well. Call `ensureDoc` on
  mount. Show a neutral skeleton until `hydrated`.
- `app/review/[docId]/final/page.tsx` — full document with decisions applied (port
  `FinalDocument`), `<FlowSteps current="document" hrefs={{ summary: "/", clauses: "/review/[docId]" }} />`.
  Below the signature block: a **Sign** control — a name input (default `A. Osei`) and a
  "Sign document" button; once signed, render the name + date on the signature line, a
  "Signed" chip in the bar, and enable **"Save / download"** which calls
  `downloadText(<fileName without .docx>_signed.md, ...)` with the full document text,
  decisions tally and signature block (Markdown). Also offer "Download as HTML" using the same
  content. If any edits are still open, the Sign button is disabled with the hint
  "Decide every clause before signing" and a link back to `/review/[docId]`.
  Then two CTAs: "Find all similar cases & run →" (Link `/files?similar=[docId]`) and, only
  when `nextInQueue(docId)` is non-null, "Open next document →" (Link `/review/[next]`), with a
  small "N remaining in this run" line. Bottom bar: "← Back to clauses" (Link).
- `app/review/[docId]/not-found.tsx` — "That document is not in this matter" + link to `/files`.

## Handling (both)
- Every fetch-free page must still handle: unknown ids (notFound), pre-hydration render,
  empty selections, download failure (inline message), sessionStorage unavailable (provider
  already swallows this), and keyboard shortcuts being inert while typing.
- No `alert()`/`confirm()`/`prompt()`.
- `bun run build` and `bun run lint` must pass with zero errors on your files.

## Verification before you report
Run `bun run build` (fix any type errors in your files) and `bun run lint`. Then, in a
scratch script, start `bun run dev -p 3100` and curl each of your routes for HTTP 200 (and a
bad id for 404). Report the exact files you created/changed and anything you could not finish.
