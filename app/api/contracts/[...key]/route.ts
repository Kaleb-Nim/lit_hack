import { getR2Object } from "@/lib/r2";

export const dynamic = "force-dynamic";

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
    const fileName = keyParts.at(-1)?.replace(/["\r\n]/g, "") ?? "contract";
    headers.set("content-disposition", `inline; filename="${fileName}"`);
    headers.set("cache-control", "private, max-age=60");
    headers.set("x-content-type-options", "nosniff");
    return new Response(response.body, { headers });
  } catch {
    return new Response("Contract could not be loaded", { status: 502 });
  }
}
