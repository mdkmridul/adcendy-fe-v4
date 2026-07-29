import { http } from '../index';
import type { ApiResponse } from '../types';
import type {
  StrategyRun,
  StrategyVersion,
  SubmitStrategyFeedbackPayload,
} from '@/shared/types/strategy';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function unwrap(value: unknown): Record<string, unknown> {
  const root = asRecord(value);
  return asRecord(root.data ?? root);
}

function toRun(
  value: unknown,
  fallbackCampaignId: string,
  fallbackId: string,
): StrategyRun {
  const item = unwrap(value);
  const id =
    (typeof item.id === 'string' && item.id) ||
    (typeof item.runId === 'string' && item.runId) ||
    fallbackId;

  return {
    id,
    campaignId:
      typeof item.campaignId === 'string' ? item.campaignId : fallbackCampaignId,
    status:
      item.status === 'QUEUED' ||
      item.status === 'RUNNING' ||
      item.status === 'SUCCEEDED' ||
      item.status === 'FAILED'
        ? item.status
        : 'QUEUED',
    createdAt:
      typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    updatedAt:
      typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
    errorMessage: typeof item.errorMessage === 'string' ? item.errorMessage : null,
  };
}

function toVersion(
  value: unknown,
  fallbackCampaignId: string,
  fallbackId: string,
): StrategyVersion {
  const item = unwrap(value);
  const sections = Array.isArray(item.sections)
    ? item.sections
    : Array.isArray(asRecord(item.outputJson).sections)
      ? (asRecord(item.outputJson).sections as unknown[])
      : [];

  return {
    id:
      (typeof item.id === 'string' && item.id) ||
      (typeof item.runId === 'string' && item.runId) ||
      fallbackId,
    campaignId:
      typeof item.campaignId === 'string' ? item.campaignId : fallbackCampaignId,
    version: typeof item.version === 'number' ? item.version : 1,
    createdAt:
      typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    sections: sections.map((entry, index) => {
      const section = asRecord(entry);
      return {
        key: typeof section.key === 'string' ? section.key : `section-${index + 1}`,
        title: typeof section.title === 'string' ? section.title : `Section ${index + 1}`,
        content: section.content ?? section,
      };
    }),
  };
}

export const strategyRealAdapter = {
  async startRun(campaignId: string): Promise<{ strategyRunId: string }> {
    const response = await http<ApiResponse<Record<string, unknown>>>(
      `/v1/campaigns/${campaignId}/strategy/generate`,
      { method: 'POST' },
    );
    const data = unwrap(response);
    const strategyRunId =
      (typeof data.strategyRunId === 'string' && data.strategyRunId) ||
      (typeof data.runId === 'string' && data.runId);
    if (!strategyRunId) {
      throw new Error('Strategy start response did not include a run ID.');
    }
    return { strategyRunId };
  },

  async getRun(campaignId: string, id: string): Promise<StrategyRun> {
    const response = await http<unknown>(
      `/v1/campaigns/${campaignId}/strategy/runs/${id}`,
    );
    return toRun(response, campaignId, id);
  },

  async listVersions(campaignId: string): Promise<StrategyVersion[]> {
    const response = await http<unknown>(`/v1/campaigns/${campaignId}/strategy/runs`);
    const data = unwrap(response);
    const items = Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.runs)
        ? data.runs
        : [];
    return items.map((item, index) =>
      toVersion(item, campaignId, `${campaignId}-${index + 1}`),
    );
  },

  async getLatest(campaignId: string): Promise<StrategyVersion> {
    const response = await http<unknown>(`/v1/campaigns/${campaignId}/strategy/latest`);
    return toVersion(response, campaignId, `${campaignId}-latest`);
  },

  async getVersion(
    campaignId: string,
    strategyVersionId: string,
  ): Promise<StrategyVersion> {
    const response = await http<unknown>(
      `/v1/campaigns/${campaignId}/strategy/runs/${strategyVersionId}`,
    );
    return toVersion(response, campaignId, strategyVersionId);
  },

  async submitFeedback(
    campaignId: string,
    strategyVersionId: string,
    payload: SubmitStrategyFeedbackPayload,
  ): Promise<void> {
    await http(
      `/v1/campaigns/${campaignId}/strategy/runs/${strategyVersionId}/feedback`,
      {
        method: 'POST',
        body: payload,
      },
    );
  },
};
