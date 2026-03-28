'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { campaignsRepository, wizardRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { ApiError } from '@/shared/api/errors';
import { ReadinessSummaryCard } from '@/shared/components/campaigns/ReadinessSummaryCard';
import {
  extractWebsiteHost,
  type SectionReadinessStatus,
} from '@/shared/components/campaigns/campaign-ui';
import { createCampaignSchema, type CreateCampaignInput } from '@/shared/schemas/campaign';
import { step2Schema, step3Schema, type Step2FormData, type Step3FormData } from '@/shared/schemas/wizard';
import { useLastCampaign } from '@/hooks/useLastCampaign';
import {
  BUSINESS_MODEL_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  MARKET_SCOPE_OPTIONS,
  formatBusinessModel,
  formatBusinessType,
  formatMarketScope,
} from '@/shared/types/campaign';

type WizardModalStep = 1 | 2 | 3 | 4;

interface CampaignWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string | null;
  initialStep: WizardModalStep;
}

function SummaryField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-sm leading-6 text-foreground">{value || 'Not provided'}</p>
    </div>
  );
}

function deriveSectionStatus(complete: boolean, confirmed: boolean): SectionReadinessStatus {
  if (!complete) {
    return 'incomplete';
  }

  if (confirmed) {
    return 'confirmed';
  }

  return 'needs_review';
}

function normalizeListItems(items?: string[]) {
  return (items ?? []).map((item) => item.trim()).filter(Boolean);
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

  return 4;
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

  const [confirmBusinessInfo, setConfirmBusinessInfo] = useState(false);
  const [confirmOffer, setConfirmOffer] = useState(false);
  const [confirmAudience, setConfirmAudience] = useState(false);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [dataConsentOptIn, setDataConsentOptIn] = useState(true);

  const step1VersionRef = useRef<number>(0);
  const step2VersionRef = useRef<number>(0);
  const step3VersionRef = useRef<number>(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveCampaignId(campaignId ?? null);
    setStep(initialStep);
    setErrorMessage(null);
  }, [campaignId, initialStep, open]);

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
    enabled: Boolean(activeCampaignId) && step === 1,
  });

  const { data: step2Data } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.step(activeCampaignId, 'STEP_2') : ['wizard', 'step-2-idle'],
    queryFn: () => wizardRepository.getStep(activeCampaignId as string, 'STEP_2'),
    enabled: Boolean(activeCampaignId) && step === 2,
  });

  const { data: step3Data } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.step(activeCampaignId, 'STEP_3') : ['wizard', 'step-3-idle'],
    queryFn: () => wizardRepository.getStep(activeCampaignId as string, 'STEP_3'),
    enabled: Boolean(activeCampaignId) && step === 3,
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.preview(activeCampaignId) : ['wizard', 'preview-idle'],
    queryFn: () => wizardRepository.getPreview(activeCampaignId as string),
    enabled: Boolean(activeCampaignId) && step === 4,
  });

  const { data: wizardState } = useQuery({
    queryKey: activeCampaignId ? queryKeys.wizard.state(activeCampaignId) : ['wizard', 'state-idle'],
    queryFn: () => wizardRepository.getWizardState(activeCampaignId as string),
    enabled: Boolean(activeCampaignId) && step === 4,
  });

  const step1Form = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: '',
      marketLocation: '',
      businessType: undefined,
      businessModel: undefined,
      marketScope: undefined,
      websiteUrl: '',
    },
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      offerSummary: '',
      priceRange: '',
      differentiators: [''],
      constraints: [],
    },
  });

  const step3Form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      targetPersona: '',
      language: '',
      painPoints: [],
      desiredOutcome: '',
    },
  });

  const { fields: differentiatorFields, append: appendDifferentiator, remove: removeDifferentiator } = useFieldArray({
    control: step2Form.control as any,
    name: 'differentiators' as any,
  });

  const { fields: constraintFields, append: appendConstraint, remove: removeConstraint } = useFieldArray({
    control: step2Form.control as any,
    name: 'constraints' as any,
  });

  const { fields: painPointFields, append: appendPainPoint, remove: removePainPoint } = useFieldArray({
    control: step3Form.control as any,
    name: 'painPoints' as any,
  });

  useEffect(() => {
    if (!open || step !== 1) {
      return;
    }

    if (step1Data?.data && Object.keys(step1Data.data).length > 0) {
      step1Form.reset({
        title: step1Data.data.title || campaign?.name || '',
        marketLocation: step1Data.data.marketLocation || campaign?.city || '',
        businessType: step1Data.data.businessType || campaign?.businessType || undefined,
        businessModel: step1Data.data.businessModel || campaign?.businessModel || undefined,
        marketScope: step1Data.data.marketScope || campaign?.marketScope || undefined,
        websiteUrl: step1Data.data.websiteUrl || campaign?.website || '',
      });
      if (step1Data.version !== undefined) {
        step1VersionRef.current = step1Data.version;
      }
      return;
    }

    if (campaign) {
      step1Form.reset({
        title: campaign.name,
        marketLocation: campaign.city,
        businessType: campaign.businessType || undefined,
        businessModel: campaign.businessModel || undefined,
        marketScope: campaign.marketScope || undefined,
        websiteUrl: campaign.website || '',
      });
    }
  }, [campaign, open, step, step1Data, step1Form]);

  useEffect(() => {
    if (open && step === 2 && step2Data) {
      step2Form.reset(step2Data.data || {
        offerSummary: '',
        priceRange: '',
        differentiators: [''],
        constraints: [],
      });
      if (step2Data.version !== undefined) {
        step2VersionRef.current = step2Data.version;
      }
    }
  }, [open, step, step2Data, step2Form]);

  useEffect(() => {
    if (open && step === 3 && step3Data) {
      step3Form.reset(step3Data.data || {
        targetPersona: '',
        language: '',
        painPoints: [],
        desiredOutcome: '',
      });
      if (step3Data.version !== undefined) {
        step3VersionRef.current = step3Data.version;
      }
    }
  }, [open, step, step3Data, step3Form]);

  const createOrSaveStep1Mutation = useMutation({
    mutationFn: async (data: CreateCampaignInput) => {
      const step1Payload = {
        title: data.title,
        marketLocation: data.marketLocation,
        businessType: data.businessType,
        businessModel: data.businessModel,
        marketScope: data.marketScope,
        websiteUrl: data.websiteUrl?.trim() || '',
      };

      if (!activeCampaignId) {
        const newCampaign = await campaignsRepository.createCampaign({
          title: data.title,
          marketLocation: data.marketLocation,
          businessType: data.businessType,
          businessModel: data.businessModel,
          marketScope: data.marketScope,
          websiteUrl: data.websiteUrl?.trim() || undefined,
        });
        await wizardRepository.saveStep(newCampaign.id, 'STEP_1', {
          data: step1Payload,
        });

        return { campaignId: newCampaign.id };
      }

      await wizardRepository.saveStep(activeCampaignId, 'STEP_1', {
        data: step1Payload,
        version: step1VersionRef.current,
      });

      return { campaignId: activeCampaignId };
    },
    onSuccess: async ({ campaignId: nextCampaignId }) => {
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
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save business context.');
    },
  });

  const saveStep2Mutation = useMutation({
    mutationFn: async (data: Step2FormData) => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }
      return wizardRepository.saveStep(activeCampaignId, 'STEP_2', {
        data: {
          ...data,
          offerSummary: data.offerSummary.trim(),
          priceRange: data.priceRange.trim(),
          differentiators: normalizeListItems(data.differentiators),
          constraints: normalizeListItems(data.constraints),
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
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save offer details.');
    },
  });

  const saveStep3Mutation = useMutation({
    mutationFn: async (data: Step3FormData) => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }
      return wizardRepository.saveStep(activeCampaignId, 'STEP_3', {
        data: {
          ...data,
          targetPersona: data.targetPersona.trim(),
          language: data.language.trim(),
          painPoints: normalizeListItems(data.painPoints),
          desiredOutcome: data.desiredOutcome.trim(),
        },
        version: step3VersionRef.current,
      });
    },
    onSuccess: async () => {
      if (!activeCampaignId) {
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(activeCampaignId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.step(activeCampaignId, 'STEP_3') }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wizard.preview(activeCampaignId) }),
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

  const commitMutation = useMutation({
    mutationFn: async () => {
      if (!activeCampaignId) {
        throw new Error('Campaign not found.');
      }
      const version = wizardState?.draft?.version;
      return wizardRepository.commitAndGenerate(activeCampaignId, {
        version,
        confirmBusinessInfo,
        confirmOffer,
        confirmAudience,
        readyToGenerate,
        dataConsentOptIn,
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
        setConfirmBusinessInfo(false);
        setConfirmOffer(false);
        setConfirmAudience(false);
        setReadyToGenerate(false);
        setDataConsentOptIn(true);
        setShowConflictDialog(true);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit campaign.');
    },
  });

  const previewStep1 = preview?.steps?.step1;
  const previewStep2 = preview?.steps?.step2;
  const previewStep3 = preview?.steps?.step3;

  const businessComplete = Boolean(
    previewStep1?.title &&
      previewStep1?.marketLocation &&
      previewStep1?.businessType &&
      previewStep1?.businessModel &&
      previewStep1?.marketScope,
  );
  const offerComplete = Boolean(previewStep2?.offerSummary && previewStep2?.priceRange);
  const audienceComplete = Boolean(previewStep3?.targetPersona && previewStep3?.language && previewStep3?.desiredOutcome);
  const allConfirmed = confirmBusinessInfo && confirmOffer && confirmAudience && readyToGenerate;

  const readinessItems = useMemo(
    () => [
      {
        label: 'Business Context',
        status: deriveSectionStatus(businessComplete, confirmBusinessInfo),
        detail: businessComplete ? 'Campaign basics are present.' : 'Missing key business inputs.',
      },
      {
        label: 'Offer',
        status: deriveSectionStatus(offerComplete, confirmOffer),
        detail: offerComplete ? 'Offer details are populated.' : 'Offer summary or price range is missing.',
      },
      {
        label: 'Audience',
        status: deriveSectionStatus(audienceComplete, confirmAudience),
        detail: audienceComplete ? 'Audience inputs are ready for review.' : 'Audience definition is incomplete.',
      },
      {
        label: 'Tracking Inputs',
        status: 'optional' as const,
        detail: dataConsentOptIn
          ? 'Benchmark data consent is enabled.'
          : 'Optional benchmark consent is disabled.',
      },
      {
        label: 'Ready to Generate',
        status: allConfirmed
          ? ('confirmed' as const)
          : businessComplete && offerComplete && audienceComplete
            ? ('needs_review' as const)
            : ('incomplete' as const),
        detail: allConfirmed
          ? 'All confirmations are complete.'
          : 'Complete confirmations before strategy generation.',
      },
    ],
    [
      allConfirmed,
      audienceComplete,
      businessComplete,
      confirmAudience,
      confirmBusinessInfo,
      confirmOffer,
      dataConsentOptIn,
      offerComplete,
    ],
  );

  const firstIncompleteSection = !businessComplete
    ? 1
    : !offerComplete
      ? 2
      : !audienceComplete
        ? 3
        : null;

  const primaryActionLabel = commitMutation.isPending
    ? 'Generating...'
    : allConfirmed
      ? 'Generate Strategy'
      : firstIncompleteSection
        ? 'Fix Missing Inputs'
        : 'Confirm Inputs';

  const openPreviewSectionEditor = (
    targetStep: 1 | 2 | 3,
    section: 'business' | 'offer' | 'audience',
  ) => {
    if (section === 'business') {
      setConfirmBusinessInfo(false);
    } else if (section === 'offer') {
      setConfirmOffer(false);
    } else {
      setConfirmAudience(false);
    }

    setStep(targetStep);
    if (activeCampaignId) {
      syncWizardUrl(activeCampaignId, targetStep);
    }
  };

  const handlePreviewPrimaryAction = () => {
    if (allConfirmed) {
      commitMutation.mutate();
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
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setErrorMessage(null);
    }
  };

  const isCreateMode = !activeCampaignId && step === 1;
  const modalTitle =
    step === 1
      ? isCreateMode
        ? 'Create New Campaign'
        : 'Business Context'
      : step === 2
        ? 'Offer'
        : step === 3
          ? 'Audience'
          : 'Review & Generate';
  const modalDescription =
    step === 1
      ? isCreateMode
        ? 'Add a new market intelligence campaign for your business.'
        : 'Confirm the campaign basics before continuing setup.'
      : step === 2
        ? 'Describe the offer, pricing, and what makes it valuable.'
        : step === 3
          ? 'Define the audience, key pain points, and the desired outcome.'
          : 'Review the setup before strategy generation begins.';

  const contentClassName =
    step === 4
      ? 'max-h-[90vh] overflow-hidden p-0 sm:max-w-5xl'
      : step === 1
        ? 'sm:max-w-[560px]'
        : 'sm:max-w-[560px]';

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={contentClassName}>
          <div className={step === 4 ? 'max-h-[90vh] overflow-y-auto p-6' : undefined}>
            <DialogHeader>
              <DialogTitle>{modalTitle}</DialogTitle>
              <DialogDescription>{modalDescription}</DialogDescription>
            </DialogHeader>

            {errorMessage ? (
              <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}

            {step === 1 ? (
              <form
                onSubmit={step1Form.handleSubmit(async (data) => {
                  setErrorMessage(null);
                  await createOrSaveStep1Mutation.mutateAsync(data);
                })}
                onKeyDown={moveToNextWizardField}
                className="mt-4 space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Campaign Title</label>
                  <Input placeholder="e.g., SaaS Product Launch" {...step1Form.register('title')} />
                  {step1Form.formState.errors.title ? (
                    <p className="text-xs text-destructive">{step1Form.formState.errors.title.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Market Location</label>
                  <Input placeholder="e.g., San Francisco" {...step1Form.register('marketLocation')} />
                  {step1Form.formState.errors.marketLocation ? (
                    <p className="text-xs text-destructive">{step1Form.formState.errors.marketLocation.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Business Type</label>
                    <Controller
                      name="businessType"
                      control={step1Form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
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
                    {step1Form.formState.errors.businessType ? (
                      <p className="text-xs text-destructive">{step1Form.formState.errors.businessType.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Business Model</label>
                    <Controller
                      name="businessModel"
                      control={step1Form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
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
                    {step1Form.formState.errors.businessModel ? (
                      <p className="text-xs text-destructive">{step1Form.formState.errors.businessModel.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Market Scope</label>
                  <Controller
                    name="marketScope"
                    control={step1Form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select market scope" />
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
                  {step1Form.formState.errors.marketScope ? (
                    <p className="text-xs text-destructive">{step1Form.formState.errors.marketScope.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Website (Optional)</label>
                  <Input placeholder="https://example.com" {...step1Form.register('websiteUrl')} />
                  {step1Form.formState.errors.websiteUrl ? (
                    <p className="text-xs text-destructive">{step1Form.formState.errors.websiteUrl.message}</p>
                  ) : null}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createOrSaveStep1Mutation.isPending}>
                    {createOrSaveStep1Mutation.isPending
                      ? 'Saving...'
                      : isCreateMode
                        ? 'Create Campaign'
                        : 'Next'}
                  </Button>
                </div>
              </form>
            ) : null}

            {step === 2 ? (
              <form
                onSubmit={step2Form.handleSubmit(async (data) => {
                  setErrorMessage(null);
                  await saveStep2Mutation.mutateAsync(data);
                })}
                onKeyDown={moveToNextWizardField}
                className="mt-4 space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Offer Summary</label>
                  <Textarea
                    placeholder="Describe what you're offering..."
                    {...step2Form.register('offerSummary')}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Price Range</label>
                  <Input placeholder="e.g., $50-$100, $1000+, Free" {...step2Form.register('priceRange')} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Key Differentiators</label>
                  {differentiatorFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder="e.g., 24/7 support, Money-back guarantee"
                        {...step2Form.register(`differentiators.${index}`)}
                        className="flex-1"
                      />
                      {differentiatorFields.length > 1 ? (
                        <Button type="button" variant="outline" size="icon" onClick={() => removeDifferentiator(index)}>
                          x
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendDifferentiator('')}>
                    + Add Differentiator
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Constraints (Optional)</label>
                  {constraintFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder="e.g., Limited availability, Seasonal offer"
                        {...step2Form.register(`constraints.${index}`)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => removeConstraint(index)}>
                        x
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendConstraint('')}>
                    + Add Constraint
                  </Button>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      if (activeCampaignId) {
                        syncWizardUrl(activeCampaignId, 1);
                      }
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={saveStep2Mutation.isPending}>
                    {saveStep2Mutation.isPending ? 'Saving...' : 'Next'}
                  </Button>
                </div>
              </form>
            ) : null}

            {step === 3 ? (
              <form
                onSubmit={step3Form.handleSubmit(async (data) => {
                  setErrorMessage(null);
                  await saveStep3Mutation.mutateAsync(data);
                })}
                onKeyDown={moveToNextWizardField}
                className="mt-4 space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Target Persona</label>
                  <Textarea
                    placeholder="Describe your ideal customer, their challenges, and demographics..."
                    {...step3Form.register('targetPersona')}
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Language</label>
                  <Input placeholder="e.g., English" {...step3Form.register('language')} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pain Points</label>
                  {painPointFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder={`Pain point ${index + 1}`}
                        {...step3Form.register(`painPoints.${index}`)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => removePainPoint(index)}>
                        x
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendPainPoint('')}>
                    + Add Pain Point
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Desired Outcome</label>
                  <Textarea
                    placeholder="What results does your audience want to achieve?"
                    {...step3Form.register('desiredOutcome')}
                    className="min-h-24"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep(2);
                      if (activeCampaignId) {
                        syncWizardUrl(activeCampaignId, 2);
                      }
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={saveStep3Mutation.isPending}>
                    {saveStep3Mutation.isPending ? 'Saving...' : 'Review'}
                  </Button>
                </div>
              </form>
            ) : null}

            {step === 4 ? (
              <div className="mt-4 space-y-6">
                {previewLoading ? (
                  <div className="space-y-4">
                    <Card className="h-40 animate-pulse border-border bg-card" />
                    <Card className="h-64 animate-pulse border-border bg-card" />
                  </div>
                ) : preview ? (
                  <>
                    <ReadinessSummaryCard
                      title="Campaign Readiness"
                      description="Review what is complete, what still needs confirmation, and what to do next before generating strategy."
                      items={readinessItems}
                    />

                    <div className="space-y-6">
                        <Card className="border-border bg-card">
                          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">Business Context</CardTitle>
                              <CardDescription>Review the core business and market setup.</CardDescription>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openPreviewSectionEditor(1, 'business')}
                            >
                              Edit
                            </Button>
                          </CardHeader>
                          <CardContent className="grid gap-4 md:grid-cols-2">
                            <SummaryField label="Campaign Title" value={previewStep1?.title || campaign?.name || preview.campaign?.title} />
                            <SummaryField label="Market" value={previewStep1?.marketLocation || campaign?.city} />
                            <SummaryField
                              label="Business Type"
                              value={formatBusinessType(previewStep1?.businessType || campaign?.businessType || null)}
                            />
                            <SummaryField
                              label="Business Model"
                              value={formatBusinessModel(previewStep1?.businessModel || campaign?.businessModel || null)}
                            />
                            <SummaryField
                              label="Market Scope"
                              value={formatMarketScope(previewStep1?.marketScope || campaign?.marketScope || null)}
                            />
                            <SummaryField label="Website" value={extractWebsiteHost((previewStep1?.websiteUrl as string | undefined) || campaign?.website || null)} />
                          </CardContent>
                          <CardFooter className="border-t">
                            <div className="flex w-full items-start gap-4 rounded-2xl border border-border bg-muted/20 p-4">
                              <Checkbox
                                id="wizard-confirm-business"
                                checked={confirmBusinessInfo}
                                onCheckedChange={(checked) => setConfirmBusinessInfo(checked === true)}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <label htmlFor="wizard-confirm-business" className="cursor-pointer text-sm font-medium text-foreground">
                                  I confirm the business and market information is accurate
                                </label>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>

                        <Card className="border-border bg-card">
                          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">Offer</CardTitle>
                              <CardDescription>Review the offer summary, price range, and constraints.</CardDescription>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openPreviewSectionEditor(2, 'offer')}
                            >
                              Edit
                            </Button>
                          </CardHeader>
                          <CardContent className="grid gap-4 md:grid-cols-2">
                            <SummaryField label="Offer Summary" value={previewStep2?.offerSummary} />
                            <SummaryField label="Price Range" value={previewStep2?.priceRange} />
                            <SummaryField label="Core Promise" value={previewStep2?.differentiators?.[0] || null} />
                            <SummaryField label="Constraints" value={previewStep2?.constraints?.join(', ') || null} />
                          </CardContent>
                          <CardFooter className="border-t">
                            <div className="flex w-full items-start gap-4 rounded-2xl border border-border bg-muted/20 p-4">
                              <Checkbox
                                id="wizard-confirm-offer"
                                checked={confirmOffer}
                                onCheckedChange={(checked) => setConfirmOffer(checked === true)}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <label htmlFor="wizard-confirm-offer" className="cursor-pointer text-sm font-medium text-foreground">
                                  I confirm the offer details are accurate
                                </label>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>

                        <Card className="border-border bg-card">
                          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">Audience</CardTitle>
                              <CardDescription>Review the persona, pain points, and desired outcome.</CardDescription>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openPreviewSectionEditor(3, 'audience')}
                            >
                              Edit
                            </Button>
                          </CardHeader>
                          <CardContent className="grid gap-4 md:grid-cols-2">
                            <SummaryField label="Audience Summary" value={previewStep3?.targetPersona} />
                            <SummaryField label="Language / Region" value={previewStep3?.language} />
                            <SummaryField label="Intent Notes" value={previewStep3?.painPoints?.join(', ') || null} />
                            <SummaryField label="Desired Outcome" value={previewStep3?.desiredOutcome} />
                          </CardContent>
                          <CardFooter className="border-t">
                            <div className="flex w-full items-start gap-4 rounded-2xl border border-border bg-muted/20 p-4">
                              <Checkbox
                                id="wizard-confirm-audience"
                                checked={confirmAudience}
                                onCheckedChange={(checked) => setConfirmAudience(checked === true)}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <label htmlFor="wizard-confirm-audience" className="cursor-pointer text-sm font-medium text-foreground">
                                  I confirm the audience definition is accurate
                                </label>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>

                        <Card className="border-border bg-card">
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl border border-border bg-muted/20 p-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <CardTitle className="text-lg">Final Confirmation</CardTitle>
                                <CardDescription>Make the last validation before strategy generation starts.</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                              <Checkbox
                                id="wizard-ready-to-generate"
                                checked={readyToGenerate}
                                onCheckedChange={(checked) => setReadyToGenerate(checked === true)}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <label htmlFor="wizard-ready-to-generate" className="cursor-pointer text-sm font-medium text-foreground">
                                  I have reviewed the setup and am ready to generate strategy
                                </label>
                              </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/20 p-4">
                              <Checkbox
                                id="wizard-data-consent-opt-in"
                                checked={dataConsentOptIn}
                                onCheckedChange={(checked) => setDataConsentOptIn(checked === true)}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <label htmlFor="wizard-data-consent-opt-in" className="cursor-pointer text-sm font-medium text-foreground">
                                  Data benchmark consent (optional)
                                </label>
                              </div>
                            </div>

                            {allConfirmed ? (
                              <div className="flex justify-end pt-2">
                                <Button onClick={handlePreviewPrimaryAction} disabled={commitMutation.isPending}>
                                  {primaryActionLabel}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>
                    </div>
                  </>
                ) : (
                  <Card className="border-border bg-card">
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
            <AlertDialogAction onClick={() => {
              setShowConflictDialog(false);
              onOpenChange(false);
            }}>
              Close Wizard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
