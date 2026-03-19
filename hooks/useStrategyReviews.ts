'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { strategyReviewRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import type {
  FinalizeStrategyReviewPayload,
  UpdateStrategyReviewSectionPayload,
} from '@/shared/types/reviews';

export function useAssignedStrategyReviews(enabled = true) {
  return useQuery({
    queryKey: queryKeys.strategyReviews.inbox(),
    queryFn: () => strategyReviewRepository.listAssignedReviews(),
    enabled,
  });
}

export function useStrategyReview(campaignId: string | null) {
  return useQuery({
    queryKey: campaignId ? queryKeys.strategyReviews.detail(campaignId) : queryKeys.strategyReviews.all,
    queryFn: () => strategyReviewRepository.getStrategyReview(campaignId as string),
    enabled: Boolean(campaignId),
    retry: false,
  });
}

export function useStartStrategyReview(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => strategyReviewRepository.startStrategyReview(campaignId),
    onSuccess: (review) => {
      queryClient.setQueryData(queryKeys.strategyReviews.detail(campaignId), review);
      queryClient.invalidateQueries({ queryKey: queryKeys.strategyReviews.inbox() });
    },
  });
}

export function useUpdateStrategyReviewSection(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { callType: string; data: UpdateStrategyReviewSectionPayload }) =>
      strategyReviewRepository.updateSectionDecision(campaignId, payload.callType, payload.data),
    onSuccess: (review) => {
      queryClient.setQueryData(queryKeys.strategyReviews.detail(campaignId), review);
      queryClient.invalidateQueries({ queryKey: queryKeys.strategyReviews.inbox() });
    },
  });
}

export function useFinalizeStrategyReview(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FinalizeStrategyReviewPayload) =>
      strategyReviewRepository.finalizeStrategyReview(campaignId, payload),
    onSuccess: (review) => {
      queryClient.setQueryData(queryKeys.strategyReviews.detail(campaignId), review);
      queryClient.invalidateQueries({ queryKey: queryKeys.strategyReviews.inbox() });
    },
  });
}
