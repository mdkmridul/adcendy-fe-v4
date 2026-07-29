import { http } from '../index';
import type { ApiResponse } from '../types';
import type {
  Anomaly,
  DerivedMetricsSummary,
  TweakItem,
  TweakRun,
  UpdateTweakStatusPayload,
  UpsertWeeklySubmissionPayload,
  WeeklyProcessingRun,
  WeeklySubmission,
} from '@/shared/types/weekly';

interface WeeklySubmissionResponse {
  weeklySubmission: WeeklySubmission;
  processingRunId: string;
}

interface WeeklyListResponse {
  submissions: WeeklySubmission[];
}

interface AnomalyListResponse {
  anomalies: Anomaly[];
}

function requireId(value: unknown, label: string): string {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  throw new Error(`${label} response did not include a run ID.`);
}

export const weeklyRealAdapter = {
  async upsertSubmission(
    campaignId: string,
    weekStart: string,
    payload: UpsertWeeklySubmissionPayload,
  ): Promise<WeeklySubmissionResponse> {
    const response = await http<ApiResponse<WeeklySubmissionResponse>>(
      `/v1/campaigns/${campaignId}/weekly/${weekStart}`,
      { method: 'POST', body: payload },
    );
    return response.data;
  },

  async listSubmissions(campaignId: string): Promise<WeeklySubmission[]> {
    const response = await http<ApiResponse<WeeklyListResponse>>(
      `/v1/campaigns/${campaignId}/weekly`,
    );
    return response.data.submissions;
  },

  async getWeeklySubmission(
    campaignId: string,
    weekStart: string,
  ): Promise<WeeklySubmission | null> {
    try {
      const response = await http<ApiResponse<WeeklySubmission>>(
        `/v1/campaigns/${campaignId}/weekly/${weekStart}`,
      );
      return response.data;
    } catch {
      return null;
    }
  },

  async getProcessingRun(processingRunId: string): Promise<WeeklyProcessingRun> {
    const response = await http<ApiResponse<WeeklyProcessingRun>>(
      `/v1/weekly/processing-runs/${processingRunId}`,
    );
    return response.data;
  },

  async getDerivedSummary(
    campaignId: string,
    weekStart: string,
  ): Promise<DerivedMetricsSummary> {
    const response = await http<ApiResponse<DerivedMetricsSummary>>(
      `/v1/campaigns/${campaignId}/weekly/${weekStart}/summary`,
    );
    return response.data;
  },

  async listAnomalies(campaignId: string, weekStart?: string): Promise<Anomaly[]> {
    const response = await http<ApiResponse<AnomalyListResponse>>(
      `/v1/campaigns/${campaignId}/anomalies`,
      { query: weekStart ? { weekStart } : undefined },
    );
    return response.data.anomalies;
  },

  async startTweakRun(
    campaignId: string,
    weekStart: string,
  ): Promise<{ tweakRunId: string }> {
    const response = await http<ApiResponse<Record<string, unknown>>>(
      `/v1/campaigns/${campaignId}/weekly/${weekStart}/tweaks/generate`,
      { method: 'POST' },
    );
    return {
      tweakRunId: requireId(
        response.data.tweakRunId ?? response.data.runId ?? response.data.id,
        'Tweak generation',
      ),
    };
  },

  async getTweakRun(campaignId: string, weekStart: string): Promise<TweakRun | null> {
    try {
      const response = await http<ApiResponse<TweakRun>>(
        `/v1/campaigns/${campaignId}/weekly/${weekStart}/tweaks/latest`,
      );
      return response.data;
    } catch {
      return null;
    }
  },

  async getTweakRunById(tweakRunId: string): Promise<TweakRun> {
    const response = await http<ApiResponse<TweakRun>>(
      `/v1/weekly/tweak-runs/${tweakRunId}`,
    );
    return response.data;
  },

  async listTweaks(
    tweakRunId: string,
    visibility: 'ALL' | 'APPROVED_ONLY' = 'ALL',
  ): Promise<TweakItem[]> {
    const response = await http<ApiResponse<{ items: TweakItem[] }>>(
      `/v1/weekly/tweak-runs/${tweakRunId}/items`,
      { query: { visibility } },
    );
    return response.data.items;
  },

  async updateTweakStatus(
    tweakItemId: string,
    payload: UpdateTweakStatusPayload,
  ): Promise<TweakItem> {
    const response = await http<ApiResponse<TweakItem>>(
      `/v1/weekly/tweaks/${tweakItemId}`,
      { method: 'PATCH', body: payload },
    );
    return response.data;
  },
};
