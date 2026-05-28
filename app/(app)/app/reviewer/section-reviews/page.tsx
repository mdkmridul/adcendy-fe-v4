'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ChevronLeft, Inbox, RefreshCw } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOpsSectionReviews, useStartOpsSectionReview } from '@/hooks/useOpsV2';
import type { Role } from '@/features/auth/types';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import {
  getSectionReviewForbiddenMessage,
  inferSectionReviewForbiddenReason,
} from '@/shared/components/ops/reviewAccess';
import {
  formatCampaignOpsStatus,
  formatOpsDateTime,
  formatOpsStatus,
  formatOpsStep,
} from '@/shared/components/ops/opsUtils';
import type { OpsListFilters, SectionReviewItem } from '@/shared/types/opsV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;
const OPEN_DETAIL_BUTTON_CLASS =
  'bg-sky-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-md';
const RUN_CONTEXT_BUTTON_CLASS =
  'bg-emerald-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md';

function SectionReviewRow({ review, role }: { review: SectionReviewItem; role: Extract<Role, 'REVIEWER' | 'ADMIN'> }) {
  const router = useRouter();
  const { toast } = useToast();
  const startReviewMutation = useStartOpsSectionReview(review.pipelineRunId ?? null);

  const workspacePath =
    review.pipelineRunId
      ? role === 'ADMIN'
        ? `/app/admin/runs/${review.pipelineRunId}`
        : `/app/reviewer/runs/${review.pipelineRunId}`
      : null;

  const openWorkspace = async () => {
    if (!review.pipelineRunId || !workspacePath) {
      toast({
        title: 'Run ID missing',
        description: 'This section review task does not include a pipeline run id.',
        variant: 'destructive',
      });
      return;
    }

    if (role === 'ADMIN') {
      router.push(workspacePath);
      return;
    }

    try {
      await startReviewMutation.mutateAsync();
      toast({
        title: 'Review started',
        description: 'Workspace is now unlocked for this run.',
      });
      router.push(workspacePath);
    } catch (error) {
      const reason = inferSectionReviewForbiddenReason(error);
      if (reason) {
        const message = getSectionReviewForbiddenMessage(role, reason);
        toast({
          title: message.title,
          description: message.description,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Unable to start review',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            {role === 'ADMIN' ? (
              <Link
                href={`/app/reviewer/section-reviews/${review.id}`}
                className="text-base font-semibold text-foreground underline-offset-4 hover:underline"
              >
                {review.sectionTitle || review.sectionId || `Section Task ${review.id}`}
              </Link>
            ) : (
              <p className="text-base font-semibold text-foreground">
                {review.sectionTitle || review.sectionId || `Section Task ${review.id}`}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Task ID: {review.id}
              {review.pipelineRunId ? ` | Run: ${review.pipelineRunId}` : ''}
              {review.campaignId ? ` | Campaign: ${review.campaignId}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {role === 'REVIEWER' ? (
              <Button
                size="sm"
                className={RUN_CONTEXT_BUTTON_CLASS}
                onClick={() => void openWorkspace()}
                disabled={startReviewMutation.isPending || !review.pipelineRunId}
              >
                {startReviewMutation.isPending ? 'Starting...' : 'Review'}
              </Button>
            ) : (
              <Button
                size="sm"
                className={RUN_CONTEXT_BUTTON_CLASS}
                onClick={() => void openWorkspace()}
                disabled={!review.pipelineRunId}
              >
                Open Workspace
              </Button>
            )}
            {role === 'ADMIN' && (
              <Link href={`/app/reviewer/section-reviews/${review.id}`}>
                <Button size="sm" className={OPEN_DETAIL_BUTTON_CLASS}>Open Detail</Button>
              </Link>
            )}
            {workspacePath && (
              <Link href={workspacePath}>
                <Button size="sm" variant="outline">
                  Run Context
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ReviewStatusBadge status={review.status} label={formatOpsStatus(review.status)} />
          <ReviewStatusBadge status={review.runStatus} label={`Run ${formatOpsStatus(review.runStatus)}`} />
          <ReviewStatusBadge
            status={review.campaignStatus}
            label={formatCampaignOpsStatus(review.campaignStatus)}
          />
          <ReviewStatusBadge
            status={String(review.currentStep ?? 'UNKNOWN')}
            label={formatOpsStep(review.currentStep)}
          />
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <p>Campaign: {review.campaignTitle || review.campaignId || 'Not available'}</p>
          <p>Revision Count: {typeof review.revisionCount === 'number' ? review.revisionCount : 0}</p>
          <p>Latest Revision Request: {review.latestRevisionSummary || 'None'}</p>
          <p>Updated: {formatOpsDateTime(review.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SectionReviewInboxPage() {
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isOpsRole = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

  const [status, setStatus] = useState(searchParams.get('status')?.toUpperCase() ?? 'ALL');
  const [pipelineRunId, setPipelineRunId] = useState(searchParams.get('pipelineRunId') ?? '');
  const [marketId, setMarketId] = useState(searchParams.get('marketId') ?? '');
  const [limit, setLimit] = useState<number>(() => {
    const raw = Number(searchParams.get('limit'));
    return Number.isFinite(raw) && raw > 0 ? raw : 20;
  });

  const filters = useMemo<OpsListFilters>(
    () => ({
      status: status === 'ALL' ? undefined : status,
      pipelineRunId: pipelineRunId.trim() || undefined,
      marketId: marketId.trim() || undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      limit,
    }),
    [limit, marketId, pipelineRunId, status],
  );

  const sectionReviewsQuery = useOpsSectionReviews(filters, isOpsRole);

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading section review inbox...</div>;
  }

  if (!isOpsRole) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Permission denied</p>
              <p className="text-sm text-muted-foreground">
                This workspace is available to reviewer and admin users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Link href="/app/reviewer/strategy-reviews">
          <Button variant="ghost" className="-ml-3 w-fit">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Unified Inbox
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Section Review Inbox</h1>
          <p className="text-muted-foreground">
            Global inbox of section approval tasks across pipeline runs.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="section-status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger id="section-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REVISION_REQUESTED">Revision Requested</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-run">Pipeline Run</Label>
            <Input
              id="section-run"
              value={pipelineRunId}
              onChange={(event) => setPipelineRunId(event.target.value)}
              placeholder="run id"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-market">Market</Label>
            <Input
              id="section-market"
              value={marketId}
              onChange={(event) => setMarketId(event.target.value)}
              placeholder="market id"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-limit">Page Size</Label>
            <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
              <SelectTrigger id="section-limit">
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
            <Button
              variant="outline"
              onClick={() => void sectionReviewsQuery.refetch()}
              disabled={sectionReviewsQuery.isFetching}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {sectionReviewsQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Loading section review tasks...
          </CardContent>
        </Card>
      ) : sectionReviewsQuery.error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-5 text-sm text-destructive">
            {sectionReviewsQuery.error instanceof Error
              ? sectionReviewsQuery.error.message
              : 'Failed to load section review inbox.'}
          </CardContent>
        </Card>
      ) : (sectionReviewsQuery.data ?? []).length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-10">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No section review tasks in this filter</EmptyTitle>
                <EmptyDescription>
                  Section approvals and revision requests will appear here when available.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(sectionReviewsQuery.data ?? []).map((review) => (
            <SectionReviewRow
              key={review.id}
              review={review}
              role={isAdmin ? 'ADMIN' : 'REVIEWER'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
