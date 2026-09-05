"use client";

import { CheckCircle2, Clock3, Pause, Play } from "lucide-react";

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

type Props = {
  elapsedSeconds: number;
  running: boolean;
  startedAt: Date | null;
  approvedAt: Date | null;
  accepted: number;
  skipped: number;
  manualEdits: number;
  totalSuggestions: number;
  onPause: () => void;
  onResume: () => void;
  onApprove: () => void;
};

export function ReviewSessionTimer(props: Props) {
  if (!props.startedAt) return null;
  const reviewed = props.accepted + props.skipped;
  const canApprove = props.totalSuggestions === 0 || reviewed >= props.totalSuggestions;
  return <aside className={`review-session-timer${props.approvedAt ? " approved" : ""}`} aria-live="polite">
    <div className="review-session-timer__head"><span><Clock3 size={15} />Review session</span><i className={props.running ? "running" : ""}>{props.approvedAt ? "Approved" : props.running ? "Recording" : "Paused"}</i></div>
    <strong className="review-session-timer__time">{formatTime(props.elapsedSeconds)}</strong>
    <div className="review-session-timer__stats"><span><b>{props.accepted}</b> AI accepted</span><span><b>{props.skipped}</b> skipped</span><span><b>{props.manualEdits}</b> manual edits</span></div>
    {props.totalSuggestions > 0 && <p>{reviewed} of {props.totalSuggestions} AI suggestions reviewed{canApprove ? "" : " · decide each suggestion before approval"}</p>}
    {props.approvedAt ? <div className="review-session-timer__summary"><CheckCircle2 size={15} /><span><strong>Review approved</strong>{props.approvedAt.toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" })}</span><button onClick={props.onResume}>Reopen</button></div> : <div className="review-session-timer__actions"><button onClick={props.running ? props.onPause : props.onResume}>{props.running ? <Pause size={13} /> : <Play size={13} />}{props.running ? "Pause" : "Resume"}</button><button className="approve" onClick={props.onApprove} disabled={!canApprove} title={canApprove ? "Approve this review" : "Review or skip every AI suggestion first"}><CheckCircle2 size={13} />Approve review</button></div>}
  </aside>;
}
