# Source: PDPC Guide on Data Protection Clauses (1 February 2021)

**Full title:** *Guide on Data Protection Clauses for Agreements Relating to the Processing of
Personal Data*
**Publisher:** Personal Data Protection Commission Singapore (IMDA designated as PDPC)
**Dated:** 1 February 2021 · **Copyright:** 2016, 2021 IMDA/PDPC · 9 pages
**Held:** locally at `~/Downloads/guide pdpa.pdf` — **deliberately not committed to this repo**,
see *Licensing* below.

This is the regulator's own set of **model data protection clauses** for service agreements
between a "Customer" (the organisation buying services) and a "Contractor" (the data
intermediary processing personal data on its behalf). It is the template Singapore firms copy
into vendor and outsourcing agreements.

---

## Why this document matters to the build

It is simultaneously **the standard we check clauses against** and **the single best worked
example of the problem statement.** The Guide is a compliance tool published by the regulator,
and it now contains references that no longer resolve. A contract drafted from it inherits them.

> *"…and suddenly the tool that was built to ensure compliance is itself a source of risk."*
> — the problem statement, describing this document exactly.

---

## Finding 1 — the Guide cites a revoked instrument

**On page 6**, the explanatory note to sample clause 2.3 (transfer of personal data outside
Singapore) directs the reader to:

> "Please refer to Part III of the **Personal Data Protection Regulations 2014** for the specific
> requirements that have been prescribed relating to the transfer of personal data outside of
> Singapore."

Those Regulations no longer exist. Verified verbatim from the primary source:

> **Revocation**
> **18.** The Personal Data Protection Regulations 2014 (G.N. No. S 362/2014) are revoked.
>
> — Personal Data Protection Regulations 2021, reg 18
> `https://sso.agc.gov.sg/SL/PDPA2012-S63-2021?ProvIds=P15-#pr18-` (fetched 5 Sep 2026)

The saving provision at reg 19 pins the changeover date: it preserves the old regulations 8, 9,
10 and 10A only for transfers made "before **1 February 2021**".

**The sharpest detail: that is the Guide's own cover date.** The Guide was published on 1
February 2021 pointing at an instrument revoked on 1 February 2021. The transfer requirements
now live in the 2021 Regulations, at reg 11 (legally enforceable obligations) and reg 12
(recognised certifications).

## Finding 2 — the Guide uses superseded Part numbering

**On page 2 (paragraph 3)** and again **on page 3 (paragraph 6)**, the Guide refers to:

> "the obligations set out in **Parts III to VI** of the PDPA"

The PDPA no longer has Parts III to VI. Verified against the current consolidated Act:

| Then | Now |
|---|---|
| Part III | Part 3 — General rules with respect to protection of and accountability for personal data |
| Part IV | Part 4 — Collection, use and disclosure of personal data |
| Part V | Part 5 — Access to and correction of personal data |
| Part VI | Part 6 — Care of personal data |

> **2020 REVISED EDITION.** This revised edition incorporates all amendments up to and including
> 1 December 2021 and **comes into operation on 31 December 2021**.
> — `https://sso.agc.gov.sg/Act/PDPA2012` (fetched 5 Sep 2026)

**Be honest about the direction of this one.** The Guide was *correct when published*. Roman
numerals were right on 1 February 2021. They became wrong on 31 December 2021, ten months later,
and the Guide was never re-issued. That is a better story than an error, not a worse one: it is a
document that was accurate on the day it shipped and silently decayed, which is precisely the
failure mode the problem statement describes.

The same page also confirms **ss 27–35 are all marked "(Repealed)"**, and Parts 7 and 8 now stand
empty with no heading. So a citation into those sections is a second, independent age-stamp.

## Finding 3 — the staleness is self-propagating

Sample clause 2.3 is the model transfer clause. Its own explanatory note points at the revoked
2014 Regulations. Every service agreement drafted from this Guide since 2021 inherits both the
clause and the stale cross-reference — and the two employment documents in our corpus that fail
reg 11 fail it in exactly the way the Guide's "comparable standard" language invites.

This closes the loop between the Guide and the corpus: **the same defect appears in the
regulator's template and in the contracts drawn from that lineage.** One edge, many documents,
no declared dependency anywhere.

---

## The sample clauses, as assertions to check against

The Guide's clause set maps cleanly onto testable obligations. These become assertion records in
the ledger, hand-authored, with the Guide as the drafting standard and the Act or Regulations as
the binding source.

| Guide clause | Subject | Binds to |
|---|---|---|
| 2.1 | Compliance with the PDPA at the Contractor's own cost | PDPA generally |
| 2.2 | Process, use and disclosure only for permitted purposes | s 4(2) data intermediary scope |
| **2.3** | **Transfer outside Singapore, with written undertaking or other legally enforceable obligation** | **s 26; PDP Regs 2021 reg 11–12** |
| 2.4.1 | Reasonable security arrangements, administrative, physical and technical | s 24 (Protection) |
| 2.4.2 | Named authorised personnel, need-to-know access | s 24 |
| 2.5 | Access to personal data on the Customer's written request | s 21 |
| 2.6 | Accuracy and correction | ss 22, 23 |
| 2.7.1 | No retention longer than necessary for the Agreement's purposes | s 25 (Retention) |
| 2.7.2 | Return or delete on request, with written confirmation | s 25 |
| **2.8** | **Contractor must immediately notify the Customer of any breach of cll 2.2–2.7** | **ss 26C, 26D** |
| 2.9 | Indemnity for the Contractor's breach or negligence causing Customer breach | s 4(3) |

**Clause 2.8 is the one to notice.** The Guide builds the escalation path our employment corpus
is missing. Guide paragraph 4 spells out the chain: the Contractor notifies the Customer without
undue delay, the Customer assesses, and if notifiable the Customer must tell the Commission "no
later than three calendar days after the Customer has made the assessment", and tell each
affected individual.

So the regulator's own model contract **creates the reporting duty that every confidentiality
clause in our corpus omits.** The pattern exists in the standard and is absent from the
documents. That is the working-practice finding, evidenced against the regulator's own text.

Two further points worth carrying into the pitch, both from Guide paragraph 3 and paragraph 5:

- A data intermediary processing under a **written** contract is exempt from most obligations
  **except protection (s 24) and retention (s 25)**. So "is there a written contract" is itself a
  precondition that changes which assertions apply — a genuine dependency, not a formality.
- Under **s 4(3)** the Customer is liable for the Contractor's acts and omissions. The Customer's
  compliance is therefore a function of clauses in someone else's contract, which is exactly why
  a firm needs to know which of its agreements carry which version of these clauses.

---

## Licensing — why the PDF is not in this repo

The Guide's own notice states that, **with the exception of the sample clauses**, the publication
"may not be reproduced, republished or transmitted in any form or by any means, in whole or in
part, without written permission by IMDA / PDPC."

This repository is public. Accordingly:

- the **PDF is not committed**;
- **sample clause text is reproduced freely**, which the notice expressly permits;
- **explanatory-note text is quoted only in short extracts**, for the purpose of criticism and
  review, with the source attributed;
- the Guide is cited by title and date so a reader can obtain it from the PDPC directly.

Do not add the PDF to the repo, and do not paste the explanatory notes wholesale into a slide.

---

## Verification status

| Claim | Status |
|---|---|
| PDP Regulations 2014 (S 362/2014) revoked by reg 18 of PDP Regs 2021 | **Verified**, quoted verbatim from SSO |
| PDP Regulations 2021 changeover date of 1 February 2021 | **Verified** via the reg 19 saving provision |
| PDPA Parts now Arabic; 2020 Revised Edition in operation 31 December 2021 | **Verified** from the consolidated Act on SSO |
| ss 27–35 repealed; Parts 7 and 8 now empty | **Verified** from the Act's contents |
| Transfer obligations now at reg 11–12 of the 2021 Regulations | **Verified** — reg 11 quoted in `../demo-corpus/corpus.json` |
| Guide page 6 cites the 2014 Regulations | **Verified** — read directly from the PDF |
| Guide pages 2 and 3 use "Parts III to VI" | **Verified** — read directly from the PDF |
| Whether PDPC has since re-issued the Guide | **UNVERIFIED** — check the PDPC site before saying on stage that it stands un-updated |

That last row matters. The pitch line is "the regulator's own guide still points at a revoked
instrument". Confirm the currently published version before asserting it, because if PDPC quietly
refreshed the PDF the claim collapses in Q&A.
