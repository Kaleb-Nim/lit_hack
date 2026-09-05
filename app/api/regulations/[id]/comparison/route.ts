import {
  changedTextEvidence,
  pdpaComparisonDates,
  readPdpaComparison,
  readPdpaSourceSnapshot,
  verifiedPdpaComparison,
  writePdpaComparison,
  type PdpaComparison,
} from "@/lib/pdpa-comparison";

export const dynamic = "force-dynamic";

type OpenAIResponse = {
  status?: string;
  error?: { message?: string };
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string; refusal?: string }> }>;
};

async function sourceState() {
  const [before, current] = await Promise.all([
    readPdpaSourceSnapshot(pdpaComparisonDates.before),
    readPdpaSourceSnapshot(pdpaComparisonDates.current),
  ]);
  return { before, current };
}

function withSourceState(comparison: PdpaComparison, before: Awaited<ReturnType<typeof readPdpaSourceSnapshot>>, current: Awaited<ReturnType<typeof readPdpaSourceSnapshot>>) {
  return {
    ...comparison,
    sourceDocuments: comparison.sourceDocuments.map((document) => ({
      ...document,
      cached: document.effectiveDate === pdpaComparisonDates.before ? Boolean(before) : Boolean(current),
    })),
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "PDPA2012") return Response.json({ error: "Detailed comparison is currently available for PDPA2012." }, { status: 404 });
  const [{ before, current }, comparison] = await Promise.all([sourceState(), readPdpaComparison()]);
  return Response.json({ comparison: withSourceState(comparison, before, current), aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "PDPA2012") return Response.json({ error: "Detailed comparison is currently available for PDPA2012." }, { status: 404 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "Add OPENAI_API_KEY to .env.local to generate an AI comparison." }, { status: 503 });

  const { before, current } = await sourceState();
  const hasOfficialText = Boolean(before?.text && current?.text);
  const evidence = hasOfficialText
    ? changedTextEvidence(before!.text, current!.text)
    : {
        removed: "Official text snapshots have not been cached yet.",
        added: JSON.stringify(verifiedPdpaComparison.changes),
      };
  const allowedSources = [...new Set(verifiedPdpaComparison.changes.map((change) => change.sourceUrl))];
  const model = process.env.OPENAI_MODEL ?? "gpt-5-mini";
  const schema = {
    type: "object",
    properties: {
      headline: { type: "string" },
      executiveSummary: { type: "string" },
      changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            area: { type: "string" },
            before: { type: "string" },
            now: { type: "string" },
            effectiveDate: { type: "string" },
            significance: { type: "string" },
            sourceUrl: { type: "string" },
          },
          required: ["area", "before", "now", "effectiveDate", "significance", "sourceUrl"],
          additionalProperties: false,
        },
      },
      businessImpact: { type: "array", items: { type: "string" } },
      caveats: { type: "array", items: { type: "string" } },
    },
    required: ["headline", "executiveSummary", "changes", "businessImpact", "caveats"],
    additionalProperties: false,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: "You are a Singapore regulatory change analyst. Compare only the supplied PDPA evidence. Be precise, concise and neutral. Distinguish legal text from operational implications. Do not invent sections, dates, duties or URLs. This is a summary, not legal advice.",
          },
          {
            role: "user",
            content: `Compare the Personal Data Protection Act 2012 version effective ${pdpaComparisonDates.before} with the version effective ${pdpaComparisonDates.current}.\n\nSOURCE COVERAGE: ${hasOfficialText ? "Cached official SSO text from both dates" : "Verified amendment records; full SSO text snapshots are not cached yet"}\n\nTEXT PRESENT BEFORE BUT NOT CURRENT:\n${evidence.removed}\n\nTEXT PRESENT CURRENT BUT NOT BEFORE:\n${evidence.added}\n\nAllowed source URLs (use only these):\n${allowedSources.join("\n")}`,
          },
        ],
        max_output_tokens: 4000,
        text: { format: { type: "json_schema", name: "pdpa_comparison", strict: true, schema } },
      }),
    });
    const payload = await response.json() as OpenAIResponse;
    if (!response.ok) return Response.json({ error: payload.error?.message ?? "OpenAI could not generate the comparison." }, { status: 502 });
    const content = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text");
    if (!content?.text) {
      const refusal = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "refusal")?.refusal;
      return Response.json({ error: refusal ?? "OpenAI returned no comparison." }, { status: 502 });
    }
    const generated = JSON.parse(content.text) as Pick<PdpaComparison, "headline" | "executiveSummary" | "changes" | "businessImpact" | "caveats">;
    const safeSources = new Set(allowedSources);
    const comparison: PdpaComparison = {
      ...verifiedPdpaComparison,
      ...generated,
      headline: hasOfficialText ? generated.headline : "Verified PDPA amendment-record comparison: 2 January 2021 to 5 December 2025",
      changes: generated.changes.map((change) => ({ ...change, sourceUrl: safeSources.has(change.sourceUrl) ? change.sourceUrl : verifiedPdpaComparison.sourceDocuments[1].sourceUrl })),
      generatedAt: new Date().toISOString(),
      generatedBy: "openai",
      model,
      sourceCoverage: hasOfficialText ? "cached-official-text" : "verified-change-records",
    };
    try {
      await writePdpaComparison(comparison);
    } catch {
      // The generated result can still be returned when the configured R2 key is read-only.
    }
    return Response.json({ comparison: withSourceState(comparison, before, current), aiConfigured: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error && error.name === "AbortError" ? "OpenAI request timed out." : "OpenAI comparison failed." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
