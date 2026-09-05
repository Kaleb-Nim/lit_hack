# Demo Corpus — Singapore internship & employment contracts

**Status:** draft for the SMU LIT Hackathon 2026 pitch (PS4 — *Designing a Sustainable and Resilient LegalTech*).
**Prepared:** 5 September 2026.

---

## ⚠️ Read this before you put anything on a slide

The source documents behind this corpus are **five real, signed employment and internship
contracts belonging to one named living individual**, shared by a teammate from a personal
Google Drive folder. They contain her full legal name, her NRIC/FIN number, her personal and
university email addresses, her home address, her exact stipend and allowance figures, her
mother's name, mobile number and email as emergency contact, DocuSign envelope IDs and audit
trails, and the names and work emails of her supervisors and the HR staff who processed her.

**The unredacted originals must never appear in a slide, a screenshot, a demo recording, a
published web artifact, a repo commit, or a prompt sent to a third-party API.** Presenting them
would expose a real person's private employment terms — including how little she was paid — to a
room of strangers and possibly the open internet. There is no version of the pitch that needs
this. `corpus.json` in this directory is the only version cleared for use.

Nothing in this directory contains the originals. The PDFs were read in place from Drive and
were deliberately **not** downloaded into this repository.

---

## Provenance

| Corpus ID | Source file (Drive) | What it actually is |
|---|---|---|
| `DOC-001` | `[REDACTED FILENAME].pdf` | EssilorLuxottica Asia Pacific Pte. Ltd. — **Legal Intern** offer letter, Singapore, 16 Apr 2026, signed via DocuSign. 21 numbered clauses. The most complete document in the set. |
| `DOC-002` | `Capgemini OfferLetter.pdf` | Capgemini Singapore Pte Ltd — Internship Agreement, 18 Jun 2025. 17 numbered clauses. Unsigned counterpart. |
| `DOC-003` | `[REDACTED FILENAME].pdf` | Singapore law firm internship offer letter, 4 Apr 2025. Sub-numbered clauses 1.1–7.7. Employer **pseudonymised** — see below. |
| `DOC-004` | `Internship Contract dt 1.12.2025 Signed.pdf` | Singapore law firm **law internship programme** confirmation letter, 1 Dec 2025, signed 4 Dec 2025. Employer is a small named Singapore law firm and has been **pseudonymised** here. A four-paragraph letter with no numbered clauses at all. |
| `DOC-005` | `IPL24_Master_Agreement.pdf` | See "The fifth document" below. |

All five files sit in one Drive folder owned by the individual. The corpus is a single person's
internship history across roughly two years: two multinationals and two small Singapore law firms.

---

## The fifth document

`IPL24_Master_Agreement.pdf` (5.4 MB) could not be text-extracted through the Google Drive
connector, which returned only its PDF title string, `Microsoft Word - IPL24 Master Agreement`.
Its contents and its status in the corpus are recorded in `corpus.json` under `DOC-005` along
with whatever was recoverable. **Do not assert anything about this document in the pitch beyond
what `corpus.json` records** — in particular, do not assume it is an employment document.

---

## What was redacted, and why

The redaction is not cosmetic. It is applied at the point the clause text enters `corpus.json`,
so the demo pipeline never sees the identifying values at all.

### Identity
- The individual's name, in all of the spelling variants that appear across the documents, is
  replaced throughout by the consistent pseudonym **`TAN Wei Ling`**, and by `[CANDIDATE]` inside
  clause text. One pseudonym across all documents, so the demo can still show "the same person's
  contracts" without showing the person.
- Her **NRIC/FIN number** (which appears on the face of two documents) → `[REDACTED-FIN]`.
- Her **personal and university email addresses** → `[REDACTED]`.
- Her **home address**, which appears in full in `DOC-004` → `[REDACTED-ADDRESS]`.
- Her **emergency contact** in `DOC-003` — her mother's name, relationship, mobile number and
  personal email — removed entirely. Not banded, not pseudonymised: **removed**. This is a third
  party who never consented to anything, and the field has no analytical value.

### The people around her
Named supervisors and HR staff are replaced by **role titles**, because the role is what the
clause depends on and the name is what creates the exposure:
- the named in-house Legal Counsel she reported to → `[SUPERVISOR ROLE: Legal Counsel]`
- the named Capgemini reporting manager → `[SUPERVISOR ROLE: Reporting Manager]`
- named HR business partners, HR coordinators, TA partners, recruiters, payroll admins and the
  signing Managing Director / Partner → `[HR REPRESENTATIVE]`, `[MANAGING DIRECTOR]`, `[PARTNER]`
- every `@essilor.com` / firm work email in the signature blocks and DocuSign certificate →
  removed.

### Signature and audit metadata
- **DocuSign envelope ID** `[REDACTED]` and the entire Certificate of Completion — signer IP
  addresses, view/sign timestamps, the electronic-record disclosure, and the six named carbon-copy
  recipients — are excluded from the corpus altogether. They are pure identifiers with zero
  regulatory-dependency value.

### Money
Exact figures are **banded, not deleted** — the demo needs to show that a stipend clause exists
and is a live PDPA/Employment Act dependency, but not what she personally was paid:
- `SGD 1500 / month` → `[BANDED: SGD 1,000–2,000] per month`
- `SGD 1,200 for 4 weeks` → `[BANDED: SGD 1,000–1,500] for the period`
- `SGD 800 / month` → `[BANDED: SGD 500–1,000] per month`
- `S$400 net` → `[BANDED: under SGD 500]`

Dates of engagement are likewise replaced with `[START DATE]` / `[END DATE]` inside clause text,
while the document-level date fields are retained — the demo needs to reason about which
regulatory regime was in force when each document was drafted, and that requires real dates.

### Employer names — the judgement call

The brief was: keep employer names where the retained clause text is boilerplate; pseudonymise
where in doubt, and say so. The call went differently for the two multinationals and the two
law firms, and the reason matters.

**Kept: EssilorLuxottica Asia Pacific Pte. Ltd. (`DOC-001`) and Capgemini Singapore Pte Ltd
(`DOC-002`).** Both documents are unmodified corporate template boilerplate of the kind any
Singapore employment practice would recognise. Nothing retained from them is specific to this
individual or unflattering to the employer; keeping the names makes the demo concrete and
verifiable to judges who will recognise the drafting style.

**Pseudonymised: the `DOC-003` and `DOC-004` employers → `Silverbirch LLC` and `Anson Chambers`.** Both are small named Singapore law firms, and the demo's whole
narrative is that these documents are *out of step with current regulation*. There is a real
difference between saying "this clause pattern is stale" and standing on a stage in Singapore
saying "**this named local law firm's** intern contract is non-compliant" — the second is a
reputational assertion about an identifiable firm, made in front of an audience of Singapore
lawyers, on the basis of one document we obtained second-hand. `DOC-004` compounds it: it is a
bespoke four-paragraph letter, not boilerplate, so the clause text cannot be defended as generic,
and the terms it does record (working hours, Saturday work, allowance level) are exactly the
sort of thing that reads as an accusation when attached to a name. Both firms are pseudonymised
and the pseudonyms are used consistently in `corpus.json`.

If the pitch needs to make the "small firms are worse off under regulatory change" point — and it
should, because it is the strongest structural point in the corpus — it can be made entirely
about *firm size and document maturity*, which is what actually drives the finding. The names add
nothing.

### What was deliberately kept verbatim

Clause language is preserved **word for word** wherever it is standard boilerplate, including the
drafting defects. `DOC-003` contains a clause misnumbered `4.85` where `4.8` was clearly intended;
that has been kept, flagged in a note, because a document that nobody has renumbered in years is
itself evidence of the maintenance problem the pitch is about. Typos in the source (`exigences`,
`You be based at`) are likewise preserved.

---

## Files in this directory

- `corpus.json` — the redacted, demo-safe corpus. Clause-level records with regulatory
  dependencies and confidence levels. **This is the only file cleared for use in the pitch.**
- `README.md` — this file.

## Provenance of the legal analysis

Every legal assertion in `corpus.json` carries either a source URL that was actually fetched, or
an explicit `UNVERIFIED` marker. Nothing was stated from memory. The `unverified_claims` block at
the end of `corpus.json` is the list of things we could not stand behind — read it before the
pitch, and do not let any of it reach a slide as a bare assertion.
