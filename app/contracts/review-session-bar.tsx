"use client";

import { CheckCircle2, Clock3, Pause, Play } from "lucide-react";
import type { ReactNode } from "react";

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
  /** View-specific controls (reset edits, back to redline) shown before the timer buttons. */
  actions?: ReactNode;
};

/**
 * The review timer as a horizontal strip across the top of the
 * clause review, rather than the fixed right-hand rail. Same session state
 * and the same pause/resume/approve semantics as `ReviewSessionTimer`; it
 * only trades the stacked card layout for one that sits above the redline.
 */
export function ReviewSessionBar(props: Props) {
  const reviewed = props.accepted + props.skipped;
  const canApprove = Boolean(props.startedAt) && (props.totalSuggestions === 0 || reviewed >= props.totalSuggestions);
  const state = props.approvedAt ? "Approved" : !props.startedAt ? "Idle" : props.running ? "Recording" : "Paused";

  return <div className={`review-session-bar${props.approvedAt ? " approved" : ""}`} aria-live="polite">
    <span className="review-session-bar__label"><Clock3 size={14} />Time taken</span>
    <strong className="review-session-bar__time">{formatTime(props.elapsedSeconds)}</strong>
    <i className={props.running ? "running" : ""}>{state}</i>

    <div className="review-session-bar__stats">
      <span><b>{props.accepted}</b>AI accepted</span>
      <span><b>{props.skipped}</b>skipped</span>
      <span><b>{props.manualEdits}</b>manual edits</span>
    </div>

    {props.totalSuggestions > 0 && <span className="review-session-bar__progress">
      {reviewed} of {props.totalSuggestions} resolved
    </span>}

    <div className="review-session-bar__actions">
      {props.actions}
      {props.approvedAt
        ? <>
            <span className="review-session-bar__approved"><CheckCircle2 size={13} />Approved {props.approvedAt.toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" })}</span>
            <button onClick={props.onResume}>Reopen</button>
          </>
        : <>
            <button onClick={props.running ? props.onPause : props.onResume} disabled={!props.startedAt}>
              {props.running ? <Pause size={13} /> : <Play size={13} />}{props.running ? "Pause" : "Resume"}
            </button>
            <button className="approve" onClick={props.onApprove} disabled={!canApprove} title={canApprove ? "Approve this review" : "Review or skip every AI suggestion first"}>
              <CheckCircle2 size={13} />Approve review
            </button>
          </>}
    </div>
  </div>;
}
