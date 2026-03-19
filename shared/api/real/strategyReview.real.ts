import { http } from '../index';
import type { ApiResponse } from '../types';
import type {
  FinalizeStrategyReviewPayload,
  StrategyReviewDetail,
  StrategyReviewInboxItem,
  UpdateStrategyReviewSectionPayload,
} from '@/shared/types/reviews';
import {
  normalizeStrategyReviewDetail,
  normalizeStrategyReviewInboxResponse,
} from '@/shared/types/reviews';

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

export const strategyReviewRealAdapter = {
  async listAssignedReviews(): Promise<StrategyReviewInboxItem[]> {
    const response = await http<ApiResponse<unknown>>('/v1/reviewer/strategy-reviews');
    return normalizeStrategyReviewInboxResponse(response.data);
  },

  async getStrategyReview(campaignId: string): Promise<StrategyReviewDetail> {
    const response = await http<ApiResponse<unknown>>(`/v1/campaigns/${campaignId}/strategy-review`);
    return normalizeStrategyReviewDetail(response.data, campaignId);
  },

  async startStrategyReview(campaignId: string): Promise<StrategyReviewDetail> {
    const response = await http<ApiResponse<unknown> | undefined>(
      `/v1/campaigns/${campaignId}/strategy-review/start`,
      { method: 'POST' },
    );
    const payload = unwrapResponseData(response);

    if (payload) {
      return normalizeStrategyReviewDetail(payload, campaignId);
    }

    return this.getStrategyReview(campaignId);
  },

  async updateSectionDecision(
    campaignId: string,
    callType: string,
    payload: UpdateStrategyReviewSectionPayload,
  ): Promise<StrategyReviewDetail> {
    const response = await http<ApiResponse<unknown> | undefined>(
      `/v1/campaigns/${campaignId}/strategy-review/sections/${encodeURIComponent(callType)}`,
      {
        method: 'PUT',
        body: payload,
      },
    );
    const data = unwrapResponseData(response);

    if (data) {
      return normalizeStrategyReviewDetail(data, campaignId);
    }

    return this.getStrategyReview(campaignId);
  },

  async finalizeStrategyReview(
    campaignId: string,
    payload: FinalizeStrategyReviewPayload,
  ): Promise<StrategyReviewDetail> {
    const response = await http<ApiResponse<unknown> | undefined>(
      `/v1/campaigns/${campaignId}/strategy-review/finalize`,
      {
        method: 'POST',
        body: payload,
      },
    );
    const data = unwrapResponseData(response);

    if (data) {
      return normalizeStrategyReviewDetail(data, campaignId);
    }

    return this.getStrategyReview(campaignId);
  },
};
