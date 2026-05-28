'use client';

import { useMemo } from 'react';
import { useOpsCampaignOverviews } from '@/hooks/useOpsV2';
import type { ID } from '@/shared/types/common';
import type { CampaignOverviewV2 } from '@/shared/types/opsV2';

interface CampaignRunWorkspaceResult {
  runId: string | null;
  overview: CampaignOverviewV2 | null;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
}

export function useCampaignRunWorkspace(campaignId: ID | null, enabled = true): CampaignRunWorkspaceResult {
  const overviewsQuery = useOpsCampaignOverviews(Boolean(campaignId) && enabled);

  const overview = useMemo(() => {
    if (!campaignId) {
      return null;
    }

    return overviewsQuery.data?.find((item) => item.id === campaignId) ?? null;
  }, [campaignId, overviewsQuery.data]);

  return {
    runId: overview?.pipelineRunId ?? null,
    overview,
    isLoading: overviewsQuery.isLoading,
    isFetching: overviewsQuery.isFetching,
    error: overviewsQuery.error,
  };
}
