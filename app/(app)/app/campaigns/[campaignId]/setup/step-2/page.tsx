'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { step2Schema, type Step2FormData } from '@/shared/schemas/wizard';
import { queryKeys } from '@/shared/api/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/shared/api/errors';

const STEPS = [
  { key: 'STEP_1', label: 'Context' },
  { key: 'STEP_2', label: 'Offer' },
  { key: 'STEP_3', label: 'Audience' },
  { key: 'PREVIEW', label: 'Preview' },
];

export default function Step2Page() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const versionRef = useRef<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);

  const { data: campaign } = useQuery({
    queryKey: queryKeys.campaigns.detail(campaignId),
    queryFn: () => campaignsRepository.getCampaign(campaignId),
  });

  const { data: allSteps } = useQuery({
    queryKey: queryKeys.wizard.steps(campaignId),
    queryFn: () => wizardRepository.listSteps(campaignId),
  });

  const { data: step2Data } = useQuery({
    queryKey: queryKeys.wizard.step(campaignId, 'STEP_2'),
    queryFn: () => wizardRepository.getStep(campaignId, 'STEP_2'),
  });

  useEffect(() => {
    if (allSteps) {
      setCompletedSteps(allSteps.map((s: { stepKey: string }) => s.stepKey));
    }
  }, [allSteps]);

  const saveMutation = useMutation({
    mutationFn: (data: Step2FormData) =>
      wizardRepository.saveStep(campaignId, 'STEP_2', { data, version: versionRef.current }),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: (result) => {
      versionRef.current = result.draft.version;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: (error: unknown) => {
      setSaveStatus('error');
      
      if (error instanceof ApiError && error.status === 409 && error.data) {
        setConflictData(error.data);
        setShowConflictDialog(true);
        
        if (error.data?.draft?.version) {
          versionRef.current = error.data.draft.version;
        }
      }
    },
  });

  const { control, handleSubmit, formState, reset } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      offerSummary: '',
      priceRange: '',
      differentiators: [''],
      constraints: [],
    },
  });

  const { fields: differentiatorFields, append: appendDifferentiator, remove: removeDifferentiator } = useFieldArray({
    control,
    name: 'differentiators',
  });

  const { fields: constraintFields, append: appendConstraint, remove: removeConstraint } = useFieldArray({
    control,
    name: 'constraints',
  });

  useEffect(() => {
    if (step2Data) {
      reset(step2Data.data, { keepDirty: false }); // Reset dirty state when loading saved data
      if (step2Data.version !== undefined) {
        versionRef.current = step2Data.version;
      }
    }
  }, [step2Data, reset]);

  const onNext = handleSubmit(async (data) => {
    // Only save if form has been modified
    if (formState.isDirty) {
      await saveMutation.mutateAsync(data);
    }
    router.push(`/app/campaigns/${campaignId}/setup/step-3`);
  });

  const handleRefreshConflict = async () => {
    setShowConflictDialog(false);
    
    // Invalidate and refetch wizard state
    await queryClient.invalidateQueries({ queryKey: queryKeys.wizard.step(campaignId, 'STEP_2') });
    
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
        currentStepKey="STEP_2"
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
            <h2 className="font-space-grotesk text-2xl font-bold text-foreground">Your Offer</h2>
            <p className="text-muted-foreground">Describe what you're offering and its value proposition.</p>
          </div>

          <Card className="p-6 border border-border bg-card space-y-6">
            <form onSubmit={onNext} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Offer Summary</label>
                <Textarea
                  placeholder="Describe what you're offering..."
                  {...control.register('offerSummary')}
                  className="bg-background border-border min-h-[100px]"
                />
                {formState.errors.offerSummary && (
                  <p className="text-xs text-destructive">{formState.errors.offerSummary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Price Range</label>
                <Input
                  placeholder="e.g., $50-$100, $1000+, Free"
                  {...control.register('priceRange')}
                  className="bg-background border-border"
                />
                {formState.errors.priceRange && (
                  <p className="text-xs text-destructive">{formState.errors.priceRange.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Key Differentiators</label>
                <p className="text-xs text-muted-foreground">What makes your offer unique?</p>
                {differentiatorFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="e.g., 24/7 support, Money-back guarantee"
                      {...control.register(`differentiators.${index}`)}
                      className="bg-background border-border flex-1"
                    />
                    {differentiatorFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeDifferentiator(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendDifferentiator('')}
                >
                  + Add Differentiator
                </Button>
                {formState.errors.differentiators && (
                  <p className="text-xs text-destructive">{formState.errors.differentiators.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Constraints (Optional)</label>
                <p className="text-xs text-muted-foreground">Any limitations or restrictions?</p>
                {constraintFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="e.g., Limited availability, Seasonal offer"
                      {...control.register(`constraints.${index}`)}
                      className="bg-background border-border flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeConstraint(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendConstraint('')}
                >
                  + Add Constraint
                </Button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/app/campaigns/${campaignId}/setup/step-1`)}
                >
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
