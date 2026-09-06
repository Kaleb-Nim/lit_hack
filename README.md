# L.A.R.P — Localised Amendment Resilience Platform

Trace sourced Singapore regulatory changes through contracts stored in Cloudflare R2. Lawyers can
edit a browser-only Word working copy and download it without changing the source object.

Built for the SMU LIT Hackathon 2026 (PS4 — *Designing a Sustainable and Resilient LegalTech*).
Next.js 16 App Router, React 19, Tailwind 4 and Bun. The review corpus in
`lib/review/documents.ts` is demonstration content; regulation metadata comes from Singapore
Statutes Online, contracts come from Cloudflare R2, and optional summaries use the OpenAI API.

## Run it

```bash
bun install
bun run dev        # http://localhost:3000
bun run build && bun run start
```

## The flow

| Step | Route | What happens |
| --- | --- | --- |
| 1 | `/` | Shared legal workspace for PDPA and the Workplace Fairness Act. |
| 2 | `/regulations/pdpa` | Verified PDPA history, impact summary, and downloadable memo. |
| 3 | `/regulations/wfa` | Workplace Fairness Act readiness view, clearly marked uncommenced. |
| 4 | `/contracts` | Live contract library read from R2 and filtered by regulation. |
| 5 | `/contracts/[...key]` | Edit a `.docx` working copy in browser memory and download a new Word file. |
| 6 | `/resilience` | Regulatory knowledge graph, historical versions, and dependency review. |

Every "Back" control is a real link, so the browser Back button works too. Decisions and
signatures are kept in `sessionStorage` for the tab, so navigating back and forth or refreshing
does not lose them. Unknown document ids return a 404 page; downloads that the browser blocks
show an inline note instead of failing silently.

## Where things live

| Path | Role |
| --- | --- |
| `lib/pdpa/data.ts` | The regulation summary, five obligations, eleven affected files, and the `docId` slugs. |
| `lib/review/documents.ts` | Clause fixtures per document (`before \| replaced \| after`). |
| `lib/review/provider.tsx` | Cross-route review state (`useReview()`), mirrored to `sessionStorage`. |
| `components/` | Shared header, step breadcrumb, and the review workspace pieces. |
| `docs/agents/flow-contract.md` | The route and ownership contract the pages were built against. |
| `docs/demo-corpus/`, `docs/sources/`, `docs/strategy/` | Hackathon research, the redacted demo corpus, and the pitch material. |

## Deploy

The repo is linked to the `lit_hack` project on Vercel. From the repo root:

```bash
vercel deploy --prod
```

## Singapore regulation registry

The application keeps official legislation separate from editable client analysis:

- `GET /api/regulations` returns the cached Singapore legislation catalogue, version history, lifecycle events, and internal overlays. It accepts `query`, `kind`, `status`, `page`, and `limit` filters; `limit` is capped at 500.
- `PATCH /api/regulations` writes only internal notes, tracking state, and tags to `Regulations/overlays.json` in R2. It never changes official legislation.
- `POST /api/regulations/sync` refreshes current, repealed/revoked, and uncommenced Acts and subsidiary legislation from Singapore Statutes Online into `Regulations/catalog.json` in R2. It requires `Authorization: Bearer $REGULATION_SYNC_SECRET`.

Singapore Statutes Online permits automated extraction only from 03:00 to 07:00 Singapore time. The sync route enforces that window and returns HTTP 423 without contacting SSO outside it. Schedule one controlled daily sync in that window; do not invoke it from the browser or on every request.

The checked-in starter records contain sourced PDPA and Workplace Fairness Act timelines so the interface remains useful before the first catalogue sync. Other instruments receive their official title and URL during the catalogue sync; detailed historical versions should be added by a separately throttled hydration job as they are selected or tracked.

## Contract working copies

`GET /api/contracts` lists source objects and marks modern `.docx` files as editable. `GET /api/contracts/[...key]` streams the original object. There is intentionally no contract write endpoint. The browser opens `word/document.xml` from the downloaded package, applies text edits to a new in-memory package, and downloads `<name>_LARP_working_copy.docx`. PDFs and legacy `.doc` files remain read-only source documents.

The same sync caches the PDPA texts effective 2 January 2021 and 5 December 2025 under `Regulations/sources/PDPA2012/`. The regulation workspace displays a verified baseline comparison immediately. With `OPENAI_API_KEY` set server-side, `POST /api/regulations/PDPA2012/comparison` uses the OpenAI Responses API to create a structured summary from those cached texts and stores the result under `Regulations/comparisons/PDPA2012/`. If the source snapshots are not cached yet, the AI is limited to the verified amendment records and the interface says so explicitly.

`OPENAI_API_KEY` must remain in `.env.local` or the deployment secret store and must never be exposed through a `NEXT_PUBLIC_` variable. `OPENAI_MODEL` is optional and defaults to `gpt-5-mini`.

The R2 credentials must be server-only. Catalogue sync and internal notes require write access to the `Regulations/` prefix; a read-only key can still serve contracts and previously cached regulation data.

Configure production secrets in the Vercel dashboard or with `vercel env add`; never commit `.env.local`.
