import type {
  FinalizeStrategyReviewPayload,
  StrategyReviewDetail,
  StrategyReviewInboxItem,
  UpdateStrategyReviewSectionPayload,
} from '@/shared/types/reviews';

const mockReviews: StrategyReviewDetail[] = [
  {
    id: 'review-001',
    campaignId: 'campaign-001',
    campaignTitle: 'SaaS Product Launch',
    status: 'PENDING_REVIEW',
    assignedReviewer: {
      id: 'reviewer-001',
      email: 'reviewer@adcendy.com',
      displayName: 'Primary Reviewer',
      role: 'REVIEWER',
    },
    requestedChangesNote: null,
    summaryNote: null,
    approvedAt: null,
    updatedAt: new Date().toISOString(),
    deliverables: [
      { key: 'onboarding_deliverables', label: 'Onboarding Deliverables', status: 'READY' },
      { key: 'strategy_document', label: 'Strategy Document', status: 'PENDING_REVIEW' },
      { key: 'execution_kit', label: 'Execution Kit', status: 'PENDING_REVIEW' },
    ],
    sections: [
      {
        callType: 'CUSTOMER_PERSONAS',
        title: 'Customer Personas',
        content: [
          'Primary buyer: growth-focused B2B marketing lead',
          'Pain point: inconsistent pipeline from existing channels',
        ],
        status: 'PENDING_REVIEW',
        note: null,
        decision: 'PENDING',
        deliverableKey: 'strategy_document',
        updatedAt: new Date().toISOString(),
      },
      {
        callType: 'CHANNEL_PRIORITIES',
        title: 'Channel Priorities',
        content: 'Focus acquisition on search, comparison content, and partner co-marketing.',
        status: 'PENDING_REVIEW',
        note: null,
        decision: 'PENDING',
        deliverableKey: 'execution_kit',
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

const regenerationByCampaign = new Map<string, number>();

async function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cloneReview(review: StrategyReviewDetail): StrategyReviewDetail {
  return JSON.parse(JSON.stringify(review)) as StrategyReviewDetail;
}

function findReview(campaignId: string): StrategyReviewDetail {
  const review = mockReviews.find((entry) => entry.campaignId === campaignId);
  if (!review) {
    throw new Error(`Strategy review for campaign ${campaignId} not found`);
  }

  return review;
}

function setActiveReviewState(review: StrategyReviewDetail) {
  review.status = 'IN_REVIEW';
  review.updatedAt = new Date().toISOString();
  review.deliverables = review.deliverables.map((deliverable) => ({
    ...deliverable,
    status:
      deliverable.status === 'PENDING_REVIEW' || deliverable.status === 'REGENERATING'
        ? 'IN_REVIEW'
        : deliverable.status,
  }));
  review.sections = review.sections.map((section) => ({
    ...section,
    status:
      section.status === 'PENDING_REVIEW' || section.status === 'CHANGES_REQUESTED'
        ? 'IN_REVIEW'
        : section.status,
    decision: section.decision === 'REQUEST_CHANGES' ? 'PENDING' : section.decision,
    updatedAt: new Date().toISOString(),
  }));
}

function advanceMockWorkflow(review: StrategyReviewDetail) {
  const dueAt = regenerationByCampaign.get(review.campaignId);
  if (!dueAt || Date.now() < dueAt) {
    return;
  }

  setActiveReviewState(review);
  regenerationByCampaign.delete(review.campaignId);
}

export const strategyReviewMockAdapter = {
  async listAssignedReviews(): Promise<StrategyReviewInboxItem[]> {
    await delay();
    mockReviews.forEach(advanceMockWorkflow);

    return mockReviews.map((review) => ({
      id: review.id,
      campaignId: review.campaignId,
      campaignTitle: review.campaignTitle ?? review.campaignId,
      status: review.status,
      requestedChangesNote: review.requestedChangesNote ?? null,
      approvedAt: review.approvedAt ?? null,
      updatedAt: review.updatedAt ?? null,
      assignedReviewer: review.assignedReviewer ?? null,
    }));
  },

  async getStrategyReview(campaignId: string): Promise<StrategyReviewDetail> {
    await delay(150);
    const review = findReview(campaignId);
    advanceMockWorkflow(review);
    return cloneReview(review);
  },

  async startStrategyReview(campaignId: string): Promise<StrategyReviewDetail> {
    await delay(150);
    const review = findReview(campaignId);
    setActiveReviewState(review);
    return cloneReview(review);
  },

  async updateSectionDecision(
    campaignId: string,
    callType: string,
    payload: UpdateStrategyReviewSectionPayload,
  ): Promise<StrategyReviewDetail> {
    await delay(150);
    const review = findReview(campaignId);
    const section = review.sections.find((entry) => entry.callType === callType);

    if (!section) {
      throw new Error(`Section ${callType} not found`);
    }

    section.decision = payload.decision;
    section.note = payload.note ?? null;
    section.status = payload.decision === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED';
    section.updatedAt = new Date().toISOString();
    review.status = payload.decision === 'APPROVED' ? 'IN_REVIEW' : 'CHANGES_REQUESTED';
    review.updatedAt = new Date().toISOString();

    if (payload.decision === 'REQUEST_CHANGES') {
      review.requestedChangesNote = payload.note ?? review.requestedChangesNote ?? null;
      regenerationByCampaign.set(review.campaignId, Date.now() + 300);
      review.deliverables = review.deliverables.map((deliverable) => ({
        ...deliverable,
        status:
          deliverable.key === section.deliverableKey ? 'REGENERATING' : deliverable.status,
      }));
    }

    return cloneReview(review);
  },

  async finalizeStrategyReview(
    campaignId: string,
    payload: FinalizeStrategyReviewPayload,
  ): Promise<StrategyReviewDetail> {
    await delay(150);
    const review = findReview(campaignId);
    review.summaryNote = payload.summaryNote ?? null;
    review.requestedChangesNote = payload.requestedChangesNote ?? null;
    review.status = payload.action === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED';
    review.approvedAt = payload.action === 'APPROVE' ? new Date().toISOString() : null;
    review.updatedAt = new Date().toISOString();
    if (payload.action === 'APPROVE') {
      review.deliverables = review.deliverables.map((deliverable) => ({
        ...deliverable,
        status: 'APPROVED',
      }));
    } else {
      regenerationByCampaign.set(review.campaignId, Date.now() + 300);
      review.deliverables = review.deliverables.map((deliverable) => ({
        ...deliverable,
        status: deliverable.key === 'strategy_document' || deliverable.key === 'execution_kit'
          ? 'REGENERATING'
          : deliverable.status,
      }));
    }
    return cloneReview(review);
  },
};
