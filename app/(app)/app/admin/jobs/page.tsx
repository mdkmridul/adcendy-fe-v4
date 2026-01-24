'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { jobsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react';
import type { RunStatus } from '@/shared/types/common';
import type { JobType } from '@/shared/types/jobs';

export default function AdminJobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'ALL'>('ALL');
  const [jobTypeFilter, setJobTypeFilter] = useState<JobType | 'ALL'>('ALL');
  const [campaignIdFilter, setCampaignIdFilter] = useState('');

  // RBAC check
  const isAdmin = user?.role === 'ADMIN';

  const filters = {
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(jobTypeFilter !== 'ALL' && { jobType: jobTypeFilter }),
    ...(campaignIdFilter && { campaignId: campaignIdFilter }),
  };

  const { data: jobs, isLoading } = useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: () => jobsRepository.listJobRuns(filters),
    enabled: isAdmin,
  });

  const statusConfig = {
    RUNNING: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600', label: 'Running' },
    SUCCEEDED: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-600', label: 'Succeeded' },
    FAILED: { icon: XCircle, color: 'bg-red-500/10 text-red-600', label: 'Failed' },
    QUEUED: { icon: Clock, color: 'bg-blue-500/10 text-blue-600', label: 'Queued' },
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
          Job Manager
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage background jobs and processing tasks
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 border border-border bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as RunStatus | 'ALL')}
            >
              <SelectTrigger id="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="RUNNING">Running</SelectItem>
                <SelectItem value="SUCCEEDED">Succeeded</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="QUEUED">Queued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobtype-filter">Job Type</Label>
            <Select
              value={jobTypeFilter}
              onValueChange={(value) => setJobTypeFilter(value as JobType | 'ALL')}
            >
              <SelectTrigger id="jobtype-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="INTELLIGENCE_REFRESH">Intelligence Refresh</SelectItem>
                <SelectItem value="STRATEGY_GENERATION">Strategy Generation</SelectItem>
                <SelectItem value="WEEKLY_PROCESSING">Weekly Processing</SelectItem>
                <SelectItem value="TWEAK_GENERATION">Tweak Generation</SelectItem>
                <SelectItem value="BENCHMARK_UPDATE">Benchmark Update</SelectItem>
                <SelectItem value="EVALUATION_RUN">Evaluation Run</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-filter">Campaign ID</Label>
            <Input
              id="campaign-filter"
              placeholder="Filter by campaign..."
              value={campaignIdFilter}
              onChange={(e) => setCampaignIdFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Jobs Table */}
      <Card className="border border-border bg-card">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No jobs found matching filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Error</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const config = statusConfig[job.status];
                const StatusIcon = config.icon;

                return (
                  <TableRow key={job.id}>
                    <TableCell className="text-sm">
                      {new Date(job.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {job.jobType.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {job.campaignId ? (
                        <span className="font-mono text-xs">{job.campaignId}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{job.attempts}</TableCell>
                    <TableCell className="max-w-xs">
                      {job.errorMessage ? (
                        <span className="text-xs text-destructive truncate block">
                          {job.errorMessage.substring(0, 60)}
                          {job.errorMessage.length > 60 && '...'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/app/admin/jobs/${job.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Summary */}
      {jobs && jobs.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {jobs.length} job{jobs.length !== 1 && 's'}
        </div>
      )}
    </div>
  );
}
