'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCampaign } from '@/hooks/useCampaigns';
import { getCampaignWorkspaceHref } from '@/shared/components/campaigns/campaign-ui';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const { campaign, isLoading } = useCampaign(campaignId);

  useEffect(() => {
    if (!isLoading && campaign) {
      router.replace(getCampaignWorkspaceHref(campaign));
    }
  }, [campaign, isLoading, router]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-24 animate-pulse rounded-lg bg-card" />
      </div>
    );
  }

  return null;
}
