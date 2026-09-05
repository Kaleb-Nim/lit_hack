# R2 contract integration

The dashboard reads contract objects through `/api/contracts`. R2 credentials stay on the server and are never sent to the browser.

## Configure local development

1. In Cloudflare, open **R2 → Manage API tokens**.
2. Create an **Object Read only** token scoped only to the `lit-hack` bucket.
3. Copy `.env.example` to `.env.local` and replace the two credential placeholders.
4. Restart the Next.js development server.

The supplied endpoint identifies the account and bucket:

```text
R2_ENDPOINT=https://e1015f1eb4204388499536829ed9c10e.r2.cloudflarestorage.com
R2_BUCKET_NAME=lit-hack
```

Do not prefix either browser-exposed variable with `NEXT_PUBLIC_`; these values must remain server-only.

## Object layout

By default the application lists supported files under `Contracts/` (R2 keys are case-sensitive):

```text
Contracts/
  index.json
  employment-contract-v4.pdf
  contractor-agreement.docx
```

`Contracts/index.json` is optional, but recommended. It connects stored files to the regulatory graph:

```json
{
  "contracts": [
    {
      "key": "Contracts/employment-contract-v4.pdf",
      "name": "Employment Contract Template v4",
      "section": "Clause 8.2",
      "dependency": "Minimum Notice Period",
      "currentAssumption": "7 days",
      "updatedRequirement": "14 days",
      "reason": "This clause directly encodes the previous statutory minimum.",
      "status": "Outdated"
    }
  ]
}
```

Without the manifest, filenames and object metadata still appear, and each object defaults to `Needs Review`.

## What this integration reads

The current adapter lists objects, reads the optional JSON manifest, and securely proxies source files for viewing. It does not extract text from PDF or DOCX files. Clause extraction should run as a separate ingestion job when a file is uploaded; that job can write normalized results into `Contracts/index.json` or a database.
