'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  FileStack,
  FolderKanban,
  Sparkles,
  TriangleAlert,
  UserPlus2,
  Workflow,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useAdminCampaigns, useReviewerAccounts } from '@/hooks/useAdminReview';
import { aiUsageRepository, jobsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { formatCampaignStatus } from '@/shared/types/campaign';

function formatCurrency(value?: number | null) {
  if (typeof value !== 'number') {
    return '-';
  }

  return `$${value.toFixed(2)}`;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const reviewersQuery = useReviewerAccounts();
  const campaignsQuery = useAdminCampaigns({ pageSize: 5 }, user?.role === 'ADMIN');
  const jobStatsQuery = useQuery({
    queryKey: queryKeys.jobs.stats(14),
    queryFn: () => jobsRepository.getJobStats(14),
    enabled: user?.role === 'ADMIN',
  });
  const failureSummaryQuery = useQuery({
    queryKey: queryKeys.jobs.failures(14),
    queryFn: () => jobsRepository.getJobFailureSummary(14),
    enabled: user?.role === 'ADMIN',
  });
  const aiUsageSummaryQuery = useQuery({
    queryKey: queryKeys.aiUsage.summary(14),
    queryFn: () => aiUsageRepository.getAiUsageSummary({ days: 14 }),
    enabled: user?.role === 'ADMIN',
  });
  const [campaignId, setCampaignId] = useState('');

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading admin workspace...</div>;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                This operational surface is only available to administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Admin Operations</h1>
        <p className="text-muted-foreground">
          Operational entry point for reviewer access, campaign oversight, jobs, AI usage, and review debugging.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Campaigns needing attention</p>
            <p className="mt-2 text-3xl font-semibold">
              {campaignsQuery.data?.length ?? '-'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Most recent admin-visible campaigns</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Failed jobs</p>
            <p className="mt-2 text-3xl font-semibold">{jobStatsQuery.data?.failed ?? '-'}</p>
            <p className="mt-1 text-xs text-muted-foreground">Last 14 days</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">AI calls</p>
            <p className="mt-2 text-3xl font-semibold">{aiUsageSummaryQuery.data?.totalCalls ?? '-'}</p>
            <p className="mt-1 text-xs text-muted-foreground">Last 14 days</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">AI spend</p>
            <p className="mt-2 text-3xl font-semibold">
              {formatCurrency(aiUsageSummaryQuery.data?.totalCost)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Summary window: 14 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderKanban className="h-5 w-5" />
              Campaign Ops
            </CardTitle>
            <CardDescription>Inspect admin campaign detail and review state.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/campaigns">
              <Button variant="outline" className="w-full justify-between">
                Open Campaigns
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus2 className="h-5 w-5" />
              Reviewer Accounts
            </CardTitle>
            <CardDescription>Create and manage privileged reviewer access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold">{reviewersQuery.data?.length ?? 0}</p>
            <Link href="/admin/reviewers">
              <Button className="w-full justify-between">
                Open Reviewer Management
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Workflow className="h-5 w-5" />
              Job Tooling
            </CardTitle>
            <CardDescription>Inspect queue activity and background processing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/jobs">
              <Button variant="outline" className="w-full justify-between">
                Open Jobs Manager
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileStack className="h-5 w-5" />
              AI Telemetry
            </CardTitle>
            <CardDescription>Review recent call volume and cost analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/ai">
              <Button variant="outline" className="w-full justify-between">
                Open AI Monitoring
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Open admin campaign detail or jump directly into section review visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaignsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading campaigns...</p>
            ) : campaignsQuery.error ? (
              <p className="text-sm text-destructive">
                {campaignsQuery.error instanceof Error ? campaignsQuery.error.message : 'Failed to load campaigns.'}
              </p>
            ) : (campaignsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No campaigns were returned by the admin API.</p>
            ) : (
              (campaignsQuery.data ?? []).map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-sm text-muted-foreground">{campaign.ownerEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(campaign.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReviewStatusBadge
                      status={campaign.status}
                      label={formatCampaignStatus(campaign.status)}
                    />
                    <Link href={`/admin/campaigns/${campaign.id}`}>
                      <Button variant="ghost" size="sm">
                        Detail
                      </Button>
                    </Link>
                    <Link href={`/admin/campaigns/${campaign.id}/review`}>
                      <Button variant="ghost" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TriangleAlert className="h-5 w-5" />
                Recent Failed Jobs
              </CardTitle>
              <CardDescription>Top failure signatures from `GET /v1/admin/jobs/failures/summary`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {failureSummaryQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading failures...</p>
              ) : failureSummaryQuery.error ? (
                <p className="text-sm text-destructive">
                  {failureSummaryQuery.error instanceof Error ? failureSummaryQuery.error.message : 'Failed to load failures.'}
                </p>
              ) : (failureSummaryQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No failures recorded in the current window.</p>
              ) : (
                (failureSummaryQuery.data ?? []).slice(0, 3).map((failure) => (
                  <div key={`${failure.jobName}-${failure.errorCode}`} className="rounded-lg border border-border bg-background p-4">
                    <p className="font-medium">{failure.jobName}</p>
                    <p className="text-sm text-muted-foreground">{failure.errorCode}</p>
                    <p className="mt-2 text-sm">Count {failure.count}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Usage Summary
              </CardTitle>
              <CardDescription>Snapshot from `GET /v1/admin/ai/usage/summary`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Calls</span>
                <span className="font-medium">{aiUsageSummaryQuery.data?.totalCalls ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tokens</span>
                <span className="font-medium">
                  {typeof aiUsageSummaryQuery.data?.totalTokens === 'number'
                    ? aiUsageSummaryQuery.data.totalTokens.toLocaleString()
                    : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cost</span>
                <span className="font-medium">{formatCurrency(aiUsageSummaryQuery.data?.totalCost)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Inspect Campaign Review State</CardTitle>
              <CardDescription>
                Open the dedicated admin campaign review overview with metadata, review state, jobs, and AI calls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-id">Campaign ID</Label>
                <Input
                  id="campaign-id"
                  value={campaignId}
                  onChange={(event) => setCampaignId(event.target.value)}
                  placeholder="Enter campaign id"
                />
              </div>
              <Button
                onClick={() => router.push(`/admin/campaigns/${campaignId.trim()}/review`)}
                disabled={!campaignId.trim()}
              >
                Open Campaign Review Overview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
