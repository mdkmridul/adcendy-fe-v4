'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/errors';
import { queryKeys } from '@/shared/api/queryKeys';
import { runsV2Repository } from '@/shared/api/repositories/runsV2.repo';
import { createIdempotencyKey } from '@/shared/run/idempotency';
import { getRunPollingDelay } from '@/shared/run/run-state-v2';
import { usePageActivity } from '@/shared/run/use-page-activity';

export function usePipelineRunV2(runId: string | null | undefined) {
  const { isOnline, isVisible } = usePageActivity();
  const wasOnline = useRef(isOnline);
  const wasVisible = useRef(isVisible);

  const query = useQuery({
    queryKey: queryKeys.runsV2.status(runId ?? 'unavailable'),
    queryFn: ({ signal }) =>
      runsV2Repository.getStatus(runId as string, signal),
    enabled: Boolean(runId),
    retry: false,
    refetchInterval: (currentQuery) => {
      if (!isOnline || !isVisible) return false;
      return getRunPollingDelay(
        currentQuery.state.data,
        currentQuery.state.error,
        currentQuery.state.fetchFailureCount,
      );
    },
    refetchIntervalInBackground: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const reconnected = isOnline && !wasOnline.current;
    const becameVisible = isVisible && !wasVisible.current;
    wasOnline.current = isOnline;
    wasVisible.current = isVisible;

    if (runId && (reconnected || becameVisible)) {
      void query.refetch({ cancelRefetch: true });
    }
  }, [isOnline, isVisible, query.refetch, runId]);

  return {
    ...query,
    run: query.data,
    isPolling:
      Boolean(query.data?.shouldPoll) &&
      isOnline &&
      isVisible,
    isOnline,
    isVisible,
  };
}

export function useRetryPipelineRunV2(runId: string) {
  const queryClient = useQueryClient();
  const idempotencyKeyRef = useRef<string | null>(null);

  return useMutation({
    mutationFn: async () => {
      const idempotencyKey =
        idempotencyKeyRef.current ??
        createIdempotencyKey(`retry-run-${runId}`);
      idempotencyKeyRef.current = idempotencyKey;
      return runsV2Repository.retry(runId, idempotencyKey);
    },
    onSuccess: async (result) => {
      idempotencyKeyRef.current = null;
      if (result.runId !== runId) {
        throw new Error('Backend retry changed the canonical run ID.');
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.runsV2.status(runId),
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status && error.status < 500) {
        idempotencyKeyRef.current = null;
      }
    },
  });
}
