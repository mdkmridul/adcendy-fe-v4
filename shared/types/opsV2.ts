import type { ID, ISODateTime } from './common';
import type { components } from '@/src/generated/openapi';

type UnknownRecord = Record<string, unknown>;

export type CampaignLifecycleStatusV2 =
  | 'WIZARD_DRAFT'
  | 'STRATEGY_GENERATION'
  | 'SUBMITTED_FOR_REVIEW'
  | 'IN_REVIEW'
  | 'GENERATING_DELIVERABLES'
  | 'DELIVERABLE_GENERATION_FAILED'
  | 'ACTIVE'
  | string;

export interface CampaignOverviewV2 {
  id: ID;
  title: string;
  status: CampaignLifecycleStatusV2;
  currentStep: number;
  primaryUrl?: string | null;
  description?: string | null;
  marketLocation?: string | null;
  marketLocations?: string[];
  v2FocusName?: string | null;
  v2IndustryCategory?: string | null;
  v2PrimaryGoal?: string | null;
  v2TargetMarkets?: string[];
  v2PrimaryMarket?: string | null;
  reviewErrorCode?: string | null;
  reviewErrorMessage?: string | null;
  reviewErrorAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  pipelineRunId?: string | null;
  latestRunStatus?: string | null;
}

export interface OpsListFilters {
  status?: string;
  pipelineRunId?: string;
  marketId?: string;
  limit?: number;
  sortBy?: 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewerTaskItem {
  id: ID;
  status: string;
  clientName?: string | null;
  pipelineRunId?: string | null;
  marketId?: string | null;
  campaignId?: string | null;
  campaignTitle?: string | null;
  campaignBusinessName?: string | null;
  campaignStatus?: string | null;
  currentStep?: number | null;
  runStatus?: string | null;
  currentPhase?: string | null;
  sectionId?: string | null;
  renderedQuestion?: string | null;
  createdAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  attemptNumber?: number | null;
  failureMode?: string | null;
  questionPayload?: UnknownRecord | null;
}

export interface ReviewerTaskDetail extends ReviewerTaskItem {
  whatWentWrong?: unknown;
  currentValuesToFix?: unknown;
  exampleAnswerPayload?: unknown;
  feedback?: unknown;
  whereAnswerWillBeApplied?: unknown;
  pipelineRestartPhase?: string | null;
  answerSchema?: UnknownRecord | null;
  resumeStrategy?: unknown;
  questionPayload?: UnknownRecord | null;
  submittedAnswer?: unknown;
  market?: UnknownRecord | null;
  audience?: UnknownRecord | null;
  audienceId?: string | null;
  phaseName?: string | null;
  failureMode?: string | null;
  questionTemplateId?: string | null;
  questionTemplate?: string | null;
  reviewerId?: string | null;
  resumeOutcome?: string | null;
  answeredAt?: ISODateTime | null;
  resumedAt?: ISODateTime | null;
  closedAt?: ISODateTime | null;
}

export type ReviewerTaskRespondPayload =
  components['schemas']['ReviewerTaskRespondV2'];

export interface ReviewerTaskRespondResult {
  resumeOutcome?: string | null;
  resumedPhases?: string[];
  updatedTask?: ReviewerTaskDetail | null;
}

export interface SectionReviewItem {
  id: ID;
  status: string;
  pipelineRunId?: string | null;
  marketId?: string | null;
  campaignId?: string | null;
  campaignTitle?: string | null;
  campaignStatus?: string | null;
  currentStep?: number | null;
  runStatus?: string | null;
  sectionId?: string | null;
  sectionTitle?: string | null;
  revisionCount?: number | null;
  latestRevisionSummary?: string | null;
  createdAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
}

export interface SectionRevisionRequest {
  id: ID;
  instruction: string;
  reviewerNotes?: string | null;
  status?: string | null;
  fixtureKey?: string | null;
  forceMode?: 'live' | 'fixture' | null;
  createdAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
}

export interface SectionReviewApprovalGate {
  selectedSectionCount?: number | null;
  approvedSectionCount?: number | null;
  outputAssemblyBlocked?: boolean | null;
}

export interface SectionReviewDetail extends SectionReviewItem {
  renderedQuestion?: string | null;
  answerSchema?: UnknownRecord | null;
  sectionContent?: unknown;
  generationValidationStatus?: string | null;
  outputConstraintOutcome?: string | null;
  redundancyOutcome?: string | null;
  revisionRequests: SectionRevisionRequest[];
  approvalGate?: SectionReviewApprovalGate | null;
}

export interface SectionReviewWorkspaceSection extends SectionReviewDetail {
  sectionReviewTaskId: ID;
}

export interface SectionReviewWorkspaceDetail {
  runId: string;
  status?: string | null;
  campaignId?: string | null;
  campaignTitle?: string | null;
  campaignStatus?: string | null;
  marketId?: string | null;
  reviewerId?: string | null;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
  startedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  inputs?: unknown;
  sections: SectionReviewWorkspaceSection[];
}

export type SectionReviewApprovePayload =
  components['schemas']['ApproveSectionReviewV2'];

export type SectionReviewRevisionPayload =
  components['schemas']['RequestSectionRevisionV2'];

export type SectionRevisionImpactAnalyzePayload =
  components['schemas']['AnalyzeSectionRevisionImpactV2'];

export type SectionRevisionImpactConfirmPayload =
  components['schemas']['ConfirmSectionRevisionImpactV2'];

export type AdminReviewerAssignmentPayload =
  components['schemas']['AdminReviewerAssignmentV2'];

export type AdminReviewerAssignmentResult =
  components['schemas']['AdminReviewerAssignmentResponseV2'];

export type GenerateDeliverableKitV2Payload =
  components['schemas']['GenerateDeliverableKitV2Request'];

export type QueuedDeliverableKitV2 =
  components['schemas']['QueuedDeliverableKitV2'];

export type AdminCampaignTriggerType =
  | 'pipeline'
  | 'intelligence'
  | 'strategy'
  | 'sections'
  | 'output';

export interface AdminPipelineTriggerBodyV2 extends Record<string, unknown> {
  runId?: unknown;
  marketId?: unknown;
  marketIds?: unknown;
  audienceId?: unknown;
  audienceIds?: unknown;
  fixtureKey?: unknown;
  forceMode?: unknown;
  strategySupportedManifestVersion?: unknown;
}

export interface AdminDownloadResponse {
  blob: Blob;
  filename?: string | null;
  contentType?: string | null;
}

export interface CampaignHealthItem {
  campaignId: string;
  campaignTitle: string;
  campaignStatus?: string | null;
  currentStep?: number | null;
  pipelineRunId?: string | null;
  latestRunStatus?: string | null;
  currentPhase?: string | null;
  stuckState?: string | null;
  stuckPhaseName?: string | null;
  stuckReason?: string | null;
  stuckSince?: ISODateTime | null;
  hasError?: boolean | null;
  errorSource?: string | null;
  errorMessage?: string | null;
  errorAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
}

export interface RunTelemetryEvent {
  id: string;
  runId?: string | null;
  phaseName?: string | null;
  eventType?: string | null;
  status?: string | null;
  message?: string | null;
  createdAt?: ISODateTime | null;
  payload?: UnknownRecord | null;
}

export interface RunTelemetryPhaseRollup {
  phaseName: string;
  status?: string | null;
  attempts?: number | null;
  startedAt?: ISODateTime | null;
  completedAt?: ISODateTime | null;
  durationMs?: number | null;
  errorMessage?: string | null;
}

export interface RunTelemetryAggregate {
  runId: string;
  status?: string | null;
  currentPhase?: string | null;
  startedAt?: ISODateTime | null;
  completedAt?: ISODateTime | null;
  durationMs?: number | null;
  totalPhases?: number | null;
  completedPhases?: number | null;
  failedPhases?: number | null;
  blockedPhases?: number | null;
  summary?: UnknownRecord | null;
}

export interface ReviewerOutcomesSummary {
  approvedCount?: number | null;
  revisionRequestedCount?: number | null;
  pendingCount?: number | null;
  medianTurnaroundMinutes?: number | null;
}

export interface AdminCostsSummary {
  totalCost?: number | null;
  totalTokens?: number | null;
  totalCalls?: number | null;
}

/**
 * Per-campaign provider spend.
 *
 * Measured and estimated cost are separate fields rather than one total on
 * purpose: only DataForSEO and the token-priced LLM calls settle at a figure
 * the provider actually reported, and showing an estimate as a billed amount
 * is how a cost view becomes misleading.
 */
export interface CampaignCostBucket {
  calls?: number | null;
  actualCostUsd?: number | null;
  estimatedCostUsd?: number | null;
  totalCostUsd?: number | null;
}

export interface CampaignCostProviderRow extends CampaignCostBucket {
  provider: string;
}

export interface CampaignCostOperationRow extends CampaignCostBucket {
  provider: string;
  operation: string;
  /** Billable units the provider reported, e.g. FireCrawl credits. */
  unitsConsumed?: { unit: string; quantity: number } | null;
}

export interface CampaignCostRunRow extends CampaignCostBucket {
  pipelineRunId: string;
  status?: string | null;
  createdAt?: string | null;
}

export interface CampaignCostRollup {
  campaignId?: string | null;
  campaignTitle?: string | null;
  runCount?: number | null;
  totals: CampaignCostBucket;
  byProvider: CampaignCostProviderRow[];
  byOperation: CampaignCostOperationRow[];
  byRun: CampaignCostRunRow[];
  collectedDataReuse: {
    observationsCollected?: number | null;
    timesServedToLaterRuns?: number | null;
    note?: string | null;
  };
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return asString(value);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  return undefined;
}

function fallbackNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const result = asNumber(value);
    if (typeof result === 'number') {
      return result;
    }
  }

  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return undefined;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function fallbackString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const result = asString(value);
    if (result) {
      return result;
    }
  }

  return undefined;
}

function fallbackNullableString(...values: unknown[]): string | null | undefined {
  for (const value of values) {
    if (value === null) {
      return null;
    }

    const result = asString(value);
    if (result) {
      return result;
    }
  }

  return undefined;
}

function hasMeaningfulUnknownValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return true;
}

function fallbackUnknown(...values: unknown[]): unknown {
  for (const value of values) {
    if (hasMeaningfulUnknownValue(value)) {
      return value;
    }
  }

  return null;
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        const record = asRecord(item);
        return fallbackString(record?.value, record?.label, record?.name, record?.title) ?? '';
      })
      .filter((item) => item.length > 0);
  }

  const single = asString(value);
  if (!single) {
    return [];
  }

  return single
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function pickItemsArray(payload: unknown, fallbackKeyCandidates: string[] = []): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  if (!record) {
    return [];
  }

  const firstMatch = ['items', 'data', ...fallbackKeyCandidates]
    .map((key) => record[key])
    .find((value) => Array.isArray(value));

  if (Array.isArray(firstMatch)) {
    return firstMatch;
  }

  if (record.data && record.data !== payload) {
    return pickItemsArray(record.data, fallbackKeyCandidates);
  }

  return [];
}

export function formatCampaignLifecycleStatus(status?: string | null) {
  const normalized = (status ?? '').trim().toUpperCase();

  if (normalized === 'WIZARD_DRAFT') {
    return 'Draft';
  }

  if (normalized === 'STRATEGY_GENERATION') {
    return 'Generating Strategy';
  }

  if (normalized === 'SUBMITTED_FOR_REVIEW') {
    return 'Submitted for Review';
  }

  if (normalized === 'GENERATING_DELIVERABLES') {
    return 'Preparing Files';
  }

  if (normalized === 'DELIVERABLE_GENERATION_FAILED') {
    return 'File Generation Failed';
  }

  if (!normalized) {
    return 'Unknown';
  }

  return normalized
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeCampaignOverview(value: unknown): CampaignOverviewV2 | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = fallbackString(record.id, record.campaignId, record.campaign_id);
  if (!id) {
    return null;
  }

  const marketLocations = normalizeStringArray(record.marketLocations ?? record.market_locations);
  const marketLocation =
    fallbackNullableString(record.marketLocation, record.market_location) ??
    marketLocations[0] ??
    null;

  return {
    id,
    title: fallbackString(record.title, record.name, record.campaignTitle, record.campaign_title) ?? id,
    status:
      fallbackString(record.status, record.campaignStatus, record.campaign_status) ??
      'WIZARD_DRAFT',
    currentStep: fallbackNumber(record.currentStep, record.current_step, record.lastCompletedStep) ?? 0,
    primaryUrl: fallbackNullableString(record.primaryUrl, record.primary_url, record.websiteUrl, record.website_url) ?? null,
    description: fallbackNullableString(record.description) ?? null,
    marketLocation,
    marketLocations,
    v2FocusName: fallbackNullableString(record.v2FocusName, record.v2_focus_name, record.focusName, record.focus_name) ?? null,
    v2IndustryCategory:
      fallbackNullableString(record.v2IndustryCategory, record.v2_industry_category, record.industryCategory, record.industry_category) ?? null,
    v2PrimaryGoal:
      fallbackNullableString(record.v2PrimaryGoal, record.v2_primary_goal, record.primaryGoal, record.primary_goal) ?? null,
    v2TargetMarkets: normalizeStringArray(
      record.v2TargetMarkets ?? record.v2_target_markets ?? record.targetMarkets ?? record.target_markets,
    ),
    v2PrimaryMarket:
      fallbackNullableString(record.v2PrimaryMarket, record.v2_primary_market, record.primaryMarket, record.primary_market) ?? null,
    reviewErrorCode: fallbackNullableString(record.reviewErrorCode, record.review_error_code) ?? null,
    reviewErrorMessage: fallbackNullableString(record.reviewErrorMessage, record.review_error_message) ?? null,
    reviewErrorAt: fallbackNullableString(record.reviewErrorAt, record.review_error_at) ?? null,
    updatedAt: fallbackNullableString(record.updatedAt, record.updated_at) ?? null,
    pipelineRunId: fallbackNullableString(record.pipelineRunId, record.pipeline_run_id, record.latestRunId, record.latest_run_id) ?? null,
    latestRunStatus: fallbackNullableString(record.latestRunStatus, record.latest_run_status) ?? null,
  };
}

export function normalizeCampaignOverviewList(payload: unknown): CampaignOverviewV2[] {
  return pickItemsArray(payload, ['campaigns'])
    .map(normalizeCampaignOverview)
    .filter((item): item is CampaignOverviewV2 => Boolean(item));
}

export function normalizeReviewerTaskItem(value: unknown): ReviewerTaskItem | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const campaign = asRecord(record.campaign);
  const run = asRecord(record.run);
  const runCampaign = asRecord(run?.campaign);
  const questionPayload = asRecord(record.questionPayload ?? record.question_payload);
  const questionCampaign = asRecord(questionPayload?.campaign);

  const id = fallbackString(record.id, record.taskId, record.task_id);
  if (!id) {
    return null;
  }

  const marketId =
    fallbackNullableString(record.marketId, record.market_id, record.marketCode, record.market_code) ?? null;
  const campaignId =
    fallbackNullableString(
      record.campaignId,
      record.campaign_id,
      campaign?.id,
      campaign?.campaignId,
      campaign?.campaign_id,
      record.campaign,
      run?.campaignId,
      run?.campaign_id,
      runCampaign?.id,
      runCampaign?.campaignId,
      runCampaign?.campaign_id,
      questionPayload?.campaignId,
      questionPayload?.campaign_id,
      questionCampaign?.id,
      questionCampaign?.campaignId,
      questionCampaign?.campaign_id,
    ) ?? null;
  const campaignTitle =
    fallbackNullableString(
      record.campaignTitle,
      record.campaign_title,
      campaign?.title,
      campaign?.name,
      questionPayload?.clientName,
      questionPayload?.client_name,
    ) ?? null;
  const campaignBusinessName =
    fallbackNullableString(
      campaign?.businessName,
      campaign?.business_name,
      questionCampaign?.businessName,
      questionCampaign?.business_name,
      record.businessName,
      record.business_name,
      questionPayload?.businessName,
      questionPayload?.business_name,
      questionPayload?.clientName,
      questionPayload?.client_name,
    ) ?? null;
  const sectionId =
    fallbackNullableString(
      record.sectionId,
      record.section_id,
      record.sectoinId,
      record.sectoin_id,
      questionPayload?.sectionId,
      questionPayload?.section_id,
      questionPayload?.sectoinId,
      questionPayload?.sectoin_id,
    ) ?? null;

  return {
    id,
    status: fallbackString(record.status, record.taskStatus, record.task_status) ?? 'PENDING',
    clientName:
      fallbackNullableString(questionPayload?.clientName, questionPayload?.client_name) ?? null,
    pipelineRunId:
      fallbackNullableString(record.pipelineRunId, record.pipeline_run_id, run?.id, run?.runId) ??
      null,
    marketId,
    campaignId,
    campaignTitle,
    campaignBusinessName,
    campaignStatus:
      fallbackNullableString(record.campaignStatus, record.campaign_status, campaign?.status) ?? null,
    currentStep: fallbackNumber(record.currentStep, record.current_step, campaign?.currentStep) ?? null,
    runStatus:
      fallbackNullableString(
        record.runStatus,
        record.run_status,
        record.pipelineRunStatus,
        record.pipeline_run_status,
        run?.status,
      ) ?? null,
    currentPhase:
      fallbackNullableString(
        record.currentPhase,
        record.current_phase,
        record.pipelineRunCurrentPhase,
        record.pipeline_run_current_phase,
        record.phaseName,
        record.phase_name,
        run?.currentPhase,
        run?.phase,
      ) ?? null,
    sectionId,
    renderedQuestion:
      fallbackNullableString(record.renderedQuestion, record.rendered_question, record.question) ?? null,
    createdAt: fallbackNullableString(record.createdAt, record.created_at) ?? null,
    updatedAt:
      fallbackNullableString(
        record.updatedAt,
        record.updated_at,
        record.answeredAt,
        record.answered_at,
        record.resumedAt,
        record.resumed_at,
        record.closedAt,
        record.closed_at,
        record.createdAt,
        record.created_at,
      ) ?? null,
    attemptNumber: fallbackNumber(record.attemptNumber, record.attempt_number) ?? null,
    failureMode:
      fallbackNullableString(
        record.failureMode,
        record.failure_mode,
        questionPayload?.failureMode,
        questionPayload?.failure_mode,
      ) ?? null,
    questionPayload: questionPayload ?? null,
  };
}

export function normalizeReviewerTaskList(payload: unknown): ReviewerTaskItem[] {
  return pickItemsArray(payload, ['tasks', 'reviewerTasks'])
    .map(normalizeReviewerTaskItem)
    .filter((item): item is ReviewerTaskItem => Boolean(item));
}

export function normalizeReviewerTaskDetail(payload: unknown): ReviewerTaskDetail {
  const record = asRecord(payload) ?? {};
  const questionPayload = asRecord(record.questionPayload ?? record.question_payload);
  const answerSchemaRecord = asRecord(record.answerSchema ?? record.answer_schema);
  const lowConfidenceDimensionsRaw =
    fallbackNullableString(
      questionPayload?.lowConfidenceDimensions,
      questionPayload?.low_confidence_dimensions,
      record.lowConfidenceDimensions,
      record.low_confidence_dimensions,
    ) ?? '';
  const lowConfidenceDimensions = normalizeStringArray(lowConfidenceDimensionsRaw);
  const failureMode =
    fallbackNullableString(
      record.failureMode,
      record.failure_mode,
      questionPayload?.failureMode,
      questionPayload?.failure_mode,
    ) ?? null;
  const currentPhase =
    fallbackNullableString(
      record.phaseName,
      record.phase_name,
      record.pipelineRunCurrentPhase,
      record.pipeline_run_current_phase,
      record.currentPhase,
      record.current_phase,
    ) ?? null;

  const derivedCurrentValuesToFix =
    lowConfidenceDimensions.length > 0
      ? { lowConfidenceDimensions }
      : null;

  let derivedExampleAnswerPayload: unknown = null;
  const requiredFields = Array.isArray(answerSchemaRecord?.required)
    ? (answerSchemaRecord?.required as unknown[]).filter((value): value is string => typeof value === 'string')
    : [];
  if (requiredFields.length > 0) {
    const firstRequiredKey = requiredFields[0];
    if (firstRequiredKey === 'confirmedTaxonomyValues' && lowConfidenceDimensions.length > 0) {
      const confirmed: Record<string, string> = {};
      for (const dimension of lowConfidenceDimensions) {
        confirmed[dimension] = '<confirm_value>';
      }
      derivedExampleAnswerPayload = {
        confirmedTaxonomyValues: confirmed,
      };
    } else {
      const fallbackObject: Record<string, string> = {};
      for (const key of requiredFields) {
        fallbackObject[key] = '<provide_value>';
      }
      derivedExampleAnswerPayload = fallbackObject;
    }
  }

  const derivedWhereAnswerWillBeApplied = [currentPhase].filter(Boolean);
  const derivedWhatWentWrong =
    fallbackNullableString(record.renderedQuestion, record.rendered_question) ??
    (failureMode ? `Failure mode: ${failureMode}` : null);

  const base = normalizeReviewerTaskItem(record) ?? {
    id: fallbackString(record.id, record.taskId, record.task_id) ?? 'unknown-task',
    status: fallbackString(record.status) ?? 'UNKNOWN',
  };

  return {
    ...base,
    whatWentWrong: fallbackUnknown(
      record.whatWentWrong,
      record.what_went_wrong,
      questionPayload?.whatWentWrong,
      questionPayload?.what_went_wrong,
      derivedWhatWentWrong,
    ),
    currentValuesToFix: fallbackUnknown(
      record.currentValuesToFix,
      record.current_values_to_fix,
      questionPayload?.currentValuesToFix,
      questionPayload?.current_values_to_fix,
      derivedCurrentValuesToFix,
    ),
    exampleAnswerPayload: fallbackUnknown(
      record.exampleAnswerPayload,
      record.example_answer_payload,
      questionPayload?.exampleAnswerPayload,
      questionPayload?.example_answer_payload,
      derivedExampleAnswerPayload,
    ),
    feedback: fallbackUnknown(
      record.feedback,
      record.feedbackPayload,
      record.feedback_payload,
      questionPayload?.feedback,
      questionPayload?.feedbackPayload,
      questionPayload?.feedback_payload,
      record.narrativeValidation,
      record.narrative_validation,
      questionPayload?.narrativeValidation,
      questionPayload?.narrative_validation,
    ),
    whereAnswerWillBeApplied: fallbackUnknown(
      record.whereAnswerWillBeApplied,
      record.where_answer_will_be_applied,
      questionPayload?.whereAnswerWillBeApplied,
      questionPayload?.where_answer_will_be_applied,
      derivedWhereAnswerWillBeApplied,
    ),
    pipelineRestartPhase:
      fallbackNullableString(
        record.pipelineRestartPhase,
        record.pipeline_restart_phase,
        questionPayload?.pipelineRestartPhase,
        questionPayload?.pipeline_restart_phase,
        record.phaseName,
        record.phase_name,
        record.pipelineRunCurrentPhase,
        record.pipeline_run_current_phase,
      ) ?? null,
    answerSchema: answerSchemaRecord ?? null,
    resumeStrategy: record.resumeStrategy ?? record.resume_strategy ?? null,
    questionPayload,
    submittedAnswer: record.submittedAnswer ?? record.submitted_answer ?? null,
    market: asRecord(record.market) ?? null,
    audience: asRecord(record.audience) ?? null,
    audienceId: fallbackNullableString(record.audienceId, record.audience_id) ?? null,
    phaseName: currentPhase,
    failureMode,
    questionTemplateId:
      fallbackNullableString(record.questionTemplateId, record.question_template_id) ?? null,
    questionTemplate: fallbackNullableString(record.questionTemplate, record.question_template) ?? null,
    reviewerId: fallbackNullableString(record.reviewerId, record.reviewer_id) ?? null,
    resumeOutcome: fallbackNullableString(record.resumeOutcome, record.resume_outcome) ?? null,
    answeredAt: fallbackNullableString(record.answeredAt, record.answered_at) ?? null,
    resumedAt: fallbackNullableString(record.resumedAt, record.resumed_at) ?? null,
    closedAt: fallbackNullableString(record.closedAt, record.closed_at) ?? null,
    clientName:
      fallbackNullableString(
        record.clientName,
        record.client_name,
        questionPayload?.clientName,
        questionPayload?.client_name,
        base.clientName,
      ) ?? null,
  };
}

export function normalizeReviewerTaskRespondResult(payload: unknown): ReviewerTaskRespondResult {
  const record = asRecord(payload) ?? {};
  const updatedTaskRecord = record.updatedTask ?? record.updated_task ?? record.task;
  return {
    resumeOutcome: fallbackNullableString(record.resumeOutcome, record.resume_outcome) ?? null,
    resumedPhases: normalizeStringArray(record.resumedPhases ?? record.resumed_phases),
    updatedTask: updatedTaskRecord ? normalizeReviewerTaskDetail(updatedTaskRecord) : null,
  };
}

export function normalizeSectionReviewItem(value: unknown): SectionReviewItem | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const campaign = asRecord(record.campaign);
  const run = asRecord(record.run);

  const id = fallbackString(
    record.id,
    record.sectionReviewTaskId,
    record.section_review_task_id,
    record.taskId,
    record.task_id,
  );
  if (!id) {
    return null;
  }

  const latestRevisionRequest =
    asRecord(record.latestRevisionRequest) ??
    asRecord(record.latest_revision_request) ??
    asRecord(record.lastRevisionRequest);

  return {
    id,
    status: fallbackString(record.status, record.reviewStatus, record.review_status) ?? 'PENDING',
    pipelineRunId:
      fallbackNullableString(record.pipelineRunId, record.pipeline_run_id, run?.id, run?.runId) ??
      null,
    marketId: fallbackNullableString(record.marketId, record.market_id) ?? null,
    campaignId: fallbackNullableString(record.campaignId, record.campaign_id, campaign?.id) ?? null,
    campaignTitle:
      fallbackNullableString(record.campaignTitle, record.campaign_title, campaign?.title, campaign?.name) ?? null,
    campaignStatus:
      fallbackNullableString(record.campaignStatus, record.campaign_status, campaign?.status) ?? null,
    currentStep: fallbackNumber(record.currentStep, record.current_step, campaign?.currentStep) ?? null,
    runStatus: fallbackNullableString(record.runStatus, record.run_status, run?.status) ?? null,
    sectionId:
      fallbackNullableString(record.sectionId, record.section_id, record.callType, record.call_type) ?? null,
    sectionTitle:
      fallbackNullableString(record.sectionTitle, record.section_title, record.title, record.label) ??
      null,
    revisionCount: fallbackNumber(record.revisionCount, record.revision_count) ?? null,
    latestRevisionSummary:
      fallbackNullableString(
        record.latestRevisionSummary,
        record.latest_revision_summary,
        latestRevisionRequest?.instruction,
      ) ?? null,
    createdAt: fallbackNullableString(record.createdAt, record.created_at) ?? null,
    updatedAt: fallbackNullableString(record.updatedAt, record.updated_at) ?? null,
  };
}

export function normalizeSectionReviewList(payload: unknown): SectionReviewItem[] {
  return pickItemsArray(payload, ['tasks', 'sectionReviews', 'sectionReviewTasks'])
    .map(normalizeSectionReviewItem)
    .filter((item): item is SectionReviewItem => Boolean(item));
}

export function normalizeSectionRevisionRequest(value: unknown): SectionRevisionRequest | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = fallbackString(record.id, record.requestId, record.request_id);
  const instruction = fallbackString(record.instruction, record.requestedInstruction, record.requested_instruction);

  if (!id || !instruction) {
    return null;
  }

  return {
    id,
    instruction,
    reviewerNotes: fallbackNullableString(record.reviewerNotes, record.reviewer_notes) ?? null,
    status: fallbackNullableString(record.status) ?? null,
    fixtureKey: fallbackNullableString(record.fixtureKey, record.fixture_key) ?? null,
    forceMode:
      (fallbackNullableString(record.forceMode, record.force_mode) as 'live' | 'fixture' | null | undefined) ??
      null,
    createdAt: fallbackNullableString(record.createdAt, record.created_at) ?? null,
    updatedAt: fallbackNullableString(record.updatedAt, record.updated_at) ?? null,
  };
}

export function normalizeSectionReviewDetail(payload: unknown): SectionReviewDetail {
  const record = asRecord(payload) ?? {};
  const base = normalizeSectionReviewItem(record) ?? {
    id:
      fallbackString(record.id, record.sectionReviewTaskId, record.section_review_task_id) ??
      'unknown-section-review',
    status: fallbackString(record.status) ?? 'UNKNOWN',
  };

  const approvalGateRecord =
    asRecord(record.approvalGate) ??
    asRecord(record.approval_gate) ??
    asRecord(record.gate);

  return {
    ...base,
    renderedQuestion:
      fallbackNullableString(record.renderedQuestion, record.rendered_question, record.question) ?? null,
    answerSchema: asRecord(record.answerSchema ?? record.answer_schema) ?? null,
    sectionContent:
      record.sectionContent ??
      record.section_content ??
      record.generatedContent ??
      record.generated_content ??
      record.content ??
      null,
    generationValidationStatus:
      fallbackNullableString(record.generationValidationStatus, record.generation_validation_status) ?? null,
    outputConstraintOutcome:
      fallbackNullableString(record.outputConstraint, record.output_constraint, record.outputConstraintOutcome, record.output_constraint_outcome) ?? null,
    redundancyOutcome:
      fallbackNullableString(record.redundancyOutcome, record.redundancy_outcome) ?? null,
    revisionRequests: asArray(record.revisionRequests ?? record.revision_requests ?? record.revisions)
      .map(normalizeSectionRevisionRequest)
      .filter((item): item is SectionRevisionRequest => Boolean(item)),
    approvalGate: approvalGateRecord
      ? {
          selectedSectionCount:
            fallbackNumber(approvalGateRecord.selectedSectionCount, approvalGateRecord.selected_section_count) ??
            null,
          approvedSectionCount:
            fallbackNumber(approvalGateRecord.approvedSectionCount, approvalGateRecord.approved_section_count) ??
            null,
          outputAssemblyBlocked:
            asBoolean(approvalGateRecord.outputAssemblyBlocked ?? approvalGateRecord.output_assembly_blocked) ??
            null,
        }
      : null,
  };
}

export function normalizeSectionReviewWorkspaceSection(
  value: unknown,
): SectionReviewWorkspaceSection | null {
  const detail = normalizeSectionReviewDetail(value);
  const record = asRecord(value);
  const sectionReviewTaskId =
    fallbackString(
      record?.sectionReviewTaskId,
      record?.section_review_task_id,
      record?.taskId,
      record?.task_id,
      detail.id,
    ) ?? detail.id;

  if (!sectionReviewTaskId) {
    return null;
  }

  return {
    ...detail,
    id: sectionReviewTaskId,
    sectionReviewTaskId,
  };
}

export function normalizeSectionReviewWorkspaceDetail(
  payload: unknown,
  fallbackRunId = '',
): SectionReviewWorkspaceDetail {
  const record = asRecord(payload) ?? {};
  const run = asRecord(record.run);
  const campaign = asRecord(record.campaign);
  const assignedReviewer =
    asRecord(record.assignedReviewer) ??
    asRecord(record.assigned_reviewer) ??
    asRecord(record.reviewer);

  const sectionItems = pickItemsArray(
    record.sections ??
      record.sectionReviews ??
      record.section_reviews ??
      record.sectionReviewTasks ??
      record.section_review_tasks ??
      record.tasks ??
      record,
    ['sections', 'sectionReviews', 'section_reviews', 'sectionReviewTasks', 'section_review_tasks', 'tasks'],
  )
    .map(normalizeSectionReviewWorkspaceSection)
    .filter((item): item is SectionReviewWorkspaceSection => Boolean(item));

  return {
    runId: fallbackString(record.runId, record.run_id, run?.id, run?.runId) ?? fallbackRunId,
    status: fallbackNullableString(record.status, record.reviewStatus, record.review_status) ?? null,
    campaignId:
      fallbackNullableString(record.campaignId, record.campaign_id, campaign?.id) ?? null,
    campaignTitle:
      fallbackNullableString(record.campaignTitle, record.campaign_title, campaign?.title, campaign?.name) ??
      null,
    campaignStatus:
      fallbackNullableString(record.campaignStatus, record.campaign_status, campaign?.status) ?? null,
    marketId: fallbackNullableString(record.marketId, record.market_id) ?? null,
    reviewerId:
      fallbackNullableString(record.reviewerId, record.reviewer_id, assignedReviewer?.id) ?? null,
    reviewerName:
      fallbackNullableString(
        record.reviewerName,
        record.reviewer_name,
        assignedReviewer?.displayName,
        assignedReviewer?.display_name,
        assignedReviewer?.name,
      ) ?? null,
    reviewerEmail:
      fallbackNullableString(record.reviewerEmail, record.reviewer_email, assignedReviewer?.email) ?? null,
    startedAt: fallbackNullableString(record.startedAt, record.started_at) ?? null,
    updatedAt:
      fallbackNullableString(record.updatedAt, record.updated_at, run?.updatedAt, run?.updated_at) ?? null,
    inputs: fallbackUnknown(
      record.inputs,
      record.workspaceInputs,
      record.workspace_inputs,
      record.submittedInputs,
      record.submitted_inputs,
      record.inputSnapshot,
      record.input_snapshot,
    ),
    sections: sectionItems,
  };
}

export function normalizeCampaignHealthItem(value: unknown): CampaignHealthItem | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const campaignId = fallbackString(record.campaignId, record.campaign_id, record.id);
  if (!campaignId) {
    return null;
  }

  return {
    campaignId,
    campaignTitle:
      fallbackString(record.campaignTitle, record.campaign_title, record.title, record.name) ?? campaignId,
    campaignStatus: fallbackNullableString(record.campaignStatus, record.campaign_status, record.status) ?? null,
    currentStep: fallbackNumber(record.currentStep, record.current_step) ?? null,
    pipelineRunId:
      fallbackNullableString(record.pipelineRunId, record.pipeline_run_id, record.latestRunId, record.latest_run_id) ??
      null,
    latestRunStatus:
      fallbackNullableString(record.latestRunStatus, record.latest_run_status, record.runStatus, record.run_status) ??
      null,
    currentPhase: fallbackNullableString(record.currentPhase, record.current_phase) ?? null,
    stuckState: fallbackNullableString(record.stuckState, record.stuck_state) ?? null,
    stuckPhaseName: fallbackNullableString(record.stuckPhaseName, record.stuck_phase_name) ?? null,
    stuckReason: fallbackNullableString(record.stuckReason, record.stuck_reason) ?? null,
    stuckSince: fallbackNullableString(record.stuckSince, record.stuck_since) ?? null,
    hasError: asBoolean(record.hasError ?? record.has_error) ?? null,
    errorSource: fallbackNullableString(record.errorSource, record.error_source) ?? null,
    errorMessage: fallbackNullableString(record.errorMessage, record.error_message) ?? null,
    errorAt: fallbackNullableString(record.errorAt, record.error_at) ?? null,
    updatedAt: fallbackNullableString(record.updatedAt, record.updated_at) ?? null,
  };
}

export function normalizeCampaignHealthList(payload: unknown): CampaignHealthItem[] {
  return pickItemsArray(payload, ['campaigns', 'health'])
    .map(normalizeCampaignHealthItem)
    .filter((item): item is CampaignHealthItem => Boolean(item));
}

export function normalizeRunTelemetryEvent(value: unknown): RunTelemetryEvent | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = fallbackString(record.id, record.eventId, record.event_id);
  if (!id) {
    return null;
  }

  return {
    id,
    runId: fallbackNullableString(record.runId, record.run_id) ?? null,
    phaseName: fallbackNullableString(record.phaseName, record.phase_name) ?? null,
    eventType: fallbackNullableString(record.eventType, record.event_type, record.type) ?? null,
    status: fallbackNullableString(record.status) ?? null,
    message: fallbackNullableString(record.message, record.summary) ?? null,
    createdAt: fallbackNullableString(record.createdAt, record.created_at, record.timestamp) ?? null,
    payload: asRecord(record.payload ?? record.meta ?? record.data) ?? null,
  };
}

export function normalizeRunTelemetryEvents(payload: unknown): RunTelemetryEvent[] {
  return pickItemsArray(payload, ['events'])
    .map(normalizeRunTelemetryEvent)
    .filter((item): item is RunTelemetryEvent => Boolean(item));
}

export function normalizeRunTelemetryPhaseRollup(value: unknown): RunTelemetryPhaseRollup | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const phaseName = fallbackString(record.phaseName, record.phase_name, record.phase);
  if (!phaseName) {
    return null;
  }

  return {
    phaseName,
    status: fallbackNullableString(record.status) ?? null,
    attempts: fallbackNumber(record.attempts, record.retryCount, record.retry_count) ?? null,
    startedAt: fallbackNullableString(record.startedAt, record.started_at) ?? null,
    completedAt: fallbackNullableString(record.completedAt, record.completed_at, record.endedAt, record.ended_at) ?? null,
    durationMs: fallbackNumber(record.durationMs, record.duration_ms) ?? null,
    errorMessage: fallbackNullableString(record.errorMessage, record.error_message) ?? null,
  };
}

export function normalizeRunTelemetryPhaseRollups(payload: unknown): RunTelemetryPhaseRollup[] {
  return pickItemsArray(payload, ['phases', 'rollups'])
    .map(normalizeRunTelemetryPhaseRollup)
    .filter((item): item is RunTelemetryPhaseRollup => Boolean(item));
}

export function normalizeRunTelemetryAggregate(payload: unknown, fallbackRunId = ''): RunTelemetryAggregate {
  const record = asRecord(payload) ?? {};
  return {
    runId: fallbackString(record.runId, record.run_id, record.id) ?? fallbackRunId,
    status: fallbackNullableString(record.status) ?? null,
    currentPhase: fallbackNullableString(record.currentPhase, record.current_phase) ?? null,
    startedAt: fallbackNullableString(record.startedAt, record.started_at) ?? null,
    completedAt: fallbackNullableString(record.completedAt, record.completed_at, record.finishedAt, record.finished_at) ?? null,
    durationMs: fallbackNumber(record.durationMs, record.duration_ms) ?? null,
    totalPhases: fallbackNumber(record.totalPhases, record.total_phases) ?? null,
    completedPhases: fallbackNumber(record.completedPhases, record.completed_phases) ?? null,
    failedPhases: fallbackNumber(record.failedPhases, record.failed_phases) ?? null,
    blockedPhases: fallbackNumber(record.blockedPhases, record.blocked_phases) ?? null,
    summary: asRecord(record.summary ?? record.meta) ?? null,
  };
}

export function normalizeReviewerOutcomesSummary(payload: unknown): ReviewerOutcomesSummary {
  const record = asRecord(payload) ?? {};

  return {
    approvedCount: fallbackNumber(record.approvedCount, record.approved_count, record.approvals) ?? null,
    revisionRequestedCount:
      fallbackNumber(record.revisionRequestedCount, record.revision_requested_count, record.revisionsRequested) ??
      null,
    pendingCount: fallbackNumber(record.pendingCount, record.pending_count) ?? null,
    medianTurnaroundMinutes:
      fallbackNumber(record.medianTurnaroundMinutes, record.median_turnaround_minutes) ?? null,
  };
}

function normalizeCampaignCostBucket(record: UnknownRecord): CampaignCostBucket {
  return {
    calls: fallbackNumber(record.calls) ?? null,
    actualCostUsd: fallbackNumber(record.actual_cost_usd, record.actualCostUsd) ?? null,
    estimatedCostUsd:
      fallbackNumber(record.estimated_cost_usd, record.estimatedCostUsd) ?? null,
    totalCostUsd: fallbackNumber(record.total_cost_usd, record.totalCostUsd) ?? null,
  };
}

export function normalizeCampaignCostRollup(payload: unknown): CampaignCostRollup {
  const record = asRecord(payload) ?? {};
  const campaign = asRecord(record.campaign) ?? {};
  const reuse = asRecord(record.collected_data_reuse ?? record.collectedDataReuse) ?? {};

  return {
    campaignId: fallbackNullableString(campaign.id) ?? null,
    campaignTitle: fallbackNullableString(campaign.title) ?? null,
    runCount: fallbackNumber(record.run_count, record.runCount) ?? null,
    totals: normalizeCampaignCostBucket(asRecord(record.totals) ?? {}),
    byProvider: asArray(record.by_provider ?? record.byProvider)
      .map((entry) => asRecord(entry))
      .filter((entry): entry is UnknownRecord => Boolean(entry))
      .map((entry) => ({
        provider: fallbackString(entry.provider) ?? 'unknown',
        ...normalizeCampaignCostBucket(entry),
      })),
    byOperation: asArray(record.by_operation ?? record.byOperation)
      .map((entry) => asRecord(entry))
      .filter((entry): entry is UnknownRecord => Boolean(entry))
      .map((entry) => {
        const units = asRecord(entry.units_consumed ?? entry.unitsConsumed);
        const unit = units ? fallbackString(units.unit) : undefined;
        const quantity = units ? fallbackNumber(units.quantity) : undefined;
        return {
          provider: fallbackString(entry.provider) ?? 'unknown',
          operation: fallbackString(entry.operation) ?? 'unknown',
          ...normalizeCampaignCostBucket(entry),
          // Units are only meaningful as a pair; a unit with no quantity, or a
          // quantity with no unit, is not a measurement.
          unitsConsumed:
            unit && quantity !== undefined ? { unit, quantity } : null,
        };
      }),
    byRun: asArray(record.by_run ?? record.byRun)
      .map((entry) => asRecord(entry))
      .filter((entry): entry is UnknownRecord => Boolean(entry))
      .map((entry) => ({
        pipelineRunId:
          fallbackString(entry.pipeline_run_id, entry.pipelineRunId) ?? 'unknown',
        status: fallbackNullableString(entry.status) ?? null,
        createdAt: fallbackNullableString(entry.created_at, entry.createdAt) ?? null,
        ...normalizeCampaignCostBucket(entry),
      })),
    collectedDataReuse: {
      observationsCollected:
        fallbackNumber(reuse.observations_collected, reuse.observationsCollected) ?? null,
      timesServedToLaterRuns:
        fallbackNumber(reuse.times_served_to_later_runs, reuse.timesServedToLaterRuns) ??
        null,
      note: fallbackNullableString(reuse.note) ?? null,
    },
  };
}

export function normalizeAdminCostsSummary(payload: unknown): AdminCostsSummary {
  const record = asRecord(payload) ?? {};

  return {
    totalCost: fallbackNumber(record.totalCost, record.total_cost, record.cost) ?? null,
    totalTokens: fallbackNumber(record.totalTokens, record.total_tokens) ?? null,
    totalCalls: fallbackNumber(record.totalCalls, record.total_calls, record.calls) ?? null,
  };
}
