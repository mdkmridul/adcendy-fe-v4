'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatCampaignStatus, type Campaign } from '@/shared/types/campaign';

export type CampaignStateTone = 'draft' | 'setup' | 'ready' | 'waiting' | 'active' | 'attention' | 'archived';
export type SectionReadinessStatus = 'complete' | 'confirmed' | 'incomplete' | 'needs_review' | 'optional';
export type CampaignLifecycleStage = 'draft' | 'waiting' | 'active';
export type CampaignLifecycleTone = 'draft' | 'waiting' | 'active' | 'attention' | 'archived';

export interface DerivedCampaignState {
  statusLabel: string;
  statusTone: CampaignStateTone;
  progressLabel: string;
  progressValue: number;
  primaryActionLabel: string;
  primaryActionHref: string;
  needsAttention: boolean;
  marketLabel: string;
  websiteHost: string | null;
}

const TOTAL_SETUP_STEPS = 4;

function clampStep(step: number | null | undefined) {
  return Math.min(Math.max(step ?? 0, 0), TOTAL_SETUP_STEPS);
}

export function extractWebsiteHost(website?: string | null) {
  if (!website) {
    return null;
  }

  try {
    const value = website.startsWith('http') ? website : `https://${website}`;
    return new URL(value).host.replace(/^www\./, '');
  } catch {
    return website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || null;
  }
}

export function getCampaignSetupHref(campaign: Campaign) {
  const currentStep = clampStep(campaign.currentStep);

  if (currentStep <= 1) {
    return `/app/campaigns/${campaign.id}/setup/step-1`;
  }

  if (currentStep === 2) {
    return `/app/campaigns/${campaign.id}/setup/step-2`;
  }

  if (currentStep === 3) {
    return `/app/campaigns/${campaign.id}/setup/step-3`;
  }

  return `/app/campaigns/${campaign.id}/setup/preview`;
}

export function getCampaignWizardModalHref(campaign: Campaign) {
  const currentStep = clampStep(campaign.currentStep);
  const wizardStep = currentStep <= 1 ? 1 : currentStep === 2 ? 2 : currentStep === 3 ? 3 : 4;
  return `/app/campaigns?draftCampaignId=${campaign.id}&wizardStep=${wizardStep}`;
}

export function getCampaignWorkspaceHref(campaign: Campaign) {
  if (campaign.status === 'DRAFT') {
    return getCampaignWizardModalHref(campaign);
  }

  return `/app/campaigns/${campaign.id}/overview`;
}

export function isCampaignUnderReview(campaign: Campaign) {
  return campaign.status === 'SUBMITTED_FOR_REVIEW' || campaign.status === 'IN_REVIEW';
}

export function canAccessCampaignFiles(campaign: Campaign) {
  return !isCampaignUnderReview(campaign);
}

export function getCampaignLifecycleStage(
  campaign: Campaign,
): CampaignLifecycleStage {
  if (campaign.status === 'DRAFT') {
    return 'draft';
  }

  if (campaign.status === 'ACTIVE' || campaign.status === 'ARCHIVED') {
    return 'active';
  }

  return 'waiting';
}

export function getCampaignLifecycleStatus(stage: CampaignLifecycleStage, campaign: Campaign): {
  label: string;
  tone: CampaignLifecycleTone;
} {
  const mappedLabel = formatCampaignStatus(campaign.status) ?? 'Unknown';

  if (stage === 'waiting') {
    return {
      label: mappedLabel,
      tone:
        campaign.status === 'FAILED'
          ? 'attention'
          : campaign.status === 'ARCHIVED'
            ? 'archived'
            : 'waiting',
    };
  }

  if (stage === 'active') {
    return {
      label: mappedLabel,
      tone: campaign.status === 'ARCHIVED' ? 'archived' : 'active',
    };
  }

  const state = deriveCampaignState(campaign);
  return {
    label: state.statusLabel,
    tone: state.statusTone === 'active' ? 'active' : 'draft',
  };
}

export function deriveCampaignState(campaign: Campaign): DerivedCampaignState {
  const currentStep = clampStep(campaign.currentStep);
  const websiteHost = extractWebsiteHost(campaign.website);
  const marketLabel = campaign.city || campaign.niche || 'Market not set';

  if (campaign.status === 'ARCHIVED') {
    return {
      statusLabel: 'Archived',
      statusTone: 'archived',
      progressLabel: 'Inactive',
      progressValue: 100,
      primaryActionLabel: 'Open Strategy',
      primaryActionHref: `/app/campaigns/${campaign.id}/strategy`,
      needsAttention: false,
      marketLabel,
      websiteHost,
    };
  }

  if (campaign.status === 'FAILED') {
    return {
      statusLabel: 'Needs Attention',
      statusTone: 'attention',
      progressLabel: 'Action required',
      progressValue: 100,
      primaryActionLabel: 'Open Overview',
      primaryActionHref: `/app/campaigns/${campaign.id}/overview`,
      needsAttention: true,
      marketLabel,
      websiteHost,
    };
  }

  if (campaign.status === 'SUBMITTED_FOR_REVIEW') {
    return {
      statusLabel: 'Generating',
      statusTone: 'waiting',
      progressLabel: 'Generating',
      progressValue: 100,
      primaryActionLabel: 'Open Overview',
      primaryActionHref: `/app/campaigns/${campaign.id}/overview`,
      needsAttention: false,
      marketLabel,
      websiteHost,
    };
  }

  if (campaign.status === 'IN_REVIEW') {
    return {
      statusLabel: 'Under Review',
      statusTone: 'waiting',
      progressLabel: 'Under review',
      progressValue: 100,
      primaryActionLabel: 'Open Overview',
      primaryActionHref: `/app/campaigns/${campaign.id}/overview`,
      needsAttention: false,
      marketLabel,
      websiteHost,
    };
  }

  if (campaign.status === 'ACTIVE') {
    return {
      statusLabel: 'Active',
      statusTone: 'active',
      progressLabel: 'Ready',
      progressValue: 100,
      primaryActionLabel: 'Open Strategy',
      primaryActionHref: `/app/campaigns/${campaign.id}/strategy`,
      needsAttention: false,
      marketLabel,
      websiteHost,
    };
  }

  if (currentStep === 0) {
    return {
      statusLabel: 'In Setup',
      statusTone: 'setup',
      progressLabel: 'Setup 0/4 complete',
      progressValue: 8,
      primaryActionLabel: 'Continue Setup',
      primaryActionHref: getCampaignSetupHref(campaign),
      needsAttention: true,
      marketLabel,
      websiteHost,
    };
  }

  if (currentStep < TOTAL_SETUP_STEPS) {
    return {
      statusLabel: 'In Setup',
      statusTone: 'setup',
      progressLabel: `Setup ${currentStep}/4 complete`,
      progressValue: Math.round((currentStep / TOTAL_SETUP_STEPS) * 100),
      primaryActionLabel: 'Continue Setup',
      primaryActionHref: getCampaignSetupHref(campaign),
      needsAttention: false,
      marketLabel,
      websiteHost,
    };
  }

  return {
    statusLabel: 'In Setup',
    statusTone: 'setup',
    progressLabel: currentStep >= TOTAL_SETUP_STEPS ? 'Ready to generate' : 'Pending confirmation',
    progressValue: currentStep >= TOTAL_SETUP_STEPS ? 100 : 82,
    primaryActionLabel: 'Review & Generate',
    primaryActionHref: getCampaignSetupHref(campaign),
    needsAttention: false,
    marketLabel,
    websiteHost,
  };
}

export function CampaignStatusBadge({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  const state = deriveCampaignState(campaign);

  const toneClassName =
    state.statusTone === 'active'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : state.statusTone === 'waiting'
        ? 'border-sky-200 bg-sky-50 text-sky-700'
        : state.statusTone === 'attention'
          ? 'border-red-200 bg-red-50 text-red-700'
      : state.statusTone === 'ready'
        ? 'border-sky-200 bg-sky-50 text-sky-700'
        : state.statusTone === 'setup'
          ? 'border-amber-200 bg-amber-50 text-amber-700'
          : state.statusTone === 'archived'
            ? 'border-border bg-muted text-muted-foreground'
            : 'border-orange-200 bg-orange-50 text-orange-700';

  return (
    <Badge variant="outline" className={cn('rounded-full px-2.5 py-1 text-xs font-medium', toneClassName, className)}>
      {state.statusLabel}
    </Badge>
  );
}

export function CampaignLifecycleBadge({
  stage,
  campaign,
  className,
}: {
  stage: CampaignLifecycleStage;
  campaign: Campaign;
  className?: string;
}) {
  const status = getCampaignLifecycleStatus(stage, campaign);

  const toneClassName =
    status.tone === 'active'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status.tone === 'attention'
        ? 'border-red-200 bg-red-50 text-red-700'
        : status.tone === 'archived'
          ? 'border-border bg-muted text-muted-foreground'
      : status.tone === 'waiting'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-orange-200 bg-orange-50 text-orange-700';

  return (
    <Badge variant="outline" className={cn('rounded-full px-2.5 py-1 text-xs font-medium', toneClassName, className)}>
      {status.label}
    </Badge>
  );
}

export function CampaignProgressSummary({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  const state = deriveCampaignState(campaign);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">{state.progressLabel}</span>
        <span className="text-muted-foreground">{state.progressValue}%</span>
      </div>
      <Progress value={state.progressValue} className="h-1.5 bg-muted" />
    </div>
  );
}

export function SectionStatusBadge({
  status,
  className,
}: {
  status: SectionReadinessStatus;
  className?: string;
}) {
  const config =
    status === 'confirmed'
      ? { label: 'Confirmed', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
      : status === 'complete'
        ? { label: 'Complete', className: 'border-sky-200 bg-sky-50 text-sky-700' }
        : status === 'needs_review'
          ? { label: 'Needs Review', className: 'border-amber-200 bg-amber-50 text-amber-700' }
          : status === 'optional'
            ? { label: 'Optional', className: 'border-border bg-muted text-muted-foreground' }
            : { label: 'Incomplete', className: 'border-orange-200 bg-orange-50 text-orange-700' };

  return (
    <Badge variant="outline" className={cn('rounded-full px-2.5 py-1 text-xs font-medium', config.className, className)}>
      {config.label}
    </Badge>
  );
}
