import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';

type JobRunDto = components['schemas']['JobRunDto'];
type JobRunListResponseDto = components['schemas']['JobRunListResponseDto'];
type JobRunDetailDto = components['schemas']['JobRunDetailDto'];

export const jobsRealAdapter = {
  async listJobRuns(params?: { entityType?: string; entityId?: string; status?: string }): Promise<JobRunDto[]> {
    const response = await http<ApiResponse<JobRunListResponseDto>>('/v1/v1/admin/jobs/runs', { query: params });
    return response.data.runs;
  },

  async getJobRunDetail(jobRunId: string): Promise<JobRunDetailDto> {
    const response = await http<ApiResponse<JobRunDetailDto>>(`/v1/v1/admin/jobs/runs/${jobRunId}`);
    return response.data;
  },
};
