'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Layers,
  PlayCircle,
  RefreshCcw,
  Workflow,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useOpsCampaignOverviews, useOpsReviewerTask } from '@/hooks/useOpsV2';
import { useToast } from '@/hooks/use-toast';
import { opsV2Repository } from '@/shared/api/repositories';
import type {
  AdminCampaignTriggerType,
  AdminPipelineTriggerBodyV2,
} from '@/shared/types/opsV2';
import { formatOpsStatus, toJsonPreview } from '@/shared/components/ops/opsUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const FIELD_LABELS: Record<string, string> = {
  whatWentWrong: 'What Went Wrong',
  currentValuesToFix: 'Current Values To Fix',
  whereAnswerWillBeApplied: 'Where Answer Will Be Applied',
  pipelineRestartPhase: 'Pipeline Restart Phase',
  renderedQuestion: 'Rendered Question',
  failureMode: 'Failure Mode',
  status: 'Status',
  submittedAnswer: 'Submitted Answer',
};

function prettifyLabel(label: string) {
  return FIELD_LABELS[label] ?? label;
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">Not available</span>;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <span className="text-foreground">{String(value)}</span>;
  }

  return (
    <pre className="max-h-[240px] overflow-auto rounded-md border border-border bg-background p-3 text-xs text-foreground">
      {toJsonPreview(value)}
    </pre>
  );
}

function FieldCard({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold tracking-[0.02em] text-amber-600 dark:text-amber-300">
        {prettifyLabel(label)}
      </p>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm">{renderValue(value)}</div>
      </div>
    </div>
  );
}

function toEditableJson(value: unknown, fallback: Record<string, unknown>) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  }

  return JSON.stringify(fallback, null, 2);
}

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

function normalizeIdCandidate(value: unknown, taskId: string): string | null {
  const normalized = toNonEmptyString(value);
  if (!normalized || normalized === taskId) {
    return null;
  }

  return normalized;
}

function getCampaignIdFromReferrer(taskId: string | null | undefined): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const referrer = toNonEmptyString(document.referrer);
    if (!referrer) {
      return null;
    }

    const url = new URL(referrer);
    if (url.origin !== window.location.origin) {
      return null;
    }

    const queryCampaignId = toNonEmptyString(url.searchParams.get('campaignId'));
    if (queryCampaignId && queryCampaignId !== taskId) {
      return queryCampaignId;
    }

    const campaignPathMatch = url.pathname.match(/\/campaigns\/([^/?#]+)/i);
    const campaignFromPath = toNonEmptyString(campaignPathMatch?.[1]);
    if (campaignFromPath && campaignFromPath !== taskId) {
      return decodeURIComponent(campaignFromPath);
    }

    return null;
  } catch {
    return null;
  }
}

const REVIEWER_TASK_CAMPAIGN_MAP_KEY = 'adcendy_reviewer_task_campaign_map_v1';

function readTaskCampaignMap(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(REVIEWER_TASK_CAMPAIGN_MAP_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const entries = Object.entries(parsed as Record<string, unknown>)
      .filter(([key, value]) => Boolean(toNonEmptyString(key)) && Boolean(toNonEmptyString(value)))
      .slice(-500);

    return Object.fromEntries(
      entries.map(([key, value]) => [key, (value as string).trim()]),
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

function getStoredCampaignIdForTask(taskId: string | null | undefined): string | null {
  const normalizedTaskId = toNonEmptyString(taskId);
  if (!normalizedTaskId) {
    return null;
  }

  const map = readTaskCampaignMap();
  return toNonEmptyString(map[normalizedTaskId]);
}

function setStoredCampaignIdForTask(taskId: string | null | undefined, campaignId: string | null | undefined) {
  const normalizedTaskId = toNonEmptyString(taskId);
  const normalizedCampaignId = toNonEmptyString(campaignId);
  if (!normalizedTaskId || !normalizedCampaignId) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = readTaskCampaignMap();
    if (current[normalizedTaskId] === normalizedCampaignId) {
      return;
    }

    const next = {
      ...current,
      [normalizedTaskId]: normalizedCampaignId,
    };
    window.localStorage.setItem(REVIEWER_TASK_CAMPAIGN_MAP_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage write failures; API trigger can still use runtime task payload.
  }
}

function toPipelineTriggerPayload(
  value: Record<string, unknown>,
  fallback?: {
    marketId?: string | null;
    audienceId?: string | null;
  },
): AdminPipelineTriggerBodyV2 {
  const payload: AdminPipelineTriggerBodyV2 = {
    marketId: value.marketId ?? fallback?.marketId ?? undefined,
    audienceId: value.audienceId ?? fallback?.audienceId ?? undefined,
  };

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

export default function ReviewerTaskDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const taskId = params?.taskId as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const isOpsRole = user?.role === 'REVIEWER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const taskQuery = useOpsReviewerTask(taskId, isOpsRole);
  const task = taskQuery.data;
  const campaignOverviewsQuery = useOpsCampaignOverviews(isOpsRole && Boolean(task?.pipelineRunId));
  const [referrerCampaignId, setReferrerCampaignId] = useState<string | null>(null);
  const [storedCampaignId, setStoredCampaignId] = useState<string | null>(null);
  const queryCampaignId = toNonEmptyString(searchParams.get('campaignId'));
  const taskCampaignId = toNonEmptyString(task?.campaignId);
  const campaignIdFromRun =
    task?.pipelineRunId && campaignOverviewsQuery.data
      ? toNonEmptyString(
          campaignOverviewsQuery.data.find((campaign) => campaign.pipelineRunId === task.pipelineRunId)?.id,
        )
      : null;
  const resolvedCampaignId =
    taskCampaignId && taskCampaignId !== task?.id
      ? taskCampaignId
      : queryCampaignId && queryCampaignId !== taskId
        ? queryCampaignId
        : storedCampaignId && storedCampaignId !== taskId
          ? storedCampaignId
          : referrerCampaignId && referrerCampaignId !== taskId
            ? referrerCampaignId
          : campaignIdFromRun && campaignIdFromRun !== taskId
            ? campaignIdFromRun
            : null;
  const canRecreateCampaign = Boolean(resolvedCampaignId);
  const [blockerAnswerJson, setBlockerAnswerJson] = useState('{}');
  const [triggerPayloadJson, setTriggerPayloadJson] = useState('{}');
  const [lastActionResult, setLastActionResult] = useState<unknown>(null);

  useEffect(() => {
    setStoredCampaignId(getStoredCampaignIdForTask(taskId));
    setReferrerCampaignId(getCampaignIdFromReferrer(taskId));
  }, [taskId]);

  useEffect(() => {
    if (!resolvedCampaignId) {
      return;
    }

    setStoredCampaignIdForTask(taskId, resolvedCampaignId);
    setStoredCampaignId((current) => (current === resolvedCampaignId ? current : resolvedCampaignId));
  }, [resolvedCampaignId, taskId]);

  useEffect(() => {
    if (!task) {
      return;
    }

    setBlockerAnswerJson(
      toEditableJson(task.submittedAnswer ?? task.exampleAnswerPayload, {
        confirmed: true,
      }),
    );
    const triggerPayload = toPipelineTriggerPayload(
      {},
      {
        marketId: task.marketId ?? undefined,
        audienceId: task.audienceId ?? undefined,
      },
    );
    if (resolvedCampaignId) {
      triggerPayload.campaignId = resolvedCampaignId;
    }
    setTriggerPayloadJson(
      toEditableJson(
        triggerPayload,
        {},
      ),
    );
    setLastActionResult(null);
  }, [resolvedCampaignId, task?.audienceId, task?.id, task?.marketId]);

  const respondMutation = useMutation({
    mutationFn: (answer: Record<string, unknown>) =>
      opsV2Repository.respondReviewerTask(taskId, { answer }),
  });

  const startSectionReviewMutation = useMutation({
    mutationFn: (runId: string) => opsV2Repository.startSectionReview(runId),
  });

  const triggerCampaignMutation = useMutation({
    mutationFn: ({
      campaignId,
      trigger,
      payload,
    }: {
      campaignId: string;
      trigger: AdminCampaignTriggerType;
      payload?: Record<string, unknown>;
    }) => opsV2Repository.triggerAdminCampaign(campaignId, trigger, payload),
  });

  const recreateLatestRunMutation = useMutation({
    mutationFn: (campaignId: string) => opsV2Repository.recreateLatestCommittedRun(campaignId),
  });

  const handleResumeFromBlocker = async () => {
    try {
      const answer = parseJsonObject(blockerAnswerJson, 'Blocker response payload');
      const result = await respondMutation.mutateAsync(answer);
      setLastActionResult(result);
      toast({
        title: 'Blocker response submitted',
        description: result.resumeOutcome
          ? `Resume outcome: ${result.resumeOutcome}`
          : 'Task response accepted.',
      });
      void taskQuery.refetch();
    } catch (error) {
      toast({
        title: 'Unable to resume from blocker',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleStartSectionReview = async () => {
    if (!task?.pipelineRunId) {
      return;
    }

    try {
      const result = await startSectionReviewMutation.mutateAsync(task.pipelineRunId);
      setLastActionResult(result);
      toast({
        title: 'Section review started',
        description: `Run ${task.pipelineRunId} moved into review workspace.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to start section review',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleTriggerCampaign = async (trigger: AdminCampaignTriggerType, label: string) => {
    if (!task) {
      return;
    }

    try {
      const inputPayload = parseJsonObject(triggerPayloadJson, 'Campaign trigger payload');
      const payloadCampaignId = toNonEmptyString(inputPayload.campaignId ?? inputPayload.campaign_id);
      let campaignId = normalizeIdCandidate(resolvedCampaignId, task.id) ?? normalizeIdCandidate(payloadCampaignId, task.id);

      if (!campaignId) {
        const pipelineRunId = toNonEmptyString(task.pipelineRunId);

        if (pipelineRunId) {
          try {
            const tasksByRun = await opsV2Repository.listReviewerTasks({
              pipelineRunId,
              limit: 100,
            });
            const exactTask = tasksByRun.find((item) => item.id === task.id);
            campaignId =
              normalizeIdCandidate(exactTask?.campaignId, task.id) ??
              normalizeIdCandidate(tasksByRun.find((item) => toNonEmptyString(item.campaignId))?.campaignId, task.id);
          } catch {
            // Ignore fallback lookup errors and continue with additional strategies.
          }

          if (!campaignId) {
            try {
              const sectionReviewsByRun = await opsV2Repository.listSectionReviewsByRun(pipelineRunId, {
                limit: 100,
              });
              campaignId = normalizeIdCandidate(
                sectionReviewsByRun.find((item) => toNonEmptyString(item.campaignId))?.campaignId,
                task.id,
              );
            } catch {
              // Ignore fallback lookup errors and continue.
            }
          }
        }

        if (!campaignId) {
          const overviews = campaignOverviewsQuery.data ?? (await opsV2Repository.listCampaignOverviews().catch(() => []));
          if (pipelineRunId) {
            campaignId = normalizeIdCandidate(
              overviews.find((campaign) => campaign.pipelineRunId === pipelineRunId)?.id,
              task.id,
            );
          }

          if (!campaignId) {
            const campaignTitle = toNonEmptyString(task.campaignTitle);
            if (campaignTitle) {
              campaignId = normalizeIdCandidate(
                overviews.find((campaign) => toNonEmptyString(campaign.title) === campaignTitle)?.id,
                task.id,
              );
            }
          }
        }
      }

      if (!campaignId) {
        toast({
          title: 'Campaign ID is missing',
          description:
            'No valid campaign ID found. Add "campaignId" in Campaign Trigger Payload JSON to send this request.',
          variant: 'destructive',
        });
        return;
      }

      if (campaignId === task?.id) {
        toast({
          title: 'Campaign ID looks invalid',
          description:
            'Campaign ID matches task ID. Use the real campaign ID in payload field "campaignId".',
          variant: 'destructive',
        });
        return;
      }

      const payload =
        trigger === 'pipeline'
          ? toPipelineTriggerPayload(inputPayload, {
              marketId: task.marketId ?? undefined,
              audienceId: task.audienceId ?? undefined,
            })
          : inputPayload;
      setStoredCampaignIdForTask(task.id, campaignId);
      setStoredCampaignId(campaignId);
      const result = await triggerCampaignMutation.mutateAsync({
        campaignId,
        trigger,
        payload,
      });
      setLastActionResult(result);
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

  const handleRecreateLatestRun = async () => {
    if (!resolvedCampaignId) {
      toast({
        title: 'Campaign ID is missing',
        description: 'No campaign reference is available for this task. Recreate request was not sent.',
        variant: 'destructive',
      });
      return;
    }

    if (resolvedCampaignId === task.id) {
      toast({
        title: 'Campaign ID looks invalid',
        description: 'Campaign ID matches task ID. Recreate request was blocked to avoid targeting the wrong campaign.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await recreateLatestRunMutation.mutateAsync(resolvedCampaignId);
      setStoredCampaignIdForTask(task.id, resolvedCampaignId);
      setLastActionResult(result);
      toast({
        title: 'Recreate run queued',
        description: `Campaign ${resolvedCampaignId} run recreate request submitted.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to recreate run',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  if (isAuthLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading reviewer task...</div>;
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
            Back to Reviewer Inbox
          </Button>
        </Link>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-300">
            Reviewer Workspace
          </p>
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Campaign Review Detail</h1>
          <p className="text-sm text-muted-foreground">Structured view for reviewer diagnostics and single-value response submission.</p>
        </div>
      </div>

      {taskQuery.isLoading ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">Loading task detail...</CardContent>
        </Card>
      ) : taskQuery.error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-5 text-sm text-destructive">
            {taskQuery.error instanceof Error ? taskQuery.error.message : 'Failed to load task detail.'}
          </CardContent>
        </Card>
      ) : !task ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-sm text-muted-foreground">Task not found.</CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Campaign Review Details</CardTitle>
            <CardDescription>Mapped reviewer-task fields</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <FieldCard label="whatWentWrong" value={task.whatWentWrong} />
              <FieldCard label="renderedQuestion" value={task.renderedQuestion} />
              <FieldCard label="currentValuesToFix" value={task.currentValuesToFix} />
              <FieldCard label="whereAnswerWillBeApplied" value={task.whereAnswerWillBeApplied} />
              <FieldCard label="pipelineRestartPhase" value={task.pipelineRestartPhase} />
              <FieldCard label="failureMode" value={task.failureMode ? formatOpsStatus(task.failureMode) : null} />
              <FieldCard label="status" value={task.status ? formatOpsStatus(task.status) : null} />
              {task.submittedAnswer !== null && task.submittedAnswer !== undefined ? (
                <div className="lg:col-span-2">
                  <FieldCard label="submittedAnswer" value={task.submittedAnswer} />
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && task ? (
        <Card className="relative overflow-hidden border-border bg-card/95 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-amber-300/8 via-cyan-300/5 to-transparent" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Admin Pipeline Controls
            </CardTitle>
            <CardDescription>
              Trigger pipeline and generation actions directly from this intelligence blocker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-gradient-to-br from-background/75 to-background/30 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Campaign
                </p>
                <p className="mt-1 truncate font-mono text-xs text-foreground">
                  {task.campaignId ?? 'Not available'}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-gradient-to-br from-background/75 to-background/30 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Run</p>
                <p className="mt-1 truncate font-mono text-xs text-foreground">
                  {task.pipelineRunId ?? 'Not available'}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-gradient-to-br from-background/75 to-background/30 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Restart Phase Hint
                </p>
                <p className="mt-1 truncate font-mono text-xs text-foreground">
                  {task.pipelineRestartPhase ?? 'Not available'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="space-y-3 rounded-xl border border-amber-300/20 bg-gradient-to-br from-amber-300/8 via-background/35 to-background/25 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Reviewer Actions</p>
                  <p className="text-xs text-muted-foreground">Resolve blocker then open review assignment.</p>
                </div>
                <ActionButton
                  label="Submit Reviewer Response"
                  tooltip="Submit your answer to unblock the pipeline and resume from the right phase."
                  tooltipTitle="Respond + Resume"
                  badge="Primary"
                  description="Send blocker response payload and resume from restart phase."
                  onClick={() => void handleResumeFromBlocker()}
                  disabled={respondMutation.isPending}
                  pending={respondMutation.isPending}
                  pendingLabel="Submitting..."
                  tone="accent"
                  icon={<PlayCircle className="h-4 w-4" />}
                />
                <ActionButton
                  label="Start Review"
                  tooltip="Claim this run and assign unclaimed review tasks to you."
                  tooltipTitle="Create Review Workspace"
                  badge="Reviewer"
                  description="Create review workspace for this run."
                  onClick={() => void handleStartSectionReview()}
                  disabled={startSectionReviewMutation.isPending || !task.pipelineRunId}
                  pending={startSectionReviewMutation.isPending}
                  pendingLabel="Starting..."
                  icon={<CheckCircle2 className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-3 rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/5 via-background/35 to-background/25 p-4 xl:col-span-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Pipeline Triggers</p>
                  <p className="text-xs text-muted-foreground">
                    Queue specific regeneration stages without leaving this workspace.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ActionButton
                    label="Run Full Pipeline"
                    tooltip="Run all v2 stages from intelligence through output."
                    tooltipTitle="Full Pipeline"
                    badge="End-to-end"
                    description="End-to-end run from intelligence to final assembly."
                    onClick={() => void handleTriggerCampaign('pipeline', 'Run Full Pipeline')}
                    disabled={triggerCampaignMutation.isPending}
                    pending={triggerCampaignMutation.isPending}
                    pendingLabel="Queuing..."
                    icon={<Workflow className="h-4 w-4" />}
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
                    onClick={() => void handleTriggerCampaign('output', 'Assemble Output')}
                    disabled={triggerCampaignMutation.isPending}
                    pending={triggerCampaignMutation.isPending}
                    pendingLabel="Queuing..."
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  />
                  <ActionButton
                    label="Recreate Run From Latest Commit"
                    tooltip="Clone latest committed wizard snapshot and start a fresh run safely."
                    tooltipTitle="Recreate Run"
                    badge="Safe reset"
                    description="Start a clean run from latest committed snapshot."
                    onClick={() => void handleRecreateLatestRun()}
                    disabled={recreateLatestRunMutation.isPending || !canRecreateCampaign}
                    pending={recreateLatestRunMutation.isPending}
                    pendingLabel="Queuing..."
                    icon={<RefreshCcw className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-border bg-background/30 p-4">
                <div className="space-y-1">
                  <Label htmlFor="admin-blocker-answer-json">Blocker Response Payload</Label>
                  <p className="text-xs text-muted-foreground">
                    Used by Submit Reviewer Response to unblock the run.
                  </p>
                </div>
                <Textarea
                  id="admin-blocker-answer-json"
                  value={blockerAnswerJson}
                  onChange={(event) => setBlockerAnswerJson(event.target.value)}
                  rows={11}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-background/30 p-4">
                <div className="space-y-1">
                  <Label htmlFor="admin-trigger-payload-json">Campaign Trigger Payload</Label>
                  <p className="text-xs text-muted-foreground">
                    Shared payload sent to pipeline trigger operations.
                  </p>
                </div>
                <Textarea
                  id="admin-trigger-payload-json"
                  value={triggerPayloadJson}
                  onChange={(event) => setTriggerPayloadJson(event.target.value)}
                  rows={11}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {lastActionResult ? (
              <div className="space-y-2 rounded-xl border border-border bg-background/30 p-4">
                <p className="text-sm font-semibold text-foreground">Last Action Response</p>
                <pre className="max-h-[260px] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                  {toJsonPreview(lastActionResult)}
                </pre>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
              {task.pipelineRunId ? (
                <Link href={`/app/admin/runs/${task.pipelineRunId}`}>
                  <Button variant="outline" size="sm">
                    Open Admin Run Workspace
                  </Button>
                </Link>
              ) : null}
              {task.campaignId ? (
                <Link href={`/app/admin/campaigns/${task.campaignId}`}>
                  <Button variant="outline" size="sm">
                    Open Admin Campaign
                  </Button>
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

