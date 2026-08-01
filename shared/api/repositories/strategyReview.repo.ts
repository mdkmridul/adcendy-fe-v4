import ENV, { createRuntimeRepositoryAdapter } from '@/lib/env';
import type {
  FinalizeStrategyReviewPayload,
  StrategyReviewDetail,
  StrategyReviewInboxItem,
  UpdateStrategyReviewSectionPayload,
} from '@/shared/types/reviews';
import { strategyReviewMockAdapter } from '../mock/strategyReview.mock';
import { strategyReviewRealAdapter } from '../real/strategyReview.real';

const adapter = createRuntimeRepositoryAdapter(strategyReviewMockAdapter, strategyReviewRealAdapter);

if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Strategy Review Repository] Using adapter:', ENV.API.dataSource);
}

export const strategyReviewRepository = {
  async listAssignedReviews(): Promise<StrategyReviewInboxItem[]> {
    return adapter.listAssignedReviews();
  },

  async getStrategyReview(campaignId: string): Promise<StrategyReviewDetail> {
    return adapter.getStrategyReview(campaignId);
  },

  async startStrategyReview(campaignId: string): Promise<StrategyReviewDetail> {
    return adapter.startStrategyReview(campaignId);
  },

  async updateSectionDecision(
    campaignId: string,
    callType: string,
    payload: UpdateStrategyReviewSectionPayload,
  ): Promise<StrategyReviewDetail> {
    return adapter.updateSectionDecision(campaignId, callType, payload);
  },

  async finalizeStrategyReview(
    campaignId: string,
    payload: FinalizeStrategyReviewPayload,
  ): Promise<StrategyReviewDetail> {
    return adapter.finalizeStrategyReview(campaignId, payload);
  },
};
