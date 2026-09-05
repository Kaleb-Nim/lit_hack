"use client";

import { useState } from "react";
import { downloadText } from "@/lib/download";

interface Props {
  filename: string;
  /** The full file body — built on the server and passed down, so this island stays tiny. */
  text: string;
  label: string;
  className?: string;
  mime?: string;
}

/**
 * A button that saves `text` as `filename`. When the browser refuses the
 * download (sandboxed iframe, blocked object URLs) an inline note appears
 * next to the button instead of a silent no-op.
 */
export function DownloadButton({ filename, text, label, className = "btn btn--gold-outline", mime = "text/markdown;charset=utf-8" }: Props) {
  const [blocked, setBlocked] = useState(false);

  return (
    <span className="dl">
      <button
        type="button"
        className={className}
        onClick={() => setBlocked(!downloadText(filename, text, mime))}
        aria-describedby={blocked ? `${filename}-note` : undefined}
      >
        {label}
      </button>
      {blocked && (
        <span id={`${filename}-note`} className="dl__note" role="alert">
          Download blocked by the browser
        </span>
      )}
    </span>
  );
}
