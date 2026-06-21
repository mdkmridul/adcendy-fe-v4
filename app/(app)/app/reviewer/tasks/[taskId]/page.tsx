'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
import { useAdminCampaignDetail } from '@/hooks/useAdminReview';
import { useOpsCampaignOverviews, useOpsReviewerTask } from '@/hooks/useOpsV2';
import { useToast } from '@/hooks/use-toast';
import { adminReviewRepository, opsV2Repository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  AdminCampaignTriggerType,
  AdminPipelineTriggerBodyV2,
  ReviewerTaskRespondPayload,
} from '@/shared/types/opsV2';
import { formatOpsStatus, toJsonPreview } from '@/shared/components/ops/opsUtils';
import { humanizeReviewValue } from '@/shared/types/reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { resolveDownloadFilename, triggerBlobDownload } from '@/lib/download';
import { cn } from '@/lib/utils';

const OUTPUT_CONSTRAINT_MODE = 'output_constraint_violation';
const FIELD_LABELS: Record<string, string> = {
  whatWentWrong: 'What Went Wrong',
  currentValuesToFix: 'Current Values To Fix',
  feedback: 'Feedback',
  whereAnswerWillBeApplied: 'Where Answer Will Be Applied',
  pipelineRestartPhase: 'Pipeline Restart Phase',
  renderedQuestion: 'Rendered Question',
  section: 'Section',
  market: 'Market',
  failureMode: 'Failure',
  status: 'Status',
  submittedAnswer: 'Submitted Answer',
};

type OutputConstraintBlockedSection = {
  issueId?: string | null;
  termId?: string | null;
  sectionId?: string | null;
  sectionLabel?: string | null;
  violationSummary?: string | null;
  offendingSnippet?: string | null;
  preferredWording?: string | null;
  question?: string | null;
  marketId?: string | null;
  audienceId?: string | null;
};

type OutputConstraintCurrentValuesContext = {
  blockedSectionCount: number | null;
  blockedSections: OutputConstraintBlockedSection[];
  hasExplicitBlockedSections: boolean;
};

type OutputConstraintIssueState = {
  issueKey: string;
  issueId: string;
  section: OutputConstraintBlockedSection;
  responseText: string;
  isLocked: boolean;
  isSaving: boolean;
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

function parseBlockedSectionsCount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const count = Math.trunc(value);
    return count >= 0 ? count : null;
  }

  if (typeof value === 'string') {
    const count = Number.parseInt(value, 10);
    return Number.isFinite(count) && count >= 0 ? count : null;
  }

  return null;
}

function normalizeOutputConstraintSection(item: Record<string, unknown>): OutputConstraintBlockedSection {
  return {
    issueId: toNonEmptyString(item.issueId) ?? toNonEmptyString(item.issue_id),
    termId: toNonEmptyString(item.termId) ?? toNonEmptyString(item.term_id),
    sectionId: toNonEmptyString(item.sectionId) ?? toNonEmptyString(item.section_id),
    sectionLabel: toNonEmptyString(item.sectionLabel) ?? toNonEmptyString(item.section_label),
    violationSummary: toNonEmptyString(item.violationSummary) ?? toNonEmptyString(item.violation_summary),
    offendingSnippet: toNonEmptyString(item.offendingSnippet) ?? toNonEmptyString(item.offending_snippet),
    preferredWording:
      toNonEmptyString(item.preferredWording) ??
      toNonEmptyString(item.preferred_wording) ??
      toNonEmptyString(item.preferredWortding) ??
      toNonEmptyString(item.preferred_wortding),
    question: toNonEmptyString(item.question) ?? toNonEmptyString(item.questionText) ?? toNonEmptyString(item.question_text),
    marketId: toNonEmptyString(item.marketId) ?? toNonEmptyString(item.market_id),
    audienceId: toNonEmptyString(item.audienceId) ?? toNonEmptyString(item.audience_id),
  };
}

function getTaskQuestionContext(questionPayloadValue: unknown): Record<string, unknown> | null {
  const questionPayload = toRecord(questionPayloadValue);
  if (!questionPayload) {
    return null;
  }

  return (
    toRecord(questionPayload.questionContext) ??
    toRecord(questionPayload.question_context) ??
    toRecord(questionPayload.blockedSectionquestionContext) ??
    toRecord(questionPayload.blockedSectionQuestionContext) ??
    toRecord(questionPayload.blocked_section_question_context) ??
    null
  );
}

function getBlockedSectionsFromCurrentValues(
  currentValuesToFix: unknown,
  fallbackQuestionContext: unknown,
): OutputConstraintCurrentValuesContext | null {
  const currentValuesRecord = toRecord(currentValuesToFix) ?? null;
  const questionContext = toRecord(fallbackQuestionContext) ?? null;
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

  const questionContextBlockedSections = toRecordArray(
    questionContext?.blockedSections ?? questionContext?.blocked_sections,
  ).map((section, index) => {
    const normalized = normalizeOutputConstraintSection(section);
    const fallbackQuestion = questionContextQuestions[index];
    if (!toNonEmptyString(normalized.question)) {
      return {
        ...normalized,
        question: fallbackQuestion ?? null,
      };
    }

    return normalized;
  });

  if (questionContextBlockedSections.length > 0) {
    return {
      blockedSectionCount:
        parseBlockedSectionsCount(
          questionContext?.blockedSectionCount ??
            questionContext?.blocked_section_count ??
            questionContext?.blockedSectionsCount ??
            questionContext?.blocked_sections_count,
        ) ?? questionContextBlockedSections.length,
      blockedSections: questionContextBlockedSections,
      hasExplicitBlockedSections: true,
    };
  }

  const currentValuesBlockedSections = toRecordArray(
    currentValuesRecord?.blockedSections ?? currentValuesRecord?.blocked_sections,
  ).map((section, index) => {
    const normalized = normalizeOutputConstraintSection(section);
    const fallbackQuestion = questionContextQuestions[index];

    if (!toNonEmptyString(normalized.question)) {
      return {
        ...normalized,
        question: fallbackQuestion ?? null,
      };
    }

    return normalized;
  });

  if (currentValuesBlockedSections.length > 0) {
    return {
      blockedSectionCount:
        parseBlockedSectionsCount(
          currentValuesRecord?.blockedSectionCount ?? currentValuesRecord?.blocked_section_count,
        ) ?? currentValuesBlockedSections.length,
      blockedSections: currentValuesBlockedSections,
      hasExplicitBlockedSections: true,
    };
  }

  const fallbackSectionId =
    toNonEmptyString(questionContext?.sectionId) ?? toNonEmptyString(questionContext?.section_id) ?? null;
  const fallbackSectionLabel =
    toNonEmptyString(questionContext?.sectionLabel) ??
    toNonEmptyString(questionContext?.section_label) ??
    fallbackSectionId;
  if (!fallbackSectionId && !fallbackSectionLabel) {
    return null;
  }

  return {
    blockedSectionCount:
      parseBlockedSectionsCount(questionContext?.blockedSectionCount ?? questionContext?.blocked_section_count) ?? 1,
        blockedSections: [
          {
            sectionId: fallbackSectionId,
            sectionLabel: fallbackSectionLabel,
            violationSummary:
              toNonEmptyString(questionContext?.violationSummary) ??
              toNonEmptyString(questionContext?.violation_summary),
            question: toNonEmptyString(questionContext?.question) ?? questionContextQuestions[0] ?? null,
          },
        ],
        hasExplicitBlockedSections: false,
      };
}

function formatOutputConstraintSectionLabel(section: OutputConstraintBlockedSection): string {
  return section.sectionLabel ?? section.sectionId ?? 'Unknown section';
}

function formatOutputConstraintSectionCount(count: number | null): string {
  if (!count || count <= 1) {
    return '1 blocked section';
  }

  return `${count} blocked sections`;
}

function parseRenderedQuestionText(value: unknown): string[] {
  const renderedQuestion = toNonEmptyString(value);
  if (!renderedQuestion) {
    return [];
  }

  try {
    const parsed = JSON.parse(renderedQuestion);
    if (Array.isArray(parsed)) {
      const parsedItems = parsed
        .map((item) => toNonEmptyString(item))
        .filter((item): item is string => Boolean(item));
      if (parsedItems.length > 0) {
        return parsedItems;
      }
    }

    const asRecord = toRecord(parsed);
    const questionsFromRecord = toRecordArray(asRecord?.questions).map((item) => toNonEmptyString(item)).filter(
      (item): item is string => Boolean(item),
    );
    if (questionsFromRecord.length > 0) {
      return questionsFromRecord;
    }
  } catch {
    // Not JSON-encoded question payload.
  }

  const byBlankLine = renderedQuestion
    .split(/\n\s*\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (byBlankLine.length > 1) {
    return byBlankLine;
  }

  const byNumbered = renderedQuestion
    .split(/\n(?=\s*\d+[\.\)]\s+)/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (byNumbered.length > 1) {
    return byNumbered;
  }

  const byBullets = renderedQuestion
    .split(/\n(?=\s*[-*]\s+)/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (byBullets.length > 1) {
    return byBullets;
  }

  return [renderedQuestion];
}

function getOutputConstraintIssueKey(section: OutputConstraintBlockedSection, index: number): string {
  return toNonEmptyString(section.issueId) ??
    `${section.sectionId ?? section.sectionLabel ?? 'blocked-section'}::${index}`;
}

type OutputConstraintIssueAnswer = {
  issueId: string;
  sectionId: string;
  sectionLabel?: string;
  marketId?: string;
  instruction: string;
};

function mapOutputConstraintIssueToAnswer(
  issue: OutputConstraintIssueState,
  fallbackMarketId?: string | null,
): OutputConstraintIssueAnswer | null {
  const instruction = toNonEmptyString(issue.responseText);
  const issueId = toNonEmptyString(issue.issueId);
  const sectionId = toNonEmptyString(issue.section.sectionId);
  const sectionLabel =
    toNonEmptyString(issue.section.sectionLabel) ?? formatOutputConstraintSectionLabel(issue.section);
  const marketId = toNonEmptyString(issue.section.marketId) ?? toNonEmptyString(fallbackMarketId);

  if (!issueId || !instruction || !sectionId) {
    return null;
  }

  return {
    issueId,
    sectionId,
    ...(sectionLabel ? { sectionLabel } : {}),
    ...(marketId ? { marketId } : {}),
    instruction,
  };
}

function buildOutputConstraintSubmitPayload(
  issues: OutputConstraintIssueState[],
  fallbackMarketId?: string | null,
): Record<string, unknown> | null {
  const issueAnswers = issues
    .filter((issue) => issue.isLocked)
    .map((issue) => mapOutputConstraintIssueToAnswer(issue, fallbackMarketId))
    .filter((entry): entry is OutputConstraintIssueAnswer => entry !== null);

  if (issueAnswers.length === 0) {
    return null;
  }

  return {
    issueAnswers,
  };
}


function OutputConstraintIssueCard({
  issueIndex,
  issue,
  disabled,
  interactive = true,
  onChange,
  onSave,
}: {
  issueIndex: number;
  issue: OutputConstraintIssueState;
  disabled: boolean;
  interactive?: boolean;
  onChange?: (value: string) => void;
  onSave?: () => void;
}) {
  const isLocked = issue.isLocked;
  const isSaving = issue.isSaving;

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        isLocked
          ? 'border-emerald-300/60 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/25 dark:text-emerald-100'
          : 'border-border bg-card text-foreground',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold">{`Issue ${issueIndex + 1}`}</p>
        <span className={cn('text-xs font-semibold uppercase tracking-[0.08em]', isLocked ? 'text-emerald-600' : 'text-muted-foreground')}>
          {isLocked ? 'Locked' : 'Pending'}
        </span>
      </div>
      <div className="grid gap-3 text-xs text-muted-foreground lg:grid-cols-2">
        <div className="space-y-1">
          <p className="font-medium text-foreground">Blocker Type</p>
          <p>{issue.section.termId ?? 'Not available'}</p>
        </div>
        <div className="space-y-1 lg:col-span-2">
          <p className="font-medium text-foreground">Offending Snippet</p>
          <p>{issue.section.offendingSnippet ?? 'Not available'}</p>
        </div>
        <div className="space-y-1 lg:col-span-2">
          <p className="font-medium text-foreground">Violation Summary</p>
          <p>{issue.section.violationSummary ?? 'Not available'}</p>
        </div>
      </div>
      {interactive ? (
        <div className="mt-3 space-y-2">
          <Label htmlFor={`output-constraint-issue-${issue.issueKey}`}>Response</Label>
          <Textarea
            id={`output-constraint-issue-${issue.issueKey}`}
            value={issue.responseText}
            onChange={(event) => onChange?.(event.target.value)}
            rows={6}
            className="font-sans text-sm"
            placeholder="Add the response that should be submitted for this issue."
            disabled={isLocked || isSaving || disabled}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={disabled || isLocked || isSaving || issue.responseText.trim().length === 0}
              onClick={() => {
                onSave?.();
              }}
              variant={isLocked ? 'secondary' : 'default'}
            >
              {isSaving ? 'Saving...' : isLocked ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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

function resolveTaskSectionId(
  task:
    | {
        sectionId?: string | null;
        questionPayload?: Record<string, unknown> | null;
      }
    | null
    | undefined,
): string | null {
  const questionPayload = toRecord(task?.questionPayload);
  return (
    toNonEmptyString(task?.sectionId) ??
    toNonEmptyString(questionPayload?.sectionId) ??
    toNonEmptyString(questionPayload?.section_id) ??
    toNonEmptyString(questionPayload?.sectoinId) ??
    toNonEmptyString(questionPayload?.sectoin_id) ??
    null
  );
}

function formatTaskSectionLabel(sectionId?: string | null): string | null {
  const normalizedSectionId = toNonEmptyString(sectionId);
  if (!normalizedSectionId) {
    return null;
  }

  const strippedSectionId = normalizedSectionId.replace(/^section(?:[_-]\d+)?[_-]+/i, '');
  return humanizeReviewValue(strippedSectionId || normalizedSectionId);
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
const PIPELINE_MARKET_SELECTION_CUSTOM = '__pipeline_market_selection_custom__';
const PIPELINE_MARKET_SELECTION_TASK = '__pipeline_market_selection_task__';
const PIPELINE_MARKET_SELECTION_ALL = '__pipeline_market_selection_all__';
const PIPELINE_MARKET_SELECTION_VALUE_PREFIX = '__pipeline_market_selection_value__::';
const ACTIVE_PIPELINE_RUN_STATUSES = new Set(['QUEUED', 'RUNNING', 'ACTIVE']);

function isActivePipelineRunStatus(value: unknown): boolean {
  const normalized = toNonEmptyString(value)?.toUpperCase();
  if (!normalized) {
    return false;
  }

  return ACTIVE_PIPELINE_RUN_STATUSES.has(normalized);
}

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
  taskMarketId?: string | null,
): AdminPipelineTriggerBodyV2 {
  const nextPayload: AdminPipelineTriggerBodyV2 = {
    ...payload,
  };

  if (selection === PIPELINE_MARKET_SELECTION_CUSTOM) {
    return nextPayload;
  }

  if (selection === PIPELINE_MARKET_SELECTION_TASK) {
    const normalizedTaskMarketId = toNonEmptyString(taskMarketId);
    if (normalizedTaskMarketId) {
      nextPayload.marketId = normalizedTaskMarketId;
    } else {
      delete nextPayload.marketId;
    }
    delete nextPayload.marketIds;
    return nextPayload;
  }

  if (selection === PIPELINE_MARKET_SELECTION_ALL) {
    const fallbackMarketIds = toUniqueNonEmptyStrings([taskMarketId]);
    const marketIds = campaignMarketOptions.length > 0 ? campaignMarketOptions : fallbackMarketIds;
    if (marketIds.length > 0) {
      nextPayload.marketIds = marketIds;
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

export default function ReviewerTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = params?.taskId as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
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
  const adminCampaignIdForDetail =
    normalizeIdCandidate(resolvedCampaignId, taskId) ??
    normalizeIdCandidate(taskCampaignId, taskId) ??
    normalizeIdCandidate(queryCampaignId, taskId);
  const adminCampaignDetailQuery = useAdminCampaignDetail(
    adminCampaignIdForDetail,
    isAdmin && Boolean(adminCampaignIdForDetail),
    {
      refetchOnMount: 'always',
    },
  );
  const resolvedCampaignOverview =
    campaignOverviewsQuery.data?.find((campaign) => campaign.id === resolvedCampaignId) ??
    campaignOverviewsQuery.data?.find((campaign) => campaign.pipelineRunId === task?.pipelineRunId) ??
    null;
  const campaignMarketOptions = toUniqueNonEmptyStrings([
    ...(resolvedCampaignOverview?.v2TargetMarkets ?? []),
    ...(resolvedCampaignOverview?.marketLocations ?? []),
    resolvedCampaignOverview?.v2PrimaryMarket,
    resolvedCampaignOverview?.marketLocation,
    task?.marketId,
  ]);
  const canRecreateCampaign = Boolean(resolvedCampaignId);
  const taskQuestionContext = getTaskQuestionContext(task?.questionPayload);
  const outputConstraintContext = task
    ? getBlockedSectionsFromCurrentValues(task.currentValuesToFix, taskQuestionContext)
    : null;
  const isOutputConstraintFailureMode = task?.failureMode === OUTPUT_CONSTRAINT_MODE;
  const hasOutputConstraintIssues = Boolean(outputConstraintContext?.blockedSections?.length);
  const isBlockerSnapshotTask = isOutputConstraintFailureMode || hasOutputConstraintIssues;
  const taskSectionLabel = formatTaskSectionLabel(resolveTaskSectionId(task));
  const adminSectionSummary =
    toNonEmptyString(taskQuestionContext?.sectionLabel ?? taskQuestionContext?.section_label) ?? taskSectionLabel;
  const adminMarketSummary =
    toNonEmptyString(taskQuestionContext?.marketLabel ?? taskQuestionContext?.market_label) ??
    toNonEmptyString(task?.marketId);
  const resolvedReviewerId = toNonEmptyString(task?.reviewerId) ?? toNonEmptyString(user?.id);
  const [blockerAnswerJson, setBlockerAnswerJson] = useState('{}');
  const [outputConstraintIssueStates, setOutputConstraintIssueStates] = useState<OutputConstraintIssueState[]>([]);
  const [triggerPayloadJson, setTriggerPayloadJson] = useState('{}');
  const [pipelineMarketSelection, setPipelineMarketSelection] = useState<string>(
    PIPELINE_MARKET_SELECTION_CUSTOM,
  );
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

    setPipelineMarketSelection(
      toNonEmptyString(task.marketId) ? PIPELINE_MARKET_SELECTION_TASK : PIPELINE_MARKET_SELECTION_CUSTOM,
    );
  }, [task?.id, task?.marketId]);

  useEffect(() => {
    if (!task) {
      return;
    }

    if (isBlockerSnapshotTask && outputConstraintContext?.blockedSections?.length) {
      const parsedQuestionParts = parseRenderedQuestionText(task.renderedQuestion);
      setOutputConstraintIssueStates((previousStates) =>
        outputConstraintContext.blockedSections.map((section, index) => {
          const resolvedQuestion = toNonEmptyString(section.question) ?? toNonEmptyString(parsedQuestionParts[index]);
          const sectionWithQuestion = resolvedQuestion ? { ...section, question: resolvedQuestion } : section;
          const issueKey = getOutputConstraintIssueKey(section, index);
          const previousState = previousStates.find((state) => state.issueKey === issueKey);
          const fallbackIssueId = toNonEmptyString(section.issueId) ?? issueKey;

          return {
            issueKey,
            issueId: fallbackIssueId,
            section: sectionWithQuestion,
            responseText:
              previousState?.responseText ?? section.preferredWording ?? '',
            isLocked: previousState?.isLocked ?? false,
            isSaving: false,
          };
        }),
      );
    } else {
      setOutputConstraintIssueStates([]);
      setBlockerAnswerJson('{}');
    }

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
  }, [
    isBlockerSnapshotTask,
    resolvedCampaignId,
    task?.audienceId,
    task?.id,
    task?.currentValuesToFix,
    task?.renderedQuestion,
    task?.marketId,
    task?.pipelineRunId,
    taskQuestionContext,
  ]);

  const respondMutation = useMutation({
    mutationFn: (payload: ReviewerTaskRespondPayload) => opsV2Repository.respondReviewerTask(taskId, payload),
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
  const downloadCampaignOutputMutation = useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload?: Record<string, unknown>;
    }) => opsV2Repository.downloadAdminCampaignOutput(campaignId, payload),
  });

  const recreateLatestRunMutation = useMutation({
    mutationFn: (campaignId: string) => opsV2Repository.recreateLatestCommittedRun(campaignId),
  });

  const resolveCampaignIdForAdminTrigger = async (inputPayload: Record<string, unknown>) => {
    if (!task) {
      return null;
    }

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

    return campaignId;
  };

  const handleResumeFromBlocker = async () => {
    if (isBlockerSnapshotTask) {
      return;
    }

    if (!task) {
      return;
    }

    try {
      const parsedAnswer = parseJsonObject(blockerAnswerJson, 'Blocker response payload');
      const normalizedAnswer = toRecord(parsedAnswer?.answer) ?? parsedAnswer;
      const result = await respondMutation.mutateAsync({
        ...(resolvedReviewerId ? { reviewerId: resolvedReviewerId } : {}),
        answer: normalizedAnswer,
      });

      setLastActionResult(result);
      toast({
        title: 'Blocker response submitted',
        description: result.resumeOutcome
          ? `Resume outcome: ${result.resumeOutcome}`
          : 'Task response accepted.',
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
      router.replace('/app/reviewer/strategy-reviews');
    } catch (error) {
      toast({
        title: 'Unable to resume from blocker',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const outputConstraintRenderedQuestions = parseRenderedQuestionText(task?.renderedQuestion);
  const outputConstraintIssueCards: OutputConstraintIssueState[] = outputConstraintIssueStates.length
    ? outputConstraintIssueStates
    : outputConstraintContext
      ? outputConstraintContext.blockedSections.map((section, index) => {
          const resolvedQuestion =
            toNonEmptyString(section.question) ?? toNonEmptyString(outputConstraintRenderedQuestions[index]);
          const sectionWithQuestion = resolvedQuestion ? { ...section, question: resolvedQuestion } : section;
          const issueKey = getOutputConstraintIssueKey(section, index);

          return {
            issueKey,
            issueId: toNonEmptyString(section.issueId) ?? issueKey,
            section: sectionWithQuestion,
            responseText: section.preferredWording ?? '',
            isLocked: false,
            isSaving: false,
          };
        })
      : [];
  const allOutputConstraintIssuesLocked =
    outputConstraintIssueStates.length > 0 && outputConstraintIssueStates.every((issue) => issue.isLocked);

  const handleOutputConstraintIssueResponseChange = (issueKey: string, responseText: string) => {
    setOutputConstraintIssueStates((current) =>
      (current.length > 0 ? current : outputConstraintIssueCards).map((issue) =>
        issue.issueKey === issueKey ? { ...issue, responseText, isLocked: false, isSaving: false } : issue,
      ),
    );
  };

  const handleOutputConstraintIssueSave = async (issueKey: string) => {
    const issuesToUpdate = outputConstraintIssueStates.length > 0 ? outputConstraintIssueStates : outputConstraintIssueCards;
    const issue = issuesToUpdate.find((item) => item.issueKey === issueKey);

    if (!issue || issue.isLocked || issue.isSaving) {
      return;
    }

    if (!toNonEmptyString(issue.responseText)) {
      toast({
        title: 'Response required',
        description: 'Add a response before saving this issue.',
        variant: 'destructive',
      });
      return;
    }

    setOutputConstraintIssueStates((current) =>
      (current.length > 0 ? current : outputConstraintIssueCards).map((item) =>
        item.issueKey === issueKey ? { ...item, isLocked: true, isSaving: false } : item,
      ),
    );
  };

  const handleOutputConstraintSubmit = async () => {
    if (!task || !isBlockerSnapshotTask) {
      return;
    }

    if (!allOutputConstraintIssuesLocked) {
      toast({
        title: 'Save all blocked issues',
        description: 'Save every issue response before submitting the reviewer response.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const issuesForSubmit = outputConstraintIssueStates.length > 0 ? outputConstraintIssueStates : outputConstraintIssueCards;
      const payload = buildOutputConstraintSubmitPayload(
        issuesForSubmit,
        toNonEmptyString(task?.marketId),
      );
      if (!payload) {
        toast({
          title: 'No valid issue responses',
          description: 'Each saved issue needs a valid section and response before submitting.',
          variant: 'destructive',
        });
        return;
      }

      const result = await respondMutation.mutateAsync({
        ...(resolvedReviewerId ? { reviewerId: resolvedReviewerId } : {}),
        answer: payload,
      });

      setLastActionResult(result);
      toast({
        title: 'Blocker workflow complete',
        description: `All ${issuesForSubmit.length} blocked issues were submitted together.`,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
      router.replace('/app/reviewer/strategy-reviews');
    } catch (error) {
      toast({
        title: 'Unable to submit blocker workflow',
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

  const handleTriggerCampaign = async (
    trigger: AdminCampaignTriggerType,
    label: string,
    options?: { includeRunIdForPipeline?: boolean },
  ) => {
    if (!task) {
      return;
    }

    try {
      const inputPayload = parseJsonObject(triggerPayloadJson, 'Campaign trigger payload');
      const campaignId = await resolveCampaignIdForAdminTrigger(inputPayload);

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
          ? applyPipelineMarketSelection(
              toPipelineTriggerPayload(inputPayload, {
                marketId: task.marketId ?? undefined,
                audienceId: task.audienceId ?? undefined,
              }),
              pipelineMarketSelection,
              campaignMarketOptions,
              task.marketId ?? undefined,
            )
          : inputPayload;
      if (trigger === 'pipeline' && options?.includeRunIdForPipeline) {
        let latestRunId: string | null = null;
        let latestRunStatus: string | null = null;

        if (isAdmin) {
          const adminCampaignDetail =
            adminCampaignIdForDetail === campaignId
              ? (await adminCampaignDetailQuery.refetch().catch(() => null))?.data ??
                adminCampaignDetailQuery.data ??
                null
              : await adminReviewRepository.getAdminCampaignDetail(campaignId).catch(() => null);

          latestRunId = toNonEmptyString(adminCampaignDetail?.latestRun?.id);
          latestRunStatus = toNonEmptyString(adminCampaignDetail?.latestRun?.status);
        }

        if (!latestRunId) {
          const latestOverviews = await opsV2Repository.listCampaignOverviews().catch(() => null);
          if (!latestOverviews) {
            toast({
              title: 'Unable to verify latest active run',
              description:
                'Run From Last Failure requires the latest active run ID, but campaign overview refresh failed.',
              variant: 'destructive',
            });
            return;
          }

          const latestCampaignOverview = latestOverviews.find((campaign) => campaign.id === campaignId) ?? null;
          latestRunId = toNonEmptyString(latestCampaignOverview?.pipelineRunId);
          latestRunStatus =
            latestRunStatus ??
            toNonEmptyString(latestCampaignOverview?.latestRunStatus);
        }

        if (latestRunId && !latestRunStatus) {
          const aggregate = await opsV2Repository.getRunAggregate(latestRunId).catch(() => null);
          latestRunStatus = toNonEmptyString(aggregate?.status);
        }

        if (
          latestRunId &&
          !latestRunStatus &&
          latestRunId === toNonEmptyString(task.pipelineRunId) &&
          isActivePipelineRunStatus(task.runStatus)
        ) {
          latestRunStatus = toNonEmptyString(task.runStatus);
        }

        if (!latestRunId || !isActivePipelineRunStatus(latestRunStatus)) {
          const statusLabel = latestRunStatus ?? 'UNKNOWN';
          toast({
            title: 'No active run available',
            description: `Latest run is ${statusLabel}. Run From Last Failure only supports latest active runs.`,
            variant: 'destructive',
          });
          return;
        }

        payload.runId = latestRunId;
      }
      if (trigger === 'pipeline') {
        setTriggerPayloadJson(
          toEditableJson(payload, {}),
        );
      }
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

  const handleDownloadAssembledOutput = async () => {
    if (!task) {
      return;
    }

    try {
      const inputPayload = parseJsonObject(triggerPayloadJson, 'Campaign trigger payload');
      const campaignId = await resolveCampaignIdForAdminTrigger(inputPayload);

      if (!campaignId) {
        toast({
          title: 'Campaign ID is missing',
          description:
            'No valid campaign ID found. Add "campaignId" in Campaign Trigger Payload JSON to send this request.',
          variant: 'destructive',
        });
        return;
      }

      if (campaignId === task.id) {
        toast({
          title: 'Campaign ID looks invalid',
          description:
            'Campaign ID matches task ID. Use the real campaign ID in payload field "campaignId".',
          variant: 'destructive',
        });
        return;
      }

      const result = await downloadCampaignOutputMutation.mutateAsync({
        campaignId,
        payload: inputPayload,
      });
      const filename = resolveDownloadFilename(
        result.filename,
        `${campaignId}-output`,
        result.contentType ?? result.blob.type,
      );

      triggerBlobDownload(result.blob, filename);
      setStoredCampaignIdForTask(task.id, campaignId);
      setStoredCampaignId(campaignId);
      setLastActionResult({
        downloaded: true,
        campaignId,
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

  const handleRecreateLatestRun = async () => {
    if (!task) {
      return;
    }

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
          <p className="text-sm text-muted-foreground">
            Structured view for reviewer diagnostics and blocker-response submission.
          </p>
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
        <>
          {isAdmin ? (
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
                    {!isBlockerSnapshotTask ? (
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
                    ) : null}
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
                    <div className="rounded-lg border border-border/70 bg-background/35 p-3">
                      <div className="grid gap-3 md:grid-cols-[minmax(0,260px)_1fr] md:items-end">
                        <div className="space-y-1.5">
                          <Label htmlFor="pipeline-market-target-select">Pipeline Market Target</Label>
                          <Select value={pipelineMarketSelection} onValueChange={setPipelineMarketSelection}>
                            <SelectTrigger id="pipeline-market-target-select">
                              <SelectValue placeholder="Choose market target" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PIPELINE_MARKET_SELECTION_CUSTOM}>
                                Use market from payload JSON
                              </SelectItem>
                              <SelectItem
                                value={PIPELINE_MARKET_SELECTION_TASK}
                                disabled={!toNonEmptyString(task.marketId)}
                              >
                                {toNonEmptyString(task.marketId)
                                  ? `Use task market (${task.marketId})`
                                  : 'Use task market (not available)'}
                              </SelectItem>
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
                          Applied to <span className="font-semibold text-foreground">Run Full Pipeline</span> and
                          <span className="font-semibold text-foreground"> Run From Last Failure</span>. Other trigger
                          buttons ignore this market selector.
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
                        onClick={() => void handleTriggerCampaign('pipeline', 'Run Full Pipeline')}
                        disabled={triggerCampaignMutation.isPending}
                        pending={triggerCampaignMutation.isPending}
                        pendingLabel="Queuing..."
                        icon={<Workflow className="h-4 w-4" />}
                      />
                      <ActionButton
                        label="Run From Last Failure"
                        tooltip="Run pipeline using the campaign's latest active run ID only."
                        tooltipTitle="Pipeline Recovery"
                        badge="Recovery"
                        description="Resume/retrigger pipeline context from latest active run."
                        onClick={() =>
                          void handleTriggerCampaign('pipeline', 'Run From Last Failure', {
                            includeRunIdForPipeline: true,
                          })
                        }
                        disabled={triggerCampaignMutation.isPending}
                        pending={triggerCampaignMutation.isPending}
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

                <div className={cn('grid gap-5', isBlockerSnapshotTask ? 'xl:grid-cols-1' : 'xl:grid-cols-2')}>
                  {!isBlockerSnapshotTask ? (
                    <div className="space-y-3 rounded-xl border border-border bg-background/30 p-4">
                      <div className="space-y-1">
                        <Label htmlFor="admin-blocker-answer-json">Blocker Response Payload</Label>
                        <p className="text-xs text-muted-foreground">
                          Used by Submit Reviewer Response to unblock the run.
                        </p>
                        <Textarea
                          id="admin-blocker-answer-json"
                          value={blockerAnswerJson}
                          onChange={(event) => setBlockerAnswerJson(event.target.value)}
                          rows={11}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-3 rounded-xl border border-border bg-background/30 p-4">
                    <div className="space-y-1">
                      <Label htmlFor="admin-trigger-payload-json">Campaign Trigger Payload</Label>
                      <p className="text-xs text-muted-foreground">
                        Shared payload sent to pipeline trigger operations. Pipeline market selector can override market
                        fields for pipeline actions. Run From Last Failure auto-selects latest active runId.
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

          {isBlockerSnapshotTask ? (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Blocker Snapshot</CardTitle>
                <CardDescription>Only the blocker fields used to review and submit responses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <FieldCard label="section" value={adminSectionSummary} />
                  <FieldCard label="market" value={adminMarketSummary} />
                  <div className="col-span-full space-y-3">
                    <p className="text-sm font-semibold text-foreground">Issues</p>
                    {outputConstraintIssueCards.length > 0 ? (
                      <div className="grid gap-3">
                        {outputConstraintIssueCards.map((issue, index) => (
                          <OutputConstraintIssueCard
                            key={issue.issueKey}
                            issueIndex={index}
                            issue={issue}
                            disabled={respondMutation.isPending}
                            onChange={(responseText) =>
                              handleOutputConstraintIssueResponseChange(issue.issueKey, responseText)
                            }
                            onSave={() => void handleOutputConstraintIssueSave(issue.issueKey)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
                        No blocked issue details available.
                      </div>
                    )}
                    {outputConstraintIssueCards.length > 0 ? (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          onClick={() => void handleOutputConstraintSubmit()}
                          disabled={respondMutation.isPending || !allOutputConstraintIssuesLocked}
                          className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 sm:w-auto"
                        >
                          {respondMutation.isPending ? 'Submitting...' : 'Submit Reviewer Response'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          This sends the saved response values from the issues above to the respond API.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
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
                  <FieldCard label="feedback" value={task.feedback} />
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
        </>
      )}
    </div>
  );
}
