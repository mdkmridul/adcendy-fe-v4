import { endOfDay, startOfDay, subDays } from 'date-fns';
import { http } from '../index';
import type { ApiResponse } from '../types';
import type {
  JobFailureSummaryItem,
  JobLogEntry,
  JobRun,
  JobRunDetail,
  JobStats,
  ListJobRunsParams,
} from '@/shared/types/jobs';

interface JobRunDto extends Omit<JobRun, 'maxAttempts' | 'lastErrorCode' | 'lastErrorMessage' | 'queueDurationMs' | 'runDurationMs'> {
  maxAttempts?: unknown;
  lastErrorCode?: unknown;
  lastErrorMessage?: unknown;
  queueDurationMs?: unknown;
  runDurationMs?: unknown;
}

interface JobRunListResponseDto {
  runs: JobRunDto[];
}

interface JobRunDetailResponseDto extends JobRunDto {
  logs: {
    items: Record<string, unknown>[];
    pagination: { limit: number; offset: number; total: number };
  };
}

interface JobFailureSummaryResponseDto {
  summary: JobFailureSummaryItem[];
}

interface JobStatsResponseDto {
  totals: Omit<JobStats, 'avgDurationMs'>;
  performance: Pick<JobStats, 'avgDurationMs'>;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function mapJobRun(dto: JobRunDto | JobRunDetailResponseDto): JobRun {
  return {
    id: dto.id,
    jobName: dto.jobName,
    queueName: dto.queueName,
    status: dto.status,
    attemptsMade: dto.attemptsMade,
    maxAttempts: toNullableNumber(dto.maxAttempts),
    lastErrorCode: toNullableString(dto.lastErrorCode),
    lastErrorMessage: toNullableString(dto.lastErrorMessage),
    queueDurationMs: toNullableNumber(dto.queueDurationMs),
    runDurationMs: toNullableNumber(dto.runDurationMs),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    logsCount: dto.logsCount,
  };
}

function normalizeLogEntry(entry: Record<string, unknown>): JobLogEntry {
  return {
    timestamp:
      toNullableString(entry.timestamp) ??
      toNullableString(entry.at) ??
      toNullableString(entry.createdAt),
    level:
      toNullableString(entry.level) ??
      toNullableString(entry.severity) ??
      toNullableString(entry.type),
    message:
      toNullableString(entry.message) ??
      toNullableString(entry.msg) ??
      toNullableString(entry.event),
    raw: entry,
  };
}

export const jobsRealAdapter = {
  async listJobRuns(params?: ListJobRunsParams): Promise<JobRun[]> {
    const now = new Date();
    const from = params?.from ?? startOfDay(subDays(now, 14)).toISOString();
    const to = params?.to ?? endOfDay(now).toISOString();

    const response = await http<ApiResponse<JobRunListResponseDto>>('/v1/admin/jobs/runs', {
      query: {
        jobName: params?.jobName ?? '',
        campaignId: params?.campaignId ?? '',
        from,
        to,
        limit: String(params?.limit ?? 25),
        page: String(params?.page ?? 1),
      },
    });

    return response.data.runs.map(mapJobRun);
  },

  async getJobRunDetail(jobRunId: string): Promise<JobRunDetail> {
    const response = await http<ApiResponse<JobRunDetailResponseDto>>(`/v1/admin/jobs/runs/${jobRunId}`, {
      query: {
        logLimit: '200',
        logOffset: '0',
      },
    });

    return {
      ...mapJobRun(response.data),
      logs: response.data.logs.items.map(normalizeLogEntry),
      logPagination: {
        limit: response.data.logs.pagination.limit,
        offset: response.data.logs.pagination.offset,
        total: response.data.logs.pagination.total,
      },
    };
  },

  async getJobFailureSummary(days = 14): Promise<JobFailureSummaryItem[]> {
    const response = await http<ApiResponse<JobFailureSummaryResponseDto>>('/v1/admin/jobs/failures/summary', {
      query: {
        days: String(days),
      },
    });

    return response.data.summary;
  },

  async getJobStats(days = 14): Promise<JobStats> {
    const response = await http<ApiResponse<JobStatsResponseDto>>('/v1/admin/jobs/stats', {
      query: {
        days: String(days),
      },
    });

    return {
      totalRuns: response.data.totals.totalRuns,
      completed: response.data.totals.completed,
      failed: response.data.totals.failed,
      active: response.data.totals.active,
      successRate: response.data.totals.successRate,
      avgDurationMs: response.data.performance.avgDurationMs,
    };
  },
};
