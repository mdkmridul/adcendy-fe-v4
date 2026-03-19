import type { ID, ISODateTime, Role } from './common';

type UnknownRecord = Record<string, unknown>;

export type StrategyReviewStatus =
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | string;

export type StrategySectionDecision =
  | 'APPROVED'
  | 'REQUEST_CHANGES'
  | 'PENDING'
  | string;

export interface ReviewAssignee {
  id?: ID | null;
  email?: string | null;
  displayName?: string | null;
  role?: Role | string | null;
}

export interface StrategyReviewInboxItem {
  id?: ID | null;
  campaignId: ID;
  campaignTitle: string;
  status: StrategyReviewStatus;
  createdAt?: ISODateTime | null;
  requestedChangesNote?: string | null;
  approvedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  assignedReviewer?: ReviewAssignee | null;
}

export interface StrategyReviewDeliverable {
  key: string;
  label: string;
  status: string;
  updatedAt?: ISODateTime | null;
}

export interface StrategyReviewSection {
  callType: string;
  title?: string | null;
  content: unknown;
  status?: string | null;
  note?: string | null;
  decision?: StrategySectionDecision | null;
  updatedAt?: ISODateTime | null;
  deliverableKey?: string | null;
}

export interface StrategyReviewDetail {
  id?: ID | null;
  campaignId: ID;
  campaignTitle?: string | null;
  status: StrategyReviewStatus;
  assignedReviewer?: ReviewAssignee | null;
  requestedChangesNote?: string | null;
  summaryNote?: string | null;
  approvedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  deliverables: StrategyReviewDeliverable[];
  sections: StrategyReviewSection[];
}

export interface CreateReviewerPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface UpdateStrategyReviewSectionPayload {
  decision: 'APPROVED' | 'REQUEST_CHANGES';
  note?: string;
}

export interface FinalizeStrategyReviewPayload {
  action: 'APPROVE' | 'REQUEST_CHANGES';
  summaryNote?: string;
  requestedChangesNote?: string;
}

export interface AdminReviewerUser {
  id: ID;
  email: string;
  displayName?: string | null;
  role: Role | string;
  status: string;
  createdAt: ISODateTime;
  lastLoginAt?: ISODateTime | null;
}

export interface AdminJobRunSummary {
  id: ID;
  jobName: string;
  queueName: string;
  status: string;
  attemptsMade: number;
  lastErrorMessage?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  logsCount: number;
}

export interface AdminAiCallSummary {
  id: ID;
  requestId?: string | null;
  provider?: string | null;
  operation: string;
  model: string;
  status: string;
  totalTokens?: number | null;
  cost?: number | null;
  startedAt: ISODateTime;
  finishedAt?: ISODateTime | null;
  errorMessage?: string | null;
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
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

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function fallbackString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const match = asString(value);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function fallbackNullableString(...values: unknown[]): string | null | undefined {
  for (const value of values) {
    if (value === null) {
      return null;
    }

    const match = asString(value);
    if (match) {
      return match;
    }
  }

  return undefined;
}

export function humanizeReviewValue(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function normalizeAssignee(value: unknown): ReviewAssignee | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return {
    id: fallbackNullableString(record.id, record.userId) ?? null,
    email: fallbackNullableString(record.email) ?? null,
    displayName: fallbackNullableString(record.displayName, record.name) ?? null,
    role: fallbackNullableString(record.role) ?? null,
  };
}

function normalizeStrategyReviewInboxItem(value: unknown): StrategyReviewInboxItem | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const campaign = asRecord(record.campaign);
  const campaignId = fallbackString(record.campaignId, campaign?.id);
  if (!campaignId) {
    return null;
  }

  return {
    id: fallbackNullableString(record.id, record.reviewId) ?? null,
    campaignId,
    campaignTitle:
      fallbackString(record.campaignTitle, record.campaignName, campaign?.title, campaign?.name) ??
      campaignId,
    status: fallbackString(record.status, record.reviewStatus) ?? 'PENDING_REVIEW',
    createdAt: fallbackNullableString(record.createdAt) ?? null,
    requestedChangesNote:
      fallbackNullableString(record.requestedChangesNote, record.latestRequestedChangesNote) ?? null,
    approvedAt: fallbackNullableString(record.approvedAt) ?? null,
    updatedAt: fallbackNullableString(record.updatedAt) ?? null,
    assignedReviewer:
      normalizeAssignee(record.assignedReviewer ?? record.reviewer ?? record.assignee) ?? null,
  };
}

function normalizeDeliverables(record: UnknownRecord): StrategyReviewDeliverable[] {
  const rawArray = asArray(record.deliverables ?? record.outputs ?? record.artifacts);

  if (rawArray.length > 0) {
    const normalized: StrategyReviewDeliverable[] = [];

    rawArray.forEach((entry) => {
      const item = asRecord(entry);
      if (!item) {
        return;
      }

      const key = fallbackString(item.key, item.type, item.id, item.name);
      if (!key) {
        return;
      }

      normalized.push({
        key,
        label: fallbackString(item.label, item.title, item.name) ?? humanizeReviewValue(key),
        status: fallbackString(item.status, item.reviewStatus) ?? 'UNKNOWN',
        updatedAt: fallbackNullableString(item.updatedAt) ?? null,
      });
    });

    return normalized;
  }

  const fallbackEntries = [
    {
      key: 'onboarding_deliverables',
      label: 'Onboarding Deliverables',
      status:
        fallbackString(
          record.onboardingDeliverablesStatus,
          asRecord(record.onboardingDeliverables)?.status,
        ) ?? null,
    },
    {
      key: 'strategy_document',
      label: 'Strategy Document',
      status:
        fallbackString(record.strategyDocumentStatus, asRecord(record.strategyDocument)?.status) ??
        null,
    },
    {
      key: 'execution_kit',
      label: 'Execution Kit',
      status: fallbackString(record.executionKitStatus, asRecord(record.executionKit)?.status) ?? null,
    },
  ];

  return fallbackEntries
    .filter((entry) => Boolean(entry.status))
    .map((entry) => ({
      key: entry.key,
      label: entry.label,
      status: entry.status as string,
      updatedAt: null,
    }));
}

function normalizeSection(value: unknown): StrategyReviewSection | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const callType = fallbackString(record.callType, record.type, record.key);
  if (!callType) {
    return null;
  }

  return {
    callType,
    title: fallbackNullableString(record.title, record.label, record.name) ?? null,
    content:
      record.fullOutput ??
      record.generatedContent ??
      record.content ??
      record.output ??
      record.result ??
      record.sectionContent ??
      null,
    status: fallbackNullableString(record.status, record.reviewStatus, record.sectionStatus) ?? null,
    note:
      fallbackNullableString(
        record.note,
        record.reviewerNote,
        record.currentReviewerNote,
        record.requestedChangesNote,
      ) ?? null,
    decision: fallbackNullableString(record.decision, record.currentDecision) ?? null,
    updatedAt: fallbackNullableString(record.updatedAt) ?? null,
    deliverableKey:
      fallbackNullableString(record.deliverableKey, record.deliverable, record.parentDeliverable) ??
      null,
  };
}

export function normalizeStrategyReviewInboxResponse(payload: unknown): StrategyReviewInboxItem[] {
  const record = asRecord(payload);
  const items = Array.isArray(payload)
    ? payload
    : asArray(record?.items ?? record?.reviews ?? record?.strategyReviews);

  return items
    .map(normalizeStrategyReviewInboxItem)
    .filter((item): item is StrategyReviewInboxItem => Boolean(item));
}

export function normalizeStrategyReviewDetail(
  payload: unknown,
  fallbackCampaignId = '',
): StrategyReviewDetail {
  const record = asRecord(payload) ?? {};
  const campaign = asRecord(record.campaign);
  const campaignId = fallbackString(record.campaignId, campaign?.id) ?? fallbackCampaignId;
  const sections = asArray(record.sections ?? record.reviewSections ?? record.sectionReviews)
    .map(normalizeSection)
    .filter((section): section is StrategyReviewSection => Boolean(section));

  return {
    id: fallbackNullableString(record.id, record.reviewId) ?? null,
    campaignId,
    campaignTitle:
      fallbackNullableString(record.campaignTitle, record.campaignName, campaign?.title, campaign?.name) ??
      null,
    status: fallbackString(record.status, record.reviewStatus) ?? 'PENDING_REVIEW',
    assignedReviewer:
      normalizeAssignee(record.assignedReviewer ?? record.reviewer ?? record.assignee) ?? null,
    requestedChangesNote:
      fallbackNullableString(record.requestedChangesNote, record.latestRequestedChangesNote) ?? null,
    summaryNote: fallbackNullableString(record.summaryNote, record.reviewerSummaryNote) ?? null,
    approvedAt: fallbackNullableString(record.approvedAt) ?? null,
    updatedAt: fallbackNullableString(record.updatedAt) ?? null,
    deliverables: normalizeDeliverables(record),
    sections,
  };
}

export function normalizeReviewerUser(payload: unknown): AdminReviewerUser | null {
  const record = asRecord(payload);
  if (!record) {
    return null;
  }

  const id = fallbackString(record.id);
  const email = fallbackString(record.email);
  const role = fallbackString(record.role);
  const status = fallbackString(record.status);
  const createdAt = fallbackString(record.createdAt);

  if (!id || !email || !role || !status || !createdAt) {
    return null;
  }

  return {
    id,
    email,
    displayName: fallbackNullableString(record.displayName, record.name) ?? null,
    role,
    status,
    createdAt,
    lastLoginAt: fallbackNullableString(record.lastLoginAt) ?? null,
  };
}

export function normalizeReviewerListResponse(payload: unknown): AdminReviewerUser[] {
  const record = asRecord(payload);
  const items = Array.isArray(payload)
    ? payload
    : asArray(record?.items ?? record?.users ?? record?.reviewers);

  return items
    .map(normalizeReviewerUser)
    .filter((entry): entry is AdminReviewerUser => Boolean(entry));
}

export function normalizeAdminJobRuns(payload: unknown): AdminJobRunSummary[] {
  const record = asRecord(payload);
  const items = Array.isArray(payload) ? payload : asArray(record?.runs ?? record?.items);

  const normalized: AdminJobRunSummary[] = [];

  items.forEach((entry) => {
    const item = asRecord(entry);
    if (!item) {
      return;
    }

    const id = fallbackString(item.id);
    const jobName = fallbackString(item.jobName);
    const queueName = fallbackString(item.queueName);
    const status = fallbackString(item.status);
    const createdAt = fallbackString(item.createdAt);
    const updatedAt = fallbackString(item.updatedAt);

    if (!id || !jobName || !queueName || !status || !createdAt || !updatedAt) {
      return;
    }

    normalized.push({
      id,
      jobName,
      queueName,
      status,
      attemptsMade: asNumber(item.attemptsMade) ?? 0,
      lastErrorMessage: fallbackNullableString(item.lastErrorMessage) ?? null,
      createdAt,
      updatedAt,
      logsCount: asNumber(item.logsCount) ?? 0,
    });
  });

  return normalized;
}

export function normalizeAdminAiCalls(payload: unknown): AdminAiCallSummary[] {
  const record = asRecord(payload);
  const items = Array.isArray(payload) ? payload : asArray(record?.calls ?? record?.items);

  const normalized: AdminAiCallSummary[] = [];

  items.forEach((entry) => {
    const item = asRecord(entry);
    if (!item) {
      return;
    }

    const id = fallbackString(item.id);
    const operation = fallbackString(item.operation);
    const model = fallbackString(item.model);
    const status = fallbackString(item.status);
    const startedAt = fallbackString(item.startedAt);

    if (!id || !operation || !model || !status || !startedAt) {
      return;
    }

    normalized.push({
      id,
      requestId: fallbackNullableString(item.requestId) ?? null,
      provider: fallbackNullableString(item.provider) ?? null,
      operation,
      model,
      status,
      totalTokens: asNumber(item.totalTokens) ?? null,
      cost: asNumber(item.cost) ?? null,
      startedAt,
      finishedAt: fallbackNullableString(item.finishedAt) ?? null,
      errorMessage: fallbackNullableString(item.errorMessage) ?? null,
    });
  });

  return normalized;
}
