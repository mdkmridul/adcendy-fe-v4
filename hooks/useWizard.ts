'use client';

import useSWR from 'swr';
import { wizardRepository } from '@/shared/api/repositories/wizard.repo';
import type { WizardStepState, WizardPreview, SaveWizardStepPayload } from '@/shared/types/wizard';
import type { ID } from '@/shared/types/common';
import { useMemo } from 'react';

export function useWizardStep(campaignId: ID, stepKey: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `wizard-step-${campaignId}-${stepKey}`,
    () => wizardRepository.getStep(campaignId, stepKey)
  );

  const saveStep = useMemo(
    () => async (payload: SaveWizardStepPayload) => {
      const updated = await wizardRepository.saveStep(campaignId, stepKey, payload);
      await mutate();
      return updated;
    },
    [campaignId, stepKey, mutate]
  );

  return {
    step: data,
    isLoading,
    error: error?.message || null,
    saveStep,
  };
}

export function useWizardPreview(campaignId: ID) {
  const { data, error, isLoading, mutate } = useSWR(
    `wizard-preview-${campaignId}`,
    () => wizardRepository.getPreview(campaignId)
  );

  return {
    preview: data,
    isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

export function useWizardCommit(campaignId: ID) {
  const commit = useMemo(
    () => async () => {
      return wizardRepository.commitAndGenerate(campaignId);
    },
    [campaignId]
  );

  return { commit };
}
