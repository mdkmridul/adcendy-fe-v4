'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ReactNode, useRef, useState } from 'react';
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Layers,
  RefreshCcw,
  Workflow,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import {
  useAdminAiCalls,
  useAdminCampaignDetail,
  useRefreshAdminCampaignIntelligence,
} from '@/hooks/useAdminReview';
import { useOpsCampaignOverviews } from '@/hooks/useOpsV2';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/shared/api/errors';
import { opsV2Repository, runsV2Repository } from '@/shared/api/repositories';
import { createIdempotencyKey } from '@/shared/run/idempotency';
import { toJsonPreview } from '@/shared/components/ops/opsUtils';
import { ReviewStatusBadge } from '@/shared/components/reviews/ReviewStatusBadge';
import { CampaignDocumentUploader } from '@/shared/components/campaigns/CampaignDocumentUploader';
import { CampaignArtifactGenerator } from '@/shared/components/campaigns/CampaignArtifactGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { resolveDownloadFilename, triggerBlobDownload } from '@/lib/download';
import { cn } from '@/lib/utils';
import {
  formatCampaignStatus,
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
} from '@/shared/types/campaign';
import type { AdminCampaignTriggerType, AdminPipelineTriggerBodyV2 } from '@/shared/types/opsV2';

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

const PIPELINE_MARKET_SELECTION_CUSTOM = '__pipeline_market_selection_custom__';
const PIPELINE_MARKET_SELECTION_ALL = '__pipeline_market_selection_all__';
const PIPELINE_MARKET_SELECTION_VALUE_PREFIX = '__pipeline_market_selection_value__::';
const ACTIVE_PIPELINE_RUN_STATUSES = new Set(['QUEUED', 'RUNNING', 'ACTIVE']);

function parseJsonObject(value: string, label: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object.`);
  }

  return parsed as Record<string, unknown>;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toUniqueNonEmptyStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = toNonEmptyString(value);
    if (!normalized) {
      continue;
    }

    const dedupeKey = normalized.toLowerCase();
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    result.push(normalized);
  }

  return result;
}

function toPipelineMarketSelectionValue(marketId: string): string {
  return `${PIPELINE_MARKET_SELECTION_VALUE_PREFIX}${marketId}`;
}

function getPipelineMarketIdFromSelection(selection: string): string | null {
  if (!selection.startsWith(PIPELINE_MARKET_SELECTION_VALUE_PREFIX)) {
    return null;
  }

  return toNonEmptyString(selection.slice(PIPELINE_MARKET_SELECTION_VALUE_PREFIX.length));
}

function isActivePipelineRunStatus(value: unknown): boolean {
  const normalized = toNonEmptyString(value)?.toUpperCase();
  if (!normalized) {
    return false;
  }

  return ACTIVE_PIPELINE_RUN_STATUSES.has(normalized);
}

function toPipelineTriggerPayload(value: Record<string, unknown>): AdminPipelineTriggerBodyV2 {
  const payload: AdminPipelineTriggerBodyV2 = {
    marketId: value.marketId ?? undefined,
    audienceId: value.audienceId ?? undefined,
  };

  if (Object.prototype.hasOwnProperty.call(value, 'marketIds')) {
    payload.marketIds = value.marketIds;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'audienceIds')) {
    payload.audienceIds = value.audienceIds;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'fixtureKey')) {
    payload.fixtureKey = value.fixtureKey;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'forceMode')) {
    payload.forceMode = value.forceMode;
  }

  if (Object.prototype.hasOwnProperty.call(value, 'strategySupportedManifestVersion')) {
    payload.strategySupportedManifestVersion = value.strategySupportedManifestVersion;
  }

  return payload;
}

function applyPipelineMarketSelection(
  payload: AdminPipelineTriggerBodyV2,
  selection: string,
  campaignMarketOptions: string[],
): AdminPipelineTriggerBodyV2 {
  const nextPayload: AdminPipelineTriggerBodyV2 = {
    ...payload,
  };

  if (selection === PIPELINE_MARKET_SELECTION_CUSTOM) {
    return nextPayload;
  }

  if (selection === PIPELINE_MARKET_SELECTION_ALL) {
    if (campaignMarketOptions.length > 0) {
      nextPayload.marketIds = campaignMarketOptions;
    } else {
      delete nextPayload.marketIds;
    }
    delete nextPayload.marketId;
    return nextPayload;
  }

  const selectedMarketId = getPipelineMarketIdFromSelection(selection);
  if (selectedMarketId) {
    nextPayload.marketId = selectedMarketId;
    delete nextPayload.marketIds;
  }

  return nextPayload;
}

function ActionButton({
  label,
  tooltip,
  description,
  tooltipTitle,
  badge,
  onClick,
  disabled,
  pendingLabel,
  pending,
  tone = 'neutral',
  icon,
  className,
}: {
  label: string;
  tooltip: string;
  description?: string;
  tooltipTitle?: string;
  badge?: string;
  onClick: () => void;
  disabled?: boolean;
  pendingLabel?: string;
  pending?: boolean;
  tone?: 'neutral' | 'accent';
  icon?: ReactNode;
  className?: string;
}) {
  const toneClasses =
    tone === 'accent'
      ? 'border-amber-200/80 bg-gradient-to-br from-amber-300 to-amber-400 text-zinc-950 hover:from-amber-200 hover:to-amber-300 hover:border-amber-100'
      : 'border-border/80 bg-gradient-to-br from-background/90 to-background/60 text-foreground hover:border-amber-300/60 hover:from-accent/55 hover:to-background/80';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block w-full">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={onClick}
            className={cn(
              'group h-auto min-h-[74px] w-full items-start justify-start gap-3 rounded-xl px-3.5 py-3 whitespace-normal text-left shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md',
              toneClasses,
              className,
            )}
          >
            {icon ? (
              <span
                className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                  tone === 'accent'
                    ? 'border-zinc-900/15 bg-zinc-950/10 text-zinc-900'
                    : 'border-amber-300/30 bg-amber-300/10 text-amber-300',
                )}
              >
                {icon}
              </span>
            ) : null}
            <span className="flex min-w-0 flex-col items-start">
              <span className="text-sm font-semibold leading-5">
                {pending ? pendingLabel ?? 'Working...' : label}
              </span>
              {badge ? (
                <span
                  className={cn(
                    'mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                    tone === 'accent'
                      ? 'bg-zinc-950/10 text-zinc-900/85'
                      : 'bg-amber-300/10 text-amber-200',
                  )}
                >
                  {badge}
                </span>
              ) : null}
              {description ? (
                <span
                  className={cn(
                    'mt-1 text-xs font-normal leading-4',
                    tone === 'accent'
                      ? 'text-zinc-900/80'
                      : 'text-muted-foreground group-hover:text-foreground/80',
                  )}
                >
                  {description}
                </span>
              ) : null}
            </span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={10}
        className="max-w-[360px] rounded-lg border border-border/70 bg-popover px-3.5 py-2.5 text-xs leading-5 text-popover-foreground shadow-xl"
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-300">
            {tooltipTitle ?? label}
          </p>
          <p className="text-xs leading-5 text-popover-foreground/90">{tooltip}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default function AdminCampaignDetailPage() {
  const params = useParams();
  const campaignId = params?.campaignId as string;
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const campaignDetailQuery = useAdminCampaignDetail(campaignId, isAdmin, {
    refetchOnMount: 'always',
  });
  const refreshMutation = useRefreshAdminCampaignIntelligence(campaignId);
  const aiCallsQuery = useAdminAiCalls(
    {
      campaignId,
      entityType: 'CAMPAIGN',
      entityId: campaignId,
      limit: 6,
      page: 1,
    },
    isAdmin && Boolean(campaignId),
    {
      refetchOnMount: 'always',
    },
  );
  const opsCampaignOverviewsQuery = useOpsCampaignOverviews(isAdmin && Boolean(campaignId), {
    refetchOnMount: 'always',
  });
  const campaignOverview = opsCampaignOverviewsQuery.data?.find((campaign) => campaign.id === campaignId) ?? null;
  const campaignMarketOptions = toUniqueNonEmptyStrings([
    ...(campaignOverview?.v2TargetMarkets ?? []),
    ...(campaignOverview?.marketLocations ?? []),
    campaignOverview?.v2PrimaryMarket,
    campaignOverview?.marketLocation,
  ]);
  const [triggerPayloadJson, setTriggerPayloadJson] = useState<string>('{}');
  const [pipelineMarketSelection, setPipelineMarketSelection] = useState<string>(PIPELINE_MARKET_SELECTION_CUSTOM);
  const [lastTriggerResult, setLastTriggerResult] = useState<unknown>(null);
  const startRunIdempotencyKeyRef = useRef<string | null>(null);
  const retryRunIdempotencyKeyRef = useRef<string | null>(null);
  const triggerCampaignMutation = useMutation({
    mutationFn: ({
      trigger,
      payload,
    }: {
      trigger: AdminCampaignTriggerType;
      payload?: Record<string, unknown>;
    }) => opsV2Repository.triggerAdminCampaign(campaignId, trigger, payload),
  });
  const startRunMutation = useMutation({
    mutationFn: async () => {
      const key =
        startRunIdempotencyKeyRef.current ??
        createIdempotencyKey(`start-run-${campaignId}`);
      startRunIdempotencyKeyRef.current = key;
      return runsV2Repository.start(campaignId, key);
    },
    onSuccess: () => {
      startRunIdempotencyKeyRef.current = null;
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status && error.status < 500) {
        startRunIdempotencyKeyRef.current = null;
      }
    },
  });
  const retryRunMutation = useMutation({
    mutationFn: async () => {
      const recovery = await runsV2Repository.recover(campaignId, 'latest');
      if (!recovery.run) {
        throw new Error('No pipeline run is available for this campaign.');
      }
      if (!recovery.run.capabilities.canRetry) {
        throw new Error(
          `Run ${recovery.run.runId} is ${recovery.run.status} and is not retryable.`,
        );
      }
      const key =
        retryRunIdempotencyKeyRef.current ??
        createIdempotencyKey(`retry-run-${recovery.run.runId}`);
      retryRunIdempotencyKeyRef.current = key;
      const result = await runsV2Repository.retry(recovery.run.runId, key);
      if (result.runId !== recovery.run.runId) {
        throw new Error('Backend retry changed the canonical run ID.');
      }
      return result;
    },
    onSuccess: () => {
      retryRunIdempotencyKeyRef.current = null;
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status && error.status < 500) {
        retryRunIdempotencyKeyRef.current = null;
      }
    },
  });
  const downloadCampaignOutputMutation = useMutation({
    mutationFn: (payload?: Record<string, unknown>) => opsV2Repository.downloadAdminCampaignOutput(campaignId, payload),
  });
  const recreateLatestRunMutation = useMutation({
    mutationFn: () => opsV2Repository.recreateLatestCommittedRun(campaignId),
  });
  const assembleInternalOutputMutation = useMutation({
    mutationFn: (runId: string) => opsV2Repository.assembleAdminRunInternalOutput(runId),
  });
  const campaignDetail = campaignDetailQuery.data;
  const latestRunId = campaignDetail?.latestRun?.id ?? null;
  const reviewWorkspaceHref = latestRunId ? `/app/admin/runs/${latestRunId}` : null;

  const handleTriggerCampaign = async (
    trigger: AdminCampaignTriggerType,
    label: string,
    options?: { includeRunIdForPipeline?: boolean },
  ) => {
    try {
      const inputPayload = parseJsonObject(triggerPayloadJson, 'Campaign trigger payload');
      const payload =
        trigger === 'pipeline'
          ? applyPipelineMarketSelection(
              toPipelineTriggerPayload(inputPayload),
              pipelineMarketSelection,
              campaignMarketOptions,
            )
          : inputPayload;

      if (trigger === 'pipeline' && options?.includeRunIdForPipeline) {
        const refreshedCampaignDetail = (await campaignDetailQuery.refetch().catch(() => null))?.data ?? campaignDetail;
        const latestRunIdCandidate =
          toNonEmptyString(refreshedCampaignDetail?.latestRun?.id) ??
          toNonEmptyString(campaignDetail?.latestRun?.id);
        let latestRunStatus =
          toNonEmptyString(refreshedCampaignDetail?.latestRun?.status) ??
          toNonEmptyString(campaignDetail?.latestRun?.status);

        if (latestRunIdCandidate && !latestRunStatus) {
          const aggregate = await opsV2Repository.getRunAggregate(latestRunIdCandidate).catch(() => null);
          latestRunStatus = toNonEmptyString(aggregate?.status);
        }

        if (!latestRunIdCandidate || !isActivePipelineRunStatus(latestRunStatus)) {
          const statusLabel = latestRunStatus ?? 'UNKNOWN';
          toast({
            title: 'No active run available',
            description: `Latest run is ${statusLabel}. Run From Last Failure only supports latest active runs.`,
            variant: 'destructive',
          });
          return;
        }

        payload.runId = latestRunIdCandidate;
      }

      if (trigger === 'pipeline') {
        setTriggerPayloadJson(JSON.stringify(payload, null, 2));
      }

      const result = await triggerCampaignMutation.mutateAsync({
        trigger,
        payload,
      });
      setLastTriggerResult(result);
      toast({
        title: `${label} queued`,
        description: `Campaign ${campaignId} ${label.toLowerCase()} request submitted.`,
      });
    } catch (error) {
      toast({
        title: `Unable to ${label.toLowerCase()}`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleStartPipelineRun = async () => {
    try {
      const result = await startRunMutation.mutateAsync();
      setLastTriggerResult(result);
      toast({
        title: 'Full pipeline queued',
        description: `Run ${result.runId} was queued for campaign ${campaignId}.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to start pipeline',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleRetryPipelineRun = async () => {
    try {
      const result = await retryRunMutation.mutateAsync();
      setLastTriggerResult(result);
      toast({
        title: 'Pipeline retry queued',
        description: `Run ${result.runId} is continuing as attempt ${result.attemptNumber}.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to retry pipeline',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleRecreateLatestRun = async () => {
    try {
      const result = await recreateLatestRunMutation.mutateAsync();
      setLastTriggerResult(result);
      toast({
        title: 'Recreate run queued',
        description: `Campaign ${campaignId} run recreate request submitted.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to recreate run',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadAssembledOutput = async () => {
    try {
      const payload = parseJsonObject(triggerPayloadJson, 'Campaign trigger payload');
      const result = await downloadCampaignOutputMutation.mutateAsync(payload);
      const filename = resolveDownloadFilename(
        result.filename,
        `${campaignId}-output`,
        result.contentType ?? result.blob.type,
      );

      triggerBlobDownload(result.blob, filename);
      setLastTriggerResult({
        downloaded: true,
        filename,
        contentType: result.contentType ?? result.blob.type ?? null,
        size: result.blob.size,
      });
      toast({
        title: 'Output downloaded',
        description: `${filename} downloaded from output assembly response.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to download output',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleAssembleInternalOutput = async () => {
    if (!latestRunId) {
      toast({
        title: 'No run available',
        description: 'A latest run is required before the strategy document can be assembled directly.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await assembleInternalOutputMutation.mutateAsync(latestRunId);
      setLastTriggerResult(result);
      toast({
        title: 'Strategy document assembly queued',
        description: `Run ${latestRunId} internal output assembly request submitted.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to assemble strategy document',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

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
            Admin detail backed by `GET /api/v2/admin/campaigns/:campaignId` with run and telemetry visibility.
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

      <div className="grid gap-6 xl:grid-cols-2">
        <CampaignDocumentUploader campaignId={campaignId} />
        <CampaignArtifactGenerator
          campaignId={campaignId}
          runId={latestRunId}
        />
      </div>

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

              <Card className="relative overflow-hidden border-border bg-card/95 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-amber-300/8 via-cyan-300/5 to-transparent" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Admin Pipeline Controls
                  </CardTitle>
                  <CardDescription>
                    Trigger pipeline and generation actions directly from this campaign detail workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border/70 bg-gradient-to-br from-background/75 to-background/30 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Campaign
                      </p>
                      <p className="mt-1 truncate font-mono text-xs text-foreground">{campaignId}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-gradient-to-br from-background/75 to-background/30 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Run</p>
                      <p className="mt-1 truncate font-mono text-xs text-foreground">{latestRunId ?? 'Not available'}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-gradient-to-br from-background/75 to-background/30 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Latest Status
                      </p>
                      <p className="mt-1 truncate font-mono text-xs text-foreground">
                        {campaignDetail.latestRun?.status ?? campaignOverview?.latestRunStatus ?? 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/5 via-background/35 to-background/25 p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Pipeline Triggers</p>
                      <p className="text-xs text-muted-foreground">
                        Queue specific regeneration stages without leaving this workspace.
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-background/35 p-3">
                      <div className="grid gap-3 md:grid-cols-[minmax(0,260px)_1fr] md:items-end">
                        <div className="space-y-1.5">
                          <Label htmlFor="admin-campaign-pipeline-market-target-select">Legacy Pipeline Market Target</Label>
                          <Select value={pipelineMarketSelection} onValueChange={setPipelineMarketSelection}>
                            <SelectTrigger id="admin-campaign-pipeline-market-target-select">
                              <SelectValue placeholder="Choose market target" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PIPELINE_MARKET_SELECTION_CUSTOM}>Use market from payload JSON</SelectItem>
                              <SelectItem
                                value={PIPELINE_MARKET_SELECTION_ALL}
                                disabled={campaignMarketOptions.length === 0}
                              >
                                {campaignMarketOptions.length > 0
                                  ? `All campaign markets (${campaignMarketOptions.join(', ')})`
                                  : 'All campaign markets (not available)'}
                              </SelectItem>
                              {campaignMarketOptions.map((marketId) => (
                                <SelectItem key={marketId} value={toPipelineMarketSelectionValue(marketId)}>
                                  {`Only ${marketId}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Wave 2 full start and retry use the Backend-owned run plan and ignore this legacy selector.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <ActionButton
                        label="Run Full Pipeline"
                        tooltip="Run all v2 stages from intelligence through output."
                        tooltipTitle="Full Pipeline"
                        badge="End-to-end"
                        description="End-to-end run from intelligence to final assembly."
                        onClick={() => void handleStartPipelineRun()}
                        disabled={startRunMutation.isPending}
                        pending={startRunMutation.isPending}
                        pendingLabel="Queuing..."
                        tone="accent"
                        icon={<Workflow className="h-4 w-4" />}
                      />
                      <ActionButton
                        label="Run From Last Failure"
                        tooltip="Retry the latest failed run through the dedicated idempotent retry operation."
                        tooltipTitle="Pipeline Recovery"
                        badge="Recovery"
                        description="Continue the same run ID from its retryable failed phase."
                        onClick={() => void handleRetryPipelineRun()}
                        disabled={retryRunMutation.isPending}
                        pending={retryRunMutation.isPending}
                        pendingLabel="Queuing..."
                        icon={<RefreshCcw className="h-4 w-4" />}
                      />
                      <ActionButton
                        label="Run Intelligence"
                        tooltip="Run only intelligence stages and produce/update the manifest."
                        tooltipTitle="Intelligence Only"
                        badge="Scoped"
                        description="Refresh insights and update the manifest only."
                        onClick={() => void handleTriggerCampaign('intelligence', 'Run Intelligence')}
                        disabled={triggerCampaignMutation.isPending}
                        pending={triggerCampaignMutation.isPending}
                        pendingLabel="Queuing..."
                        icon={<BrainCircuit className="h-4 w-4" />}
                      />
                      <ActionButton
                        label="Run Strategy"
                        tooltip="Run narrative and strategy generation stages only."
                        tooltipTitle="Strategy Stages"
                        badge="Narrative"
                        description="Regenerate strategy narrative stages only."
                        onClick={() => void handleTriggerCampaign('strategy', 'Run Strategy')}
                        disabled={triggerCampaignMutation.isPending}
                        pending={triggerCampaignMutation.isPending}
                        pendingLabel="Queuing..."
                        icon={<FileText className="h-4 w-4" />}
                      />
                      <ActionButton
                        label="Run Sections"
                        tooltip="Run section selection, generation, and formatting only."
                        tooltipTitle="Sections + Formatting"
                        badge="Content"
                        description="Rebuild selected sections and formatting layers."
                        onClick={() => void handleTriggerCampaign('sections', 'Run Sections')}
                        disabled={triggerCampaignMutation.isPending}
                        pending={triggerCampaignMutation.isPending}
                        pendingLabel="Queuing..."
                        icon={<Layers className="h-4 w-4" />}
                      />
                      <ActionButton
                        label="Assemble Output"
                        tooltip="Generate final output artifacts from approved sections."
                        tooltipTitle="Output Assembly"
                        badge="Deliverables"
                        description="Produce deliverables from approved section outputs."
                        onClick={() => void handleDownloadAssembledOutput()}
                        disabled={downloadCampaignOutputMutation.isPending}
                        pending={downloadCampaignOutputMutation.isPending}
                        pendingLabel="Downloading..."
                        icon={<CheckCircle2 className="h-4 w-4" />}
                      />
                      <ActionButton
                        label="Generate Strategy Document"
                        tooltip="Assemble internal output for the latest run without waiting for section approval flow."
                        tooltipTitle="Direct Strategy Assembly"
                        badge="No approval gate"
                        description="Admin-only run-level strategy document assembly."
                        onClick={() => void handleAssembleInternalOutput()}
                        disabled={assembleInternalOutputMutation.isPending || !latestRunId}
                        pending={assembleInternalOutputMutation.isPending}
                        pendingLabel="Queuing..."
                        icon={<FileText className="h-4 w-4" />}
                      />
                      <ActionButton
                        label="Recreate Run From Latest Commit"
                        tooltip="Clone latest committed wizard snapshot and start a fresh run safely."
                        tooltipTitle="Recreate Run"
                        badge="Safe reset"
                        description="Start a clean run from latest committed snapshot."
                        onClick={() => void handleRecreateLatestRun()}
                        disabled={recreateLatestRunMutation.isPending}
                        pending={recreateLatestRunMutation.isPending}
                        pendingLabel="Queuing..."
                        icon={<RefreshCcw className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-border bg-background/30 p-4">
                    <div className="space-y-1">
                      <Label htmlFor="admin-campaign-trigger-payload-json">Campaign Trigger Payload</Label>
                      <p className="text-xs text-muted-foreground">
                        Shared payload for scoped legacy trigger operations. Wave 2 full start and retry use their
                        operation-specific contracts and ignore this payload.
                      </p>
                    </div>
                    <Textarea
                      id="admin-campaign-trigger-payload-json"
                      value={triggerPayloadJson}
                      onChange={(event) => setTriggerPayloadJson(event.target.value)}
                      rows={10}
                      className="font-mono text-xs"
                    />
                  </div>

                  {lastTriggerResult ? (
                    <div className="space-y-2 rounded-xl border border-border bg-background/30 p-4">
                      <p className="text-sm font-semibold text-foreground">Last Trigger Response</p>
                      <pre className="max-h-[260px] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                        {toJsonPreview(lastTriggerResult)}
                      </pre>
                    </div>
                  ) : null}
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
