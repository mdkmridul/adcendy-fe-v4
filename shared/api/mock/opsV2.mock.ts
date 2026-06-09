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

async function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const nowIso = () => new Date().toISOString();

const mockCampaignOverviews: CampaignOverviewV2[] = [
  {
    id: 'cmp-v2-001',
    title: 'North Star CRM Expansion',
    status: 'SUBMITTED_FOR_REVIEW',
    currentStep: 7,
    primaryUrl: 'https://northstarcrm.example.com',
    description: 'B2B SaaS GTM strategy for US + UK expansion.',
    marketLocation: 'United States',
    marketLocations: ['United States', 'United Kingdom'],
    v2FocusName: 'SMB sales automation',
    v2IndustryCategory: 'B2B SaaS',
    v2PrimaryGoal: 'lead_generation',
    v2TargetMarkets: ['United States', 'United Kingdom'],
    v2PrimaryMarket: 'United States',
    updatedAt: '2026-05-16T09:12:00.000Z',
    pipelineRunId: 'run-v2-1001',
    latestRunStatus: 'SUCCEEDED',
  },
  {
    id: 'cmp-v2-002',
    title: 'FitPlus D2C Launch',
    status: 'STRATEGY_GENERATION',
    currentStep: 7,
    primaryUrl: 'https://fitplus.example.com',
    description: 'D2C wellness product launch plan.',
    marketLocation: 'India',
    marketLocations: ['India'],
    v2FocusName: 'Daily wellness bundle',
    v2IndustryCategory: 'Health & Fitness',
    v2PrimaryGoal: 'revenue_growth',
    v2TargetMarkets: ['India'],
    v2PrimaryMarket: 'India',
    reviewErrorCode: null,
    reviewErrorMessage: null,
    reviewErrorAt: null,
    updatedAt: '2026-05-17T08:10:00.000Z',
    pipelineRunId: 'run-v2-1002',
    latestRunStatus: 'RUNNING',
  },
  {
    id: 'cmp-v2-003',
    title: 'OpsPilot Early Draft',
    status: 'WIZARD_DRAFT',
    currentStep: 3,
    marketLocation: 'Canada',
    marketLocations: ['Canada'],
    v2FocusName: 'Operations planning assistant',
    v2IndustryCategory: 'Productivity Tools',
    v2PrimaryGoal: 'awareness',
    v2TargetMarkets: ['Canada'],
    v2PrimaryMarket: 'Canada',
    updatedAt: '2026-05-15T14:42:00.000Z',
  },
];

const mockReviewerTasks: ReviewerTaskDetail[] = [
  {
    id: 'rt-001',
    status: 'PENDING',
    clientName: 'FitPlus',
    pipelineRunId: 'run-v2-1002',
    marketId: 'market-india',
    campaignId: 'cmp-v2-002',
    campaignTitle: 'FitPlus D2C Launch',
    campaignStatus: 'STRATEGY_GENERATION',
    currentStep: 7,
    runStatus: 'RUNNING',
    currentPhase: 'INTELLIGENCE_REVIEW',
    renderedQuestion: 'Is the brand site source reliable enough to proceed?',
    createdAt: '2026-05-17T07:50:00.000Z',
    updatedAt: '2026-05-17T08:05:00.000Z',
    attemptNumber: 1,
    answerSchema: {
      type: 'object',
      properties: {
        isReliable: { type: 'boolean' },
        rationale: { type: 'string' },
      },
      required: ['isReliable', 'rationale'],
    },
    resumeStrategy: {
      mode: 'targeted',
      nextPhases: ['SIGNAL_SYNTHESIS', 'SECTION_GENERATION'],
    },
    questionPayload: {
      sourceDomain: 'fitplus.example.com',
      confidenceScore: 0.62,
      whatWentWrong: 'Low confidence taxonomy classification.',
      currentValuesToFix: { product_type: 'uncertain' },
      exampleAnswerPayload: { confirmedTaxonomyValues: { product_type: 'sauce' } },
      whereAnswerWillBeApplied: ['taxonomy_classification_v2', 'dependent_phases'],
      pipelineRestartPhase: 'taxonomy_classification_v2',
    },
    market: { id: 'market-india', name: 'India' },
    audience: { segment: 'Urban fitness buyers' },
  },
  {
    id: 'rt-002',
    status: 'PENDING',
    clientName: 'North Star CRM',
    pipelineRunId: 'run-v2-1001',
    marketId: 'market-us',
    campaignId: 'cmp-v2-001',
    campaignTitle: 'North Star CRM Expansion',
    campaignStatus: 'SUBMITTED_FOR_REVIEW',
    currentStep: 7,
    runStatus: 'SUCCEEDED',
    currentPhase: 'REVIEW_QUEUE',
    renderedQuestion: 'Confirm if competitor dataset excludes outdated entries.',
    createdAt: '2026-05-16T09:20:00.000Z',
    updatedAt: '2026-05-16T09:35:00.000Z',
    attemptNumber: 1,
    answerSchema: {
      type: 'object',
      properties: {
        approveDataset: { type: 'boolean' },
        note: { type: 'string' },
      },
      required: ['approveDataset'],
    },
    resumeStrategy: {
      mode: 'continue',
      nextPhases: ['SECTION_REVIEW_GATE'],
    },
    questionPayload: { records: 128, staleRecordRatio: 0.04 },
    market: { id: 'market-us', name: 'United States' },
    audience: { segment: 'SMB sales teams' },
  },
];

const mockSectionReviewDetails: Record<string, SectionReviewDetail> = {
  'sr-001': {
    id: 'sr-001',
    status: 'PENDING',
    pipelineRunId: 'run-v2-1001',
    marketId: 'market-us',
    campaignId: 'cmp-v2-001',
    campaignTitle: 'North Star CRM Expansion',
    campaignStatus: 'SUBMITTED_FOR_REVIEW',
    currentStep: 7,
    runStatus: 'SUCCEEDED',
    sectionId: 'audience_insights',
    sectionTitle: 'Audience Insights',
    revisionCount: 1,
    latestRevisionSummary: 'Need tighter ICP segmentation detail.',
    createdAt: '2026-05-16T09:45:00.000Z',
    updatedAt: '2026-05-16T10:12:00.000Z',
    renderedQuestion: 'Does the section satisfy specificity and anti-redundancy constraints?',
    answerSchema: {
      type: 'object',
      properties: {
        accept: { type: 'boolean' },
        note: { type: 'string' },
      },
      required: ['accept'],
    },
    sectionContent: {
      title: 'Audience Insights',
      bullets: [
        'Primary ICP: 10-50 seat SMB with founder-led sales.',
        'Highest urgency in pipeline visibility and rep ramp-time.',
      ],
    },
    generationValidationStatus: 'PASSED_WITH_WARNINGS',
    outputConstraintOutcome: 'PASS',
    redundancyOutcome: 'MINOR_OVERLAP',
    revisionRequests: [
      {
        id: 'rr-001',
        instruction: 'Add segment-level objections and buying triggers.',
        reviewerNotes: 'Need explicit objections per segment.',
        status: 'APPLIED',
        createdAt: '2026-05-16T09:58:00.000Z',
        updatedAt: '2026-05-16T10:05:00.000Z',
      },
    ],
    approvalGate: {
      selectedSectionCount: 6,
      approvedSectionCount: 4,
      outputAssemblyBlocked: true,
    },
  },
  'sr-002': {
    id: 'sr-002',
    status: 'PENDING',
    pipelineRunId: 'run-v2-1002',
    marketId: 'market-india',
    campaignId: 'cmp-v2-002',
    campaignTitle: 'FitPlus D2C Launch',
    campaignStatus: 'STRATEGY_GENERATION',
    currentStep: 7,
    runStatus: 'RUNNING',
    sectionId: 'channel_mix',
    sectionTitle: 'Channel Mix',
    revisionCount: 0,
    latestRevisionSummary: null,
    createdAt: '2026-05-17T08:07:00.000Z',
    updatedAt: '2026-05-17T08:20:00.000Z',
    renderedQuestion: 'Are channel recommendations aligned with budget and conversion path?',
    answerSchema: {
      type: 'object',
      properties: {
        approve: { type: 'boolean' },
        reason: { type: 'string' },
      },
      required: ['approve'],
    },
    sectionContent: {
      title: 'Channel Mix',
      paragraphs: [
        'Prioritize Instagram reels and WhatsApp re-engagement in first 30 days.',
      ],
    },
    generationValidationStatus: 'PENDING',
    outputConstraintOutcome: 'PENDING',
    redundancyOutcome: 'PENDING',
    revisionRequests: [],
    approvalGate: {
      selectedSectionCount: 5,
      approvedSectionCount: 1,
      outputAssemblyBlocked: true,
    },
  },
};

const mockWorkspaceInputsByRun: Record<string, unknown> = {
  'run-v2-1001': {
    businessContext: {
      website: 'https://northstarcrm.example.com',
      category: 'B2B SaaS',
      targetMarkets: ['United States', 'United Kingdom'],
    },
    offer: {
      focusProduct: 'SMB sales automation',
      primaryGoal: 'lead_generation',
    },
    audience: {
      primarySegment: 'Founder-led SMB sales teams (10-50 seats)',
      buyingCommittee: ['Founder', 'Head of Sales'],
    },
  },
  'run-v2-1002': {
    businessContext: {
      website: 'https://fitplus.example.com',
      category: 'Health & Fitness',
      targetMarkets: ['India'],
    },
    offer: {
      focusProduct: 'Daily wellness bundle',
      primaryGoal: 'revenue_growth',
    },
    audience: {
      primarySegment: 'Urban fitness buyers',
      ageRange: '22-40',
    },
  },
};

const mockStartedRuns = new Set<string>();

function getSectionReviewList(): SectionReviewItem[] {
  return Object.values(mockSectionReviewDetails).map((detail) => ({
    id: detail.id,
    status: detail.status,
    pipelineRunId: detail.pipelineRunId ?? null,
    marketId: detail.marketId ?? null,
    campaignId: detail.campaignId ?? null,
    campaignTitle: detail.campaignTitle ?? null,
    campaignStatus: detail.campaignStatus ?? null,
    currentStep: detail.currentStep ?? null,
    runStatus: detail.runStatus ?? null,
    sectionId: detail.sectionId ?? null,
    sectionTitle: detail.sectionTitle ?? null,
    revisionCount: detail.revisionCount ?? null,
    latestRevisionSummary: detail.latestRevisionSummary ?? null,
    createdAt: detail.createdAt ?? null,
    updatedAt: detail.updatedAt ?? null,
  }));
}

function getSectionWorkspace(runId: string): SectionReviewWorkspaceDetail {
  const sections = Object.values(mockSectionReviewDetails)
    .filter((detail) => detail.pipelineRunId === runId)
    .map((detail) => ({
      ...detail,
      sectionReviewTaskId: detail.id,
    }));

  const primary = sections[0];

  return {
    runId,
    status: mockStartedRuns.has(runId) ? 'IN_REVIEW' : 'PENDING_REVIEW',
    campaignId: primary?.campaignId ?? null,
    campaignTitle: primary?.campaignTitle ?? null,
    campaignStatus: primary?.campaignStatus ?? null,
    marketId: primary?.marketId ?? null,
    reviewerId: mockStartedRuns.has(runId) ? 'reviewer-mock-001' : null,
    reviewerName: mockStartedRuns.has(runId) ? 'Mock Reviewer' : null,
    reviewerEmail: mockStartedRuns.has(runId) ? 'reviewer@adcendy.com' : null,
    startedAt: mockStartedRuns.has(runId) ? nowIso() : null,
    updatedAt: nowIso(),
    inputs: mockWorkspaceInputsByRun[runId] ?? null,
    sections,
  };
}

const mockCampaignHealth: CampaignHealthItem[] = [
  {
    campaignId: 'cmp-v2-001',
    campaignTitle: 'North Star CRM Expansion',
    campaignStatus: 'SUBMITTED_FOR_REVIEW',
    currentStep: 7,
    pipelineRunId: 'run-v2-1001',
    latestRunStatus: 'SUCCEEDED',
    currentPhase: 'REVIEW_QUEUE',
    stuckState: 'NO',
    stuckPhaseName: null,
    stuckReason: null,
    stuckSince: null,
    hasError: false,
    errorSource: null,
    errorMessage: null,
    errorAt: null,
    updatedAt: '2026-05-16T10:12:00.000Z',
  },
  {
    campaignId: 'cmp-v2-002',
    campaignTitle: 'FitPlus D2C Launch',
    campaignStatus: 'STRATEGY_GENERATION',
    currentStep: 7,
    pipelineRunId: 'run-v2-1002',
    latestRunStatus: 'RUNNING',
    currentPhase: 'INTELLIGENCE_REVIEW',
    stuckState: 'YES',
    stuckPhaseName: 'INTELLIGENCE_REVIEW',
    stuckReason: 'Awaiting reviewer task response',
    stuckSince: '2026-05-17T08:05:00.000Z',
    hasError: false,
    errorSource: null,
    errorMessage: null,
    errorAt: null,
    updatedAt: '2026-05-17T08:20:00.000Z',
  },
];

const mockRunEvents: Record<string, RunTelemetryEvent[]> = {
  'run-v2-1001': [
    {
      id: 'ev-1001-1',
      runId: 'run-v2-1001',
      phaseName: 'INTAKE',
      eventType: 'PHASE_STARTED',
      status: 'RUNNING',
      message: 'Intake phase started.',
      createdAt: '2026-05-16T09:10:00.000Z',
      payload: null,
    },
    {
      id: 'ev-1001-2',
      runId: 'run-v2-1001',
      phaseName: 'SECTION_REVIEW_GATE',
      eventType: 'PHASE_COMPLETED',
      status: 'SUCCEEDED',
      message: 'Section review gate queued.',
      createdAt: '2026-05-16T10:00:00.000Z',
      payload: null,
    },
  ],
  'run-v2-1002': [
    {
      id: 'ev-1002-1',
      runId: 'run-v2-1002',
      phaseName: 'INTELLIGENCE_REVIEW',
      eventType: 'TASK_BLOCKED',
      status: 'RUNNING',
      message: 'Blocked on reviewer task rt-001.',
      createdAt: '2026-05-17T08:06:00.000Z',
      payload: { taskId: 'rt-001' },
    },
  ],
};

const mockRunRollups: Record<string, RunTelemetryPhaseRollup[]> = {
  'run-v2-1001': [
    {
      phaseName: 'INTAKE',
      status: 'SUCCEEDED',
      attempts: 1,
      startedAt: '2026-05-16T09:10:00.000Z',
      completedAt: '2026-05-16T09:14:00.000Z',
      durationMs: 240000,
    },
    {
      phaseName: 'SECTION_REVIEW_GATE',
      status: 'SUCCEEDED',
      attempts: 1,
      startedAt: '2026-05-16T09:55:00.000Z',
      completedAt: '2026-05-16T10:00:00.000Z',
      durationMs: 300000,
    },
  ],
  'run-v2-1002': [
    {
      phaseName: 'INTELLIGENCE_REVIEW',
      status: 'RUNNING',
      attempts: 1,
      startedAt: '2026-05-17T08:00:00.000Z',
      completedAt: null,
      durationMs: null,
      errorMessage: null,
    },
  ],
};

const mockRunAggregates: Record<string, RunTelemetryAggregate> = {
  'run-v2-1001': {
    runId: 'run-v2-1001',
    status: 'SUCCEEDED',
    currentPhase: 'COMPLETED',
    startedAt: '2026-05-16T09:10:00.000Z',
    completedAt: '2026-05-16T10:04:00.000Z',
    durationMs: 3240000,
    totalPhases: 8,
    completedPhases: 8,
    failedPhases: 0,
    blockedPhases: 0,
    summary: null,
  },
  'run-v2-1002': {
    runId: 'run-v2-1002',
    status: 'RUNNING',
    currentPhase: 'INTELLIGENCE_REVIEW',
    startedAt: '2026-05-17T08:00:00.000Z',
    completedAt: null,
    durationMs: null,
    totalPhases: 8,
    completedPhases: 4,
    failedPhases: 0,
    blockedPhases: 1,
    summary: null,
  },
};

function applyOpsFilters<T extends { status?: string | null; pipelineRunId?: string | null; marketId?: string | null; createdAt?: string | null; updatedAt?: string | null }>(
  items: T[],
  filters?: OpsListFilters,
) {
  const filtered = items.filter((item) => {
    if (filters?.status && (item.status ?? '').toUpperCase() !== filters.status.toUpperCase()) {
      return false;
    }

    if (filters?.pipelineRunId && item.pipelineRunId !== filters.pipelineRunId) {
      return false;
    }

    if (filters?.marketId && item.marketId !== filters.marketId) {
      return false;
    }

    return true;
  });

  const sortBy = filters?.sortBy ?? 'updatedAt';
  const sortOrder = filters?.sortOrder ?? 'desc';

  filtered.sort((left, right) => {
    const leftValue = left[sortBy] ?? '';
    const rightValue = right[sortBy] ?? '';
    const compare = `${leftValue}`.localeCompare(`${rightValue}`);
    return sortOrder === 'asc' ? compare : -compare;
  });

  if (filters?.limit && filters.limit > 0) {
    return filtered.slice(0, filters.limit);
  }

  return filtered;
}

export const opsV2MockAdapter = {
  async listCampaignOverviews(): Promise<CampaignOverviewV2[]> {
    await delay();
    return mockCampaignOverviews;
  },

  async getWizardState(campaignId: string): Promise<Record<string, unknown>> {
    await delay(120);
    return {
      campaignId,
      status: 'in_progress',
      version: 2,
      lastCompletedStep: 7,
      updatedAt: nowIso(),
      steps: {
        step1: { title: 'Sample', sourceType: 'website' },
      },
    };
  },

  async getWizardOptions(): Promise<Record<string, unknown>> {
    await delay(120);
    return {
      wizardVersion: 'v2',
      fieldOptions: {},
      stepDefinitions: [],
    };
  },

  async patchWizardStep(_stepNumber: number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    await delay(140);
    return {
      ok: true,
      payload,
      updatedAt: nowIso(),
    };
  },

  async commitWizard(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    await delay(160);
    return {
      commitAccepted: true,
      generationTriggered: true,
      payload,
      updatedAt: nowIso(),
    };
  },

  async listReviewerTasks(filters?: OpsListFilters): Promise<ReviewerTaskItem[]> {
    await delay();
    return applyOpsFilters(mockReviewerTasks, filters);
  },

  async getReviewerTask(taskId: string): Promise<ReviewerTaskDetail> {
    await delay();
    return (
      mockReviewerTasks.find((task) => task.id === taskId) ?? {
        id: taskId,
        status: 'UNKNOWN',
      }
    );
  },

  async respondReviewerTask(taskId: string, _payload: ReviewerTaskRespondPayload): Promise<ReviewerTaskRespondResult> {
    await delay(220);
    const task = mockReviewerTasks.find((item) => item.id === taskId);
    if (task) {
      task.status = 'ANSWERED';
      task.updatedAt = nowIso();
      task.runStatus = 'RUNNING';
      task.currentPhase = 'SECTION_REVIEW_GATE';
    }

    return {
      resumeOutcome: 'RESUMED',
      resumedPhases: ['SIGNAL_SYNTHESIS', 'SECTION_REVIEW_GATE'],
      updatedTask: task ?? null,
    };
  },

  async listSectionReviews(filters?: OpsListFilters): Promise<SectionReviewItem[]> {
    await delay();
    return applyOpsFilters(getSectionReviewList(), filters);
  },

  async listSectionReviewsByRun(runId: string, filters?: { status?: string; marketId?: string; limit?: number }): Promise<SectionReviewItem[]> {
    await delay();
    const runScoped = getSectionReviewList().filter((item) => item.pipelineRunId === runId);
    return applyOpsFilters(runScoped, {
      status: filters?.status,
      marketId: filters?.marketId,
      limit: filters?.limit,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  },

  async getSectionReviewTask(sectionReviewTaskId: string): Promise<SectionReviewDetail> {
    await delay();
    return (
      mockSectionReviewDetails[sectionReviewTaskId] ?? {
        id: sectionReviewTaskId,
        status: 'UNKNOWN',
        revisionRequests: [],
      }
    );
  },

  async getSectionReviewWorkspace(runId: string): Promise<SectionReviewWorkspaceDetail> {
    await delay();
    return getSectionWorkspace(runId);
  },

  async startSectionReview(runId: string): Promise<SectionReviewWorkspaceDetail> {
    await delay(220);
    mockStartedRuns.add(runId);
    Object.values(mockSectionReviewDetails).forEach((detail) => {
      if (detail.pipelineRunId === runId) {
        detail.status = 'IN_REVIEW';
        detail.updatedAt = nowIso();
      }
    });
    return getSectionWorkspace(runId);
  },

  async approveSectionReview(sectionReviewTaskId: string, payload: SectionReviewApprovePayload): Promise<SectionReviewDetail> {
    await delay(220);
    const detail = mockSectionReviewDetails[sectionReviewTaskId];
    if (detail) {
      detail.status = 'APPROVED';
      detail.updatedAt = nowIso();
      if (detail.approvalGate) {
        detail.approvalGate.approvedSectionCount = (detail.approvalGate.approvedSectionCount ?? 0) + 1;
        detail.approvalGate.outputAssemblyBlocked =
          (detail.approvalGate.approvedSectionCount ?? 0) < (detail.approvalGate.selectedSectionCount ?? 0);
      }
      if (payload.reviewerNotes) {
        detail.revisionRequests.push({
          id: `rr-note-${Date.now()}`,
          instruction: 'Approved',
          reviewerNotes: payload.reviewerNotes,
          status: 'COMMENT',
          createdAt: nowIso(),
          updatedAt: nowIso(),
        });
      }
      return detail;
    }

    return {
      id: sectionReviewTaskId,
      status: 'APPROVED',
      revisionRequests: [],
    };
  },

  async requestSectionRevision(sectionReviewTaskId: string, payload: SectionReviewRevisionPayload): Promise<SectionReviewDetail> {
    await delay(240);
    const detail = mockSectionReviewDetails[sectionReviewTaskId];
    if (detail) {
      detail.status = 'REVISION_REQUESTED';
      detail.revisionCount = (detail.revisionCount ?? 0) + 1;
      detail.latestRevisionSummary = payload.instruction;
      detail.updatedAt = nowIso();
      detail.revisionRequests.unshift({
        id: `rr-${Date.now()}`,
        instruction: payload.instruction,
        reviewerNotes: payload.reviewerNotes ?? null,
        fixtureKey: payload.fixtureKey ?? null,
        forceMode: payload.forceMode ?? null,
        status: 'REQUESTED',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      return detail;
    }

    return {
      id: sectionReviewTaskId,
      status: 'REVISION_REQUESTED',
      revisionRequests: [],
    };
  },

  async analyzeSectionRevisionImpact(
    sectionReviewTaskId: string,
    payload: SectionRevisionImpactAnalyzePayload,
  ): Promise<Record<string, unknown>> {
    await delay(220);
    return {
      analysisId: `impact-${sectionReviewTaskId}-${Date.now()}`,
      sectionReviewTaskId,
      instruction: payload.instruction,
      requestedByUserId: payload.requestedByUserId,
      impactedSectionReviewTaskIds: Object.values(mockSectionReviewDetails)
        .filter((item) => item.pipelineRunId === mockSectionReviewDetails[sectionReviewTaskId]?.pipelineRunId)
        .map((item) => item.id)
        .filter((id) => id !== sectionReviewTaskId),
      status: 'ANALYZED',
      createdAt: nowIso(),
    };
  },

  async confirmSectionRevisionImpact(
    analysisId: string,
    payload: SectionRevisionImpactConfirmPayload,
  ): Promise<Record<string, unknown>> {
    await delay(220);
    return {
      analysisId,
      decision: payload.decision,
      selectedSectionReviewTaskIds: payload.selectedSectionReviewTaskIds ?? [],
      status: payload.decision === 'confirm_apply' ? 'APPLIED' : 'CANCELLED',
      updatedAt: nowIso(),
    };
  },

  async triggerAdminCampaign(
    campaignId: string,
    trigger: AdminCampaignTriggerType,
    payload?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    await delay(220);
    return {
      campaignId,
      trigger,
      payload: payload ?? {},
      status: 'QUEUED',
      queuedAt: nowIso(),
    };
  },

  async downloadAdminCampaignOutput(
    campaignId: string,
    _payload?: Record<string, unknown>,
  ): Promise<AdminDownloadResponse> {
    await delay(220);
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 54 >>
stream
BT /F1 18 Tf 36 96 Td (Mock output for ${campaignId}) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
trailer
<< /Root 1 0 R >>
%%EOF`;

    return {
      blob: new Blob([pdfContent], {
        type: 'application/pdf',
      }),
      filename: `${campaignId}-output.pdf`,
      contentType: 'application/pdf',
    };
  },

  async recreateLatestCommittedRun(campaignId: string): Promise<Record<string, unknown>> {
    await delay(220);
    return {
      campaignId,
      status: 'QUEUED',
      action: 'recreate-latest-commit',
      queuedAt: nowIso(),
    };
  },

  async assembleAdminRunInternalOutput(runId: string): Promise<Record<string, unknown>> {
    await delay(220);
    return {
      runId,
      status: 'QUEUED',
      action: 'assemble-internal-output',
      queuedAt: nowIso(),
    };
  },

  async getCampaignHealth(params?: { limit?: number; onlyUnhealthy?: boolean }): Promise<CampaignHealthItem[]> {
    await delay();
    let items = mockCampaignHealth;
    if (params?.onlyUnhealthy) {
      items = items.filter((item) => item.hasError || (item.stuckState ?? '').toUpperCase() === 'YES');
    }
    if (params?.limit && params.limit > 0) {
      return items.slice(0, params.limit);
    }
    return items;
  },

  async getRunEvents(runId: string): Promise<RunTelemetryEvent[]> {
    await delay(120);
    return mockRunEvents[runId] ?? [];
  },

  async getRunPhaseRollups(runId: string): Promise<RunTelemetryPhaseRollup[]> {
    await delay(120);
    return mockRunRollups[runId] ?? [];
  },

  async getRunAggregate(runId: string): Promise<RunTelemetryAggregate> {
    await delay(120);
    return (
      mockRunAggregates[runId] ?? {
        runId,
        status: 'UNKNOWN',
      }
    );
  },

  async getReviewerOutcomes(): Promise<ReviewerOutcomesSummary> {
    await delay(120);
    return {
      approvedCount: 14,
      revisionRequestedCount: 5,
      pendingCount: 3,
      medianTurnaroundMinutes: 47,
    };
  },

  async getCostsSummary(): Promise<AdminCostsSummary> {
    await delay(120);
    return {
      totalCost: 129.42,
      totalTokens: 2483912,
      totalCalls: 421,
    };
  },
};
