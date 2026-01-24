'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLastCampaign } from '@/hooks/useLastCampaign';
import { Suspense } from 'react';

function AppIndexContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getLastCampaignId } = useLastCampaign();

  useEffect(() => {
    // Priority 1: Check for 'next' query param
    const nextParam = searchParams.get('next');
    if (nextParam) {
      router.replace(nextParam);
      return;
    }

    // Priority 2: Check for last campaign (returning user)
    const lastCampaignId = getLastCampaignId();
    if (lastCampaignId) {
      router.replace(`/app/campaigns/${lastCampaignId}/overview`);
      return;
    }

    // Priority 3: Fall back to campaigns list (new user)
    router.replace('/app/campaigns');
  }, [router, searchParams, getLastCampaignId]);

  return null;
}

export default function AppIndexPage() {
  return (
    <Suspense fallback={null}>
      <AppIndexContent />
    </Suspense>
  );
}
