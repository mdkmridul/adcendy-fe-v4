import { subDays } from 'date-fns';
import { http } from '../index';
import type { ApiResponse } from '../types';
import type { CampaignStatus } from '@/shared/types/campaign';
import type {
  AdminCampaignDetail,
  AdminCampaignListResponse,
  AdminCampaignRefreshResponse,
  AdminCampaignSummary,
  AdminReviewAdapter,
  AdminUserDto,
  AdminUserListResponse,
  AdminUserUpdate,
  AiCallDetail,
  AiCallListResponse,
  JobRunsByEntityResponse,
} from '@/shared/types/admin';
import type {
  AdminAiCallSummary,
  AdminJobRunSummary,
  AdminReviewerUser,
  CreateReviewerPayload,
} from '@/shared/types/reviews';
import { normalizeAdminAiCalls, normalizeAdminJobRuns, normalizeReviewerUser } from '@/shared/types/reviews';

function unwrapResponseData<T>(response: ApiResponse<T> | T | undefined): T | undefined {
  if (
    response &&
    typeof response === 'object' &&
    'data' in response
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T | undefined;
}

function coerceNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function coerceFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeAdminCampaignDetail(
  payload: unknown,
  fallbackCampaignId: string,
): AdminCampaignDetail {
  const nowIso = new Date().toISOString();
  const root = asRecord(payload) ?? {};
  const campaign = asRecord(root.campaign) ?? {};
  const owner = asRecord(campaign.owner);
  const wizard = asRecord(root.wizard) ?? asRecord(root.wizardState);
  const runs = asRecord(root.runs);
  const blockers = asRecord(root.blockers) ?? asRecord(runs?.blockers);
  const legacyLatestRun = asRecord(root.latestRun);
  const activeRun = asRecord(runs?.activeRun);
  const blockerActiveRun = asRecord(blockers?.activeRun);
  const latestRunSource = blockerActiveRun ?? legacyLatestRun ?? activeRun;

  const campaignId = coerceNullableString(campaign.id) ?? fallbackCampaignId;
  const activeRunId =
    coerceNullableString(blockers?.activeRunId) ??
    coerceNullableString(blockers?.active_run_id) ??
    coerceNullableString(blockerActiveRun?.id) ??
    coerceNullableString(runs?.activeRunId) ??
    coerceNullableString(runs?.active_run_id) ??
    coerceNullableString(latestRunSource?.id);
  const activeRunStatus =
    coerceNullableString(blockers?.activeRunStatus) ??
    coerceNullableString(blockers?.active_run_status) ??
    coerceNullableString(blockers?.status) ??
    coerceNullableString(blockerActiveRun?.status) ??
    coerceNullableString(runs?.activeRunStatus) ??
    coerceNullableString(runs?.active_run_status) ??
    coerceNullableString(runs?.status) ??
    coerceNullableString(latestRunSource?.status);

  const normalizedCampaign = {
    id: campaignId,
    title: coerceNullableString(campaign.title) ?? `Campaign ${campaignId}`,
    status: coerceNullableString(campaign.status) ?? 'DRAFT',
    businessType: campaign.businessType ?? null,
    businessModel: campaign.businessModel ?? null,
    marketScope: campaign.marketScope ?? null,
    websiteUrl: campaign.websiteUrl ?? null,
    description: campaign.description ?? null,
    createdAt: coerceNullableString(campaign.createdAt) ?? nowIso,
    updatedAt:
      coerceNullableString(campaign.updatedAt) ??
      coerceNullableString(campaign.createdAt) ??
      nowIso,
    owner: {
      id: coerceNullableString(owner?.id) ?? '',
      email: coerceNullableString(owner?.email) ?? '',
    },
  } as AdminCampaignDetail['campaign'];

  const normalizedWizard = wizard
    ? ({
        status: coerceNullableString(wizard.status) ?? 'UNKNOWN',
        lastCompletedStep:
          coerceFiniteNumber(wizard.lastCompletedStep) ??
          coerceFiniteNumber(wizard.currentStep) ??
          0,
        version: coerceFiniteNumber(wizard.version) ?? 1,
        updatedAt: coerceNullableString(wizard.updatedAt) ?? nowIso,
        derivedJson:
          asRecord(wizard.derivedJson) ??
          asRecord(wizard.derivedState) ??
          asRecord(wizard.answersJson) ??
          undefined,
      } as AdminCampaignDetail['wizard'])
    : null;

  const normalizedLatestRun = activeRunId
    ? ({
        id: activeRunId,
        campaignId,
        userId: coerceNullableString(latestRunSource?.userId) ?? '',
        status: activeRunStatus ?? 'QUEUED',
        currentStage:
          coerceNullableString(latestRunSource?.currentStage) ??
          coerceNullableString(runs?.activeRunStage) ??
          'UNKNOWN',
        progress: coerceFiniteNumber(latestRunSource?.progress) ?? 0,
        errorCode: latestRunSource?.errorCode ?? null,
        errorMessage: latestRunSource?.errorMessage ?? null,
        createdAt: coerceNullableString(latestRunSource?.createdAt) ?? nowIso,
        updatedAt:
          coerceNullableString(latestRunSource?.updatedAt) ??
          coerceNullableString(latestRunSource?.createdAt) ??
          nowIso,
        startedAt: coerceNullableString(latestRunSource?.startedAt) ?? null,
        endedAt: coerceNullableString(latestRunSource?.endedAt) ?? null,
      } as AdminCampaignDetail['latestRun'])
    : null;

  return {
    campaign: normalizedCampaign,
    wizard: normalizedWizard,
    latestRun: normalizedLatestRun,
  };
}

function coerceReviewer(dto: AdminUserDto): AdminReviewerUser {
  return {
    id: dto.id,
    email: dto.email,
    displayName: coerceNullableString(dto.displayName as unknown),
    role: dto.role,
    status: dto.status,
    createdAt: dto.createdAt,
    lastLoginAt: coerceNullableString(dto.lastLoginAt as unknown),
  };
}

export const adminReviewRealAdapter: AdminReviewAdapter = {
  async createReviewer(payload: CreateReviewerPayload): Promise<AdminReviewerUser | null> {
    const response = await http<ApiResponse<unknown> | undefined>('/v1/admin/users/reviewers', {
      method: 'POST',
      body: payload,
    });
    const data = unwrapResponseData(response);

    return normalizeReviewerUser(
      (data &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        (((data as Record<string, unknown>).reviewer as unknown) ??
          ((data as Record<string, unknown>).user as unknown) ??
          data)) ||
        null,
    );
  },

  async listReviewers(params?: { q?: string; page?: number; pageSize?: number }): Promise<AdminReviewerUser[]> {
    const response = await http<ApiResponse<AdminUserListResponse>>('/v1/admin/users', {
      query: params,
    });

    return response.data.items
      .map(coerceReviewer)
      .filter((user) => user.role === 'REVIEWER');
  },

  async updateReviewerStatus(
    reviewerId: string,
    payload: AdminUserUpdate,
  ): Promise<AdminReviewerUser | null> {
    const response = await http<ApiResponse<unknown> | undefined>(`/v1/admin/users/${reviewerId}`, {
      method: 'PATCH',
      body: payload,
    });
    const data = unwrapResponseData(response);

    return normalizeReviewerUser(
      (data &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        (((data as Record<string, unknown>).user as unknown) ?? data)) ||
        null,
    );
  },

  async listAdminCampaigns(params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: CampaignStatus;
  }): Promise<AdminCampaignSummary[]> {
    const response = await http<ApiResponse<AdminCampaignListResponse>>('/v1/admin/campaigns', {
      query: params,
    });

    return response.data.items;
  },

  async getAdminCampaignDetail(
    campaignId: string,
    includeRaw?: string,
  ): Promise<AdminCampaignDetail> {
    const response = await http<ApiResponse<unknown> | unknown>(
      `/api/v2/admin/campaigns/${campaignId}`,
      {
        query: includeRaw ? { includeRaw } : undefined,
      },
    );

    return normalizeAdminCampaignDetail(unwrapResponseData(response), campaignId);
  },

  async refreshAdminCampaignIntelligence(
    campaignId: string,
    force = false,
  ): Promise<AdminCampaignRefreshResponse> {
    const response = await http<ApiResponse<AdminCampaignRefreshResponse>>(
      `/v1/admin/campaigns/${campaignId}/intelligence/refresh`,
      {
        method: 'POST',
        query: force ? { force: 'true' } : undefined,
      },
    );

    return response.data;
  },

  async listJobRunsByEntity(params: {
    entityType: string;
    entityId: string;
    limit?: number;
  }): Promise<AdminJobRunSummary[]> {
    const response = await http<ApiResponse<JobRunsByEntityResponse>>(
      '/v1/admin/jobs/runs/by-entity',
      {
        query: {
          entityType: params.entityType,
          entityId: params.entityId,
          limit: String(params.limit ?? 10),
        },
      },
    );

    return normalizeAdminJobRuns(response.data);
  },

  async listAiCalls(params?: {
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
  }): Promise<AdminAiCallSummary[]> {
    const now = new Date();
    const response = await http<ApiResponse<AiCallListResponse>>('/v1/admin/ai/calls', {
      query: {
        from: subDays(now, params?.days ?? 14).toISOString(),
        to: now.toISOString(),
        userId: params?.userId,
        campaignId: params?.campaignId ?? '',
        entityType: params?.entityType ?? '',
        entityId: params?.entityId ?? '',
        status: params?.status ?? '',
        operation: params?.operation ?? '',
        model: params?.model ?? '',
        limit: String(params?.limit ?? 10),
        page: String(params?.page ?? 1),
      },
    });

    return normalizeAdminAiCalls(response.data);
  },

  async getAiCallDetail(callId: string): Promise<AiCallDetail> {
    const response = await http<ApiResponse<AiCallDetail>>(`/v1/admin/ai/calls/${callId}`);
    return response.data;
  },
};
