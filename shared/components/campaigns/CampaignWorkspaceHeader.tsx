'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CampaignLifecycleBadge,
  deriveCampaignState,
  getCampaignSetupHref,
  type CampaignLifecycleStage,
} from '@/shared/components/campaigns/campaign-ui';
import {
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
  type Campaign,
} from '@/shared/types/campaign';

interface CampaignWorkspaceHeaderProps {
  campaign: Campaign;
  stage: CampaignLifecycleStage;
  pathname: string;
  mobileNavigationTrigger?: ReactNode;
}

export function CampaignWorkspaceHeader({
  campaign,
  stage,
  pathname,
  mobileNavigationTrigger,
}: CampaignWorkspaceHeaderProps) {
  const campaignState = deriveCampaignState(campaign);
  const draftSetupHref = getCampaignSetupHref(campaign);
  const draftAtPreview = draftSetupHref.endsWith('/setup/preview');
  const showPrimaryAction = stage !== 'draft' || pathname.includes('/setup/preview');
  const classificationMeta = [
    formatBusinessType(campaign.businessType),
    formatBusinessModel(campaign.businessModel),
    formatMarketScope(campaign.marketScope),
  ].filter(Boolean);

  const primaryAction =
    stage === 'draft'
      ? pathname.includes('/setup/preview')
        ? {
            label: 'Generate Strategy',
            href: '#review-generate',
          }
        : draftAtPreview
          ? {
              label: 'Review & Generate',
              href: draftSetupHref,
            }
          : null
      : stage === 'waiting'
        ? pathname.includes('/overview')
          ? {
              label: 'Open Inputs',
              href: `/app/campaigns/${campaign.id}/inputs`,
            }
          : {
              label: 'Open Overview',
              href: `/app/campaigns/${campaign.id}/overview`,
            }
      : pathname.includes('/strategy')
        ? {
            label: 'Open Weekly',
            href: `/app/campaigns/${campaign.id}/weekly`,
          }
        : pathname.includes('/weekly')
          ? {
              label: 'Open Strategy',
              href: `/app/campaigns/${campaign.id}/strategy`,
            }
          : {
              label: 'Open Strategy',
              href: `/app/campaigns/${campaign.id}/strategy`,
            };

  return (
    <div className="border-b border-border bg-background/95">
      <div className="space-y-4 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {mobileNavigationTrigger}
            <Link
              href="/app/campaigns"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-space-grotesk text-3xl font-bold text-foreground">{campaign.name}</h1>
              <CampaignLifecycleBadge campaign={campaign} stage={stage} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{campaignState.marketLabel}</span>
              {classificationMeta.map((value, index) => (
                <span key={`${value}-${index}`}>{value}</span>
              ))}
              {campaignState.websiteHost ? <span>{campaignState.websiteHost}</span> : null}
              <span>Updated {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true })}</span>
            </div>
          </div>

          {showPrimaryAction && primaryAction ? (
            <Button asChild className="min-w-[180px]">
              <Link href={primaryAction.href}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
