'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { WizardStepper } from '@/shared/components/wizard/WizardStepper';
import { WizardHeader } from '@/shared/components/wizard/WizardHeader';
import { wizardRepository } from '@/shared/api/repositories';
import { campaignsRepository } from '@/shared/api/repositories';
import { step1Schema, type Step1FormData } from '@/shared/schemas/wizard';
import { queryKeys } from '@/shared/api/queryKeys';

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
      wizardRepository.saveStep(campaignId, 'STEP_1', { data }),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => setSaveStatus('error'),
  });

  const { control, handleSubmit, formState, reset } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      city: step1Data?.data?.city || '',
      niche: step1Data?.data?.niche || '',
      website: step1Data?.data?.website || '',
      budgetMonthly: step1Data?.data?.budgetMonthly || undefined,
    },
  });

  useEffect(() => {
    if (step1Data) {
      reset(step1Data.data);
      setCompletedSteps(['STEP_1']);
    }
  }, [step1Data, reset]);

  const onNext = handleSubmit(async (data) => {
    await saveMutation.mutateAsync(data);
    router.push(`/app/campaigns/${campaignId}/setup/step-2`);
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
                <label className="text-sm font-medium text-foreground">City</label>
                <Input
                  placeholder="e.g., San Francisco"
                  {...control.register('city')}
                  className="bg-background border-border"
                />
                {formState.errors.city && (
                  <p className="text-xs text-destructive">{formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Niche / Category</label>
                <Input
                  placeholder="e.g., B2B SaaS, E-commerce, Healthcare"
                  {...control.register('niche')}
                  className="bg-background border-border"
                />
                {formState.errors.niche && (
                  <p className="text-xs text-destructive">{formState.errors.niche.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Website (Optional)</label>
                <Input
                  placeholder="https://example.com"
                  {...control.register('website')}
                  className="bg-background border-border"
                />
                {formState.errors.website && (
                  <p className="text-xs text-destructive">{formState.errors.website.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Monthly Budget (Optional)</label>
                <Input
                  type="number"
                  placeholder="5000"
                  {...control.register('budgetMonthly')}
                  className="bg-background border-border"
                />
                {formState.errors.budgetMonthly && (
                  <p className="text-xs text-destructive">{formState.errors.budgetMonthly.message}</p>
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
