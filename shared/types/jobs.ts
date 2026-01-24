import type { ID, ISODateTime, RunStatus } from './common';

export type JobType =
  | 'INTELLIGENCE_REFRESH'
  | 'STRATEGY_GENERATION'
  | 'WEEKLY_PROCESSING'
  | 'TWEAK_GENERATION'
  | 'BENCHMARK_UPDATE'
  | 'EVALUATION_RUN';

export interface JobRun {
  id: ID;
  jobType: JobType;
  status: RunStatus;
  campaignId?: ID | null;
  weekStart?: string | null;
  startedAt: ISODateTime;
  finishedAt?: ISODateTime | null;
  attempts: number;
  errorMessage?: string | null;
  traceId?: string | null;
}

export interface JobLogEntry {
  at: ISODateTime;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  meta?: Record<string, any>;
}

export interface JobRunDetail {
  job: JobRun;
  logs: JobLogEntry[];
}

export interface ListJobRunsParams {
  status?: RunStatus;
  jobType?: JobType;
  campaignId?: ID;
  limit?: number;
}
