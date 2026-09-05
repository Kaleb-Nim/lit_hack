import { notFound } from "next/navigation";
import { ContractEditor } from "../contract-editor";
import { isRegulationId } from "@/lib/regulatory-workspace";
import "../contracts.css";

type Props = { params: Promise<{ key: string[] }>; searchParams: Promise<{ regulation?: string | string[] }> };

export default async function ContractEditorPage({ params, searchParams }: Props) {
  const key = (await params).key.map(decodeURIComponent).join("/");
  if (!key.startsWith("Contracts/") || key.includes("..") || !key.toLowerCase().endsWith(".docx")) notFound();
  const value = (await searchParams).regulation;
  const regulation = Array.isArray(value) ? value[0] : value;
  return <ContractEditor contractKey={key} regulationId={isRegulationId(regulation) ? regulation : "PDPA2012"} />;
}
