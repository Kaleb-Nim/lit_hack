import { CHIP, STATUS_LABEL, type Status } from "@/lib/review/state";

export function Chip({ status }: { status: Status }) {
  return (
    <span className="chip" style={CHIP[status]}>
      {STATUS_LABEL[status]}
    </span>
  );
}
