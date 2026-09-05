import { ChevronDown, ShieldAlert } from "lucide-react";

export function ReviewLimitations({ caveats }: { caveats: string[] }) {
  if (!caveats.length) return null;

  return <details className="review-limitations">
    <summary><ShieldAlert size={14} /><span><strong>Review scope & limitations</strong><small>Legal context and assumptions</small></span><ChevronDown size={14} /></summary>
    <div className="review-limitations__body">
      {caveats.map((caveat) => <p key={caveat}>{caveat}</p>)}
    </div>
  </details>;
}
