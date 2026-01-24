'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { jobsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Clock, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobRunId = params?.jobRunId as string;
  const [logFilter, setLogFilter] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const { data: jobDetail, isLoading } = useQuery({
    queryKey: queryKeys.jobs.detail(jobRunId),
    queryFn: () => jobsRepository.getJobRunDetail(jobRunId),
    enabled: !!jobRunId && isAdmin,
  });

  const statusConfig = {
    RUNNING: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Running' },
    SUCCEEDED: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Succeeded' },
    FAILED: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Failed' },
    QUEUED: { icon: Clock, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Queued' },
  };

  const logLevelConfig = {
    INFO: { icon: Info, color: 'text-blue-600' },
    WARN: { icon: AlertCircle, color: 'text-yellow-600' },
    ERROR: { icon: XCircle, color: 'text-red-600' },
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center border-destructive bg-destructive/5">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            This page is only accessible to Administrators.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!jobDetail) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-destructive">Job not found</p>
        </Card>
      </div>
    );
  }

  const { job, logs } = jobDetail;
  const config = statusConfig[job.status];
  const StatusIcon = config.icon;

  const filteredLogs = logFilter
    ? logs.filter(log =>
        log.message.toLowerCase().includes(logFilter.toLowerCase()) ||
        log.level.toLowerCase().includes(logFilter.toLowerCase())
      )
    : logs;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/app/admin/jobs')}
          className="mb-4 -ml-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Button>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
          Job Details
        </h1>
        <p className="text-muted-foreground mt-1">
          Detailed information and logs for job run
        </p>
      </div>

      {/* Job Meta Card */}
      <Card className={`p-6 border ${config.color}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Job Information</h2>
            <Badge className={`${config.color} flex items-center gap-1`}>
              <StatusIcon className="h-4 w-4" />
              {config.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Job ID</p>
              <p className="text-sm font-mono">{job.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Job Type</p>
              <p className="text-sm font-mono">{job.jobType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Attempts</p>
              <p className="text-sm">{job.attempts}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Campaign ID</p>
              <p className="text-sm font-mono">{job.campaignId || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Week Start</p>
              <p className="text-sm">{job.weekStart || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Trace ID</p>
              <p className="text-sm font-mono text-xs">{job.traceId || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Started At</p>
              <p className="text-sm">
                {new Date(job.startedAt).toLocaleString('en-US')}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Finished At</p>
              <p className="text-sm">
                {job.finishedAt ? new Date(job.finishedAt).toLocaleString('en-US') : 'Running...'}
              </p>
            </div>
            {job.finishedAt && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="text-sm">
                  {Math.round(
                    (new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()) / 1000
                  )}s
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Error Card */}
      {job.errorMessage && (
        <Card className="p-6 border border-destructive/20 bg-destructive/5">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Error Message
            </h3>
            <p className="text-sm text-foreground font-mono">{job.errorMessage}</p>
          </div>
        </Card>
      )}

      {/* Logs Viewer */}
      <Card className="p-6 border border-border bg-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Execution Logs ({filteredLogs.length})
            </h3>
            <div className="w-64">
              <Input
                placeholder="Filter logs..."
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
              />
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No logs {logFilter && 'matching filter'}
            </p>
          ) : (
            <ScrollArea className="h-[500px] border border-border rounded-lg bg-background/50">
              <div className="p-4 space-y-2 font-mono text-xs">
                {filteredLogs.map((log, index) => {
                  const levelConfig = logLevelConfig[log.level];
                  const LevelIcon = levelConfig.icon;

                  return (
                    <div
                      key={index}
                      className="flex gap-3 py-2 px-2 hover:bg-muted/50 rounded"
                    >
                      <span className="text-muted-foreground whitespace-nowrap">
                        {new Date(log.at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <div className={`flex items-center gap-1 w-16 ${levelConfig.color}`}>
                        <LevelIcon className="h-3 w-3" />
                        <span>{log.level}</span>
                      </div>
                      <span className="text-foreground flex-1">{log.message}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    </div>
  );
}
