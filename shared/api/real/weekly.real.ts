import { http } from '../index';
import type { WeeklySubmission, WeeklyProcessingRun, DerivedMetricsSummary, Anomaly, TweakRun, TweakItem, UpsertWeeklySubmissionPayload, UpdateTweakStatusPayload } from '@/shared/types/weekly';
import type { ID } from '@/shared/types/common';

export const weeklyRealAdapter = {
  async upsertSubmission(
    campaignId: ID,
    weekStart: string,
    payload: UpsertWeeklySubmissionPayload
  ): Promise<{ weeklySubmission: WeeklySubmission; processingRunId: ID }> {
    return http<{ weeklySubmission: WeeklySubmission; processingRunId: ID }>(`/campaigns/${campaignId}/weekly/${weekStart}`, {
      method: 'POST',
      body: payload,
    });
  },

  async listSubmissions(campaignId: ID): Promise<WeeklySubmission[]> {
    return http<WeeklySubmission[]>(`/campaigns/${campaignId}/weekly`);
  },

  async getWeeklySubmission(campaignId: ID, weekStart: string): Promise<WeeklySubmission | null> {
    try {
      return await http<WeeklySubmission>(`/campaigns/${campaignId}/weekly/${weekStart}`);
    } catch {
      return null;
    }
  },

  async getProcessingRun(processingRunId: ID): Promise<WeeklyProcessingRun> {
    return http<WeeklyProcessingRun>(`/processing-runs/${processingRunId}`);
  },

  async getDerivedSummary(campaignId: ID, weekStart: string): Promise<DerivedMetricsSummary> {
    return http<DerivedMetricsSummary>(`/campaigns/${campaignId}/weekly/${weekStart}/derived`);
  },

  async listAnomalies(campaignId: ID, weekStart?: string): Promise<Anomaly[]> {
    const query = weekStart ? { weekStart } : undefined;
    return http<Anomaly[]>(`/campaigns/${campaignId}/anomalies`, { query });
  },

  async startTweakRun(campaignId: ID, weekStart: string): Promise<{ tweakRunId: ID }> {
    return http<{ tweakRunId: ID }>(`/campaigns/${campaignId}/weekly/${weekStart}/tweaks`, {
      method: 'POST',
    });
  },

  async getTweakRun(campaignId: ID, weekStart: string): Promise<TweakRun | null> {
    try {
      return await http<TweakRun>(`/campaigns/${campaignId}/weekly/${weekStart}/tweaks`);
    } catch {
      return null;
    }
  },

  async getTweakRunById(tweakRunId: ID): Promise<TweakRun> {
    return http<TweakRun>(`/tweak-runs/${tweakRunId}`);
  },

  async listTweaks(tweakRunId: ID, visibility?: 'ALL' | 'APPROVED_ONLY'): Promise<TweakItem[]> {
    const query = visibility ? { visibility } : undefined;
    return http<TweakItem[]>(`/tweak-runs/${tweakRunId}/items`, { query });
  },

  async updateTweakStatus(tweakItemId: ID, payload: UpdateTweakStatusPayload): Promise<TweakItem> {
    return http<TweakItem>(`/tweak-items/${tweakItemId}`, {
      method: 'PATCH',
      body: payload,
    });
  },
};
