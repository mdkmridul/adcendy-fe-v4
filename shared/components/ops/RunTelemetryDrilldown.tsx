'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import {
  useOpsRunAggregate,
  useOpsRunEvents,
  useOpsRunPhaseRollups,
} from '@/hooks/useOpsV2';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { formatOpsDateTime, formatOpsStatus } from './opsUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RunTelemetryDrilldownProps {
  runId: string;
  backHref: string;
  backLabel: string;
  heading: string;
  description: string;
  showAdminHealthLink?: boolean;
}

export function RunTelemetryDrilldown({
  runId,
  backHref,
  backLabel,
  heading,
  description,
  showAdminHealthLink = false,
}: RunTelemetryDrilldownProps) {
  const aggregateQuery = useOpsRunAggregate(runId, Boolean(runId));
  const eventsQuery = useOpsRunEvents(runId, Boolean(runId));
  const rollupsQuery = useOpsRunPhaseRollups(runId, Boolean(runId));

  const isLoading = aggregateQuery.isLoading || eventsQuery.isLoading || rollupsQuery.isLoading;
  const error = aggregateQuery.error || eventsQuery.error || rollupsQuery.error;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Link href={backHref}>
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">{heading}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-center gap-2 p-5">
          <Link href={`/app/reviewer/strategy-reviews?pipelineRunId=${encodeURIComponent(runId)}`}>
            <Button variant="outline" size="sm">
              Reviewer Tasks for Run
            </Button>
          </Link>
          <Link href={`/app/reviewer/section-reviews?pipelineRunId=${encodeURIComponent(runId)}`}>
            <Button variant="outline" size="sm">
              Section Reviews for Run
            </Button>
          </Link>
          {showAdminHealthLink && (
            <Link href="/app/admin/health">
              <Button variant="outline" size="sm">
                Back to Campaign Health
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">Loading run telemetry...</CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-5 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Failed to load run telemetry.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Run Aggregate</CardTitle>
              <CardDescription>runId: {runId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ReviewStatusBadge
                  status={aggregateQuery.data?.status}
                  label={formatOpsStatus(aggregateQuery.data?.status)}
                />
                <ReviewStatusBadge
                  status={aggregateQuery.data?.currentPhase}
                  label={`Phase ${formatOpsStatus(aggregateQuery.data?.currentPhase)}`}
                />
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                <p>Started: {formatOpsDateTime(aggregateQuery.data?.startedAt)}</p>
                <p>Completed: {formatOpsDateTime(aggregateQuery.data?.completedAt)}</p>
                <p>
                  Duration (ms):{' '}
                  {typeof aggregateQuery.data?.durationMs === 'number'
                    ? aggregateQuery.data.durationMs
                    : 'Not available'}
                </p>
                <p>Total Phases: {aggregateQuery.data?.totalPhases ?? 'Not available'}</p>
                <p>Completed Phases: {aggregateQuery.data?.completedPhases ?? 'Not available'}</p>
                <p>Failed Phases: {aggregateQuery.data?.failedPhases ?? 'Not available'}</p>
                <p>Blocked Phases: {aggregateQuery.data?.blockedPhases ?? 'Not available'}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Phase Rollups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(rollupsQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No phase rollups available.</p>
                ) : (
                  (rollupsQuery.data ?? []).map((phase) => (
                    <div key={`${phase.phaseName}-${phase.startedAt ?? ''}`} className="rounded-md border border-border bg-background p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{phase.phaseName}</p>
                        <ReviewStatusBadge status={phase.status} label={formatOpsStatus(phase.status)} />
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                        <p>Attempts: {phase.attempts ?? 'Not available'}</p>
                        <p>Started: {formatOpsDateTime(phase.startedAt)}</p>
                        <p>Completed: {formatOpsDateTime(phase.completedAt)}</p>
                        <p>Duration (ms): {phase.durationMs ?? 'Not available'}</p>
                        {phase.errorMessage && <p>Error: {phase.errorMessage}</p>}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(eventsQuery.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events available.</p>
                ) : (
                  (eventsQuery.data ?? []).map((event) => (
                    <div key={event.id} className="rounded-md border border-border bg-background p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <ReviewStatusBadge status={event.status} label={formatOpsStatus(event.status)} />
                        <ReviewStatusBadge status={event.eventType} label={formatOpsStatus(event.eventType)} />
                        <p className="text-xs text-muted-foreground">{formatOpsDateTime(event.createdAt)}</p>
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {event.phaseName ? `Phase: ${event.phaseName}` : 'Phase not available'}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{event.message || 'No message'}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
