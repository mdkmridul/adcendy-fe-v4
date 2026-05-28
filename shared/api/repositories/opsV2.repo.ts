import ENV from '@/lib/env';
import type {
  AdminCampaignTriggerType,
  AdminCostsSummary,
  CampaignHealthItem,
  CampaignOverviewV2,
  OpsListFilters,
  ReviewerOutcomesSummary,
  ReviewerTaskDetail,
  ReviewerTaskItem,
  ReviewerTaskRespondPayload,
  ReviewerTaskRespondResult,
  RunTelemetryAggregate,
  RunTelemetryEvent,
  RunTelemetryPhaseRollup,
  SectionReviewApprovePayload,
  SectionReviewDetail,
  SectionReviewItem,
  SectionRevisionImpactAnalyzePayload,
  SectionRevisionImpactConfirmPayload,
  SectionReviewRevisionPayload,
  SectionReviewWorkspaceDetail,
} from '@/shared/types/opsV2';
import { opsV2MockAdapter } from '../mock/opsV2.mock';
import { opsV2RealAdapter } from '../real/opsV2.real';

const adapter = ENV.API.isMock ? opsV2MockAdapter : opsV2RealAdapter;

if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Ops V2 Repository] Using adapter:', ENV.API.dataSource);
}

export const opsV2Repository = {
  async listCampaignOverviews(): Promise<CampaignOverviewV2[]> {
    return adapter.listCampaignOverviews();
  },

  async getWizardState(campaignId: string): Promise<Record<string, unknown>> {
    return adapter.getWizardState(campaignId);
  },

  async getWizardOptions(): Promise<Record<string, unknown>> {
    return adapter.getWizardOptions();
  },

  async patchWizardStep(stepNumber: number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return adapter.patchWizardStep(stepNumber, payload);
  },

  async commitWizard(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return adapter.commitWizard(payload);
  },

  async listReviewerTasks(filters?: OpsListFilters): Promise<ReviewerTaskItem[]> {
    return adapter.listReviewerTasks(filters);
  },

  async getReviewerTask(taskId: string): Promise<ReviewerTaskDetail> {
    return adapter.getReviewerTask(taskId);
  },

  async respondReviewerTask(taskId: string, payload: ReviewerTaskRespondPayload): Promise<ReviewerTaskRespondResult> {
    return adapter.respondReviewerTask(taskId, payload);
  },

  async listSectionReviews(filters?: OpsListFilters): Promise<SectionReviewItem[]> {
    return adapter.listSectionReviews(filters);
  },

  async listSectionReviewsByRun(
    runId: string,
    filters?: { status?: string; marketId?: string; limit?: number },
  ): Promise<SectionReviewItem[]> {
    return adapter.listSectionReviewsByRun(runId, filters);
  },

  async getSectionReviewTask(sectionReviewTaskId: string): Promise<SectionReviewDetail> {
    return adapter.getSectionReviewTask(sectionReviewTaskId);
  },

  async getSectionReviewWorkspace(runId: string): Promise<SectionReviewWorkspaceDetail> {
    return adapter.getSectionReviewWorkspace(runId);
  },

  async startSectionReview(runId: string): Promise<SectionReviewWorkspaceDetail> {
    return adapter.startSectionReview(runId);
  },

  async approveSectionReview(
    sectionReviewTaskId: string,
    payload: SectionReviewApprovePayload,
  ): Promise<SectionReviewDetail> {
    return adapter.approveSectionReview(sectionReviewTaskId, payload);
  },

  async requestSectionRevision(
    sectionReviewTaskId: string,
    payload: SectionReviewRevisionPayload,
  ): Promise<SectionReviewDetail> {
    return adapter.requestSectionRevision(sectionReviewTaskId, payload);
  },

  async analyzeSectionRevisionImpact(
    sectionReviewTaskId: string,
    payload: SectionRevisionImpactAnalyzePayload,
  ): Promise<Record<string, unknown>> {
    return adapter.analyzeSectionRevisionImpact(sectionReviewTaskId, payload);
  },

  async confirmSectionRevisionImpact(
    analysisId: string,
    payload: SectionRevisionImpactConfirmPayload,
  ): Promise<Record<string, unknown>> {
    return adapter.confirmSectionRevisionImpact(analysisId, payload);
  },

  async triggerAdminCampaign(
    campaignId: string,
    trigger: AdminCampaignTriggerType,
    payload?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return adapter.triggerAdminCampaign(campaignId, trigger, payload);
  },

  async recreateLatestCommittedRun(campaignId: string): Promise<Record<string, unknown>> {
    return adapter.recreateLatestCommittedRun(campaignId);
  },

  async getCampaignHealth(params?: { limit?: number; onlyUnhealthy?: boolean }): Promise<CampaignHealthItem[]> {
    return adapter.getCampaignHealth(params);
  },

  async getRunEvents(runId: string): Promise<RunTelemetryEvent[]> {
    return adapter.getRunEvents(runId);
  },

  async getRunPhaseRollups(runId: string): Promise<RunTelemetryPhaseRollup[]> {
    return adapter.getRunPhaseRollups(runId);
  },

  async getRunAggregate(runId: string): Promise<RunTelemetryAggregate> {
    return adapter.getRunAggregate(runId);
  },

  async getReviewerOutcomes(): Promise<ReviewerOutcomesSummary> {
    return adapter.getReviewerOutcomes();
  },

  async getCostsSummary(): Promise<AdminCostsSummary> {
    return adapter.getCostsSummary();
  },
};
