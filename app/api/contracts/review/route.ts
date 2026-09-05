import JSZip from "jszip";
import { getR2Object } from "@/lib/r2";
import { isRegulationId, regulationById } from "@/lib/regulatory-workspace";
import type { ContractParagraph, ContractReviewResult } from "@/lib/contract-review-model";

export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024;
const allowedDomains = ["sso.agc.gov.sg", "mom.gov.sg", "pdpc.gov.sg", "mddi.gov.sg", "parliament.gov.sg"];
const allowedHosts = new Set([...allowedDomains, ...allowedDomains.map((domain) => `www.${domain}`)]);

function isAllowedSource(value: string) {
  try { return allowedHosts.has(new URL(value).hostname.toLowerCase()); } catch { return false; }
}

function outputText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output as Array<{ content?: Array<{ type?: string; text?: string }> }>) {
    const text = item.content?.find((part) => part.type === "output_text")?.text;
    if (text) return text;
  }
  return "";
}

async function extractDocxParagraphs(bytes: Uint8Array): Promise<ContractParagraph[]> {
  const archive = await JSZip.loadAsync(bytes);
  const xml = await archive.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("The Word document has no readable document body.");
  const paragraphs = [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map((match, index) => ({
    index,
    text: [...match[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((part) => part[1]).join("").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'"),
  }));
  return paragraphs.filter((paragraph) => paragraph.text.trim()).slice(0, 1200);
}

const schema = {
  type: "object", additionalProperties: false,
  required: ["documentTitle", "documentType", "overallAssessment", "paragraphs", "suggestions", "sources", "caveats"],
  properties: {
    documentTitle: { type: "string" }, documentType: { type: "string" }, overallAssessment: { type: "string" },
    paragraphs: { type: "array", items: { type: "object", additionalProperties: false, required: ["index", "text"], properties: { index: { type: "integer" }, text: { type: "string" } } } },
    suggestions: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "paragraphIndex", "action", "clause", "originalText", "proposedText", "reason", "legalBasis", "sourceUrl", "confidence"], properties: {
      id: { type: "string" }, paragraphIndex: { type: "integer" }, action: { type: "string", enum: ["amend", "insert", "review"] }, clause: { type: "string" }, originalText: { type: "string" }, proposedText: { type: "string" }, reason: { type: "string" }, legalBasis: { type: "string" }, sourceUrl: { type: "string" }, confidence: { type: "string", enum: ["high", "medium", "low"] },
    } } },
    sources: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "url"], properties: { title: { type: "string" }, url: { type: "string" } } } },
    caveats: { type: "array", items: { type: "string" } },
  },
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith("replace_")) return Response.json({ error: "Add OPENAI_API_KEY to .env.local to review contracts." }, { status: 503 });
  const body = await request.json() as { key?: string; regulationId?: string };
  const prefix = process.env.R2_CONTRACT_PREFIX ?? "Contracts/";
  const key = String(body.key ?? "");
  if (!key.startsWith(prefix) || key.includes("..")) return Response.json({ error: "Invalid contract key." }, { status: 400 });
  if (!isRegulationId(body.regulationId)) return Response.json({ error: "Choose PDPA or Workplace Fairness Act." }, { status: 400 });
  const extension = key.split(".").pop()?.toLowerCase();
  if (extension !== "pdf" && extension !== "docx") return Response.json({ error: "AI review currently supports PDF and DOCX files." }, { status: 415 });

  try {
    const source = await getR2Object(key);
    if (!source.ok) return Response.json({ error: "The source contract could not be loaded from R2." }, { status: source.status });
    const bytes = new Uint8Array(await source.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) return Response.json({ error: "This contract is larger than the 20 MB review limit." }, { status: 413 });
    const regulation = regulationById(body.regulationId);
    const knownParagraphs = extension === "docx" ? await extractDocxParagraphs(bytes) : [];
    const annotatedText = knownParagraphs.map((paragraph) => `[PARAGRAPH ${paragraph.index}] ${paragraph.text}`).join("\n").slice(0, 180000);
    const content: Array<Record<string, string>> = [{ type: "input_text", text: `Review this contract against ${regulation.title}. The official source is ${regulation.sourceUrl}. ${regulation.summary}\n\nIdentify only material clauses affected by the verified legal position. Suggest complete replacement wording for amendments. For a missing clause, use action insert. For uncertainty, use action review. Do not invent obligations or commencement dates. Search official Singapore sources and distinguish current obligations from future readiness. ${extension === "docx" ? `Use the exact paragraph indexes below and preserve the original meaning where no change is needed:\n${annotatedText}` : "Extract the PDF into clean reading-order paragraphs with stable zero-based indexes, then map every suggestion to the closest paragraph."}` }];
    if (extension === "pdf") content.push({ type: "input_file", filename: key.split("/").at(-1) ?? "contract.pdf", file_data: `data:application/pdf;base64,${Buffer.from(bytes).toString("base64")}` });

    const aiResponse = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini", store: false,
      instructions: "You are a cautious Singapore contract-review assistant supporting a qualified lawyer. Produce drafting suggestions, not a final legal opinion. Use only official Singapore government sources.",
      input: [{ role: "user", content }], tools: [{ type: "web_search", filters: { allowed_domains: allowedDomains }, search_context_size: "high" }], tool_choice: "auto", max_tool_calls: 8, max_output_tokens: 16000,
      text: { format: { type: "json_schema", name: "contract_regulatory_review", strict: true, schema } },
    }) });
    const raw = await aiResponse.json() as Record<string, unknown>;
    if (!aiResponse.ok) throw new Error((raw.error as { message?: string } | undefined)?.message ?? `OpenAI returned ${aiResponse.status}`);
    const parsed = JSON.parse(outputText(raw)) as Omit<ContractReviewResult, "model">;
    const paragraphs = extension === "docx" ? knownParagraphs : parsed.paragraphs.map((paragraph, index) => ({ index, text: String(paragraph.text ?? "") })).filter((paragraph) => paragraph.text.trim()).slice(0, 1200);
    const validIndexes = new Set(paragraphs.map((paragraph) => paragraph.index));
    const suggestions = parsed.suggestions.slice(0, 20).map((item, index) => ({ ...item, id: item.id || `suggestion-${index}`, paragraphIndex: Number(item.paragraphIndex), sourceUrl: isAllowedSource(item.sourceUrl) ? item.sourceUrl : regulation.sourceUrl })).filter((item) => item.action !== "amend" || validIndexes.has(item.paragraphIndex));
    const result: ContractReviewResult = { ...parsed, paragraphs, suggestions, sources: parsed.sources.filter((source) => isAllowedSource(source.url)).slice(0, 12), caveats: parsed.caveats.slice(0, 10), model: process.env.OPENAI_MODEL ?? "gpt-5-mini" };
    return Response.json({ review: result });
  } catch (error) {
    console.error("Contract regulatory review failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "The contract review failed." }, { status: 502 });
  }
}
