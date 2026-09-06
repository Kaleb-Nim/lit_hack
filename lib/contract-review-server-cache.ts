import { createHash } from "node:crypto";
import { getR2Object, putR2Json } from "@/lib/r2";
import type { ContractReviewResult } from "@/lib/contract-review-model";

// Cached reviews live under Regulations/ because that prefix is writable and,
// unlike Contracts/, is not scanned by the contract listing — a .json file
// dropped under Contracts/ would surface as a phantom contract.
const cachePrefix = "Regulations/review-cache/";

export type CachedContractReview = {
  contractKey: string;
  regulationId: string;
  /** R2 ETag of the source document. A replaced document invalidates the entry. */
  fingerprint: string;
  reviewedParagraphs: number;
  totalParagraphs: number;
  cachedAt: string;
  review: ContractReviewResult;
};

const cacheKeyFor = (contractKey: string, regulationId: string) =>
  `${cachePrefix}${regulationId}-${createHash("sha256").update(contractKey).digest("hex").slice(0, 32)}.json`;

export async function readCachedReview(contractKey: string, regulationId: string, fingerprint: string) {
  try {
    const response = await getR2Object(cacheKeyFor(contractKey, regulationId));
    if (!response.ok) return null;
    const value = await response.json() as Partial<CachedContractReview>;
    if (!value.review || value.fingerprint !== fingerprint) return null;
    return value as CachedContractReview;
  } catch {
    return null;
  }
}

export async function writeCachedReview(entry: Omit<CachedContractReview, "cachedAt">) {
  try {
    await putR2Json(cacheKeyFor(entry.contractKey, entry.regulationId), { ...entry, cachedAt: new Date().toISOString() });
    return true;
  } catch {
    // A cache write must never fail the review the user just waited for.
    return false;
  }
}
