import type {
  JobFailureSummaryItem,
  JobLogEntry,
  JobRun,
  JobRunDetail,
  JobStats,
  ListJobRunsParams,
} from '@/shared/types/jobs';
import type { ID } from '@/shared/types/common';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const mockJobRuns: JobRun[] = [
  {
    id: 'job-001',
    jobName: 'strategy.review.regeneration',
    queueName: 'strategy-review',
    status: 'FAILED',
    attemptsMade: 3,
    maxAttempts: 3,
    lastErrorCode: 'LLM_TIMEOUT',
    lastErrorMessage: 'OpenAI call exceeded the timeout threshold',
    queueDurationMs: 700,
    runDurationMs: 61234,
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-16T08:01:01Z',
    logsCount: 6,
  },
  {
    id: 'job-002',
    jobName: 'campaign.intelligence.refresh',
    queueName: 'intelligence',
    status: 'COMPLETED',
    attemptsMade: 1,
    maxAttempts: 3,
    lastErrorCode: null,
    lastErrorMessage: null,
    queueDurationMs: 210,
    runDurationMs: 8940,
    createdAt: '2026-03-16T07:20:00Z',
    updatedAt: '2026-03-16T07:20:09Z',
    logsCount: 4,
  },
  {
    id: 'job-003',
    jobName: 'execution.kit.generate',
    queueName: 'strategy-review',
    status: 'ACTIVE',
    attemptsMade: 1,
    maxAttempts: 3,
    lastErrorCode: null,
    lastErrorMessage: null,
    queueDurationMs: 95,
    runDurationMs: null,
    createdAt: '2026-03-16T09:12:00Z',
    updatedAt: '2026-03-16T09:12:19Z',
    logsCount: 3,
  },
];

const mockJobLogs: Record<ID, JobLogEntry[]> = {
  'job-001': [
    {
      timestamp: '2026-03-16T08:00:00Z',
      level: 'INFO',
      message: 'Queued section regeneration',
      raw: { timestamp: '2026-03-16T08:00:00Z', level: 'INFO', message: 'Queued section regeneration' },
    },
    {
      timestamp: '2026-03-16T08:00:11Z',
      level: 'ERROR',
      message: 'OpenAI call exceeded the timeout threshold',
      raw: {
        timestamp: '2026-03-16T08:00:11Z',
        level: 'ERROR',
        message: 'OpenAI call exceeded the timeout threshold',
        attempt: 3,
      },
    },
  ],
  'job-002': [
    {
      timestamp: '2026-03-16T07:20:00Z',
      level: 'INFO',
      message: 'Campaign intelligence refresh started',
      raw: { timestamp: '2026-03-16T07:20:00Z', level: 'INFO', message: 'Campaign intelligence refresh started' },
    },
  ],
  'job-003': [
    {
      timestamp: '2026-03-16T09:12:15Z',
      level: 'INFO',
      message: 'Waiting on downstream execution-kit dependency',
      raw: {
        timestamp: '2026-03-16T09:12:15Z',
        level: 'INFO',
        message: 'Waiting on downstream execution-kit dependency',
      },
    },
  ],
};

const mockFailures: JobFailureSummaryItem[] = [
  {
    jobName: 'strategy.review.regeneration',
    errorCode: 'LLM_TIMEOUT',
    count: 4,
  },
  {
    jobName: 'execution.kit.generate',
    errorCode: 'VALIDATION_FAILED',
    count: 2,
  },
];

const mockStats: JobStats = {
  totalRuns: 38,
  completed: 29,
  failed: 6,
  active: 3,
  successRate: '76.32',
  avgDurationMs: 12450,
};

export const jobsMockAdapter = {
  async listJobRuns(params?: ListJobRunsParams): Promise<JobRun[]> {
    await delay(180);

    let filtered = [...mockJobRuns];

    if (params?.jobName) {
      const search = params.jobName.toLowerCase();
      filtered = filtered.filter((job) => job.jobName.toLowerCase().includes(search));
    }

    filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return filtered.slice(0, params?.limit ?? 25);
  },

  async getJobRunDetail(jobRunId: ID): Promise<JobRunDetail> {
    await delay(120);
    const job = mockJobRuns.find((entry) => entry.id === jobRunId);
    if (!job) {
      throw new Error(`Job run ${jobRunId} not found`);
    }

    return {
      ...job,
      logs: mockJobLogs[jobRunId] ?? [],
      logPagination: {
        limit: 200,
        offset: 0,
        total: (mockJobLogs[jobRunId] ?? []).length,
      },
    };
  },

  async getJobFailureSummary(_days?: number): Promise<JobFailureSummaryItem[]> {
    await delay(100);
    return mockFailures;
  },

  async getJobStats(_days?: number): Promise<JobStats> {
    await delay(100);
    return mockStats;
  },
};
