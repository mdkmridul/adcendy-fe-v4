'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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

function SummarySectionCard({
  section,
  items,
  compact = false,
  className,
}: {
  section: SummarySection;
  items: SummaryItem[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className={cn(compact ? 'space-y-1 px-5 pb-4 pt-5' : 'space-y-1.5')}>
        <CardTitle className="text-lg">{section.title}</CardTitle>
        <CardDescription className="leading-6">{section.description}</CardDescription>
      </CardHeader>
      <CardContent className={cn(compact ? 'space-y-3 px-5 pb-5' : 'space-y-4')}>
        {items.map((item) => (
          <SummaryField key={item.label} {...item} />
        ))}
      </CardContent>
    </Card>
  );
}

function SummaryField({ label, value }: SummaryItem) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
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
        { label: 'Campaign Title', value: step1?.title || campaign.name },
        { label: 'Market Location', value: step1?.marketLocation || campaign.city },
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
          label: 'Website (Optional)',
          value: extractWebsiteHost((step1?.websiteUrl as string | undefined) || campaign.website || null),
        },
      ],
      fullItems: [
        { label: 'Campaign Title', value: step1?.title || campaign.name },
        { label: 'Market Location', value: step1?.marketLocation || campaign.city },
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
          label: 'Website (Optional)',
          value: extractWebsiteHost((step1?.websiteUrl as string | undefined) || campaign.website || null),
        },
      ],
    },
    {
      title: 'Offer',
      description: 'The submitted offer framing and positioning summary.',
      compactItems: [
        { label: 'Price Range', value: step2?.priceRange },
      ],
      fullItems: [
        { label: 'Offer Summary', value: step2?.offerSummary },
        { label: 'Price Range', value: step2?.priceRange },
        { label: 'Key Differentiators', value: step2?.differentiators?.join(', ') || null },
        { label: 'Constraints (Optional)', value: step2?.constraints?.join(', ') || null },
      ],
    },
    {
      title: 'Audience',
      description: 'Audience framing, language, and intent guidance from setup.',
      compactItems: [
        { label: 'Target Persona', value: step3?.targetPersona },
      ],
      fullItems: [
        { label: 'Target Persona', value: step3?.targetPersona },
        { label: 'Language', value: step3?.language },
        { label: 'Pain Points', value: step3?.painPoints?.join(', ') || null },
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
  const gridClassName =
    mode === 'compact'
      ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.75fr)_minmax(0,0.9fr)]'
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
