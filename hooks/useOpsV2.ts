'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { opsV2Repository } from '@/shared/api/repositories';
import type {
  AdminCampaignTriggerType,
  OpsListFilters,
  ReviewerTaskRespondPayload,
  SectionRevisionImpactAnalyzePayload,
  SectionRevisionImpactConfirmPayload,
  SectionReviewApprovePayload,
  SectionReviewRevisionPayload,
} from '@/shared/types/opsV2';

export function useOpsCampaignOverviews(
  enabled = true,
  options?: {
    refetchOnMount?: boolean | 'always';
  },
) {
  return useQuery({
    queryKey: queryKeys.opsV2.campaigns(),
    queryFn: () => opsV2Repository.listCampaignOverviews(),
    enabled,
    refetchOnMount: options?.refetchOnMount,
  });
}

export function useOpsWizardState(campaignId: string | null, enabled = true) {
  return useQuery({
    queryKey: campaignId ? [...queryKeys.wizard.state(campaignId), 'opsV2'] : queryKeys.wizard.all,
    queryFn: () => opsV2Repository.getWizardState(campaignId as string),
    enabled: Boolean(campaignId) && enabled,
  });
}

export function useOpsWizardOptions(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.wizard.options(), 'opsV2'],
    queryFn: () => opsV2Repository.getWizardOptions(),
    enabled,
  });
}

export function useOpsReviewerTasks(filters?: OpsListFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.opsV2.reviewerTasks(filters),
    queryFn: () => opsV2Repository.listReviewerTasks(filters),
    enabled,
  });
}

export function useOpsReviewerTask(taskId: string | null, enabled = true) {
  return useQuery({
    queryKey: taskId ? queryKeys.opsV2.reviewerTask(taskId) : queryKeys.opsV2.all,
    queryFn: () => opsV2Repository.getReviewerTask(taskId as string),
    enabled: Boolean(taskId) && enabled,
  });
}

export function useRespondOpsReviewerTask(taskId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewerTaskRespondPayload) =>
      opsV2Repository.respondReviewerTask(taskId as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
    },
  });
}

export function useOpsSectionReviews(filters?: OpsListFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.opsV2.sectionReviews(filters),
    queryFn: () => opsV2Repository.listSectionReviews(filters),
    enabled,
  });
}

export function useOpsSectionReviewsByRun(
  runId: string | null,
  filters?: { status?: string; marketId?: string; limit?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: runId ? queryKeys.opsV2.sectionReviewsByRun(runId, filters) : queryKeys.opsV2.all,
    queryFn: () => opsV2Repository.listSectionReviewsByRun(runId as string, filters),
    enabled: Boolean(runId) && enabled,
  });
}

export function useOpsSectionReviewTask(sectionReviewTaskId: string | null, enabled = true) {
  return useQuery({
    queryKey: sectionReviewTaskId
      ? queryKeys.opsV2.sectionReviewTask(sectionReviewTaskId)
      : queryKeys.opsV2.all,
    queryFn: () => opsV2Repository.getSectionReviewTask(sectionReviewTaskId as string),
    enabled: Boolean(sectionReviewTaskId) && enabled,
  });
}

export function useOpsSectionReviewWorkspace(runId: string | null, enabled = true) {
  return useQuery({
    queryKey: runId ? queryKeys.opsV2.sectionReviewWorkspace(runId) : queryKeys.opsV2.all,
    queryFn: () => opsV2Repository.getSectionReviewWorkspace(runId as string),
    enabled: Boolean(runId) && enabled,
    retry: false,
  });
}

export function useStartOpsSectionReview(runId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => opsV2Repository.startSectionReview(runId as string),
    onSuccess: async (workspace) => {
      if (runId) {
        queryClient.setQueryData(queryKeys.opsV2.sectionReviewWorkspace(runId), workspace);
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
    },
  });
}

export function useApproveOpsSectionReview(sectionReviewTaskId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SectionReviewApprovePayload) =>
      opsV2Repository.approveSectionReview(sectionReviewTaskId as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
    },
  });
}

export function useRequestOpsSectionRevision(sectionReviewTaskId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SectionReviewRevisionPayload) =>
      opsV2Repository.requestSectionRevision(sectionReviewTaskId as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
    },
  });
}

export function useAnalyzeOpsSectionRevisionImpact(sectionReviewTaskId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SectionRevisionImpactAnalyzePayload) =>
      opsV2Repository.analyzeSectionRevisionImpact(sectionReviewTaskId as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
    },
  });
}

export function useConfirmOpsSectionRevisionImpact(analysisId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SectionRevisionImpactConfirmPayload) =>
      opsV2Repository.confirmSectionRevisionImpact(analysisId as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
    },
  });
}

export function useTriggerOpsAdminCampaign(campaignId: string | null, trigger: AdminCampaignTriggerType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: Record<string, unknown>) =>
      opsV2Repository.triggerAdminCampaign(campaignId as string, trigger, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
    },
  });
}

export function useRecreateOpsAdminCampaignRun(campaignId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => opsV2Repository.recreateLatestCommittedRun(campaignId as string),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.opsV2.all });
    },
  });
}

export function useOpsCampaignHealth(params?: { limit?: number; onlyUnhealthy?: boolean }, enabled = true) {
  return useQuery({
    queryKey: queryKeys.opsV2.campaignHealth(params),
    queryFn: () => opsV2Repository.getCampaignHealth(params),
    enabled,
  });
}

export function useOpsRunEvents(runId: string | null, enabled = true) {
  return useQuery({
    queryKey: runId ? queryKeys.opsV2.runEvents(runId) : queryKeys.opsV2.all,
    queryFn: () => opsV2Repository.getRunEvents(runId as string),
    enabled: Boolean(runId) && enabled,
  });
}

export function useOpsRunPhaseRollups(runId: string | null, enabled = true) {
  return useQuery({
    queryKey: runId ? queryKeys.opsV2.runPhaseRollups(runId) : queryKeys.opsV2.all,
    queryFn: () => opsV2Repository.getRunPhaseRollups(runId as string),
    enabled: Boolean(runId) && enabled,
  });
}

export function useOpsRunAggregate(runId: string | null, enabled = true) {
  return useQuery({
    queryKey: runId ? queryKeys.opsV2.runAggregate(runId) : queryKeys.opsV2.all,
    queryFn: () => opsV2Repository.getRunAggregate(runId as string),
    enabled: Boolean(runId) && enabled,
  });
}

export function useOpsReviewerOutcomes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.opsV2.reviewerOutcomes(),
    queryFn: () => opsV2Repository.getReviewerOutcomes(),
    enabled,
  });
}

export function useOpsCostsSummary(enabled = true) {
  return useQuery({
    queryKey: queryKeys.opsV2.costsSummary(),
    queryFn: () => opsV2Repository.getCostsSummary(),
    enabled,
  });
}
