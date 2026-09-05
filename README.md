This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Singapore regulation registry

The application keeps official legislation separate from editable company analysis:

- `GET /api/regulations` returns the cached Singapore legislation catalogue, version history, lifecycle events, and internal overlays. It accepts `query`, `kind`, `status`, `page`, and `limit` filters; `limit` is capped at 500.
- `PATCH /api/regulations` writes only internal notes, tracking state, and tags to `Regulations/overlays.json` in R2. It never changes official legislation.
- `POST /api/regulations/sync` refreshes current, repealed/revoked, and uncommenced Acts and subsidiary legislation from Singapore Statutes Online into `Regulations/catalog.json` in R2. It requires `Authorization: Bearer $REGULATION_SYNC_SECRET`.

Singapore Statutes Online permits automated extraction only from 03:00 to 07:00 Singapore time. The sync route enforces that window and returns HTTP 423 without contacting SSO outside it. Schedule one controlled daily sync in that window; do not invoke it from the browser or on every request.

The checked-in starter record is a sourced PDPA timeline so the interface remains useful before the first catalogue sync. Other instruments receive their official title and URL during the catalogue sync; detailed historical versions should be added by a separately throttled hydration job as they are selected or tracked.

The same sync caches the PDPA texts effective 2 January 2021 and 5 December 2025 under `Regulations/sources/PDPA2012/`. The regulation workspace displays a verified baseline comparison immediately. With `OPENAI_API_KEY` set server-side, `POST /api/regulations/PDPA2012/comparison` uses the OpenAI Responses API to create a structured summary from those cached texts and stores the result under `Regulations/comparisons/PDPA2012/`. If the source snapshots are not cached yet, the AI is limited to the verified amendment records and the interface says so explicitly.

`OPENAI_API_KEY` must remain in `.env.local` or the deployment secret store and must never be exposed through a `NEXT_PUBLIC_` variable. `OPENAI_MODEL` is optional and defaults to `gpt-5-mini`.

The R2 credentials must be server-only. Catalogue sync and internal notes require write access to the `Regulations/` prefix; a read-only key can still serve contracts and previously cached regulation data.
