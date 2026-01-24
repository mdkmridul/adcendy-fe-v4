'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { WizardStepper } from '@/shared/components/wizard/WizardStepper';
import { WizardHeader } from '@/shared/components/wizard/WizardHeader';
import { wizardRepository } from '@/shared/api/repositories';
import { campaignsRepository } from '@/shared/api/repositories';
import { step2Schema, type Step2FormData } from '@/shared/schemas/wizard';
import { queryKeys } from '@/shared/api/queryKeys';

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
      wizardRepository.saveStep(campaignId, 'STEP_2', { data }),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => setSaveStatus('error'),
  });

  const { control, handleSubmit, formState, reset } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      offerType: step2Data?.data?.offerType || 'SERVICE',
      offerSummary: step2Data?.data?.offerSummary || '',
      pricePoint: step2Data?.data?.pricePoint || undefined,
      usp: step2Data?.data?.usp || '',
    },
  });

  useEffect(() => {
    if (step2Data) {
      reset(step2Data.data);
    }
  }, [step2Data, reset]);

  const onNext = handleSubmit(async (data) => {
    await saveMutation.mutateAsync(data);
    router.push(`/app/campaigns/${campaignId}/setup/step-3`);
  });

  return (
    <div className="flex flex-col h-screen bg-background">
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
                <label className="text-sm font-medium text-foreground">Offer Type</label>
                <Controller
                  name="offerType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SERVICE">Service</SelectItem>
                        <SelectItem value="PRODUCT">Product</SelectItem>
                        <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Offer Summary</label>
                <Input
                  placeholder="Brief description of what you offer..."
                  {...control.register('offerSummary')}
                  className="bg-background border-border"
                />
                {formState.errors.offerSummary && (
                  <p className="text-xs text-destructive">{formState.errors.offerSummary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Price Point (Optional)</label>
                <Input
                  type="number"
                  placeholder="e.g., 99.99"
                  {...control.register('pricePoint')}
                  className="bg-background border-border"
                />
                {formState.errors.pricePoint && (
                  <p className="text-xs text-destructive">{formState.errors.pricePoint.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Unique Selling Proposition (Optional)</label>
                <Input
                  placeholder="What makes your offer unique?..."
                  {...control.register('usp')}
                  className="bg-background border-border"
                />
                {formState.errors.usp && (
                  <p className="text-xs text-destructive">{formState.errors.usp.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
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
