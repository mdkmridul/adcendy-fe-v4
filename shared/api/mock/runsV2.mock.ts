import type {
  CampaignRunRecoveryMode,
  CampaignRunRecoveryV2,
  PipelineRunRetryV2,
  PipelineRunStartV2,
  PipelineRunStatusResponseV2,
} from '@/shared/types/runsV2';

const runs = new Map<string, PipelineRunStatusResponseV2>();
const campaignRuns = new Map<string, string>();

function now(): string {
  return new Date().toISOString();
}

function createRun(campaignId: string): PipelineRunStatusResponseV2 {
  const createdAt = now();
  const runId = `mock-run-${Date.now()}`;
  const run: PipelineRunStatusResponseV2 = {
    runId,
    campaignId,
    status: 'RUNNING',
    referenceStatus: 'ACTIVE',
    currentPhase: 'strategy_generation',
    attemptNumber: 1,
    createdAt,
    queuedAt: createdAt,
    startedAt: createdAt,
    updatedAt: createdAt,
    blockedAt: null,
    completedAt: null,
    failedAt: null,
    error: null,
    retryable: false,
    requiredAction: 'WAIT',
    capabilities: {
      canRetry: false,
      canResume: false,
      canCancel: false,
    },
    progress: {
      completedUnits: 1,
      totalUnits: 4,
      percent: 25,
    },
    shouldPoll: true,
    pollAfterMs: 2_000,
  };
  runs.set(runId, run);
  campaignRuns.set(campaignId, runId);
  return run;
}

function toStart(run: PipelineRunStatusResponseV2): PipelineRunStartV2 {
  return {
    runId: run.runId,
    campaignId: run.campaignId,
    status: run.status,
    attemptNumber: run.attemptNumber,
    createdAt: run.createdAt,
    queuedAt: run.queuedAt,
    statusUrl: `/api/v2/pipeline/runs/${run.runId}`,
  };
}

export const runsV2MockAdapter = {
  async start(
    campaignId: string,
    _idempotencyKey: string,
    _signal?: AbortSignal,
  ): Promise<PipelineRunStartV2> {
    return toStart(createRun(campaignId));
  },

  async getStatus(
    runId: string,
    _signal?: AbortSignal,
  ): Promise<PipelineRunStatusResponseV2> {
    const existing = runs.get(runId);
    if (existing) return existing;
    const generated = createRun('mock-campaign');
    runs.delete(generated.runId);
    const requestedRun = { ...generated, runId };
    runs.set(runId, requestedRun);
    return requestedRun;
  },

  async retry(
    runId: string,
    _idempotencyKey: string,
    _signal?: AbortSignal,
  ): Promise<PipelineRunRetryV2> {
    const previous = runs.get(runId) ?? createRun('mock-campaign');
    const updated: PipelineRunStatusResponseV2 = {
      ...previous,
      runId,
      status: 'QUEUED',
      attemptNumber: previous.attemptNumber + 1,
      currentPhase: previous.error?.failedPhase ?? previous.currentPhase,
      error: null,
      retryable: false,
      requiredAction: 'WAIT',
      capabilities: {
        canRetry: false,
        canResume: false,
        canCancel: false,
      },
      shouldPoll: true,
      updatedAt: now(),
    };
    runs.set(runId, updated);
    return {
      ...toStart(updated),
      resumedFromPhase: previous.error?.failedPhase ?? previous.currentPhase,
    };
  },

  async recover(
    campaignId: string,
    _mode: CampaignRunRecoveryMode,
    _signal?: AbortSignal,
  ): Promise<CampaignRunRecoveryV2> {
    const runId = campaignRuns.get(campaignId);
    return { run: runId ? runs.get(runId) ?? null : null };
  },
};
