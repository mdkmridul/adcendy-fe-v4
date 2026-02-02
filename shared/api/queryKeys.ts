export const queryKeys = {
  campaigns: {
    all: ['campaigns'] as const,
    list: () => [...queryKeys.campaigns.all, 'list'] as const,
    byId: (id: string) => [...queryKeys.campaigns.all, 'byId', id] as const,
    detail: (id: string) => [...queryKeys.campaigns.all, 'detail', id] as const,
  },
  strategy: {
    all: ['strategy'] as const,
    run: (id: string) => [...queryKeys.strategy.all, 'run', id] as const,
    versions: (campaignId: string) => [...queryKeys.strategy.all, 'versions', campaignId] as const,
    version: (versionId: string) => [...queryKeys.strategy.all, 'version', versionId] as const,
    latest: (campaignId: string) => [...queryKeys.strategy.all, 'latest', campaignId] as const,
  },
  weekly: {
    all: ['weekly'] as const,
    submissions: (campaignId: string) => [...queryKeys.weekly.all, 'submissions', campaignId] as const,
    byWeek: (campaignId: string, weekStart: string) => [...queryKeys.weekly.all, 'byWeek', campaignId, weekStart] as const,
    derived: (campaignId: string, weekStart: string) => [...queryKeys.weekly.all, 'derived', campaignId, weekStart] as const,
    processing: (processingRunId: string) => [...queryKeys.weekly.all, 'processing', processingRunId] as const,
    anomalies: (campaignId: string, weekStart?: string) =>
      weekStart
        ? [...queryKeys.weekly.all, 'anomalies', campaignId, weekStart] as const
        : [...queryKeys.weekly.all, 'anomalies', campaignId] as const,
    tweakRun: (tweakRunId: string) => [...queryKeys.weekly.all, 'tweakRun', tweakRunId] as const,
    tweakRunByWeek: (campaignId: string, weekStart: string) => [...queryKeys.weekly.all, 'tweakRunByWeek', campaignId, weekStart] as const,
    tweaks: (tweakRunId: string, visibility?: string) =>
      visibility
        ? [...queryKeys.weekly.all, 'tweaks', tweakRunId, visibility] as const
        : [...queryKeys.weekly.all, 'tweaks', tweakRunId] as const,
  },
  intelligence: {
    all: ['intelligence'] as const,
    latest: (campaignId: string) => [...queryKeys.intelligence.all, 'latest', campaignId] as const,
    list: (campaignId: string) => [...queryKeys.intelligence.all, 'list', campaignId] as const,
    byId: (snapshotId: string) => [...queryKeys.intelligence.all, 'byId', snapshotId] as const,
    snapshot: (campaignId: string) => [...queryKeys.intelligence.all, 'snapshot', campaignId] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    list: (filters?: Record<string, any>) =>
      filters
        ? [...queryKeys.jobs.all, 'list', filters] as const
        : [...queryKeys.jobs.all, 'list'] as const,
    detail: (jobRunId: string) => [...queryKeys.jobs.all, 'detail', jobRunId] as const,
  },
  aiUsage: {
    all: ['aiUsage'] as const,
    summary: (windowDays?: number) =>
      windowDays
        ? [...queryKeys.aiUsage.all, 'summary', windowDays] as const
        : [...queryKeys.aiUsage.all, 'summary'] as const,
  },
  wizard: {
    all: ['wizard'] as const,
    state: (campaignId: string) => [...queryKeys.wizard.all, 'state', campaignId] as const,
    steps: (campaignId: string) => [...queryKeys.wizard.all, 'steps', campaignId] as const,
    step: (campaignId: string, stepKey: string) => [...queryKeys.wizard.all, 'step', campaignId, stepKey] as const,
    preview: (campaignId: string) => [...queryKeys.wizard.all, 'preview', campaignId] as const,
  },
};
