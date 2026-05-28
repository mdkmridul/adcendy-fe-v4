'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useLastCampaign } from '@/hooks/useLastCampaign';
import { CampaignListItem } from '@/shared/components/campaigns/CampaignListItem';
import { CampaignWizardModal, resolveWizardResumeStep, resolveWizardStep } from '@/shared/components/campaigns/CampaignWizardModal';
import { wizardRepository } from '@/shared/api/repositories';
import {
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
  type Campaign,
} from '@/shared/types/campaign';

interface WizardModalState {
  campaignId?: string | null;
  initialStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export default function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { campaigns, isLoading, error } = useCampaigns();
  const { setLastCampaignId } = useLastCampaign();
  const [wizardModalState, setWizardModalState] = useState<WizardModalState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) {
      return campaigns;
    }

    const query = searchQuery.toLowerCase();
    return campaigns.filter((campaign) =>
      [
        campaign.title,
        campaign.name,
        campaign.status,
        String(campaign.currentStep),
        campaign.v2SourceType,
        campaign.v2PrimaryMarket,
        ...(campaign.v2TargetMarkets ?? []),
        campaign.v2BusinessName,
        campaign.v2IndustryCategory,
        ...(campaign.v2PrimaryOfferings ?? []),
        campaign.v2PrimaryGoal,
        campaign.city,
        campaign.niche,
        campaign.businessType,
        campaign.businessModel,
        campaign.marketScope,
        formatBusinessType(campaign.businessType),
        formatBusinessModel(campaign.businessModel),
        formatMarketScope(campaign.marketScope),
      ]
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [campaigns, searchQuery]);

  const openCreateWizard = () => {
    setWizardModalState({
      campaignId: null,
      initialStep: 1,
    });
  };

  const openDraftWizard = async (campaign: Campaign) => {
    setLastCampaignId(campaign.id);
    let step = resolveWizardStep(campaign.currentStep);

    try {
      const wizardState = await wizardRepository.getWizardState(campaign.id);
      step = resolveWizardResumeStep(wizardState.lastCompletedStep);
    } catch {
      // Fall back to legacy currentStep when wizard state cannot be fetched.
    }

    setWizardModalState({
      campaignId: campaign.id,
      initialStep: step,
    });
    router.push(`/app/campaigns?draftCampaignId=${campaign.id}&wizardStep=${step}`);
  };

  useEffect(() => {
    const draftCampaignId = searchParams.get('draftCampaignId');
    const wizardStepParam = Number(searchParams.get('wizardStep'));

    if (!draftCampaignId) {
      return;
    }

    if (isLoading) {
      return;
    }

    const targetedCampaign = campaigns.find((campaign) => campaign.id === draftCampaignId);
    if (!targetedCampaign) {
      setWizardModalState(null);
      router.replace('/app/campaigns');
      return;
    }

    if (targetedCampaign.status !== 'DRAFT') {
      setWizardModalState(null);
      router.replace(`/app/campaigns/${targetedCampaign.id}`);
      return;
    }

    const hasExplicitStep =
      wizardStepParam === 1 ||
      wizardStepParam === 2 ||
      wizardStepParam === 3 ||
      wizardStepParam === 4 ||
      wizardStepParam === 5 ||
      wizardStepParam === 6 ||
      wizardStepParam === 7;

    if (hasExplicitStep) {
      setWizardModalState({
        campaignId: draftCampaignId,
        initialStep: wizardStepParam,
      });
      return;
    }

    let isCancelled = false;

    const resolveResumeStep = async () => {
      try {
        const wizardState = await wizardRepository.getWizardState(draftCampaignId);
        if (isCancelled) {
          return;
        }
        setWizardModalState({
          campaignId: draftCampaignId,
          initialStep: resolveWizardResumeStep(wizardState.lastCompletedStep),
        });
      } catch {
        if (isCancelled) {
          return;
        }
        setWizardModalState({
          campaignId: draftCampaignId,
          initialStep: 1,
        });
      }
    };

    void resolveResumeStep();

    return () => {
      isCancelled = true;
    };
  }, [campaigns, isLoading, router, searchParams]);

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-6">
            <p className="text-sm text-destructive">Failed to load campaigns: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Select a campaign to open its current workspace state.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:min-w-[320px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, source, market, business, goal, or status"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-auto border-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>

          <Button className="gap-2" onClick={openCreateWizard}>
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="h-36 animate-pulse border-border bg-card" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-14 text-center">
            <div className="mx-auto max-w-xl space-y-3">
              <h2 className="font-space-grotesk text-2xl font-semibold text-foreground">
                No campaigns yet
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Create your first campaign to set up business context, review readiness, and generate
                a strategy workspace.
              </p>
              <Button className="mt-3 gap-2" onClick={openCreateWizard}>
                <Plus className="h-4 w-4" />
                Create First Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No campaigns match your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignListItem
              key={campaign.id}
              campaign={campaign}
              onOpen={(campaignId) => setLastCampaignId(campaignId)}
              onOpenDraftWizard={openDraftWizard}
            />
          ))}
        </div>
      )}

      <CampaignWizardModal
        open={Boolean(wizardModalState)}
        onOpenChange={(open) => {
          if (!open) {
            setWizardModalState(null);
            if (searchParams.get('draftCampaignId')) {
              router.replace('/app/campaigns');
            }
          }
        }}
        campaignId={wizardModalState?.campaignId ?? null}
        initialStep={wizardModalState?.initialStep ?? 1}
      />
    </div>
  );
}
