'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { userProfileRepository } from '@/shared/api/repositories';
import { hasCampaignEntitlement } from '@/shared/payments/campaign-entitlement';

export function useCampaignEntitlement() {
  const query = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => userProfileRepository.getMe(),
    refetchOnWindowFocus: true,
  });

  return {
    ...query,
    canStartCampaign: hasCampaignEntitlement(query.data),
  };
}
