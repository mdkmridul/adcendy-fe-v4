'use client';

import { useEffect } from 'react';
import { reportError } from './error-reporting';

/** What a page shows when it throws: the error is reported, and the reader can retry. */
export function ErrorFallback({
  error,
  reset,
  boundary,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  boundary: string;
}) {
  useEffect(() => {
    reportError(error, { boundary, digest: error.digest });
  }, [error, boundary]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground" role="alert">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="font-space-grotesk text-2xl font-bold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          The error has been recorded. Try again, and if it keeps happening, reload the page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
