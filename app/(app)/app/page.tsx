'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLastCampaign } from '@/hooks/useLastCampaign';

export default function AppIndexPage() {
  const router = useRouter();
  const { getLastCampaignId } = useLastCampaign();

  useEffect(() => {
    const lastCampaignId = getLastCampaignId();
    if (lastCampaignId) {
      router.push(`/app/campaigns/${lastCampaignId}/overview`);
    } else {
      router.push('/app/campaigns');
    }
  }, [router, getLastCampaignId]);

  return null;
}
