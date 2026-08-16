export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    me: () => [...queryKeys.profile.all, 'me'] as const,
  },
  billing: {
    all: ['billing'] as const,
    publicBundles: (countryCode: string) =>
      [...queryKeys.billing.all, 'public-bundles', countryCode] as const,
    bundles: (countryCode: string) => [...queryKeys.billing.all, 'bundles', countryCode] as const,
    order: (orderId: string) => [...queryKeys.billing.all, 'order', orderId] as const,
  },
  campaigns: {
    all: ['campaigns'] as const,
    list: () => [...queryKeys.campaigns.all, 'list'] as const,
    byId: (id: string) => [...queryKeys.campaigns.all, 'byId', id] as const,
    detail: (id: string) => [...queryKeys.campaigns.all, 'detail', id] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: (campaignId: string) => [...queryKeys.documents.all, 'list', campaignId] as const,
    download: (campaignId: string, documentId: string) =>
      [...queryKeys.documents.all, 'download', campaignId, documentId] as const,
  },
  strategy: {
    all: ['strategy'] as const,
    run: (id: string) => [...queryKeys.strategy.all, 'run', id] as const,
    versions: (campaignId: string) => [...queryKeys.strategy.all, 'versions', campaignId] as const,
    version: (versionId: string) => [...queryKeys.strategy.all, 'version', versionId] as const,
    latest: (campaignId: string) => [...queryKeys.strategy.all, 'latest', campaignId] as const,
  },
  runsV2: {
    all: ['runsV2'] as const,
    status: (runId: string) => [...queryKeys.runsV2.all, 'status', runId] as const,
    recovery: (campaignId: string, mode: 'active' | 'latest') =>
      [...queryKeys.runsV2.all, 'recovery', campaignId, mode] as const,
  },
  weekly: {
    all: ['weekly'] as const,
    submissions: (campaignId: string) =>
      [...queryKeys.weekly.all, 'submissions', campaignId] as const,
    byWeek: (campaignId: string, weekStart: string) =>
      [...queryKeys.weekly.all, 'byWeek', campaignId, weekStart] as const,
    derived: (campaignId: string, weekStart: string) =>
      [...queryKeys.weekly.all, 'derived', campaignId, weekStart] as const,
    processing: (processingRunId: string) =>
      [...queryKeys.weekly.all, 'processing', processingRunId] as const,
    anomalies: (campaignId: string, weekStart?: string) =>
      weekStart
        ? ([...queryKeys.weekly.all, 'anomalies', campaignId, weekStart] as const)
        : ([...queryKeys.weekly.all, 'anomalies', campaignId] as const),
    tweakRun: (tweakRunId: string) => [...queryKeys.weekly.all, 'tweakRun', tweakRunId] as const,
    tweakRunByWeek: (campaignId: string, weekStart: string) =>
      [...queryKeys.weekly.all, 'tweakRunByWeek', campaignId, weekStart] as const,
    tweaks: (tweakRunId: string, visibility?: string) =>
      visibility
        ? ([...queryKeys.weekly.all, 'tweaks', tweakRunId, visibility] as const)
        : ([...queryKeys.weekly.all, 'tweaks', tweakRunId] as const),
  },
  intelligence: {
    all: ['intelligence'] as const,
    latest: (campaignId: string) => [...queryKeys.intelligence.all, 'latest', campaignId] as const,
    list: (campaignId: string) => [...queryKeys.intelligence.all, 'list', campaignId] as const,
    byId: (snapshotId: string) => [...queryKeys.intelligence.all, 'byId', snapshotId] as const,
    snapshot: (campaignId: string) =>
      [...queryKeys.intelligence.all, 'snapshot', campaignId] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    list: (filters?: Record<string, any>) =>
      filters
        ? ([...queryKeys.jobs.all, 'list', filters] as const)
        : ([...queryKeys.jobs.all, 'list'] as const),
    detail: (jobRunId: string) => [...queryKeys.jobs.all, 'detail', jobRunId] as const,
    failures: (days: number) => [...queryKeys.jobs.all, 'failures', days] as const,
    stats: (days: number) => [...queryKeys.jobs.all, 'stats', days] as const,
  },
  aiUsage: {
    all: ['aiUsage'] as const,
    summary: (days?: number, userId?: string) =>
      days || userId
        ? ([...queryKeys.aiUsage.all, 'summary', days ?? null, userId ?? null] as const)
        : ([...queryKeys.aiUsage.all, 'summary'] as const),
    daily: (days?: number, limit?: number, userId?: string) =>
      days || limit || userId
        ? ([
            ...queryKeys.aiUsage.all,
            'daily',
            days ?? null,
            limit ?? null,
            userId ?? null,
          ] as const)
        : ([...queryKeys.aiUsage.all, 'daily'] as const),
  },
  strategyReviews: {
    all: ['strategyReviews'] as const,
    inbox: () => [...queryKeys.strategyReviews.all, 'inbox'] as const,
    detail: (campaignId: string) =>
      [...queryKeys.strategyReviews.all, 'detail', campaignId] as const,
  },
  adminReview: {
    all: ['adminReview'] as const,
    reviewers: (search?: string) =>
      search
        ? ([...queryKeys.adminReview.all, 'reviewers', search] as const)
        : ([...queryKeys.adminReview.all, 'reviewers'] as const),
    campaignList: (filters?: Record<string, any>) =>
      filters
        ? ([...queryKeys.adminReview.all, 'campaignList', filters] as const)
        : ([...queryKeys.adminReview.all, 'campaignList'] as const),
    campaignDetail: (campaignId: string) =>
      [...queryKeys.adminReview.all, 'campaignDetail', campaignId] as const,
    jobsByEntity: (entityType: string, entityId: string, limit?: number) =>
      limit
        ? ([...queryKeys.adminReview.all, 'jobsByEntity', entityType, entityId, limit] as const)
        : ([...queryKeys.adminReview.all, 'jobsByEntity', entityType, entityId] as const),
    aiCalls: (campaignId: string, limit?: number) =>
      limit
        ? ([...queryKeys.adminReview.all, 'aiCalls', campaignId, limit] as const)
        : ([...queryKeys.adminReview.all, 'aiCalls', campaignId] as const),
    aiCallsList: (filters?: Record<string, any>) =>
      filters
        ? ([...queryKeys.adminReview.all, 'aiCallsList', filters] as const)
        : ([...queryKeys.adminReview.all, 'aiCallsList'] as const),
    aiCall: (callId: string) => [...queryKeys.adminReview.all, 'aiCall', callId] as const,
  },
  opsV2: {
    all: ['opsV2'] as const,
    campaigns: () => [...queryKeys.opsV2.all, 'campaigns'] as const,
    campaignCosts: () => [...queryKeys.opsV2.all, 'campaignCosts'] as const,
    campaignCost: (campaignId: string) =>
      [...queryKeys.opsV2.all, 'campaignCost', campaignId] as const,
    reviewerTasks: (filters?: Record<string, any>) =>
      filters
        ? ([...queryKeys.opsV2.all, 'reviewerTasks', filters] as const)
        : ([...queryKeys.opsV2.all, 'reviewerTasks'] as const),
    reviewerTask: (taskId: string) => [...queryKeys.opsV2.all, 'reviewerTask', taskId] as const,
    sectionReviews: (filters?: Record<string, any>) =>
      filters
        ? ([...queryKeys.opsV2.all, 'sectionReviews', filters] as const)
        : ([...queryKeys.opsV2.all, 'sectionReviews'] as const),
    sectionReviewsByRun: (runId: string, filters?: Record<string, any>) =>
      filters
        ? ([...queryKeys.opsV2.all, 'sectionReviewsByRun', runId, filters] as const)
        : ([...queryKeys.opsV2.all, 'sectionReviewsByRun', runId] as const),
    sectionReviewTask: (sectionReviewTaskId: string) =>
      [...queryKeys.opsV2.all, 'sectionReviewTask', sectionReviewTaskId] as const,
    sectionReviewWorkspace: (runId: string) =>
      [...queryKeys.opsV2.all, 'sectionReviewWorkspace', runId] as const,
    campaignHealth: (params?: { limit?: number; onlyUnhealthy?: boolean }) =>
      params
        ? ([...queryKeys.opsV2.all, 'campaignHealth', params] as const)
        : ([...queryKeys.opsV2.all, 'campaignHealth'] as const),
    runEvents: (runId: string) => [...queryKeys.opsV2.all, 'runEvents', runId] as const,
    runPhaseRollups: (runId: string) => [...queryKeys.opsV2.all, 'runPhaseRollups', runId] as const,
    runAggregate: (runId: string) => [...queryKeys.opsV2.all, 'runAggregate', runId] as const,
    reviewerOutcomes: () => [...queryKeys.opsV2.all, 'reviewerOutcomes'] as const,
    costsSummary: () => [...queryKeys.opsV2.all, 'costsSummary'] as const,
  },
  legal: {
    all: ['legal'] as const,
    activeDocuments: () => [...queryKeys.legal.all, 'activeDocuments'] as const,
    consentsMe: () => [...queryKeys.legal.all, 'consentsMe'] as const,
  },
  wizard: {
    all: ['wizard'] as const,
    options: (campaignId?: string) =>
      campaignId
        ? ([...queryKeys.wizard.all, 'options', campaignId] as const)
        : ([...queryKeys.wizard.all, 'options'] as const),
    state: (campaignId: string) => [...queryKeys.wizard.all, 'state', campaignId] as const,
    steps: (campaignId: string) => [...queryKeys.wizard.all, 'steps', campaignId] as const,
    step: (campaignId: string, stepKey: string) =>
      [...queryKeys.wizard.all, 'step', campaignId, stepKey] as const,
    preview: (campaignId: string) => [...queryKeys.wizard.all, 'preview', campaignId] as const,
  },
};
