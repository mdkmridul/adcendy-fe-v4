import type { ID, ISODateTime } from './common';

export type AdminJobStatus = 'QUEUED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface JobRun {
  id: ID;
  jobName: string;
  queueName: string;
  status: AdminJobStatus;
  attemptsMade: number;
  maxAttempts?: number | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  queueDurationMs?: number | null;
  runDurationMs?: number | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  logsCount: number;
}

export interface JobLogEntry {
  timestamp?: ISODateTime | null;
  level?: string | null;
  message?: string | null;
  raw: Record<string, unknown>;
}

export interface JobRunDetail extends JobRun {
  logs: JobLogEntry[];
  logPagination: {
    limit: number;
    offset: number;
    total: number;
  } | null;
}

export interface JobFailureSummaryItem {
  jobName: string;
  errorCode: string;
  count: number;
}

export interface JobStats {
  totalRuns: number;
  completed: number;
  failed: number;
  active: number;
  successRate: string;
  avgDurationMs: number;
}

export interface ListJobRunsParams {
  jobName?: string;
  campaignId?: ID;
  from?: ISODateTime;
  to?: ISODateTime;
  limit?: number;
  page?: number;
}
