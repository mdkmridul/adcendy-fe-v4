import { http } from '../index';
import type { JobRun, JobRunDetail, ListJobRunsParams } from '@/shared/types/jobs';
import type { ID } from '@/shared/types/common';

export const jobsRealAdapter = {
  async listJobRuns(params?: ListJobRunsParams): Promise<JobRun[]> {
    return http<JobRun[]>('/admin/jobs', { query: params as Record<string, any> });
  },

  async getJobRunDetail(jobRunId: ID): Promise<JobRunDetail> {
    return http<JobRunDetail>(`/admin/jobs/${jobRunId}`);
  },
};
