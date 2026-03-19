import { subDays } from 'date-fns';
import { http } from '../index';
import type { ApiResponse } from '../types';
import type { components } from '@/src/generated/openapi';
import type { CampaignStatus } from '@/shared/types/campaign';
import type {
  AdminAiCallSummary,
  AdminJobRunSummary,
  AdminReviewerUser,
  CreateReviewerPayload,
} from '@/shared/types/reviews';
import { normalizeAdminAiCalls, normalizeAdminJobRuns, normalizeReviewerUser } from '@/shared/types/reviews';

type AdminUserDto = components['schemas']['AdminUserDto'];
type AdminUserListResponseDto = components['schemas']['AdminUserListResponseDto'];
type AdminUserUpdateDto = components['schemas']['AdminUserUpdateDto'];
type AdminCampaignSummaryDto = components['schemas']['AdminCampaignSummaryDto'];
type AdminCampaignListResponseDto = components['schemas']['AdminCampaignListResponseDto'];
type AdminCampaignDetailResponseDto = components['schemas']['AdminCampaignDetailResponseDto'];
type AdminCampaignRefreshResponseDto = components['schemas']['AdminCampaignRefreshResponseDto'];
type JobRunsByEntityResponseDto = components['schemas']['JobRunsByEntityResponseDto'];
type AiCallListResponseDto = components['schemas']['AiCallListResponseDto'];
type AiCallDetailDto = components['schemas']['AiCallDetailDto'];

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

export const adminReviewRealAdapter = {
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
    const response = await http<ApiResponse<AdminUserListResponseDto>>('/v1/admin/users', {
      query: params,
    });

    return response.data.items
      .map(coerceReviewer)
      .filter((user) => user.role === 'REVIEWER');
  },

  async updateReviewerStatus(
    reviewerId: string,
    payload: AdminUserUpdateDto,
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
  }): Promise<AdminCampaignSummaryDto[]> {
    const response = await http<ApiResponse<AdminCampaignListResponseDto>>('/v1/admin/campaigns', {
      query: params,
    });

    return response.data.items;
  },

  async getAdminCampaignDetail(
    campaignId: string,
    includeRaw?: string,
  ): Promise<AdminCampaignDetailResponseDto> {
    const response = await http<ApiResponse<AdminCampaignDetailResponseDto>>(
      `/v1/admin/campaigns/${campaignId}`,
      {
        query: includeRaw ? { includeRaw } : undefined,
      },
    );

    return response.data;
  },

  async refreshAdminCampaignIntelligence(
    campaignId: string,
    force = false,
  ): Promise<AdminCampaignRefreshResponseDto> {
    const response = await http<ApiResponse<AdminCampaignRefreshResponseDto>>(
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
    const response = await http<ApiResponse<JobRunsByEntityResponseDto>>(
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
    const response = await http<ApiResponse<AiCallListResponseDto>>('/v1/admin/ai/calls', {
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

  async getAiCallDetail(callId: string): Promise<AiCallDetailDto> {
    const response = await http<ApiResponse<AiCallDetailDto>>(`/v1/admin/ai/calls/${callId}`);
    return response.data;
  },
};
