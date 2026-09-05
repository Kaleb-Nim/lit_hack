# Pearson — PDPA Impact Review

Trace the PDPA (Amendment) Act 2026 through every affected clause on a matter, decide each
edit, sign the document, then run the same review across every similar file.

Built for the SMU LIT Hackathon 2026 (PS4 — *Designing a Sustainable and Resilient LegalTech*).
Next.js 16 App Router, React 19, Tailwind 4, Bun. No backend and no environment variables are
required for the demo; all content is fictional and lives in `lib/pdpa/data.ts` and
`lib/review/documents.ts`.

## Run it

```bash
bun install
bun run dev        # http://localhost:3000
bun run build && bun run start
```

## The flow

| Step | Route | What happens |
| --- | --- | --- |
| 1 | `/` | Summary of the amendment and the five key pointers (obligations). |
| 2 | `/review/[docId]` | Clause-by-clause redline: original vs AI-revised, Accept / Reject (also `Y` / `N`, `↓` / `↑`). |
| 3 | `/review/[docId]/final` | Full document with decisions applied. Sign it, then **Save / download**, or **Find all similar cases & run**. |
| 4 | `/files` | Affected-files explorer. Tick files, run the review, and the first document opens with the rest queued. |

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

Environment variables, when needed, go in the Vercel dashboard or `vercel env add`; the app
currently reads none.
