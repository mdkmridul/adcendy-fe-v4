'use client';

import useSWR from 'swr';
import { strategyRepository } from '@/shared/api/repositories/strategy.repo';
import type { StrategyRun, StrategyVersion, SubmitStrategyFeedbackPayload } from '@/shared/types/strategy';
import type { ID } from '@/shared/types/common';
import { useMemo } from 'react';

export function useStrategyRun(campaignId: ID, runId: ID | null) {
  const { data, error, isLoading, mutate } = useSWR(
    runId ? `strategy-run-${runId}` : null,
    () => (runId ? strategyRepository.getRun(campaignId, runId) : null),
    {
      refreshInterval: runId ? 3000 : 0, // Poll every 3s if run exists
    }
  );

  return {
    run: data || null,
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

export function useStrategyVersions(campaignId: ID) {
  const { data, error, isLoading, mutate } = useSWR(
    `strategy-versions-${campaignId}`,
    () => strategyRepository.listVersions(campaignId)
  );

  return {
    versions: data || [],
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

export function useStrategyLatest(campaignId: ID) {
  const { data, error, isLoading, mutate } = useSWR(
    `strategy-latest-${campaignId}`,
    () => strategyRepository.getLatest(campaignId)
  );

  return {
    version: data || null,
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

export function useSubmitStrategyFeedback(campaignId: ID, strategyVersionId: ID) {
  const submit = useMemo(
    () => async (payload: SubmitStrategyFeedbackPayload) => {
      await strategyRepository.submitFeedback(campaignId, strategyVersionId, payload);
    },
    [campaignId, strategyVersionId]
  );

  return { submit };
}
