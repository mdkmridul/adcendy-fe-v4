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
  const showPrimaryAction = stage === 'active' || pathname.includes('/setup/preview');
  const headerMetaItems = [
    { label: 'Market', value: campaignState.marketLabel },
    { label: 'Business Type', value: formatBusinessType(campaign.businessType) },
    { label: 'Business Model', value: formatBusinessModel(campaign.businessModel) },
    { label: 'Market Scope', value: formatMarketScope(campaign.marketScope) },
    { label: 'Website', value: campaignState.websiteHost },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

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
        ? null
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

            <div className="flex flex-wrap items-center gap-2">
              {headerMetaItems.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Updated
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true })}
                </span>
              </div>
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
