'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Clock3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignLifecycle } from '@/hooks/useCampaignLifecycle';
import { cn } from '@/lib/utils';
import { intelligenceRepository, wizardRepository } from '@/shared/api/repositories';
import { canAccessCampaignFiles } from '@/shared/components/campaigns/campaign-ui';
import { SubmittedInputsSummary } from '@/shared/components/campaigns/SubmittedInputsSummary';
import { formatCampaignStatus } from '@/shared/types/campaign';
import { humanizeReviewValue } from '@/shared/types/reviews';

function extractSectionPreview(content: unknown) {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content.filter(Boolean).map((item) => String(item)).join(' ');
  }

  if (content && typeof content === 'object') {
    return Object.entries(content as Record<string, unknown>)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' | ');
  }

  return null;
}

export default function OverviewPage() {
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const { campaign, stage, strategyReview, isLoading } = useCampaignLifecycle(campaignId);

  const { data: preview } = useQuery({
    queryKey: ['campaign-overview-preview', campaignId],
    queryFn: async () => {
      try {
        return await wizardRepository.getPreview(campaignId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(campaignId) && stage === 'waiting',
  });

  const { data: intelligenceSnapshot } = useQuery({
    queryKey: ['campaign-overview-intelligence', campaignId],
    queryFn: async () => intelligenceRepository.getLatestSnapshot(campaignId),
    enabled: Boolean(campaignId) && stage === 'active',
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-40 animate-pulse rounded-lg bg-card" />
        <div className="h-56 animate-pulse rounded-lg bg-card" />
        <div className="h-56 animate-pulse rounded-lg bg-card" />
      </div>
    );
  }

  if (!campaign || !stage) {
    return null;
  }

  if (stage === 'draft') {
    return (
      <Card className="mx-auto max-w-3xl border-border bg-card">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Resume setup from the left navigation to continue building this campaign.
        </CardContent>
      </Card>
    );
  }

  if (stage === 'waiting') {
    const filesAvailable = canAccessCampaignFiles(campaign);
    const waitingStatusLabel = formatCampaignStatus(campaign.status) ?? 'Under Review';
    const waitingStatusDescription =
      campaign.status === 'SUBMITTED_FOR_REVIEW'
        ? 'Your setup has been submitted and strategy generation is currently running.'
        : campaign.status === 'FAILED'
          ? 'This campaign needs attention before it can move forward. Review the submitted inputs and supporting files.'
          : 'Your business context, offer, and audience inputs are currently under review. When strategy is available, this workspace will shift from review state to strategy workspace automatically.';

    const reviewSteps = [
      {
        title: 'Inputs submitted',
        description: 'Received',
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        state: 'complete' as const,
      },
      {
        title: 'Strategy in review',
        description: 'Current step',
        icon: <Clock3 className="h-4 w-4 text-amber-600" />,
        state: 'current' as const,
      },
      {
        title: 'Strategy available',
        description: 'Next',
        icon: <div className="h-4 w-4 rounded-full border border-border bg-muted" />,
        state: 'upcoming' as const,
      },
    ];

    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_320px]">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-space-grotesk text-lg">Current Status</CardTitle>
              <CardDescription>
                We have received your submission. Your strategy will appear here once it is ready.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">{waitingStatusLabel}</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {waitingStatusDescription}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {reviewSteps.map((item) => (
                  <div
                    key={item.title}
                    className={cn(
                      'rounded-2xl border p-4 transition-colors',
                      item.state === 'current'
                        ? 'border-amber-300 bg-gradient-to-br from-amber-50 via-background to-amber-100/70 shadow-[0_18px_45px_-30px_rgba(217,119,6,0.9)] ring-1 ring-amber-200/70'
                        : item.state === 'complete'
                          ? 'border-emerald-200/80 bg-emerald-50/40'
                          : 'border-border bg-background',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'rounded-full p-1.5',
                            item.state === 'current'
                              ? 'bg-amber-100'
                              : item.state === 'complete'
                                ? 'bg-emerald-100'
                                : 'bg-muted',
                          )}
                        >
                          {item.icon}
                        </div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                      </div>
                    </div>
                    {item.state === 'current' ? (
                      <span className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                        {item.description}
                      </span>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-space-grotesk text-lg">Actions</CardTitle>
              <CardDescription>
                {filesAvailable
                  ? 'Keep supporting files organized while this campaign remains in review.'
                  : 'Files stay locked until the review state clears.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filesAvailable ? (
                <Button asChild className="w-full justify-between">
                  <Link href={`/app/campaigns/${campaignId}/files`}>
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Open Files
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-800">
                  Supporting files will be available after strategy review is complete.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-space-grotesk text-lg">Submitted Inputs Summary</CardTitle>
            <CardDescription>
              A concise view of the most important details currently under review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmittedInputsSummary campaign={campaign} preview={preview} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestStructuredSections = strategyReview?.sections ?? [];
  const strategyUpdatedAt = strategyReview?.approvedAt ?? strategyReview?.updatedAt ?? null;
  const summarySection = latestStructuredSections.find((section) =>
    extractSectionPreview(section.content),
  );
  const strategySummary = summarySection ? extractSectionPreview(summarySection.content) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-space-grotesk text-lg">Strategy Summary</CardTitle>
            <CardDescription>
              This campaign has strategy available and is ready to be worked from the main workspace.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Latest structured strategy
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Updated{' '}
                  {strategyUpdatedAt
                    ? formatDistanceToNow(new Date(strategyUpdatedAt), { addSuffix: true })
                    : 'recently'}
                </p>
              </div>
              <Button asChild>
                <Link href={`/app/campaigns/${campaignId}/strategy`}>
                  Open Strategy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Executive snapshot</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {strategySummary || 'The latest strategy is ready. Open the Strategy section to review the full output.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-space-grotesk text-lg">Recent Activity</CardTitle>
            <CardDescription>Current signals and the most recent campaign outputs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">Latest strategy content</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Structured strategy sections were updated{' '}
                {strategyUpdatedAt
                  ? formatDistanceToNow(new Date(strategyUpdatedAt), { addSuffix: true })
                  : 'recently'}.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">Intelligence</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {intelligenceSnapshot
                  ? `Latest intelligence snapshot refreshed ${formatDistanceToNow(new Date(intelligenceSnapshot.updatedAt), { addSuffix: true })}.`
                  : 'No intelligence snapshot is available yet.'}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">Campaign activity</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Campaign details were updated {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true })}.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-space-grotesk text-lg">Next Actions</CardTitle>
            <CardDescription>Jump directly into the most relevant working areas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between">
              <Link href={`/app/campaigns/${campaignId}/strategy`}>
                Review strategy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={`/app/campaigns/${campaignId}/weekly`}>
                Open weekly recommendations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={`/app/campaigns/${campaignId}/intelligence`}>
                Check intelligence
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={`/app/campaigns/${campaignId}/files`}>
                Review files
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {latestStructuredSections.length ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-space-grotesk text-lg">Latest Strategy Sections</CardTitle>
            <CardDescription>
              Quick access to the latest strategic outputs already available in this campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {latestStructuredSections.slice(0, 6).map((section) => (
              <div
                key={section.callType}
                className="rounded-2xl border border-border bg-muted/20 p-4"
              >
                <p className="text-sm font-medium text-foreground">
                  {section.title || humanizeReviewValue(section.callType)}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {extractSectionPreview(section.content) || 'Open the strategy page to review this section.'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
