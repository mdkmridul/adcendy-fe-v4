'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminReviewRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import type { CampaignStatus } from '@/shared/types/campaign';
import type { CampaignOverviewV2 } from '@/shared/types/opsV2';
import type { CreateReviewerPayload } from '@/shared/types/reviews';
import type { AdminCampaignDetail, AdminUserUpdate } from '@/shared/types/admin';
import { useStrategyReview } from './useStrategyReviews';

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function upsertOpsCampaignCacheFromAdminDetail(
  existing: CampaignOverviewV2[] | undefined,
  campaignId: string,
  detail: AdminCampaignDetail,
): CampaignOverviewV2[] {
  const list = Array.isArray(existing) ? existing : [];
  const detailCampaignId = toNonEmptyString(detail.campaign?.id) ?? campaignId;
  const detailTitle = toNonEmptyString(detail.campaign?.title) ?? `Campaign ${detailCampaignId}`;
  const detailStatus =
    (toNonEmptyString(detail.campaign?.status) as CampaignOverviewV2['status'] | null) ?? 'DRAFT';
  const detailUpdatedAt = toNonEmptyString(detail.campaign?.updatedAt) ?? undefined;
  const detailCurrentStep =
    typeof detail.wizard?.lastCompletedStep === 'number' && Number.isFinite(detail.wizard.lastCompletedStep)
      ? detail.wizard.lastCompletedStep
      : 0;
  const detailRunId = toNonEmptyString(detail.latestRun?.id);
  const detailRunStatus = toNonEmptyString(detail.latestRun?.status);

  const index = list.findIndex((item) => item.id === detailCampaignId);
  if (index === -1) {
    return [
      ...list,
      {
        id: detailCampaignId,
        title: detailTitle,
        status: detailStatus,
        currentStep: detailCurrentStep,
        updatedAt: detailUpdatedAt,
        pipelineRunId: detailRunId,
        latestRunStatus: detailRunStatus,
      },
    ];
  }

  const current = list[index];
  const nextItem: CampaignOverviewV2 = {
    ...current,
    title: detailTitle,
    status: detailStatus,
    currentStep: detailCurrentStep,
    updatedAt: detailUpdatedAt ?? current.updatedAt,
    pipelineRunId: detailRunId,
    latestRunStatus: detailRunStatus,
  };

  const unchanged =
    current.title === nextItem.title &&
    current.status === nextItem.status &&
    current.currentStep === nextItem.currentStep &&
    current.updatedAt === nextItem.updatedAt &&
    current.pipelineRunId === nextItem.pipelineRunId &&
    current.latestRunStatus === nextItem.latestRunStatus;

  if (unchanged) {
    return list;
  }

  const nextList = [...list];
  nextList[index] = nextItem;
  return nextList;
}

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
    mutationFn: ({ reviewerId, payload }: { reviewerId: string; payload: AdminUserUpdate }) =>
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

export function useAdminCampaignDetail(
  campaignId: string | null,
  enabled = true,
  options?: {
    refetchOnMount?: boolean | 'always';
    retry?: boolean;
  },
) {
  const queryClient = useQueryClient();
  const campaignQuery = useQuery({
    queryKey: campaignId ? queryKeys.adminReview.campaignDetail(campaignId) : queryKeys.adminReview.all,
    queryFn: () => adminReviewRepository.getAdminCampaignDetail(campaignId as string),
    enabled: Boolean(campaignId) && enabled,
    refetchOnMount: options?.refetchOnMount,
    retry: options?.retry,
  });

  useEffect(() => {
    if (!campaignId || !campaignQuery.data) {
      return;
    }

    queryClient.setQueryData<CampaignOverviewV2[]>(
      queryKeys.opsV2.campaigns(),
      (existing) => upsertOpsCampaignCacheFromAdminDetail(existing, campaignId, campaignQuery.data),
    );
  }, [campaignId, campaignQuery.data, queryClient]);

  return campaignQuery;
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
  options?: {
    refetchOnMount?: boolean | 'always';
  },
) {
  return useQuery({
    queryKey: queryKeys.adminReview.aiCallsList(filters),
    queryFn: () => adminReviewRepository.listAiCalls(filters ?? {}),
    enabled,
    refetchOnMount: options?.refetchOnMount,
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
  const campaignQuery = useAdminCampaignDetail(campaignId, Boolean(campaignId), { retry: false });

  const reviewQuery = useStrategyReview(campaignId);

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
    aiCallsQuery,
    isLoading:
      campaignQuery.isLoading ||
      reviewQuery.isLoading ||
      aiCallsQuery.isLoading,
  };
}
