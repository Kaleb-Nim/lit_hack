import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewWorkspace } from "@/components/review/review-workspace";
import { isDocId } from "@/lib/pdpa/data";
import { getDocument } from "@/lib/review/documents";

type Params = Promise<{ docId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { docId } = await params;
  const doc = isDocId(docId) ? getDocument(docId) : null;
  return { title: doc ? `${doc.fileName} — Clauses · L.A.R.P` : "Document not found · L.A.R.P" };
}

export default async function ReviewPage({ params }: { params: Params }) {
  const { docId } = await params;
  if (!isDocId(docId)) notFound();
  const doc = getDocument(docId);
  if (!doc) notFound();

  return <ReviewWorkspace doc={doc} />;
}
