'use client';

import useSWR from 'swr';
import { weeklyRepository } from '@/shared/api/repositories/weekly.repo';
import type { WeeklySubmission, Anomaly, TweakRun, TweakItem, UpsertWeeklySubmissionPayload, UpdateTweakStatusPayload } from '@/shared/types/weekly';
import type { ID } from '@/shared/types/common';
import { useMemo } from 'react';

export function useWeeklySubmission(campaignId: ID) {
  const { data, error, isLoading, mutate } = useSWR(
    `weekly-${campaignId}`,
    () => weeklyRepository.listSubmissions(campaignId)
  );

  const upsert = useMemo(
    () => async (weekStart: string, payload: UpsertWeeklySubmissionPayload) => {
      const result = await weeklyRepository.upsertSubmission(campaignId, weekStart, payload);
      await mutate();
      return result;
    },
    [campaignId, mutate]
  );

  return {
    submissions: data || [],
    isLoading,
    error: error?.message || null,
    upsert,
  };
}

export function useAnomalies(campaignId: ID, weekStart?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `anomalies-${campaignId}-${weekStart || 'all'}`,
    () => weeklyRepository.listAnomalies(campaignId, weekStart)
  );

  return {
    anomalies: data || [],
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

export function useTweakRun(campaignId: ID, weekStart: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `tweak-run-${campaignId}-${weekStart}`,
    () => weeklyRepository.getTweakRun(campaignId, weekStart)
  );

  return {
    run: data || null,
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

export function useTweaks(tweakRunId: ID | null) {
  const { data, error, isLoading, mutate } = useSWR(
    tweakRunId ? `tweaks-${tweakRunId}` : null,
    () => (tweakRunId ? weeklyRepository.listTweaks(tweakRunId) : null)
  );

  const updateStatus = useMemo(
    () => async (tweakItemId: ID, payload: UpdateTweakStatusPayload) => {
      const result = await weeklyRepository.updateTweakStatus(tweakItemId, payload);
      await mutate();
      return result;
    },
    [mutate]
  );

  return {
    tweaks: data || [],
    isLoading,
    error: error?.message || null,
    updateStatus,
  };
}
