'use client';

import useSWR from 'swr';
import { useCampaign } from '@/hooks/useCampaigns';
import { strategyReviewRepository } from '@/shared/api/repositories';
import {
  getCampaignLifecycleStage,
  type CampaignLifecycleStage,
} from '@/shared/components/campaigns/campaign-ui';
import type { ID } from '@/shared/types/common';

export function useCampaignLifecycle(campaignId: ID | null) {
  const { campaign, isLoading: isCampaignLoading, error: campaignError, refetch } = useCampaign(campaignId);

  const { data: strategyReview, isLoading: isStrategyReviewLoading } = useSWR(
    campaignId && campaign && campaign.status !== 'DRAFT'
      ? `campaign-lifecycle-strategy-review-${campaignId}`
      : null,
    async () => {
      if (!campaignId) {
        return null;
      }

      try {
        return await strategyReviewRepository.getStrategyReview(campaignId);
      } catch {
        return null;
      }
    },
    {
      revalidateOnFocus: false,
    },
  );

  const stage: CampaignLifecycleStage | null = campaign ? getCampaignLifecycleStage(campaign) : null;

  return {
    campaign,
    stage,
    strategyReview,
    isLoading:
      isCampaignLoading || Boolean(campaign && campaign.status !== 'DRAFT' && isStrategyReviewLoading),
    error: campaignError,
    refetchCampaign: refetch,
  };
}
