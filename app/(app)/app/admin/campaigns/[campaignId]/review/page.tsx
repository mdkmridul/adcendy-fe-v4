'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, Sparkles, Workflow } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useAdminCampaignReviewOverview } from '@/hooks/useAdminReview';
import { ApiError } from '@/shared/api/errors';
import { StrategyReviewWorkspace } from '@/shared/components/reviews/StrategyReviewWorkspace';
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

function getRecordString(record: unknown, key: string) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return null;
  }

  const value = (record as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export default function AdminCampaignReviewPage() {
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const { campaignQuery, reviewQuery, jobsQuery, aiCallsQuery, isLoading } =
    useAdminCampaignReviewOverview(campaignId);

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading campaign review overview...</div>;
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
                Only administrators can inspect campaign review operations here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading campaign review detail...</div>;
  }

  if (campaignQuery.error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-8 text-sm text-destructive">
            {campaignQuery.error instanceof Error ? campaignQuery.error.message : 'Failed to load campaign.'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const campaignDetail = campaignQuery.data;
  const campaign = campaignDetail?.campaign;
  const review = reviewQuery.data;
  const reviewMissing = reviewQuery.error instanceof ApiError && reviewQuery.error.status === 404;

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
            <span>Campaign Review</span>
          </div>
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">
            {campaign?.title ?? `Campaign ${campaignId}`}
          </h1>
          <p className="text-muted-foreground">
            Admin visibility for campaign review state, queue activity, and recent AI call traces.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            document.getElementById('section-review-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Jump to Section Workspace
        </Button>
      </div>

      {campaign && (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card id="section-review-workspace" className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Campaign status</p>
              <div className="mt-2">
                <ReviewStatusBadge
                  status={campaign.status}
                  label={formatCampaignStatus(campaign.status)}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Business type</p>
              <p className="mt-2 font-medium">
                {formatBusinessType(
                  typeof campaign.businessType === 'string' ? campaign.businessType : null,
                ) || 'Unknown'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Business model</p>
              <p className="mt-2 font-medium">
                {formatBusinessModel(getRecordString(campaign, 'businessModel')) || 'Unknown'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Market scope</p>
              <p className="mt-2 font-medium">
                {formatMarketScope(getRecordString(campaign, 'marketScope')) || 'Unknown'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Owner</p>
              <p className="mt-2 font-medium">{campaign.owner.email}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Updated</p>
              <p className="mt-2 font-medium">{formatDate(campaign.updatedAt)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Strategy Review State</CardTitle>
              <CardDescription>Uses `GET /v1/campaigns/:id/strategy-review` for review status and sections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewMissing ? (
                <p className="text-sm text-muted-foreground">No strategy review has been created for this campaign yet.</p>
              ) : reviewQuery.error ? (
                <p className="text-sm text-destructive">
                  {reviewQuery.error instanceof Error ? reviewQuery.error.message : 'Failed to load review.'}
                </p>
              ) : review ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Overall status</p>
                      <div className="mt-2">
                        <ReviewStatusBadge status={review.status} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Assigned reviewer</p>
                      <p className="mt-2 font-medium">
                        {review.assignedReviewer?.displayName ?? review.assignedReviewer?.email ?? 'Unassigned'}
                      </p>
                    </div>
                  </div>

                  {review.deliverables.length > 0 && (
                    <div className="grid gap-3 md:grid-cols-3">
                      {review.deliverables.map((deliverable) => (
                        <div key={deliverable.key} className="rounded-lg border border-border bg-background p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{deliverable.label}</p>
                            <ReviewStatusBadge status={deliverable.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sections</p>
                    <div className="mt-3 space-y-2">
                      {review.sections.map((section) => (
                        <div
                          key={section.callType}
                          className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-medium">{section.title ?? section.callType}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {section.callType}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <ReviewStatusBadge status={section.status} />
                            <ReviewStatusBadge status={section.decision} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Section Review Workspace</CardTitle>
              <CardDescription>
                Admin visibility into the same section-by-section review flow used by reviewers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StrategyReviewWorkspace campaignId={campaignId} />
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Latest Queue Activity
              </CardTitle>
              <CardDescription>Uses `GET /v1/admin/jobs/runs/by-entity` for campaign-specific runs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobsQuery.error ? (
                <p className="text-sm text-destructive">
                  {jobsQuery.error instanceof Error ? jobsQuery.error.message : 'Failed to load jobs.'}
                </p>
              ) : (jobsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent queue runs found for this campaign.</p>
              ) : (
                (jobsQuery.data ?? []).map((job) => (
                  <div key={job.id} className="rounded-lg border border-border bg-background p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{job.jobName}</p>
                        <p className="text-sm text-muted-foreground">{job.queueName}</p>
                      </div>
                      <ReviewStatusBadge status={job.status} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Updated {formatDate(job.updatedAt)}. Attempts {job.attemptsMade}. Logs {job.logsCount}.
                    </p>
                    {job.lastErrorMessage && (
                      <p className="mt-2 text-sm text-destructive">{job.lastErrorMessage}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recent AI Calls
            </CardTitle>
            <CardDescription>Uses `GET /v1/admin/ai/calls` when admin tooling is available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiCallsQuery.error ? (
              <p className="text-sm text-destructive">
                {aiCallsQuery.error instanceof Error ? aiCallsQuery.error.message : 'Failed to load AI calls.'}
              </p>
            ) : (aiCallsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent AI calls found for this campaign.</p>
            ) : (
              (aiCallsQuery.data ?? []).map((call) => (
                <div key={call.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{call.model}</p>
                      <p className="text-sm text-muted-foreground">
                        {call.provider ?? 'Provider unknown'} | {call.operation}
                      </p>
                    </div>
                    <ReviewStatusBadge status={call.status} />
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                    <p>Started {formatDate(call.startedAt)}</p>
                    <p>Tokens {call.totalTokens?.toLocaleString() ?? 'Unknown'}</p>
                    <p>Cost {call.cost != null ? `$${call.cost.toFixed(2)}` : 'Unknown'}</p>
                  </div>
                  {call.errorMessage && <p className="mt-2 text-sm text-destructive">{call.errorMessage}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
