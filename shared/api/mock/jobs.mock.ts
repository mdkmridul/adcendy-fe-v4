import type { JobRun, JobRunDetail, ListJobRunsParams, JobLogEntry } from '@/shared/types/jobs';
import type { ID } from '@/shared/types/common';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const mockJobRuns: JobRun[] = [
  {
    id: 'job-001',
    jobType: 'STRATEGY_GENERATION',
    status: 'FAILED',
    campaignId: 'campaign-001',
    weekStart: null,
    startedAt: '2024-02-20T14:30:00Z',
    finishedAt: '2024-02-20T14:35:12Z',
    attempts: 3,
    errorMessage: 'API timeout: Claude API request exceeded 60s timeout threshold',
    traceId: 'trace-abc123',
  },
  {
    id: 'job-002',
    jobType: 'WEEKLY_PROCESSING',
    status: 'FAILED',
    campaignId: 'campaign-002',
    weekStart: '2024-02-12',
    startedAt: '2024-02-19T10:15:00Z',
    finishedAt: '2024-02-19T10:16:45Z',
    attempts: 2,
    errorMessage: 'Invalid metrics: leads cannot exceed clicks',
    traceId: 'trace-def456',
  },
  {
    id: 'job-003',
    jobType: 'INTELLIGENCE_REFRESH',
    status: 'SUCCEEDED',
    campaignId: 'campaign-001',
    weekStart: null,
    startedAt: '2024-02-21T09:00:00Z',
    finishedAt: '2024-02-21T09:03:22Z',
    attempts: 1,
    errorMessage: null,
    traceId: 'trace-ghi789',
  },
  {
    id: 'job-004',
    jobType: 'TWEAK_GENERATION',
    status: 'SUCCEEDED',
    campaignId: 'campaign-001',
    weekStart: '2024-02-12',
    startedAt: '2024-02-20T16:45:00Z',
    finishedAt: '2024-02-20T16:48:15Z',
    attempts: 1,
    errorMessage: null,
    traceId: 'trace-jkl012',
  },
  {
    id: 'job-005',
    jobType: 'BENCHMARK_UPDATE',
    status: 'RUNNING',
    campaignId: null,
    weekStart: null,
    startedAt: '2024-02-21T11:00:00Z',
    finishedAt: null,
    attempts: 1,
    errorMessage: null,
    traceId: 'trace-mno345',
  },
  {
    id: 'job-006',
    jobType: 'EVALUATION_RUN',
    status: 'SUCCEEDED',
    campaignId: 'campaign-003',
    weekStart: null,
    startedAt: '2024-02-20T08:20:00Z',
    finishedAt: '2024-02-20T08:25:10Z',
    attempts: 1,
    errorMessage: null,
    traceId: 'trace-pqr678',
  },
  {
    id: 'job-007',
    jobType: 'TWEAK_GENERATION',
    status: 'FAILED',
    campaignId: 'campaign-004',
    weekStart: '2024-02-19',
    startedAt: '2024-02-21T07:30:00Z',
    finishedAt: '2024-02-21T07:32:50Z',
    attempts: 2,
    errorMessage: 'Insufficient data: No weekly submission found for week 2024-02-19',
    traceId: 'trace-stu901',
  },
  {
    id: 'job-008',
    jobType: 'WEEKLY_PROCESSING',
    status: 'SUCCEEDED',
    campaignId: 'campaign-001',
    weekStart: '2024-02-19',
    startedAt: '2024-02-20T10:00:00Z',
    finishedAt: '2024-02-20T10:02:35Z',
    attempts: 1,
    errorMessage: null,
    traceId: 'trace-vwx234',
  },
];

const mockJobLogs: Record<ID, JobLogEntry[]> = {
  'job-001': [
    { at: '2024-02-20T14:30:05Z', level: 'INFO', message: 'Starting strategy generation for campaign campaign-001' },
    { at: '2024-02-20T14:30:10Z', level: 'INFO', message: 'Fetching campaign data and historical performance' },
    { at: '2024-02-20T14:30:45Z', level: 'INFO', message: 'Preparing Claude API request with context' },
    { at: '2024-02-20T14:31:00Z', level: 'INFO', message: 'Calling Claude API (attempt 1/3)' },
    { at: '2024-02-20T14:32:05Z', level: 'WARN', message: 'Claude API request slow, continuing to wait...' },
    { at: '2024-02-20T14:33:00Z', level: 'ERROR', message: 'API timeout: Claude API request exceeded 60s timeout threshold', meta: { attempt: 1, timeoutMs: 60000 } },
    { at: '2024-02-20T14:33:05Z', level: 'INFO', message: 'Retrying with exponential backoff (attempt 2/3)' },
    { at: '2024-02-20T14:33:30Z', level: 'INFO', message: 'Calling Claude API (attempt 2/3)' },
    { at: '2024-02-20T14:34:35Z', level: 'ERROR', message: 'API timeout: Claude API request exceeded 60s timeout threshold', meta: { attempt: 2, timeoutMs: 60000 } },
    { at: '2024-02-20T14:34:40Z', level: 'INFO', message: 'Retrying with exponential backoff (attempt 3/3)' },
    { at: '2024-02-20T14:35:00Z', level: 'INFO', message: 'Calling Claude API (attempt 3/3)' },
    { at: '2024-02-20T14:35:12Z', level: 'ERROR', message: 'Failed after 3 attempts. Marking job as FAILED' },
  ],
  'job-002': [
    { at: '2024-02-19T10:15:05Z', level: 'INFO', message: 'Starting weekly processing for campaign-002, week 2024-02-12' },
    { at: '2024-02-19T10:15:10Z', level: 'INFO', message: 'Validating submitted metrics' },
    { at: '2024-02-19T10:15:15Z', level: 'ERROR', message: 'Validation failed: leads (150) cannot exceed clicks (120)', meta: { leads: 150, clicks: 120 } },
    { at: '2024-02-19T10:15:20Z', level: 'INFO', message: 'Retrying with re-validation (attempt 2/3)' },
    { at: '2024-02-19T10:16:40Z', level: 'ERROR', message: 'Invalid metrics: leads cannot exceed clicks' },
    { at: '2024-02-19T10:16:45Z', level: 'ERROR', message: 'Processing failed after validation errors' },
  ],
  'job-003': [
    { at: '2024-02-21T09:00:05Z', level: 'INFO', message: 'Starting intelligence refresh for campaign-001' },
    { at: '2024-02-21T09:00:10Z', level: 'INFO', message: 'Fetching SERP data for market signals' },
    { at: '2024-02-21T09:01:20Z', level: 'INFO', message: 'SERP data retrieved successfully' },
    { at: '2024-02-21T09:01:25Z', level: 'INFO', message: 'Fetching Meta Ads Library data' },
    { at: '2024-02-21T09:02:15Z', level: 'INFO', message: 'Meta Ads data retrieved successfully' },
    { at: '2024-02-21T09:02:20Z', level: 'INFO', message: 'Analyzing market trends with Claude API' },
    { at: '2024-02-21T09:03:15Z', level: 'INFO', message: 'Intelligence snapshot generated successfully' },
    { at: '2024-02-21T09:03:22Z', level: 'INFO', message: 'Refresh completed' },
  ],
  'job-007': [
    { at: '2024-02-21T07:30:05Z', level: 'INFO', message: 'Starting tweak generation for campaign-004, week 2024-02-19' },
    { at: '2024-02-21T07:30:10Z', level: 'INFO', message: 'Fetching weekly submission data' },
    { at: '2024-02-21T07:30:25Z', level: 'ERROR', message: 'Weekly submission not found', meta: { campaignId: 'campaign-004', weekStart: '2024-02-19' } },
    { at: '2024-02-21T07:30:30Z', level: 'WARN', message: 'Retrying data fetch (attempt 2/3)' },
    { at: '2024-02-21T07:32:45Z', level: 'ERROR', message: 'Insufficient data: No weekly submission found for week 2024-02-19' },
    { at: '2024-02-21T07:32:50Z', level: 'ERROR', message: 'Tweak generation failed' },
  ],
};

export const jobsMockAdapter = {
  async listJobRuns(params?: ListJobRunsParams): Promise<JobRun[]> {
    await delay(200);

    let filtered = [...mockJobRuns];

    if (params?.status) {
      filtered = filtered.filter(job => job.status === params.status);
    }

    if (params?.jobType) {
      filtered = filtered.filter(job => job.jobType === params.jobType);
    }

    if (params?.campaignId) {
      filtered = filtered.filter(job => job.campaignId === params.campaignId);
    }

    // Sort by startedAt desc (most recent first)
    filtered.sort((a, b) => b.startedAt.localeCompare(a.startedAt));

    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  },

  async getJobRunDetail(jobRunId: ID): Promise<JobRunDetail> {
    await delay(150);

    const job = mockJobRuns.find(j => j.id === jobRunId);
    if (!job) {
      throw new Error(`Job run ${jobRunId} not found`);
    }

    const logs = mockJobLogs[jobRunId] || [];

    return {
      job,
      logs,
    };
  },
};
