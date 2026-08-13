import ENV, { createRuntimeRepositoryAdapter } from '@/lib/env';
import type { CampaignStatus } from '@/shared/types/campaign';
import type {
  AdminCampaignDeleteResponse,
  AdminCampaignDetail,
  AdminCampaignRefreshResponse,
  AdminCampaignSummary,
  AdminReviewAdapter,
  AdminUserUpdate,
  AiCallDetail,
} from '@/shared/types/admin';
import type {
  AdminAiCallSummary,
  AdminJobRunSummary,
  AdminReviewerUser,
  CreateReviewerPayload,
} from '@/shared/types/reviews';
import { adminReviewMockAdapter } from '../mock/adminReview.mock';
import { adminReviewRealAdapter } from '../real/adminReview.real';

const adapter: AdminReviewAdapter = createRuntimeRepositoryAdapter(
  adminReviewMockAdapter,
  adminReviewRealAdapter,
);

if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Admin Review Repository] Using adapter:', ENV.API.dataSource);
}

export const adminReviewRepository = {
  async createReviewer(payload: CreateReviewerPayload): Promise<AdminReviewerUser | null> {
    return adapter.createReviewer(payload);
  },

  async listReviewers(params?: { q?: string; page?: number; pageSize?: number }): Promise<AdminReviewerUser[]> {
    return adapter.listReviewers(params);
  },

  async updateReviewerStatus(
    reviewerId: string,
    payload: AdminUserUpdate,
  ): Promise<AdminReviewerUser | null> {
    return adapter.updateReviewerStatus(reviewerId, payload);
  },

  async listAdminCampaigns(params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: CampaignStatus;
  }): Promise<AdminCampaignSummary[]> {
    return adapter.listAdminCampaigns(params);
  },

  async getAdminCampaignDetail(
    campaignId: string,
    includeRaw?: string,
  ): Promise<AdminCampaignDetail> {
    return adapter.getAdminCampaignDetail(campaignId, includeRaw);
  },

  async deleteAdminCampaignPermanently(
    campaignId: string,
    confirmation: string,
  ): Promise<AdminCampaignDeleteResponse> {
    return adapter.deleteAdminCampaignPermanently(campaignId, confirmation);
  },

  async refreshAdminCampaignIntelligence(
    campaignId: string,
    force?: boolean,
  ): Promise<AdminCampaignRefreshResponse> {
    return adapter.refreshAdminCampaignIntelligence(campaignId, force);
  },

  async listJobRunsByEntity(params: {
    entityType: string;
    entityId: string;
    limit?: number;
  }): Promise<AdminJobRunSummary[]> {
    return adapter.listJobRunsByEntity(params);
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
    return adapter.listAiCalls(params);
  },

  async getAiCallDetail(callId: string): Promise<AiCallDetail> {
    return adapter.getAiCallDetail(callId);
  },
};
