import { notFound } from "next/navigation";
import { ContractEditor } from "../contract-editor";
import { PdfContractWorkbench } from "../pdf-contract-workbench";
import { isRegulationId } from "@/lib/regulatory-workspace";
import "../contracts.css";

type Props = { params: Promise<{ key: string[] }>; searchParams: Promise<{ regulation?: string | string[] }> };

export default async function ContractEditorPage({ params, searchParams }: Props) {
  const key = (await params).key.map(decodeURIComponent).join("/");
  if (!key.startsWith("Contracts/") || key.includes("..") || !/\.(?:docx|pdf)$/i.test(key)) notFound();
  const value = (await searchParams).regulation;
  const regulation = Array.isArray(value) ? value[0] : value;
  const regulationId = isRegulationId(regulation) ? regulation : "PDPA2012";
  return key.toLowerCase().endsWith(".pdf") ? <PdfContractWorkbench contractKey={key} regulationId={regulationId} /> : <ContractEditor contractKey={key} regulationId={regulationId} />;
}
