'use client';

import useSWR from 'swr';
import { intelligenceRepository } from '@/shared/api/repositories/intelligence.repo';
import type { ID } from '@/shared/types/common';
import { useMemo } from 'react';

export function useIntelligenceSnapshot(campaignId: ID) {
  const { data, error, isLoading, mutate } = useSWR(
    `intelligence-snapshot-${campaignId}`,
    () => intelligenceRepository.getLatestSnapshot(campaignId)
  );

  const refresh = useMemo(
    () => async () => {
      const result = await intelligenceRepository.refreshSnapshot(campaignId);
      await mutate();
      return result;
    },
    [campaignId, mutate]
  );

  return {
    snapshot: data,
    isLoading,
    error: error?.message || null,
    refresh,
  };
}
