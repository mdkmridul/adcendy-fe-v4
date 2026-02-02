'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { step3Schema, type Step3FormData } from '@/shared/schemas/wizard';
import { queryKeys } from '@/shared/api/queryKeys';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/shared/api/errors';

const STEPS = [
  { key: 'STEP_1', label: 'Context' },
  { key: 'STEP_2', label: 'Offer' },
  { key: 'STEP_3', label: 'Audience' },
  { key: 'PREVIEW', label: 'Preview' },
];

export default function Step3Page() {
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

  const { data: step3Data } = useQuery({
    queryKey: queryKeys.wizard.step(campaignId, 'STEP_3'),
    queryFn: () => wizardRepository.getStep(campaignId, 'STEP_3'),
  });

  useEffect(() => {
    if (allSteps) {
      setCompletedSteps(allSteps.map((s: { stepKey: string }) => s.stepKey));
    }
  }, [allSteps]);

  const saveMutation = useMutation({
    mutationFn: (data: Step3FormData) =>
      wizardRepository.saveStep(campaignId, 'STEP_3', { data, version: versionRef.current }),
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

  const { control, handleSubmit, formState, reset } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      targetPersona: step3Data?.data?.targetPersona || '',
      language: step3Data?.data?.language || '',
      painPoints: step3Data?.data?.painPoints || [],
      desiredOutcome: step3Data?.data?.desiredOutcome || '',
    },
  });

  const { fields: painPointFields, append: appendPainPoint, remove: removePainPoint } = useFieldArray({
    control,
    name: 'painPoints',
  });

  useEffect(() => {
    if (step3Data) {
      reset(step3Data.data, { keepDirty: false }); // Reset dirty state when loading saved data
      if (step3Data.version !== undefined) {
        versionRef.current = step3Data.version;
      }
    }
  }, [step3Data, reset]);

  const onNext = handleSubmit(async (data) => {
    // Only save if form has been modified
    if (formState.isDirty) {
      await saveMutation.mutateAsync(data);
    }
    router.push(`/app/campaigns/${campaignId}/setup/preview`);
  });

  const handleRefreshConflict = async () => {
    setShowConflictDialog(false);
    
    // Invalidate and refetch wizard state
    await queryClient.invalidateQueries({ queryKey: queryKeys.wizard.step(campaignId, 'STEP_3') });
    
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
        currentStepKey="STEP_3"
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
            <h2 className="font-space-grotesk text-2xl font-bold text-foreground">Target Audience</h2>
            <p className="text-muted-foreground">Define your ideal customers and campaign objectives.</p>
          </div>

          {campaign?.city && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Market Location</p>
              <p className="text-lg font-medium text-foreground">{campaign.city}</p>
            </div>
          )}

          <Card className="p-6 border border-border bg-card space-y-6">
            <form onSubmit={onNext} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Target Persona</label>
                <Textarea
                  placeholder="Describe your ideal customer, their challenges, and demographics..."
                  {...control.register('targetPersona')}
                  className="bg-background border-border min-h-24"
                />
                {formState.errors.targetPersona && (
                  <p className="text-xs text-destructive">{formState.errors.targetPersona.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Language</label>
                <Input
                  placeholder="e.g., English, Spanish, etc."
                  {...control.register('language')}
                  className="bg-background border-border"
                />
                {formState.errors.language && (
                  <p className="text-xs text-destructive">{formState.errors.language.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pain Points</label>
                <p className="text-xs text-muted-foreground">What challenges or problems does your audience face?</p>
                <div className="space-y-2">
                  {painPointFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        {...control.register(`painPoints.${index}`)}
                        placeholder={`Pain point ${index + 1}`}
                        className="bg-background border-border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePainPoint(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendPainPoint('')}
                    className="w-full"
                  >
                    + Add Pain Point
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Desired Outcome</label>
                <Textarea
                  placeholder="What results does your audience want to achieve?"
                  {...control.register('desiredOutcome')}
                  className="bg-background border-border min-h-24"
                />
                {formState.errors.desiredOutcome && (
                  <p className="text-xs text-destructive">{formState.errors.desiredOutcome.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/app/campaigns/${campaignId}/setup/step-2`)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Review'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
