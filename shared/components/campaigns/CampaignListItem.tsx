'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { type Campaign } from '@/shared/types/campaign';

function formatTokenLabel(value?: string | null) {
  if (!value) {
    return null;
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatListLabel(values?: string[]) {
  if (!values?.length) {
    return null;
  }

  return values.map((value) => value.trim()).filter(Boolean).join(', ');
}

function withFallback(value?: string | null) {
  return value && value.trim().length > 0 ? value : '-';
}

const TOP_ROW_PILL_CLASSES = [
  'border-sky-200 bg-sky-50 text-sky-800',
  'border-emerald-200 bg-emerald-50 text-emerald-800',
  'border-amber-200 bg-amber-50 text-amber-800',
];

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
  const entryHref = `/app/campaigns/${campaign.id}`;

  const openCampaign = () => {
    onOpen?.(campaign.id);
    if (campaign.status === 'DRAFT' && onOpenDraftWizard) {
      onOpenDraftWizard(campaign);
      return;
    }
    router.push(entryHref);
  };

  const targetMarkets =
    formatListLabel(campaign.v2TargetMarkets) ||
    campaign.v2PrimaryMarket ||
    campaign.city ||
    null;

  const topRowValues = [
    formatTokenLabel(campaign.status),
    `Step ${campaign.currentStep}`,
    targetMarkets,
  ];

  const secondRowValues = [
    formatTokenLabel(campaign.v2SourceType),
    campaign.v2IndustryCategory || campaign.niche || null,
    formatListLabel(campaign.v2PrimaryOfferings),
  ];

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
      <div className="min-w-0 space-y-3">
        <div className="inline-flex max-w-full rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5">
          <h2 className="truncate font-space-grotesk text-2xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {campaign.title || campaign.name}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {topRowValues.map((value, index) => {
            const isLast = index === topRowValues.length - 1;
            return (
              <div key={`top-${index}`} className="inline-flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${TOP_ROW_PILL_CLASSES[index % TOP_ROW_PILL_CLASSES.length]}`}
                >
                  {withFallback(value)}
                </span>
                {!isLast ? <span className="text-xs text-muted-foreground/70">|</span> : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          {secondRowValues.map((value, index) => {
            const isLast = index === secondRowValues.length - 1;
            return (
              <div key={`bottom-${index}`} className="inline-flex items-center gap-3">
                <span>{withFallback(value)}</span>
                {!isLast ? <span className="text-xs text-muted-foreground/70">|</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
