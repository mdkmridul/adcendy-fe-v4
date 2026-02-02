'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WizardStepper } from '@/shared/components/wizard/WizardStepper';
import { WizardHeader } from '@/shared/components/wizard/WizardHeader';
import { wizardRepository } from '@/shared/api/repositories';
import { campaignsRepository } from '@/shared/api/repositories';
import { step1Schema, type Step1FormData } from '@/shared/schemas/wizard';
import { queryKeys } from '@/shared/api/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/shared/api/errors';

const BUSINESS_TYPE_OPTIONS = [
  { value: 'SERVICE', label: 'Service' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'SAAS', label: 'SaaS' },
] as const;

const STEPS = [
  { key: 'STEP_1', label: 'Context' },
  { key: 'STEP_2', label: 'Offer' },
  { key: 'STEP_3', label: 'Audience' },
  { key: 'PREVIEW', label: 'Preview' },
];

export default function Step1Page() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const versionRef = useRef<number>(0); // Track current draft version
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);

  const { data: campaign } = useQuery({
    queryKey: queryKeys.campaigns.detail(campaignId),
    queryFn: () => campaignsRepository.getCampaign(campaignId),
  });

  const { data: step1Data } = useQuery({
    queryKey: queryKeys.wizard.step(campaignId, 'STEP_1'),
    queryFn: () => wizardRepository.getStep(campaignId, 'STEP_1'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Step1FormData) =>
      wizardRepository.saveStep(campaignId, 'STEP_1', { data, version: versionRef.current }),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: (result) => {
      // Update version from successful save
      versionRef.current = result.draft.version;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: (error: unknown) => {
      setSaveStatus('error');
      
      // Handle version conflict (409)
      if (error instanceof ApiError && error.status === 409 && error.data) {
        // Store conflict data and show dialog
        setConflictData(error.data);
        setShowConflictDialog(true);
        
        // Update version to latest
        if (error.data?.draft?.version) {
          versionRef.current = error.data.draft.version;
        }
      }
    },
  });

  const { control, handleSubmit, formState, reset } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: campaign?.name || '',
      marketLocation: campaign?.city || '',
      businessType: campaign?.businessType || '',
      websiteUrl: campaign?.website || '',
    },
  });

  useEffect(() => {
    if (step1Data?.data && Object.keys(step1Data.data).length > 0) {
      reset(step1Data.data, { keepDirty: false }); // Reset dirty state when loading saved data
      setCompletedSteps(['STEP_1']);
      // Update version from wizard state
      if (step1Data.version !== undefined) {
        versionRef.current = step1Data.version;
      }
    } else if (campaign) {
      // Pre-fill from campaign data if no saved wizard data
      reset({
        title: campaign.name,
        marketLocation: campaign.city,
        businessType: campaign.businessType || '',
        websiteUrl: campaign.website || '',
      }, { keepDirty: false });
    }
  }, [step1Data, campaign, reset]);

  const onNext = handleSubmit(async (data) => {
    // Only save if form has been modified
    if (formState.isDirty) {
      await saveMutation.mutateAsync(data);
    }
    router.push(`/app/campaigns/${campaignId}/setup/step-2`);
  });

  const handleRefreshConflict = async () => {
    setShowConflictDialog(false);
    
    // Invalidate and refetch wizard state
    await queryClient.invalidateQueries({ queryKey: queryKeys.wizard.step(campaignId, 'STEP_1') });
    
    // Navigate to the appropriate step based on latest draft
    if (conflictData?.draft) {
      const lastStep = conflictData.draft.lastCompletedStep || 0;
      
      // Navigate to next step after last completed
      if (lastStep === 0) {
        router.push(`/app/campaigns/${campaignId}/setup/step-1`);
      } else if (lastStep === 1) {
        router.push(`/app/campaigns/${campaignId}/setup/step-2`);
      } else if (lastStep === 2) {
        router.push(`/app/campaigns/${campaignId}/setup/step-3`);
      } else {
        router.push(`/app/campaigns/${campaignId}/setup/preview`);
      }
    }
    
    setConflictData(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campaign Updated Elsewhere</AlertDialogTitle>
            <AlertDialogDescription>
              This campaign was updated in another session. Your current changes cannot be saved.
              Click "Refresh" to load the latest version and continue from where it was last updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRefreshConflict}>
              Refresh & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WizardHeader
        campaignName={campaign?.name || 'Campaign'}
        campaignId={campaignId}
        saveStatus={saveStatus}
      />
      <WizardStepper
        steps={STEPS}
        currentStepKey="STEP_1"
        completedSteps={completedSteps}
        onStepClick={(key) => {
          if (completedSteps.includes(key)) {
            const routeMap: Record<string, string> = {
              STEP_1: 'step-1',
              STEP_2: 'step-2',
              STEP_3: 'step-3',
              PREVIEW: 'preview',
            };
            router.push(`/app/campaigns/${campaignId}/setup/${routeMap[key]}`);
          }
        }}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="font-space-grotesk text-2xl font-bold text-foreground">Market Context</h2>
            <p className="text-muted-foreground">Tell us about your market and business fundamentals.</p>
          </div>

          <Card className="p-6 border border-border bg-card space-y-6">
            <form onSubmit={onNext} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Campaign Title</label>
                <Input
                  placeholder="e.g., Acme Inc."
                  {...control.register('title')}
                  className="bg-background border-border"
                />
                {formState.errors.title && (
                  <p className="text-xs text-destructive">{formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Market Location</label>
                <Input
                  placeholder="e.g., San Francisco, CA"
                  {...control.register('marketLocation')}
                  className="bg-background border-border"
                />
                {formState.errors.marketLocation && (
                  <p className="text-xs text-destructive">{formState.errors.marketLocation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Business Type</label>
                <Controller
                  name="businessType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-background border-border">
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
                {formState.errors.businessType && (
                  <p className="text-xs text-destructive">{formState.errors.businessType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Website (Optional)</label>
                <Input
                  placeholder="https://example.com"
                  {...control.register('websiteUrl')}
                  className="bg-background border-border"
                />
                {formState.errors.websiteUrl && (
                  <p className="text-xs text-destructive">{formState.errors.websiteUrl.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Next'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
