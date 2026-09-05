"use client";

import { useState } from "react";
import { downloadDocx } from "@/lib/docx";
import type { DocModel } from "@/lib/docx-model";

interface Props {
  /** Ends with .docx; the extension is added if missing. */
  filename: string;
  /** Plain-data document model — built on the server and passed down, so this island stays tiny. */
  model: DocModel;
  label: string;
  className?: string;
}

/**
 * A button that builds a Word document from `model` and saves it as
 * `filename`. While the file is being built the button is disabled; when the
 * browser refuses the download an inline note appears instead of a silent
 * no-op.
 */
export function DownloadButton({ filename, model, label, className = "btn btn--gold-outline" }: Props) {
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);

  async function save() {
    setBusy(true);
    setBlocked(false);
    try {
      setBlocked(!(await downloadDocx(filename, model)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="dl">
      <button
        type="button"
        className={className}
        onClick={save}
        disabled={busy}
        aria-busy={busy}
        aria-describedby={blocked ? `${filename}-note` : undefined}
      >
        {busy ? "Preparing .docx…" : label}
      </button>
      {blocked && (
        <span id={`${filename}-note`} className="dl__note" role="alert">
          Download blocked by the browser
        </span>
      )}
    </span>
  );
}
