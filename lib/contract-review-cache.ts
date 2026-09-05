import type { ContractReviewResult } from "@/lib/contract-review-model";

function cacheKey(contractKey: string, regulationId: string) {
  const value = `${regulationId}:${contractKey}`;
  return `/__pearson_review_cache__/${encodeURIComponent(value)}`;
}

export async function cacheContractReview(contractKey: string, regulationId: string, review: ContractReviewResult) {
  if (typeof window === "undefined" || !("caches" in window)) return;
  const cache = await window.caches.open("pearson-contract-reviews-v1");
  await cache.put(cacheKey(contractKey, regulationId), new Response(JSON.stringify({ cachedAt: new Date().toISOString(), review }), { headers: { "content-type": "application/json" } }));
}

export async function readCachedContractReview(contractKey: string, regulationId: string) {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  try {
    const cache = await window.caches.open("pearson-contract-reviews-v1");
    const response = await cache.match(cacheKey(contractKey, regulationId));
    if (!response) return null;
    const value = await response.json() as { review?: ContractReviewResult };
    return value.review ?? null;
  } catch {
    return null;
  }
}
