import type { CampaignStatus } from './campaign';
import type { Role } from './common';
import type {
  AdminAiCallSummary,
  AdminJobRunSummary,
  AdminReviewerUser,
  CreateReviewerPayload,
} from './reviews';

export const ADMIN_CAMPAIGN_DELETE_CONFIRMATION = 'DELETE' as const;

export interface AdminUserDto {
  id: string;
  email: string;
  displayName?: string | null;
  role: Role | string;
  status: string;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface AdminUserListResponse {
  items: AdminUserDto[];
}

export interface AdminUserUpdate {
  status: 'ACTIVE' | 'DISABLED';
  reason: string;
  ticketId?: string;
}

export interface AdminCampaignSummary {
  id: string;
  title: string;
  status: CampaignStatus;
  ownerId: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCampaignListResponse {
  items: AdminCampaignSummary[];
}

export interface AdminCampaignDetail {
  campaign: {
    id: string;
    title: string;
    status: string;
    businessType?: unknown;
    businessModel?: unknown;
    marketScope?: unknown;
    websiteUrl?: unknown;
    description?: unknown;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      email: string;
    };
  };
  wizard: {
    status: string;
    lastCompletedStep: number;
    version: number;
    updatedAt: string;
    derivedJson?: Record<string, unknown>;
  } | null;
  latestRun: {
    id: string;
    campaignId: string;
    userId: string;
    status: string;
    currentStage: string;
    progress: number;
    errorCode?: unknown;
    errorMessage?: unknown;
    createdAt: string;
    updatedAt: string;
    startedAt?: string | null;
    endedAt?: string | null;
  } | null;
}

export interface AdminCampaignRefreshResponse {
  results: Record<string, unknown>;
}

export interface AdminCampaignDeleteResponse {
  campaignId: string;
  deleted: true;
  storage: {
    deletedObjects: number;
    sharedObjectsRetained: number;
  };
  queues: {
    inspected: number;
    removed: number;
    missing: number;
    active: number;
    removalFailed: number;
  };
  explicitlyDeletedRecords: {
    signedDocuments: number;
    legalAcceptances: number;
    consentRecords: number;
    aiCalls: number;
    jobRuns: number;
    previousAuditEvents: number;
  };
  auditTombstoneRetained: boolean;
}

export interface JobRunsByEntityResponse {
  runs: unknown[];
}

export interface AiCallListResponse {
  calls: unknown[];
  pagination?: Record<string, unknown>;
}

export interface AiCallDetail {
  id: string;
  requestId?: string;
  provider?: string;
  operation: 'CHAT' | 'EMBEDDING';
  model: string;
  status: 'STARTED' | 'SUCCEEDED' | 'FAILED';
  startedAt: string;
  finishedAt?: string;
  totalTokens?: number;
  cost?: number;
  errorMessage?: string;
  metaJson?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AdminReviewAdapter {
  createReviewer: (payload: CreateReviewerPayload) => Promise<AdminReviewerUser | null>;
  listReviewers: (params?: {
    q?: string;
    page?: number;
    pageSize?: number;
  }) => Promise<AdminReviewerUser[]>;
  updateReviewerStatus: (
    reviewerId: string,
    payload: AdminUserUpdate,
  ) => Promise<AdminReviewerUser | null>;
  listAdminCampaigns: (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: CampaignStatus;
  }) => Promise<AdminCampaignSummary[]>;
  getAdminCampaignDetail: (
    campaignId: string,
    includeRaw?: string,
  ) => Promise<AdminCampaignDetail>;
  deleteAdminCampaignPermanently: (
    campaignId: string,
    confirmation: string,
  ) => Promise<AdminCampaignDeleteResponse>;
  refreshAdminCampaignIntelligence: (
    campaignId: string,
    force?: boolean,
  ) => Promise<AdminCampaignRefreshResponse>;
  listJobRunsByEntity: (params: {
    entityType: string;
    entityId: string;
    limit?: number;
  }) => Promise<AdminJobRunSummary[]>;
  listAiCalls: (params?: {
    userId?: string;
    campaignId?: string;
    entityType?: string;
    entityId?: string;
    status?: string;
    operation?: string;
    model?: string;
    limit?: number;
    page?: number;
    days?: number;
  }) => Promise<AdminAiCallSummary[]>;
  getAiCallDetail: (callId: string) => Promise<AiCallDetail>;
}
