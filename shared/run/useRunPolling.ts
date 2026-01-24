'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RunEntity, RunPollingConfig } from './types';
import { isTerminal, isActive } from './guards';

export function useRunPolling<T extends RunEntity = RunEntity>(
  config: RunPollingConfig<T>,
) {
  const {
    runId,
    queryKeyBase,
    fetchRun,
    enabled = true,
    intervalMs = 2500,
    onSucceeded,
    onFailed,
  } = config;

  const queryClient = useQueryClient();
  const isVisibleRef = useRef(true);

  // Track visibility to pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const queryKey = [queryKeyBase, runId];
  const shouldPoll = enabled && runId && isVisibleRef.current;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!runId) throw new Error('runId required');
      return fetchRun(runId);
    },
    enabled: shouldPoll,
    refetchInterval: (run) => {
      if (!run || !isActive(run.status)) {
        return false; // Stop polling at terminal states
      }
      return shouldPoll ? intervalMs : false;
    },
    staleTime: 1000, // Keep fresh while polling
    gcTime: 5 * 60 * 1000, // Keep cached for 5 min
  });

  // Fire callbacks on status changes
  useEffect(() => {
    if (!query.data) return;

    const status = query.data.status;
    if (status === 'SUCCEEDED') {
      onSucceeded?.(query.data);
    } else if (status === 'FAILED') {
      onFailed?.(query.data, query.data.errorMessage);
    }
  }, [query.data]);

  return {
    run: query.data,
    status: query.data?.status,
    isLoading: query.isLoading,
    isPolling: shouldPoll && isActive(query.data?.status ?? 'QUEUED'),
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
