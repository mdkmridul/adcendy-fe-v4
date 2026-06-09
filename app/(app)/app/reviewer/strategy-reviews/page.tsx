'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOpsReviewerTasks, useOpsSectionReviews, useStartOpsSectionReview } from '@/hooks/useOpsV2';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import type { Role } from '@/features/auth/types';
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
import type { OpsListFilters, ReviewerTaskItem, SectionReviewItem } from '@/shared/types/opsV2';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SortBy = 'updatedAt' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const STATUS_OPTIONS = [
  'ALL',
  'PENDING',
  'ANSWERED',
  'APPROVED',
  'REVISION_REQUESTED',
  'RUNNING',
  'FAILED',
] as const;

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;
const OPEN_DETAIL_BUTTON_CLASS =
  'bg-sky-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-md';
const RUN_CONTEXT_BUTTON_CLASS =
  'bg-emerald-600 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md';
const REVIEWER_TASK_CAMPAIGN_MAP_KEY = 'adcendy_reviewer_task_campaign_map_v1';
const OUTPUT_CONSTRAINT_MODE = 'output_constraint_violation';

type BlockedSectionPreview = {
  issueId?: string | null;
  sectionId?: string | null;
  sectionLabel?: string | null;
  marketId?: string | null;
  audienceId?: string | null;
  violationSummary?: string | null;
  offendingSnippet?: string | null;
  preferredWording?: string | null;
  question?: string | null;
};

type OutputConstraintTaskContext = {
  blockedSectionCount: number | null;
  sectionId: string | null;
  sectionLabel: string | null;
  blockedSections: BlockedSectionPreview[];
  hasExplicitBlockedSections: boolean;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is Record<string, unknown> => toRecord(entry) !== null);
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseBlockedSectionsCount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const intValue = Math.trunc(value);
    return intValue >= 0 ? intValue : null;
  }

  if (typeof value === 'string') {
    const intValue = Number.parseInt(value, 10);
    return Number.isFinite(intValue) && intValue >= 0 ? intValue : null;
  }

  return null;
}

function normalizeBlockedSection(item: Record<string, unknown>): BlockedSectionPreview {
  return {
    issueId: toNonEmptyString(item.issueId) ?? toNonEmptyString(item.issue_id),
    sectionId: toNonEmptyString(item.sectionId) ?? toNonEmptyString(item.section_id),
    sectionLabel: toNonEmptyString(item.sectionLabel) ?? toNonEmptyString(item.section_label),
    marketId: toNonEmptyString(item.marketId) ?? toNonEmptyString(item.market_id),
    audienceId: toNonEmptyString(item.audienceId) ?? toNonEmptyString(item.audience_id),
    violationSummary: toNonEmptyString(item.violationSummary) ?? toNonEmptyString(item.violation_summary),
    offendingSnippet: toNonEmptyString(item.offendingSnippet) ?? toNonEmptyString(item.offending_snippet),
    preferredWording: toNonEmptyString(item.preferredWording) ?? toNonEmptyString(item.preferred_wording),
    question: toNonEmptyString(item.question) ?? toNonEmptyString(item.questionText) ?? toNonEmptyString(item.question_text),
  };
}

function getOutputConstraintContext(task: ReviewerTaskItem): OutputConstraintTaskContext | null {
  if (task.failureMode !== OUTPUT_CONSTRAINT_MODE) {
    return null;
  }

  const questionContext = toRecord(toRecord(task.questionPayload)?.questionContext);
  const questionContextQuestions = Array.isArray(questionContext?.questions)
    ? questionContext.questions
        .map((entry) => {
          if (typeof entry === 'string') {
            return toNonEmptyString(entry);
          }

          const entryRecord = toRecord(entry);
          if (!entryRecord) {
            return null;
          }

          return (
            toNonEmptyString(entryRecord.question) ??
            toNonEmptyString(entryRecord.questionText) ??
            toNonEmptyString(entryRecord.question_text)
          );
        })
        .filter((question): question is string => Boolean(question))
    : [];

  const blockedSectionsFromPayload = toRecordArray(questionContext?.blockedSections ?? questionContext?.blocked_sections).map(
    (section, index) => {
      const normalized = normalizeBlockedSection(section);
      const fallbackQuestion = questionContextQuestions[index];

      if (!toNonEmptyString(normalized.question)) {
        return {
          ...normalized,
          question: fallbackQuestion ?? null,
        };
      }

      return normalized;
    },
  );
  const blockedSections = blockedSectionsFromPayload;
  const hasExplicitBlockedSections = blockedSections.length > 0;
  const blockedSectionCount = parseBlockedSectionsCount(
    questionContext?.blockedSectionCount ??
      questionContext?.blocked_section_count ??
      questionContext?.blockedSectionsCount ??
      questionContext?.blocked_sections_count,
  );

  if (!hasExplicitBlockedSections) {
    const fallbackSectionId = toNonEmptyString(questionContext?.sectionId) ?? toNonEmptyString(questionContext?.section_id);
    const fallbackSectionLabel =
      toNonEmptyString(questionContext?.sectionLabel) ??
      toNonEmptyString(questionContext?.section_label) ??
      fallbackSectionId;
    if (!fallbackSectionId && !fallbackSectionLabel) {
      return null;
    }

    return {
      blockedSectionCount: blockedSectionCount ?? 1,
      sectionId: fallbackSectionId,
      sectionLabel: fallbackSectionLabel,
      blockedSections: [
        {
          sectionId: fallbackSectionId,
          sectionLabel: fallbackSectionLabel,
          violationSummary: toNonEmptyString(questionContext?.violationSummary) ?? toNonEmptyString(questionContext?.violation_summary),
          question: questionContextQuestions[0] ?? null,
        },
      ],
      hasExplicitBlockedSections,
    };
  }

  return {
    blockedSectionCount,
    sectionId: toNonEmptyString(questionContext?.sectionId) ?? toNonEmptyString(questionContext?.section_id),
    sectionLabel: toNonEmptyString(questionContext?.sectionLabel) ?? toNonEmptyString(questionContext?.section_label),
    blockedSections,
    hasExplicitBlockedSections,
  };
}

function formatSectionCountLabel(count: number | null) {
  if (!count || count <= 1) {
    return '1 blocked section';
  }

  return `${count} blocked sections`;
}

function pluralizeBlockLabel(count: number | null, fallback: string | null): string {
  if (fallback) {
    return fallback;
  }

  return formatSectionCountLabel(count);
}

function formatViolationSummary(blockedSection: BlockedSectionPreview): string | null {
  if (!blockedSection.violationSummary && !blockedSection.sectionLabel && !blockedSection.sectionId) {
    return null;
  }

  if (blockedSection.violationSummary) {
    const subject = blockedSection.sectionLabel ?? blockedSection.sectionId;
    return subject ? `${subject}: ${blockedSection.violationSummary}` : blockedSection.violationSummary;
  }

  return blockedSection.sectionLabel ?? blockedSection.sectionId ?? 'Blocked section';
}

function rememberTaskCampaign(taskId: string, campaignId?: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedCampaignId = typeof campaignId === 'string' ? campaignId.trim() : '';
  if (!normalizedCampaignId) {
    return;
  }

  try {
    const existingRaw = window.localStorage.getItem(REVIEWER_TASK_CAMPAIGN_MAP_KEY);
    const existingParsed: unknown = existingRaw ? JSON.parse(existingRaw) : {};
    const existingMap =
      existingParsed && typeof existingParsed === 'object' && !Array.isArray(existingParsed)
        ? (existingParsed as Record<string, unknown>)
        : {};

    const nextMap: Record<string, string> = Object.fromEntries(
      Object.entries(existingMap)
        .filter(([key, value]) => typeof key === 'string' && typeof value === 'string' && key.trim() && value.trim())
        .map(([key, value]) => [key, (value as string).trim()]),
    );
    nextMap[taskId] = normalizedCampaignId;
    window.localStorage.setItem(REVIEWER_TASK_CAMPAIGN_MAP_KEY, JSON.stringify(nextMap));
  } catch {
    // Ignore storage failures.
  }
}

function ReviewerTaskRow({ task }: { task: ReviewerTaskItem }) {
  const clientName = task.clientName || task.campaignTitle || task.campaignId || 'Unknown Client';
  const marketLabel = task.marketId || 'Unknown Market';
  const detailHref = task.campaignId
    ? `/app/reviewer/tasks/${task.id}?campaignId=${encodeURIComponent(task.campaignId)}`
    : `/app/reviewer/tasks/${task.id}`;
  const outputConstraintContext = getOutputConstraintContext(task);
  const persistContext = () => rememberTaskCampaign(task.id, task.campaignId);
  const outputConstraintBadgeCount = outputConstraintContext
    ? outputConstraintContext.blockedSectionCount ?? outputConstraintContext.blockedSections.length
    : 0;
  const isMultipleBlockedIssues =
    task.failureMode === OUTPUT_CONSTRAINT_MODE && outputConstraintBadgeCount > 1;

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Link href={detailHref} onClick={persistContext} className="text-base font-semibold text-foreground underline-offset-4 hover:underline">
              {`${clientName} - ${marketLabel}`}
            </Link>
            {task.marketId ? <p className="text-xs text-muted-foreground">Market: {task.marketId}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <Link href={detailHref} onClick={persistContext}>
              <Button size="sm" className={OPEN_DETAIL_BUTTON_CLASS}>Open Detail</Button>
            </Link>
            {task.pipelineRunId && (
              <Link href={`/app/reviewer/runs/${task.pipelineRunId}`}>
                <Button size="sm" className={RUN_CONTEXT_BUTTON_CLASS}>
                  Run Context
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ReviewStatusBadge status={task.status} label={formatOpsStatus(task.status)} />
          <ReviewStatusBadge status={task.runStatus} label={`Run ${formatOpsStatus(task.runStatus)}`} />
          <ReviewStatusBadge
            status={task.campaignStatus}
            label={formatCampaignOpsStatus(task.campaignStatus)}
          />
          <ReviewStatusBadge status={String(task.currentStep ?? 'UNKNOWN')} label={formatOpsStep(task.currentStep)} />
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <p>Campaign: {task.campaignTitle || task.campaignId || 'Not available'}</p>
          <p>Updated: {formatOpsDateTime(task.updatedAt)}</p>
          <p>Created: {formatOpsDateTime(task.createdAt)}</p>
          <p>Attempt: {typeof task.attemptNumber === 'number' ? task.attemptNumber : 'Not available'}</p>
          {outputConstraintContext ? (
            <p>
              Blocked Sections:{' '}
              <span className="font-semibold text-foreground">
                {formatSectionCountLabel(outputConstraintBadgeCount || null)}
              </span>
            </p>
          ) : null}
        </div>
        {outputConstraintContext ? (
          <details className="rounded-md border border-border/70 bg-background/40 p-3 text-sm">
            <summary className="cursor-pointer font-medium text-amber-600">
              {pluralizeBlockLabel(
                outputConstraintContext.blockedSectionCount,
                outputConstraintContext.sectionLabel,
              )}
            </summary>
            {isMultipleBlockedIssues ? (
              <ul className="mt-2 space-y-2 pl-4 text-muted-foreground">
                {outputConstraintContext.blockedSections.map((blockedSection, index) => (
                  <li key={`${blockedSection.sectionId || blockedSection.sectionLabel || 'section'}-${index}`}>
                    <span className="text-foreground">
                      {blockedSection.sectionLabel ?? blockedSection.sectionId ?? 'Unknown section'}
                    </span>
                    {blockedSection.violationSummary ? ` - ${blockedSection.violationSummary}` : null}
                    {blockedSection.marketId ? (
                      <span className="ml-1 text-xs text-muted-foreground">(market: {blockedSection.marketId})</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2">
                {formatViolationSummary(outputConstraintContext.blockedSections[0] ?? {})}
              </p>
            )}
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

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
                {review.sectionTitle || review.sectionId || `Section Review ${review.id}`}
              </Link>
            ) : (
              <p className="text-base font-semibold text-foreground">
                {review.sectionTitle || review.sectionId || `Section Review ${review.id}`}
              </p>
            )}
            {review.marketId ? <p className="text-xs text-muted-foreground">Market: {review.marketId}</p> : null}
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
          <p>Latest Revision: {review.latestRevisionSummary || 'None'}</p>
          <p>Updated: {formatOpsDateTime(review.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InboxEmpty({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="py-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox className="size-5" />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}

export default function ReviewerStrategyReviewsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get('status')?.toUpperCase() ?? 'ALL');
  const [pipelineRunId, setPipelineRunId] = useState(searchParams.get('pipelineRunId') ?? '');
  const [marketId, setMarketId] = useState(searchParams.get('marketId') ?? '');
  const [sortBy, setSortBy] = useState<SortBy>(
    searchParams.get('sortBy') === 'createdAt' ? 'createdAt' : 'updatedAt',
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc',
  );
  const [limit, setLimit] = useState<number>(() => {
    const raw = Number(searchParams.get('limit'));
    return Number.isFinite(raw) && raw > 0 ? raw : 20;
  });

  const isOpsRole = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

  const filters = useMemo<OpsListFilters>(
    () => ({
      status: status === 'ALL' ? undefined : status,
      pipelineRunId: pipelineRunId.trim() || undefined,
      marketId: marketId.trim() || undefined,
      sortBy,
      sortOrder,
      limit,
    }),
    [limit, marketId, pipelineRunId, sortBy, sortOrder, status],
  );

  const reviewerTasksQuery = useOpsReviewerTasks(filters, isOpsRole);
  const sectionReviewsQuery = useOpsSectionReviews(filters, isOpsRole);

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading reviewer inbox...</div>;
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
      <div className="space-y-2">
        <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Reviewer Ops Inbox</h1>
        <p className="text-muted-foreground">
          Unified queue for intelligence blockers and mandatory strategy review approvals.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'ALL' ? 'All statuses' : formatOpsStatus(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-run-filter">Pipeline Run</Label>
            <Input
              id="pipeline-run-filter"
              value={pipelineRunId}
              onChange={(event) => setPipelineRunId(event.target.value)}
              placeholder="run id"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="market-filter">Market</Label>
            <Input
              id="market-filter"
              value={marketId}
              onChange={(event) => setMarketId(event.target.value)}
              placeholder="market id"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort-by-filter">Sort By</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger id="sort-by-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Updated Time</SelectItem>
                <SelectItem value="createdAt">Created Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort-order-filter">Order</Label>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
              <SelectTrigger id="sort-order-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit-filter">Page Size</Label>
            <div className="flex gap-2">
              <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
                <SelectTrigger id="limit-filter">
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  void reviewerTasksQuery.refetch();
                  void sectionReviewsQuery.refetch();
                }}
                disabled={reviewerTasksQuery.isFetching || sectionReviewsQuery.isFetching}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reviewerTasks" className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-xl border border-amber-300/80 bg-amber-100/80 p-1 dark:border-amber-500/40 dark:bg-amber-500/20">
          <TabsTrigger
            value="reviewerTasks"
            className="flex-none rounded-md border border-transparent bg-transparent px-4 text-amber-900/90 transition-colors hover:bg-amber-200/70 data-[state=active]:border-amber-400 data-[state=active]:bg-amber-400 data-[state=active]:text-amber-950 data-[state=active]:shadow-sm dark:text-amber-200 dark:hover:bg-amber-500/20 dark:data-[state=active]:border-amber-300 dark:data-[state=active]:bg-amber-300 dark:data-[state=active]:text-amber-950"
          >
            Intelligence Blockers ({reviewerTasksQuery.data?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="sectionReviews"
            className="flex-none rounded-md border border-transparent bg-transparent px-4 text-amber-900/90 transition-colors hover:bg-amber-200/70 data-[state=active]:border-amber-400 data-[state=active]:bg-amber-400 data-[state=active]:text-amber-950 data-[state=active]:shadow-sm dark:text-amber-200 dark:hover:bg-amber-500/20 dark:data-[state=active]:border-amber-300 dark:data-[state=active]:bg-amber-300 dark:data-[state=active]:text-amber-950"
          >
            Strategy Review ({sectionReviewsQuery.data?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviewerTasks" className="space-y-4">
          {reviewerTasksQuery.isLoading ? (
            <Card className="border-border bg-card">
              <CardContent className="p-5 text-sm text-muted-foreground">
                Loading reviewer tasks...
              </CardContent>
            </Card>
          ) : reviewerTasksQuery.error ? (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="p-5 text-sm text-destructive">
                {reviewerTasksQuery.error instanceof Error
                  ? reviewerTasksQuery.error.message
                  : 'Failed to load reviewer tasks.'}
              </CardContent>
            </Card>
          ) : (reviewerTasksQuery.data ?? []).length === 0 ? (
            <InboxEmpty
              title="No intelligence blockers in this filter"
              description="When intelligence blockers require reviewer input, tasks will appear here."
            />
          ) : (
            <div className="space-y-3">
              {(reviewerTasksQuery.data ?? []).map((task) => (
                <ReviewerTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sectionReviews" className="space-y-4">
          <div className="flex justify-end">
            <Link href="/app/reviewer/section-reviews">
              <Button variant="outline" size="sm">
                Open Full Strategy Review Inbox
              </Button>
            </Link>
          </div>
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
                  : 'Failed to load section review tasks.'}
              </CardContent>
            </Card>
          ) : (sectionReviewsQuery.data ?? []).length === 0 ? (
            <InboxEmpty
              title="No strategy review tasks in this filter"
              description="Mandatory section approvals and revision requests will show up here."
            />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
