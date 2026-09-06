import { LarpHeader } from "@/components/larp-header";
import Link from "next/link";
import { LawChangeIntake } from "./law-change-intake";
import "./new-law.css";

export default function NewLawPage() {
  return (
    <div className="shell">
      <LarpHeader kicker="Regulatory intake" title="Research a law change" meta="Official-source screening" actions={<Link href="/" className="btn btn--outline-light">Back to cases</Link>} />
      <LawChangeIntake />
    </div>
  );
}
