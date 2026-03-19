import type {
  AdminAiCallSummary,
  AdminJobRunSummary,
  AdminReviewerUser,
  CreateReviewerPayload,
} from '@/shared/types/reviews';
import type { CampaignStatus } from '@/shared/types/campaign';
import type { components } from '@/src/generated/openapi';

type AdminUserUpdateDto = components['schemas']['AdminUserUpdateDto'];
type AdminCampaignSummaryDto = components['schemas']['AdminCampaignSummaryDto'];
type AdminCampaignDetailResponseDto = components['schemas']['AdminCampaignDetailResponseDto'];
type AdminCampaignRefreshResponseDto = components['schemas']['AdminCampaignRefreshResponseDto'];
type AiCallDetailDto = components['schemas']['AiCallDetailDto'];

const reviewerState: AdminReviewerUser[] = [
  {
    id: 'reviewer-001',
    email: 'reviewer@adcendy.com',
    displayName: 'Primary Reviewer',
    role: 'REVIEWER',
    status: 'ACTIVE',
    createdAt: new Date('2026-02-10T09:00:00.000Z').toISOString(),
    lastLoginAt: new Date('2026-03-15T10:30:00.000Z').toISOString(),
  },
];

const jobRuns: AdminJobRunSummary[] = [
  {
    id: 'job-001',
    jobName: 'strategy.review.regeneration',
    queueName: 'strategy-review',
    status: 'ACTIVE',
    attemptsMade: 1,
    lastErrorMessage: null,
    createdAt: new Date('2026-03-16T08:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-03-16T08:03:00.000Z').toISOString(),
    logsCount: 4,
  },
];

const aiCalls: AdminAiCallSummary[] = [
  {
    id: 'ai-001',
    requestId: 'req-001',
    provider: 'openai',
    operation: 'CHAT',
    model: 'gpt-5',
    status: 'SUCCEEDED',
    totalTokens: 4821,
    cost: 0.23,
    startedAt: new Date('2026-03-16T07:54:00.000Z').toISOString(),
    finishedAt: new Date('2026-03-16T07:54:04.000Z').toISOString(),
    errorMessage: null,
  },
];

const adminCampaigns: AdminCampaignSummaryDto[] = [
  {
    id: 'campaign-001',
    title: 'Spring Launch Campaign',
    status: 'ACTIVE',
    ownerId: 'user-001',
    ownerEmail: 'owner@adcendy.com',
    createdAt: new Date('2026-02-01T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-03-16T08:00:00.000Z').toISOString(),
  },
];

async function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const adminReviewMockAdapter = {
  async createReviewer(payload: CreateReviewerPayload): Promise<AdminReviewerUser> {
    await delay(200);
    const reviewer: AdminReviewerUser = {
      id: `reviewer-${Date.now()}`,
      email: payload.email,
      displayName: payload.displayName ?? null,
      role: 'REVIEWER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    reviewerState.unshift(reviewer);
    return reviewer;
  },

  async listReviewers(params?: { q?: string }): Promise<AdminReviewerUser[]> {
    await delay(150);
    const query = params?.q?.trim().toLowerCase();
    if (!query) {
      return reviewerState;
    }

    return reviewerState.filter((reviewer) =>
      [reviewer.email, reviewer.displayName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  },

  async updateReviewerStatus(
    reviewerId: string,
    payload: AdminUserUpdateDto,
  ): Promise<AdminReviewerUser | null> {
    await delay(150);
    const reviewer = reviewerState.find((entry) => entry.id === reviewerId) ?? null;
    if (!reviewer) {
      return null;
    }

    reviewer.status = payload.status;
    return reviewer;
  },

  async listAdminCampaigns(params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: CampaignStatus;
  }): Promise<AdminCampaignSummaryDto[]> {
    await delay(180);
    const query = params?.q?.trim().toLowerCase();
    return adminCampaigns.filter((campaign) => {
      if (params?.status && campaign.status !== params.status) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [campaign.title, campaign.ownerEmail].join(' ').toLowerCase().includes(query);
    });
  },

  async getAdminCampaignDetail(campaignId: string, _includeRaw?: string): Promise<AdminCampaignDetailResponseDto> {
    await delay(180);
    const campaign = adminCampaigns.find((entry) => entry.id === campaignId) ?? adminCampaigns[0];

    return {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        businessType: 'SAAS',
        businessModel: 'B2B',
        marketScope: 'NATIONAL',
        websiteUrl: {},
        description: {},
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        owner: {
          id: campaign.ownerId,
          email: campaign.ownerEmail,
        },
      } as unknown as AdminCampaignDetailResponseDto['campaign'],
      wizard: {
        status: 'IN_PROGRESS',
        lastCompletedStep: 5,
        version: 2,
        updatedAt: new Date('2026-03-15T13:00:00.000Z').toISOString(),
        derivedJson: {
          onboardingDeliverables: 'READY',
          strategyDocument: 'IN_REVIEW',
          executionKit: 'IN_REVIEW',
        },
      },
      latestRun: null,
    };
  },

  async refreshAdminCampaignIntelligence(
    _campaignId: string,
    _force?: boolean,
  ): Promise<AdminCampaignRefreshResponseDto> {
    await delay(200);
    return {
      results: {},
    };
  },

  async listJobRunsByEntity(_params?: {
    entityType: string;
    entityId: string;
    limit?: number;
  }): Promise<AdminJobRunSummary[]> {
    await delay(120);
    return jobRuns;
  },

  async listAiCalls(_params?: {
    userId?: string;
    campaignId?: string;
    entityType?: string;
    entityId?: string;
    status?: string;
    operation?: string;
    model?: string;
    limit?: number;
    page?: number;
    days?: number;
  }): Promise<AdminAiCallSummary[]> {
    await delay(120);
    return aiCalls;
  },

  async getAiCallDetail(callId: string): Promise<AiCallDetailDto> {
    await delay(120);
    const call = aiCalls.find((entry) => entry.id === callId) ?? aiCalls[0];

    return {
      id: call.id,
      requestId: call.requestId ?? undefined,
      provider: call.provider ?? undefined,
      operation: call.operation as AiCallDetailDto['operation'],
      model: call.model,
      status: call.status as AiCallDetailDto['status'],
      startedAt: call.startedAt,
      finishedAt: undefined,
      totalTokens: undefined,
      cost: undefined,
      errorMessage: undefined,
      metaJson: {
        source: 'mock',
      },
    };
  },
};
