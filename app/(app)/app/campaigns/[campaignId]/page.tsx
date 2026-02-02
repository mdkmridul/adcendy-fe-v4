'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCampaign } from '@/hooks/useCampaigns';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const { campaign, isLoading } = useCampaign(campaignId);

  useEffect(() => {
    if (!isLoading && campaign) {
      // If campaign is still in DRAFT, redirect to appropriate wizard step
      if (campaign.status === 'DRAFT') {
        const nextStep = campaign.currentStep || 0;
        if (nextStep === 0) {
          router.push(`/app/campaigns/${campaignId}/setup/step-1`);
        } else if (nextStep === 1) {
          router.push(`/app/campaigns/${campaignId}/setup/step-2`);
        } else if (nextStep === 2) {
          router.push(`/app/campaigns/${campaignId}/setup/step-3`);
        } else {
          router.push(`/app/campaigns/${campaignId}/setup/preview`);
        }
      } else {
        // Campaign is ACTIVE, show overview
        router.push(`/app/campaigns/${campaignId}/overview`);
      }
    }
  }, [campaign, isLoading, campaignId, router]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-24 bg-card animate-pulse rounded-lg" />
      </div>
    );
  }

  return null;
}
