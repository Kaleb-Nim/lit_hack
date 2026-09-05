import { createHash, createHmac } from "node:crypto";

export type R2ObjectSummary = {
  key: string;
  size: number;
  lastModified: string;
  etag: string;
};

type R2Config = {
  endpoint: URL;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function getConfig(): R2Config {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET_NAME;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("R2_NOT_CONFIGURED");
  }

  return { endpoint: new URL(endpoint), bucket, accessKeyId, secretAccessKey };
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const hmac = (key: Buffer | string, value: string) => createHmac("sha256", key).update(value).digest();
const encodePath = (value: string) => value.split("/").map(encodeURIComponent).join("/");

async function signedR2Fetch(key = "", query = new URLSearchParams()) {
  const config = getConfig();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalUri = `/${encodeURIComponent(config.bucket)}${key ? `/${encodePath(key)}` : ""}`;
  const canonicalQuery = [...query.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join("&");
  const payloadHash = sha256("");
  const canonicalHeaders = `host:${config.endpoint.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["GET", canonicalUri, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, "auto");
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const url = new URL(canonicalUri, config.endpoint);
  url.search = canonicalQuery;

  return fetch(url, {
    headers: {
      Authorization: authorization,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    cache: "no-store",
  });
}

const decodeXml = (value: string) => value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const tag = (xml: string, name: string) => decodeXml(xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "");

export async function listR2Objects(prefix: string): Promise<R2ObjectSummary[]> {
  const objects: R2ObjectSummary[] = [];
  let continuationToken = "";

  do {
    const query = new URLSearchParams({ "list-type": "2", prefix, "max-keys": "1000" });
    if (continuationToken) query.set("continuation-token", continuationToken);
    const response = await signedR2Fetch("", query);
    if (!response.ok) throw new Error(`R2_LIST_FAILED:${response.status}:${await response.text()}`);
    const xml = await response.text();
    for (const match of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const body = match[1];
      objects.push({ key: tag(body, "Key"), size: Number(tag(body, "Size")), lastModified: tag(body, "LastModified"), etag: tag(body, "ETag").replaceAll('"', "") });
    }
    continuationToken = tag(xml, "NextContinuationToken");
  } while (continuationToken);

  return objects;
}

export async function getR2Object(key: string) {
  if (!key || key.includes("..") || key.startsWith("/")) throw new Error("INVALID_R2_KEY");
  return signedR2Fetch(key);
}
