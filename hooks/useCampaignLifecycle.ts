'use client';

import { useCampaign } from '@/hooks/useCampaigns';
import { useCampaignRunWorkspace } from '@/hooks/useCampaignRunWorkspace';
import { useOpsSectionReviewWorkspace } from '@/hooks/useOpsV2';
import {
  getCampaignLifecycleStage,
  type CampaignLifecycleStage,
} from '@/shared/components/campaigns/campaign-ui';
import type { ID } from '@/shared/types/common';

export function useCampaignLifecycle(campaignId: ID | null) {
  const { campaign, isLoading: isCampaignLoading, error: campaignError, refetch } = useCampaign(campaignId);
  const runWorkspace = useCampaignRunWorkspace(campaignId, Boolean(campaignId));
  const runId = runWorkspace.runId;

  const workspaceQuery = useOpsSectionReviewWorkspace(
    runId,
    Boolean(campaignId && campaign && campaign.status !== 'DRAFT' && runId),
  );

  const stage: CampaignLifecycleStage | null = campaign ? getCampaignLifecycleStage(campaign) : null;
  const workspace = workspaceQuery.data;
  const strategyReview = workspace
    ? {
        status: workspace.status,
        updatedAt: workspace.updatedAt ?? null,
        approvedAt: null,
        sections: workspace.sections.map((section) => ({
          callType: section.sectionId ?? section.sectionReviewTaskId,
          title: section.sectionTitle ?? section.sectionId ?? 'Section',
          content: section.sectionContent,
          status: section.status,
          decision: section.status,
          note: section.latestRevisionSummary ?? null,
          updatedAt: section.updatedAt ?? null,
        })),
      }
    : null;

  return {
    campaign,
    stage,
    strategyReview,
    isLoading:
      isCampaignLoading ||
      Boolean(campaign && campaign.status !== 'DRAFT' && runWorkspace.isLoading) ||
      Boolean(campaign && campaign.status !== 'DRAFT' && runId && workspaceQuery.isLoading),
    error: campaignError,
    refetchCampaign: refetch,
  };
}
