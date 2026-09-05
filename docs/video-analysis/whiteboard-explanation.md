# Whiteboard explanation — video analysis

**Source:** `IMG_9132.MOV` (1920x1080 HEVC, 230.85 s / 3m51s, handheld iPhone)
**Context:** SMU LIT 24-hour legaltech hackathon, Singapore, 2026-09-05. Problem statement: *Designing a Sustainable and Resilient LegalTech.*
**Method:** audio transcribed locally with `mlx-whisper` (`mlx-community/whisper-large-v3-turbo`, word timestamps) on Apple Silicon GPU; frames sampled every 5 s at native 1920 px; dense board regions cropped, upscaled, and read independently by four parallel vision subagents plus the orchestrator.

Everything below distinguishes **[stated]** (said aloud or legibly written) from **[inferred]** and **[unclear]**. Illegible handwriting is marked, not guessed.

---

## 1. What they are building

A large law firm keeps every client's documents in one **localised, on-premises database** — deliberately not in the cloud, because client confidentiality is the binding constraint. A **locally-run AI** sits on top of that database. When a regulation changes, the AI sweeps every existing client file, finds the clauses that the change touches, and drafts the amended wording. Each proposed edit is shown to a lawyer as a **GitHub-style diff — accept or decline** — so a human validates every change before it lands. The worked example they use throughout is a hypothetical future Singapore generative-AI regulation that forces an amendment to AI clauses ("you must not use personal data inside your Gen AI") across hundreds of existing client contracts. The stated future extension is to push those diffs straight into **Microsoft Word's suggestion mode** instead of a bespoke UI.

---

## 2. The whiteboard

Two horizontally-stacked whiteboards. The **lower board** carries the main architecture and is fully drawn before the recording starts. The **upper board** carries the change-propagation / diff flow plus scratch questions. Only one thing is drawn on camera during the video (see Stage 2).

### Stage 1 — the board as it stands at t = 0:00

#### Lower board, left third — scratch / research notes (not part of the pitched architecture)

Loose notes, visually separate from the diagram, no arrows connecting them to it.

```
Added                    ▭ EU
AI E/U                   │
                         ↓
Obsidian
map Knowledge   ▭
        ?
LLM wiki?  →  ≡ (three short wavy lines)

    (small node-and-edge graph doodle: circle — line — two small circles)
```

- `Added` / `AI E/U` — first word read as "Added" by the orchestrator, "AdHed" by an independent reader. **[unclear]**
- `AI E/U` and the `EU` label next to the upper box are most likely a reference to EU AI regulation, but **nothing in the audio mentions the EU** — this is **[inferred]** and weakly supported.
- `Obsidian`, `map Knowledge?`, `LLM wiki?` — tool/approach candidates. Never spoken about.
- The small graph doodle (nodes joined by edges) sits under these notes — plausibly a knowledge-graph sketch, **[inferred]**, never referenced aloud.

#### Lower board, centre — the firm → clients → database spine

```
⌀ Encryption          Firm
  Confid.             R&T  ────→  Gov't
                       │  ╲
                       ↓    ╲──→  Int'l
                  ( Famous   Big  ──→  ...
                                          }  Clients
                                             File.
  →  [ Gen AI ]                  Local
        │        ⌀ DATABASE ══════════════════╗
        │          Detcn.                     ║
        ↓        ) Cons[unclear]              ║
      Patterns                                ║
                                              ↓
              ────────────                   AI
                Updates
```

Item by item:

| Item | Reading | Notes |
|---|---|---|
| `⌀ Encryption` (double underlined) | **[stated on board]** | Preceded by a small drawn glyph (diamond/circle with a slash) used as a bullet in three places on this board. |
| `Confid.` | **[unclear]** — orchestrator read "Confid.", independent reader read "cowdit." | Almost certainly "Confidentiality", supported by the audio at 01:07–01:28. |
| `Firm` / `R&T` (underlined) | **[stated]** | `R&T` = **Rajah & Tann**, confirmed by the audio ("two of the lawyers are from Rajah & Tann"). One independent reader saw `R&I`. |
| Four client categories | `Famous`, `Big` (+ a short word under it, `[unclear]`, likely "comp"/"corp"), `Gov't`, `Int'l` | **[stated]** — the audio names them: "famous people, big companies, international corporations, as well as government authorities." |
| Large brace `}` grouping the four | **[stated on board]** | Collects the four categories into… |
| `Clients File.` | **[stated]** | One independent reader transcribed this as "Wiants / Fie."; the orchestrator's reading of "Clients File." is corroborated by the audio ("each client will have one open folder with the firm"). |
| `DATABASE` with `Local` written above it | **[stated]** | One independent reader transcribed the word as `DATASAFE`. The audio says "database" repeatedly and says it is "localised", so `DATABASE` + `Local` is the reading adopted here. A long connector line runs *through* this word (it is a line, not a strikethrough). |
| `Detcn.` / `Petcm.` | **[unclear]** — an abbreviation ending in a full stop | Candidates: "Detection", "Determination". Never spoken. |
| `Cons[…]` written over/under another word | **[unclear]** | Candidates seen by different readers: "Constrain", "Confidence", "Consequence". Two words appear overwritten on each other. Never spoken. |
| `[ Gen AI ]` — boxed and underlined, with an arrow entering from the left | **[stated]** | The worked example. Confirmed by audio at 01:37 and by a teammate asking "So this Gen AI is an example?" |
| `Patterns` (underlined, with a curved flourish) | **[stated on board]** | Sits below the Gen AI box. Never explained aloud. |
| `Updates` (with a strike/cross through the tail) and a horizontal rule above it | **[unclear]** whether the strike is a deletion or a flourish | Bottom-centre of the board. |
| `AI` (large block letters, lower right) | **[stated]** | One independent reader saw "ATJ". Corroborated by audio: "we will be running our own AI, locally, into the database." |

**Arrows in this cluster (as drawn):**

- `R&T` → down → `Famous` / `Big` (the client categories)
- `R&T` → right/diagonal → `Gov't`
- `R&T` → diagonal → `Int'l`
- `{Famous, Big, Gov't, Int'l}` → brace → `Clients File.`
- `Clients File.` → long diagonal arrow down-left → into the `DATABASE` / crossing point **[stated]**
- A long curved line runs from the `Famous/Big` area rightward past `Int'l` and then down-left back into the `DATABASE` band — the two long lines cross in an X near the right of the cluster
- Curved arrow from the crossing point → `AI`
- `→ [ Gen AI ]` — an arrow enters the Gen AI box from the left (source is off to the left, unlabelled)
- `[ Gen AI ]` → `Detcn.` / `Cons[…]` (a short `)` arrowhead points into those two lines)
- A vertical line runs down the right of the `Detcn.`/`Cons[…]` block, forming a box edge

#### Lower board, right — the human in the loop

```
End user
   ↓
lawyer ( overse[e] …
```

`lawyer ( oversee` — the text runs past the right edge of every frame captured; the closing of the parenthetical is never fully visible. **[stated, partially cut off]**

#### Upper board — regulation change → diff → lawyer

```
1. How to [illegible — faded]
2. How often do regulation change?
3.

25% Tech          → Regulations ────↗ ┐
30% Idea                                │
     Simulate?   github  Sugg           │        (AI) Ping ──→ lawyer
                  ┌───┬───┐             │            │
              →   │ ≡ │ = │  ▣ ▣   ──→  │            ↓
                  └───┴───┘             │      (into the diff)
   other workflow  ↖                    │
   ensure ok?      ▭   ↑                │
                       100+  ───────────┘
```

| Item | Reading | Notes |
|---|---|---|
| `1. How to …` | **[illegible]** — faded, only the opening survives | |
| `2. How often do regulation change?` | **[stated]** | |
| `3.` | **[stated]** — numbered but its content is the diagram itself, or was erased | |
| `25% Tech` / `30% Idea` | **[stated]** | Judging-rubric weights jotted down. Partially matches the known 30/25/25/20 split. |
| `→ Regulations` | **[stated]** | The input to the loop. |
| `Simulate?` | **[stated]** | Open question — probably "do we simulate a regulation change for the demo", **[inferred]**. |
| `github` `Sugg` | **[stated]** | "Sugg" = suggestions. Confirms the GitHub-diff metaphor spoken at 02:55. |
| Two side-by-side document panels, one with `≡` and one with `=` | **[stated on board]** | A before/after diff view. |
| Two small squares `▣ ▣` between the panels and the outgoing arrow | **[inferred]** accept / reject controls | Matches "accept the change or decline the change" (02:55). |
| `(AI) Ping` → `lawyer` | **[stated]** | AI circled; "Ping" is the notification. Arrow to `lawyer`. A separate `↓` runs from `(AI) Ping` down into the diff panels. |
| `other workflow / ensure ok?` | **[stated]** — an arrow points *from* the document panels *to* this note | Open question about downstream workflows. |
| A second, smaller document box below, with `↑` and `100+` | **[stated]** | `100+` = the number of affected files/clauses, **[inferred]** from context. |
| Large curved arrow from the diff cluster looping back up to `Regulations` | **[stated on board]** | Makes the whole thing a cycle. |
| `Software` with a boxed word beneath it and `↗` / `→` | **[unclear]** — boxed word read variously as "MOVE", "Innovate", "1 more" | Top-right of the upper board, unconnected to the flow. |

### Stage 2 — written on camera at roughly 03:25–03:45

`Word  suggestion` — written in large letters, underlined with a flourish, on the upper board to the right of the diff cluster. Added while the team discusses integrating the diff checker into Microsoft Word and using Word's native suggestion mode. **[stated]** — see `frames/06-top-board-word-suggestion-t0220.jpg`.

### Frames

| Frame | What it shows |
|---|---|
| [`frames/01-lower-board-full-t0020.jpg`](frames/01-lower-board-full-t0020.jpg) | The whole lower board, both boards in frame, ~t=20 s |
| [`frames/02-zoom-firm-clients-database.jpg`](frames/02-zoom-firm-clients-database.jpg) | 3x zoom: Encryption / Firm R&T / four client types / DATABASE / Gen AI / Patterns |
| [`frames/03-zoom-clients-file-ai-enduser.jpg`](frames/03-zoom-clients-file-ai-enduser.jpg) | 3x zoom: Clients File → AI, and End user → lawyer (oversee…) |
| [`frames/04-zoom-left-scratch-notes.jpg`](frames/04-zoom-left-scratch-notes.jpg) | 4x zoom: the left-hand scratch notes (Added AI E/U, Obsidian, LLM wiki?, graph doodle) |
| [`frames/05-zoom-top-board-diff-flow.jpg`](frames/05-zoom-top-board-diff-flow.jpg) | Upper board: Regulations → github Sugg diff → accept/reject → AI Ping → lawyer, plus `Word suggestion` |
| [`frames/06-top-board-word-suggestion-t0220.jpg`](frames/06-top-board-word-suggestion-t0220.jpg) | t≈3:40, after `Word suggestion` has been written |
| [`frames/07-zoom-genai-patterns.jpg`](frames/07-zoom-genai-patterns.jpg) | 6x zoom: the `[Gen AI]` box, `Patterns`, and the start of `DATABASE / Detcn.` |

---

## 3. Full transcript

Timestamps are `mm:ss.ss`. Only filler and one repeated false start have been trimmed; wording is otherwise verbatim. At least three voices are present — a main presenter plus two teammates who interject from about 02:32 onward. Speaker labels are **[inferred]** from turn-taking and are not certain.

```
[00:00.76 → 00:18.74]  So basically, let's just say that we are a law firm. We are a very big
                       law firm. And this is relevant to us because two of the lawyers are from
                       Rajah & Tann. They are at the top of Rajah & Tann. And another two of the
                       judges on the panel are also from MinLaw.

[00:18.74 → 00:41.98]  So, very used to dealing with very big law firms and legal staff. And in
                       such a firm, they deal with many, many big clients. And so the clients
                       that they tend to deal with are famous people, big companies,
                       international corporations, as well as government authorities. And each
                       of these clients...

[00:42.58 → 01:07.80]  (Why is it not — me, sorry?) There are many clients across these four
                       categories. And many of their cases are similar, which is what we want to
                       draw on here. And each client actually will have one open folder with the
                       firm itself. And every file in the folders for all the clients are going
                       to be inside our database.

[01:07.80 → 01:28.48]  So this database is going to be localised. It's going to be localised
                       because when dealing with proprietary information that law firms deal
                       with, clients' confidentiality is of utmost importance — which is why we
                       do not want any of these things to be exposed to cloud and cloud-based
                       services.

[01:29.34 → 01:35.54]  And we will be running our own AI. Locally. Locally, into the database.

[01:37.10 → 01:57.34]  So, like, for example, in the future there might actually be generative AI
                       regulations in Singapore. Currently we only have a guide. But in the
                       future, if AI takes off in another direction, the Singapore government
                       might want to actually tamp down on it by releasing a set of regulations.

[01:57.34 → 02:18.36]  And because generative AI is so pervasive in today's society, we believe
                       that such a set of regulations would actually touch across many different
                       other regulations in Singapore, which would then affect all of these
                       files in the database.

[02:19.44 → 02:32.72]  So what we want our AI to do is — whenever there is a regulation change,
                       we will go through all the existing...

[02:32.72 → 02:34.76]  (teammate) So this Gen AI is an example? — Okay.

[02:35.10 → 02:41.28]  So, the Gen AI case: you will require some clauses to be changed, right?
                       So for example, the clause is...

[02:43.76 → 02:55.62]  "You must not use personal data inside of your Gen AI." Then they will
                       amend the AI clauses that were existing in existing client files. And
                       then there will be...

[02:55.62 → 03:02.08]  (teammate) It's like a GitHub diff checker, right? To say: accept the change
                       or decline the change.

[03:02.18 → 03:06.48]  So these changes will be accepted by the lawyers. The lawyers will be the
                       ones accepting the change.

[03:06.68 → 03:14.44]  So the lawyers will validate — and it's a human-in-the-loop system, which
                       ensures that whatever is changed is correct.

[03:15.94 → 03:22.92]  So that's it. That's it. You can stop recording already.

[03:23.72 → 03:30.64]  This one is future plan. So, can we integrate this directly — this checker
                       — into Word itself?

[03:31.04 → 03:37.42]  Or actually, can this actually just edit the Word form? Actually it can,
                       right? Because Word itself has a suggestion mode.

[03:38.52 → 03:46.76]  (teammate) Yeah. — Can we just utilise suggestion mode? For all the
                       different Git diffs? — Yeah. — Okay.
```

Raw machine transcript and JSON with word timings are kept outside the repo, in the session scratchpad (`video/transcript.txt`, `video/transcript.json`).

---

## 4. System architecture as described

### Explicitly stated in the video

| Component | What was said |
|---|---|
| **Client folders** | Every client has "one open folder with the firm". Four client segments: famous individuals, big companies, international corporations, government authorities. |
| **Local database** | "Every file in the folders for all the clients are going to be inside our database." Explicitly **localised / on-premises**, explicitly **not cloud**, because "clients' confidentiality is of utmost importance" and they "do not want any of these things exposed to cloud and cloud-based services." |
| **Local AI** | "We will be running our own AI. Locally. Locally, into the database." No model, size, framework, or hardware named. |
| **Trigger** | "Whenever there is a regulation change." The board shows `→ Regulations` as the entry point and `Simulate?` as an open question. |
| **Impact sweep** | The AI goes "through all the existing [files]" and finds the clauses the change touches. Board shows `100+` next to the affected-document stack. |
| **Amendment generation** | "You will require some clauses to be changed… then they will amend the AI clauses that were existing in existing client files." |
| **Review UI** | "Like a GitHub diff checker… accept the change or decline the change." Board shows two side-by-side document panels plus accept/reject controls. |
| **Notification** | Board: `(AI) Ping → lawyer`. |
| **Human in the loop** | "These changes will be accepted by the lawyers… it's a human-in-the-loop system, which ensures that whatever is changed is correct." Board: `End user ↓ lawyer (oversee…)`. |
| **Future work** | Integrate the checker into Microsoft Word and drive it through Word's native suggestion / track-changes mode rather than a custom diff UI. Board (written on camera): `Word suggestion`. |

### On the board but never explained aloud

- `Encryption` / `Confid.` — presumably encryption at rest for the local store. **[inferred]**
- `Patterns` — under the Gen AI box. Possibly "many of their cases are similar, which is what we want to draw on here" (00:42) — i.e. reusing a pattern found in one client file across similar files. **[inferred, weak]**
- `Detcn.` and the overwritten `Cons[…]` word — **[unclear]**, no spoken referent.
- `Updates` — **[unclear]**.
- `other workflow / ensure ok?` — an open question about whether downstream workflows stay valid.
- `Obsidian`, `map Knowledge?`, `LLM wiki?`, the node-and-edge doodle, `Added AI E/U`, `EU` — earlier ideation, not part of the pitch.
- `Software` + a boxed word — **[unclear]**.

### Inferred but not stated (do not treat as decided)

- Retrieval mechanism for "which clauses are affected" — nothing was said about embeddings, keyword search, clause taxonomies, or a knowledge graph. The graph doodle on the left is the only hint and it was never discussed.
- Where regulation changes come from — no feed, no source, no parser was named.
- Storage engine, document format handling (the Word discussion implies `.docx`), versioning, or audit trail.
- Any evaluation of whether the AI missed an affected clause.

---

## 5. How it answers the problem statement

The brief demands three things. Scoring the video's content honestly:

**(1) Identify which of the firm's existing artefacts are affected — COVERED IN CONCEPT, MECHANISM UNSPECIFIED.**
The design is explicitly "whenever there is a regulation change, go through all the existing [files]" in the local database, with `100+` on the board indicating a many-documents sweep. How the AI decides that a given clause is in scope is never described.

**(2) Understand in what way they are affected — PARTIALLY COVERED.**
The only articulation of "in what way" is at the clause level: a new rule ("you must not use personal data inside your Gen AI") means the existing AI clauses must be amended. The presenter also asserts a second-order effect — a Gen-AI regulation "would touch across many different other regulations in Singapore" — but no mechanism for tracing that cross-regulation ripple appears on the board or in the audio. There is no impact classification (severity, obligation type, deadline, breach risk).

**(3) Propagate the necessary updates before harm — COVERED, FOR ONE ARTEFACT TYPE ONLY.**
Propagation is the strongest part: the AI drafts the amended clause, presents it as a diff, a lawyer accepts or declines, and the change lands in the client file. The future plan pushes this into Word's suggestion mode, which is a credible propagation surface for a law firm.

**Scope gap against the brief.** The problem statement lists checklists, workflows, playbooks, template clauses, client advisories, training materials, and automated compliance tools. The video only ever addresses **documents sitting in client folders** — i.e. template clauses and executed/draft client files. Playbooks, checklists, training materials, and automated compliance tools are not mentioned. The board note `other workflow / ensure ok?` is the only acknowledgement that something beyond the document might need re-validating, and it is written as an unanswered question.

**Tension with the brief.** The brief states "awareness is not the gap; horizon-scanning and alerting already exist." The board nonetheless includes `(AI) Ping → lawyer` (an alert) and the question `How often do regulation change?`. Their differentiator is not the ping — it is the diff-and-accept propagation into the corpus — but the pitch as recorded does not make that distinction explicitly, and a judge could read the ping as re-solving the part the brief says is already solved.

---

## 6. Open questions and gaps

**Must be decided before building**

1. **Where do regulation changes come from?** No source, feed, format, or ingestion path was named. The board's `Simulate?` suggests they may fake the change for the demo — which is fine for a hackathon but should be a deliberate, stated choice.
2. **How does the AI decide a clause is affected?** This is the technical core of the whole pitch and it is a blank on the board. Embeddings? Clause-type tagging? A regulation-to-clause map? Recall matters more than precision here (a missed clause is the harm the brief is about) and nothing was said about it.
3. **What does the AI actually run on?** "Our own AI, locally" — model, quantisation, hardware, and whether a local model is strong enough to draft defensible clause amendments were never discussed. The confidentiality argument is the reason for local inference, so this constraint is load-bearing.
4. **What are `Detcn.`, `Cons[…]`, `Patterns`, and `Updates`?** Four labels sit inside the core box on the board and none was explained. These may be the intended pipeline stages.
5. **Scope of an "update".** Do they touch executed contracts, drafts, the firm's template bank, or all three? Amending an executed contract is a legal act, not a text edit — the video does not distinguish these.
6. **What is `other workflow / ensure ok?`** Who re-validates downstream processes once a clause changes?
7. **Versioning, rollback, and audit trail.** A regulator or client will ask which version of a clause was in force when. Nothing on the board.
8. **The `100+` figure.** Whether that is a demo dataset size, an estimate of affected files, or a throughput target is not stated.
9. **`Encryption` / `Confid.`** — encryption at rest is written down but never specified.
10. **Word integration.** Editing `.docx` through Word's suggestion mode is a concrete, credible plan, but it was raised in the last 20 seconds and nothing about the mechanism (add-in? OOXML manipulation? Graph API?) was decided.

**Contradictions and divergences from the supplied problem-statement context**

- **No Singapore-specific regulatory vocabulary appears at all.** No gazette, subsidiary legislation, MAS, ACRA, PDPA, IRAS, circulars, notices, or practice directions — on the board or in the audio. The only regulatory instance is a *hypothetical future* Singapore generative-AI regulation, plus a passing "currently we only have a guide" (the specific guide is not named). If the prior expected Singapore legal vocabulary, the video does not deliver it.
- **The scope is narrower than the brief.** As covered in section 5: client documents only, not the broader tool/process/playbook surface the brief enumerates.
- **Alerting is in the design** despite the brief saying awareness is not the gap.
- **The EU appears on the board (`EU`, `AI E/U`) but never in the audio.** Cross-jurisdiction conflict — which the brief calls out explicitly — is not part of the spoken pitch.
- **Judging weights on the board (`25% Tech`, `30% Idea`) do not fully match** the 30/25/25/20 split in the supplied context. The board is a partial, possibly misremembered jotting.

---

## 7. Confidence notes

**Audio: high confidence.** The recording is clean, the speakers are close to the mic, and `whisper-large-v3-turbo` produced a coherent transcript with no dropouts. Two proper nouns were normalised by the model and are stated here in corrected form: "Raja and Tan" → **Rajah & Tann**, "Min Law" → **MinLaw**. Everything in sections 4 and 5 marked **[stated]** rests on the audio and is reliable. A handful of overlapping interjections between 02:32 and 03:46 make speaker attribution uncertain; the words themselves are clear.

**Board: mixed.** The handwriting is cursive, small, and shot at an oblique angle with ceiling glare. Words that also appear in the audio (database, Gen AI, clients, lawyer, AI, github) are high confidence because two independent channels agree. Words that appear only on the board are lower confidence.

**Where independent readings disagreed** (orchestrator vs. four parallel vision subagents reading the same upscaled crops):

| Board text | Orchestrator | Independent reader(s) | Adopted | Why |
|---|---|---|---|---|
| `R&T` | R&T | R&I | **R&T** | Audio names Rajah & Tann. |
| `Clients File.` | Clients File. | "Wiants / Fie." | **Clients File.** | Audio: "each client will have one open folder". |
| `DATABASE` | DATABASE | DATASAFE | **DATABASE** | Audio says "database" four times. Genuine ambiguity in the glyph; DATASAFE is not impossible. |
| `AI` (large, lower right) | AI | ATJ | **AI** | Audio: "we will be running our own AI". |
| `Confid.` | Confid. | "cowdit." / "condit." | **Confid.** *(low confidence)* | Audio: "clients' confidentiality is of utmost importance". |
| `[Gen AI]` box | Gen AI | "IdonA1" / "HanA1" | **Gen AI** | Audio and a teammate's question confirm Gen AI is the worked example. |
| `Detcn.` / `Petcm.` | Detcn. | Percm. / Peteun. | **[unclear]** | No audio corroboration. Do not guess. |
| `Cons[…]` overwritten word | Confidence / Constrain | "Const… ume/rue" | **[unclear]** | Two words overwritten. No audio corroboration. |
| Boxed word under `Software` | "MOVE" / "1 more" | not read | **[unclear]** | Candidates include Innovate/Innovation; none confirmed. |
| `Added` / `AI E/U` | Added | AdHed / "AI E/b" | **[unclear]** | Scratch note, no audio. |

**Reconstructed, not read.** The arrow topology in section 2 is assembled from several frames at different camera angles; individual arrowheads on the lower board are frequently occluded by the speaker's arm. The direction of the two long crossing lines around `DATABASE`/`AI` is the least certain part of the diagram — the connection `Clients File. → database → AI` is supported by the audio, but the exact drawn routing is partly reconstructed.

**Frame sampling.** 46 frames at 5-second intervals. Scene-change detection at threshold 0.25 produced no keyframes, consistent with the video being one continuous handheld shot — so nothing was drawn or erased outside the sampled interval other than `Word suggestion`, which was caught mid-writing.
