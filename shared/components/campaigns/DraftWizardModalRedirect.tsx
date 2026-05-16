'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useCampaign } from '@/hooks/useCampaigns';
import { wizardRepository } from '@/shared/api/repositories';
import {
  getCampaignWorkspaceHref,
} from '@/shared/components/campaigns/campaign-ui';
import { resolveWizardResumeStep, resolveWizardStep } from '@/shared/components/campaigns/CampaignWizardModal';

interface DraftWizardModalRedirectProps {
  step?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
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

    if (campaign.status !== 'DRAFT') {
      router.replace(getCampaignWorkspaceHref(campaign));
      return;
    }

    let isCancelled = false;

    const redirectToWizard = async () => {
      if (step) {
        router.replace(`/app/campaigns?draftCampaignId=${campaign.id}&wizardStep=${step}`);
        return;
      }

      try {
        const wizardState = await wizardRepository.getWizardState(campaign.id);
        if (isCancelled) {
          return;
        }

        const resumeStep = resolveWizardResumeStep(wizardState.lastCompletedStep);
        router.replace(`/app/campaigns?draftCampaignId=${campaign.id}&wizardStep=${resumeStep}`);
      } catch {
        if (isCancelled) {
          return;
        }
        const fallbackStep = resolveWizardStep(campaign.currentStep);
        router.replace(`/app/campaigns?draftCampaignId=${campaign.id}&wizardStep=${fallbackStep}`);
      }
    };

    void redirectToWizard();

    return () => {
      isCancelled = true;
    };
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
