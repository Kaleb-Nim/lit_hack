/**
 * Save a text file from the browser. Returns false (instead of throwing)
 * when the download cannot be started — sandboxed iframes, blocked object
 * URLs, or a non-browser environment — so callers can show an inline note.
 */
export function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8"): boolean {
  return downloadBlob(filename, new Blob([text], { type: mime }));
}

/** Save an already-built Blob (e.g. a .docx) under `filename`. Same contract as downloadText. */
export function downloadBlob(filename: string, blob: Blob): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  let url: string | null = null;
  try {
    url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch {
    return false;
  } finally {
    if (url) {
      const toRevoke = url;
      window.setTimeout(() => URL.revokeObjectURL(toRevoke), 1000);
    }
  }
}

/** Safe file stem: strips an extension and anything that is not [A-Za-z0-9_-]. */
export function fileStem(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/[^A-Za-z0-9_-]+/g, "_");
}
