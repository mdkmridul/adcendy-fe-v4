'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { channelResultsV2Repository } from '@/shared/api/repositories/channelResultsV2.repo';
import type { ChannelResultInputV2 } from '@/shared/types/channelResultsV2';

export function useChannelResultsV2(campaignId: string | null) {
  return useQuery({
    queryKey: queryKeys.channelResultsV2.list(campaignId ?? 'unavailable'),
    queryFn: ({ signal }) =>
      channelResultsV2Repository.list(campaignId as string, undefined, signal),
    enabled: Boolean(campaignId),
    retry: false,
  });
}

function useInvalidateChannelResultsV2(campaignId: string | null) {
  const queryClient = useQueryClient();
  return async () => {
    if (campaignId) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.channelResultsV2.list(campaignId),
      });
    }
  };
}

/** Records a period, or replaces the same market, channel and period. */
export function useRecordChannelResultV2(campaignId: string | null) {
  const invalidate = useInvalidateChannelResultsV2(campaignId);
  return useMutation({
    mutationFn: async (input: ChannelResultInputV2) => {
      if (!campaignId) {
        throw new Error('Campaign id is required to record results.');
      }
      return channelResultsV2Repository.record(campaignId, input);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteChannelResultV2(campaignId: string | null) {
  const invalidate = useInvalidateChannelResultsV2(campaignId);
  return useMutation({
    mutationFn: async (resultId: string) => {
      if (!campaignId) {
        throw new Error('Campaign id is required to delete results.');
      }
      return channelResultsV2Repository.remove(campaignId, resultId);
    },
    onSuccess: invalidate,
  });
}
