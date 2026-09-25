'use client';

import { ErrorFallback } from '@/shared/monitoring/ErrorFallback';

// Replaces the root layout when it fails, so it renders its own document.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <ErrorFallback error={error} reset={reset} boundary="root" />
      </body>
    </html>
  );
}
