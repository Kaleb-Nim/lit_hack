import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinalDocumentView } from "@/components/review/final-document";
import { isDocId } from "@/lib/pdpa/data";
import { getDocument } from "@/lib/review/documents";

type Params = Promise<{ docId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { docId } = await params;
  const doc = isDocId(docId) ? getDocument(docId) : null;
  return { title: doc ? `${doc.fileName} — Full document · L.A.R.P` : "Document not found · L.A.R.P" };
}

export default async function FinalPage({ params }: { params: Params }) {
  const { docId } = await params;
  if (!isDocId(docId)) notFound();
  const doc = getDocument(docId);
  if (!doc) notFound();

  return <FinalDocumentView doc={doc} />;
}
