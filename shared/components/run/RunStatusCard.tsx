'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader, Clock } from 'lucide-react';
import type { RunEntity, RunRetryResult } from '@/shared/run/types';
import { isTerminal } from '@/shared/run/guards';
import type { ApiError } from '@/shared/api/errors';
import { formatDistanceToNow } from 'date-fns';

interface RunStatusCardProps {
  title: string;
  description?: string;
  run?: RunEntity | null;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => Promise<RunRetryResult | void>;
  retryLabel?: string;
  showTimestamps?: boolean;
  compact?: boolean;
  isPolling?: boolean;
}

export function RunStatusCard({
  title,
  description,
  run,
  isLoading,
  error,
  onRetry,
  retryLabel = 'Retry',
  showTimestamps = false,
  compact = false,
  isPolling = false,
}: RunStatusCardProps) {
  const isApiError = error && 'kind' in error;
  const apiError = isApiError ? (error as ApiError) : null;

  const statusConfig = {
    QUEUED: {
      label: 'Queued',
      icon: Clock,
      color: 'bg-muted text-muted-foreground',
      badgeVariant: 'secondary' as const,
    },
    RUNNING: {
      label: 'Running',
      icon: Loader,
      color: 'bg-blue-500/10 text-blue-600',
      badgeVariant: 'default' as const,
    },
    SUCCEEDED: {
      label: 'Complete',
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-600',
      badgeVariant: 'default' as const,
    },
    FAILED: {
      label: 'Failed',
      icon: XCircle,
      color: 'bg-destructive/10 text-destructive',
      badgeVariant: 'destructive' as const,
    },
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border border-border">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  if (error && !run) {
    return (
      <Card className="p-6 bg-destructive/5 border border-destructive/20">
        <div className="space-y-3">
          <h3 className="font-semibold text-destructive">{title}</h3>
          <p className="text-sm text-destructive/80">
            {apiError?.message || 'Failed to fetch status'}
          </p>
          {apiError?.kind === 'RateLimit' && (
            <p className="text-xs text-destructive/60">
              You're doing that too fast. Please wait before trying again.
            </p>
          )}
          {apiError?.requestId && (
            <div className="text-xs bg-background/50 p-2 rounded font-mono text-muted-foreground">
              Request ID: {apiError.requestId}
            </div>
          )}
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (!run) {
    return null;
  }

  const statusInfo = statusConfig[run.status];
  const StatusIcon = statusInfo.icon;
  const isFailed = run.status === 'FAILED';
  const isRunning = run.status === 'RUNNING';

  return (
    <Card className={`border border-border bg-card ${compact ? 'p-4' : 'p-6'}`}>
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <h3 className={compact ? 'text-sm font-semibold' : 'font-semibold text-foreground'}>
              {title}
            </h3>
            {description && (
              <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                {description}
              </p>
            )}
          </div>
          <Badge variant={statusInfo.badgeVariant} className="shrink-0">
            <StatusIcon className={`w-3 h-3 mr-1 ${isRunning ? 'animate-spin' : ''}`} />
            {statusInfo.label}
          </Badge>
        </div>

        {showTimestamps && (run.createdAt || run.updatedAt) && (
          <div className={`text-muted-foreground space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {run.createdAt && (
              <div>Started {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}</div>
            )}
            {run.updatedAt && run.createdAt !== run.updatedAt && (
              <div>Updated {formatDistanceToNow(new Date(run.updatedAt), { addSuffix: true })}</div>
            )}
          </div>
        )}

        {isFailed && run.errorMessage && (
          <div className={`bg-destructive/5 rounded p-3 ${compact ? 'text-xs' : 'text-sm'}`}>
            <p className="text-destructive/80">{run.errorMessage}</p>
          </div>
        )}

        {(isFailed || apiError?.kind === 'RateLimit') && onRetry && (
          <Button size={compact ? 'sm' : 'default'} variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
