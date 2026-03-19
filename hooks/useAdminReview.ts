'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminReviewRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CampaignStatus } from '@/shared/types/campaign';
import type { CreateReviewerPayload } from '@/shared/types/reviews';
import type { components } from '@/src/generated/openapi';
import { useStrategyReview } from './useStrategyReviews';

type AdminUserUpdateDto = components['schemas']['AdminUserUpdateDto'];

export function useReviewerAccounts(search?: string) {
  return useQuery({
    queryKey: queryKeys.adminReview.reviewers(search),
    queryFn: () => adminReviewRepository.listReviewers({ q: search, pageSize: 20 }),
  });
}

export function useCreateReviewerAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewerPayload) => adminReviewRepository.createReviewer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReview.reviewers() });
    },
  });
}

export function useUpdateReviewerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewerId, payload }: { reviewerId: string; payload: AdminUserUpdateDto }) =>
      adminReviewRepository.updateReviewerStatus(reviewerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReview.reviewers() });
    },
  });
}

export function useAdminCampaigns(
  filters?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: CampaignStatus;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.adminReview.campaignList(filters),
    queryFn: () => adminReviewRepository.listAdminCampaigns(filters),
    enabled,
  });
}

export function useAdminCampaignDetail(campaignId: string | null, enabled = true) {
  return useQuery({
    queryKey: campaignId ? queryKeys.adminReview.campaignDetail(campaignId) : queryKeys.adminReview.all,
    queryFn: () => adminReviewRepository.getAdminCampaignDetail(campaignId as string),
    enabled: Boolean(campaignId) && enabled,
  });
}

export function useRefreshAdminCampaignIntelligence(campaignId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (force?: boolean) =>
      adminReviewRepository.refreshAdminCampaignIntelligence(campaignId as string, force),
    onSuccess: async () => {
      if (campaignId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.adminReview.campaignDetail(campaignId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(campaignId) }),
        ]);
      }
    },
  });
}

export function useAdminAiCalls(
  filters?: {
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
  },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.adminReview.aiCallsList(filters),
    queryFn: () => adminReviewRepository.listAiCalls(filters ?? {}),
    enabled,
  });
}

export function useAdminAiCallDetail(callId: string | null, enabled = true) {
  return useQuery({
    queryKey: callId ? queryKeys.adminReview.aiCall(callId) : queryKeys.adminReview.all,
    queryFn: () => adminReviewRepository.getAiCallDetail(callId as string),
    enabled: Boolean(callId) && enabled,
  });
}

export function useAdminCampaignReviewOverview(campaignId: string | null) {
  const campaignQuery = useQuery({
    queryKey: campaignId ? queryKeys.adminReview.campaignDetail(campaignId) : queryKeys.adminReview.all,
    queryFn: () => adminReviewRepository.getAdminCampaignDetail(campaignId as string),
    enabled: Boolean(campaignId),
    retry: false,
  });

  const reviewQuery = useStrategyReview(campaignId);

  const jobsQuery = useQuery({
    queryKey:
      campaignId
        ? queryKeys.adminReview.jobsByEntity('CAMPAIGN', campaignId, 8)
        : queryKeys.adminReview.all,
    queryFn: () =>
      adminReviewRepository.listJobRunsByEntity({
        entityType: 'CAMPAIGN',
        entityId: campaignId as string,
        limit: 8,
      }),
    enabled: Boolean(campaignId),
    retry: false,
  });

  const aiCallsQuery = useQuery({
    queryKey:
      campaignId ? queryKeys.adminReview.aiCalls(campaignId, 8) : queryKeys.adminReview.all,
    queryFn: () =>
      adminReviewRepository.listAiCalls({
        campaignId: campaignId as string,
        entityType: 'CAMPAIGN',
        entityId: campaignId as string,
        limit: 8,
        page: 1,
      }),
    enabled: Boolean(campaignId),
    retry: false,
  });

  return {
    campaignQuery,
    reviewQuery,
    jobsQuery,
    aiCallsQuery,
    isLoading:
      campaignQuery.isLoading ||
      reviewQuery.isLoading ||
      jobsQuery.isLoading ||
      aiCallsQuery.isLoading,
  };
}
