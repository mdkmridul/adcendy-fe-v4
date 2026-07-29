import type { WeeklySubmission, WeeklyProcessingRun, DerivedMetricsSummary, Anomaly, TweakRun, TweakItem, UpsertWeeklySubmissionPayload, UpdateTweakStatusPayload } from '@/shared/types/weekly';
import type { ID } from '@/shared/types/common';
import { weeklyMockAdapter } from '../mock/weekly.mock';
import { weeklyRealAdapter } from '../real/weekly.real';

import ENV from '@/lib/env';

// Route to mock or real adapter based on DATA_SOURCE environment variable
const adapter = ENV.API.isMock ? weeklyMockAdapter : weeklyRealAdapter;

// Log adapter selection in development
if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Weekly Repository] Using adapter:', ENV.API.dataSource);
}

export const weeklyRepository = {
  async upsertSubmission(
    campaignId: ID,
    weekStart: string,
    payload: UpsertWeeklySubmissionPayload
  ): Promise<{ weeklySubmission: WeeklySubmission; processingRunId: ID }> {
    return adapter.upsertSubmission(campaignId, weekStart, payload);
  },

  async listSubmissions(campaignId: ID): Promise<WeeklySubmission[]> {
    return adapter.listSubmissions(campaignId);
  },

  async getWeeklySubmission(campaignId: ID, weekStart: string): Promise<WeeklySubmission | null> {
    return adapter.getWeeklySubmission(campaignId, weekStart);
  },

  async getProcessingRun(processingRunId: ID): Promise<WeeklyProcessingRun> {
    return adapter.getProcessingRun(processingRunId);
  },

  async getDerivedSummary(campaignId: ID, weekStart: string): Promise<DerivedMetricsSummary> {
    return adapter.getDerivedSummary(campaignId, weekStart);
  },

  async listAnomalies(campaignId: ID, weekStart?: string): Promise<Anomaly[]> {
    return adapter.listAnomalies(campaignId, weekStart);
  },

  async startTweakRun(campaignId: ID, weekStart: string): Promise<{ tweakRunId: ID }> {
    return adapter.startTweakRun(campaignId, weekStart);
  },

  async getTweakRun(campaignId: ID, weekStart: string): Promise<TweakRun | null> {
    return adapter.getTweakRun(campaignId, weekStart);
  },

  async getTweakRunById(tweakRunId: ID): Promise<TweakRun> {
    return adapter.getTweakRunById(tweakRunId);
  },

  async listTweaks(tweakRunId: ID, visibility?: 'ALL' | 'APPROVED_ONLY'): Promise<TweakItem[]> {
    return adapter.listTweaks(tweakRunId, visibility ?? 'ALL');
  },

  async updateTweakStatus(tweakItemId: ID, payload: UpdateTweakStatusPayload): Promise<TweakItem> {
    return adapter.updateTweakStatus(tweakItemId, payload);
  },

  async approveTweak(tweakItemId: ID, note?: string): Promise<TweakItem> {
    return adapter.updateTweakStatus(tweakItemId, { status: 'APPROVED', reviewerNote: note });
  },

  async rejectTweak(tweakItemId: ID, note: string): Promise<TweakItem> {
    return adapter.updateTweakStatus(tweakItemId, { status: 'REJECTED', reviewerNote: note });
  },
};
