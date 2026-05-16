'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Controller, useFieldArray, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  AlertTriangle,
  Check,
  ChevronDown,
  CircleHelp,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLastCampaign } from '@/hooks/useLastCampaign';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/shared/api/errors';
import { queryKeys } from '@/shared/api/queryKeys';
import { campaignsRepository, wizardRepository } from '@/shared/api/repositories';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  type Step1FormData,
  type Step2FormData,
  type Step3FormData,
} from '@/shared/schemas/wizard';
import {
  BUSINESS_MODEL_OPTIONS,
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
} from '@/shared/types/campaign';
import {
  DIGITAL_PRESENCE_LINK_TYPE_OPTIONS,
  AVG_CUSTOMER_RETENTION_OPTIONS,
  EMAIL_LIST_SIZE_OPTIONS,
  MONTHLY_MARKETING_SPEND_OPTIONS,
  MONTHLY_REVENUE_OPTIONS,
  MONTHLY_WEBSITE_TRAFFIC_OPTIONS,
  REPEAT_PURCHASE_FREQUENCY_OPTIONS,
  SALES_CHANNEL_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
  formatAvgCustomerRetention,
  formatAudienceModel,
  formatDigitalPresenceLinkType,
  formatEmailListSize,
  formatLanguage,
  formatLifecycleStage,
  formatMarketingHandler,
  formatMarketingTargetType,
  formatMonthlyMarketingSpend,
  formatMonthlyRevenue,
  formatMonthlyWebsiteTraffic,
  formatPrimaryConversionPath,
  formatPrimaryGoal,
  formatReportLanguage,
  formatRepeatPurchaseFrequency,
  formatSalesChannel,
  formatSocialPlatform,
  formatSourceType,
  type DigitalPresenceLink,
  type RankedSalesChannel,
  type SocialHandle,
  type WizardFieldOptionV2,
  type WizardOptionsResponseV2,
  type WizardDerivedMetrics,
} from '@/shared/types/wizard';

type WizardModalStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface CampaignWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string | null;
  initialStep: WizardModalStep;
}

const OPTIONAL_SELECT_VALUE = '__empty__';

const EMPTY_STEP_1_VALUES: Step1FormData = {
  title: '',
  marketingTargetType: '',
  focusName: '',
  sourceType: '',
  primaryUrl: '',
  targetMarkets: [],
  primaryMarket: '',
  marketScope: '',
  operationalLocations: [],
  regionalLanguageExpansionEnabled: false,
  regionalLanguages: [],
  marketLocation: '',
};

const EMPTY_STEP_2_VALUES: Step2FormData = {
  businessName: '',
  industryCategory: '',
  businessType: '',
  businessModel: undefined as never,
  audienceModel: '',
  lifecycleStage: '',
  businessDescription: '',
  productCategory: '',
  productOrService: [],
  offerSummary: '',
  priceRange: '',
  differentiators: [],
  trustSignals: [],
  sensitiveCategoryFlags: [],
  complianceSensitiveClaims: [],
  salesChannels: [],
  primaryConversionPath: '',
  socialHandles: [],
  digitalPresenceLinks: [],
};

const EMPTY_STEP_3_VALUES: Step3FormData = {
  primaryTargetSegment: '',
  targetPersona: '',
  targetAudience: '',
  audienceSegments: [],
  language: '',
  reportLanguage: '',
  painPoints: [],
  desiredOutcome: '',
  decisionProcess: '',
  buyerRoles: [],
  constraints: [],
  monthlyMarketingSpend: undefined as never,
  paidMediaBudgetRange: '',
  primaryGoal: '',
  marketingHandler: '',
  contentCapacity: '',
  salesCapacity: '',
  currentMarketingActivity: [],
  pastMarketing: '',
  whatsWorking: '',
  biggestFrustration: '',
  knownCompetitorStatus: '',
  channelsToAvoid: [],
  channelsStronglyPreferred: [],
  executionConstraints: [],
  dataConsentOptIn: true,
  monthlyRevenue: '',
  averageOrderValue: '',
  averageContractValue: '',
  grossMarginPercentage: '',
  monthlyOrderVolume: '',
  productCost: '',
  monthlyOrdersPerSubscriber: '',
  monthlyChurnRate: '',
  avgCustomerRetention: '',
  repeatPurchaseFrequency: '',
  salesCycleLength: '',
  googleAnalyticsConnected: '',
  monthlyWebsiteTraffic: '',
  emailListSize: '',
  knownCompetitors: [],
  additionalContext: '',
};

const WIZARD_STEPS: Array<{ step: WizardModalStep; label: string; hint: string }> = [
  { step: 1, label: 'Focus', hint: 'Focus' },
  { step: 2, label: 'Business', hint: 'Business' },
  { step: 3, label: 'Audience', hint: 'Audience' },
  { step: 4, label: 'Channels', hint: 'Channels' },
  { step: 5, label: 'Goals', hint: 'Goals' },
  { step: 6, label: 'Economics', hint: 'Economics' },
  { step: 7, label: 'Review', hint: 'Review & Consent' },
];

type WizardStringOption = {
  value: string;
  label: string;
  canonicalToken?: string;
};

const STEP1_MARKETING_TARGET_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'whole_business', label: 'Whole business' },
  { value: 'product_or_service', label: 'Product / service' },
  { value: 'launch', label: 'Launch' },
  { value: 'market_expansion', label: 'Market expansion' },
  { value: 'specific_audience', label: 'Specific audience' },
  { value: 'other', label: 'Other' },
];

const STEP1_SOURCE_TYPE_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'website', label: 'Website' },
  { value: 'digital_presence_only', label: 'Digital presence only' },
  { value: 'manual_only', label: 'Manual only' },
];

const STEP1_MARKET_SCOPE_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'local', label: 'Local' },
  { value: 'regional', label: 'Regional' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
  { value: 'global', label: 'Global' },
];

const STEP2_AUDIENCE_MODEL_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'single_sided', label: 'One audience' },
  { value: 'b2b2c', label: 'Business + end customer (B2B2C)' },
  { value: 'marketplace_platform', label: 'Marketplace / two-sided platform' },
  { value: 'multi_sided', label: 'Multi-sided' },
  { value: 'not_sure', label: 'Not sure' },
];

const STEP2_LIFECYCLE_STAGE_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'pre_launch', label: 'Pre-launch' },
  { value: 'launch', label: 'Launch' },
  { value: 'growth', label: 'Growth' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'mature', label: 'Mature' },
];

const STEP3_LANGUAGE_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'regional_other', label: 'Regional language (other)' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'not_sure', label: 'Not sure' },
];

const STEP3_REPORT_LANGUAGE_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'regional_other', label: 'Regional language (other)' },
];

const STEP4_PRIMARY_CONVERSION_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'buy_online', label: 'Buy online' },
  { value: 'book_demo', label: 'Book a demo' },
  { value: 'book_call', label: 'Book a call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'retail_visit', label: 'Retail visit' },
  { value: 'app_signup', label: 'App signup' },
  { value: 'other', label: 'Other' },
];

const STEP5_PRIMARY_GOAL_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'revenue_growth', label: 'Revenue growth' },
  { value: 'lead_generation', label: 'Lead generation' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'launch_readiness', label: 'Launch readiness' },
  { value: 'retention', label: 'Retention' },
  { value: 'market_expansion', label: 'Market expansion' },
  { value: 'other', label: 'Other' },
];

const STEP5_MARKETING_HANDLER_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'founder_led', label: 'Founder-led' },
  { value: 'internal_marketer', label: 'Internal marketer' },
  { value: 'agency', label: 'Agency' },
  { value: 'in_house_team', label: 'In-house team' },
  { value: 'not_sure', label: 'Not sure' },
];

const STEP5_CONTENT_CAPACITY_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'not_sure', label: 'Not sure' },
];

const STEP5_KNOWN_COMPETITOR_STATUS_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'provided', label: 'Provided' },
  { value: 'none_known', label: 'None known' },
  { value: 'not_sure', label: 'Not sure' },
];

const STEP5_CURRENT_MARKETING_ACTIVITY_STATUS_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'discontinued', label: 'Discontinued' },
];

const STEP5_CURRENT_MARKETING_ACTIVITY_ASSESSMENT_FALLBACK_OPTIONS: WizardStringOption[] = [
  { value: 'clearly_working', label: 'Clearly working' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'not_working', label: 'Not working' },
  { value: 'not_sure', label: 'Not sure' },
];

const STEP7_DATA_CONSENT_FALLBACK_OPTIONS: WizardFieldOptionV2[] = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

const MARKETING_TARGET_DESCRIPTIONS: Record<string, string> = {
  whole_business: 'A business, brand, or store as a whole',
  product_or_service: 'One specific product or service',
  launch: 'A new launch or release',
  market_expansion: 'Expansion into a new market or geography',
  specific_audience: 'Focused on one audience segment',
  other: 'Any other strategy focus',
};

const SOURCE_TYPE_DESCRIPTIONS: Record<string, string> = {
  website: 'Use a site or landing page',
  digital_presence_only: 'Use social, listing, or profile links only',
  manual_only: 'No source URL, rely on typed inputs',
};

const WIZARD_MONO_STYLE: React.CSSProperties = {
  fontFamily: '"Geist Mono", "Courier New", monospace',
};
const WIZARD_SERIF_STYLE: React.CSSProperties = {
  fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville, Georgia, serif',
  fontFeatureSettings: '"kern" 1, "liga" 1',
  textRendering: 'optimizeLegibility',
};
const WIZARD_CONTRAST_THEME = {
  '--background': '#050607',
  '--foreground': '#f2eadb',
  '--card': '#0a0b0d',
  '--card-foreground': '#f2eadb',
  '--popover': '#0b0d10',
  '--popover-foreground': '#f2eadb',
  '--primary': '#d4a853',
  '--primary-foreground': '#11100d',
  '--secondary': '#131417',
  '--secondary-foreground': '#f2eadb',
  '--muted': '#101113',
  '--muted-foreground': 'rgba(242, 234, 219, 0.72)',
  '--accent': '#141518',
  '--accent-foreground': '#f2eadb',
  '--border': 'rgba(212, 168, 83, 0.22)',
  '--input': '#0a0b0d',
  '--ring': 'rgba(212, 168, 83, 0.5)',
} as React.CSSProperties;

function WizardSectionCard({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('overflow-hidden rounded-[18px] border border-[rgba(242,234,219,0.16)] bg-[rgba(10,11,13,0.88)] shadow-[0_1px_0_rgba(50,56,65,0.03)]', className)}>
      <div className="border-b border-[rgba(242,234,219,0.1)] px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(242,234,219,0.62)]">{eyebrow}</p>
        <div className="mt-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[rgba(242,234,219,0.92)]">{title}</h3>
            {description ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[rgba(242,234,219,0.62)] transition hover:text-[rgba(242,234,219,0.92)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,168,83,0.24)]"
                    aria-label={`More information about ${title}`}
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="max-w-[260px] rounded-lg bg-[rgba(11,13,16,0.96)] px-3 py-2 text-xs leading-5 text-[rgba(242,234,219,0.92)]">
                  {description}
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </section>
  );
}

function SummaryField({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[rgba(242,234,219,0.62)]">{label}</p>
      <p className={cn('text-[14px] leading-6 text-[rgba(242,234,219,0.92)]', !value && 'italic text-[rgba(242,234,219,0.42)]')}>{value || 'Not provided'}</p>
    </div>
  );
}

function FieldLabel({
  label,
  helper,
  required,
  className,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <p className="text-[14px] font-semibold leading-6 text-[rgba(242,234,219,0.92)]">
        {label}
        {required ? <span className="ml-1 text-[rgba(212,168,83,0.9)]">*</span> : null}
      </p>
      {helper ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[rgba(242,234,219,0.62)] transition hover:text-[rgba(242,234,219,0.92)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,168,83,0.24)]"
              aria-label={`More information about ${label}`}
            >
              <CircleHelp className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="max-w-[220px] rounded-lg bg-[rgba(11,13,16,0.96)] px-2.5 py-2 text-xs leading-5 text-[rgba(242,234,219,0.92)]">
            {helper}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

function StepTrail({
  step,
}: {
  step: WizardModalStep;
}) {
  return (
    <div className="flex items-start">
      {WIZARD_STEPS.map((wizardStep, index) => {
        const isComplete = wizardStep.step < step;
        const isActive = wizardStep.step === step;

        return (
          <div key={wizardStep.step} className="flex min-w-0 flex-1 items-start">
            <div className="flex min-w-[48px] flex-col items-center gap-3 text-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-semibold transition',
                  isComplete
                    ? 'border-[rgba(212,168,83,0.5)] bg-[rgba(212,168,83,0.22)] text-[rgba(242,234,219,0.92)]'
                    : isActive
                      ? 'border-[rgba(212,168,83,0.5)] bg-[rgba(212,168,83,0.22)] text-[rgba(242,234,219,0.92)] ring-[4px] ring-[rgba(212,168,83,0.25)]'
                      : 'border-[rgba(242,234,219,0.16)] bg-[rgba(10,11,13,0.88)] text-[rgba(242,234,219,0.62)]',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : `0${wizardStep.step}`}
              </div>
              <p
                style={WIZARD_MONO_STYLE}
                className={cn('text-[10px] font-semibold uppercase tracking-[0.08em]', isActive || isComplete ? 'text-[rgba(242,234,219,0.92)]' : 'text-[rgba(242,234,219,0.5)]')}
              >
                {wizardStep.label}
              </p>
            </div>
            {index < WIZARD_STEPS.length - 1 ? (
              <div className="mt-[18px] h-[1.5px] flex-1 bg-[rgba(242,234,219,0.12)]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-[rgba(242,234,219,0.1)]" />;
}

function ReviewSection({
  title,
  description,
  filledLabel,
  onEdit,
  children,
  confirmationId,
  confirmationLabel,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  filledLabel: string;
  onEdit: () => void;
  children: ReactNode;
  confirmationId?: string;
  confirmationLabel?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <Card className="rounded-[18px] border-border/80 bg-card/95 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 py-5">
        <div className="space-y-1">
          <CardTitle className="text-[17px] font-semibold text-foreground">{title}</CardTitle>
          <CardDescription className="text-[14px] leading-6 text-foreground/80">{description}</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[14px] text-foreground/80">{filledLabel}</p>
          <Button type="button" variant="outline" size="sm" className="rounded-xl border-border/80 bg-card/95 px-4" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="border-t border-border/60 px-6 py-6">
        {children}
      </CardContent>
      {confirmationId && confirmationLabel && onCheckedChange ? (
        <CardFooter className="px-6 pb-5 pt-0">
          <div className="flex w-full items-start gap-4 rounded-2xl border border-border/80 bg-card/95 p-4">
            <Checkbox
              id={confirmationId}
              checked={checked}
              onCheckedChange={(next) => onCheckedChange(next === true)}
              className="mt-1"
            />
            <div className="space-y-1">
              <label htmlFor={confirmationId} className="cursor-pointer text-sm font-medium text-foreground/90">
                {confirmationLabel}
              </label>
            </div>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function countFilled(values: Array<string | number | boolean | null | undefined | unknown[]>) {
  return values.reduce<number>((count, value) => {
    if (Array.isArray(value)) {
      return value.length ? count + 1 : count;
    }

    if (typeof value === 'boolean') {
      return value ? count + 1 : count;
    }

    return value ? count + 1 : count;
  }, 0);
}

function ReviewGrid({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
      {children}
    </div>
  );
}

function CheckSummaryCard({
  id,
  checked,
  onCheckedChange,
  label,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex w-full items-start gap-4 rounded-2xl border border-border/80 bg-card/95 p-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next === true)}
        className="mt-1"
      />
      <div className="space-y-1">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground/90">
          {label}
        </label>
      </div>
    </div>
  );
}

function ReviewLoadingCard() {
  return (
    <Card className="h-40 animate-pulse rounded-[18px] border-border/80 bg-card/95 shadow-none" />
  );
}

function StepFooter({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="border-t border-[rgba(242,234,219,0.1)] bg-[rgba(9,10,12,0.92)] px-7 py-5">
      <div className="mx-auto flex w-full max-w-[920px] justify-end gap-3">
        {children}
      </div>
    </div>
  );
}

function GhostFooterSpacer() {
  return <div className="h-1" />;
}

function OptionBullet({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-[rgba(10,11,13,0.88)] transition',
        selected ? 'border-[rgba(212,168,83,0.55)]' : 'border-[rgba(242,234,219,0.16)]',
      )}
    >
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full transition',
          selected ? 'bg-[rgba(212,168,83,0.86)]' : 'bg-transparent',
        )}
      />
    </span>
  );
}

function EmptyDashedAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[48px] w-full items-center justify-center rounded-2xl border border-dashed border-[rgba(242,234,219,0.16)] bg-[rgba(10,11,13,0.88)] text-[15px] font-medium text-[rgba(242,234,219,0.62)] transition hover:border-[rgba(212,168,83,0.45)] hover:text-[rgba(242,234,219,0.92)]"
    >
      {children}
    </button>
  );
}

function FilledCounterLabel({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return <>{`${current}/${total} filled`}</>;
}

function SelectFieldWrapper({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function FieldTextArea({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-2">{children}</div>;
}

function FieldInput({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-2">{children}</div>;
}

function FooterButtonRow({
  children,
}: {
  children: ReactNode;
}) {
  return <StepFooter>{children}</StepFooter>;
}

function QuietHint({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="text-[13px] leading-6 text-[rgba(242,234,219,0.62)]">{children}</p>
  );
}

function SoftNotice({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[rgba(14,15,18,0.86)] px-4 py-3 text-[14px] leading-6 text-[rgba(242,234,219,0.62)]">
      {children}
    </div>
  );
}

function FixedCheckboxRow({
  id,
  checked,
  onCheckedChange,
  label,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex w-full items-start gap-4 rounded-2xl border border-[rgba(242,234,219,0.16)] bg-[rgba(10,11,13,0.88)] p-4">
      <Checkbox id={id} checked={checked} onCheckedChange={(next) => onCheckedChange(next === true)} className="mt-1" />
      <label htmlFor={id} className="cursor-pointer text-sm font-medium text-[rgba(242,234,219,0.88)]">
        {label}
      </label>
    </div>
  );
}

function ReviewSectionStack({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-5">{children}</div>;
}

function InlineDivider() {
  return <div className="border-t border-[rgba(242,234,219,0.1)]" />;
}

function StepPage({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="mt-6 space-y-5">{children}</div>;
}

function ReviewContentWrap({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-5">{children}</div>;
}

function ReviewFooter({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="border-t border-[rgba(242,234,219,0.1)] bg-[rgba(9,10,12,0.92)] px-7 py-5">
      <div className="mx-auto flex w-full max-w-[920px] justify-end gap-3">{children}</div>
    </div>
  );
}

function InlineMutedLabel({
  children,
}: {
  children: ReactNode;
}) {
  return <p className="text-[14px] leading-6 text-[rgba(242,234,219,0.62)]">{children}</p>;
}

function RequiredAsterisk() {
  return <span className="ml-1 text-[rgba(212,168,83,0.9)]">*</span>;
}

function LabelText({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function OptionLabelDescription({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-[15px] font-semibold leading-[1.35] text-foreground">{label}</p>
      {description ? <p className="max-w-[22ch] text-[14px] leading-[1.55] text-foreground/80">{description}</p> : null}
    </div>
  );
}

function ReviewConfirmCard({
  id,
  checked,
  onCheckedChange,
  label,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return <FixedCheckboxRow id={id} checked={checked} onCheckedChange={onCheckedChange} label={label} />;
}

function FinalConfirmationCard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[18px] border-[rgba(242,234,219,0.16)] bg-[rgba(10,11,13,0.88)] shadow-none">
      {children}
    </Card>
  );
}

function LightHeaderRow({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-3">{children}</div>;
}

function MutedSummaryText({
  children,
}: {
  children: ReactNode;
}) {
  return <span className="text-[rgba(242,234,219,0.62)]">{children}</span>;
}

function CompactCardContent({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-4">{children}</div>;
}

function TightDivider() {
  return <div className="border-t border-[rgba(242,234,219,0.1)]" />;
}

function GhostSecondaryText({
  children,
}: {
  children: ReactNode;
}) {
  return <p className="text-[14px] leading-6 text-[rgba(242,234,219,0.62)]">{children}</p>;
}

function ReviewStat({
  children,
}: {
  children: ReactNode;
}) {
  return <span>{children}</span>;
}

function LightStepHeader({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-4">{children}</div>;
}

function ReviewTopRow({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-5">{children}</div>;
}

function OptionCardContent({
  children,
  density = 'default',
}: {
  children: ReactNode;
  density?: 'default' | 'compact' | 'inline' | 'list';
}) {
  return (
    <div
      className={cn(
        'grid items-start',
        density === 'inline' ? 'grid-cols-[18px_minmax(0,1fr)] gap-x-3' : 'grid-cols-[20px_minmax(0,1fr)] gap-x-4',
      )}
    >
      {children}
    </div>
  );
}

function DarkPrimaryButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        'rounded-2xl border border-[rgba(212,168,83,0.52)] bg-[#d4a853] px-6 text-[#11100d] hover:bg-[#e0ba6a]',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

function LightOutlineButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn(
        'rounded-2xl border-[rgba(212,168,83,0.34)] bg-[rgba(10,11,13,0.88)] px-6 text-[rgba(212,168,83,0.9)] hover:border-[rgba(212,168,83,0.52)] hover:bg-[rgba(8,9,11,0.92)] hover:text-[rgba(242,234,219,0.92)]',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

function SmallEditButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        'rounded-xl border-[rgba(212,168,83,0.32)] bg-[rgba(10,11,13,0.88)] px-4 text-[rgba(212,168,83,0.9)] hover:bg-[rgba(8,9,11,0.92)]',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

function ReviewNotProvidedText({
  children,
}: {
  children: ReactNode;
}) {
  return <span className="italic text-foreground/55">{children}</span>;
}

function ReviewTitle({
  children,
}: {
  children: ReactNode;
}) {
    return <>{children}</>;
}

function ReviewDesc({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

function ReviewFilled({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

function ReviewEdit({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

function ReviewSectionHeader({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

function ReviewBody({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

function ReviewCheckbox({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

function ReviewFooterAction({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

function FinalIconWrap({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="rounded-xl border border-border/80 bg-muted/60 p-2">{children}</div>;
}

function MutedHelper({
  children,
}: {
  children: ReactNode;
}) {
  return <p className="text-[14px] leading-6 text-foreground/80">{children}</p>;
}

function SubtleNote({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="rounded-2xl bg-muted/60 px-4 py-3 text-[14px] leading-6 text-foreground/80">{children}</div>;
}

function EmptyActionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return <EmptyDashedAction onClick={onClick}>{children}</EmptyDashedAction>;
}

function FieldMeta({
  error,
}: {
  error?: string;
}) {
  if (!error) {
    return null;
  }

  return (
    <div className="space-y-1">
      <p className="text-xs leading-5 text-destructive">{error}</p>
    </div>
  );
}

function TagInputField({
  label,
  helper,
  required,
  placeholder,
  footnote,
  values,
  pendingValue,
  onPendingChange,
  onAdd,
  onRemove,
  error,
  className,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  placeholder: string;
  footnote?: string;
  values: string[];
  pendingValue: string;
  onPendingChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-1">
        <FieldLabel label={label} helper={helper} required={required} />
        <FieldMeta error={error} />
      </div>

      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <Badge key={`${label}-${value}-${index}`} variant="secondary" className="gap-2 rounded-full border border-border/80 bg-card/95 px-3 py-1 text-foreground/90 shadow-none">
              <span className="max-w-[220px] truncate">{value}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="rounded-full text-foreground/75 transition hover:text-foreground/90"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          className="h-[46px] rounded-[12px] border-border/80 bg-card/95 px-4 text-[15px] text-foreground shadow-none placeholder:text-foreground/60"
          value={pendingValue}
          onChange={(event) => onPendingChange(event.target.value)}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.stopPropagation();
              onAdd();
            }
          }}
        />
        <LightOutlineButton type="button" onClick={onAdd} className="h-[46px] px-5 sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add
        </LightOutlineButton>
      </div>
      {footnote ? <p className="text-[13px] leading-6 text-foreground/80">{footnote}</p> : null}
    </div>
  );
}

function SelectCardGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  helper,
  required,
  error,
  columnsClassName = 'md:grid-cols-3',
  density = 'default',
}: {
  label: string;
  value?: T;
  options: Array<{ value: T; label: string; description?: string }>;
  onChange: (value: T) => void;
  helper?: string;
  required?: boolean;
  error?: string;
  columnsClassName?: string;
  density?: 'default' | 'compact' | 'inline' | 'list';
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <FieldLabel label={label} helper={helper} required={required} />
        <FieldMeta error={error} />
      </div>
      <div className={cn('grid items-start gap-3', columnsClassName)}>
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-2xl border bg-[rgba(10,11,13,0.88)] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,168,83,0.32)]',
                density === 'inline'
                  ? 'px-4 py-4'
                  : density === 'list'
                    ? 'px-4 py-3.5'
                  : density === 'compact'
                    ? 'px-5 py-4'
                    : 'px-5 py-[18px]',
                isSelected
                  ? 'border-[rgba(212,168,83,0.55)] shadow-[0_8px_18px_rgba(50,56,65,0.06)]'
                  : 'border-[rgba(242,234,219,0.16)] hover:border-[rgba(212,168,83,0.45)]',
              )}
            >
              <OptionCardContent density={density}>
                <OptionBullet selected={isSelected} />
                <div className={cn('min-w-0 space-y-1.5', density !== 'default' && 'space-y-1')}>
                  <p
                    className={cn(
                      'font-semibold text-foreground',
                      density === 'inline' ? 'text-[14px] leading-[1.3]' : density === 'list' ? 'text-[15px] leading-[1.3]' : 'text-[15px] leading-[1.35]',
                    )}
                  >
                    {option.label}
                  </p>
                  {option.description ? (
                    <p
                      className={cn(
                        'text-foreground/80',
                        density === 'inline' ? 'text-[13px] leading-[1.45]' : density === 'list' ? 'text-[14px] leading-[1.45]' : 'text-[14px] leading-[1.55]',
                      )}
                    >
                      {option.description}
                    </p>
                  ) : null}
                </div>
              </OptionCardContent>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function moveToNextWizardField(event: KeyboardEvent<HTMLElement>) {
  if (
    event.key !== 'Enter' ||
    event.shiftKey ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.nativeEvent.isComposing
  ) {
    return;
  }

  const target = event.target as HTMLElement | null;
  const currentField = target?.closest('input, textarea, [role="combobox"]') as HTMLElement | null;
  const form = currentField?.closest('form');

  if (!currentField || !form) {
    return;
  }

  event.preventDefault();

  const fields = Array.from(
    form.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), [role="combobox"]:not([disabled])',
    ),
  ).filter((field) => field.offsetParent !== null && field.getAttribute('aria-hidden') !== 'true');

  const currentIndex = fields.findIndex((field) => field === currentField);
  if (currentIndex === -1 || currentIndex >= fields.length - 1) {
    return;
  }

  fields[currentIndex + 1]?.focus();
}

function getFieldOptions(
  wizardOptions: WizardOptionsResponseV2 | undefined,
  fieldKey: string,
) {
  const rawOptions = wizardOptions?.fieldOptions?.[fieldKey];

  if (!Array.isArray(rawOptions)) {
    return [];
  }

  return rawOptions;
}

function getStringFieldOptions(
  wizardOptions: WizardOptionsResponseV2 | undefined,
  fieldKey: string,
  fallbackOptions: WizardStringOption[],
) {
  const options = getFieldOptions(wizardOptions, fieldKey)
    .filter((option): option is WizardFieldOptionV2 & { value: string } => typeof option.value === 'string')
    .map((option) => ({
      value: option.value,
      label: option.label || option.value,
      canonicalToken: option.canonicalToken,
    }));

  return options.length ? options : fallbackOptions;
}

function getBooleanFieldOptions(
  wizardOptions: WizardOptionsResponseV2 | undefined,
  fieldKey: string,
  fallbackOptions: WizardFieldOptionV2[],
) {
  const options = getFieldOptions(wizardOptions, fieldKey)
    .filter((option): option is WizardFieldOptionV2 & { value: boolean } => typeof option.value === 'boolean')
    .map((option) => ({
      value: option.value,
      label: option.label || String(option.value),
      canonicalToken: option.canonicalToken,
    }));

  return options.length ? options : fallbackOptions;
}

function normalizeStringOptionValue(value: unknown, options: WizardStringOption[]) {
  const normalizedValue = normalizeString(typeof value === 'string' ? value : undefined);
  if (!normalizedValue) {
    return '';
  }

  return options.some((option) => option.value === normalizedValue) ? normalizedValue : '';
}

function getDefaultStringOptionValue(options: WizardStringOption[], preferredValue?: string) {
  if (preferredValue && options.some((option) => option.value === preferredValue)) {
    return preferredValue;
  }

  return options[0]?.value ?? '';
}

function getDefaultBooleanOptionValue(options: WizardFieldOptionV2[], preferredValue: boolean) {
  if (options.some((option) => option.value === preferredValue)) {
    return preferredValue;
  }

  const firstBoolean = options.find((option) => typeof option.value === 'boolean');
  return typeof firstBoolean?.value === 'boolean' ? firstBoolean.value : preferredValue;
}

function normalizeString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '';
}

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function validateSourceUrl(sourceType: string | undefined, rawUrl: string | undefined) {
  const normalizedUrl = rawUrl?.trim() || '';

  if (sourceType === 'manual_only') {
    return { valid: true, normalizedUrl: '' };
  }

  if (!normalizedUrl) {
    return {
      valid: false,
      normalizedUrl,
      message: 'A source URL is required for this source type.',
    };
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return {
      valid: false,
      normalizedUrl,
      message: 'Please enter a valid URL.',
    };
  }

  return { valid: true, normalizedUrl };
}

function getTopLevelErrorFields<TFieldValues extends Record<string, unknown>>(
  errors: FieldErrors<TFieldValues>,
) {
  return Object.keys(errors) as Array<keyof TFieldValues>;
}

function normalizeListItems(items?: unknown) {
  if (Array.isArray(items)) {
    return items
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof items === 'string') {
    const normalized = items.trim();
    return normalized ? [normalized] : [];
  }

  return [];
}

function normalizeCurrentMarketingActivityItems(
  items: unknown,
  statusOptions: WizardStringOption[],
  assessmentOptions: WizardStringOption[],
): Step3FormData['currentMarketingActivity'] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const channel = normalizeString(typeof entry.channel === 'string' ? entry.channel : '');
      const status = normalizeStringOptionValue(entry.status, statusOptions);
      const workingAssessment = normalizeStringOptionValue(entry.workingAssessment, assessmentOptions);

      if (!channel && !status) {
        return null;
      }

      return {
        channel,
        status: status || getDefaultStringOptionValue(statusOptions),
        workingAssessment,
        evidence: normalizeString(typeof entry.evidence === 'string' ? entry.evidence : ''),
        monthlySpend: normalizeString(typeof entry.monthlySpend === 'string' ? entry.monthlySpend : ''),
        timeRunning: normalizeString(typeof entry.timeRunning === 'string' ? entry.timeRunning : ''),
        reasonStopped: normalizeString(typeof entry.reasonStopped === 'string' ? entry.reasonStopped : ''),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function inferReportLanguageFromInput(language: string) {
  const normalized = language.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized.includes('hindi')) {
    return 'hindi';
  }

  if (normalized.includes('english')) {
    return 'english';
  }

  if (normalized.includes('regional') || normalized.includes('tamil') || normalized.includes('telugu') || normalized.includes('kannada') || normalized.includes('malayalam') || normalized.includes('marathi') || normalized.includes('bengali') || normalized.includes('gujarati') || normalized.includes('punjabi')) {
    return 'regional_other';
  }

  return null;
}

function isAudienceSegmentsRequired(audienceModel: unknown) {
  return audienceModel === 'b2b2c' || audienceModel === 'marketplace_platform' || audienceModel === 'multi_sided';
}

function isBuyerRolesRequired({
  businessModel,
  audienceModel,
  decisionProcess,
}: {
  businessModel: unknown;
  audienceModel: unknown;
  decisionProcess: string;
}) {
  const normalizedDecisionProcess = decisionProcess.trim().toLowerCase();
  const committeeLikeDecision = /committee|approval|approver|sign[-\s]?off|procurement|stakeholder/.test(normalizedDecisionProcess);
  const businessModelRequiresRoles = businessModel === 'B2B';
  const audienceModelRequiresRoles = audienceModel === 'b2b2c' || audienceModel === 'marketplace_platform';

  return businessModelRequiresRoles || audienceModelRequiresRoles || committeeLikeDecision;
}

type PrimaryConversionPathValue = string;

function normalizePrimaryConversionPath(
  value: unknown,
  options: WizardStringOption[],
): PrimaryConversionPathValue | '' {
  return normalizeStringOptionValue(value, options);
}

type GoogleAnalyticsConnectedValue = Step3FormData['googleAnalyticsConnected'];

function normalizeGoogleAnalyticsConnected(value: unknown): GoogleAnalyticsConnectedValue {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }

    if (normalizedValue === 'unknown' || normalizedValue === 'not_sure') {
      return 'unknown';
    }
  }

  return '';
}

function toGoogleAnalyticsSelectValue(value: GoogleAnalyticsConnectedValue) {
  if (value === true) {
    return 'true';
  }

  if (value === false) {
    return 'false';
  }

  if (value === 'unknown') {
    return 'unknown';
  }

  return OPTIONAL_SELECT_VALUE;
}

function fromGoogleAnalyticsSelectValue(value: string): GoogleAnalyticsConnectedValue {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (value === 'unknown') {
    return 'unknown';
  }

  return '';
}

function formatGoogleAnalyticsConnected(value: boolean | 'unknown' | null | undefined) {
  if (value === true) {
    return 'Connected';
  }

  if (value === false) {
    return 'Not connected';
  }

  if (value === 'unknown') {
    return 'Unknown';
  }

  return null;
}

function inferPrimaryConversionPathFromSalesChannels(channels?: RankedSalesChannel[]): PrimaryConversionPathValue {
  const primaryChannel = normalizeSalesChannels(channels)[0]?.channel;
  if (!primaryChannel) {
    return 'other';
  }

  if (primaryChannel === 'whatsapp') {
    return 'whatsapp';
  }

  if (primaryChannel === 'retail_store') {
    return 'retail_visit';
  }

  if (primaryChannel === 'direct_sales') {
    return 'book_call';
  }

  return 'buy_online';
}

function normalizeSalesChannels(channels?: RankedSalesChannel[]) {
  return (channels ?? [])
    .map((item) => ({
      channel: item.channel,
      rank: typeof item.rank === 'number' ? item.rank : Number(item.rank),
      customName: normalizeString(item.customName),
    }))
    .filter((item) => item.channel);
}

function coerceSocialHandles(value: unknown): SocialHandle[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const platform = normalizeString((item as { platform?: string }).platform);
      const handle = normalizeString((item as { handle?: string }).handle);

      if (!platform && !handle) {
        return null;
      }

      return {
        platform: platform as SocialHandle['platform'],
        handle,
      };
    })
    .filter(Boolean) as SocialHandle[];
}

function coerceDigitalPresenceLinks(value: unknown): DigitalPresenceLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const type = normalizeString((item as { type?: string }).type);
      const url = normalizeString((item as { url?: string }).url);
      const label = normalizeString((item as { label?: string | null }).label);

      if (!type && !url && !label) {
        return null;
      }

      return {
        type: type as DigitalPresenceLink['type'],
        url,
        label: label || '',
      };
    })
    .filter(Boolean) as DigitalPresenceLink[];
}

function formatRankedSalesChannels(channels?: RankedSalesChannel[]) {
  const normalizedChannels = normalizeSalesChannels(channels);
  if (!normalizedChannels.length) {
    return null;
  }

  return normalizedChannels
    .map((item) => `${item.rank}. ${item.channel === 'other' ? item.customName || 'Other' : formatSalesChannel(item.channel)}`)
    .join(' | ');
}

function formatStringList(values?: string[] | null) {
  const cleaned = normalizeListItems(values);
  return cleaned.length ? cleaned.join(', ') : null;
}

function formatStringOrList(value?: string | string[] | null) {
  const cleaned = normalizeListItems(value);
  return cleaned.length ? cleaned.join(', ') : null;
}

function formatCurrentMarketingActivity(
  activities?:
    | Array<{
        channel?: string | null;
        status?: string | null;
        workingAssessment?: string | null;
      }>
    | null,
) {
  if (!activities?.length) {
    return null;
  }

  const cleaned = activities
    .map((activity) => {
      const channel = normalizeString(activity.channel ?? '');
      const status = normalizeString(activity.status ?? '');
      const assessment = normalizeString(activity.workingAssessment ?? '');

      if (!channel) {
        return '';
      }

      return `${channel}${status ? ` (${status})` : ''}${assessment ? ` - ${assessment}` : ''}`;
    })
    .filter(Boolean);

  return cleaned.length ? cleaned.join(', ') : null;
}

function formatSocialHandles(handles?: SocialHandle[]) {
  if (!handles?.length) {
    return null;
  }

  return handles
    .map((item) => `${formatSocialPlatform(item.platform)}: ${item.handle}`)
    .join(' | ');
}

function formatDigitalPresenceLinks(links?: DigitalPresenceLink[]) {
  if (!links?.length) {
    return null;
  }

  return links
    .map((item) => `${formatDigitalPresenceLinkType(item.type)}: ${item.label || item.url}`)
    .join(' | ');
}

function getFocusNameLabel(sourceType?: Step1FormData['marketingTargetType']) {
  if (sourceType === 'product_or_service') {
    return 'Product or service focus';
  }

  if (sourceType === 'launch') {
    return 'Launch focus';
  }

  if (sourceType === 'specific_audience') {
    return 'Audience focus';
  }

  if (sourceType === 'market_expansion') {
    return 'Expansion focus';
  }

  if (sourceType === 'other') {
    return 'Marketing focus name';
  }

  return 'Business focus name';
}

function getFocusNameHelper(sourceType?: Step1FormData['marketingTargetType']) {
  if (sourceType === 'product_or_service') {
    return 'Name the product or service being marketed.';
  }

  if (sourceType === 'launch') {
    return 'Name the launch campaign, offer, or release focus.';
  }

  if (sourceType === 'specific_audience') {
    return 'Name the audience segment this campaign targets.';
  }

  if (sourceType === 'market_expansion') {
    return 'Name the market expansion focus for this campaign.';
  }

  if (sourceType === 'other') {
    return 'Add a short name that best describes this campaign focus.';
  }

  return 'Name the whole business or brand being marketed.';
}

function getSourceUrlLabel(sourceType?: string) {
  if (sourceType === 'digital_presence_only') {
    return 'Digital presence URL';
  }

  return 'Website / landing page URL';
}

function pickDerivedValue(
  derived: WizardDerivedMetrics | null | undefined,
  keys: string[],
) {
  if (!derived) {
    return null;
  }

  for (const key of keys) {
    const value = derived[key];
    if (value !== undefined && value !== null && `${value}`.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function formatDerivedEstimate(value: unknown) {
  if (typeof value === 'number') {
    return `INR ${new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(value)}`;
  }

  if (typeof value === 'string') {
    return value;
  }

  return null;
}

function getSalesChannelsErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const fieldError = error as { message?: string; root?: { message?: string } };
  return fieldError.message || fieldError.root?.message;
}

function getArrayFieldError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  return (error as { message?: string }).message;
}

export function resolveWizardStep(currentStep: number | null | undefined): WizardModalStep {
  if (!currentStep || currentStep <= 1) {
    return 1;
  }

  if (currentStep === 2) {
    return 2;
  }

  if (currentStep === 3) {
    return 3;
  }

  if (currentStep === 4) {
    return 4;
  }

  if (currentStep === 5) {
    return 5;
  }

  if (currentStep === 6) {
    return 6;
  }

  return 7;
}

export function resolveWizardResumeStep(lastCompletedStep: number | null | undefined): WizardModalStep {
  if (!lastCompletedStep || lastCompletedStep <= 0) {
    return 1;
  }

  if (lastCompletedStep >= 7) {
    return 7;
  }

  return (lastCompletedStep + 1) as WizardModalStep;
}

export function CampaignWizardModal({
  open,
  onOpenChange,
  campaignId,
  initialStep,
}: CampaignWizardModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLastCampaignId } = useLastCampaign();
  const { toast } = useToast();

  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(campaignId ?? null);
  const [step, setStep] = useState<WizardModalStep>(initialStep);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showCommitConfirmDialog, setShowCommitConfirmDialog] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);

  const [confirmFocus, setConfirmFocus] = useState(false);
  const [confirmBusiness, setConfirmBusiness] = useState(false);
  const [confirmAudience, setConfirmAudience] = useState(false);
  const [confirmGoals, setConfirmGoals] = useState(false);
  const [confirmEconomics, setConfirmEconomics] = useState(false);
  const [readyToGenerate, setReadyToGenerate] = useState(false);

  const [targetMarketDraft, setTargetMarketDraft] = useState('');
  const [operationalLocationDraft, setOperationalLocationDraft] = useState('');
  const [regionalLanguageDraft, setRegionalLanguageDraft] = useState('');
  const [differentiatorDraft, setDifferentiatorDraft] = useState('');
  const [trustSignalDraft, setTrustSignalDraft] = useState('');
  const [productOrServiceDraft, setProductOrServiceDraft] = useState('');
  const [sensitiveFlagDraft, setSensitiveFlagDraft] = useState('');
  const [complianceClaimDraft, setComplianceClaimDraft] = useState('');
  const [audienceSegmentDraft, setAudienceSegmentDraft] = useState('');
  const [constraintDraft, setConstraintDraft] = useState('');
  const [channelsToAvoidDraft, setChannelsToAvoidDraft] = useState('');
  const [channelsPreferredDraft, setChannelsPreferredDraft] = useState('');
  const [executionConstraintDraft, setExecutionConstraintDraft] = useState('');
  const [painPointDraft, setPainPointDraft] = useState('');
  const [buyerRoleDraft, setBuyerRoleDraft] = useState('');
  const [competitorDraft, setCompetitorDraft] = useState('');

  const step1VersionRef = useRef<number>(0);
  const step2VersionRef = useRef<number>(0);
  const step3VersionRef = useRef<number>(0);
  const step4VersionRef = useRef<number>(0);
  const step5VersionRef = useRef<number>(0);
  const step6VersionRef = useRef<number>(0);
  const step1SnapshotRef = useRef<Step1FormData>(EMPTY_STEP_1_VALUES);
  const step3SnapshotRef = useRef<Step3FormData>(EMPTY_STEP_3_VALUES);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isDismissClosingRef = useRef(false);
  const autoCreatedDraftIdRef = useRef<string | null>(null);
  const hasSavedStep1Ref = useRef(Boolean(campaignId));

  useEffect(() => {
    if (open) {
      isDismissClosingRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveCampaignId(campaignId ?? null);
    setStep(initialStep);
    setErrorMessage(null);
    setSuccessMessage(null);
    setConfirmFocus(false);
    setConfirmBusiness(false);
    setConfirmAudience(false);
    setConfirmGoals(false);
    setConfirmEconomics(false);
    setReadyToGenerate(false);
    setShowCommitConfirmDialog(false);
    autoCreatedDraftIdRef.current = null;
    hasSavedStep1Ref.current = Boolean(campaignId);
  }, [campaignId, initialStep, open]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    toast({
      description: successMessage,
    });
  }, [successMessage, toast]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    toast({
      variant: 'destructive',
      description: errorMessage,
    });
  }, [errorMessage, toast]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [open, step]);

  const syncWizardUrl = (nextCampaignId: string, nextStep: WizardModalStep) => {
    router.replace(`/app/campaigns?draftCampaignId=${nextCampaignId}&wizardStep=${nextStep}`);
  };

  const { data: campaign } = useQuery({
    queryKey: activeCampaignId ? queryKeys.campaigns.detail(activeCampaignId) : ['campaigns', 'wizard-modal-idle'],
    queryFn: () => campaignsRepository.getCampaign(activeCampaignId as string),
    enabled: Boolean(activeCampaignId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.preview(activeCampaignId) : ['wizard', 'preview-idle'],
    queryFn: () => wizardRepository.getPreview(activeCampaignId as string),
    enabled: Boolean(activeCampaignId) && step === 7,
  });

  const { data: wizardState } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.state(activeCampaignId) : ['wizard', 'state-idle'],
    queryFn: () => wizardRepository.getWizardState(activeCampaignId as string),
    enabled: Boolean(activeCampaignId),
    refetchOnWindowFocus: false,
  });

  const { data: wizardOptions } = useQuery({
    queryKey: queryKeys.wizard.options(activeCampaignId ?? undefined),
    queryFn: () => wizardRepository.getWizardOptions(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const marketingTargetTypeOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'marketingTargetType', STEP1_MARKETING_TARGET_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const sourceTypeOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'sourceType', STEP1_SOURCE_TYPE_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const marketScopeOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'marketScope', STEP1_MARKET_SCOPE_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const industryCategoryOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'industryCategory', []),
    [wizardOptions],
  );
  const audienceModelOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'audienceModel', STEP2_AUDIENCE_MODEL_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const lifecycleStageOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'lifecycleStage', STEP2_LIFECYCLE_STAGE_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const sensitiveCategoryFlagOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'sensitiveCategoryFlags', []),
    [wizardOptions],
  );
  const languageOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'language', STEP3_LANGUAGE_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const reportLanguageOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'reportLanguage', STEP3_REPORT_LANGUAGE_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const primaryConversionPathOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'primaryConversionPath', STEP4_PRIMARY_CONVERSION_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const primaryGoalOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'primaryGoal', STEP5_PRIMARY_GOAL_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const marketingHandlerOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'marketingHandler', STEP5_MARKETING_HANDLER_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const contentCapacityOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'contentCapacity', STEP5_CONTENT_CAPACITY_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const knownCompetitorStatusOptions = useMemo(
    () => getStringFieldOptions(wizardOptions, 'knownCompetitorStatus', STEP5_KNOWN_COMPETITOR_STATUS_FALLBACK_OPTIONS),
    [wizardOptions],
  );
  const currentMarketingActivityStatusOptions = useMemo(
    () =>
      getStringFieldOptions(
        wizardOptions,
        'currentMarketingActivityStatus',
        STEP5_CURRENT_MARKETING_ACTIVITY_STATUS_FALLBACK_OPTIONS,
      ),
    [wizardOptions],
  );
  const currentMarketingActivityAssessmentOptions = useMemo(
    () =>
      getStringFieldOptions(
        wizardOptions,
        'currentMarketingActivityAssessment',
        STEP5_CURRENT_MARKETING_ACTIVITY_ASSESSMENT_FALLBACK_OPTIONS,
      ),
    [wizardOptions],
  );
  const dataConsentOptInOptions = useMemo(
    () => getBooleanFieldOptions(wizardOptions, 'dataConsentOptIn', STEP7_DATA_CONSENT_FALLBACK_OPTIONS),
    [wizardOptions],
  );

  const stepVersion = wizardState?.version;
  const step1Data = useMemo(
    () => ({ data: (wizardState?.steps?.step1 ?? {}) as Record<string, unknown>, version: stepVersion }),
    [stepVersion, wizardState?.steps?.step1],
  );
  const step2Data = useMemo(
    () => ({ data: (wizardState?.steps?.step2 ?? {}) as Record<string, unknown>, version: stepVersion }),
    [stepVersion, wizardState?.steps?.step2],
  );
  const step3Data = useMemo(
    () => ({ data: (wizardState?.steps?.step3 ?? {}) as Record<string, unknown>, version: stepVersion }),
    [stepVersion, wizardState?.steps?.step3],
  );
  const step4Data = useMemo(
    () => ({ data: (wizardState?.steps?.step4 ?? {}) as Record<string, unknown>, version: stepVersion }),
    [stepVersion, wizardState?.steps?.step4],
  );
  const step5Data = useMemo(
    () => ({ data: (wizardState?.steps?.step5 ?? {}) as Record<string, unknown>, version: stepVersion }),
    [stepVersion, wizardState?.steps?.step5],
  );
  const step6Data = useMemo(
    () => ({ data: (wizardState?.steps?.step6 ?? {}) as Record<string, unknown>, version: stepVersion }),
    [stepVersion, wizardState?.steps?.step6],
  );
  const step7Data = useMemo(
    () => ({ data: (wizardState?.steps?.step7 ?? {}) as Record<string, unknown>, version: stepVersion }),
    [stepVersion, wizardState?.steps?.step7],
  );

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: EMPTY_STEP_1_VALUES,
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: EMPTY_STEP_2_VALUES,
  });

  const step3Form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: EMPTY_STEP_3_VALUES,
  });

  const {
    fields: salesChannelFields,
    append: appendSalesChannel,
    remove: removeSalesChannel,
  } = useFieldArray({
    control: step2Form.control,
    name: 'salesChannels',
  });

  const {
    fields: socialHandleFields,
    append: appendSocialHandle,
    remove: removeSocialHandle,
  } = useFieldArray({
    control: step2Form.control,
    name: 'socialHandles',
  });

  const {
    fields: digitalPresenceFields,
    append: appendDigitalPresence,
    remove: removeDigitalPresence,
  } = useFieldArray({
    control: step2Form.control,
    name: 'digitalPresenceLinks',
  });

  const {
    fields: currentMarketingActivityFields,
    append: appendCurrentMarketingActivity,
    remove: removeCurrentMarketingActivity,
  } = useFieldArray({
    control: step3Form.control,
    name: 'currentMarketingActivity',
  });

  const watchedMarketingTargetType = step1Form.watch('marketingTargetType');
  const watchedSourceType = step1Form.watch('sourceType');
  const watchedTargetMarkets = step1Form.watch('targetMarkets') ?? [];
  const watchedRegionalLanguageExpansionEnabled = step1Form.watch('regionalLanguageExpansionEnabled');
  const watchedOperationalLocations = step1Form.watch('operationalLocations') ?? [];
  const watchedRegionalLanguages = step1Form.watch('regionalLanguages') ?? [];
  const watchedMarketScope = step1Form.watch('marketScope');
  const watchedDifferentiators = step2Form.watch('differentiators') ?? [];
  const watchedTrustSignals = step2Form.watch('trustSignals') ?? [];
  const watchedProductOrService = step2Form.watch('productOrService') ?? [];
  const watchedSensitiveCategoryFlags = step2Form.watch('sensitiveCategoryFlags') ?? [];
  const watchedComplianceSensitiveClaims = step2Form.watch('complianceSensitiveClaims') ?? [];
  const watchedSalesChannels = step2Form.watch('salesChannels') ?? [];
  const watchedAudienceSegments = step3Form.watch('audienceSegments') ?? [];
  const watchedPainPoints = step3Form.watch('painPoints') ?? [];
  const watchedBuyerRoles = step3Form.watch('buyerRoles') ?? [];
  const watchedDecisionProcess = step3Form.watch('decisionProcess') ?? '';
  const watchedAudienceModel = step2Form.watch('audienceModel');
  const watchedBusinessModel = step2Form.watch('businessModel');
  const audienceSegmentsRequired = isAudienceSegmentsRequired(watchedAudienceModel);
  const buyerRolesRequired = isBuyerRolesRequired({
    businessModel: watchedBusinessModel,
    audienceModel: watchedAudienceModel,
    decisionProcess: watchedDecisionProcess,
  });
  const watchedConstraints = step3Form.watch('constraints') ?? [];
  const watchedChannelsToAvoid = step3Form.watch('channelsToAvoid') ?? [];
  const watchedChannelsStronglyPreferred = step3Form.watch('channelsStronglyPreferred') ?? [];
  const watchedExecutionConstraints = step3Form.watch('executionConstraints') ?? [];
  const watchedCompetitors = step3Form.watch('knownCompetitors') ?? [];
  const watchedKnownCompetitorStatus = step3Form.watch('knownCompetitorStatus');
  // V2 wizard must persist each step; local-only preview mode is disabled.
  const uiPreviewMode = false;

  useEffect(() => {
    if (!open || step !== 1 || !activeCampaignId) {
      return;
    }

    const savedData = (step1Data?.data ?? {}) as Record<string, unknown>;
    const isFreshAutoCreatedDraft =
      activeCampaignId !== null &&
      activeCampaignId === autoCreatedDraftIdRef.current &&
      !hasSavedStep1Ref.current &&
      campaign?.currentStep === 0 &&
      Object.keys(savedData).length === 0;

    const sourceTypeFallbackPreference =
      normalizeString(savedData.primaryUrl as string | undefined) ||
      normalizeString(savedData.websiteUrl as string | undefined) ||
      (!isFreshAutoCreatedDraft ? campaign?.website || '' : '')
        ? 'website'
        : 'manual_only';
    const inferredSourceType =
      normalizeStringOptionValue(savedData.sourceType, sourceTypeOptions) ||
      getDefaultStringOptionValue(sourceTypeOptions, sourceTypeFallbackPreference);
    const inferredProductOrService = normalizeListItems(savedData.productOrService as string[] | string | undefined);
    const inferredMarketingTargetType =
      normalizeStringOptionValue(savedData.marketingTargetType, marketingTargetTypeOptions) ||
      getDefaultStringOptionValue(
        marketingTargetTypeOptions,
        inferredProductOrService.length ? 'product_or_service' : 'whole_business',
      );
    const inferredMarketScope =
      normalizeStringOptionValue(savedData.marketScope, marketScopeOptions) ||
      normalizeStringOptionValue(campaign?.marketScope, marketScopeOptions);

    const nextValues: Step1FormData = {
      title: normalizeString(savedData.title as string | undefined) || (isFreshAutoCreatedDraft ? '' : campaign?.name) || '',
      marketingTargetType: inferredMarketingTargetType,
      focusName:
        normalizeString(savedData.focusName as string | undefined) ||
        inferredProductOrService[0] ||
        normalizeString(savedData.title as string | undefined) ||
        (isFreshAutoCreatedDraft ? '' : campaign?.name) ||
        '',
      sourceType: inferredSourceType,
      primaryUrl:
        inferredSourceType === 'manual_only'
          ? ''
          : normalizeString(savedData.primaryUrl as string | undefined) ||
            normalizeString(savedData.websiteUrl as string | undefined) ||
            (isFreshAutoCreatedDraft ? '' : campaign?.website) ||
            '',
      targetMarkets: (() => {
        const savedMarkets = normalizeListItems(savedData.targetMarkets);
        if (savedMarkets.length) {
          return savedMarkets;
        }
        const marketLocation = normalizeString(savedData.marketLocation as string | undefined) || (isFreshAutoCreatedDraft ? '' : campaign?.city) || '';
        return marketLocation ? [marketLocation] : [];
      })(),
      primaryMarket:
        normalizeString(savedData.primaryMarket as string | undefined) ||
        normalizeString(savedData.marketLocation as string | undefined) ||
        (isFreshAutoCreatedDraft ? '' : campaign?.city) ||
        '',
      marketScope: inferredMarketScope,
      operationalLocations: (() => {
        const savedLocations = normalizeListItems(savedData.operationalLocations);
        if (savedLocations.length) {
          return savedLocations;
        }
        const marketLocation = normalizeString(savedData.marketLocation as string | undefined) || (isFreshAutoCreatedDraft ? '' : campaign?.city) || '';
        return marketLocation ? [marketLocation] : [];
      })(),
      regionalLanguageExpansionEnabled: Boolean(savedData.regionalLanguageExpansionEnabled),
      regionalLanguages: normalizeListItems(savedData.regionalLanguages),
      marketLocation: normalizeString(savedData.marketLocation as string | undefined) || (isFreshAutoCreatedDraft ? '' : campaign?.city) || '',
    };

    step1SnapshotRef.current = nextValues;
    step1Form.reset(nextValues);

    if (step1Data?.version !== undefined) {
      step1VersionRef.current = step1Data.version;
    }
  }, [
    activeCampaignId,
    campaign,
    marketScopeOptions,
    marketingTargetTypeOptions,
    open,
    sourceTypeOptions,
    step,
    step1Data,
  ]);

  useEffect(() => {
    if (!open || (step !== 2 && step !== 4) || !activeCampaignId) {
      return;
    }

    const savedData = (step2Data?.data ?? {}) as Record<string, unknown>;
    const legacyStep1Data = (step1Data?.data ?? {}) as Record<string, unknown>;
    const savedChannelsData = (step4Data?.data ?? {}) as Record<string, unknown>;
    const nextSocialHandles = coerceSocialHandles(savedChannelsData.socialHandles);
    const nextDigitalPresenceLinks = coerceDigitalPresenceLinks(savedChannelsData.digitalPresenceLinks);
    const industryCategoryCandidate =
      normalizeString(savedData.industryCategory as string | undefined) ||
      normalizeString(savedData.businessType as string | undefined) ||
      normalizeString(legacyStep1Data.businessType as string | undefined) ||
      normalizeString(campaign?.businessType as string | undefined);
    const normalizedIndustryCategory = industryCategoryOptions.length
      ? normalizeStringOptionValue(industryCategoryCandidate, industryCategoryOptions)
      : industryCategoryCandidate;
    const normalizedAudienceModel =
      normalizeStringOptionValue(savedData.audienceModel, audienceModelOptions) ||
      getDefaultStringOptionValue(audienceModelOptions, 'not_sure');
    const normalizedLifecycleStage =
      normalizeStringOptionValue(savedData.lifecycleStage, lifecycleStageOptions) ||
      getDefaultStringOptionValue(lifecycleStageOptions, 'growth');
    const normalizedPrimaryConversionPath =
      normalizePrimaryConversionPath(savedChannelsData.primaryConversionPath, primaryConversionPathOptions) ||
      normalizePrimaryConversionPath(
        inferPrimaryConversionPathFromSalesChannels(savedChannelsData.salesChannels as RankedSalesChannel[] | undefined),
        primaryConversionPathOptions,
      ) ||
      '';

    step2Form.reset({
      businessName:
        normalizeString(savedData.businessName as string | undefined) ||
        normalizeString(step1SnapshotRef.current.title) ||
        normalizeString(step1SnapshotRef.current.focusName),
      industryCategory: normalizedIndustryCategory,
      businessType:
        normalizeString(savedData.businessType as string | undefined) ||
        normalizeString(savedData.industryCategory as string | undefined) ||
        normalizeString(legacyStep1Data.businessType as string | undefined) ||
        normalizeString(campaign?.businessType as string | undefined) ||
        '',
      businessModel:
        (savedData.businessModel as Step2FormData['businessModel']) ||
        (legacyStep1Data.businessModel as Step2FormData['businessModel']) ||
        campaign?.businessModel ||
        undefined as never,
      audienceModel: normalizedAudienceModel,
      lifecycleStage: normalizedLifecycleStage,
      businessDescription:
        normalizeString(savedData.businessDescription as string | undefined) ||
        normalizeString(legacyStep1Data.businessDescription as string | undefined),
      productCategory:
        normalizeString(savedData.productCategory as string | undefined) ||
        normalizeString(legacyStep1Data.productCategory as string | undefined),
      productOrService:
        (() => {
          const nextValue =
            savedData.productsServices ??
            savedData.productOrService ??
            legacyStep1Data.productsServices ??
            legacyStep1Data.productOrService;
          const normalized = normalizeListItems(nextValue as string[] | string | undefined);
          if (normalized.length) {
            return normalized;
          }
          const fallbackFocus = normalizeString(step1SnapshotRef.current.focusName);
          return fallbackFocus ? [fallbackFocus] : [];
        })(),
      offerSummary: normalizeString(savedData.offerSummary as string | undefined),
      priceRange:
        normalizeString(savedData.priceRange as string | undefined) ||
        normalizeString(legacyStep1Data.priceRange as string | undefined),
      differentiators: normalizeListItems(savedData.differentiators as string[] | undefined),
      trustSignals: normalizeListItems(
        (savedChannelsData.trustSignals as string[] | string | undefined) ??
          (savedData.trustSignals as string[] | string | undefined),
      ),
      sensitiveCategoryFlags: normalizeListItems(savedData.sensitiveCategoryFlags as string[] | undefined),
      complianceSensitiveClaims: normalizeListItems(savedData.complianceSensitiveClaims as string[] | undefined),
      salesChannels: normalizeSalesChannels(savedChannelsData.salesChannels as RankedSalesChannel[] | undefined) as Step2FormData['salesChannels'],
      primaryConversionPath: normalizedPrimaryConversionPath,
      socialHandles: nextSocialHandles as Step2FormData['socialHandles'],
      digitalPresenceLinks: nextDigitalPresenceLinks as Step2FormData['digitalPresenceLinks'],
    });

    if (step2Data?.version !== undefined) {
      step2VersionRef.current = step2Data.version;
    }

    if (step4Data?.version !== undefined) {
      step4VersionRef.current = step4Data.version;
    }
  }, [
    activeCampaignId,
    audienceModelOptions,
    campaign,
    industryCategoryOptions,
    lifecycleStageOptions,
    open,
    primaryConversionPathOptions,
    step,
    step1Data,
    step2Data,
    step2Form,
    step4Data,
  ]);

  useEffect(() => {
    const targetMarkets = step1Form.getValues('targetMarkets') ?? [];
    const primaryMarket = normalizeString(step1Form.getValues('primaryMarket') ?? '');

    if (!targetMarkets.length) {
      if (primaryMarket) {
        step1Form.setValue('primaryMarket', '', {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
      return;
    }

    if (targetMarkets.length === 1) {
      if (primaryMarket !== targetMarkets[0]) {
        step1Form.setValue('primaryMarket', targetMarkets[0], {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
      return;
    }

    if (primaryMarket && !targetMarkets.includes(primaryMarket)) {
      step1Form.setValue('primaryMarket', '', {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [step1Form, watchedTargetMarkets]);

  useEffect(() => {
    if (!open || (step !== 3 && step !== 4 && step !== 5 && step !== 6 && step !== 7) || !activeCampaignId) {
      return;
    }

    const savedAudienceData = (step3Data?.data ?? {}) as Record<string, unknown>;
    const savedChannelsData = (step4Data?.data ?? {}) as Record<string, unknown>;
    const savedGoalsData = (step5Data?.data ?? {}) as Record<string, unknown>;
    const savedEconomicsData = (step6Data?.data ?? {}) as Record<string, unknown>;
    const savedFinalData = (step7Data?.data ?? {}) as Record<string, unknown>;
    const legacyStep2Data = (step2Data?.data ?? {}) as Record<string, unknown>;
    const nextConstraints = normalizeListItems(savedGoalsData.constraints as string[] | undefined);
    const normalizedLanguage =
      normalizeStringOptionValue(savedAudienceData.language, languageOptions) ||
      getDefaultStringOptionValue(languageOptions);
    const normalizedReportLanguage = normalizeStringOptionValue(savedAudienceData.reportLanguage, reportLanguageOptions);
    const normalizedPrimaryGoal =
      normalizeStringOptionValue(savedGoalsData.primaryGoal, primaryGoalOptions) ||
      normalizeStringOptionValue(legacyStep2Data.primaryGoal, primaryGoalOptions) ||
      getDefaultStringOptionValue(primaryGoalOptions);
    const normalizedMarketingHandler =
      normalizeStringOptionValue(savedGoalsData.marketingHandler, marketingHandlerOptions) ||
      normalizeStringOptionValue(legacyStep2Data.marketingHandler, marketingHandlerOptions) ||
      getDefaultStringOptionValue(marketingHandlerOptions);
    const normalizedContentCapacity =
      normalizeStringOptionValue(savedGoalsData.contentCapacity, contentCapacityOptions) ||
      getDefaultStringOptionValue(contentCapacityOptions, 'not_sure');
    const normalizedKnownCompetitors = normalizeListItems(savedGoalsData.knownCompetitors as string[] | undefined);
    const normalizedKnownCompetitorStatus =
      normalizeStringOptionValue(savedGoalsData.knownCompetitorStatus, knownCompetitorStatusOptions) ||
      (normalizedKnownCompetitors.length
        ? normalizeStringOptionValue('provided', knownCompetitorStatusOptions) ||
          getDefaultStringOptionValue(knownCompetitorStatusOptions, 'provided')
        : getDefaultStringOptionValue(knownCompetitorStatusOptions, 'not_sure'));
    const normalizedDataConsentOptIn = getDefaultBooleanOptionValue(
      dataConsentOptInOptions,
      savedFinalData.dataConsentOptIn === false ? false : true,
    );
    const nextValues: Step3FormData = {
      primaryTargetSegment: normalizeString(savedAudienceData.primaryTargetSegment as string | undefined),
      targetPersona: normalizeString(savedAudienceData.targetPersona as string | undefined),
      targetAudience: normalizeString(savedAudienceData.targetAudience as string | undefined),
      audienceSegments: normalizeListItems(savedAudienceData.audienceSegments as string[] | undefined),
      language: normalizedLanguage,
      reportLanguage: normalizedReportLanguage,
      painPoints: normalizeListItems(savedAudienceData.painPoints as string[] | undefined),
      desiredOutcome: normalizeString(savedAudienceData.desiredOutcome as string | undefined),
      decisionProcess: normalizeString(savedAudienceData.decisionProcess as string | undefined),
      buyerRoles: normalizeListItems(savedAudienceData.buyerRoles as string[] | undefined),
      constraints: nextConstraints.length ? nextConstraints : normalizeListItems(legacyStep2Data.constraints as string[] | undefined),
      monthlyMarketingSpend:
        (savedGoalsData.monthlyMarketingSpend as Step3FormData['monthlyMarketingSpend']) ||
        (legacyStep2Data.monthlyMarketingSpend as Step3FormData['monthlyMarketingSpend']) ||
        undefined as never,
      paidMediaBudgetRange:
        normalizeString(savedGoalsData.paidMediaBudgetRange as string | undefined) ||
        normalizeString(savedGoalsData.monthlyMarketingSpend as string | undefined),
      primaryGoal: normalizedPrimaryGoal,
      marketingHandler: normalizedMarketingHandler,
      contentCapacity: normalizedContentCapacity,
      salesCapacity: normalizeString(savedGoalsData.salesCapacity as string | undefined),
      currentMarketingActivity: normalizeCurrentMarketingActivityItems(
        savedGoalsData.currentMarketingActivity,
        currentMarketingActivityStatusOptions,
        currentMarketingActivityAssessmentOptions,
      ),
      pastMarketing: normalizeString(savedGoalsData.pastMarketing as string | undefined),
      whatsWorking:
        normalizeString(savedGoalsData.whatsWorking as string | undefined) ||
        normalizeString(legacyStep2Data.whatsWorking as string | undefined),
      biggestFrustration:
        normalizeString(savedGoalsData.biggestFrustration as string | undefined) ||
        normalizeString(legacyStep2Data.biggestFrustration as string | undefined),
      knownCompetitorStatus: normalizedKnownCompetitorStatus,
      channelsToAvoid: normalizeListItems(savedGoalsData.channelsToAvoid as string[] | undefined),
      channelsStronglyPreferred: normalizeListItems(savedGoalsData.channelsStronglyPreferred as string[] | undefined),
      executionConstraints: normalizeListItems(savedGoalsData.executionConstraints as string[] | undefined),
      dataConsentOptIn: normalizedDataConsentOptIn,
      monthlyRevenue: (savedEconomicsData.monthlyRevenue as Step3FormData['monthlyRevenue']) || '',
      averageOrderValue: normalizeString(savedEconomicsData.averageOrderValue as string | undefined),
      averageContractValue: normalizeString(savedEconomicsData.averageContractValue as string | undefined),
      grossMarginPercentage: normalizeString(savedEconomicsData.grossMarginPercentage as string | undefined),
      monthlyOrderVolume:
        typeof savedEconomicsData.monthlyOrderVolume === 'number'
          ? String(savedEconomicsData.monthlyOrderVolume)
          : normalizeString(savedEconomicsData.monthlyOrderVolume as string | undefined),
      productCost:
        typeof savedEconomicsData.productCost === 'number'
          ? String(savedEconomicsData.productCost)
          : normalizeString(savedEconomicsData.productCost as string | undefined),
      monthlyOrdersPerSubscriber: normalizeString(savedEconomicsData.monthlyOrdersPerSubscriber as string | undefined),
      monthlyChurnRate: normalizeString(savedEconomicsData.monthlyChurnRate as string | undefined),
      avgCustomerRetention: (savedEconomicsData.avgCustomerRetention as Step3FormData['avgCustomerRetention']) || '',
      repeatPurchaseFrequency: (savedEconomicsData.repeatPurchaseFrequency as Step3FormData['repeatPurchaseFrequency']) || '',
      salesCycleLength: normalizeString(savedEconomicsData.salesCycleLength as string | undefined),
      googleAnalyticsConnected: normalizeGoogleAnalyticsConnected(savedChannelsData.googleAnalyticsConnected),
      monthlyWebsiteTraffic: (savedChannelsData.monthlyWebsiteTraffic as Step3FormData['monthlyWebsiteTraffic']) || '',
      emailListSize: (savedChannelsData.emailListSize as Step3FormData['emailListSize']) || '',
      knownCompetitors: normalizedKnownCompetitors,
      additionalContext: normalizeString(savedGoalsData.additionalContext as string | undefined),
    };

    step3SnapshotRef.current = nextValues;
    step3Form.reset(nextValues);
    setShowOptionalDetails(
      Boolean(
        nextValues.monthlyRevenue ||
          nextValues.averageOrderValue ||
          nextValues.averageContractValue ||
          nextValues.grossMarginPercentage ||
          nextValues.monthlyOrderVolume ||
          nextValues.productCost ||
          nextValues.monthlyOrdersPerSubscriber ||
          nextValues.monthlyChurnRate ||
          nextValues.avgCustomerRetention ||
          nextValues.repeatPurchaseFrequency ||
          nextValues.salesCycleLength ||
          nextValues.googleAnalyticsConnected === true ||
          nextValues.googleAnalyticsConnected === 'unknown' ||
          nextValues.monthlyWebsiteTraffic ||
          nextValues.emailListSize ||
          nextValues.knownCompetitors.length ||
          nextValues.channelsToAvoid.length ||
          nextValues.channelsStronglyPreferred.length ||
          nextValues.executionConstraints.length ||
          nextValues.constraints.length ||
          nextValues.pastMarketing ||
          nextValues.whatsWorking ||
          nextValues.biggestFrustration ||
          nextValues.additionalContext ||
          nextValues.dataConsentOptIn !== true,
      ),
    );

    if (step3Data?.version !== undefined) {
      step3VersionRef.current = step3Data.version;
    }

    if (step4Data?.version !== undefined) {
      step4VersionRef.current = step4Data.version;
    }

    if (step5Data?.version !== undefined) {
      step5VersionRef.current = step5Data.version;
    }

    if (step6Data?.version !== undefined) {
      step6VersionRef.current = step6Data.version;
    }

  }, [
    activeCampaignId,
    contentCapacityOptions,
    currentMarketingActivityAssessmentOptions,
    currentMarketingActivityStatusOptions,
    dataConsentOptInOptions,
    knownCompetitorStatusOptions,
    languageOptions,
    marketingHandlerOptions,
    open,
    primaryGoalOptions,
    reportLanguageOptions,
    step,
    step2Data,
    step3Data,
    step4Data,
    step5Data,
    step6Data,
    step7Data,
  ]);

  const addListItem = (
    values: string[],
    draftValue: string,
    setDraftValue: (value: string) => void,
    onChange: (nextValues: string[]) => void,
  ) => {
    const normalized = draftValue.trim();
    if (!normalized) {
      return;
    }

    onChange([...values, normalized]);
    setDraftValue('');
  };

  const removeListItem = (
    values: string[],
    index: number,
    onChange: (nextValues: string[]) => void,
  ) => {
    onChange(values.filter((_, itemIndex) => itemIndex !== index));
  };

  const createOrSaveStep1Mutation = useMutation({
    mutationFn: async (data: Step1FormData) => {
      const normalizedTargetMarkets = normalizeListItems(data.targetMarkets);
      const normalizedOperationalLocations = normalizeListItems(data.operationalLocations);
      const normalizedRegionalLanguages = normalizeListItems(data.regionalLanguages);
      const normalizedPrimaryMarket =
        normalizeString(data.primaryMarket) ||
        (normalizedTargetMarkets.length === 1 ? normalizedTargetMarkets[0] : '');
      const normalizedMarketLocation =
        normalizedPrimaryMarket ||
        normalizedTargetMarkets[0] ||
        normalizeString(data.marketLocation) ||
        '';
      const step1Payload = {
        title: normalizeString(data.title),
        marketingTargetType: data.marketingTargetType,
        focusName: normalizeString(data.focusName),
        sourceType: data.sourceType,
        primaryUrl: data.sourceType === 'manual_only' ? null : normalizeNullableString(data.primaryUrl),
        targetMarkets: normalizedTargetMarkets,
        primaryMarket: normalizedPrimaryMarket || null,
        marketScope: data.marketScope,
        operationalLocations: normalizedOperationalLocations,
        regionalLanguageExpansionEnabled: Boolean(data.regionalLanguageExpansionEnabled),
        regionalLanguages: data.regionalLanguageExpansionEnabled ? normalizedRegionalLanguages : [],
        marketLocation: normalizedMarketLocation,
      };

      step1SnapshotRef.current = {
        ...data,
        primaryUrl: step1Payload.primaryUrl || '',
        targetMarkets: normalizedTargetMarkets,
        primaryMarket: normalizedPrimaryMarket,
        operationalLocations: normalizedOperationalLocations,
        regionalLanguages: data.regionalLanguageExpansionEnabled ? normalizedRegionalLanguages : [],
        marketLocation: normalizedMarketLocation,
      };
      let nextCampaignId = activeCampaignId;

      if (!nextCampaignId) {
        const draftCampaign = await campaignsRepository.createDraftCampaign();
        nextCampaignId = draftCampaign.id;
        autoCreatedDraftIdRef.current = draftCampaign.id;
      }

      if (!nextCampaignId) {
        throw new Error('Campaign not found.');
      }

      await wizardRepository.saveStep(nextCampaignId, 'STEP_1', {
        data: step1Payload,
        version: step1VersionRef.current,
      });

      // Keep campaign-list title in sync with Step 1 so drafts don't stay as "Untitled Campaign".
      const syncedCampaignTitle =
        normalizeString(step1Payload.title) ||
        normalizeString(step1Payload.focusName) ||
        'Untitled Campaign';
      const syncedMarketLocation =
        normalizeString(step1Payload.primaryMarket || '') ||
        normalizeString(step1Payload.marketLocation || '') ||
        (step1Payload.targetMarkets?.[0] ?? '').trim();
      try {
        await campaignsRepository.updateCampaign(nextCampaignId, {
          title: syncedCampaignTitle,
          marketLocation: syncedMarketLocation || undefined,
          websiteUrl: step1Payload.primaryUrl ?? null,
        });
      } catch {
        // Non-blocking: wizard Step 1 is already persisted via v2 wizard API.
      }

      return { campaignId: nextCampaignId };
    },
    onSuccess: async ({ campaignId: nextCampaignId }) => {
      hasSavedStep1Ref.current = true;
      autoCreatedDraftIdRef.current = null;
      setLastCampaignId(nextCampaignId);
      setActiveCampaignId(nextCampaignId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(nextCampaignId) }),
      ]);
      setStep(2);
      syncWizardUrl(nextCampaignId, 2);
      setErrorMessage(null);
      setSuccessMessage('Step 1 saved successfully.');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save campaign classification.');
    },
  });

  const saveStep2Mutation = useMutation({
    mutationFn: async (data: Step2FormData) => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }

      return wizardRepository.saveStep(activeCampaignId, 'STEP_2', {
        data: {
          businessName: normalizeNullableString(data.businessName),
          industryCategory: normalizeNullableString(data.industryCategory),
          businessType: normalizeNullableString(data.businessType) ?? normalizeNullableString(data.industryCategory),
          businessModel: data.businessModel,
          audienceModel: data.audienceModel,
          lifecycleStage: data.lifecycleStage,
          businessDescription: normalizeString(data.businessDescription),
          productCategory: normalizeString(data.productCategory),
          productOrService: normalizeListItems(data.productOrService),
          productsServices: normalizeListItems(data.productOrService),
          offerSummary: normalizeString(data.offerSummary),
          priceRange: normalizeString(data.priceRange),
          differentiators: normalizeListItems(data.differentiators),
          sensitiveCategoryFlags: normalizeListItems(data.sensitiveCategoryFlags),
          complianceSensitiveClaims: normalizeListItems(data.complianceSensitiveClaims),
        },
        version: step2VersionRef.current,
      });
    },
    onSuccess: async () => {
      if (!activeCampaignId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(activeCampaignId) }),
      ]);
      setStep(3);
      syncWizardUrl(activeCampaignId, 3);
      setErrorMessage(null);
      setSuccessMessage('Step 2 saved successfully.');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save business and offer details.');
    },
  });

  const buildAudienceStepPayload = (data: Step3FormData) => ({
    primaryTargetSegment: normalizeString(data.primaryTargetSegment),
    targetPersona: normalizeString(data.targetPersona),
    targetAudience: normalizeNullableString(data.targetAudience),
    audienceSegments: normalizeListItems(data.audienceSegments),
    language: normalizeString(data.language),
    reportLanguage: normalizeNullableString(data.reportLanguage) ?? inferReportLanguageFromInput(data.language),
    painPoints: normalizeListItems(data.painPoints),
    desiredOutcome: normalizeString(data.desiredOutcome),
    decisionProcess: normalizeString(data.decisionProcess),
    buyerRoles: normalizeListItems(data.buyerRoles),
  });

  const buildChannelsStepPayload = (step2Values: Step2FormData, step3Values: Step3FormData) => ({
    salesChannels: normalizeSalesChannels(step2Values.salesChannels),
    primaryConversionPath:
      normalizePrimaryConversionPath(step2Values.primaryConversionPath, primaryConversionPathOptions) ||
      normalizePrimaryConversionPath(
        inferPrimaryConversionPathFromSalesChannels(step2Values.salesChannels),
        primaryConversionPathOptions,
      ) ||
      getDefaultStringOptionValue(primaryConversionPathOptions),
    socialHandles: step2Values.socialHandles
      .map((item) => ({
        platform: item.platform,
        handle: normalizeString(item.handle),
      }))
      .filter((item) => item.platform && item.handle),
    digitalPresenceLinks: step2Values.digitalPresenceLinks
      .map((item) => ({
        type: item.type,
        url: normalizeString(item.url),
        label: normalizeNullableString(item.label),
      }))
      .filter((item) => item.type && item.url),
    trustSignals: normalizeListItems(step2Values.trustSignals),
    googleAnalyticsConnected:
      step3Values.googleAnalyticsConnected === ''
        ? undefined
        : step3Values.googleAnalyticsConnected,
    monthlyWebsiteTraffic: step3Values.monthlyWebsiteTraffic || null,
    emailListSize: step3Values.emailListSize || null,
  });

  const buildGoalsStepPayload = (data: Step3FormData) => {
    const normalizedCompetitors = normalizeListItems(data.knownCompetitors);
    const resolvedKnownCompetitorStatus =
      normalizeStringOptionValue(data.knownCompetitorStatus, knownCompetitorStatusOptions) ||
      (normalizedCompetitors.length
        ? normalizeStringOptionValue('provided', knownCompetitorStatusOptions) ||
          getDefaultStringOptionValue(knownCompetitorStatusOptions, 'provided')
        : getDefaultStringOptionValue(knownCompetitorStatusOptions, 'not_sure'));

    return {
      primaryGoal:
        normalizeStringOptionValue(data.primaryGoal, primaryGoalOptions) ||
        getDefaultStringOptionValue(primaryGoalOptions),
      monthlyMarketingSpend: data.monthlyMarketingSpend,
      paidMediaBudgetRange:
        normalizeString(data.paidMediaBudgetRange) ||
        normalizeString(data.monthlyMarketingSpend),
      marketingHandler:
        normalizeStringOptionValue(data.marketingHandler, marketingHandlerOptions) ||
        getDefaultStringOptionValue(marketingHandlerOptions),
      contentCapacity:
        normalizeStringOptionValue(data.contentCapacity, contentCapacityOptions) ||
        getDefaultStringOptionValue(contentCapacityOptions, 'not_sure'),
      salesCapacity: normalizeNullableString(data.salesCapacity),
      currentMarketingActivity: (data.currentMarketingActivity ?? [])
        .map((activity) => ({
          channel: normalizeString(activity.channel),
          status:
            normalizeStringOptionValue(activity.status, currentMarketingActivityStatusOptions) ||
            getDefaultStringOptionValue(currentMarketingActivityStatusOptions),
          workingAssessment:
            normalizeStringOptionValue(
              activity.workingAssessment,
              currentMarketingActivityAssessmentOptions,
            ) || null,
          evidence: normalizeNullableString(activity.evidence),
          monthlySpend: normalizeNullableString(activity.monthlySpend),
          timeRunning: normalizeNullableString(activity.timeRunning),
          reasonStopped: normalizeNullableString(activity.reasonStopped),
        }))
        .filter((activity) => activity.channel && activity.status),
      pastMarketing: normalizeNullableString(data.pastMarketing),
      whatsWorking: normalizeNullableString(data.whatsWorking),
      biggestFrustration: normalizeNullableString(data.biggestFrustration),
      knownCompetitorStatus: resolvedKnownCompetitorStatus,
      knownCompetitors:
        resolvedKnownCompetitorStatus === 'provided' && normalizedCompetitors.length
          ? normalizedCompetitors
          : undefined,
      constraints: normalizeListItems(data.constraints),
      channelsToAvoid: normalizeListItems(data.channelsToAvoid),
      channelsStronglyPreferred: normalizeListItems(data.channelsStronglyPreferred),
      executionConstraints: normalizeListItems(data.executionConstraints),
      additionalContext: normalizeNullableString(data.additionalContext),
    };
  };

  const buildEconomicsStepPayload = (data: Step3FormData) => ({
    averageOrderValue: normalizeNullableString(data.averageOrderValue) ?? normalizeNullableString(data.monthlyRevenue),
    averageContractValue: normalizeNullableString(data.averageContractValue),
    grossMarginPercentage: normalizeNullableString(data.grossMarginPercentage),
    monthlyRevenue: normalizeNullableString(data.monthlyRevenue),
    monthlyOrderVolume: normalizeNullableString(data.monthlyOrderVolume),
    productCost: normalizeNullableString(data.productCost),
    monthlyOrdersPerSubscriber: normalizeNullableString(data.monthlyOrdersPerSubscriber),
    monthlyChurnRate: normalizeNullableString(data.monthlyChurnRate),
    avgCustomerRetention: data.avgCustomerRetention || null,
    repeatPurchaseFrequency: data.repeatPurchaseFrequency || null,
    salesCycleLength: normalizeNullableString(data.salesCycleLength),
  });

  const saveAudienceStepMutation = useMutation({
    mutationFn: async (data: Step3FormData) => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }

      step3SnapshotRef.current = {
        ...data,
      };

      return wizardRepository.saveStep(activeCampaignId, 'STEP_3', {
        data: buildAudienceStepPayload(data),
        version: step3VersionRef.current,
      });
    },
    onSuccess: async (result) => {
      if (!activeCampaignId) {
        return;
      }

      if (result?.version !== undefined) {
        step3VersionRef.current = result.version;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(activeCampaignId) }),
      ]);
      setStep(4);
      syncWizardUrl(activeCampaignId, 4);
      setErrorMessage(null);
      setSuccessMessage('Step 3 saved successfully.');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save audience details.');
    },
  });

  const saveStep4Mutation = useMutation({
    mutationFn: async (data: Step2FormData) => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }

      return wizardRepository.saveStep(activeCampaignId, 'STEP_4', {
        data: buildChannelsStepPayload(data, step3Form.getValues()),
        version: step4VersionRef.current,
      });
    },
    onSuccess: async (result) => {
      if (!activeCampaignId) {
        return;
      }

      if (result?.version !== undefined) {
        step4VersionRef.current = result.version;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(activeCampaignId) }),
      ]);
      setStep(5);
      syncWizardUrl(activeCampaignId, 5);
      setErrorMessage(null);
      setSuccessMessage('Step 4 saved successfully.');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save channels and digital presence.');
    },
  });

  const saveStep5Mutation = useMutation({
    mutationFn: async (data: Step3FormData) => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }

      step3SnapshotRef.current = {
        ...data,
      };

      return wizardRepository.saveStep(activeCampaignId, 'STEP_5', {
        data: buildGoalsStepPayload(data),
        version: step5VersionRef.current,
      });
    },
    onSuccess: async (result) => {
      if (!activeCampaignId) {
        return;
      }

      if (result?.version !== undefined) {
        step5VersionRef.current = result.version;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(activeCampaignId) }),
      ]);
      setStep(6);
      syncWizardUrl(activeCampaignId, 6);
      setErrorMessage(null);
      setSuccessMessage('Step 5 saved successfully.');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save goals.');
    },
  });

  const saveStep6Mutation = useMutation({
    mutationFn: async (data: Step3FormData) => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }

      step3SnapshotRef.current = {
        ...data,
      };

      return wizardRepository.saveStep(activeCampaignId, 'STEP_6', {
        data: buildEconomicsStepPayload(data),
        version: step6VersionRef.current,
      });
    },
    onSuccess: async (result) => {
      if (!activeCampaignId) {
        return;
      }

      if (result?.version !== undefined) {
        step6VersionRef.current = result.version;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(activeCampaignId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.preview(activeCampaignId) }),
      ]);
      setStep(7);
      syncWizardUrl(activeCampaignId, 7);
      setErrorMessage(null);
      setSuccessMessage('Step 6 saved successfully.');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save economics.');
    },
  });

  const commitMutation = useMutation({
    mutationFn: async () => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }

      return wizardRepository.commitAndGenerate(activeCampaignId, {
        version: wizardState?.version,
        confirmFocus,
        confirmBusiness,
        confirmAudience,
        confirmGoals,
        confirmEconomics,
        readyToGenerate,
        dataConsentOptIn: getDefaultBooleanOptionValue(
          dataConsentOptInOptions,
          step3Form.getValues('dataConsentOptIn') ?? step3SnapshotRef.current.dataConsentOptIn ?? true,
        ),
      });
    },
    onSuccess: async () => {
      if (!activeCampaignId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(activeCampaignId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.preview(activeCampaignId) }),
      ]);
      onOpenChange(false);
      router.push(`/app/campaigns/${activeCampaignId}/overview`);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setConfirmFocus(false);
        setConfirmBusiness(false);
        setConfirmAudience(false);
        setConfirmGoals(false);
        setConfirmEconomics(false);
        setReadyToGenerate(false);
        setShowCommitConfirmDialog(false);
        setShowConflictDialog(true);
      }
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit campaign.');
    },
  });

  const previewStep1 = preview?.steps?.step1;
  const previewStep2 = preview?.steps?.step2;
  const previewStep3 = preview?.steps?.step3;
  const previewStep4 = preview?.steps?.step4;
  const localPreviewStep1 = {
    ...step1SnapshotRef.current,
    ...step1Form.getValues(),
  };
  const localPreviewStep2 = step2Form.getValues();
  const localPreviewStep3 = {
    ...step3SnapshotRef.current,
    ...step3Form.getValues(),
  };
  const localPreviewStep4 = localPreviewStep3;
  const effectivePreviewStep1 = uiPreviewMode ? localPreviewStep1 : previewStep1;
  const effectivePreviewStep2 = uiPreviewMode ? localPreviewStep2 : previewStep2;
  const effectivePreviewStep3 = uiPreviewMode ? localPreviewStep3 : previewStep3;
  const effectivePreviewStep4 = uiPreviewMode
    ? localPreviewStep4
    : (previewStep4 ?? (previewStep3 as typeof previewStep4));

  const classificationComplete = Boolean(
    effectivePreviewStep1?.marketingTargetType &&
      effectivePreviewStep1?.focusName &&
      effectivePreviewStep1?.sourceType &&
      (effectivePreviewStep1?.sourceType === 'manual_only' || effectivePreviewStep1?.primaryUrl) &&
      effectivePreviewStep1?.targetMarkets?.length &&
      effectivePreviewStep1?.marketScope
  );
  const offerComplete = Boolean(
    (effectivePreviewStep2?.industryCategory || effectivePreviewStep2?.businessType) &&
      effectivePreviewStep2?.businessModel &&
      effectivePreviewStep2?.audienceModel &&
      effectivePreviewStep2?.lifecycleStage &&
      effectivePreviewStep2?.businessDescription &&
      effectivePreviewStep2?.productCategory &&
      normalizeListItems(effectivePreviewStep2?.productOrService as string[] | string | undefined).length > 0 &&
      effectivePreviewStep2?.priceRange,
  );
  const audienceComplete = Boolean(
    effectivePreviewStep3?.primaryTargetSegment &&
      effectivePreviewStep3?.targetPersona &&
      effectivePreviewStep3?.language &&
      effectivePreviewStep3?.painPoints?.length &&
      effectivePreviewStep3?.desiredOutcome &&
      effectivePreviewStep3?.decisionProcess
  );
  const channelsComplete = Boolean(
    effectivePreviewStep2?.salesChannels?.length,
  );
  const goalsComplete = Boolean(
    effectivePreviewStep4?.monthlyMarketingSpend &&
      effectivePreviewStep4?.paidMediaBudgetRange &&
      effectivePreviewStep4?.primaryGoal &&
      effectivePreviewStep4?.marketingHandler &&
      effectivePreviewStep4?.contentCapacity &&
      effectivePreviewStep4?.knownCompetitorStatus
  );
  const economicsComplete = Boolean(
    effectivePreviewStep4?.averageOrderValue ||
      effectivePreviewStep4?.averageContractValue ||
      effectivePreviewStep4?.monthlyRevenue ||
      effectivePreviewStep4?.monthlyOrderVolume ||
      effectivePreviewStep4?.productCost ||
      effectivePreviewStep4?.avgCustomerRetention ||
      effectivePreviewStep4?.repeatPurchaseFrequency,
  );
  const allConfirmed = confirmFocus && confirmBusiness && confirmAudience && confirmGoals && confirmEconomics && readyToGenerate;

  const firstIncompleteSection = !classificationComplete
    ? 1
    : !offerComplete
      ? 2
      : !audienceComplete
        ? 3
        : !channelsComplete
          ? 4
          : !goalsComplete
            ? 5
            : !economicsComplete
              ? 6
              : null;

  const primaryActionLabel = commitMutation.isPending
    ? 'Generating...'
    : uiPreviewMode
      ? 'Preview Only'
    : allConfirmed
      ? 'Generate Strategy'
      : firstIncompleteSection
        ? 'Fix Missing Inputs'
        : 'Confirm Inputs';

  const openPreviewSectionEditor = (
    targetStep: 1 | 2 | 3 | 4 | 5 | 6,
    section: 'focus' | 'business' | 'audience' | 'goals' | 'economics',
  ) => {
    if (section === 'focus') {
      setConfirmFocus(false);
    } else if (section === 'business') {
      setConfirmBusiness(false);
    } else if (section === 'audience') {
      setConfirmAudience(false);
    } else if (section === 'goals') {
      setConfirmGoals(false);
    } else if (section === 'economics') {
      setConfirmEconomics(false);
    }

    setStep(targetStep);
    if (activeCampaignId) {
      syncWizardUrl(activeCampaignId, targetStep);
    }
  };

  const handlePreviewPrimaryAction = async () => {
    if (uiPreviewMode) {
      onOpenChange(false);
      return;
    }

    if (allConfirmed) {
      const wizardSteps = wizardState?.steps;
      const requiredStepKeys = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'] as const;
      const missingStepKey = requiredStepKeys.find((key) => !wizardSteps?.[key]);
      if (missingStepKey) {
        const stepNumber = Number(missingStepKey.replace('step', ''));
        setErrorMessage(`Step ${stepNumber} is missing. Complete all wizard steps before commit.`);
        setStep(stepNumber as WizardModalStep);
        if (activeCampaignId) {
          syncWizardUrl(activeCampaignId, stepNumber as WizardModalStep);
        }
        return;
      }

      const targetMarkets = Array.isArray((wizardSteps?.step1 as Record<string, unknown> | null)?.targetMarkets)
        ? ((wizardSteps?.step1 as Record<string, unknown>).targetMarkets as unknown[])
        : [];
      if (targetMarkets.length > 4) {
        setErrorMessage('Maximum 4 target markets are allowed for a single generation run.');
        setStep(1);
        if (activeCampaignId) {
          syncWizardUrl(activeCampaignId, 1);
        }
        return;
      }

      const sensitiveFlags = Array.isArray((wizardSteps?.step2 as Record<string, unknown> | null)?.sensitiveCategoryFlags)
        ? ((wizardSteps?.step2 as Record<string, unknown>).sensitiveCategoryFlags as unknown[])
        : [];
      if (sensitiveFlags.length === 0) {
        setErrorMessage('Step 2 requires at least one sensitive category flag.');
        setStep(2);
        if (activeCampaignId) {
          syncWizardUrl(activeCampaignId, 2);
        }
        return;
      }

      const step6Data = (wizardSteps?.step6 as Record<string, unknown> | null) ?? null;
      const hasAovOrAcvAtState = Boolean(
        normalizeString((step6Data?.averageOrderValue as string | undefined) ?? '') ||
          normalizeString((step6Data?.averageContractValue as string | undefined) ?? ''),
      );
      if (!hasAovOrAcvAtState) {
        setErrorMessage('Step 6 requires at least one of average order value or average contract value.');
        setStep(6);
        if (activeCampaignId) {
          syncWizardUrl(activeCampaignId, 6);
        }
        return;
      }

      setShowCommitConfirmDialog(true);
      return;
    }

    if (firstIncompleteSection) {
      setStep(firstIncompleteSection);
      if (activeCampaignId) {
        syncWizardUrl(activeCampaignId, firstIncompleteSection);
      }
      return;
    }

    setErrorMessage('Confirm each section and mark the campaign ready to generate.');
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      isDismissClosingRef.current = true;
      setErrorMessage(null);

      const draftCampaignId = autoCreatedDraftIdRef.current;
      if (draftCampaignId && !hasSavedStep1Ref.current) {
        autoCreatedDraftIdRef.current = null;
        void campaignsRepository.deleteCampaign(draftCampaignId)
          .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.list() }))
          .catch(() => undefined);
      }
    }
    onOpenChange(nextOpen);
  };

  const isCreateMode = !campaignId && step === 1;
  const activeStepMeta = WIZARD_STEPS.find((item) => item.step === step) ?? WIZARD_STEPS[0];
  const wizardInputClassName =
    'h-[46px] rounded-[12px] border-[rgba(242,234,219,0.16)] bg-[rgba(10,11,13,0.88)] px-4 text-[15px] text-[rgba(242,234,219,0.92)] shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-[rgba(242,234,219,0.45)] focus-visible:border-[rgba(212,168,83,0.55)] focus-visible:ring-2 focus-visible:ring-[rgba(212,168,83,0.32)]';
  const wizardRowControlClassName =
    'h-[46px] rounded-[12px] border-[rgba(242,234,219,0.16)] bg-[rgba(10,11,13,0.88)] shadow-none transition-[border-color,box-shadow,background-color] focus-visible:border-[rgba(212,168,83,0.55)] focus-visible:ring-0';
  const wizardTextareaClassName =
    'min-h-[88px] rounded-[12px] border-[rgba(242,234,219,0.16)] bg-[rgba(10,11,13,0.88)] px-4 py-3 text-[15px] text-[rgba(242,234,219,0.92)] shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-[rgba(242,234,219,0.45)] focus-visible:border-[rgba(212,168,83,0.55)] focus-visible:ring-2 focus-visible:ring-[rgba(212,168,83,0.32)]';
  const modalTitle =
    step === 1
      ? isCreateMode
        ? 'Focus'
        : 'Focus'
      : step === 2
        ? 'Business'
      : step === 3
        ? 'Audience'
        : step === 4
          ? 'Channels & Presence'
          : step === 5
            ? 'Goals & Context'
            : step === 6
              ? 'Economics'
              : 'Review & Consent';

  const modalDescription =
    step === 1
      ? 'Define what is being marketed, how we should classify it, and the market you want to reach.'
      : step === 2
        ? 'Capture the business identity, source URL, and offer details.'
      : step === 3
        ? 'Describe who this campaign should speak to, what they care about, and the outcome you want.'
      : step === 4
          ? 'Capture distribution channels, digital footprint, and analytics readiness.'
          : step === 5
            ? 'Set business goals, spend, and constraints the strategy should respect.'
            : step === 6
              ? 'Add economic context so downstream planning can be calibrated.'
              : 'Review every section before strategy generation starts.';

  const contentClassName =
    'w-[min(1040px,calc(100vw-2rem))] max-w-none overflow-hidden rounded-[24px] border-[rgba(242,234,219,0.16)] bg-[rgba(11,13,16,0.94)] p-0 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-[3px] sm:w-[min(1040px,calc(100vw-3rem))]';
  const shellInnerClassName = 'mx-auto w-full max-w-[920px]';
  const currentFormId =
    step === 1
      ? 'campaign-wizard-step-1'
      : step === 2
        ? 'campaign-wizard-step-2'
        : step === 3
          ? 'campaign-wizard-step-3'
          : step === 4
            ? 'campaign-wizard-step-4'
            : step === 5
              ? 'campaign-wizard-step-5'
              : step === 6
                ? 'campaign-wizard-step-6'
            : undefined;

  const derivedCac = formatDerivedEstimate(pickDerivedValue(preview?.derived, ['estimatedCAC', 'estimatedCac']));
  const derivedMargin = formatDerivedEstimate(
    pickDerivedValue(preview?.derived, ['estimatedMarginPerUnit', 'estimated_margin_per_unit']),
  );
  const derivedCltv = formatDerivedEstimate(pickDerivedValue(preview?.derived, ['estimatedCLTV', 'estimatedCltv']));
  const derivedRatio = formatDerivedEstimate(pickDerivedValue(preview?.derived, ['cacCltvRatio', 'cac_cltv_ratio']));
  const budgetCategory = pickDerivedValue(preview?.derived, ['budgetCategory', 'budget_category']);
  const executionCapacity = pickDerivedValue(preview?.derived, ['executionCapacity', 'execution_capacity']);
  const primaryChannelDependency = pickDerivedValue(preview?.derived, ['primaryChannelDependency', 'primary_channel_dependency']);

  const hasDerivedInsights = Boolean(
    derivedCac || derivedMargin || derivedCltv || derivedRatio || budgetCategory || executionCapacity || primaryChannelDependency,
  );
  const audienceFilledCount = countFilled([
    effectivePreviewStep3?.primaryTargetSegment,
    effectivePreviewStep3?.targetPersona,
    effectivePreviewStep3?.targetAudience,
    effectivePreviewStep3?.audienceSegments,
    effectivePreviewStep3?.language,
    effectivePreviewStep3?.reportLanguage,
    effectivePreviewStep3?.desiredOutcome,
    effectivePreviewStep3?.painPoints,
    effectivePreviewStep3?.decisionProcess,
    effectivePreviewStep3?.buyerRoles,
  ]);
  const goalsFilledCount = countFilled([
    effectivePreviewStep4?.monthlyMarketingSpend,
    effectivePreviewStep4?.paidMediaBudgetRange,
    effectivePreviewStep4?.primaryGoal,
    effectivePreviewStep4?.marketingHandler,
    effectivePreviewStep4?.contentCapacity,
    effectivePreviewStep4?.salesCapacity,
    effectivePreviewStep4?.currentMarketingActivity,
    effectivePreviewStep4?.pastMarketing,
    effectivePreviewStep4?.knownCompetitorStatus,
    effectivePreviewStep4?.constraints,
    effectivePreviewStep4?.channelsToAvoid,
    effectivePreviewStep4?.channelsStronglyPreferred,
    effectivePreviewStep4?.executionConstraints,
    effectivePreviewStep4?.whatsWorking,
    effectivePreviewStep4?.biggestFrustration,
    effectivePreviewStep4?.knownCompetitors,
    effectivePreviewStep4?.additionalContext,
  ]);
  const classificationFilledCount = countFilled([
    effectivePreviewStep1?.title,
    effectivePreviewStep1?.marketingTargetType,
    effectivePreviewStep1?.focusName,
    effectivePreviewStep1?.sourceType,
    effectivePreviewStep1?.primaryUrl,
    effectivePreviewStep1?.targetMarkets,
    effectivePreviewStep1?.primaryMarket,
    effectivePreviewStep1?.marketScope,
    effectivePreviewStep1?.operationalLocations,
    effectivePreviewStep1?.regionalLanguages,
  ]);
  const businessFilledCount = countFilled([
    effectivePreviewStep2?.businessName,
    effectivePreviewStep2?.industryCategory || effectivePreviewStep2?.businessType,
    effectivePreviewStep2?.businessModel,
    effectivePreviewStep2?.audienceModel,
    effectivePreviewStep2?.lifecycleStage,
    effectivePreviewStep2?.businessDescription,
    effectivePreviewStep2?.productCategory,
    normalizeListItems(effectivePreviewStep2?.productOrService as string[] | string | undefined),
    effectivePreviewStep2?.priceRange,
    effectivePreviewStep2?.offerSummary,
    effectivePreviewStep2?.differentiators,
    effectivePreviewStep2?.sensitiveCategoryFlags,
    effectivePreviewStep2?.complianceSensitiveClaims,
  ]);
  const audienceStepFieldNames: Array<keyof Step3FormData> = [
    'primaryTargetSegment',
    'targetPersona',
    'targetAudience',
    'audienceSegments',
    'language',
    'reportLanguage',
    'painPoints',
    'desiredOutcome',
    'decisionProcess',
    'buyerRoles',
  ];
  const optionalContextFieldNames: Array<keyof Step3FormData> = [
    'monthlyRevenue',
    'averageOrderValue',
    'averageContractValue',
    'grossMarginPercentage',
    'monthlyOrderVolume',
    'productCost',
    'monthlyOrdersPerSubscriber',
    'monthlyChurnRate',
    'avgCustomerRetention',
    'repeatPurchaseFrequency',
    'salesCycleLength',
    'googleAnalyticsConnected',
    'monthlyWebsiteTraffic',
    'emailListSize',
    'additionalContext',
  ];
  const showGoalsOptionalSection = false;

  const handleStep4Invalid = (errors: FieldErrors<Step3FormData>) => {
    const invalidFields = getTopLevelErrorFields(errors);

    if (invalidFields.some((fieldName) => audienceStepFieldNames.includes(fieldName))) {
      setErrorMessage('Some audience fields are incomplete. Fix the highlighted fields before continuing to review.');
      setStep(3);
      if (activeCampaignId) {
        syncWizardUrl(activeCampaignId, 3);
      }
      return;
    }

    if (invalidFields.some((fieldName) => optionalContextFieldNames.includes(fieldName))) {
      setShowOptionalDetails(true);
    }

    setErrorMessage('Fix the highlighted fields before continuing to review.');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent position="top" showCloseButton={false} className={contentClassName} style={WIZARD_CONTRAST_THEME}>
          <div className="relative flex max-h-[calc(100vh-2rem)] flex-col text-[rgba(242,234,219,0.88)] font-[family:var(--font-dm-sans)]">
            <button
              type="button"
              onClick={() => handleClose(false)}
              aria-label="Close wizard"
              className="absolute right-4 top-4 z-[80] inline-flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(242,234,219,0.2)] bg-[rgba(11,13,16,0.92)] text-[rgba(242,234,219,0.86)] transition hover:bg-[rgba(16,18,22,0.96)] hover:text-[rgba(242,234,219,0.96)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,168,83,0.35)]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_-12%,rgba(212,168,83,0.2)_0%,rgba(11,13,16,0)_68%)]" />
            <div className="shrink-0 px-7 pb-6 pt-10 relative z-10">
              <div className={shellInnerClassName}>
                <DialogHeader className="space-y-5 pr-8">
                  <div className="space-y-3">
                    <Badge
                      variant="secondary"
                      style={WIZARD_MONO_STYLE}
                      className="w-fit rounded-full border border-[rgba(212,168,83,0.34)] bg-[rgba(212,168,83,0.14)] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(212,168,83,0.92)] shadow-none"
                    >
                      {`Step ${step} / ${activeStepMeta.hint}`}
                    </Badge>
                    <DialogTitle
                      style={WIZARD_SERIF_STYLE}
                      className="text-[38px] leading-[0.98] font-medium tracking-[-0.03em] text-[rgba(242,234,219,0.93)]"
                    >
                      {modalTitle}
                    </DialogTitle>
                    <DialogDescription className="max-w-[680px] text-[15px] leading-8 text-[rgba(242,234,219,0.62)]">
                      {modalDescription}
                    </DialogDescription>
                  </div>

                  <StepTrail step={step} />
                </DialogHeader>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-7 pb-6 relative z-10"
            >
              <div className={shellInnerClassName}>
                {step === 1 ? (
              <form
                id="campaign-wizard-step-1"
                onSubmit={step1Form.handleSubmit(async (data) => {
                  if (isDismissClosingRef.current) {
                    return;
                  }
                  const sourceValidation = validateSourceUrl(data.sourceType, data.primaryUrl);
                  if (!sourceValidation.valid) {
                    step1Form.setError('primaryUrl', {
                      type: 'manual',
                      message: sourceValidation.message,
                    });
                    return;
                  }
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  try {
                    await createOrSaveStep1Mutation.mutateAsync(data);
                  } catch {
                    // Errors are handled in mutation onError to keep UI stable.
                  }
                })}
                onKeyDown={moveToNextWizardField}
                className="space-y-5"
              >
                <WizardSectionCard
                  eyebrow="Campaign setup"
                  title="Name this campaign"
                  description="Give the campaign a title that makes it easy to identify later."
                >
                  <div className="space-y-2">
                    <FieldLabel label="Campaign title" />
                    <Input
                      className={wizardInputClassName}
                      placeholder="e.g. Summer sale push for GlowSkin"
                      {...step1Form.register('title')}
                    />
                    <FieldMeta error={step1Form.formState.errors.title?.message} />
                  </div>
                </WizardSectionCard>

                <WizardSectionCard eyebrow="Classification" title="Define what is being marketed" description="Choose the scope and define the market focus for this campaign.">
                  <Controller
                    name="marketingTargetType"
                    control={step1Form.control}
                    render={({ field }) => (
                      <SelectCardGroup
                        label="What is being marketed?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        columnsClassName="grid-cols-1 sm:grid-cols-3"
                        options={marketingTargetTypeOptions.map((option) => ({
                          value: option.value,
                          label: option.label,
                          description: MARKETING_TARGET_DESCRIPTIONS[option.value],
                        }))}
                        error={step1Form.formState.errors.marketingTargetType?.message}
                      />
                    )}
                  />

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label={getFocusNameLabel(watchedMarketingTargetType)} helper={getFocusNameHelper(watchedMarketingTargetType)} required />
                    <Input
                      className={wizardInputClassName}
                      placeholder={
                        watchedMarketingTargetType === 'product_or_service'
                          ? 'e.g. Hydrafacial consultation'
                          : watchedMarketingTargetType === 'launch'
                            ? 'e.g. Summer launch in Mumbai'
                            : watchedMarketingTargetType === 'specific_audience'
                              ? 'e.g. B2B founders in health tech'
                              : watchedMarketingTargetType === 'market_expansion'
                                ? 'e.g. US market expansion'
                                : 'e.g. Acme Skin Clinic'
                      }
                      {...step1Form.register('focusName')}
                    />
                    <FieldMeta error={step1Form.formState.errors.focusName?.message} />
                  </div>

                  <InlineDivider />

                  <TagInputField
                    label="Target markets"
                    helper="Add up to 4 markets you want this run to target."
                    required
                    footnote="Use country names or codes like India, US, UK, IN."
                    placeholder="e.g. India, United States"
                    values={watchedTargetMarkets}
                    pendingValue={targetMarketDraft}
                    onPendingChange={setTargetMarketDraft}
                    onAdd={() => {
                      if (watchedTargetMarkets.length >= 4) {
                        step1Form.setError('targetMarkets', {
                          type: 'manual',
                          message: 'Add up to 4 target markets.',
                        });
                        return;
                      }
                      addListItem(watchedTargetMarkets, targetMarketDraft, setTargetMarketDraft, (nextValues) => {
                        step1Form.setValue('targetMarkets', nextValues, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      });
                    }}
                    onRemove={(index) => removeListItem(watchedTargetMarkets, index, (nextValues) => {
                      step1Form.setValue('targetMarkets', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step1Form.formState.errors.targetMarkets)}
                  />

                  <InlineDivider />

                  <div className="grid gap-4 sm:grid-cols-2">
                    {watchedTargetMarkets.length > 1 ? (
                      <div className="space-y-2">
                        <FieldLabel
                          label="Primary market"
                          helper="Required when you have multiple target markets."
                          required
                        />
                        <Controller
                          name="primaryMarket"
                          control={step1Form.control}
                          render={({ field }) => (
                            <Select
                              onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)}
                              value={field.value || OPTIONAL_SELECT_VALUE}
                            >
                              <SelectTrigger className={wizardInputClassName}>
                                <SelectValue placeholder="Select primary market" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={OPTIONAL_SELECT_VALUE}>Not selected</SelectItem>
                                {watchedTargetMarkets.map((market) => (
                                  <SelectItem key={market} value={market}>
                                    {market}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldMeta error={step1Form.formState.errors.primaryMarket?.message} />
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <FieldLabel label="Market scope" required />
                      <Controller
                        name="marketScope"
                        control={step1Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select scope" />
                            </SelectTrigger>
                            <SelectContent>
                              {marketScopeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step1Form.formState.errors.marketScope?.message} />
                    </div>
                  </div>

                  {(['local', 'regional'] as const).includes((watchedMarketScope || '').toLowerCase() as 'local' | 'regional') ? (
                    <>
                      <InlineDivider />
                      <TagInputField
                        label="Operational locations"
                        helper="Required for local and regional market scope."
                        required
                        footnote="Add cities, regions, or local areas where operations run."
                        placeholder="e.g. Bengaluru, Pune, South Delhi"
                        values={watchedOperationalLocations}
                        pendingValue={operationalLocationDraft}
                        onPendingChange={setOperationalLocationDraft}
                        onAdd={() => addListItem(watchedOperationalLocations, operationalLocationDraft, setOperationalLocationDraft, (nextValues) => {
                          step1Form.setValue('operationalLocations', nextValues, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        })}
                        onRemove={(index) => removeListItem(watchedOperationalLocations, index, (nextValues) => {
                          step1Form.setValue('operationalLocations', nextValues, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        })}
                        error={getArrayFieldError(step1Form.formState.errors.operationalLocations)}
                      />
                    </>
                  ) : null}

                  <InlineDivider />

                  <div className="space-y-3 rounded-2xl border border-border/80 bg-card/95 px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <FieldLabel label="Regional language expansion" helper="Enable if this campaign needs additional regional language coverage." />
                      </div>
                      <Controller
                        name="regionalLanguageExpansionEnabled"
                        control={step1Form.control}
                        render={({ field }) => (
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <FieldMeta error={step1Form.formState.errors.regionalLanguageExpansionEnabled?.message} />
                  </div>

                  {watchedRegionalLanguageExpansionEnabled ? (
                    <>
                      <InlineDivider />
                      <TagInputField
                        label="Regional languages"
                        helper="Add all regional languages to include for this campaign."
                        required
                        placeholder="e.g. Hindi, Tamil, Bengali"
                        values={watchedRegionalLanguages}
                        pendingValue={regionalLanguageDraft}
                        onPendingChange={setRegionalLanguageDraft}
                        onAdd={() => addListItem(watchedRegionalLanguages, regionalLanguageDraft, setRegionalLanguageDraft, (nextValues) => {
                          step1Form.setValue('regionalLanguages', nextValues, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        })}
                        onRemove={(index) => removeListItem(watchedRegionalLanguages, index, (nextValues) => {
                          step1Form.setValue('regionalLanguages', nextValues, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        })}
                        error={getArrayFieldError(step1Form.formState.errors.regionalLanguages)}
                      />
                    </>
                  ) : null}
                </WizardSectionCard>

                <WizardSectionCard
                  eyebrow="Source"
                  title="Choose the source we should trust"
                  description="Choose the source type and add the page we should use as the primary reference for this campaign."
                >
                  <Controller
                    name="sourceType"
                    control={step1Form.control}
                    render={({ field }) => (
                      <SelectCardGroup
                        label="What source should we use?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        columnsClassName="grid-cols-1"
                        density="list"
                        options={sourceTypeOptions.map((option) => ({
                          value: option.value,
                          label: option.label,
                          description: SOURCE_TYPE_DESCRIPTIONS[option.value],
                        }))}
                        error={step1Form.formState.errors.sourceType?.message}
                      />
                    )}
                  />

                  {watchedSourceType !== 'manual_only' ? (
                    <div className="space-y-2">
                      <FieldLabel label={getSourceUrlLabel(watchedSourceType)} helper="Use the page that best explains the business or offer." required />
                      <Input
                        className={wizardInputClassName}
                        placeholder="https://example.com"
                        {...step1Form.register('primaryUrl')}
                      />
                      <FieldMeta error={step1Form.formState.errors.primaryUrl?.message} />
                    </div>
                  ) : (
                    <SubtleNote>
                      Manual-only mode selected. Step 2 will rely on your typed business context instead of a source URL.
                    </SubtleNote>
                  )}
                </WizardSectionCard>

                </form>
              ) : null}

                {step === 2 ? (
              <form
                id="campaign-wizard-step-2"
                onSubmit={step2Form.handleSubmit(async (data) => {
                  if (isDismissClosingRef.current) {
                    return;
                  }

                  const marketingTargetType = step1SnapshotRef.current.marketingTargetType;
                  const focusName = normalizeString(step1SnapshotRef.current.focusName);
                  const businessName = normalizeString(data.businessName);
                  const requiresBusinessName =
                    marketingTargetType !== 'whole_business' ||
                    (focusName.length > 0 && businessName.length > 0 && focusName.toLowerCase() !== businessName.toLowerCase());

                  if (requiresBusinessName && businessName.length === 0) {
                    step2Form.setError('businessName', {
                      type: 'manual',
                      message: 'Business name is required for this focus setup.',
                    });
                    setErrorMessage('Add business name before continuing.');
                    return;
                  }

                  setErrorMessage(null);
                  setSuccessMessage(null);
                  try {
                    await saveStep2Mutation.mutateAsync(data);
                  } catch {
                    // Errors are handled in mutation onError to keep UI stable.
                  }
                })}
                onKeyDown={moveToNextWizardField}
                className="space-y-5"
              >
                <WizardSectionCard
                  eyebrow="Business identity"
                  title="Describe the business we are analysing"
                  description="Capture the business identity details we should use when analysing this campaign."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel label="Business name" helper="Required when focus is not whole-business or when focus name differs." />
                      <Input className={wizardInputClassName} placeholder="e.g. EFourNine Coaching & Consulting" {...step2Form.register('businessName')} />
                      <FieldMeta error={step2Form.formState.errors.businessName?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Industry category" required />
                      <Controller
                        name="industryCategory"
                        control={step2Form.control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              step2Form.setValue('businessType', value as Step2FormData['businessType'], {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select industry category" />
                            </SelectTrigger>
                            <SelectContent>
                              {industryCategoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step2Form.formState.errors.industryCategory?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Business model" required />
                      <Controller
                        name="businessModel"
                        control={step2Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select business model" />
                            </SelectTrigger>
                            <SelectContent>
                              {BUSINESS_MODEL_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step2Form.formState.errors.businessModel?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Audience model" required />
                      <Controller
                        name="audienceModel"
                        control={step2Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select audience model" />
                            </SelectTrigger>
                            <SelectContent>
                              {audienceModelOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step2Form.formState.errors.audienceModel?.message} />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <FieldLabel label="Lifecycle stage" required />
                      <Controller
                        name="lifecycleStage"
                        control={step2Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select lifecycle stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {lifecycleStageOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step2Form.formState.errors.lifecycleStage?.message} />
                    </div>
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Business description" required />
                    <Textarea
                      placeholder="Explain what the business does, who it serves, and how customers usually buy."
                      {...step2Form.register('businessDescription')}
                      className={cn(wizardTextareaClassName, 'min-h-[120px]')}
                    />
                    <FieldMeta error={step2Form.formState.errors.businessDescription?.message} />
                  </div>
                </WizardSectionCard>

                <WizardSectionCard
                  eyebrow="Offer"
                  title="Describe the offer and positioning"
                  description="Capture the commercial details we should use when framing the strategy."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel label="Product category" required />
                      <Input className={wizardInputClassName} placeholder="e.g. Skincare, CRM software, home decor" {...step2Form.register('productCategory')} />
                      <FieldMeta error={step2Form.formState.errors.productCategory?.message} />
                    </div>

                    <div className="space-y-2">
                      <TagInputField
                        label="Product or service"
                        required
                        helper="Add one offering per item."
                        footnote="Press Enter or click Add after each product/service."
                        placeholder="e.g. Hydrafacial package, Sales CRM"
                        values={watchedProductOrService}
                        pendingValue={productOrServiceDraft}
                        onPendingChange={setProductOrServiceDraft}
                        onAdd={() => addListItem(watchedProductOrService, productOrServiceDraft, setProductOrServiceDraft, (nextValues) => {
                          step2Form.setValue('productOrService', nextValues, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        })}
                        onRemove={(index) => removeListItem(watchedProductOrService, index, (nextValues) => {
                          step2Form.setValue('productOrService', nextValues, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        })}
                        error={getArrayFieldError(step2Form.formState.errors.productOrService)}
                      />
                    </div>
                  </div>

                  <InlineDivider />

                  <div className="max-w-[360px] space-y-2">
                    <FieldLabel label="Price range" required />
                    <Input className={wizardInputClassName} placeholder="e.g. INR 999-INR 2,999 or INR 2,500/month" {...step2Form.register('priceRange')} />
                    <FieldMeta error={step2Form.formState.errors.priceRange?.message} />
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Offer summary" />
                    <Textarea
                      placeholder="Optional summary of the offer, positioning, or buyer promise."
                      {...step2Form.register('offerSummary')}
                      className={cn(wizardTextareaClassName, 'min-h-[104px]')}
                    />
                    <FieldMeta error={step2Form.formState.errors.offerSummary?.message} />
                  </div>

                  <TagInputField
                    label="Differentiators"
                    helper="Add what makes this offer easier to choose."
                    footnote="Press Enter or click Add to save each differentiator"
                    placeholder="e.g. Fast onboarding, premium ingredients, 24x7 support"
                    values={watchedDifferentiators}
                    pendingValue={differentiatorDraft}
                    onPendingChange={setDifferentiatorDraft}
                    onAdd={() => addListItem(watchedDifferentiators, differentiatorDraft, setDifferentiatorDraft, (nextValues) => {
                      step2Form.setValue('differentiators', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedDifferentiators, index, (nextValues) => {
                      step2Form.setValue('differentiators', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step2Form.formState.errors.differentiators)}
                  />

                  <InlineDivider />

                  {sensitiveCategoryFlagOptions.length ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <FieldLabel label="Sensitive category flags" helper="Use backend-provided options." required />
                        <FieldMeta error={getArrayFieldError(step2Form.formState.errors.sensitiveCategoryFlags)} />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sensitiveCategoryFlagOptions.map((option) => {
                          const checked = watchedSensitiveCategoryFlags.includes(option.value);
                          const toggleSensitiveFlag = () => {
                            const nextValues = checked
                              ? watchedSensitiveCategoryFlags.filter((value) => value !== option.value)
                              : [...watchedSensitiveCategoryFlags, option.value];
                            step2Form.setValue('sensitiveCategoryFlags', nextValues, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          };
                          return (
                            <div
                              key={option.value}
                              role="button"
                              tabIndex={0}
                              onClick={toggleSensitiveFlag}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  toggleSensitiveFlag();
                                }
                              }}
                              className={cn(
                                'flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition',
                                'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,168,83,0.35)]',
                                checked
                                  ? 'border-[rgba(212,168,83,0.55)] bg-[rgba(212,168,83,0.08)] text-foreground'
                                  : 'border-border/70 bg-card/95 text-foreground/85 hover:border-[rgba(212,168,83,0.45)]',
                              )}
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  'flex h-4 w-4 items-center justify-center rounded border',
                                  checked
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border/80 bg-transparent',
                                )}
                              >
                                {checked ? <Check className="h-3 w-3" /> : null}
                              </span>
                              <span>{option.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[13px] leading-6 text-foreground/80">
                        At least one flag is required. Include "none" or "not_sure" when applicable.
                      </p>
                    </div>
                  ) : (
                    <TagInputField
                      label="Sensitive category flags"
                      helper="Use backend-defined risk/compliance category values."
                      required
                      footnote='At least one flag is required. Include "none" or "not_sure" when applicable.'
                      placeholder='e.g. none, not_sure, health_claims, financial_advice'
                      values={watchedSensitiveCategoryFlags}
                      pendingValue={sensitiveFlagDraft}
                      onPendingChange={setSensitiveFlagDraft}
                      onAdd={() => addListItem(watchedSensitiveCategoryFlags, sensitiveFlagDraft, setSensitiveFlagDraft, (nextValues) => {
                        step2Form.setValue('sensitiveCategoryFlags', nextValues, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      })}
                      onRemove={(index) => removeListItem(watchedSensitiveCategoryFlags, index, (nextValues) => {
                        step2Form.setValue('sensitiveCategoryFlags', nextValues, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      })}
                      error={getArrayFieldError(step2Form.formState.errors.sensitiveCategoryFlags)}
                    />
                  )}

                  <InlineDivider />

                  <TagInputField
                    label="Compliance sensitive claims"
                    helper="Optional claim phrases requiring validation."
                    footnote="Add only if you plan to use high-risk or regulated claims."
                    placeholder="e.g. guaranteed returns, cures acne in 3 days"
                    values={watchedComplianceSensitiveClaims}
                    pendingValue={complianceClaimDraft}
                    onPendingChange={setComplianceClaimDraft}
                    onAdd={() => addListItem(watchedComplianceSensitiveClaims, complianceClaimDraft, setComplianceClaimDraft, (nextValues) => {
                      step2Form.setValue('complianceSensitiveClaims', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedComplianceSensitiveClaims, index, (nextValues) => {
                      step2Form.setValue('complianceSensitiveClaims', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step2Form.formState.errors.complianceSensitiveClaims)}
                  />
                </WizardSectionCard>

                <SubtleNote>
                  Channels and digital footprint fields are captured in Step 4 to match the backend step contract.
                </SubtleNote>

                </form>
              ) : null}

                {step === 3 ? (
              <form
                id="campaign-wizard-step-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (isDismissClosingRef.current) {
                    return;
                  }

                  const valid = await step3Form.trigger([
                    'primaryTargetSegment',
                    'targetPersona',
                    'targetAudience',
                    'audienceSegments',
                    'language',
                    'reportLanguage',
                    'painPoints',
                    'desiredOutcome',
                    'decisionProcess',
                    'buyerRoles',
                  ]);

                  if (!valid) {
                    setErrorMessage('Fix the highlighted audience fields before continuing.');
                    return;
                  }

                  const step2AudienceModel = step2Form.getValues('audienceModel');
                  const step2BusinessModel = step2Form.getValues('businessModel');
                  const nextValues = step3Form.getValues();
                  const normalizedAudienceSegments = normalizeListItems(nextValues.audienceSegments);
                  const normalizedBuyerRoles = normalizeListItems(nextValues.buyerRoles);
                  const audienceSegmentsAreRequired = isAudienceSegmentsRequired(step2AudienceModel);
                  const buyerRolesAreRequired = isBuyerRolesRequired({
                    businessModel: step2BusinessModel,
                    audienceModel: step2AudienceModel,
                    decisionProcess: nextValues.decisionProcess ?? '',
                  });

                  if (audienceSegmentsAreRequired && normalizedAudienceSegments.length === 0) {
                    step3Form.setError('audienceSegments', {
                      type: 'manual',
                      message: 'Add at least one audience segment for the selected audience model.',
                    });
                    setErrorMessage('Audience segments are required for this audience model.');
                    return;
                  }

                  if (buyerRolesAreRequired && normalizedBuyerRoles.length === 0) {
                    step3Form.setError('buyerRoles', {
                      type: 'manual',
                      message: 'Add at least one buyer role for this buying context.',
                    });
                    setErrorMessage('Buyer roles are required for this buying context.');
                    return;
                  }

                  step3SnapshotRef.current = {
                    ...nextValues,
                  };
                  setErrorMessage(null);
                  setSuccessMessage(null);

                  if (!activeCampaignId) {
                    setErrorMessage('Campaign not found.');
                    return;
                  }

                  try {
                    await saveAudienceStepMutation.mutateAsync(nextValues);
                  } catch {
                    // Errors are handled in mutation onError to keep UI stable.
                  }
                }}
                onKeyDown={moveToNextWizardField}
                className="space-y-5"
              >
                <WizardSectionCard
                  eyebrow="Audience"
                  title="Describe who this campaign should reach"
                  description="Capture the persona, audience cues, pain points, and the outcome that should shape the messaging."
                >
                  <div className="space-y-2">
                    <FieldLabel label="Primary target segment" required />
                    <Input
                      className={wizardInputClassName}
                      placeholder="e.g. Founder-led service businesses in the US"
                      {...step3Form.register('primaryTargetSegment')}
                    />
                    <FieldMeta error={step3Form.formState.errors.primaryTargetSegment?.message} />
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Target persona" required />
                    <Textarea
                      placeholder="e.g. Founders of small D2C brands who need repeatable growth without building a large team"
                      {...step3Form.register('targetPersona')}
                      className={wizardTextareaClassName}
                    />
                    <FieldMeta error={step3Form.formState.errors.targetPersona?.message} />
                  </div>

                  <InlineDivider />

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_280px]">
                    <div className="space-y-2">
                      <FieldLabel label="Broader target audience" />
                      <Textarea
                        placeholder="Optional broader audience description beyond the core persona"
                        {...step3Form.register('targetAudience')}
                        className={wizardTextareaClassName}
                      />
                      <FieldMeta error={step3Form.formState.errors.targetAudience?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Language" required />
                      <Controller
                        name="language"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {languageOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.language?.message} />
                    </div>
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Report language" helper="Optional language for final report output." />
                    <Controller
                      name="reportLanguage"
                      control={step3Form.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)}
                          value={field.value || OPTIONAL_SELECT_VALUE}
                        >
                          <SelectTrigger className={wizardInputClassName}>
                            <SelectValue placeholder="Select report language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={OPTIONAL_SELECT_VALUE}>Auto infer</SelectItem>
                            {reportLanguageOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldMeta error={step3Form.formState.errors.reportLanguage?.message} />
                  </div>

                  <InlineDivider />

                  <TagInputField
                    label="Audience segments"
                    helper={audienceSegmentsRequired ? 'Required for selected audience model.' : 'Optional segments under the primary target.'}
                    required={audienceSegmentsRequired}
                    footnote={audienceSegmentsRequired ? 'Add at least one segment. Press Enter or click Add.' : 'Press Enter or click Add after each segment'}
                    placeholder="e.g. Founder-led agencies, boutique consultancies"
                    values={watchedAudienceSegments}
                    pendingValue={audienceSegmentDraft}
                    onPendingChange={setAudienceSegmentDraft}
                    onAdd={() => addListItem(watchedAudienceSegments, audienceSegmentDraft, setAudienceSegmentDraft, (nextValues) => {
                      step3Form.setValue('audienceSegments', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedAudienceSegments, index, (nextValues) => {
                      step3Form.setValue('audienceSegments', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step3Form.formState.errors.audienceSegments)}
                  />

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Desired outcome" required />
                    <Textarea
                      placeholder="e.g. Generate more qualified consult calls from people ready to buy this month"
                      {...step3Form.register('desiredOutcome')}
                      className={wizardTextareaClassName}
                    />
                    <FieldMeta error={step3Form.formState.errors.desiredOutcome?.message} />
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Decision process" required />
                    <Textarea
                      placeholder="e.g. Founder decides after one consult call, with finance sign-off before payment."
                      {...step3Form.register('decisionProcess')}
                      className={wizardTextareaClassName}
                    />
                    <FieldMeta error={step3Form.formState.errors.decisionProcess?.message} />
                  </div>

                  <InlineDivider />

                  <TagInputField
                    label="Pain points"
                    helper="Add at least one customer frustration or need."
                    required
                    footnote="Press Enter or click Add after each pain point"
                    placeholder="e.g. Wants fast delivery without paying premium shipping"
                    values={watchedPainPoints}
                    pendingValue={painPointDraft}
                    onPendingChange={setPainPointDraft}
                    onAdd={() => addListItem(watchedPainPoints, painPointDraft, setPainPointDraft, (nextValues) => {
                      step3Form.setValue('painPoints', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedPainPoints, index, (nextValues) => {
                      step3Form.setValue('painPoints', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step3Form.formState.errors.painPoints)}
                  />

                  <InlineDivider />

                  <TagInputField
                    label="Buyer roles"
                    helper={buyerRolesRequired ? 'Required for this buying context.' : 'Optional stakeholders involved in buying decisions.'}
                    required={buyerRolesRequired}
                    footnote={buyerRolesRequired ? 'Add at least one role. Press Enter or click Add.' : 'Press Enter or click Add after each role'}
                    placeholder="e.g. Founder, COO, Finance Manager"
                    values={watchedBuyerRoles}
                    pendingValue={buyerRoleDraft}
                    onPendingChange={setBuyerRoleDraft}
                    onAdd={() => addListItem(watchedBuyerRoles, buyerRoleDraft, setBuyerRoleDraft, (nextValues) => {
                      step3Form.setValue('buyerRoles', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedBuyerRoles, index, (nextValues) => {
                      step3Form.setValue('buyerRoles', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step3Form.formState.errors.buyerRoles)}
                  />
                </WizardSectionCard>

                </form>
              ) : null}

                {step === 4 ? (
              <form
                id="campaign-wizard-step-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (isDismissClosingRef.current) {
                    return;
                  }
                  const valid = await step2Form.trigger([
                    'salesChannels',
                    'primaryConversionPath',
                    'socialHandles',
                    'digitalPresenceLinks',
                    'trustSignals',
                  ]);
                  if (!valid) {
                    setErrorMessage('Fix Step 4 issues before continuing.');
                    return;
                  }
                  if ((step2Form.getValues('salesChannels') ?? []).length === 0) {
                    step2Form.setError('salesChannels', {
                      type: 'manual',
                      message: 'Add at least one sales channel.',
                    });
                    setErrorMessage('At least one sales channel is required.');
                    return;
                  }
                  const selectedPrimaryConversionPath = normalizeString(step2Form.getValues('primaryConversionPath') as string | undefined);
                  if (!selectedPrimaryConversionPath) {
                    step2Form.setError('primaryConversionPath', {
                      type: 'manual',
                      message: 'Select the primary conversion path.',
                    });
                    setErrorMessage('Primary conversion path is required.');
                    return;
                  }
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  try {
                    await saveStep4Mutation.mutateAsync(step2Form.getValues());
                  } catch {
                    // Errors are handled in mutation onError to keep UI stable.
                  }
                }}
                onKeyDown={moveToNextWizardField}
                className="space-y-5"
              >
                <WizardSectionCard
                  eyebrow="Distribution"
                  title="Confirm channels and presence signals"
                  description="This step maps directly to the backend channels step and saves sales-channel ranking plus digital footprint inputs."
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel label="Ranked sales channels" required />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-border/80 bg-card/95"
                        onClick={() => appendSalesChannel({ channel: 'own_website', rank: salesChannelFields.length + 1, customName: '' })}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add channel
                      </Button>
                    </div>
                    <FieldMeta error={getSalesChannelsErrorMessage(step2Form.formState.errors.salesChannels)} />

                    {salesChannelFields.length ? (
                      salesChannelFields.map((field, index) => {
                        const selectedChannel = watchedSalesChannels[index]?.channel;
                        const showCustomName = selectedChannel === 'other';

                        return (
                          <div key={field.id} className="grid items-center gap-2 rounded-xl border border-border/80 bg-muted/60 p-4 lg:grid-cols-[minmax(0,1.7fr)_96px_46px]">
                            <Controller
                              name={`salesChannels.${index}.channel`}
                              control={step2Form.control}
                              render={({ field: controllerField }) => (
                                <Select
                                  onValueChange={(value) => {
                                    controllerField.onChange(value);
                                    if (value !== 'other') {
                                      step2Form.setValue(`salesChannels.${index}.customName`, '', {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      });
                                    }
                                  }}
                                  value={controllerField.value}
                                >
                                  <SelectTrigger className={cn(wizardRowControlClassName, 'px-4 text-[15px] text-foreground')}>
                                    <SelectValue placeholder="Select channel" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SALES_CHANNEL_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />

                            <Input
                              className={cn(wizardRowControlClassName, 'px-4 text-[15px] text-foreground text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none')}
                              type="number"
                              min={1}
                              placeholder="Rank"
                              {...step2Form.register(`salesChannels.${index}.rank`, {
                                valueAsNumber: true,
                                setValueAs: (value) => (value === '' ? undefined : Number(value)),
                              })}
                            />

                            <Button type="button" variant="outline" size="icon" className={cn(wizardRowControlClassName, 'w-[46px] shrink-0')} onClick={() => removeSalesChannel(index)}>
                              <X className="h-4 w-4" />
                            </Button>

                            {showCustomName ? (
                              <div className="lg:col-span-2">
                                <Input className={wizardInputClassName} placeholder="Custom channel name" {...step2Form.register(`salesChannels.${index}.customName`)} />
                              </div>
                            ) : null}

                            <div className="lg:col-span-3">
                              <FieldMeta
                                error={
                                  step2Form.formState.errors.salesChannels?.[index]?.channel?.message ||
                                  step2Form.formState.errors.salesChannels?.[index]?.rank?.message ||
                                  step2Form.formState.errors.salesChannels?.[index]?.customName?.message
                                }
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyActionButton onClick={() => appendSalesChannel({ channel: 'own_website', rank: 1, customName: '' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add channel
                      </EmptyActionButton>
                    )}
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Primary conversion path" required />
                    <Controller
                      name="primaryConversionPath"
                      control={step2Form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger className={wizardInputClassName}>
                            <SelectValue placeholder="Select primary conversion path" />
                          </SelectTrigger>
                          <SelectContent>
                            {primaryConversionPathOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <SubtleNote>
                      {formatPrimaryConversionPath(step2Form.getValues('primaryConversionPath') || null) || 'Choose how conversions most commonly happen right now.'}
                    </SubtleNote>
                    <FieldMeta error={step2Form.formState.errors.primaryConversionPath?.message} />
                  </div>

                  <InlineDivider />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <FieldLabel label="Social handles" />
                        <p className="text-xs leading-5 text-foreground/75">Add active profile handles if relevant.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-border/80 bg-card/95"
                        onClick={() => appendSocialHandle({ platform: 'instagram', handle: '' })}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add handle
                      </Button>
                    </div>

                    {socialHandleFields.length ? (
                      socialHandleFields.map((field, index) => (
                        <div key={field.id} className="grid gap-3 rounded-xl border border-border/80 bg-muted/60 p-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
                          <Controller
                            name={`socialHandles.${index}.platform`}
                            control={step2Form.control}
                            render={({ field: controllerField }) => (
                              <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                <SelectTrigger className={wizardInputClassName}>
                                  <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />

                          <Input className={wizardInputClassName} placeholder="@yourbrand or channel name" {...step2Form.register(`socialHandles.${index}.handle`)} />

                          <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border/80 bg-card/95" onClick={() => removeSocialHandle(index)}>
                            <X className="h-4 w-4" />
                          </Button>

                          <FieldMeta
                            error={
                              step2Form.formState.errors.socialHandles?.[index]?.platform?.message ||
                              step2Form.formState.errors.socialHandles?.[index]?.handle?.message
                            }
                          />
                        </div>
                      ))
                    ) : (
                      <SubtleNote>No social handles added.</SubtleNote>
                    )}
                  </div>

                  <InlineDivider />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <FieldLabel label="Digital presence links" />
                        <p className="text-xs leading-5 text-foreground/75">Add URLs for marketplaces, profiles, or listings.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-border/80 bg-card/95"
                        onClick={() => appendDigitalPresence({ type: 'instagram', url: '', label: '' })}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add link
                      </Button>
                    </div>

                    {digitalPresenceFields.length ? (
                      digitalPresenceFields.map((field, index) => (
                        <div key={field.id} className="grid gap-3 rounded-xl border border-border/80 bg-muted/60 p-3 lg:grid-cols-[180px_minmax(0,1fr)]">
                          <Controller
                            name={`digitalPresenceLinks.${index}.type`}
                            control={step2Form.control}
                            render={({ field: controllerField }) => (
                              <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                <SelectTrigger className={wizardInputClassName}>
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIGITAL_PRESENCE_LINK_TYPE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />

                          <Input className={wizardInputClassName} placeholder="https://example.com/profile" {...step2Form.register(`digitalPresenceLinks.${index}.url`)} />
                          <div className="grid gap-3 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_auto]">
                            <Input className={wizardInputClassName} placeholder="Optional label" {...step2Form.register(`digitalPresenceLinks.${index}.label`)} />
                            <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border/80 bg-card/95" onClick={() => removeDigitalPresence(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <FieldMeta
                            error={
                              step2Form.formState.errors.digitalPresenceLinks?.[index]?.type?.message ||
                              step2Form.formState.errors.digitalPresenceLinks?.[index]?.url?.message ||
                              step2Form.formState.errors.digitalPresenceLinks?.[index]?.label?.message
                            }
                          />
                        </div>
                      ))
                    ) : (
                      <SubtleNote>No digital links added.</SubtleNote>
                    )}
                  </div>

                  <InlineDivider />

                  <TagInputField
                    label="Trust signals"
                    helper="Add credibility signals customers can verify."
                    placeholder="e.g. 4.9-star Google rating, ISO certified, featured in Economic Times"
                    values={watchedTrustSignals}
                    pendingValue={trustSignalDraft}
                    onPendingChange={setTrustSignalDraft}
                    onAdd={() => addListItem(watchedTrustSignals, trustSignalDraft, setTrustSignalDraft, (nextValues) => {
                      step2Form.setValue('trustSignals', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedTrustSignals, index, (nextValues) => {
                      step2Form.setValue('trustSignals', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step2Form.formState.errors.trustSignals)}
                  />

                  <InlineDivider />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel label="Monthly website traffic" />
                      <Controller
                        name="monthlyWebsiteTraffic"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)} value={field.value || OPTIONAL_SELECT_VALUE}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select traffic" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                              {MONTHLY_WEBSITE_TRAFFIC_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.monthlyWebsiteTraffic?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Email list size" />
                      <Controller
                        name="emailListSize"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)} value={field.value || OPTIONAL_SELECT_VALUE}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                              {EMAIL_LIST_SIZE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.emailListSize?.message} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/60 p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground/90">Google Analytics connected</p>
                      <p className="text-xs leading-5 text-foreground/75">Turn this on only if analytics is already set up.</p>
                    </div>
                    <Controller
                      name="googleAnalyticsConnected"
                      control={step3Form.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(fromGoogleAnalyticsSelectValue(value))}
                          value={toGoogleAnalyticsSelectValue(field.value)}
                        >
                          <SelectTrigger className="h-11 min-w-[190px] rounded-xl border-border/80 bg-card/95 text-sm text-foreground">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                            <SelectItem value="true">Connected</SelectItem>
                            <SelectItem value="false">Not connected</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </WizardSectionCard>
              </form>
            ) : null}

                {step === 5 ? (
              <form
                id="campaign-wizard-step-5"
                onSubmit={step3Form.handleSubmit(
                  async (data) => {
                    if (isDismissClosingRef.current) {
                      return;
                    }
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    try {
                      await saveStep5Mutation.mutateAsync(data);
                    } catch {
                      // Errors are handled in mutation onError to keep UI stable.
                    }
                  },
                  handleStep4Invalid,
                )}
                onKeyDown={moveToNextWizardField}
                className="space-y-5"
              >
                <WizardSectionCard
                  eyebrow="Goals"
                  title="Define the goal and operating guardrails"
                  description="Set the business objective, practical constraints, and context the strategy should respect."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel label="Monthly marketing spend" required />
                      <Controller
                        name="monthlyMarketingSpend"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select spend" />
                            </SelectTrigger>
                            <SelectContent>
                              {MONTHLY_MARKETING_SPEND_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.monthlyMarketingSpend?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Primary goal" required />
                      <Controller
                        name="primaryGoal"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select goal" />
                            </SelectTrigger>
                            <SelectContent>
                              {primaryGoalOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.primaryGoal?.message} />
                    </div>
                  </div>

                  <div className="max-w-full space-y-2 sm:max-w-[calc(50%-0.5rem)]">
                    <FieldLabel label="Who handles marketing?" required />
                    <Controller
                      name="marketingHandler"
                      control={step3Form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={wizardInputClassName}>
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {marketingHandlerOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldMeta error={step3Form.formState.errors.marketingHandler?.message} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel label="Paid media budget range" required />
                      <Input
                        className={wizardInputClassName}
                        placeholder="e.g. INR 5,000 to INR 15,000 or not_sure"
                        {...step3Form.register('paidMediaBudgetRange')}
                      />
                      <FieldMeta error={step3Form.formState.errors.paidMediaBudgetRange?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Content capacity" required />
                      <Controller
                        name="contentCapacity"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>
                            <SelectContent>
                              {contentCapacityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.contentCapacity?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Sales capacity" />
                      <Input
                        className={wizardInputClassName}
                        placeholder="e.g. 2 SDRs + founder call support"
                        {...step3Form.register('salesCapacity')}
                      />
                      <FieldMeta error={step3Form.formState.errors.salesCapacity?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Known competitor status" required />
                      <Controller
                        name="knownCompetitorStatus"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {knownCompetitorStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.knownCompetitorStatus?.message} />
                    </div>
                  </div>

                  <InlineDivider />

                  <TagInputField
                    label="Constraints"
                    helper="Add limits or realities the strategy should respect."
                    footnote="Press Enter or click Add after each constraint"
                    placeholder="e.g. Small team, limited stock, weekends only"
                    values={watchedConstraints}
                    pendingValue={constraintDraft}
                    onPendingChange={setConstraintDraft}
                    onAdd={() => addListItem(watchedConstraints, constraintDraft, setConstraintDraft, (nextValues) => {
                      step3Form.setValue('constraints', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedConstraints, index, (nextValues) => {
                      step3Form.setValue('constraints', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step3Form.formState.errors.constraints)}
                  />

                  <InlineDivider />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <FieldLabel label="Current marketing activity" />
                        <p className="text-xs leading-5 text-foreground/75">Add channels that are currently active, paused, or discontinued.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-border/80 bg-card/95"
                        onClick={() =>
                          appendCurrentMarketingActivity({
                            channel: '',
                            status: getDefaultStringOptionValue(currentMarketingActivityStatusOptions, 'active'),
                            workingAssessment: '',
                            evidence: '',
                            monthlySpend: '',
                            timeRunning: '',
                            reasonStopped: '',
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add activity
                      </Button>
                    </div>

                    {currentMarketingActivityFields.length ? (
                      currentMarketingActivityFields.map((field, index) => (
                        <div key={field.id} className="space-y-3 rounded-xl border border-border/80 bg-muted/60 p-3">
                          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
                            <Input
                              className={wizardInputClassName}
                              placeholder="Channel (e.g. Google Ads, SEO, Instagram)"
                              {...step3Form.register(`currentMarketingActivity.${index}.channel`)}
                            />
                            <Controller
                              name={`currentMarketingActivity.${index}.status`}
                              control={step3Form.control}
                              render={({ field: controllerField }) => (
                                <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                  <SelectTrigger className={wizardInputClassName}>
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {currentMarketingActivityStatusOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <Controller
                              name={`currentMarketingActivity.${index}.workingAssessment`}
                              control={step3Form.control}
                              render={({ field: controllerField }) => (
                                <Select
                                  onValueChange={(value) =>
                                    controllerField.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)
                                  }
                                  value={controllerField.value || OPTIONAL_SELECT_VALUE}
                                >
                                  <SelectTrigger className={wizardInputClassName}>
                                    <SelectValue placeholder="Assessment" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={OPTIONAL_SELECT_VALUE}>Not set</SelectItem>
                                    {currentMarketingActivityAssessmentOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-11 w-11 rounded-xl border-border/80 bg-card/95"
                              onClick={() => removeCurrentMarketingActivity(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <Textarea
                            placeholder="Evidence (optional): what performance signal supports this status?"
                            {...step3Form.register(`currentMarketingActivity.${index}.evidence`)}
                            className={wizardTextareaClassName}
                          />

                          <div className="grid gap-3 lg:grid-cols-3">
                            <Input
                              className={wizardInputClassName}
                              placeholder="Monthly spend (optional)"
                              {...step3Form.register(`currentMarketingActivity.${index}.monthlySpend`)}
                            />
                            <Input
                              className={wizardInputClassName}
                              placeholder="Time running (optional)"
                              {...step3Form.register(`currentMarketingActivity.${index}.timeRunning`)}
                            />
                            <Input
                              className={wizardInputClassName}
                              placeholder="Reason stopped (optional)"
                              {...step3Form.register(`currentMarketingActivity.${index}.reasonStopped`)}
                            />
                          </div>

                          <FieldMeta
                            error={
                              step3Form.formState.errors.currentMarketingActivity?.[index]?.channel?.message ||
                              step3Form.formState.errors.currentMarketingActivity?.[index]?.status?.message ||
                              step3Form.formState.errors.currentMarketingActivity?.[index]?.workingAssessment?.message ||
                              step3Form.formState.errors.currentMarketingActivity?.[index]?.evidence?.message ||
                              step3Form.formState.errors.currentMarketingActivity?.[index]?.monthlySpend?.message ||
                              step3Form.formState.errors.currentMarketingActivity?.[index]?.timeRunning?.message ||
                              step3Form.formState.errors.currentMarketingActivity?.[index]?.reasonStopped?.message
                            }
                          />
                        </div>
                      ))
                    ) : (
                      <SubtleNote>No activity records added.</SubtleNote>
                    )}
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="What&apos;s working?" />
                    <Textarea
                      placeholder="Optional context about what already brings interest, leads, or sales"
                      {...step3Form.register('whatsWorking')}
                      className={wizardTextareaClassName}
                    />
                    <FieldMeta error={step3Form.formState.errors.whatsWorking?.message} />
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Biggest frustration" />
                    <Textarea
                      placeholder="Optional note about the biggest blocker in marketing or growth"
                      {...step3Form.register('biggestFrustration')}
                      className={wizardTextareaClassName}
                    />
                    <FieldMeta error={step3Form.formState.errors.biggestFrustration?.message} />
                  </div>

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Past marketing" />
                    <Textarea
                      placeholder="Optional summary of past experiments, channels, and outcomes"
                      {...step3Form.register('pastMarketing')}
                      className={wizardTextareaClassName}
                    />
                    <FieldMeta error={step3Form.formState.errors.pastMarketing?.message} />
                  </div>

                  <InlineDivider />

                  <TagInputField
                    label="Known competitors"
                    helper="Add one competitor at a time."
                    footnote="Press Enter or click Add after each competitor"
                    placeholder="e.g. Mamaearth, Practo, Zoho"
                    values={watchedCompetitors}
                    pendingValue={competitorDraft}
                    onPendingChange={setCompetitorDraft}
                    onAdd={() => addListItem(watchedCompetitors, competitorDraft, setCompetitorDraft, (nextValues) => {
                      step3Form.setValue('knownCompetitors', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedCompetitors, index, (nextValues) => {
                      step3Form.setValue('knownCompetitors', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    required={watchedKnownCompetitorStatus === 'provided'}
                    error={getArrayFieldError(step3Form.formState.errors.knownCompetitors)}
                  />

                  <InlineDivider />

                  <TagInputField
                    label="Channels to avoid"
                    helper="Add channels that should be avoided."
                    footnote="Press Enter or click Add after each channel"
                    placeholder="e.g. cold calling, influencer partnerships"
                    values={watchedChannelsToAvoid}
                    pendingValue={channelsToAvoidDraft}
                    onPendingChange={setChannelsToAvoidDraft}
                    onAdd={() => addListItem(watchedChannelsToAvoid, channelsToAvoidDraft, setChannelsToAvoidDraft, (nextValues) => {
                      step3Form.setValue('channelsToAvoid', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedChannelsToAvoid, index, (nextValues) => {
                      step3Form.setValue('channelsToAvoid', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step3Form.formState.errors.channelsToAvoid)}
                  />

                  <InlineDivider />

                  <TagInputField
                    label="Channels strongly preferred"
                    helper="Add channels you strongly prefer."
                    footnote="Press Enter or click Add after each channel"
                    placeholder="e.g. organic search, email, WhatsApp"
                    values={watchedChannelsStronglyPreferred}
                    pendingValue={channelsPreferredDraft}
                    onPendingChange={setChannelsPreferredDraft}
                    onAdd={() => addListItem(watchedChannelsStronglyPreferred, channelsPreferredDraft, setChannelsPreferredDraft, (nextValues) => {
                      step3Form.setValue('channelsStronglyPreferred', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedChannelsStronglyPreferred, index, (nextValues) => {
                      step3Form.setValue('channelsStronglyPreferred', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step3Form.formState.errors.channelsStronglyPreferred)}
                  />

                  <InlineDivider />

                  <TagInputField
                    label="Execution constraints"
                    helper="Add execution constraints like team, timeline, or inventory limits."
                    footnote="Press Enter or click Add after each constraint"
                    placeholder="e.g. one designer only, campaign window 30 days"
                    values={watchedExecutionConstraints}
                    pendingValue={executionConstraintDraft}
                    onPendingChange={setExecutionConstraintDraft}
                    onAdd={() => addListItem(watchedExecutionConstraints, executionConstraintDraft, setExecutionConstraintDraft, (nextValues) => {
                      step3Form.setValue('executionConstraints', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    onRemove={(index) => removeListItem(watchedExecutionConstraints, index, (nextValues) => {
                      step3Form.setValue('executionConstraints', nextValues, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    })}
                    error={getArrayFieldError(step3Form.formState.errors.executionConstraints)}
                  />

                  <InlineDivider />

                  <div className="space-y-2">
                    <FieldLabel label="Additional context" />
                    <Textarea
                      placeholder="Share seasonality, offline context, team constraints, or anything else that matters."
                      {...step3Form.register('additionalContext')}
                      className={wizardTextareaClassName}
                    />
                    <FieldMeta error={step3Form.formState.errors.additionalContext?.message} />
                  </div>
                </WizardSectionCard>

                {showGoalsOptionalSection ? (
                <Collapsible open={showOptionalDetails} onOpenChange={setShowOptionalDetails}>
                  <div className="rounded-2xl border border-border/80 bg-card/95">
                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/75">Optional context</p>
                        <p className="text-sm font-medium text-foreground/90">Add commercial and operating detail</p>
                        <p className="text-sm leading-5 text-foreground/75">These fields help sharpen estimates, but they are not required.</p>
                      </div>
                      <ChevronDown className={cn('h-4 w-4 text-foreground/75 transition-transform', showOptionalDetails && 'rotate-180')} />
                    </CollapsibleTrigger>

                    <CollapsibleContent className="border-t border-border/60 px-4 py-4 sm:px-5">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <FieldLabel label="Monthly revenue" helper={`Preset values accepted: ${MONTHLY_REVENUE_OPTIONS.map((option) => option.value).join(', ')}`} />
                          <Input className={wizardInputClassName} placeholder="e.g. 25k_1l or approx INR 3 lakh/month" {...step3Form.register('monthlyRevenue')} />
                          <FieldMeta error={step3Form.formState.errors.monthlyRevenue?.message} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel label="Monthly order volume" />
                          <Input
                            className={wizardInputClassName}
                            placeholder="e.g. 80-140 orders per month"
                            {...step3Form.register('monthlyOrderVolume')}
                          />
                          <FieldMeta error={step3Form.formState.errors.monthlyOrderVolume?.message} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel label="Product cost" />
                          <Input
                            className={wizardInputClassName}
                            placeholder="e.g. INR 250-450 per unit"
                            {...step3Form.register('productCost')}
                          />
                          <FieldMeta error={step3Form.formState.errors.productCost?.message} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel label="Customer retention pattern" />
                          <Controller
                            name="avgCustomerRetention"
                            control={step3Form.control}
                            render={({ field }) => (
                              <Select onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)} value={field.value || OPTIONAL_SELECT_VALUE}>
                                <SelectTrigger className={wizardInputClassName}>
                                  <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                                  {AVG_CUSTOMER_RETENTION_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <FieldMeta error={step3Form.formState.errors.avgCustomerRetention?.message} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel label="Repeat purchase frequency" />
                          <Controller
                            name="repeatPurchaseFrequency"
                            control={step3Form.control}
                            render={({ field }) => (
                              <Select onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)} value={field.value || OPTIONAL_SELECT_VALUE}>
                                <SelectTrigger className={wizardInputClassName}>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                                  {REPEAT_PURCHASE_FREQUENCY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <FieldMeta error={step3Form.formState.errors.repeatPurchaseFrequency?.message} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel label="Monthly website traffic" />
                          <Controller
                            name="monthlyWebsiteTraffic"
                            control={step3Form.control}
                            render={({ field }) => (
                              <Select onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)} value={field.value || OPTIONAL_SELECT_VALUE}>
                                <SelectTrigger className={wizardInputClassName}>
                                  <SelectValue placeholder="Select traffic" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                                  {MONTHLY_WEBSITE_TRAFFIC_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <FieldMeta error={step3Form.formState.errors.monthlyWebsiteTraffic?.message} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel label="Email list size" />
                          <Controller
                            name="emailListSize"
                            control={step3Form.control}
                            render={({ field }) => (
                              <Select onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)} value={field.value || OPTIONAL_SELECT_VALUE}>
                                <SelectTrigger className={wizardInputClassName}>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                                  {EMAIL_LIST_SIZE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <FieldMeta error={step3Form.formState.errors.emailListSize?.message} />
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/60 p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground/90">Google Analytics connected</p>
                            <p className="text-xs leading-5 text-foreground/75">Turn this on only if analytics is already set up.</p>
                          </div>
                          <Controller
                            name="googleAnalyticsConnected"
                            control={step3Form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={(value) => field.onChange(fromGoogleAnalyticsSelectValue(value))}
                                value={toGoogleAnalyticsSelectValue(field.value)}
                              >
                                <SelectTrigger className="h-11 min-w-[190px] rounded-xl border-border/80 bg-card/95 text-sm text-foreground">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                                  <SelectItem value="true">Connected</SelectItem>
                                  <SelectItem value="false">Not connected</SelectItem>
                                  <SelectItem value="unknown">Unknown</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/60 p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground/90">Use my inputs for better benchmark estimates</p>
                            <p className="text-xs leading-5 text-foreground/75">This helps us frame estimates like CAC and channel dependency better.</p>
                          </div>
                          <Controller name="dataConsentOptIn" control={step3Form.control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <FieldLabel label="Additional context" />
                          <Textarea
                            placeholder="Share seasonality, offline context, team constraints, or anything else that matters."
                            {...step3Form.register('additionalContext')}
                          className={wizardTextareaClassName}
                        />
                        <FieldMeta error={step3Form.formState.errors.additionalContext?.message} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                ) : null}

                </form>
              ) : null}

                {step === 6 ? (
              <form
                id="campaign-wizard-step-6"
                onSubmit={step3Form.handleSubmit(async (data) => {
                  if (isDismissClosingRef.current) {
                    return;
                  }
                  const hasAovOrAcv = Boolean(
                    normalizeString(data.averageOrderValue) ||
                      normalizeString(data.averageContractValue),
                  );
                  if (!hasAovOrAcv) {
                    step3Form.setError('averageOrderValue', {
                      type: 'manual',
                      message: 'Add average order value or average contract value.',
                    });
                    step3Form.setError('averageContractValue', {
                      type: 'manual',
                      message: 'Add average contract value or average order value.',
                    });
                    setErrorMessage('Step 6 needs at least one of AOV or ACV.');
                    return;
                  }
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  try {
                    await saveStep6Mutation.mutateAsync(data);
                  } catch {
                    // Errors are handled in mutation onError to keep UI stable.
                  }
                })}
                onKeyDown={moveToNextWizardField}
                className="space-y-5"
              >
                <WizardSectionCard
                  eyebrow="Economics"
                  title="Add commercial context"
                  description="This step maps to backend economics inputs and helps downstream output calibration."
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel label="Average order value (AOV)" />
                      <Input className={wizardInputClassName} placeholder="e.g. INR 2,500" {...step3Form.register('averageOrderValue')} />
                      <FieldMeta error={step3Form.formState.errors.averageOrderValue?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Average contract value (ACV)" />
                      <Input className={wizardInputClassName} placeholder="e.g. INR 25,000" {...step3Form.register('averageContractValue')} />
                      <FieldMeta error={step3Form.formState.errors.averageContractValue?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Gross margin percentage" />
                      <Input className={wizardInputClassName} placeholder="e.g. 42%" {...step3Form.register('grossMarginPercentage')} />
                      <FieldMeta error={step3Form.formState.errors.grossMarginPercentage?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Monthly revenue" helper={`Preset values accepted: ${MONTHLY_REVENUE_OPTIONS.map((option) => option.value).join(', ')}`} />
                      <Input className={wizardInputClassName} placeholder="e.g. 25k_1l or approx INR 3 lakh/month" {...step3Form.register('monthlyRevenue')} />
                      <FieldMeta error={step3Form.formState.errors.monthlyRevenue?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Monthly order volume" />
                      <Input
                        className={wizardInputClassName}
                        placeholder="e.g. 80-140 orders per month"
                        {...step3Form.register('monthlyOrderVolume')}
                      />
                      <FieldMeta error={step3Form.formState.errors.monthlyOrderVolume?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Product cost" />
                      <Input
                        className={wizardInputClassName}
                        placeholder="e.g. INR 250-450 per unit"
                        {...step3Form.register('productCost')}
                      />
                      <FieldMeta error={step3Form.formState.errors.productCost?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Monthly orders per subscriber" />
                      <Input className={wizardInputClassName} placeholder="e.g. 2.3" {...step3Form.register('monthlyOrdersPerSubscriber')} />
                      <FieldMeta error={step3Form.formState.errors.monthlyOrdersPerSubscriber?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Monthly churn rate" />
                      <Input className={wizardInputClassName} placeholder="e.g. 4.5%" {...step3Form.register('monthlyChurnRate')} />
                      <FieldMeta error={step3Form.formState.errors.monthlyChurnRate?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Customer retention pattern" />
                      <Controller
                        name="avgCustomerRetention"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)} value={field.value || OPTIONAL_SELECT_VALUE}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                              {AVG_CUSTOMER_RETENTION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.avgCustomerRetention?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Repeat purchase frequency" />
                      <Controller
                        name="repeatPurchaseFrequency"
                        control={step3Form.control}
                        render={({ field }) => (
                          <Select onValueChange={(value) => field.onChange(value === OPTIONAL_SELECT_VALUE ? '' : value)} value={field.value || OPTIONAL_SELECT_VALUE}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OPTIONAL_SELECT_VALUE}>Prefer not to say</SelectItem>
                              {REPEAT_PURCHASE_FREQUENCY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step3Form.formState.errors.repeatPurchaseFrequency?.message} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Sales cycle length" />
                      <Input className={wizardInputClassName} placeholder="e.g. 14 days" {...step3Form.register('salesCycleLength')} />
                      <FieldMeta error={step3Form.formState.errors.salesCycleLength?.message} />
                    </div>
                  </div>
                </WizardSectionCard>
              </form>
            ) : null}

                {step === 7 ? (
              <div className="space-y-5">
                {previewLoading ? (
                  <div className="space-y-4">
                    <ReviewLoadingCard />
                    <ReviewLoadingCard />
                  </div>
                ) : uiPreviewMode || preview ? (
                  <>
                    <ReviewSectionStack>
                      <ReviewSection
                        title="Focus"
                        description="Campaign framing, what is being marketed, source type, and target market."
                        filledLabel={`${classificationFilledCount}/10 filled`}
                        onEdit={() => openPreviewSectionEditor(1, 'focus')}
                        confirmationId="wizard-confirm-focus"
                        confirmationLabel="I confirm this focus setup is accurate"
                        checked={confirmFocus}
                        onCheckedChange={setConfirmFocus}
                      >
                        <ReviewGrid>
                          <SummaryField label="Campaign title" value={effectivePreviewStep1?.title || campaign?.name || preview?.campaign?.title} />
                          <SummaryField label="Marketing target" value={formatMarketingTargetType(effectivePreviewStep1?.marketingTargetType)} />
                          <SummaryField label="Focus name" value={effectivePreviewStep1?.focusName} />
                          <SummaryField label="Source type" value={formatSourceType(effectivePreviewStep1?.sourceType)} />
                          <SummaryField label="Source URL" value={effectivePreviewStep1?.primaryUrl || null} />
                          <SummaryField label="Target markets" value={formatStringList(effectivePreviewStep1?.targetMarkets)} />
                          <SummaryField label="Primary market" value={effectivePreviewStep1?.primaryMarket} />
                          <SummaryField label="Market scope" value={formatMarketScope(effectivePreviewStep1?.marketScope || campaign?.marketScope || null)} />
                          <SummaryField label="Operational locations" value={formatStringList(effectivePreviewStep1?.operationalLocations)} />
                          <SummaryField label="Regional expansion enabled" value={effectivePreviewStep1?.regionalLanguageExpansionEnabled ? 'Yes' : null} />
                          <SummaryField label="Regional languages" value={formatStringList(effectivePreviewStep1?.regionalLanguages)} />
                        </ReviewGrid>
                      </ReviewSection>

                      <ReviewSection
                        title="Business"
                        description="Business identity and offer details used for strategy generation."
                        filledLabel={`${businessFilledCount}/13 filled`}
                        onEdit={() => openPreviewSectionEditor(2, 'business')}
                        confirmationId="wizard-confirm-business"
                        confirmationLabel="I confirm this business setup is accurate"
                        checked={confirmBusiness}
                        onCheckedChange={setConfirmBusiness}
                      >
                        <ReviewGrid>
                          <SummaryField label="Business name" value={effectivePreviewStep2?.businessName} />
                          <SummaryField label="Industry category" value={formatBusinessType(effectivePreviewStep2?.industryCategory || effectivePreviewStep2?.businessType || campaign?.businessType || null)} />
                          <SummaryField label="Business model" value={formatBusinessModel(effectivePreviewStep2?.businessModel || campaign?.businessModel || null)} />
                          <SummaryField label="Audience model" value={formatAudienceModel(effectivePreviewStep2?.audienceModel)} />
                          <SummaryField label="Lifecycle stage" value={formatLifecycleStage(effectivePreviewStep2?.lifecycleStage)} />
                          <SummaryField label="Source URL" value={effectivePreviewStep1?.primaryUrl || null} />
                          <SummaryField label="Product category" value={effectivePreviewStep2?.productCategory} />
                          <SummaryField label="Product or service" value={formatStringOrList(effectivePreviewStep2?.productOrService as string[] | string | undefined)} />
                          <SummaryField label="Price range" value={effectivePreviewStep2?.priceRange} />
                          <SummaryField label="Offer summary" value={effectivePreviewStep2?.offerSummary} />
                          <SummaryField label="Differentiators" value={formatStringList(effectivePreviewStep2?.differentiators)} />
                          <SummaryField label="Sensitive category flags" value={formatStringList(effectivePreviewStep2?.sensitiveCategoryFlags)} />
                          <SummaryField label="Compliance-sensitive claims" value={formatStringList(effectivePreviewStep2?.complianceSensitiveClaims)} className="md:col-span-2" />
                          <SummaryField label="Business description" value={effectivePreviewStep2?.businessDescription} className="md:col-span-2" />
                        </ReviewGrid>
                      </ReviewSection>

                      <ReviewSection
                        title="Audience"
                        description="Segment, persona, language preferences, pain points, and buying context."
                        filledLabel={`${audienceFilledCount}/10 filled`}
                        onEdit={() => openPreviewSectionEditor(3, 'audience')}
                        confirmationId="wizard-confirm-audience"
                        confirmationLabel="I confirm this audience setup is accurate"
                        checked={confirmAudience}
                        onCheckedChange={setConfirmAudience}
                      >
                        <ReviewGrid>
                          <SummaryField label="Primary target segment" value={effectivePreviewStep3?.primaryTargetSegment} />
                          <SummaryField label="Target persona" value={effectivePreviewStep3?.targetPersona} />
                          <SummaryField label="Target audience" value={effectivePreviewStep3?.targetAudience} />
                          <SummaryField label="Audience segments" value={formatStringList(effectivePreviewStep3?.audienceSegments)} />
                          <SummaryField label="Language" value={formatLanguage(effectivePreviewStep3?.language)} />
                          <SummaryField label="Report language" value={formatReportLanguage(effectivePreviewStep3?.reportLanguage)} />
                          <SummaryField label="Desired outcome" value={effectivePreviewStep3?.desiredOutcome} />
                          <SummaryField label="Pain points" value={formatStringList(effectivePreviewStep3?.painPoints)} />
                          <SummaryField label="Decision process" value={effectivePreviewStep3?.decisionProcess} />
                          <SummaryField label="Buyer roles" value={formatStringList(effectivePreviewStep3?.buyerRoles)} />
                        </ReviewGrid>
                      </ReviewSection>

                      <ReviewSection
                        title="Goals & Context"
                        description="Budget, constraints, goals, and supporting context."
                        filledLabel={`${goalsFilledCount}/17 filled`}
                        onEdit={() => openPreviewSectionEditor(5, 'goals')}
                        confirmationId="wizard-confirm-goals"
                        confirmationLabel="I confirm these goals and context inputs look right"
                        checked={confirmGoals}
                        onCheckedChange={setConfirmGoals}
                      >
                        <ReviewGrid>
                          <SummaryField label="Monthly marketing spend" value={formatMonthlyMarketingSpend(effectivePreviewStep4?.monthlyMarketingSpend)} />
                          <SummaryField label="Paid media budget range" value={effectivePreviewStep4?.paidMediaBudgetRange} />
                          <SummaryField label="Primary goal" value={formatPrimaryGoal(effectivePreviewStep4?.primaryGoal)} />
                          <SummaryField label="Marketing owner" value={formatMarketingHandler(effectivePreviewStep4?.marketingHandler)} />
                          <SummaryField label="Content capacity" value={effectivePreviewStep4?.contentCapacity} />
                          <SummaryField label="Sales capacity" value={effectivePreviewStep4?.salesCapacity} />
                          <SummaryField label="Current marketing activity" value={formatCurrentMarketingActivity(effectivePreviewStep4?.currentMarketingActivity)} className="md:col-span-2" />
                          <SummaryField label="Past marketing" value={effectivePreviewStep4?.pastMarketing} className="md:col-span-2" />
                          <SummaryField label="Known competitor status" value={effectivePreviewStep4?.knownCompetitorStatus} />
                          <SummaryField label="Constraints" value={formatStringList(effectivePreviewStep4?.constraints)} />
                          <SummaryField label="Channels to avoid" value={formatStringList(effectivePreviewStep4?.channelsToAvoid)} />
                          <SummaryField label="Channels strongly preferred" value={formatStringList(effectivePreviewStep4?.channelsStronglyPreferred)} />
                          <SummaryField label="Execution constraints" value={formatStringList(effectivePreviewStep4?.executionConstraints)} />
                          <SummaryField label="What's working" value={effectivePreviewStep4?.whatsWorking} />
                          <SummaryField label="Biggest frustration" value={effectivePreviewStep4?.biggestFrustration} />
                          <SummaryField label="Known competitors" value={formatStringList(effectivePreviewStep4?.knownCompetitors)} />
                          <SummaryField label="Additional context" value={effectivePreviewStep4?.additionalContext} className="md:col-span-2" />
                        </ReviewGrid>
                      </ReviewSection>

                      <ReviewSection
                        title="Economics"
                        description="Revenue and unit economics context."
                        filledLabel={economicsComplete ? 'Economics added' : 'Optional but recommended'}
                        onEdit={() => openPreviewSectionEditor(6, 'economics')}
                        confirmationId="wizard-confirm-economics"
                        confirmationLabel="I confirm these economics inputs look right"
                        checked={confirmEconomics}
                        onCheckedChange={setConfirmEconomics}
                      >
                        <ReviewGrid>
                          <SummaryField label="Average order value" value={effectivePreviewStep4?.averageOrderValue} />
                          <SummaryField label="Average contract value" value={effectivePreviewStep4?.averageContractValue} />
                          <SummaryField label="Gross margin %" value={effectivePreviewStep4?.grossMarginPercentage} />
                          <SummaryField label="Monthly revenue" value={formatMonthlyRevenue(effectivePreviewStep4?.monthlyRevenue)} />
                          <SummaryField label="Monthly order volume" value={effectivePreviewStep4?.monthlyOrderVolume} />
                          <SummaryField label="Product cost" value={effectivePreviewStep4?.productCost} />
                          <SummaryField label="Orders per subscriber" value={effectivePreviewStep4?.monthlyOrdersPerSubscriber} />
                          <SummaryField label="Monthly churn rate" value={effectivePreviewStep4?.monthlyChurnRate} />
                          <SummaryField label="Retention" value={formatAvgCustomerRetention(effectivePreviewStep4?.avgCustomerRetention)} />
                          <SummaryField label="Repeat frequency" value={formatRepeatPurchaseFrequency(effectivePreviewStep4?.repeatPurchaseFrequency)} />
                          <SummaryField label="Sales cycle length" value={effectivePreviewStep4?.salesCycleLength} />
                          <SummaryField label="Website traffic" value={formatMonthlyWebsiteTraffic(effectivePreviewStep4?.monthlyWebsiteTraffic)} />
                          <SummaryField label="Email list size" value={formatEmailListSize(effectivePreviewStep4?.emailListSize)} />
                          <SummaryField label="Google Analytics" value={formatGoogleAnalyticsConnected(effectivePreviewStep4?.googleAnalyticsConnected as boolean | 'unknown' | undefined)} />
                        </ReviewGrid>
                      </ReviewSection>

                      {hasDerivedInsights && !uiPreviewMode ? (
                        <Card className="rounded-2xl border-border/80 bg-card/95 shadow-none">
                          <CardHeader>
                            <CardTitle className="text-lg">Estimates Based On Your Inputs</CardTitle>
                            <CardDescription>These are directional estimates, not hard truths. They are based on the information you shared.</CardDescription>
                          </CardHeader>
                          <CardContent className="grid gap-4 md:grid-cols-2">
                            {derivedCac ? <SummaryField label="Estimated CAC" value={`Based on your inputs, your estimated CAC is ${derivedCac}.`} /> : null}
                            {derivedMargin ? <SummaryField label="Estimated Margin" value={`Based on your inputs, your estimated margin per unit is ${derivedMargin}.`} /> : null}
                            {derivedCltv ? <SummaryField label="Estimated CLTV" value={`Based on your inputs, your estimated CLTV is ${derivedCltv}.`} /> : null}
                            {derivedRatio ? <SummaryField label="CAC:CLTV Ratio" value={`Your current CAC to CLTV ratio estimate is ${derivedRatio}.`} /> : null}
                            {budgetCategory ? <SummaryField label="Budget Category" value={`Your business appears to be in the ${String(budgetCategory)} budget category.`} /> : null}
                            {executionCapacity ? <SummaryField label="Execution Capacity" value={`Based on your setup, your execution capacity looks ${String(executionCapacity)}.`} /> : null}
                            {primaryChannelDependency ? <SummaryField label="Primary Channel Dependency" value={`You seem ${String(primaryChannelDependency)} dependent on one main sales channel.`} /> : null}
                          </CardContent>
                        </Card>
                      ) : null}

                      <FinalConfirmationCard>
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <FinalIconWrap>
                              <ShieldCheck className="h-5 w-5 text-[rgba(212,168,83,0.9)]" />
                            </FinalIconWrap>
                            <div className="space-y-1">
                              <CardTitle className="text-lg">Final Confirmation</CardTitle>
                              <CardDescription>One last check before strategy generation starts.</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ReviewConfirmCard
                            id="wizard-ready-to-generate"
                            checked={readyToGenerate}
                            onCheckedChange={setReadyToGenerate}
                            label="I have reviewed the setup and am ready to generate strategy"
                          />
                          <ReviewConfirmCard
                            id="wizard-data-consent"
                            checked={step3Form.getValues('dataConsentOptIn') ?? true}
                            onCheckedChange={(checked) => {
                              step3Form.setValue('dataConsentOptIn', checked, {
                                shouldDirty: true,
                              });
                              step3SnapshotRef.current = {
                                ...step3SnapshotRef.current,
                                dataConsentOptIn: checked,
                              };
                            }}
                            label="I consent to processing the submitted business and campaign data"
                          />
                        </CardContent>
                      </FinalConfirmationCard>

                    </ReviewSectionStack>
                  </>
                ) : (
                  <Card className="rounded-2xl border-border/80 bg-card/95 shadow-none">
                    <CardContent className="py-12 text-center">
                      <p className="text-sm text-foreground/75">
                        No preview data is available yet. Complete the setup steps to review campaign readiness.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
              </div>
            </div>

            <div className="shrink-0">
              {step === 1 ? (
                <StepFooter>
                  <LightOutlineButton type="button" onClick={() => onOpenChange(false)}>
                    Cancel
                  </LightOutlineButton>
                  <DarkPrimaryButton form={currentFormId} type="submit" disabled={createOrSaveStep1Mutation.isPending}>
                    {createOrSaveStep1Mutation.isPending ? 'Saving...' : 'Continue'}
                  </DarkPrimaryButton>
                </StepFooter>
              ) : null}

              {step === 2 ? (
                <StepFooter>
                  <LightOutlineButton
                    type="button"
                    onClick={() => {
                      setStep(1);
                      if (activeCampaignId) {
                        syncWizardUrl(activeCampaignId, 1);
                      }
                    }}
                  >
                    Back
                  </LightOutlineButton>
                  <DarkPrimaryButton form={currentFormId} type="submit" disabled={saveStep2Mutation.isPending}>
                    {saveStep2Mutation.isPending ? 'Saving...' : 'Continue'}
                  </DarkPrimaryButton>
                </StepFooter>
              ) : null}

              {step === 3 ? (
                <StepFooter>
                  <LightOutlineButton
                    type="button"
                    onClick={() => {
                      setStep(2);
                      if (activeCampaignId) {
                        syncWizardUrl(activeCampaignId, 2);
                      }
                    }}
                  >
                    Back
                  </LightOutlineButton>
                  <DarkPrimaryButton form={currentFormId} type="submit">
                    Continue
                  </DarkPrimaryButton>
                </StepFooter>
              ) : null}

              {step === 4 ? (
                <StepFooter>
                  <LightOutlineButton
                    type="button"
                    onClick={() => {
                      setStep(3);
                      if (activeCampaignId) {
                        syncWizardUrl(activeCampaignId, 3);
                      }
                    }}
                  >
                    Back
                  </LightOutlineButton>
                  <DarkPrimaryButton form={currentFormId} type="submit" disabled={saveStep4Mutation.isPending}>
                    {saveStep4Mutation.isPending ? 'Saving...' : 'Continue'}
                  </DarkPrimaryButton>
                </StepFooter>
              ) : null}

              {step === 5 ? (
                <StepFooter>
                  <LightOutlineButton
                    type="button"
                    onClick={() => {
                      setStep(4);
                      if (activeCampaignId) {
                        syncWizardUrl(activeCampaignId, 4);
                      }
                    }}
                  >
                    Back
                  </LightOutlineButton>
                  <DarkPrimaryButton form={currentFormId} type="submit" disabled={saveStep5Mutation.isPending}>
                    {saveStep5Mutation.isPending ? 'Saving...' : 'Continue'}
                  </DarkPrimaryButton>
                </StepFooter>
              ) : null}

              {step === 6 ? (
                <StepFooter>
                  <LightOutlineButton
                    type="button"
                    onClick={() => {
                      setStep(5);
                      if (activeCampaignId) {
                        syncWizardUrl(activeCampaignId, 5);
                      }
                    }}
                  >
                    Back
                  </LightOutlineButton>
                  <DarkPrimaryButton form={currentFormId} type="submit" disabled={saveStep6Mutation.isPending}>
                    {saveStep6Mutation.isPending ? 'Saving...' : 'Review'}
                  </DarkPrimaryButton>
                </StepFooter>
              ) : null}

              {step === 7 ? (
                <ReviewFooter>
                  <LightOutlineButton
                    type="button"
                    onClick={() => {
                      setStep(6);
                      if (activeCampaignId) {
                        syncWizardUrl(activeCampaignId, 6);
                      }
                    }}
                  >
                    Back
                  </LightOutlineButton>
                  <DarkPrimaryButton onClick={handlePreviewPrimaryAction} disabled={commitMutation.isPending}>
                    {primaryActionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </DarkPrimaryButton>
                </ReviewFooter>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent className="border-[rgba(242,234,219,0.16)] bg-[rgba(11,13,16,0.96)] text-[rgba(242,234,219,0.92)] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
          <AlertDialogHeader>
            <AlertDialogTitle style={WIZARD_SERIF_STYLE} className="text-[30px] leading-[0.98] font-medium tracking-[-0.03em] text-[rgba(242,234,219,0.93)]">
              Campaign Updated Elsewhere
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[rgba(242,234,219,0.62)]">
              This campaign was updated in another session. Close this dialog and reopen the campaign to continue from the latest saved step.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="border border-[rgba(212,168,83,0.5)] bg-[#d4a853] text-[#11100d] hover:bg-[#e0ba6a]"
              onClick={() => {
                setShowConflictDialog(false);
                onOpenChange(false);
              }}
            >
              Close Wizard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCommitConfirmDialog} onOpenChange={setShowCommitConfirmDialog}>
        <AlertDialogContent className="max-w-[560px] border-[rgba(212,168,83,0.36)] bg-[rgba(11,13,16,0.97)] text-[rgba(242,234,219,0.92)] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
          <AlertDialogHeader className="items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(212,168,83,0.36)] bg-[rgba(212,168,83,0.18)] text-[rgba(212,168,83,0.92)] shadow-sm">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <AlertDialogTitle
              style={WIZARD_SERIF_STYLE}
              className="text-[38px] leading-[0.98] font-medium tracking-[-0.03em] text-[rgba(242,234,219,0.93)]"
            >
              Generate Strategy?
            </AlertDialogTitle>
            <AlertDialogDescription className="max-w-[440px] text-[17px] leading-8 text-[rgba(242,234,219,0.62)]">
              Once you confirm, this wizard will be committed and you will not be able to make further changes here. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex w-full flex-row items-center justify-between sm:justify-between">
            <AlertDialogCancel
              disabled={commitMutation.isPending}
              className="min-w-[120px] border-[rgba(212,168,83,0.32)] bg-[rgba(10,11,13,0.88)] text-[rgba(212,168,83,0.88)] hover:bg-[rgba(8,9,11,0.92)]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={commitMutation.isPending}
              className="min-w-[140px] border border-[rgba(212,168,83,0.52)] bg-[#d4a853] text-[#11100d] hover:bg-[#e0ba6a]"
              onClick={(event) => {
                event.preventDefault();
                commitMutation.mutate(undefined, {
                  onSuccess: () => {
                    setShowCommitConfirmDialog(false);
                  },
                });
              }}
            >
              {commitMutation.isPending ? 'Generating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
