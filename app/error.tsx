'use client';

import { ErrorFallback } from '@/shared/monitoring/ErrorFallback';

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorFallback error={error} reset={reset} boundary="route" />;
}
