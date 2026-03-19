'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { extractWebsiteHost } from '@/shared/components/campaigns/campaign-ui';
import {
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
} from '@/shared/types/campaign';
import type { Campaign } from '@/shared/types/campaign';
import type { WizardPreview } from '@/shared/types/wizard';

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
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-sm leading-6 text-foreground">{value || 'Not provided'}</p>
    </div>
  );
}

function buildSubmittedInputSections(campaign: Campaign, preview?: WizardPreview | null): SummarySection[] {
  const step1 = preview?.steps?.step1;
  const step2 = preview?.steps?.step2;
  const step3 = preview?.steps?.step3;

  return [
    {
      title: 'Business Context',
      description: 'Core business, market, and destination details submitted for review.',
      compactItems: [
        { label: 'Market', value: step1?.marketLocation || campaign.city },
        {
          label: 'Business Type',
          value: formatBusinessType(step1?.businessType || campaign.businessType || null),
        },
        {
          label: 'Business Model',
          value: formatBusinessModel(step1?.businessModel || campaign.businessModel || null),
        },
        {
          label: 'Market Scope',
          value: formatMarketScope(step1?.marketScope || campaign.marketScope || null),
        },
        {
          label: 'Website',
          value: extractWebsiteHost((step1?.websiteUrl as string | undefined) || campaign.website || null),
        },
      ],
      fullItems: [
        { label: 'Campaign Title', value: step1?.title || campaign.name },
        { label: 'Market', value: step1?.marketLocation || campaign.city },
        {
          label: 'Business Type',
          value: formatBusinessType(step1?.businessType || campaign.businessType || null),
        },
        {
          label: 'Business Model',
          value: formatBusinessModel(step1?.businessModel || campaign.businessModel || null),
        },
        {
          label: 'Market Scope',
          value: formatMarketScope(step1?.marketScope || campaign.marketScope || null),
        },
        {
          label: 'Website',
          value: extractWebsiteHost((step1?.websiteUrl as string | undefined) || campaign.website || null),
        },
      ],
    },
    {
      title: 'Offer',
      description: 'The submitted offer framing and positioning summary.',
      compactItems: [
        { label: 'Offer Summary', value: step2?.offerSummary },
        { label: 'Price Range', value: step2?.priceRange },
        { label: 'Core Promise', value: step2?.differentiators?.[0] || null },
      ],
      fullItems: [
        { label: 'Offer Summary', value: step2?.offerSummary },
        { label: 'Price Range', value: step2?.priceRange },
        { label: 'Core Promise', value: step2?.differentiators?.[0] || null },
        { label: 'Constraints', value: step2?.constraints?.join(', ') || null },
      ],
    },
    {
      title: 'Audience',
      description: 'Audience framing, language, and intent guidance from setup.',
      compactItems: [
        { label: 'Audience Summary', value: step3?.targetPersona },
        { label: 'Language / Region', value: step3?.language },
        { label: 'Desired Outcome', value: step3?.desiredOutcome },
      ],
      fullItems: [
        { label: 'Audience Summary', value: step3?.targetPersona },
        { label: 'Language / Region', value: step3?.language },
        { label: 'Intent Notes', value: step3?.painPoints?.join(', ') || null },
        { label: 'Desired Outcome', value: step3?.desiredOutcome },
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

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sections.map((section) => {
        const items = mode === 'full' ? section.fullItems : section.compactItems;

        return (
          <Card key={section.title} className="border-border bg-card">
            <CardHeader className="space-y-2">
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription className="leading-6">{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <SummaryField key={item.label} {...item} />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
