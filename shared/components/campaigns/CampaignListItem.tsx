'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import {
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
  type Campaign,
} from '@/shared/types/campaign';
import {
  CampaignProgressSummary,
  CampaignStatusBadge,
  deriveCampaignState,
  hasCompletedDraftSetup,
} from './campaign-ui';

export function CampaignListItem({
  campaign,
  onOpen,
  onOpenDraftWizard,
}: {
  campaign: Campaign;
  onOpen?: (campaignId: string) => void;
  onOpenDraftWizard?: (campaign: Campaign) => void;
}) {
  const router = useRouter();
  const state = deriveCampaignState(campaign);
  const entryHref = `/app/campaigns/${campaign.id}`;
  const classificationMeta = [
    formatBusinessType(campaign.businessType),
    formatBusinessModel(campaign.businessModel),
    formatMarketScope(campaign.marketScope),
  ].filter(Boolean);
  const openCampaign = () => {
    onOpen?.(campaign.id);
    if (campaign.status === 'DRAFT' && !hasCompletedDraftSetup(campaign) && onOpenDraftWizard) {
      onOpenDraftWizard(campaign);
      return;
    }
    router.push(entryHref);
  };

  return (
    <Card
      role="link"
      tabIndex={0}
      className="group cursor-pointer border-border bg-card px-5 py-4 transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={openCampaign}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCampaign();
        }
      }}
    >
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-space-grotesk text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
              {campaign.name}
            </h2>
          </div>
          <CampaignStatusBadge campaign={campaign} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {state.marketLabel}
          </span>
          {campaign.niche ? <span>{campaign.niche}</span> : null}
          {classificationMeta.map((value, index) => (
            <span key={`${value}-${index}`}>{value}</span>
          ))}
          {state.websiteHost ? (
            <span className="inline-flex items-center gap-1.5">
              {state.websiteHost}
              {campaign.website ? (
                <a
                  href={campaign.website}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Open ${state.websiteHost}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </span>
          ) : null}
          <span>Updated {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true })}</span>
        </div>

        <CampaignProgressSummary campaign={campaign} />
      </div>
    </Card>
  );
}
