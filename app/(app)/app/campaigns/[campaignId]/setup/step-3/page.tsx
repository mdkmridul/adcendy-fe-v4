'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { WizardStepper } from '@/shared/components/wizard/WizardStepper';
import { WizardHeader } from '@/shared/components/wizard/WizardHeader';
import { wizardRepository } from '@/shared/api/repositories';
import { campaignsRepository } from '@/shared/api/repositories';
import { step3Schema, type Step3FormData } from '@/shared/schemas/wizard';
import { queryKeys } from '@/shared/api/queryKeys';

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
      wizardRepository.saveStep(campaignId, 'STEP_3', { data }),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => setSaveStatus('error'),
  });

  const { control, handleSubmit, formState, reset } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      audienceType: step3Data?.data?.audienceType || 'LOCAL',
      customerPersona: step3Data?.data?.customerPersona || '',
      objective: step3Data?.data?.objective || 'LEADS',
    },
  });

  useEffect(() => {
    if (step3Data) {
      reset(step3Data.data);
    }
  }, [step3Data, reset]);

  const onNext = handleSubmit(async (data) => {
    await saveMutation.mutateAsync(data);
    router.push(`/app/campaigns/${campaignId}/setup/preview`);
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

          <Card className="p-6 border border-border bg-card space-y-6">
            <form onSubmit={onNext} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Audience Type</label>
                <Controller
                  name="audienceType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOCAL">Local</SelectItem>
                        <SelectItem value="NICHE_ONLINE">Niche Online</SelectItem>
                        <SelectItem value="MASS">Mass Market</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Customer Persona</label>
                <Textarea
                  placeholder="Describe your ideal customer, their challenges, and demographics..."
                  {...control.register('customerPersona')}
                  className="bg-background border-border min-h-24"
                />
                {formState.errors.customerPersona && (
                  <p className="text-xs text-destructive">{formState.errors.customerPersona.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Primary Objective</label>
                <Controller
                  name="objective"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEADS">Generate Leads</SelectItem>
                        <SelectItem value="SALES">Drive Sales</SelectItem>
                        <SelectItem value="AWARENESS">Build Awareness</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
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
