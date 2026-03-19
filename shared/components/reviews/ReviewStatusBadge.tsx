'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { humanizeReviewValue } from '@/shared/types/reviews';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700',
  PENDING_REVIEW: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
  IN_REVIEW: 'border-blue-500/40 bg-blue-500/10 text-blue-700',
  CHANGES_REQUESTED: 'border-orange-500/40 bg-orange-500/10 text-orange-700',
  REQUEST_CHANGES: 'border-orange-500/40 bg-orange-500/10 text-orange-700',
  APPROVED: 'border-green-500/40 bg-green-500/10 text-green-700',
  PARTIALLY_APPROVED: 'border-lime-500/40 bg-lime-500/10 text-lime-700',
  READY: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
  QUEUED: 'border-sky-500/40 bg-sky-500/10 text-sky-700',
  RUNNING: 'border-sky-500/40 bg-sky-500/10 text-sky-700',
  ACTIVE: 'border-sky-500/40 bg-sky-500/10 text-sky-700',
  REGENERATING: 'border-sky-500/40 bg-sky-500/10 text-sky-700',
  FAILED: 'border-red-500/40 bg-red-500/10 text-red-700',
  REJECTED: 'border-red-500/40 bg-red-500/10 text-red-700',
  SUCCEEDED: 'border-green-500/40 bg-green-500/10 text-green-700',
  COMPLETED: 'border-green-500/40 bg-green-500/10 text-green-700',
};

export function ReviewStatusBadge({
  status,
  label,
  className,
}: {
  status?: string | null;
  label?: string | null;
  className?: string;
}) {
  const normalized = (status ?? 'UNKNOWN').toUpperCase();
  const resolvedLabel = label ?? (status ? humanizeReviewValue(status) : 'Unknown');

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', STATUS_STYLES[normalized] ?? 'border-border text-foreground', className)}
    >
      {resolvedLabel}
    </Badge>
  );
}
