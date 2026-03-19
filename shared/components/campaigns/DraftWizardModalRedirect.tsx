'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useCampaign } from '@/hooks/useCampaigns';
import {
  getCampaignWorkspaceHref,
  hasCompletedDraftSetup,
} from '@/shared/components/campaigns/campaign-ui';
import { resolveWizardStep } from '@/shared/components/campaigns/CampaignWizardModal';

interface DraftWizardModalRedirectProps {
  step?: 1 | 2 | 3 | 4;
}

export function DraftWizardModalRedirect({ step }: DraftWizardModalRedirectProps) {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const { campaign, isLoading } = useCampaign(campaignId);

  useEffect(() => {
    if (isLoading || !campaign) {
      return;
    }

    if (campaign.status !== 'DRAFT' || hasCompletedDraftSetup(campaign)) {
      router.replace(getCampaignWorkspaceHref(campaign));
      return;
    }

    const wizardStep = step ?? resolveWizardStep(campaign.currentStep);
    router.replace(`/app/campaigns?draftCampaignId=${campaign.id}&wizardStep=${wizardStep}`);
  }, [campaign, isLoading, router, step]);

  return (
    <div className="flex min-h-[280px] items-center justify-center p-6">
      <Card className="border-border bg-card">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Opening setup…</p>
        </CardContent>
      </Card>
    </div>
  );
}
