'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ChevronLeft, FileJson } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { jobsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [logFilter, setLogFilter] = useState('');
  const jobRunId = params?.jobRunId as string;
  const isAdmin = user?.role === 'ADMIN';

  const jobDetailQuery = useQuery({
    queryKey: queryKeys.jobs.detail(jobRunId),
    queryFn: () => jobsRepository.getJobRunDetail(jobRunId),
    enabled: Boolean(jobRunId) && isAdmin,
  });

  const filteredLogs = useMemo(() => {
    const logs = jobDetailQuery.data?.logs ?? [];
    const normalizedFilter = logFilter.trim().toLowerCase();

    if (!normalizedFilter) {
      return logs;
    }

    return logs.filter((log) =>
      [log.timestamp, log.level, log.message, JSON.stringify(log.raw)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedFilter),
    );
  }, [jobDetailQuery.data?.logs, logFilter]);

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading job detail...</div>;
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
                Only administrators can inspect job run details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (jobDetailQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading job detail...</div>;
  }

  if (jobDetailQuery.error || !jobDetailQuery.data) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-8 text-sm text-destructive">
            {jobDetailQuery.error instanceof Error ? jobDetailQuery.error.message : 'Failed to load job detail.'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const job = jobDetailQuery.data;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Button variant="ghost" className="-ml-3 w-fit" onClick={() => router.push('/admin/jobs')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="font-space-grotesk text-3xl font-bold text-foreground">{job.jobName}</h1>
            <p className="text-muted-foreground">Detailed execution view for job run `{job.id}`.</p>
          </div>
          <ReviewStatusBadge status={job.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Queue</p>
            <p className="mt-2 font-medium">{job.queueName}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Attempts</p>
            <p className="mt-2 font-medium">
              {job.attemptsMade}
              {job.maxAttempts ? ` / ${job.maxAttempts}` : ''}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Queued</p>
            <p className="mt-2 font-medium">
              {job.queueDurationMs != null ? `${Math.round(job.queueDurationMs / 1000)}s` : 'Unknown'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Run duration</p>
            <p className="mt-2 font-medium">
              {job.runDurationMs != null ? `${Math.round(job.runDurationMs / 1000)}s` : 'Running'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Run Metadata</CardTitle>
          <CardDescription>Server timestamps and final error information from `GET /v1/admin/jobs/runs/:jobRunId`.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Created</p>
            <p className="mt-2 font-medium">{formatDate(job.createdAt)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Updated</p>
            <p className="mt-2 font-medium">{formatDate(job.updatedAt)}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Last error code</p>
            <p className="mt-2 font-medium">{job.lastErrorCode ?? 'None'}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Last error message</p>
            <p className="mt-2 text-sm text-foreground">{job.lastErrorMessage ?? 'None'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Execution Logs</CardTitle>
              <CardDescription>
                {job.logPagination
                  ? `${job.logPagination.total} log entries returned by the backend`
                  : `${job.logs.length} log entries`}
              </CardDescription>
            </div>
            <Input
              value={logFilter}
              onChange={(event) => setLogFilter(event.target.value)}
              placeholder="Filter logs or raw payload"
              className="w-full lg:w-72"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No logs matched the current filter.</p>
          ) : (
            <ScrollArea className="h-[560px] rounded-lg border border-border bg-background">
              <div className="space-y-3 p-4">
                {filteredLogs.map((log, index) => (
                  <div key={`${log.timestamp ?? 'log'}-${index}`} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{log.message ?? 'Log entry'}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.level ?? 'UNKNOWN'} {log.timestamp ? `| ${formatDate(log.timestamp)}` : ''}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="w-fit" disabled>
                        <FileJson className="mr-2 h-4 w-4" />
                        Raw Event
                      </Button>
                    </div>
                    <pre className="mt-3 overflow-x-auto rounded-md bg-muted/50 p-3 text-xs text-foreground">
                      {JSON.stringify(log.raw, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
