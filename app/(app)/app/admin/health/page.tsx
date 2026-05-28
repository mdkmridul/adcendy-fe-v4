'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle, ChevronLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import {
  useOpsCampaignHealth,
  useOpsCostsSummary,
  useOpsReviewerOutcomes,
} from '@/hooks/useOpsV2';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import {
  formatCampaignOpsStatus,
  formatOpsDateTime,
  formatOpsStatus,
  formatOpsStep,
} from '@/shared/components/ops/opsUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;

function formatCost(value?: number | null) {
  if (typeof value !== 'number') {
    return 'Not available';
  }
  return `$${value.toFixed(2)}`;
}

export default function AdminCampaignHealthPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [onlyUnhealthy, setOnlyUnhealthy] = useState(true);
  const [limit, setLimit] = useState(20);

  const healthQuery = useOpsCampaignHealth({ onlyUnhealthy, limit }, isAdmin);
  const outcomesQuery = useOpsReviewerOutcomes(isAdmin);
  const costsQuery = useOpsCostsSummary(isAdmin);

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading campaign health dashboard...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                This dashboard is only available to administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = healthQuery.data ?? [];
  const stuckCount = items.filter((item) => (item.stuckState ?? '').toUpperCase() === 'YES').length;
  const errorCount = items.filter((item) => item.hasError).length;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Link href="/app/admin">
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Admin Ops
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Campaign Health Dashboard</h1>
          <p className="text-muted-foreground">
            Stuck/error diagnosis is sourced from telemetry health data, not inferred from campaign status alone.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Campaigns Loaded</p>
            <p className="mt-2 text-3xl font-semibold">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Stuck State</p>
            <p className="mt-2 text-3xl font-semibold">{stuckCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Has Error</p>
            <p className="mt-2 text-3xl font-semibold">{errorCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Telemetry Cost</p>
            <p className="mt-2 text-3xl font-semibold">{formatCost(costsQuery.data?.totalCost)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="space-y-1 p-4 text-sm text-muted-foreground">
            <p>
              Reviewer approvals: <span className="font-medium text-foreground">{outcomesQuery.data?.approvedCount ?? 'Not available'}</span>
            </p>
            <p>
              Revision requested: <span className="font-medium text-foreground">{outcomesQuery.data?.revisionRequestedCount ?? 'Not available'}</span>
            </p>
            <p>
              Pending: <span className="font-medium text-foreground">{outcomesQuery.data?.pendingCount ?? 'Not available'}</span>
            </p>
            <p>
              Median turnaround minutes:{' '}
              <span className="font-medium text-foreground">{outcomesQuery.data?.medianTurnaroundMinutes ?? 'Not available'}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="space-y-1 p-4 text-sm text-muted-foreground">
            <p>
              Total AI Calls: <span className="font-medium text-foreground">{costsQuery.data?.totalCalls ?? 'Not available'}</span>
            </p>
            <p>
              Total Tokens: <span className="font-medium text-foreground">{costsQuery.data?.totalTokens ?? 'Not available'}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <Switch id="unhealthy-only" checked={onlyUnhealthy} onCheckedChange={setOnlyUnhealthy} />
            <Label htmlFor="unhealthy-only">Only unhealthy</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="health-limit">Limit</Label>
            <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
              <SelectTrigger id="health-limit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={() => void healthQuery.refetch()} disabled={healthQuery.isFetching}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {healthQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">Loading campaign health...</CardContent>
        </Card>
      ) : healthQuery.error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-5 text-sm text-destructive">
            {healthQuery.error instanceof Error ? healthQuery.error.message : 'Failed to load campaign health.'}
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">
            No campaign health records matched the selected filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.campaignId} className="border-border bg-card">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">{item.campaignTitle}</p>
                    <p className="text-xs text-muted-foreground">Campaign ID: {item.campaignId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.pipelineRunId ? (
                      <Link href={`/app/admin/runs/${item.pipelineRunId}`}>
                        <Button size="sm">Open Run Telemetry</Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Run ID Missing
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ReviewStatusBadge
                    status={item.campaignStatus}
                    label={formatCampaignOpsStatus(item.campaignStatus)}
                  />
                  <ReviewStatusBadge status={item.latestRunStatus} label={`Run ${formatOpsStatus(item.latestRunStatus)}`} />
                  <ReviewStatusBadge
                    status={String(item.currentStep ?? 'UNKNOWN')}
                    label={formatOpsStep(item.currentStep)}
                  />
                  <ReviewStatusBadge status={item.currentPhase} label={`Phase ${formatOpsStatus(item.currentPhase)}`} />
                </div>

                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Stuck State: {formatOpsStatus(item.stuckState)}</p>
                  <p>Stuck Phase: {item.stuckPhaseName || 'Not available'}</p>
                  <p>Stuck Reason: {item.stuckReason || 'Not available'}</p>
                  <p>Stuck Since: {formatOpsDateTime(item.stuckSince)}</p>
                  <p>Error Source: {item.errorSource || 'Not available'}</p>
                  <p>Error At: {formatOpsDateTime(item.errorAt)}</p>
                </div>

                {item.errorMessage && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {item.errorMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
