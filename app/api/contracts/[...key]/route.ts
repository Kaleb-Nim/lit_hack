import { getR2Object } from "@/lib/r2";

export const dynamic = "force-dynamic";

// Header values are byte strings, so a filename carrying anything outside
// Latin-1 makes Headers.set throw and the document fails to load at all —
// 23 of the stored precedents are named "... • lawnet.com_precedents.docx".
// RFC 6266: send a plain ASCII name for the header, and the real one as
// filename*, which is what browsers actually use when both are present.
function contentDisposition(fileName: string) {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "");
  const encoded = encodeURIComponent(fileName).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: keyParts } = await params;
  const key = keyParts.map(decodeURIComponent).join("/");
  const prefix = process.env.R2_CONTRACT_PREFIX ?? "Contracts/";
  if (!key.startsWith(prefix) || key.includes("..")) return new Response("Invalid contract key", { status: 400 });

  try {
    const response = await getR2Object(key);
    if (!response.ok || !response.body) return new Response("Contract not found", { status: response.status });
    const headers = new Headers();
    headers.set("content-type", response.headers.get("content-type") ?? "application/octet-stream");
    headers.set("content-disposition", contentDisposition(keyParts.at(-1) ?? "contract"));
    headers.set("cache-control", "private, max-age=60");
    headers.set("x-content-type-options", "nosniff");
    return new Response(response.body, { headers });
  } catch (error) {
    console.error("Contract download failed", key, error);
    return new Response("Contract could not be loaded", { status: 502 });
  }
}
