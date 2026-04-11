'use client';

import { cn } from '@/lib/utils';
import {
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
  type Campaign,
} from '@/shared/types/campaign';
import type { WizardPreview, WizardPreviewStep4 } from '@/shared/types/wizard';
import {
  formatAvgCustomerRetention,
  formatDigitalPresenceLinkType,
  formatEmailListSize,
  formatMarketingHandler,
  formatMarketingTargetType,
  formatMonthlyMarketingSpend,
  formatMonthlyRevenue,
  formatMonthlyWebsiteTraffic,
  formatPrimaryGoal,
  formatRepeatPurchaseFrequency,
  formatSalesChannel,
  formatSocialPlatform,
  formatSourceType,
} from '@/shared/types/wizard';

type SummaryMode = 'compact' | 'full';

interface SubmittedInputsSummaryProps {
  campaign: Campaign;
  preview?: WizardPreview | null;
  mode?: SummaryMode;
}

interface SummaryItem {
  label: string;
  value?: string | null;
}

interface SummarySection {
  title: string;
  description: string;
  compactItems: SummaryItem[];
  fullItems: SummaryItem[];
}

function SummaryField({ label, value }: SummaryItem) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-sm leading-6 text-foreground">{value || 'Not provided'}</p>
    </div>
  );
}

function normalizeList(values?: string[] | null) {
  const cleaned = (values ?? []).map((value) => value.trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(', ') : null;
}

function formatSalesChannels(
  salesChannels?: { channel: string; rank: number; customName?: string | null }[],
) {
  if (!salesChannels?.length) {
    return null;
  }

  return salesChannels
    .map((item) => `${item.rank}. ${item.channel === 'other' ? item.customName || 'Other' : formatSalesChannel(item.channel)}`)
    .join(' | ');
}

function formatSocialHandles(
  socialHandles?: { platform: string; handle: string }[],
) {
  if (!socialHandles?.length) {
    return null;
  }

  return socialHandles.map((item) => `${formatSocialPlatform(item.platform)}: ${item.handle}`).join(' | ');
}

function formatDigitalPresenceLinks(
  links?: { type: string; url: string; label?: string | null }[],
) {
  if (!links?.length) {
    return null;
  }

  return links.map((item) => `${formatDigitalPresenceLinkType(item.type)}: ${item.label || item.url}`).join(' | ');
}

function formatNumber(value?: number | null, prefix = '') {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return `${prefix}${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function buildSubmittedInputSections(campaign: Campaign, preview?: WizardPreview | null): SummarySection[] {
  const step1 = preview?.steps?.step1;
  const step2 = preview?.steps?.step2;
  const step3 = preview?.steps?.step3;
  const step4 = preview?.steps?.step4 ?? (step3 as WizardPreviewStep4 | undefined);

  return [
    {
      title: 'Classification',
      description: 'What is being marketed and which source the strategy can use.',
      compactItems: [
        { label: 'Campaign Title', value: step1?.title || campaign.name },
        { label: 'Focus', value: step1?.focusName },
        { label: 'Source', value: formatSourceType(step1?.sourceType) },
      ],
      fullItems: [
        { label: 'Campaign Title', value: step1?.title || campaign.name },
        { label: 'Marketing Target', value: formatMarketingTargetType(step1?.marketingTargetType) },
        { label: 'Focus Name', value: step1?.focusName },
        { label: 'Source Type', value: formatSourceType(step1?.sourceType) },
        { label: 'Source URL', value: step1?.primaryUrl || null },
        { label: 'Market Location', value: step1?.marketLocation || campaign.city },
      ],
    },
    {
      title: 'Business And Offer',
      description: 'Business identity, offer details, channels, and digital presence.',
      compactItems: [
        { label: 'Business Type', value: formatBusinessType(step2?.businessType || campaign.businessType || null) },
        { label: 'Product / Service', value: step2?.productOrService },
        { label: 'Sales Channels', value: formatSalesChannels(step2?.salesChannels) },
      ],
      fullItems: [
        { label: 'Business Type', value: formatBusinessType(step2?.businessType || campaign.businessType || null) },
        { label: 'Business Model', value: formatBusinessModel(step2?.businessModel || campaign.businessModel || null) },
        { label: 'Market Scope', value: formatMarketScope(step2?.marketScope || campaign.marketScope || null) },
        { label: 'Product Category', value: step2?.productCategory },
        { label: 'Product / Service', value: step2?.productOrService },
        { label: 'Offer Summary', value: step2?.offerSummary },
        { label: 'Price Range', value: step2?.priceRange },
        { label: 'Differentiators', value: normalizeList(step2?.differentiators) },
        { label: 'Sales Channels', value: formatSalesChannels(step2?.salesChannels) },
        { label: 'Social Handles', value: formatSocialHandles(step2?.socialHandles) },
        { label: 'Digital Presence Links', value: formatDigitalPresenceLinks(step2?.digitalPresenceLinks) },
        { label: 'Business Description', value: step2?.businessDescription },
      ],
    },
    {
      title: 'Goals And Context',
      description: 'Targeting, goals, constraints, and supporting business context.',
      compactItems: [
        { label: 'Target Persona', value: step3?.targetPersona },
        { label: 'Goal', value: formatPrimaryGoal(step4?.primaryGoal) },
        { label: 'Spend', value: formatMonthlyMarketingSpend(step4?.monthlyMarketingSpend) },
      ],
      fullItems: [
        { label: 'Target Persona', value: step3?.targetPersona },
        { label: 'Target Audience', value: step3?.targetAudience },
        { label: 'Language', value: step3?.language },
        { label: 'Pain Points', value: normalizeList(step3?.painPoints) },
        { label: 'Desired Outcome', value: step3?.desiredOutcome },
        { label: 'Constraints', value: normalizeList(step4?.constraints) },
        { label: 'Monthly Marketing Spend', value: formatMonthlyMarketingSpend(step4?.monthlyMarketingSpend) },
        { label: 'Primary Goal', value: formatPrimaryGoal(step4?.primaryGoal) },
        { label: 'Marketing Owner', value: formatMarketingHandler(step4?.marketingHandler) },
        { label: "What's Working", value: step4?.whatsWorking },
        { label: 'Biggest Frustration', value: step4?.biggestFrustration },
        { label: 'Monthly Revenue', value: formatMonthlyRevenue(step4?.monthlyRevenue) },
        { label: 'Monthly Order Volume', value: formatNumber(step4?.monthlyOrderVolume) },
        { label: 'Product Cost', value: formatNumber(step4?.productCost, 'INR ') },
        { label: 'Retention Pattern', value: formatAvgCustomerRetention(step4?.avgCustomerRetention) },
        { label: 'Repeat Purchase Frequency', value: formatRepeatPurchaseFrequency(step4?.repeatPurchaseFrequency) },
        { label: 'Website Traffic', value: formatMonthlyWebsiteTraffic(step4?.monthlyWebsiteTraffic) },
        { label: 'Email List Size', value: formatEmailListSize(step4?.emailListSize) },
        { label: 'Google Analytics', value: step4?.googleAnalyticsConnected ? 'Connected' : null },
        { label: 'Known Competitors', value: normalizeList(step4?.knownCompetitors) },
        { label: 'Additional Context', value: step4?.additionalContext },
      ],
    },
  ];
}

export function SubmittedInputsSummary({
  campaign,
  preview,
  mode = 'compact',
}: SubmittedInputsSummaryProps) {
  const sections = buildSubmittedInputSections(campaign, preview);
  const gridClassName =
    mode === 'compact'
      ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
      : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]';

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-5 sm:p-6">
      <div className={cn('grid gap-6 lg:gap-0', gridClassName)}>
        {sections.map((section, index) => {
          const items = mode === 'compact' ? section.compactItems : section.fullItems;

          return (
            <section
              key={section.title}
              className={cn(
                'space-y-4',
                index > 0 && 'lg:border-l lg:border-border lg:pl-6',
                index < sections.length - 1 && 'lg:pr-6',
              )}
            >
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{section.description}</p>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <SummaryField key={`${section.title}-${item.label}`} {...item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
