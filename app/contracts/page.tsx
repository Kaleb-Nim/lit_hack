import { ContractLibrary } from "./contract-library";
import { isRegulationId } from "@/lib/regulatory-workspace";
import "./contracts.css";

type SearchParams = Promise<{ regulation?: string | string[] }>;

export default async function ContractsPage({ searchParams }: { searchParams: SearchParams }) {
  const value = (await searchParams).regulation;
  const regulation = Array.isArray(value) ? value[0] : value;
  return <ContractLibrary initialRegulation={isRegulationId(regulation) ? regulation : "PDPA2012"} />;
}
