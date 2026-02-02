'use client';

import { Card } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { useCampaign } from '@/hooks/useCampaigns';
import { useEffect } from 'react';

export default function OverviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const { campaign, isLoading } = useCampaign(campaignId);

  useEffect(() => {
    // Redirect DRAFT campaigns to wizard setup
    if (!isLoading && campaign?.status === 'DRAFT') {
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
    }
  }, [campaign, isLoading, campaignId, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-card animate-pulse rounded-lg" />
      </div>
    );
  }

  // Don't render if campaign is DRAFT (will redirect)
  if (campaign?.status === 'DRAFT') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold text-foreground mb-2">Campaign Overview</h2>
        <p className="text-muted-foreground">High-level campaign summary and status.</p>
      </div>

      <Card className="p-6 bg-card border border-border">
        <div className="text-center text-muted-foreground py-8">
          <p>Campaign overview content coming soon.</p>
        </div>
      </Card>
    </div>
  );
}
