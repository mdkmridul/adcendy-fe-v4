'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Clock3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignLifecycle } from '@/hooks/useCampaignLifecycle';
import { intelligenceRepository, wizardRepository } from '@/shared/api/repositories';
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
    const waitingStatusLabel = formatCampaignStatus(campaign.status) ?? 'Under Review';
    const waitingStatusDescription =
      campaign.status === 'SUBMITTED_FOR_REVIEW'
        ? 'Your setup has been submitted and strategy generation is currently running.'
        : campaign.status === 'FAILED'
          ? 'This campaign needs attention before it can move forward. Review the submitted inputs and supporting files.'
          : 'Your business context, offer, and audience inputs are currently under review. When strategy is available, this workspace will shift from review state to strategy workspace automatically.';

    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_320px]">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
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
                {[
                  {
                    title: 'Inputs submitted',
                    description: 'Received',
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
                  },
                  {
                    title: 'Strategy in review',
                    description: 'Current step',
                    icon: <Clock3 className="h-4 w-4 text-amber-600" />,
                  },
                  {
                    title: 'Strategy available',
                    description: 'Next',
                    icon: <div className="h-4 w-4 rounded-full border border-border bg-muted" />,
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
              <CardDescription>Keep supporting files organized while this campaign remains in review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-between">
                <Link href={`/app/campaigns/${campaignId}/files`}>
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Open Files
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Submitted Inputs Summary</CardTitle>
              <CardDescription>
                A concise view of the most important details currently under review.
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href={`/app/campaigns/${campaignId}/inputs`}>
                View full inputs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
          <CardTitle className="text-lg">Strategy Summary</CardTitle>
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
            <CardTitle className="text-lg">Recent Activity</CardTitle>
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
            <CardTitle className="text-lg">Next Actions</CardTitle>
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
            <CardTitle className="text-lg">Latest Strategy Sections</CardTitle>
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
