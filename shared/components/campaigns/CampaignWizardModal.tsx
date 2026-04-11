'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
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
  BUSINESS_TYPE_OPTIONS,
  MARKET_SCOPE_OPTIONS,
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
} from '@/shared/types/campaign';
import {
  DIGITAL_PRESENCE_LINK_TYPE_OPTIONS,
  AVG_CUSTOMER_RETENTION_OPTIONS,
  EMAIL_LIST_SIZE_OPTIONS,
  MARKETING_HANDLER_OPTIONS,
  MONTHLY_MARKETING_SPEND_OPTIONS,
  MONTHLY_REVENUE_OPTIONS,
  MONTHLY_WEBSITE_TRAFFIC_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  REPEAT_PURCHASE_FREQUENCY_OPTIONS,
  SALES_CHANNEL_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
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
  type DigitalPresenceLink,
  type RankedSalesChannel,
  type SocialHandle,
  type SourceType,
  type WizardDerivedMetrics,
} from '@/shared/types/wizard';

type WizardModalStep = 1 | 2 | 3 | 4 | 5;

interface CampaignWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string | null;
  initialStep: WizardModalStep;
}

const OPTIONAL_SELECT_VALUE = '__empty__';

const EMPTY_STEP_1_VALUES: Step1FormData = {
  title: '',
  marketLocation: '',
  marketingTargetType: undefined as never,
  focusName: '',
  sourceType: undefined as never,
  primaryUrl: '',
};

const EMPTY_STEP_2_VALUES: Step2FormData = {
  businessType: undefined as never,
  businessModel: undefined as never,
  marketScope: undefined as never,
  businessDescription: '',
  productCategory: '',
  productOrService: '',
  offerSummary: '',
  priceRange: '',
  differentiators: [],
  salesChannels: [],
  socialHandles: [],
  digitalPresenceLinks: [],
};

const EMPTY_STEP_3_VALUES: Step3FormData = {
  targetPersona: '',
  targetAudience: '',
  language: '',
  painPoints: [],
  desiredOutcome: '',
  constraints: [],
  monthlyMarketingSpend: undefined as never,
  primaryGoal: undefined as never,
  marketingHandler: undefined as never,
  whatsWorking: '',
  biggestFrustration: '',
  dataConsentOptIn: true,
  monthlyRevenue: '',
  monthlyOrderVolume: undefined,
  productCost: undefined,
  avgCustomerRetention: '',
  repeatPurchaseFrequency: '',
  googleAnalyticsConnected: false,
  monthlyWebsiteTraffic: '',
  emailListSize: '',
  knownCompetitors: [],
  additionalContext: '',
};

const WIZARD_STEPS: Array<{ step: WizardModalStep; label: string; hint: string }> = [
  { step: 1, label: 'Focus', hint: 'Focus' },
  { step: 2, label: 'Business', hint: 'Business' },
  { step: 3, label: 'Audience', hint: 'Audience' },
  { step: 4, label: 'Goals & Context', hint: 'Goals & Context' },
  { step: 5, label: 'Review & Consent', hint: 'Review & Consent' },
];

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
    <section className={cn('overflow-hidden rounded-[18px] border border-[#d9d1c6] bg-white shadow-[0_1px_0_rgba(50,56,65,0.03)]', className)}>
      <div className="border-b border-[#e7dfd4] px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f6f84]">{eyebrow}</p>
        <div className="mt-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0c1220]">{title}</h3>
            {description ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#7b8794] transition hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    aria-label={`More information about ${title}`}
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="max-w-[260px] rounded-lg bg-foreground px-3 py-2 text-xs leading-5 text-background">
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
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#6f7782]">{label}</p>
      <p className={cn('text-[14px] leading-6 text-[#111827]', !value && 'italic text-[#9aa0a8]')}>{value || 'Not provided'}</p>
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
      <p className="text-[14px] font-semibold leading-6 text-[#111827]">
        {label}
        {required ? <span className="ml-1 text-[#2f6db5]">*</span> : null}
      </p>
      {helper ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#7b8794] transition hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label={`More information about ${label}`}
            >
              <CircleHelp className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="max-w-[220px] rounded-lg bg-foreground px-2.5 py-2 text-xs leading-5 text-background">
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
                    ? 'border-[#111827] bg-[#111827] text-white'
                    : isActive
                      ? 'border-[#111827] bg-[#111827] text-white ring-[4px] ring-[#d7d9de]'
                      : 'border-[#d4d0c7] bg-white text-[#7a8596]',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : `0${wizardStep.step}`}
              </div>
              <p className={cn('text-[10px] font-semibold uppercase tracking-[0.08em]', isActive || isComplete ? 'text-[#111827]' : 'text-[#6a7687]')}>
                {wizardStep.label}
              </p>
            </div>
            {index < WIZARD_STEPS.length - 1 ? (
              <div className="mt-[18px] h-[1.5px] flex-1 bg-[#ddd6cd]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-[#e7dfd4]" />;
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
    <Card className="rounded-[18px] border-[#d9d1c6] bg-white shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 py-5">
        <div className="space-y-1">
          <CardTitle className="text-[17px] font-semibold text-[#111827]">{title}</CardTitle>
          <CardDescription className="text-[14px] leading-6 text-[#667382]">{description}</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[14px] text-[#737b86]">{filledLabel}</p>
          <Button type="button" variant="outline" size="sm" className="rounded-xl border-[#d8d0c6] bg-white px-4" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="border-t border-[#e7dfd4] px-6 py-6">
        {children}
      </CardContent>
      {confirmationId && confirmationLabel && onCheckedChange ? (
        <CardFooter className="px-6 pb-5 pt-0">
          <div className="flex w-full items-start gap-4 rounded-2xl border border-[#d8d0c6] bg-white p-4">
            <Checkbox
              id={confirmationId}
              checked={checked}
              onCheckedChange={(next) => onCheckedChange(next === true)}
              className="mt-1"
            />
            <div className="space-y-1">
              <label htmlFor={confirmationId} className="cursor-pointer text-sm font-medium text-foreground">
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
    <div className="flex w-full items-start gap-4 rounded-2xl border border-[#d8d0c6] bg-white p-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next === true)}
        className="mt-1"
      />
      <div className="space-y-1">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </label>
      </div>
    </div>
  );
}

function ReviewLoadingCard() {
  return (
    <Card className="h-40 animate-pulse rounded-[18px] border-[#d9d1c6] bg-white shadow-none" />
  );
}

function StepFooter({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="border-t border-[#ddd4ca] bg-[#f6f2ec] px-7 py-5">
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
        'mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-white transition',
        selected ? 'border-[#111827]' : 'border-[#d7d1c8]',
      )}
    >
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full transition',
          selected ? 'bg-[#111827]' : 'bg-transparent',
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
      className="flex h-[48px] w-full items-center justify-center rounded-2xl border border-dashed border-[#d9d1c6] bg-white text-[15px] font-medium text-[#4f5b6a] transition hover:border-[#b8b1a6] hover:text-[#111827]"
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
    <p className="text-[13px] leading-6 text-[#667382]">{children}</p>
  );
}

function SoftNotice({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#f8f5f0] px-4 py-3 text-[14px] leading-6 text-[#5f6b7a]">
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
    <div className="flex w-full items-start gap-4 rounded-2xl border border-[#d8d0c6] bg-white p-4">
      <Checkbox id={id} checked={checked} onCheckedChange={(next) => onCheckedChange(next === true)} className="mt-1" />
      <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
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
  return <div className="border-t border-[#e8e0d6]" />;
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
    <div className="border-t border-[#ddd4ca] bg-[#f6f2ec] px-7 py-5">
      <div className="mx-auto flex w-full max-w-[920px] justify-end gap-3">{children}</div>
    </div>
  );
}

function InlineMutedLabel({
  children,
}: {
  children: ReactNode;
}) {
  return <p className="text-[14px] leading-6 text-[#667382]">{children}</p>;
}

function RequiredAsterisk() {
  return <span className="ml-1 text-[#2f6db5]">*</span>;
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
      <p className="text-[15px] font-semibold leading-[1.35] text-[#111827]">{label}</p>
      {description ? <p className="max-w-[22ch] text-[14px] leading-[1.55] text-[#5f6f84]">{description}</p> : null}
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
    <Card className="rounded-[18px] border-[#d9d1c6] bg-white shadow-none">
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
  return <span className="text-[#677485]">{children}</span>;
}

function CompactCardContent({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-4">{children}</div>;
}

function TightDivider() {
  return <div className="border-t border-[#e7dfd4]" />;
}

function GhostSecondaryText({
  children,
}: {
  children: ReactNode;
}) {
  return <p className="text-[14px] leading-6 text-[#607083]">{children}</p>;
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
    <Button className={cn('rounded-2xl bg-[#111827] px-6 text-white hover:bg-[#0c1220]', className)} {...props}>
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
    <Button variant="outline" className={cn('rounded-2xl border-[#d8d0c6] bg-white px-6 text-[#111827] hover:bg-[#faf7f2]', className)} {...props}>
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
    <Button variant="outline" size="sm" className={cn('rounded-xl border-[#d8d0c6] bg-white px-4', className)} {...props}>
      {children}
    </Button>
  );
}

function ReviewNotProvidedText({
  children,
}: {
  children: ReactNode;
}) {
  return <span className="italic text-[#9aa0a8]">{children}</span>;
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
  return <div className="rounded-xl border border-[#d8d0c6] bg-[#faf7f2] p-2">{children}</div>;
}

function MutedHelper({
  children,
}: {
  children: ReactNode;
}) {
  return <p className="text-[14px] leading-6 text-[#667382]">{children}</p>;
}

function SubtleNote({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="rounded-2xl bg-[#f8f5f0] px-4 py-3 text-[14px] leading-6 text-[#5f6b7a]">{children}</div>;
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
            <Badge key={`${label}-${value}-${index}`} variant="secondary" className="gap-2 rounded-full border border-[#d8d0c6] bg-[#f6f2ed] px-3 py-1 text-foreground shadow-none">
              <span className="max-w-[220px] truncate">{value}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="rounded-full text-muted-foreground transition hover:text-foreground"
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
          className="h-[46px] rounded-[12px] border-[#d8d0c6] bg-white px-4 text-[15px] text-[#111827] shadow-none placeholder:text-[#758296]"
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
      {footnote ? <p className="text-[13px] leading-6 text-[#667382]">{footnote}</p> : null}
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
                'rounded-2xl border bg-white text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8dee8]',
                density === 'inline'
                  ? 'px-4 py-4'
                  : density === 'list'
                    ? 'px-4 py-3.5'
                  : density === 'compact'
                    ? 'px-5 py-4'
                    : 'px-5 py-[18px]',
                isSelected
                  ? 'border-[#b9b1a6] shadow-[0_8px_18px_rgba(50,56,65,0.06)]'
                  : 'border-[#d8d0c6] hover:border-[#c6bdae]',
              )}
            >
              <OptionCardContent density={density}>
                <OptionBullet selected={isSelected} />
                <div className={cn('min-w-0 space-y-1.5', density !== 'default' && 'space-y-1')}>
                  <p
                    className={cn(
                      'font-semibold text-[#111827]',
                      density === 'inline' ? 'text-[14px] leading-[1.3]' : density === 'list' ? 'text-[15px] leading-[1.3]' : 'text-[15px] leading-[1.35]',
                    )}
                  >
                    {option.label}
                  </p>
                  {option.description ? (
                    <p
                      className={cn(
                        'text-[#5f6f84]',
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

function validateSourceUrl(sourceType: SourceType | undefined, rawUrl: string | undefined) {
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

function normalizeListItems(items?: string[] | null) {
  return (items ?? []).map((item) => item.trim()).filter(Boolean);
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
  if (sourceType === 'single_product') {
    return 'Product / service name';
  }

  if (sourceType === 'category_collection') {
    return 'Category or collection name';
  }

  return 'Brand or store name';
}

function getFocusNameHelper(sourceType?: Step1FormData['marketingTargetType']) {
  if (sourceType === 'single_product') {
    return 'Product/service name';
  }

  if (sourceType === 'category_collection') {
    return 'Category or collection name';
  }

  return 'Brand or store name';
}

function getSourceUrlLabel(sourceType?: SourceType) {
  if (sourceType === 'marketplace') {
    return 'Marketplace listing/store URL';
  }

  if (sourceType === 'social') {
    return 'Social profile URL';
  }

  if (sourceType === 'gmb') {
    return 'Google Business profile URL';
  }

  return 'Website / landing page URL';
}

function formatNumericValue(value?: number | null, prefix = '') {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return `${prefix}${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value)}`;
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

  return 5;
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

  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(campaignId ?? null);
  const [step, setStep] = useState<WizardModalStep>(initialStep);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showCommitConfirmDialog, setShowCommitConfirmDialog] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [showOfferExtras, setShowOfferExtras] = useState(false);

  const [confirmFocus, setConfirmFocus] = useState(false);
  const [confirmBusiness, setConfirmBusiness] = useState(false);
  const [confirmAudience, setConfirmAudience] = useState(false);
  const [confirmGoals, setConfirmGoals] = useState(false);
  const [readyToGenerate, setReadyToGenerate] = useState(false);

  const [differentiatorDraft, setDifferentiatorDraft] = useState('');
  const [constraintDraft, setConstraintDraft] = useState('');
  const [painPointDraft, setPainPointDraft] = useState('');
  const [competitorDraft, setCompetitorDraft] = useState('');

  const step1VersionRef = useRef<number>(0);
  const step2VersionRef = useRef<number>(0);
  const step3VersionRef = useRef<number>(0);
  const step4VersionRef = useRef<number>(0);
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
    setConfirmFocus(false);
    setConfirmBusiness(false);
    setConfirmAudience(false);
    setConfirmGoals(false);
    setReadyToGenerate(false);
    setShowCommitConfirmDialog(false);
    autoCreatedDraftIdRef.current = null;
    hasSavedStep1Ref.current = Boolean(campaignId);
  }, [campaignId, initialStep, open]);

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
  });

  const { data: step1Data } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.step(activeCampaignId, 'STEP_1') : ['wizard', 'step-1-idle'],
    queryFn: () => wizardRepository.getStep(activeCampaignId as string, 'STEP_1'),
    enabled: Boolean(activeCampaignId),
  });

  const { data: step2Data } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.step(activeCampaignId, 'STEP_2') : ['wizard', 'step-2-idle'],
    queryFn: () => wizardRepository.getStep(activeCampaignId as string, 'STEP_2'),
    enabled: Boolean(activeCampaignId),
  });

  const { data: step3Data } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.step(activeCampaignId, 'STEP_3') : ['wizard', 'step-3-idle'],
    queryFn: () => wizardRepository.getStep(activeCampaignId as string, 'STEP_3'),
    enabled: Boolean(activeCampaignId),
  });

  const { data: step4Data } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.step(activeCampaignId, 'STEP_4') : ['wizard', 'step-4-idle'],
    queryFn: () => wizardRepository.getStep(activeCampaignId as string, 'STEP_4'),
    enabled: Boolean(activeCampaignId),
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.preview(activeCampaignId) : ['wizard', 'preview-idle'],
    queryFn: () => wizardRepository.getPreview(activeCampaignId as string),
    enabled: Boolean(activeCampaignId) && step === 5,
  });

  const { data: wizardState } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.state(activeCampaignId) : ['wizard', 'state-idle'],
    queryFn: () => wizardRepository.getWizardState(activeCampaignId as string),
    enabled: Boolean(activeCampaignId) && step === 5,
  });

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

  const watchedMarketingTargetType = step1Form.watch('marketingTargetType');
  const watchedSourceType = step1Form.watch('sourceType');
  const watchedDifferentiators = step2Form.watch('differentiators') ?? [];
  const watchedSalesChannels = step2Form.watch('salesChannels') ?? [];
  const watchedPainPoints = step3Form.watch('painPoints') ?? [];
  const watchedConstraints = step3Form.watch('constraints') ?? [];
  const watchedCompetitors = step3Form.watch('knownCompetitors') ?? [];
  const uiPreviewMode = !campaignId && !activeCampaignId;

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

    const inferredSourceType =
      (savedData.sourceType as Step1FormData['sourceType'] | undefined) ||
      (normalizeString(savedData.primaryUrl as string | undefined) || normalizeString(savedData.websiteUrl as string | undefined) || (!isFreshAutoCreatedDraft ? campaign?.website || '' : '')
        ? 'website'
        : 'manual_only');

    const nextValues: Step1FormData = {
      title: normalizeString(savedData.title as string | undefined) || (isFreshAutoCreatedDraft ? '' : campaign?.name) || '',
      marketingTargetType:
        (savedData.marketingTargetType as Step1FormData['marketingTargetType']) ||
        (normalizeString(savedData.productOrService as string | undefined) ? 'single_product' : 'brand_store') ||
        undefined as never,
      focusName:
        normalizeString(savedData.focusName as string | undefined) ||
        normalizeString(savedData.productOrService as string | undefined) ||
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
      marketLocation: normalizeString(savedData.marketLocation as string | undefined) || (isFreshAutoCreatedDraft ? '' : campaign?.city) || '',
    };

    step1SnapshotRef.current = nextValues;
    step1Form.reset(nextValues);

    if (step1Data?.version !== undefined) {
      step1VersionRef.current = step1Data.version;
    }
  }, [activeCampaignId, campaign, open, step, step1Data, step1Form]);

  useEffect(() => {
    if (!open || step !== 2 || !activeCampaignId) {
      return;
    }

    const savedData = (step2Data?.data ?? {}) as Record<string, unknown>;
    const legacyStep1Data = (step1Data?.data ?? {}) as Record<string, unknown>;
    const legacyStep3Data = (step3Data?.data ?? {}) as Record<string, unknown>;
    const nextSocialHandles = coerceSocialHandles(savedData.socialHandles);
    const legacySocialHandles = coerceSocialHandles(legacyStep3Data.socialHandles);
    const nextDigitalPresenceLinks = coerceDigitalPresenceLinks(savedData.digitalPresenceLinks);

    step2Form.reset({
      businessType:
        (savedData.businessType as Step2FormData['businessType']) ||
        (legacyStep1Data.businessType as Step2FormData['businessType']) ||
        campaign?.businessType ||
        undefined as never,
      businessModel:
        (savedData.businessModel as Step2FormData['businessModel']) ||
        (legacyStep1Data.businessModel as Step2FormData['businessModel']) ||
        campaign?.businessModel ||
        undefined as never,
      marketScope:
        (savedData.marketScope as Step2FormData['marketScope']) ||
        (legacyStep1Data.marketScope as Step2FormData['marketScope']) ||
        campaign?.marketScope ||
        undefined as never,
      businessDescription:
        normalizeString(savedData.businessDescription as string | undefined) ||
        normalizeString(legacyStep1Data.businessDescription as string | undefined),
      productCategory:
        normalizeString(savedData.productCategory as string | undefined) ||
        normalizeString(legacyStep1Data.productCategory as string | undefined),
      productOrService:
        normalizeString(savedData.productOrService as string | undefined) ||
        normalizeString(legacyStep1Data.productOrService as string | undefined) ||
        normalizeString(step1SnapshotRef.current.focusName),
      offerSummary: normalizeString(savedData.offerSummary as string | undefined),
      priceRange:
        normalizeString(savedData.priceRange as string | undefined) ||
        normalizeString(legacyStep1Data.priceRange as string | undefined),
      differentiators: normalizeListItems(savedData.differentiators as string[] | undefined),
      salesChannels: normalizeSalesChannels(savedData.salesChannels as RankedSalesChannel[] | undefined) as Step2FormData['salesChannels'],
      socialHandles: (nextSocialHandles.length ? nextSocialHandles : legacySocialHandles) as Step2FormData['socialHandles'],
      digitalPresenceLinks: nextDigitalPresenceLinks as Step2FormData['digitalPresenceLinks'],
    });

    setShowOfferExtras(Boolean((nextSocialHandles.length ? nextSocialHandles : legacySocialHandles).length || nextDigitalPresenceLinks.length));

    if (step2Data?.version !== undefined) {
      step2VersionRef.current = step2Data.version;
    }
  }, [activeCampaignId, campaign, open, step, step1Data, step2Data, step2Form, step3Data]);

  useEffect(() => {
    if (!open || (step !== 3 && step !== 4) || !activeCampaignId) {
      return;
    }

    const savedAudienceData = (step3Data?.data ?? {}) as Record<string, unknown>;
    const savedGoalsData = (step4Data?.data ?? {}) as Record<string, unknown>;
    const legacyStep2Data = (step2Data?.data ?? {}) as Record<string, unknown>;
    const nextConstraints = normalizeListItems(savedGoalsData.constraints as string[] | undefined);
    const nextValues: Step3FormData = {
      targetPersona: normalizeString(savedAudienceData.targetPersona as string | undefined),
      targetAudience: normalizeString(savedAudienceData.targetAudience as string | undefined),
      language: normalizeString(savedAudienceData.language as string | undefined),
      painPoints: normalizeListItems(savedAudienceData.painPoints as string[] | undefined),
      desiredOutcome: normalizeString(savedAudienceData.desiredOutcome as string | undefined),
      constraints: nextConstraints.length ? nextConstraints : normalizeListItems(legacyStep2Data.constraints as string[] | undefined),
      monthlyMarketingSpend:
        (savedGoalsData.monthlyMarketingSpend as Step3FormData['monthlyMarketingSpend']) ||
        (legacyStep2Data.monthlyMarketingSpend as Step3FormData['monthlyMarketingSpend']) ||
        undefined as never,
      primaryGoal:
        (savedGoalsData.primaryGoal as Step3FormData['primaryGoal']) ||
        (legacyStep2Data.primaryGoal as Step3FormData['primaryGoal']) ||
        undefined as never,
      marketingHandler:
        (savedGoalsData.marketingHandler as Step3FormData['marketingHandler']) ||
        (legacyStep2Data.marketingHandler as Step3FormData['marketingHandler']) ||
        undefined as never,
      whatsWorking:
        normalizeString(savedGoalsData.whatsWorking as string | undefined) ||
        normalizeString(legacyStep2Data.whatsWorking as string | undefined),
      biggestFrustration:
        normalizeString(savedGoalsData.biggestFrustration as string | undefined) ||
        normalizeString(legacyStep2Data.biggestFrustration as string | undefined),
      dataConsentOptIn: savedGoalsData.dataConsentOptIn === false ? false : true,
      monthlyRevenue: (savedGoalsData.monthlyRevenue as Step3FormData['monthlyRevenue']) || '',
      monthlyOrderVolume: typeof savedGoalsData.monthlyOrderVolume === 'number' ? savedGoalsData.monthlyOrderVolume : undefined,
      productCost: typeof savedGoalsData.productCost === 'number' ? savedGoalsData.productCost : undefined,
      avgCustomerRetention: (savedGoalsData.avgCustomerRetention as Step3FormData['avgCustomerRetention']) || '',
      repeatPurchaseFrequency: (savedGoalsData.repeatPurchaseFrequency as Step3FormData['repeatPurchaseFrequency']) || '',
      googleAnalyticsConnected: Boolean(savedGoalsData.googleAnalyticsConnected),
      monthlyWebsiteTraffic: (savedGoalsData.monthlyWebsiteTraffic as Step3FormData['monthlyWebsiteTraffic']) || '',
      emailListSize: (savedGoalsData.emailListSize as Step3FormData['emailListSize']) || '',
      knownCompetitors: normalizeListItems(savedGoalsData.knownCompetitors as string[] | undefined),
      additionalContext: normalizeString(savedGoalsData.additionalContext as string | undefined),
    };

    step3SnapshotRef.current = nextValues;
    step3Form.reset(nextValues);
    setShowOptionalDetails(
      Boolean(
        nextValues.monthlyRevenue ||
          nextValues.monthlyOrderVolume ||
          nextValues.productCost ||
          nextValues.avgCustomerRetention ||
          nextValues.repeatPurchaseFrequency ||
          nextValues.googleAnalyticsConnected ||
          nextValues.monthlyWebsiteTraffic ||
          nextValues.emailListSize ||
          nextValues.knownCompetitors.length ||
          nextValues.constraints.length ||
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
  }, [activeCampaignId, open, step, step2Data, step3Data, step4Data, step3Form]);

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
      const step1Payload = {
        title: normalizeString(data.title),
        marketingTargetType: data.marketingTargetType,
        focusName: normalizeString(data.focusName),
        sourceType: data.sourceType,
        primaryUrl: data.sourceType === 'manual_only' ? null : normalizeNullableString(data.primaryUrl),
        marketLocation: normalizeString(data.marketLocation),
      };

      step1SnapshotRef.current = {
        ...data,
        primaryUrl: step1Payload.primaryUrl || '',
      };
      let nextCampaignId = activeCampaignId;

      if (!nextCampaignId) {
        const draftCampaign = await campaignsRepository.createDraftCampaign();
        nextCampaignId = draftCampaign.id;
        autoCreatedDraftIdRef.current = draftCampaign.id;
      }

      await wizardRepository.saveStep(nextCampaignId, 'STEP_1', {
        data: step1Payload,
        version: step1VersionRef.current,
      });

      return { campaignId: nextCampaignId };
    },
    onSuccess: async ({ campaignId: nextCampaignId }) => {
      hasSavedStep1Ref.current = true;
      autoCreatedDraftIdRef.current = null;
      setLastCampaignId(nextCampaignId);
      setActiveCampaignId(nextCampaignId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(nextCampaignId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.state(nextCampaignId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.step(nextCampaignId, 'STEP_1') }),
      ]);
      setStep(2);
      syncWizardUrl(nextCampaignId, 2);
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
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
          businessType: data.businessType,
          businessModel: data.businessModel,
          marketScope: data.marketScope,
          businessDescription: normalizeString(data.businessDescription),
          productCategory: normalizeString(data.productCategory),
          productOrService: normalizeString(data.productOrService),
          offerSummary: normalizeString(data.offerSummary),
          priceRange: normalizeString(data.priceRange),
          differentiators: normalizeListItems(data.differentiators),
          salesChannels: normalizeSalesChannels(data.salesChannels),
          socialHandles: data.socialHandles
            .map((item) => ({
              platform: item.platform,
              handle: normalizeString(item.handle),
            }))
            .filter((item) => item.platform && item.handle),
          digitalPresenceLinks: data.digitalPresenceLinks
            .map((item) => ({
              type: item.type,
              url: normalizeString(item.url),
              label: normalizeNullableString(item.label),
            }))
            .filter((item) => item.type && item.url),
        },
        version: step2VersionRef.current,
      });
    },
    onSuccess: async () => {
      if (!activeCampaignId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(activeCampaignId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.step(activeCampaignId, 'STEP_2') }),
      ]);
      setStep(3);
      syncWizardUrl(activeCampaignId, 3);
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save business and offer details.');
    },
  });

  const buildAudienceStepPayload = (data: Step3FormData) => ({
    targetPersona: normalizeString(data.targetPersona),
    targetAudience: normalizeNullableString(data.targetAudience),
    language: normalizeString(data.language),
    painPoints: normalizeListItems(data.painPoints),
    desiredOutcome: normalizeString(data.desiredOutcome),
  });

  const buildGoalsStepPayload = (data: Step3FormData) => ({
    constraints: normalizeListItems(data.constraints),
    monthlyMarketingSpend: data.monthlyMarketingSpend,
    primaryGoal: data.primaryGoal,
    marketingHandler: data.marketingHandler,
    whatsWorking: normalizeNullableString(data.whatsWorking),
    biggestFrustration: normalizeNullableString(data.biggestFrustration),
    monthlyRevenue: normalizeNullableString(data.monthlyRevenue),
    monthlyOrderVolume: data.monthlyOrderVolume ?? null,
    productCost: data.productCost ?? null,
    avgCustomerRetention: data.avgCustomerRetention || null,
    repeatPurchaseFrequency: data.repeatPurchaseFrequency || null,
    googleAnalyticsConnected: data.googleAnalyticsConnected,
    monthlyWebsiteTraffic: data.monthlyWebsiteTraffic || null,
    emailListSize: data.emailListSize || null,
    knownCompetitors: normalizeListItems(data.knownCompetitors).length ? normalizeListItems(data.knownCompetitors) : null,
    additionalContext: normalizeNullableString(data.additionalContext),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(activeCampaignId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.step(activeCampaignId, 'STEP_3') }),
      ]);
      setStep(4);
      syncWizardUrl(activeCampaignId, 4);
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save audience details.');
    },
  });

  const saveStep4Mutation = useMutation({
    mutationFn: async (data: Step3FormData) => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }

      step3SnapshotRef.current = {
        ...data,
      };

      return wizardRepository.saveStep(activeCampaignId, 'STEP_4', {
        data: buildGoalsStepPayload(data),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(activeCampaignId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.step(activeCampaignId, 'STEP_4') }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.preview(activeCampaignId) }),
      ]);
      setStep(5);
      syncWizardUrl(activeCampaignId, 5);
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 409) {
        setShowConflictDialog(true);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save goals and context.');
    },
  });

  const commitMutation = useMutation({
    mutationFn: async () => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }

      return wizardRepository.commitAndGenerate(activeCampaignId, {
        version: wizardState?.draft?.version,
        confirmFocus,
        confirmBusiness,
        confirmAudience,
        confirmGoals,
        readyToGenerate,
        dataConsentOptIn: step3Form.getValues('dataConsentOptIn') ?? step3SnapshotRef.current.dataConsentOptIn ?? true,
      });
    },
    onSuccess: async () => {
      if (!activeCampaignId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(activeCampaignId) }),
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
        setReadyToGenerate(false);
        setShowCommitConfirmDialog(false);
        setShowConflictDialog(true);
      }
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
    effectivePreviewStep1?.title &&
      effectivePreviewStep1?.marketingTargetType &&
      effectivePreviewStep1?.focusName &&
      effectivePreviewStep1?.sourceType &&
      effectivePreviewStep1?.marketLocation
  );
  const offerComplete = Boolean(
    effectivePreviewStep2?.businessType &&
      effectivePreviewStep2?.businessModel &&
      effectivePreviewStep2?.marketScope &&
      (effectivePreviewStep1?.sourceType === 'manual_only' || effectivePreviewStep1?.primaryUrl) &&
      effectivePreviewStep2?.businessDescription &&
      effectivePreviewStep2?.productCategory &&
      effectivePreviewStep2?.productOrService &&
      effectivePreviewStep2?.priceRange &&
      effectivePreviewStep2?.salesChannels?.length,
  );
  const audienceComplete = Boolean(
    effectivePreviewStep3?.targetPersona &&
      effectivePreviewStep3?.language &&
      effectivePreviewStep3?.painPoints?.length &&
      effectivePreviewStep3?.desiredOutcome
  );
  const goalsComplete = Boolean(
    effectivePreviewStep4?.monthlyMarketingSpend &&
      effectivePreviewStep4?.primaryGoal &&
      effectivePreviewStep4?.marketingHandler
  );
  const allConfirmed = confirmFocus && confirmBusiness && confirmAudience && confirmGoals && readyToGenerate;

  const firstIncompleteSection = !classificationComplete
    ? 1
    : !offerComplete
      ? 2
      : !audienceComplete
        ? 3
        : !goalsComplete
          ? 4
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
    targetStep: 1 | 2 | 3 | 4,
    section: 'focus' | 'business' | 'audience' | 'goals',
  ) => {
    if (section === 'focus') {
      setConfirmFocus(false);
    } else if (section === 'business') {
      setConfirmBusiness(false);
    } else if (section === 'audience') {
      setConfirmAudience(false);
    } else if (section === 'goals') {
      setConfirmGoals(false);
    }

    setStep(targetStep);
    if (activeCampaignId) {
      syncWizardUrl(activeCampaignId, targetStep);
    }
  };

  const handlePreviewPrimaryAction = () => {
    if (uiPreviewMode) {
      onOpenChange(false);
      return;
    }

    if (allConfirmed) {
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
    'h-[46px] rounded-[12px] border-[#d8d0c6] bg-white px-4 text-[15px] text-[#111827] shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-[#758296] focus-visible:border-[#b6c0cf] focus-visible:ring-2 focus-visible:ring-[#d8dee8]';
  const wizardRowControlClassName =
    'h-[46px] rounded-[12px] border-[#d8d0c6] bg-white shadow-none transition-[border-color,box-shadow,background-color] focus-visible:border-[#b6c0cf] focus-visible:ring-0';
  const wizardTextareaClassName =
    'min-h-[88px] rounded-[12px] border-[#d8d0c6] bg-white px-4 py-3 text-[15px] text-[#111827] shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-[#758296] focus-visible:border-[#b6c0cf] focus-visible:ring-2 focus-visible:ring-[#d8dee8]';
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
          ? 'Goals & Context'
          : 'Review & Consent';

  const modalDescription =
    step === 1
      ? 'Define what is being marketed, how we should classify it, and the market you want to reach.'
      : step === 2
        ? 'Capture the business identity, source URL, offer details, and current channels.'
      : step === 3
        ? 'Describe who this campaign should speak to, what they care about, and the outcome you want.'
        : step === 4
          ? 'Set the business goal, spend, and practical constraints we should respect.'
          : 'Review every section before strategy generation starts.';

  const contentClassName =
    'w-[min(1040px,calc(100vw-2rem))] max-w-none overflow-hidden rounded-[24px] border-[#d8d0c6] bg-[#f1ede8] p-0 shadow-[0_24px_60px_rgba(50,56,65,0.16)] sm:w-[min(1040px,calc(100vw-3rem))]';
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
    effectivePreviewStep3?.targetPersona,
    effectivePreviewStep3?.targetAudience,
    effectivePreviewStep3?.language,
    effectivePreviewStep3?.desiredOutcome,
    effectivePreviewStep3?.painPoints,
  ]);
  const goalsFilledCount = countFilled([
    effectivePreviewStep4?.monthlyMarketingSpend,
    effectivePreviewStep4?.primaryGoal,
    effectivePreviewStep4?.marketingHandler,
    effectivePreviewStep4?.constraints,
    effectivePreviewStep4?.whatsWorking,
    effectivePreviewStep4?.biggestFrustration,
    effectivePreviewStep4?.knownCompetitors,
    effectivePreviewStep4?.monthlyRevenue,
    effectivePreviewStep4?.monthlyOrderVolume,
    effectivePreviewStep4?.productCost,
    effectivePreviewStep4?.avgCustomerRetention,
    effectivePreviewStep4?.repeatPurchaseFrequency,
    effectivePreviewStep4?.monthlyWebsiteTraffic,
    effectivePreviewStep4?.emailListSize,
    effectivePreviewStep4?.additionalContext,
  ]);
  const classificationFilledCount = countFilled([
    effectivePreviewStep1?.title,
    effectivePreviewStep1?.marketingTargetType,
    effectivePreviewStep1?.focusName,
    effectivePreviewStep1?.sourceType,
    effectivePreviewStep1?.marketLocation,
  ]);
  const businessFilledCount = countFilled([
    effectivePreviewStep2?.businessType,
    effectivePreviewStep2?.businessModel,
    effectivePreviewStep2?.marketScope,
    effectivePreviewStep1?.primaryUrl,
    effectivePreviewStep2?.businessDescription,
    effectivePreviewStep2?.productCategory,
    effectivePreviewStep2?.productOrService,
    effectivePreviewStep2?.priceRange,
    effectivePreviewStep2?.offerSummary,
    effectivePreviewStep2?.differentiators,
    effectivePreviewStep2?.salesChannels,
    effectivePreviewStep2?.socialHandles,
    effectivePreviewStep2?.digitalPresenceLinks,
  ]);
  const audienceStepFieldNames: Array<keyof Step3FormData> = [
    'targetPersona',
    'targetAudience',
    'language',
    'painPoints',
    'desiredOutcome',
  ];
  const optionalContextFieldNames: Array<keyof Step3FormData> = [
    'monthlyRevenue',
    'monthlyOrderVolume',
    'productCost',
    'avgCustomerRetention',
    'repeatPurchaseFrequency',
    'googleAnalyticsConnected',
    'monthlyWebsiteTraffic',
    'emailListSize',
    'additionalContext',
  ];

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
        <DialogContent position="top" className={contentClassName}>
          <div className="flex max-h-[calc(100vh-2rem)] flex-col font-[family:var(--font-dm-sans)]">
            <div className="shrink-0 px-7 pb-6 pt-10">
              <div className={shellInnerClassName}>
                <DialogHeader className="space-y-5 pr-8">
                  <div className="space-y-3">
                    <Badge
                      variant="secondary"
                      className="w-fit rounded-full border border-[#d8d0c6] bg-[#f8f5f0] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f6f84] shadow-none"
                    >
                      {`Step ${step} / ${activeStepMeta.hint}`}
                    </Badge>
                    <DialogTitle className="text-[30px] font-semibold tracking-[-0.03em] text-[#0c1220]">{modalTitle}</DialogTitle>
                    <DialogDescription className="max-w-[680px] text-[15px] leading-8 text-[#5b6b82]">
                      {modalDescription}
                    </DialogDescription>
                  </div>

                  <StepTrail step={step} />
                </DialogHeader>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-7 pb-6"
            >
              <div className={shellInnerClassName}>
                {errorMessage ? (
                  <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive shadow-sm">
                    {errorMessage}
                  </div>
                ) : null}

                {step === 1 ? (
              <form
                id="campaign-wizard-step-1"
                onSubmit={
                  uiPreviewMode
                    ? (async (event) => {
                        event.preventDefault();
                        if (isDismissClosingRef.current) {
                          return;
                        }
                        const nextValues = step1Form.getValues();
                        const sourceValidation = validateSourceUrl(nextValues.sourceType, nextValues.primaryUrl);
                        if (!sourceValidation.valid) {
                          step1Form.setError('primaryUrl', {
                            type: 'manual',
                            message: sourceValidation.message,
                          });
                          return;
                        }
                        step1SnapshotRef.current = {
                          ...nextValues,
                          primaryUrl: sourceValidation.normalizedUrl,
                        };
                        if (!step2Form.getValues('productOrService')) {
                          step2Form.setValue('productOrService', nextValues.focusName, {
                            shouldDirty: false,
                          });
                        }
                        setErrorMessage(null);
                        setStep(2);
                      })
                    : step1Form.handleSubmit(async (data) => {
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
                        await createOrSaveStep1Mutation.mutateAsync(data);
                      })
                }
                onKeyDown={moveToNextWizardField}
                className="space-y-5"
              >
                <WizardSectionCard
                  eyebrow="Campaign setup"
                  title="Name this campaign"
                  description="Give the campaign a title that makes it easy to identify later."
                >
                  <div className="space-y-2">
                    <FieldLabel label="Campaign title" required />
                    <Input
                      className={wizardInputClassName}
                      placeholder="e.g. Summer sale push for GlowSkin"
                      {...step1Form.register('title')}
                    />
                    <FieldMeta error={step1Form.formState.errors.title?.message} />
                  </div>
                </WizardSectionCard>

                <WizardSectionCard eyebrow="Classification" title="Define what is being marketed" description="Choose the scope, then name the product, brand, or category and set the market location.">
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
                        options={[
                          { value: 'single_product', label: 'Single product', description: 'One specific product or service' },
                          { value: 'brand_store', label: 'Brand / store', description: 'A business, brand, or store as a whole' },
                          { value: 'category_collection', label: 'Category / collection', description: 'A collection, category, or catalog group' },
                        ]}
                        error={step1Form.formState.errors.marketingTargetType?.message}
                      />
                    )}
                  />

                  <InlineDivider />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel label={getFocusNameLabel(watchedMarketingTargetType)} helper={getFocusNameHelper(watchedMarketingTargetType)} required />
                      <Input
                        className={wizardInputClassName}
                        placeholder={
                          watchedMarketingTargetType === 'single_product'
                            ? 'e.g. Hydrafacial consultation'
                            : watchedMarketingTargetType === 'category_collection'
                              ? 'e.g. Running shoes collection'
                              : 'e.g. Acme Skin Clinic'
                        }
                        {...step1Form.register('focusName')}
                      />
                      <FieldMeta error={step1Form.formState.errors.focusName?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Market location" required />
                      <Input
                        className={wizardInputClassName}
                        placeholder="e.g. Bengaluru, Karnataka"
                        {...step1Form.register('marketLocation')}
                      />
                      <FieldMeta error={step1Form.formState.errors.marketLocation?.message} />
                    </div>
                  </div>
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
                        options={[
                          { value: 'website', label: 'Website', description: 'Use a site or landing page' },
                          { value: 'marketplace', label: 'Marketplace', description: 'Use a listing or store page' },
                          { value: 'social', label: 'Social', description: 'Use a profile page' },
                          { value: 'gmb', label: 'Google Business', description: 'Use a Google Business profile' },
                          { value: 'manual_only', label: 'Manual only', description: 'No source URL, rely on typed inputs' },
                        ]}
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
                onSubmit={
                  uiPreviewMode
                    ? (async (event) => {
                        event.preventDefault();
                        if (isDismissClosingRef.current) {
                          return;
                        }
                        setErrorMessage(null);
                        setStep(3);
                      })
                    : step2Form.handleSubmit(async (data) => {
                        if (isDismissClosingRef.current) {
                          return;
                        }
                        setErrorMessage(null);
                        await saveStep2Mutation.mutateAsync(data);
                      })
                }
                onKeyDown={moveToNextWizardField}
                className="space-y-5"
              >
                <WizardSectionCard
                  eyebrow="Business identity"
                  title="Describe the business we are analysing"
                  description="Capture the business identity details we should use when analysing this campaign."
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <FieldLabel label="Business type" required />
                      <Controller
                        name="businessType"
                        control={step2Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {BUSINESS_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step2Form.formState.errors.businessType?.message} />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel label="Business model" required />
                      <Controller
                        name="businessModel"
                        control={step2Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select" />
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
                      <FieldLabel label="Market scope" required />
                      <Controller
                        name="marketScope"
                        control={step2Form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={wizardInputClassName}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {MARKET_SCOPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldMeta error={step2Form.formState.errors.marketScope?.message} />
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
                      <FieldLabel label="Product or service" required />
                      <Input className={wizardInputClassName} placeholder="e.g. Hydrafacial package, sales CRM, saree collection" {...step2Form.register('productOrService')} />
                      <FieldMeta error={step2Form.formState.errors.productOrService?.message} />
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
                </WizardSectionCard>

                <Card className="rounded-2xl border-[#d8d0c6] bg-white shadow-none">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Distribution</p>
                      <CardTitle className="text-base">Sales channels</CardTitle>
                      <CardDescription>Add channels and rank them sequentially starting at 1.</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-[#d8d0c6] bg-white"
                      onClick={() => appendSalesChannel({ channel: 'own_website', rank: salesChannelFields.length + 1, customName: '' })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add channel
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <FieldMeta error={getSalesChannelsErrorMessage(step2Form.formState.errors.salesChannels)} />
                    {salesChannelFields.length ? (
                      salesChannelFields.map((field, index) => {
                        const selectedChannel = watchedSalesChannels[index]?.channel;
                        const showCustomName = selectedChannel === 'other';

                        return (
                          <div key={field.id} className="grid items-center gap-2 rounded-xl border border-[#d8d0c6] bg-[#fcfbf9] p-4 lg:grid-cols-[minmax(0,1.7fr)_96px_46px]">
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
                                  <SelectTrigger className={cn(wizardRowControlClassName, 'px-4 text-[15px] text-[#111827]')}>
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
                              className={cn(wizardRowControlClassName, 'px-4 text-[15px] text-[#111827] text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none')}
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

                            <div className={cn(showCustomName ? 'lg:col-span-3' : 'lg:col-span-3')}>
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
                  </CardContent>
                </Card>

                <Collapsible open={showOfferExtras} onOpenChange={setShowOfferExtras}>
                  <div className="rounded-2xl border border-[#d8d0c6] bg-white">
                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Optional footprint</p>
                        <p className="text-sm font-medium text-foreground">Social handles and digital presence</p>
                        <p className="text-sm leading-5 text-muted-foreground">
                          Optional profiles and links that help describe the current footprint.
                        </p>
                      </div>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', showOfferExtras && 'rotate-180')} />
                    </CollapsibleTrigger>

                    <CollapsibleContent className="border-t border-[#e5ddd4] px-4 py-4 sm:px-5">
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">Social handles</p>
                              <p className="text-xs leading-5 text-muted-foreground">Add active profile handles if relevant.</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-[#d8d0c6] bg-white"
                              onClick={() => appendSocialHandle({ platform: 'instagram', handle: '' })}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add handle
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {socialHandleFields.map((field, index) => (
                              <div key={field.id} className="grid gap-3 rounded-xl border border-[#d8d0c6] bg-[#fcfbf9] p-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
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

                                <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-xl border-[#d8d0c6] bg-white" onClick={() => removeSocialHandle(index)}>
                                  <X className="h-4 w-4" />
                                </Button>

                                <FieldMeta
                                  error={
                                    step2Form.formState.errors.socialHandles?.[index]?.platform?.message ||
                                    step2Form.formState.errors.socialHandles?.[index]?.handle?.message
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">Digital presence links</p>
                              <p className="text-xs leading-5 text-muted-foreground">Optional URLs for marketplaces, profiles, or other listings.</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-[#d8d0c6] bg-white"
                              onClick={() => appendDigitalPresence({ type: 'instagram', url: '', label: '' })}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add link
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {digitalPresenceFields.map((field, index) => (
                              <div key={field.id} className="grid gap-3 rounded-xl border border-[#d8d0c6] bg-[#fcfbf9] p-3 lg:grid-cols-[180px_minmax(0,1fr)]">
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
                                  <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-xl border-[#d8d0c6] bg-white" onClick={() => removeDigitalPresence(index)}>
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
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

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

                  if (!uiPreviewMode) {
                    const valid = await step3Form.trigger([
                      'targetPersona',
                      'targetAudience',
                      'language',
                      'painPoints',
                      'desiredOutcome',
                    ]);

                    if (!valid) {
                      setErrorMessage('Fix the highlighted audience fields before continuing.');
                      return;
                    }
                  }

                  const nextValues = step3Form.getValues();
                  step3SnapshotRef.current = {
                    ...nextValues,
                  };
                  setErrorMessage(null);

                  if (uiPreviewMode || !activeCampaignId) {
                    setStep(4);
                    if (activeCampaignId) {
                      syncWizardUrl(activeCampaignId, 4);
                    }
                    return;
                  }

                  await saveAudienceStepMutation.mutateAsync(nextValues);
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
                      <Input className={wizardInputClassName} placeholder="e.g. English, Hindi, Hinglish, Tamil" {...step3Form.register('language')} />
                      <FieldMeta error={step3Form.formState.errors.language?.message} />
                    </div>
                  </div>

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
                </WizardSectionCard>

                </form>
              ) : null}

                {step === 4 ? (
              <form
                id="campaign-wizard-step-4"
                onSubmit={
                  uiPreviewMode
                    ? (async (event) => {
                        event.preventDefault();
                        if (isDismissClosingRef.current) {
                          return;
                        }
                        step3SnapshotRef.current = {
                          ...step3Form.getValues(),
                        };
                        setErrorMessage(null);
                        setStep(5);
                      })
                    : step3Form.handleSubmit(
                        async (data) => {
                          if (isDismissClosingRef.current) {
                            return;
                          }
                          setErrorMessage(null);
                          await saveStep4Mutation.mutateAsync(data);
                        },
                        handleStep4Invalid,
                      )
                }
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
                              {PRIMARY_GOAL_OPTIONS.map((option) => (
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
                            {MARKETING_HANDLER_OPTIONS.map((option) => (
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
                    error={getArrayFieldError(step3Form.formState.errors.knownCompetitors)}
                  />
                </WizardSectionCard>

                <Collapsible open={showOptionalDetails} onOpenChange={setShowOptionalDetails}>
                  <div className="rounded-2xl border border-[#d8d0c6] bg-white">
                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Optional context</p>
                        <p className="text-sm font-medium text-foreground">Add commercial and operating detail</p>
                        <p className="text-sm leading-5 text-muted-foreground">These fields help sharpen estimates, but they are not required.</p>
                      </div>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', showOptionalDetails && 'rotate-180')} />
                    </CollapsibleTrigger>

                    <CollapsibleContent className="border-t border-[#e5ddd4] px-4 py-4 sm:px-5">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <FieldLabel label="Monthly revenue" helper={`Preset values accepted: ${MONTHLY_REVENUE_OPTIONS.map((option) => option.value).join(', ')}`} />
                          <Input className={wizardInputClassName} placeholder="e.g. 25k_1l or approx INR 3 lakh/month" {...step3Form.register('monthlyRevenue')} />
                          <FieldMeta error={step3Form.formState.errors.monthlyRevenue?.message} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel label="Monthly order volume" />
                          <Input className={wizardInputClassName} type="number" min={1} placeholder="e.g. 120" {...step3Form.register('monthlyOrderVolume', { valueAsNumber: true, setValueAs: (value) => (value === '' ? undefined : Number(value)) })} />
                          <FieldMeta error={step3Form.formState.errors.monthlyOrderVolume?.message} />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel label="Product cost" />
                          <Input className={wizardInputClassName} type="number" min={0.01} step="0.01" placeholder="e.g. 320" {...step3Form.register('productCost', { valueAsNumber: true, setValueAs: (value) => (value === '' ? undefined : Number(value)) })} />
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
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-[#d8d0c6] bg-[#fcfbf9] p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">Google Analytics connected</p>
                            <p className="text-xs leading-5 text-muted-foreground">Turn this on only if analytics is already set up.</p>
                          </div>
                          <Controller name="googleAnalyticsConnected" control={step3Form.control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                        </div>
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-[#d8d0c6] bg-[#fcfbf9] p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">Use my inputs for better benchmark estimates</p>
                            <p className="text-xs leading-5 text-muted-foreground">This helps us frame estimates like CAC and channel dependency better.</p>
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

                </form>
              ) : null}

                {step === 5 ? (
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
                        filledLabel={`${classificationFilledCount}/5 filled`}
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
                          <SummaryField label="Market location" value={effectivePreviewStep1?.marketLocation || campaign?.city} />
                        </ReviewGrid>
                      </ReviewSection>

                      <ReviewSection
                        title="Business"
                        description="Business identity, source URL, offer details, and current channels."
                        filledLabel={`${businessFilledCount}/13 filled`}
                        onEdit={() => openPreviewSectionEditor(2, 'business')}
                        confirmationId="wizard-confirm-business"
                        confirmationLabel="I confirm this business setup is accurate"
                        checked={confirmBusiness}
                        onCheckedChange={setConfirmBusiness}
                      >
                        <ReviewGrid>
                          <SummaryField label="Business type" value={formatBusinessType(effectivePreviewStep2?.businessType || campaign?.businessType || null)} />
                          <SummaryField label="Business model" value={formatBusinessModel(effectivePreviewStep2?.businessModel || campaign?.businessModel || null)} />
                          <SummaryField label="Market scope" value={formatMarketScope(effectivePreviewStep2?.marketScope || campaign?.marketScope || null)} />
                          <SummaryField label="Source URL" value={effectivePreviewStep1?.primaryUrl || null} />
                          <SummaryField label="Product category" value={effectivePreviewStep2?.productCategory} />
                          <SummaryField label="Product or service" value={effectivePreviewStep2?.productOrService} />
                          <SummaryField label="Price range" value={effectivePreviewStep2?.priceRange} />
                          <SummaryField label="Offer summary" value={effectivePreviewStep2?.offerSummary} />
                          <SummaryField label="Differentiators" value={formatStringList(effectivePreviewStep2?.differentiators)} />
                          <SummaryField label="Ranked sales channels" value={formatRankedSalesChannels(effectivePreviewStep2?.salesChannels)} />
                          <SummaryField label="Social handles" value={formatSocialHandles(effectivePreviewStep2?.socialHandles)} />
                          <SummaryField label="Digital presence links" value={formatDigitalPresenceLinks(effectivePreviewStep2?.digitalPresenceLinks)} className="md:col-span-2" />
                          <SummaryField label="Business description" value={effectivePreviewStep2?.businessDescription} className="md:col-span-2" />
                        </ReviewGrid>
                      </ReviewSection>

                      <ReviewSection
                        title="Audience"
                        description="Persona, audience cues, pain points, language, and desired outcome."
                        filledLabel={`${audienceFilledCount}/5 filled`}
                        onEdit={() => openPreviewSectionEditor(3, 'audience')}
                        confirmationId="wizard-confirm-audience"
                        confirmationLabel="I confirm this audience setup is accurate"
                        checked={confirmAudience}
                        onCheckedChange={setConfirmAudience}
                      >
                        <ReviewGrid>
                          <SummaryField label="Target persona" value={effectivePreviewStep3?.targetPersona} />
                          <SummaryField label="Target audience" value={effectivePreviewStep3?.targetAudience} />
                          <SummaryField label="Language" value={effectivePreviewStep3?.language} />
                          <SummaryField label="Desired outcome" value={effectivePreviewStep3?.desiredOutcome} />
                          <SummaryField label="Pain points" value={formatStringList(effectivePreviewStep3?.painPoints)} />
                        </ReviewGrid>
                      </ReviewSection>

                      <ReviewSection
                        title="Goals & Context"
                        description="Budget, constraints, goals, and supporting context."
                        filledLabel={`${goalsFilledCount}/15 filled`}
                        onEdit={() => openPreviewSectionEditor(4, 'goals')}
                        confirmationId="wizard-confirm-goals"
                        confirmationLabel="I confirm these goals and context inputs look right"
                        checked={confirmGoals}
                        onCheckedChange={setConfirmGoals}
                      >
                        <ReviewGrid>
                          <SummaryField label="Monthly marketing spend" value={formatMonthlyMarketingSpend(effectivePreviewStep4?.monthlyMarketingSpend)} />
                          <SummaryField label="Primary goal" value={formatPrimaryGoal(effectivePreviewStep4?.primaryGoal)} />
                          <SummaryField label="Marketing owner" value={formatMarketingHandler(effectivePreviewStep4?.marketingHandler)} />
                          <SummaryField label="Constraints" value={formatStringList(effectivePreviewStep4?.constraints)} />
                          <SummaryField label="What's working" value={effectivePreviewStep4?.whatsWorking} />
                          <SummaryField label="Biggest frustration" value={effectivePreviewStep4?.biggestFrustration} />
                          <SummaryField label="Known competitors" value={formatStringList(effectivePreviewStep4?.knownCompetitors)} />
                          <SummaryField label="Monthly revenue" value={formatMonthlyRevenue(effectivePreviewStep4?.monthlyRevenue)} />
                          <SummaryField label="Monthly order volume" value={formatNumericValue(effectivePreviewStep4?.monthlyOrderVolume ?? undefined)} />
                          <SummaryField label="Product cost" value={formatNumericValue(effectivePreviewStep4?.productCost ?? undefined, 'INR ')} />
                          <SummaryField label="Retention" value={formatAvgCustomerRetention(effectivePreviewStep4?.avgCustomerRetention)} />
                          <SummaryField label="Repeat frequency" value={formatRepeatPurchaseFrequency(effectivePreviewStep4?.repeatPurchaseFrequency)} />
                          <SummaryField label="Website traffic" value={formatMonthlyWebsiteTraffic(effectivePreviewStep4?.monthlyWebsiteTraffic)} />
                          <SummaryField label="Email list size" value={formatEmailListSize(effectivePreviewStep4?.emailListSize)} />
                          <SummaryField label="Google Analytics" value={effectivePreviewStep4?.googleAnalyticsConnected ? 'Connected' : null} />
                          <SummaryField label="Additional context" value={effectivePreviewStep4?.additionalContext} className="md:col-span-2" />
                        </ReviewGrid>
                      </ReviewSection>

                      {hasDerivedInsights && !uiPreviewMode ? (
                        <Card className="rounded-2xl border-[#d8d0c6] bg-white shadow-none">
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
                              <ShieldCheck className="h-5 w-5 text-primary" />
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
                  <Card className="rounded-2xl border-[#d8d0c6] bg-white shadow-none">
                    <CardContent className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
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
                    {saveStep4Mutation.isPending ? 'Saving...' : 'Review'}
                  </DarkPrimaryButton>
                </StepFooter>
              ) : null}

              {step === 5 ? (
                <ReviewFooter>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campaign Updated Elsewhere</AlertDialogTitle>
            <AlertDialogDescription>
              This campaign was updated in another session. Close this dialog and reopen the campaign to continue from the latest saved step.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
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
        <AlertDialogContent className="max-w-[560px] border-[#f2c078] bg-[#fff7ed] shadow-[0_24px_70px_rgba(146,64,14,0.18)]">
          <AlertDialogHeader className="items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f2c078] bg-[#fff1db] text-[#b45309] shadow-sm">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <AlertDialogTitle className="text-[30px] font-semibold tracking-[-0.03em] text-[#7c2d12]">
              Generate Strategy?
            </AlertDialogTitle>
            <AlertDialogDescription className="max-w-[440px] text-[17px] leading-8 text-[#9a3412]">
              Once you confirm, this wizard will be committed and you will not be able to make further changes here. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex w-full flex-row items-center justify-between sm:justify-between">
            <AlertDialogCancel
              disabled={commitMutation.isPending}
              className="min-w-[120px] border-[#e7c9a4] bg-white text-[#7c2d12] hover:bg-[#fff7ed]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={commitMutation.isPending}
              className="min-w-[140px] bg-[#c2410c] text-white hover:bg-[#9a3412]"
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

