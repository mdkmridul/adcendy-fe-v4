'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import {
  useAdminAiCalls,
  useAdminCampaignDetail,
  useRefreshAdminCampaignIntelligence,
} from '@/hooks/useAdminReview';
import { useToast } from '@/hooks/use-toast';
import { adminReviewRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatCampaignStatus,
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
} from '@/shared/types/campaign';

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
  }).format(new Date(value));
}

function formatNullable(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return 'Not available';
}

function getRecordString(record: unknown, key: string) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return null;
  }

  const value = (record as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export default function AdminCampaignDetailPage() {
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const campaignDetailQuery = useAdminCampaignDetail(campaignId, user?.role === 'ADMIN');
  const refreshMutation = useRefreshAdminCampaignIntelligence(campaignId);
  const jobsQuery = useQuery({
    queryKey: queryKeys.adminReview.jobsByEntity('CAMPAIGN', campaignId, 6),
    queryFn: () =>
      adminReviewRepository.listJobRunsByEntity({
        entityType: 'CAMPAIGN',
        entityId: campaignId,
        limit: 6,
      }),
    enabled: user?.role === 'ADMIN' && Boolean(campaignId),
  });
  const aiCallsQuery = useAdminAiCalls(
    {
      campaignId,
      entityType: 'CAMPAIGN',
      entityId: campaignId,
      limit: 6,
      page: 1,
    },
    user?.role === 'ADMIN' && Boolean(campaignId),
  );

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading campaign detail...</div>;
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
                Only administrators can inspect campaign administration detail.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const campaignDetail = campaignDetailQuery.data;
  const latestRunId = campaignDetail?.latestRun?.id ?? null;
  const reviewWorkspaceHref = latestRunId ? `/app/admin/runs/${latestRunId}` : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            <span>/</span>
            <Link href="/admin/campaigns" className="hover:text-foreground">
              Campaigns
            </Link>
            <span>/</span>
            <span>{campaignDetail?.campaign.title ?? campaignId}</span>
          </div>
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
            {campaignDetail?.campaign.title ?? `Campaign ${campaignId}`}
          </h1>
          <p className="text-muted-foreground">
            Admin detail backed by `GET /v1/admin/campaigns/:id` with run and telemetry visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await refreshMutation.mutateAsync(false);
                toast({
                  title: 'Intelligence refresh queued',
                  description: 'The campaign intelligence refresh request was sent successfully.',
                });
              } catch (error) {
                toast({
                  title: 'Refresh failed',
                  description: error instanceof Error ? error.message : 'Please try again.',
                  variant: 'destructive',
                });
              }
            }}
            disabled={refreshMutation.isPending}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {refreshMutation.isPending ? 'Queuing...' : 'Refresh Intelligence'}
          </Button>
          {latestRunId ? (
            <Link href={`/app/admin/runs/${latestRunId}`}>
              <Button>Open Run Workspace</Button>
            </Link>
          ) : (
            <Button disabled>No Run Workspace Yet</Button>
          )}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Button size="sm">Overview</Button>
          {reviewWorkspaceHref ? (
            <Link href={`${reviewWorkspaceHref}?tab=input-details`}>
              <Button size="sm" variant="outline">
                Input Details
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Input Details
            </Button>
          )}
          {reviewWorkspaceHref ? (
            <Link href={`${reviewWorkspaceHref}?tab=strategy`}>
              <Button size="sm" variant="outline">
                Strategy
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Strategy
            </Button>
          )}
        </CardContent>
      </Card>

      {campaignDetailQuery.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading campaign detail...</div>
      ) : campaignDetailQuery.error || !campaignDetail ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-8 text-sm text-destructive">
            {campaignDetailQuery.error instanceof Error ? campaignDetailQuery.error.message : 'Failed to load campaign detail.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Status</p>
                <div className="mt-2">
                  <ReviewStatusBadge
                    status={campaignDetail.campaign.status}
                    label={formatCampaignStatus(campaignDetail.campaign.status)}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Owner</p>
                <p className="mt-2 font-medium">{campaignDetail.campaign.owner.email}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Created</p>
                <p className="mt-2 font-medium">{formatDate(campaignDetail.campaign.createdAt)}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Updated</p>
                <p className="mt-2 font-medium">{formatDate(campaignDetail.campaign.updatedAt)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Campaign Detail</CardTitle>
                <CardDescription>Fields from the admin campaign detail response.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Business type</p>
                  <p className="mt-2 font-medium">
                    {formatNullable(formatBusinessType(getRecordString(campaignDetail.campaign, 'businessType')))}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Business model</p>
                  <p className="mt-2 font-medium">
                    {formatNullable(formatBusinessModel(getRecordString(campaignDetail.campaign, 'businessModel')))}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Market scope</p>
                  <p className="mt-2 font-medium">
                    {formatNullable(formatMarketScope(getRecordString(campaignDetail.campaign, 'marketScope')))}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Website</p>
                  <p className="mt-2 font-medium">{formatNullable(campaignDetail.campaign.websiteUrl)}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Description</p>
                  <p className="mt-2 text-sm text-foreground">{formatNullable(campaignDetail.campaign.description)}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Wizard status</p>
                  <p className="mt-2 font-medium">{campaignDetail.wizard?.status ?? 'No wizard state'}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Wizard step</p>
                  <p className="mt-2 font-medium">
                    {campaignDetail.wizard ? campaignDetail.wizard.lastCompletedStep : 'Not available'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Wizard version</p>
                  <p className="mt-2 font-medium">{campaignDetail.wizard?.version ?? 'Not available'}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Latest run</p>
                  <p className="mt-2 font-medium">{campaignDetail.latestRun?.status ?? 'No admin run returned'}</p>
                </div>
              </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Linked Queue Runs</CardTitle>
                  <CardDescription>Campaign-scoped results from `GET /v1/admin/jobs/runs/by-entity`.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jobsQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading queue runs...</p>
                  ) : jobsQuery.error ? (
                    <p className="text-sm text-destructive">
                      {jobsQuery.error instanceof Error ? jobsQuery.error.message : 'Failed to load queue runs.'}
                    </p>
                  ) : (jobsQuery.data ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No queue runs were returned for this campaign.</p>
                  ) : (
                    (jobsQuery.data ?? []).map((job) => (
                      <div key={job.id} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{job.jobName}</p>
                            <p className="text-sm text-muted-foreground">{job.queueName}</p>
                          </div>
                          <ReviewStatusBadge status={job.status} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Updated {formatDate(job.updatedAt)}. Attempts {job.attemptsMade}. Logs {job.logsCount}.
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Linked AI Calls</CardTitle>
                  <CardDescription>Recent traces from `GET /v1/admin/ai/calls` filtered to this campaign.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiCallsQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading AI calls...</p>
                  ) : aiCallsQuery.error ? (
                    <p className="text-sm text-destructive">
                      {aiCallsQuery.error instanceof Error ? aiCallsQuery.error.message : 'Failed to load AI calls.'}
                    </p>
                  ) : (aiCallsQuery.data ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent AI calls were returned for this campaign.</p>
                  ) : (
                    (aiCallsQuery.data ?? []).map((call) => (
                      <div key={call.id} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{call.model}</p>
                            <p className="text-sm text-muted-foreground">
                              {call.provider ?? 'Provider unknown'} | {call.operation}
                            </p>
                          </div>
                          <ReviewStatusBadge status={call.status} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Started {formatDate(call.startedAt)}. Tokens {call.totalTokens?.toLocaleString() ?? 'Unknown'}.
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Run Workspace</CardTitle>
                <CardDescription>
                  Strategy review inputs and sections are available from the v2 run workspace route.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestRunId ? (
                  <>
                    <p className="text-sm text-muted-foreground">Latest run id: {latestRunId}</p>
                    <Link href={`/app/admin/runs/${latestRunId}`}>
                      <Button className="w-full">Open Admin Run Workspace</Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No latest run is available for this campaign yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
