'use client';

import { endOfDay, startOfDay, subDays } from 'date-fns';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Clock3, RefreshCcw, TriangleAlert } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { jobsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function buildWindow(days: number) {
  const now = new Date();
  return {
    from: startOfDay(subDays(now, days - 1)).toISOString(),
    to: endOfDay(now).toISOString(),
  };
}

export default function AdminJobsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [days, setDays] = useState(14);
  const [jobName, setJobName] = useState('');
  const [campaignId, setCampaignId] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const window = buildWindow(days);

  const statsQuery = useQuery({
    queryKey: queryKeys.jobs.stats(days),
    queryFn: () => jobsRepository.getJobStats(days),
    enabled: isAdmin,
  });

  const failuresQuery = useQuery({
    queryKey: queryKeys.jobs.failures(days),
    queryFn: () => jobsRepository.getJobFailureSummary(days),
    enabled: isAdmin,
  });

  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs.list({ days, jobName, campaignId }),
    queryFn: () =>
      jobsRepository.listJobRuns({
        jobName: jobName.trim() || undefined,
        campaignId: campaignId.trim() || undefined,
        from: window.from,
        to: window.to,
        limit: 25,
        page: 1,
      }),
    enabled: isAdmin,
  });

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading job operations...</div>;
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
                Only administrators can inspect background job activity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Job Operations</h1>
          <p className="text-muted-foreground">
            Monitor queue throughput, recent failures, and per-run execution details.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void Promise.all([statsQuery.refetch(), failuresQuery.refetch(), jobsQuery.refetch()]);
          }}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Uses `GET /v1/admin/jobs/runs`, `.../failures/summary`, and `.../stats`.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="job-window">Window</Label>
            <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
              <SelectTrigger id="job-window">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-name">Job name</Label>
            <Input
              id="job-name"
              value={jobName}
              onChange={(event) => setJobName(event.target.value)}
              placeholder="strategy.review.regeneration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-id">Campaign ID</Label>
            <Input
              id="campaign-id"
              value={campaignId}
              onChange={(event) => setCampaignId(event.target.value)}
              placeholder="Optional campaign id"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total runs</p>
            <p className="mt-2 text-3xl font-semibold">{statsQuery.data?.totalRuns ?? '-'}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Active</p>
            <p className="mt-2 text-3xl font-semibold">{statsQuery.data?.active ?? '-'}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Failed</p>
            <p className="mt-2 text-3xl font-semibold">{statsQuery.data?.failed ?? '-'}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Avg duration</p>
            <p className="mt-2 text-3xl font-semibold">
              {statsQuery.data ? `${Math.round(statsQuery.data.avgDurationMs / 1000)}s` : '-'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Success rate {statsQuery.data?.successRate ?? '-'}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Recent Job Runs</CardTitle>
            <CardDescription>Compact operational view of the latest admin-visible runs.</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading runs...</p>
            ) : jobsQuery.error ? (
              <p className="text-sm text-destructive">
                {jobsQuery.error instanceof Error ? jobsQuery.error.message : 'Failed to load runs.'}
              </p>
            ) : (jobsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No job runs found for this filter set.</p>
            ) : (
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Logs</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(jobsQuery.data ?? []).map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{job.jobName}</p>
                            <p className="text-xs text-muted-foreground">{job.queueName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ReviewStatusBadge status={job.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(job.updatedAt)}
                        </TableCell>
                        <TableCell>{job.attemptsMade}</TableCell>
                        <TableCell>{job.logsCount}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/jobs/${job.id}`)}>
                            View
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5" />
              Failure Summary
            </CardTitle>
            <CardDescription>Most common failure codes in the selected window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {failuresQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading summary...</p>
            ) : failuresQuery.error ? (
              <p className="text-sm text-destructive">
                {failuresQuery.error instanceof Error ? failuresQuery.error.message : 'Failed to load summary.'}
              </p>
            ) : (failuresQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No failures recorded for this window.</p>
            ) : (
              (failuresQuery.data ?? []).map((failure) => (
                <div key={`${failure.jobName}-${failure.errorCode}`} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{failure.jobName}</p>
                      <p className="text-sm text-muted-foreground">{failure.errorCode}</p>
                    </div>
                    <div className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
                      {failure.count}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                <span>Window: last {days} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
