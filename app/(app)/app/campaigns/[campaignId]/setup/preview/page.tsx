'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { WizardStepper } from '@/shared/components/wizard/WizardStepper';
import { WizardHeader } from '@/shared/components/wizard/WizardHeader';
import { wizardRepository } from '@/shared/api/repositories';
import { campaignsRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';

const STEPS = [
  { key: 'STEP_1', label: 'Context' },
  { key: 'STEP_2', label: 'Offer' },
  { key: 'STEP_3', label: 'Audience' },
  { key: 'PREVIEW', label: 'Preview' },
];

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const { data: campaign } = useQuery({
    queryKey: queryKeys.campaigns.detail(campaignId),
    queryFn: () => campaignsRepository.getCampaign(campaignId),
  });

  const { data: allSteps } = useQuery({
    queryKey: queryKeys.wizard.steps(campaignId),
    queryFn: () => wizardRepository.listSteps(campaignId),
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: queryKeys.wizard.preview(campaignId),
    queryFn: () => wizardRepository.getPreview(campaignId),
    enabled: !!allSteps && allSteps.length > 0,
  });

  const commitMutation = useMutation({
    mutationFn: () => wizardRepository.commitAndGenerate(campaignId),
    onSuccess: (result) => {
      router.push(`/app/campaigns/${campaignId}/strategy/runs/${result.strategyRunId}`);
    },
  });

  useEffect(() => {
    if (allSteps) {
      setCompletedSteps(allSteps.map(s => s.stepKey));
    }
  }, [allSteps]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <WizardHeader
        campaignName={campaign?.name || 'Campaign'}
        campaignId={campaignId}
        saveStatus="idle"
      />
      <WizardStepper
        steps={STEPS}
        currentStepKey="PREVIEW"
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
            <h2 className="font-space-grotesk text-2xl font-bold text-foreground">Campaign Preview</h2>
            <p className="text-muted-foreground">Review your setup before generating a strategy.</p>
          </div>

          {previewLoading ? (
            <Card className="p-8 animate-pulse h-40" />
          ) : (
            <>
              <Card className="p-6 border border-blue-500/20 bg-blue-500/5 space-y-4">
                <h3 className="font-semibold text-foreground">Executive Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium text-foreground">{preview?.summary.city}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Niche</p>
                    <p className="font-medium text-foreground">{preview?.summary.niche}</p>
                  </div>
                  {preview?.summary.budget && (
                    <div>
                      <p className="text-muted-foreground">Monthly Budget</p>
                      <p className="font-medium text-foreground">${preview.summary.budget}</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 border border-border bg-card space-y-4">
                <h3 className="font-semibold text-foreground">Your Offer</h3>
                <p className="text-sm text-muted-foreground">{preview?.summary.offer}</p>
              </Card>

              <Card className="p-6 border border-border bg-card space-y-4">
                <h3 className="font-semibold text-foreground">Target Audience</h3>
                <p className="text-sm text-muted-foreground">{preview?.summary.audience}</p>
              </Card>

              {preview?.signals && (
                <Card className="p-6 border border-green-500/20 bg-green-500/5 space-y-4">
                  <h3 className="font-semibold text-foreground">Market Signals</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Search Volume</p>
                      <p className="font-medium text-foreground">{preview.signals.searchVolume?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Competition</p>
                      <p className="font-medium text-foreground">{preview.signals.competitionLevel}</p>
                    </div>
                  </div>
                  {preview.signals.trends && preview.signals.trends.length > 0 && (
                    <div className="pt-2">
                      <p className="text-muted-foreground text-xs mb-2">Trends</p>
                      <div className="flex gap-2 flex-wrap">
                        {preview.signals.trends.map((trend, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-green-500/10 text-xs text-foreground">
                            {trend}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/app/campaigns/${campaignId}/setup/step-3`)}
                >
                  Back
                </Button>
                <Button
                  onClick={() => commitMutation.mutate()}
                  disabled={commitMutation.isPending}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {commitMutation.isPending ? 'Generating...' : 'Generate Strategy'}
                </Button>
              </div>

              {commitMutation.isError && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded">
                  <p className="text-sm text-destructive">Failed to generate strategy. Please try again.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
