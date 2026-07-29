'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import { useOpsCampaignOverviews } from '@/hooks/useOpsV2';
import { queryKeys } from '@/shared/api/queryKeys';
import { runsV2Repository, wizardRepository } from '@/shared/api/repositories';
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
  const { user, isLoading: isAuthLoading } = useAuth();
  const overviewsQuery = useOpsCampaignOverviews(Boolean(campaignId) && enabled, {
    refetchOnMount: 'always',
  });
  const isOperationsRole = user?.role === 'ADMIN' || user?.role === 'REVIEWER';
  const recoveryQuery = useQuery({
    queryKey: queryKeys.runsV2.recovery(campaignId ?? 'unavailable', 'latest'),
    queryFn: ({ signal }) =>
      runsV2Repository.recover(campaignId as string, 'latest', signal),
    enabled: Boolean(campaignId && enabled && isOperationsRole),
    retry: false,
    refetchOnMount: 'always',
  });
  const wizardStateQuery = useQuery({
    queryKey: queryKeys.wizard.state(campaignId ?? 'unavailable'),
    queryFn: () => wizardRepository.getWizardState(campaignId as string),
    enabled: Boolean(campaignId && enabled && user?.role === 'CLIENT'),
    retry: false,
    refetchOnMount: 'always',
  });

  const overview = useMemo(() => {
    if (!campaignId) {
      return null;
    }

    return overviewsQuery.data?.find((item) => item.id === campaignId) ?? null;
  }, [campaignId, overviewsQuery.data]);

  return {
    runId:
      recoveryQuery.data?.run?.runId ??
      wizardStateQuery.data?.run?.runId ??
      overview?.pipelineRunId ??
      null,
    overview,
    isLoading:
      isAuthLoading ||
      overviewsQuery.isLoading ||
      recoveryQuery.isLoading ||
      wizardStateQuery.isLoading,
    isFetching:
      overviewsQuery.isFetching ||
      recoveryQuery.isFetching ||
      wizardStateQuery.isFetching,
    error:
      recoveryQuery.error ??
      wizardStateQuery.error ??
      overviewsQuery.error,
  };
}
