"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { LarpHeader } from "@/components/larp-header";
import { REGULATION } from "@/lib/pdpa/data";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell">
      <LarpHeader kicker="Regulatory impact" title={REGULATION.client} meta={REGULATION.matter} />
      <main className="shell__main">
        <div className="status">
          <section className="card status__card" aria-labelledby="error-title">
            <div className="eyebrow">Something went wrong</div>
            <h1 id="error-title" className="status__title">
              This step could not be rendered
            </h1>
            <p className="status__body">
              Your clause decisions are kept for this browser session, so trying again is safe. If it keeps failing, go
              back to the summary and open the document from there.
            </p>
            {(error.message || error.digest) && (
              <pre className="status__detail">
                {error.message || "Unknown error"}
                {error.digest ? `\nDigest: ${error.digest}` : ""}
              </pre>
            )}
            <div className="status__actions">
              <button type="button" className="btn btn--gold" onClick={() => reset()}>
                Try again
              </button>
              <Link href="/" className="btn btn--ghost">
                ← Back to summary
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
