import { http, httpRaw } from '../index';
import type { ApiResponse } from '../types';
import type {
  AdminDownloadResponse,
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
import {
  normalizeAdminCostsSummary,
  normalizeCampaignHealthList,
  normalizeCampaignOverviewList,
  normalizeReviewerOutcomesSummary,
  normalizeReviewerTaskDetail,
  normalizeReviewerTaskList,
  normalizeReviewerTaskRespondResult,
  normalizeRunTelemetryAggregate,
  normalizeRunTelemetryEvents,
  normalizeRunTelemetryPhaseRollups,
  normalizeSectionReviewDetail,
  normalizeSectionReviewList,
  normalizeSectionReviewWorkspaceDetail,
} from '@/shared/types/opsV2';

function unwrapResponseData<T>(response: ApiResponse<T> | T | undefined): T | undefined {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T | undefined;
}

function toListQuery(filters?: OpsListFilters) {
  if (!filters) {
    return undefined;
  }

  return {
    status: filters.status,
    pipelineRunId: filters.pipelineRunId,
    marketId: filters.marketId,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
}

function stripQuotes(value: string) {
  return value.replace(/^"(.*)"$/, '$1').trim();
}

function getFilenameFromContentDisposition(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const filenameStarMatch = value.match(/filename\*\s*=\s*([^;]+)/i);
  if (filenameStarMatch) {
    const encodedValue = stripQuotes(filenameStarMatch[1]);
    const [, encodedFilename = encodedValue] = encodedValue.split("''", 2);

    try {
      return decodeURIComponent(encodedFilename);
    } catch {
      return encodedFilename;
    }
  }

  const filenameMatch = value.match(/filename\s*=\s*([^;]+)/i);
  if (!filenameMatch) {
    return null;
  }

  return stripQuotes(filenameMatch[1]);
}

function normalizeMimeType(value: string | null | undefined) {
  return value?.split(';', 1)[0]?.trim().toLowerCase() ?? null;
}

function isLikelyFileContentType(value: string | null | undefined) {
  const mimeType = normalizeMimeType(value);
  if (!mimeType) {
    return false;
  }

  if (
    mimeType === 'application/json' ||
    mimeType === 'application/problem+json' ||
    mimeType === 'text/plain' ||
    mimeType === 'text/html'
  ) {
    return false;
  }

  return true;
}

export const opsV2RealAdapter = {
  async listCampaignOverviews(): Promise<CampaignOverviewV2[]> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/campaigns');
    return normalizeCampaignOverviewList(unwrapResponseData(response));
  },

  async getWizardState(campaignId: string): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/wizard/state/${campaignId}`);
    const payload = unwrapResponseData(response);
    return (payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {});
  },

  async getWizardOptions(): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/wizard/options');
    const payload = unwrapResponseData(response);
    return (payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {});
  },

  async patchWizardStep(stepNumber: number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/wizard/steps/${stepNumber}`, {
      method: 'PATCH',
      body: payload,
    });
    const data = unwrapResponseData(response);
    return (data && typeof data === 'object' ? (data as Record<string, unknown>) : {});
  },

  async commitWizard(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/wizard/commit', {
      method: 'POST',
      body: payload,
    });
    const data = unwrapResponseData(response);
    return (data && typeof data === 'object' ? (data as Record<string, unknown>) : {});
  },

  async listReviewerTasks(filters?: OpsListFilters): Promise<ReviewerTaskItem[]> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/reviewer-tasks', {
      query: toListQuery(filters),
    });
    return normalizeReviewerTaskList(unwrapResponseData(response));
  },

  async getReviewerTask(taskId: string): Promise<ReviewerTaskDetail> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/reviewer-tasks/${taskId}`);
    return normalizeReviewerTaskDetail(unwrapResponseData(response));
  },

  async respondReviewerTask(taskId: string, payload: ReviewerTaskRespondPayload): Promise<ReviewerTaskRespondResult> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/reviewer-tasks/${taskId}/respond`, {
      method: 'POST',
      body: {
        ...(payload.reviewerId ? { reviewerId: payload.reviewerId } : {}),
        answer: payload.answer,
      },
    });
    return normalizeReviewerTaskRespondResult(unwrapResponseData(response));
  },

  async listSectionReviews(filters?: OpsListFilters): Promise<SectionReviewItem[]> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/section-reviews', {
      query: toListQuery(filters),
    });
    return normalizeSectionReviewList(unwrapResponseData(response));
  },

  async listSectionReviewsByRun(runId: string, filters?: { status?: string; marketId?: string; limit?: number }): Promise<SectionReviewItem[]> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/section-reviews/${runId}`, {
      query: {
        status: filters?.status,
        marketId: filters?.marketId,
        limit: filters?.limit,
      },
    });
    return normalizeSectionReviewList(unwrapResponseData(response));
  },

  async getSectionReviewTask(sectionReviewTaskId: string): Promise<SectionReviewDetail> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/section-reviews/tasks/${sectionReviewTaskId}`);
    return normalizeSectionReviewDetail(unwrapResponseData(response));
  },

  async getSectionReviewWorkspace(runId: string): Promise<SectionReviewWorkspaceDetail> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/section-reviews/${runId}/workspace`);
    return normalizeSectionReviewWorkspaceDetail(unwrapResponseData(response), runId);
  },

  async startSectionReview(runId: string): Promise<SectionReviewWorkspaceDetail> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/section-reviews/${runId}/start-review`, {
      method: 'POST',
    });
    const payload = unwrapResponseData(response);

    if (payload) {
      return normalizeSectionReviewWorkspaceDetail(payload, runId);
    }

    return this.getSectionReviewWorkspace(runId);
  },

  async approveSectionReview(sectionReviewTaskId: string, payload: SectionReviewApprovePayload): Promise<SectionReviewDetail> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/section-reviews/${sectionReviewTaskId}/approve`, {
      method: 'POST',
      body: payload,
    });
    return normalizeSectionReviewDetail(unwrapResponseData(response));
  },

  async requestSectionRevision(sectionReviewTaskId: string, payload: SectionReviewRevisionPayload): Promise<SectionReviewDetail> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/section-reviews/${sectionReviewTaskId}/request-revision`, {
      method: 'POST',
      body: payload,
    });
    return normalizeSectionReviewDetail(unwrapResponseData(response));
  },

  async analyzeSectionRevisionImpact(
    sectionReviewTaskId: string,
    payload: SectionRevisionImpactAnalyzePayload,
  ): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>(
      `/api/v2/section-reviews/${sectionReviewTaskId}/revision-impact/analyze`,
      {
        method: 'POST',
        body: payload,
      },
    );
    const data = unwrapResponseData(response);
    return (data && typeof data === 'object' ? (data as Record<string, unknown>) : {});
  },

  async confirmSectionRevisionImpact(
    analysisId: string,
    payload: SectionRevisionImpactConfirmPayload,
  ): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>(
      `/api/v2/section-reviews/revision-impact/${analysisId}/confirm`,
      {
        method: 'POST',
        body: payload,
      },
    );
    const data = unwrapResponseData(response);
    return (data && typeof data === 'object' ? (data as Record<string, unknown>) : {});
  },

  async triggerAdminCampaign(
    campaignId: string,
    trigger: AdminCampaignTriggerType,
    payload?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>(
      `/api/v2/admin/campaigns/${campaignId}/triggers/${trigger}`,
      {
        method: 'POST',
        body: payload ?? {},
      },
    );
    const data = unwrapResponseData(response);
    return (data && typeof data === 'object' ? (data as Record<string, unknown>) : {});
  },

  async downloadAdminCampaignOutput(
    campaignId: string,
    payload?: Record<string, unknown>,
  ): Promise<AdminDownloadResponse> {
    const response = await httpRaw<Blob>(
      `/api/v2/admin/campaigns/${campaignId}/triggers/output`,
      {
        method: 'POST',
        body: payload ?? {},
        headers: {
          Accept: 'application/pdf, application/zip, application/octet-stream',
        },
        responseType: 'blob',
      },
    );

    const filename = getFilenameFromContentDisposition(response.headers.get('content-disposition'));
    const hasFilename = Boolean(filename?.trim());
    const responseContentType = normalizeMimeType(response.contentType);
    const blobContentType = normalizeMimeType(response.data.type);

    if (!hasFilename && !isLikelyFileContentType(responseContentType) && !isLikelyFileContentType(blobContentType)) {
      throw new Error('Expected file response from output assembly route.');
    }

    return {
      blob: response.data,
      filename,
      contentType: responseContentType ?? blobContentType,
    };
  },

  async recreateLatestCommittedRun(campaignId: string): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>(
      `/api/v2/admin/campaigns/${campaignId}/runs/recreate-latest-commit`,
      {
        method: 'POST',
      },
    );
    const data = unwrapResponseData(response);
    return (data && typeof data === 'object' ? (data as Record<string, unknown>) : {});
  },

  async assembleAdminRunInternalOutput(runId: string): Promise<Record<string, unknown>> {
    const response = await http<ApiResponse<unknown> | unknown>(
      `/api/v2/admin/runs/${runId}/internal-output/assemble`,
      {
        method: 'POST',
      },
    );
    const data = unwrapResponseData(response);
    return (data && typeof data === 'object' ? (data as Record<string, unknown>) : {});
  },

  async getCampaignHealth(params?: { limit?: number; onlyUnhealthy?: boolean }): Promise<CampaignHealthItem[]> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/telemetry/admin/campaign-health', {
      query: {
        limit: params?.limit,
        onlyUnhealthy: params?.onlyUnhealthy ? 'true' : undefined,
      },
    });
    return normalizeCampaignHealthList(unwrapResponseData(response));
  },

  async getRunEvents(runId: string): Promise<RunTelemetryEvent[]> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/telemetry/runs/${runId}/events`);
    return normalizeRunTelemetryEvents(unwrapResponseData(response));
  },

  async getRunPhaseRollups(runId: string): Promise<RunTelemetryPhaseRollup[]> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/telemetry/runs/${runId}/phase-rollups`);
    return normalizeRunTelemetryPhaseRollups(unwrapResponseData(response));
  },

  async getRunAggregate(runId: string): Promise<RunTelemetryAggregate> {
    const response = await http<ApiResponse<unknown> | unknown>(`/api/v2/telemetry/runs/${runId}/aggregate`);
    return normalizeRunTelemetryAggregate(unwrapResponseData(response), runId);
  },

  async getReviewerOutcomes(): Promise<ReviewerOutcomesSummary> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/telemetry/admin/reviewer-outcomes');
    return normalizeReviewerOutcomesSummary(unwrapResponseData(response));
  },

  async getCostsSummary(): Promise<AdminCostsSummary> {
    const response = await http<ApiResponse<unknown> | unknown>('/api/v2/telemetry/admin/costs');
    return normalizeAdminCostsSummary(unwrapResponseData(response));
  },
};
