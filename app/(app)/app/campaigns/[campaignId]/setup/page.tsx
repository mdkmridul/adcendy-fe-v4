'use client';

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { wizardRepository } from '@/shared/api/repositories';
import { queryKeys } from '@/shared/api/queryKeys';
import { Card } from '@/components/ui/card';

export default function SetupPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.campaignId as string;

  const { data: steps, isLoading } = useQuery({
    queryKey: queryKeys.wizard.steps(campaignId),
    queryFn: () => wizardRepository.listSteps(campaignId),
  });

  const determineNextStep = useCallback(() => {
    if (!steps) return 'step-1';

    const completedSteps = steps.map((s: { stepKey: string }) => s.stepKey);

    // If all three steps are done, go to preview
    if (completedSteps.includes('STEP_3')) {
      return 'preview';
    }
    // If step 2 is done, go to step 3
    if (completedSteps.includes('STEP_2')) {
      return 'step-3';
    }
    // If step 1 is done, go to step 2
    if (completedSteps.includes('STEP_1')) {
      return 'step-2';
    }
    // Otherwise start at step 1
    return 'step-1';
  }, [steps]);

  useEffect(() => {
    if (!isLoading && steps !== undefined) {
      const nextStep = determineNextStep();
      router.push(`/app/campaigns/${campaignId}/setup/${nextStep}`);
    }
  }, [steps, isLoading, campaignId, router, determineNextStep]);

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="p-8">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Loading wizard...</p>
        </div>
      </Card>
    </div>
  );
}
