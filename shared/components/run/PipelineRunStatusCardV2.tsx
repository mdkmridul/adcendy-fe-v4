'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PauseCircle,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ApiError } from '@/shared/api/errors';
import { getRunStateDescriptor } from '@/shared/run/run-state-v2';
import type { PipelineRunStatusResponseV2 } from '@/shared/types/runsV2';

interface PipelineRunStatusCardV2Props {
  run?: PipelineRunStatusResponseV2;
  isLoading: boolean;
  isFetching: boolean;
  isOnline: boolean;
  error: Error | null;
  isRetrying: boolean;
  onRetry: () => void;
  onRefresh: () => void;
}

const stateIcons = {
  QUEUED: Clock3,
  RUNNING: LoaderCircle,
  BLOCKED_AWAITING_REVIEW: PauseCircle,
  COMPLETED: CheckCircle2,
  FAILED: AlertCircle,
} as const;

export function PipelineRunStatusCardV2({
  run,
  isLoading,
  isFetching,
  isOnline,
  error,
  isRetrying,
  onRetry,
  onRefresh,
}: PipelineRunStatusCardV2Props) {
  if (isLoading && !run) {
    return (
      <Card className="p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading run status…
        </div>
      </Card>
    );
  }

  if (!run) {
    const message =
      error instanceof ApiError && error.status === 404
        ? 'This run was not found or is not available to your account.'
        : error?.message ?? 'Run status is currently unavailable.';
    return (
      <Card className="space-y-4 border-destructive/30 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
          <div>
            <h2 className="font-semibold">Unable to load run</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </Card>
    );
  }

  const state = getRunStateDescriptor(run.status);
  const StateIcon = stateIcons[run.status];
  const progressPercent = run.progress.percent;
  const errorMessage = run.error?.message;

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <StateIcon
            className={
              run.status === 'RUNNING'
                ? 'mt-0.5 h-6 w-6 animate-spin text-primary'
                : 'mt-0.5 h-6 w-6 text-primary'
            }
          />
          <div>
            <h2 className="text-lg font-semibold">{state.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {errorMessage ?? state.description}
            </p>
          </div>
        </div>
        <Badge variant={run.status === 'FAILED' ? 'destructive' : 'outline'}>
          {run.status.replaceAll('_', ' ')}
        </Badge>
      </div>

      {progressPercent !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {run.currentPhase ?? 'Preparing'}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
          {run.progress.totalUnits !== null && (
            <p className="text-xs text-muted-foreground">
              {run.progress.completedUnits} of {run.progress.totalUnits} units complete
            </p>
          )}
        </div>
      )}

      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <span>Run ID: {run.runId}</span>
        <span>Attempt: {run.attemptNumber}</span>
        {run.currentPhase && <span>Phase: {run.currentPhase}</span>}
        <span>Action: {run.requiredAction.replaceAll('_', ' ')}</span>
      </div>

      {!isOnline && (
        <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
          <WifiOff className="h-4 w-4" />
          Polling is paused while you are offline. It will resume automatically.
        </div>
      )}

      {error && run.shouldPoll && isOnline && (
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Status refresh was interrupted. The next attempt will use a safe backoff.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {run.capabilities.canRetry && (
          <Button onClick={onRetry} disabled={isRetrying}>
            <RefreshCw className={isRetrying ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
            {isRetrying ? 'Retrying…' : 'Retry from failed phase'}
          </Button>
        )}
        <Button variant="outline" onClick={onRefresh} disabled={isFetching}>
          <RefreshCw className={isFetching ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          Refresh status
        </Button>
      </div>
    </Card>
  );
}
